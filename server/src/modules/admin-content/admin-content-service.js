import { z } from "zod";

import { GalleryItem } from "../../models/gallery-item.js";
import { Member } from "../../models/member.js";
import { NewsItem } from "../../models/news-item.js";
import { PhDProgress } from "../../models/phd-progress.js";
import { Project } from "../../models/project.js";
import { Publication } from "../../models/publication.js";
import { SiteConfig } from "../../models/site-config.js";
import { Team } from "../../models/team.js";
import { User } from "../../models/user.js";
import { AppError } from "../../utils/app-error.js";
import { logActivity } from "../../utils/activity-logger.js";
import { hashPassword } from "../../utils/password.js";
import { hasPermission, RBAC_PERMISSIONS } from "../../utils/rbac.js";
import { adminContentSchemas } from "../../validators/admin-content-schemas.js";

const ENTITY_MODELS = {
  gallery: GalleryItem,
  member: Member,
  news: NewsItem,
  phd_progress: PhDProgress,
  project: Project,
  publication: Publication,
  team: Team,
};

const entityLabels = {
  gallery: "Gallery item",
  member: "Member",
  news: "News item",
  phd_progress: "PhD progress record",
  project: "Project",
  publication: "Publication",
  team: "Team",
};

function getEntityModel(entityType) {
  const model = ENTITY_MODELS[entityType];

  if (!model) {
    throw new AppError("Unsupported content entity.", {
      code: "INVALID_ENTITY",
      statusCode: 400,
    });
  }

  return model;
}

function createValidationError(details) {
  return new AppError("Request validation failed.", {
    code: "VALIDATION_ERROR",
    details,
    statusCode: 400,
  });
}

function formatSchemaIssues(issues) {
  return issues.map((issue) => ({
    message: issue.message,
    path: issue.path.join("."),
    source: "body",
  }));
}

function buildDuplicateFieldError(field, message) {
  return createValidationError([
    {
      message,
      path: field,
      source: "body",
    },
  ]);
}

async function ensureAxisExists(axisId) {
  const siteConfig = await SiteConfig.findById("default").lean();
  const axisExists = (siteConfig?.researchAxes ?? []).some((axis) => axis.id === axisId);

  if (!axisExists) {
    throw createValidationError([
      {
        message: "Choose a valid research axis.",
        path: "axisId",
        source: "body",
      },
    ]);
  }
}

async function ensureTeamSlugsExist(teamSlugs, field = "teamSlug") {
  if (!teamSlugs.length) {
    return;
  }

  const existingTeams = await Team.find({ slug: { $in: teamSlugs } })
    .select({ slug: 1 })
    .lean();
  const existingSlugs = new Set(existingTeams.map((team) => team.slug));
  const missingTeam = teamSlugs.find((teamSlug) => !existingSlugs.has(teamSlug));

  if (missingTeam) {
    throw createValidationError([
      {
        message: "Choose an existing team before saving this record.",
        path: field,
        source: "body",
      },
    ]);
  }
}

async function ensureLeadMemberExists(leadMemberSlug) {
  if (!leadMemberSlug) {
    return;
  }

  const member = await Member.findOne({ slug: leadMemberSlug }).select({ _id: 1 }).lean();

  if (!member) {
    throw createValidationError([
      {
        message: "Choose an existing member for the project lead.",
        path: "leadMemberSlug",
        source: "body",
      },
    ]);
  }
}

async function ensureUniqueField(model, field, value, currentId, message) {
  if (!value) {
    return;
  }

  const existingRecord = await model
    .findOne({ [field]: value })
    .select({ _id: 1 })
    .lean();

  if (existingRecord && existingRecord._id.toString() !== currentId) {
    throw buildDuplicateFieldError(field, message);
  }
}

async function validateEntityInput(entityType, values, currentId = "") {
  const schema = adminContentSchemas[entityType];
  const result = schema.safeParse(values);

  if (!result.success) {
    throw createValidationError(formatSchemaIssues(result.error.issues));
  }

  const parsedValues = result.data;
  const model = getEntityModel(entityType);
  await ensureUniqueField(
    model,
    "slug",
    parsedValues.slug,
    currentId,
    `Another ${entityLabels[entityType].toLowerCase()} already uses this slug.`,
  );

  if (entityType === "team") {
    await ensureUniqueField(model, "acronym", parsedValues.acronym, currentId, "Another team already uses this acronym.");
    await ensureAxisExists(parsedValues.axisId);
  }

  if (entityType === "member") {
    await ensureTeamSlugsExist(parsedValues.teamSlugs, "teamSlugs");
  }

  if (entityType === "project") {
    await ensureTeamSlugsExist([parsedValues.teamSlug]);
    await ensureLeadMemberExists(parsedValues.leadMemberSlug);
    const team = await Team.findOne({ slug: parsedValues.teamSlug }).select({ axisId: 1 }).lean();
    parsedValues.axisId = team?.axisId ?? parsedValues.axisId ?? "";
  }

  if (entityType === "publication") {
    await ensureTeamSlugsExist([parsedValues.teamSlug]);
  }

  if (entityType === "news") {
    await ensureTeamSlugsExist(parsedValues.teamSlugs, "teamSlugs");
  }

  if (entityType === "gallery" && parsedValues.teamSlug) {
    await ensureTeamSlugsExist([parsedValues.teamSlug]);
  }

  return parsedValues;
}

const PUBLISH_PERMISSION_BY_ENTITY = {
  gallery: RBAC_PERMISSIONS.GALLERY_PUBLISH,
  news: RBAC_PERMISSIONS.NEWS_PUBLISH,
  publication: RBAC_PERMISSIONS.PUBLICATIONS_PUBLISH,
};

function assertPublishedStatusAllowed(user, entityType, validatedValues, previousStatus) {
  const publishKey = PUBLISH_PERMISSION_BY_ENTITY[entityType];
  if (!publishKey || !user?.role) {
    return;
  }

  if (validatedValues.status !== "Published") {
    return;
  }

  const wasPublished = previousStatus === "Published";
  if (wasPublished) {
    return;
  }

  if (!hasPermission(user.role, publishKey)) {
    throw new AppError("You do not have permission to publish this record.", {
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }
}

function serializeAdminRecord(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    id: record._id.toString(),
  };
}

function sortAdminRecords(entityType, records) {
  if (entityType === "news" || entityType === "gallery") {
    return [...records].sort((left, right) => right.dateIso.localeCompare(left.dateIso));
  }

  if (entityType === "project" || entityType === "publication") {
    return [...records].sort(
      (left, right) => right.year - left.year || left.title.localeCompare(right.title),
    );
  }

  return [...records].sort((left, right) =>
    (left.name ?? left.title ?? left.headline ?? "").localeCompare(
      right.name ?? right.title ?? right.headline ?? "",
    ),
  );
}

export async function listAdminContent(entityType) {
  const model = getEntityModel(entityType);
  const records = await model.find().lean();

  return {
    data: sortAdminRecords(entityType, records).map(serializeAdminRecord),
  };
}

export async function createAdminContent(entityType, values, user, request) {
  const model = getEntityModel(entityType);
  const validatedValues = await validateEntityInput(entityType, values);
  assertPublishedStatusAllowed(user, entityType, validatedValues, null);

  try {
    const createdRecord = await model.create(validatedValues);

    await logActivity({
      action: `${entityType}.create`,
      entityType,
      entityId: createdRecord._id,
      userId: user._id,
      request,
    });

    return {
      data: serializeAdminRecord(createdRecord.toObject()),
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw buildDuplicateFieldError("slug", "Another record already uses one of these unique values.");
    }

    throw error;
  }
}

export async function updateAdminContent(entityType, id, values, user, request) {
  const model = getEntityModel(entityType);
  const existingRecord = await model.findById(id).lean();

  if (!existingRecord) {
    throw new AppError(`${entityLabels[entityType]} was not found.`, {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  const validatedValues = await validateEntityInput(entityType, values, id);
  assertPublishedStatusAllowed(user, entityType, validatedValues, existingRecord.status);

  const isPublishing = validatedValues.status === "Published" && existingRecord.status !== "Published";

  try {
    const updatedRecord = await model
      .findByIdAndUpdate(id, validatedValues, {
        new: true,
        runValidators: true,
      })
      .lean();

    await logActivity({
      action: isPublishing ? `${entityType}.publish` : `${entityType}.update`,
      entityType,
      entityId: updatedRecord._id,
      userId: user._id,
      request,
    });

    return {
      data: serializeAdminRecord(updatedRecord),
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw buildDuplicateFieldError("slug", "Another record already uses one of these unique values.");
    }

    throw error;
  }
}

export async function deleteAdminContent(entityType, id, userId, request) {
  const model = getEntityModel(entityType);
  const deletedRecord = await model.findByIdAndDelete(id).lean();

  if (!deletedRecord) {
    throw new AppError(`${entityLabels[entityType]} was not found.`, {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  await logActivity({
    action: `${entityType}.delete`,
    entityType,
    entityId: id,
    userId,
    request,
  });

  return {
    data: serializeAdminRecord(deletedRecord),
  };
}

function serializeAdminUser(user, currentUserId) {
  return {
    accessScope:
      user.role === "super_admin"
        ? "Owns security, publishing policy, user governance, and system oversight."
        : user.role === "content_admin"
          ? "Coordinates publishing desks and institutional content quality."
          : "Handles day-to-day editorial operations inside protected content workflows.",
    capabilities: user.role === "super_admin"
      ? ["Security approvals", "Role governance", "Platform settings"]
      : user.role === "content_admin"
        ? ["Publication queue", "News desk", "Gallery archive"]
        : ["Editorial cleanup", "Metadata checks", "Draft review"],
    createdAt: user.createdAt,
    email: user.email,
    fullName: user.fullName,
    id: user._id.toString(),
    isCurrentSession: user._id.toString() === currentUserId,
    lastLoginAt: user.lastLoginAt ?? null,
    memberId: user.memberId?.toString() ?? null,
    memberLabel: user.memberId
      ? "Linked to a member profile in the protected system."
      : "Authenticated directly as an admin account.",
    mustChangePassword: Boolean(user.mustChangePassword),
    passwordResetAt: user.passwordResetAt ?? null,
    passwordResetReference: user.passwordResetReference ?? "",
    role: user.role,
    status: user.status,
    updatedAt: user.updatedAt,
  };
}

function buildTemporaryPassword() {
  return `BRI-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createAdminUser(values, currentUserId, request) {
  const schema = z.object({
    email: z.string().email("Enter a valid email address.").trim().toLowerCase(),
    fullName: z.string().min(1, "Full name is required.").trim(),
    role: z.enum(["content_admin", "editor"]),
  });
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    throw createValidationError(formatSchemaIssues(parsed.error.issues));
  }

  const { email, fullName, role } = parsed.data;

  const existingEmail = await User.findOne({ email }).select({ _id: 1 }).lean();
  if (existingEmail) {
    throw buildDuplicateFieldError("email", "An account with this email already exists.");
  }

  const temporaryPassword = buildTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const newUser = await User.create({
    email,
    fullName,
    passwordHash,
    role,
    status: "active",
    mustChangePassword: true,
  });

  await logActivity({
    action: "user.create",
    entityType: "user",
    entityId: newUser._id,
    userId: currentUserId,
    metadata: { email, role },
    request,
  });

  return {
    data: serializeAdminUser(newUser.toObject(), currentUserId),
    temporaryPassword,
  };
}

export async function listAdminUsers(currentUserId) {
  const users = await User.find().sort({ fullName: 1 }).lean();

  return {
    data: users.map((user) => serializeAdminUser(user, currentUserId)),
  };
}

export async function updateAdminUserAccess(accountId, values, currentUserId, request) {
  const schema = z.object({
    role: z.enum(["super_admin", "content_admin", "editor"]),
    status: z.enum(["active", "inactive", "locked"]),
  });
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    throw createValidationError(formatSchemaIssues(parsed.error.issues));
  }

  if (accountId === currentUserId) {
    throw new AppError(
      "The current signed-in account cannot be reassigned from this browser session.",
      {
        code: "FORBIDDEN",
        statusCode: 403,
      },
    );
  }

  const existingUser = await User.findById(accountId).lean();
  
  const updatedUser = await User.findByIdAndUpdate(
    accountId,
    {
      $set: {
        role: parsed.data.role,
        status: parsed.data.status,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedUser) {
    throw new AppError("Admin account was not found.", {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  if (existingUser?.role !== parsed.data.role) {
    await logActivity({
      action: "user.role_change",
      entityType: "user",
      entityId: accountId,
      userId: currentUserId,
      metadata: { oldRole: existingUser?.role, newRole: parsed.data.role },
      request,
    });
  }

  if (existingUser?.status !== parsed.data.status) {
    const action = parsed.data.status === "locked" ? "user.lock" : parsed.data.status === "active" ? "user.unlock" : null;
    if (action) {
      await logActivity({
        action,
        entityType: "user",
        entityId: accountId,
        userId: currentUserId,
        metadata: { oldStatus: existingUser?.status, newStatus: parsed.data.status },
        request,
      });
    }
  }

  return {
    data: serializeAdminUser(updatedUser, currentUserId),
  };
}

export async function resetAdminUserPassword(accountId, currentUserId, request) {
  if (accountId === currentUserId) {
    throw new AppError(
      "Reset the current signed-in account from a different administrative session.",
      {
        code: "FORBIDDEN",
        statusCode: 403,
      },
    );
  }

  const user = await User.findById(accountId);

  if (!user) {
    throw new AppError("Admin account was not found.", {
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  const issuedAt = new Date();
  const temporaryPassword = buildTemporaryPassword();
  user.mustChangePassword = true;
  user.passwordHash = await hashPassword(temporaryPassword);
  user.passwordResetAt = issuedAt;
  user.passwordResetReference = `RESET-${Date.now().toString(36).toUpperCase()}`;
  await user.save();

  await logActivity({
    action: "user.password_reset",
    entityType: "user",
    entityId: accountId,
    userId: currentUserId,
    metadata: { email: user.email },
    request,
  });

  return {
    data: serializeAdminUser(user.toObject(), currentUserId),
    temporaryPassword,
  };
}
