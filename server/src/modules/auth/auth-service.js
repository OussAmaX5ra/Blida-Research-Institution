import mongoose from "mongoose";
import { z } from "zod";

import { AuthSession } from "../../models/auth-session.js";
import { ADMIN_USER_ROLES, User } from "../../models/user.js";
import { AppError } from "../../utils/app-error.js";
import { serializeAuthenticatedUser } from "../../utils/auth-user.js";
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken,
} from "../../utils/auth-tokens.js";
import { logActivity } from "../../utils/activity-logger.js";
import { verifyPassword } from "../../utils/password.js";
import {
  resolveAuthenticatedAdminFromRefreshCookie,
  revokeAllSessionsForUser,
} from "../../utils/refresh-session.js";
import { createValidationError, formatSchemaIssues, buildDuplicateFieldError } from "../../validators/admin-content-schemas.js";

const ACTIVE_ADMIN_ROLES = new Set(ADMIN_USER_ROLES);

function getAuthError(message = "Invalid email or password.", code = "INVALID_CREDENTIALS") {
  return new AppError(message, {
    statusCode: 401,
    code,
  });
}

function getAuthContext(request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get("user-agent"),
  };
}

function ensureEligibleAdmin(user) {
  return user && user.status === "active" && ACTIVE_ADMIN_ROLES.has(user.role);
}

function buildSessionTokens({ role, sessionId, userId }) {
  return {
    accessToken: createAccessToken({ role, sessionId, userId }),
    refreshToken: createRefreshToken({ sessionId, userId }),
  };
}

export async function loginAdmin({ email, password, request }) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !ensureEligibleAdmin(user)) {
    throw getAuthError();
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw getAuthError();
  }

  const sessionId = new mongoose.Types.ObjectId();
  const { accessToken, refreshToken } = buildSessionTokens({
    role: user.role,
    sessionId: sessionId.toString(),
    userId: user.id,
  });

  await AuthSession.create({
    _id: sessionId,
    ...getAuthContext(request),
    expiresAt: getRefreshTokenExpiresAt(),
    lastUsedAt: new Date(),
    refreshTokenHash: hashToken(refreshToken),
    userId: user.id,
  });

  user.lastLoginAt = new Date();
  await user.save();

  await logActivity({
    action: "user.login",
    entityType: "user",
    entityId: user.id,
    userId: user.id,
    request,
  });

  return {
    accessToken,
    refreshToken,
    user: serializeAuthenticatedUser(user),
  };
}

export async function refreshAdminSession(request) {
  const refreshContext =
    request.authSession && request.refreshToken && request.user
      ? {
          refreshToken: request.refreshToken,
          session: request.authSession,
          user: await User.findById(request.user.id),
        }
      : await resolveAuthenticatedAdminFromRefreshCookie(request);
  const { session, user } = refreshContext;

  const { accessToken, refreshToken: nextRefreshToken } = buildSessionTokens({
    role: user.role,
    sessionId: session.id,
    userId: user.id,
  });

  session.expiresAt = getRefreshTokenExpiresAt();
  session.ipAddress = request.ip;
  session.lastUsedAt = new Date();
  session.refreshTokenHash = hashToken(nextRefreshToken);
  session.userAgent = request.get("user-agent");
  await session.save();

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    user: serializeAuthenticatedUser(user),
  };
}

export async function logoutAdminSession(request) {
  if (!request.authSession) {
    return;
  }

  const userId = request.authSession.userId;

  await AuthSession.findByIdAndUpdate(request.authSession.id, {
    $set: {
      revokedAt: new Date(),
    },
  });

  await logActivity({
    action: "user.logout",
    entityType: "user",
    entityId: userId,
    userId,
    request,
  });
}

export async function logoutAllAdminSessions(request) {
  if (!request.user) {
    throw new AppError("Authentication is required.", {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  await revokeAllSessionsForUser(request.user.id);

  await logActivity({
    action: "user.logout",
    entityType: "user",
    entityId: request.user.id,
    userId: request.user.id,
    metadata: { allSessions: true },
    request,
  });
}

export async function getCurrentAdmin(request) {
  if (request.user) {
    return request.user;
  }

  throw new AppError("Authentication is required.", {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}

const PROFILE_UPDATE_COOLDOWN_DAYS = 7;

export async function updateCurrentUserProfile(request, values) {
  const schema = z.object({
    email: z.string().email("Enter a valid email address.").trim().toLowerCase(),
    fullName: z.string().min(1, "Full name is required.").trim(),
  });
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    throw createValidationError(formatSchemaIssues(parsed.error.issues));
  }

  const { email, fullName } = parsed.data;
  const userId = request.user?.id;

  if (!userId) {
    throw new AppError("Authentication is required.", {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  if (user.lastProfileUpdate) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(user.lastProfileUpdate).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceUpdate < PROFILE_UPDATE_COOLDOWN_DAYS) {
      const nextUpdateDate = new Date(user.lastProfileUpdate);
      nextUpdateDate.setDate(nextUpdateDate.getDate() + PROFILE_UPDATE_COOLDOWN_DAYS);

      throw new AppError(
        `Profile updates are allowed once per week. Next update available on ${nextUpdateDate.toLocaleDateString()}.`,
        {
          statusCode: 429,
          code: "PROFILE_UPDATE_COOLDOWN",
          nextUpdateDate: nextUpdateDate.toISOString(),
        },
      );
    }
  }

  if (email !== user.email) {
    const existingEmail = await User.findOne({ email, _id: { $ne: user._id } }).select({ _id: 1 }).lean();
    if (existingEmail) {
      throw buildDuplicateFieldError("email", "An account with this email already exists.");
    }
  }

  user.email = email;
  user.fullName = fullName;
  user.lastProfileUpdate = new Date();
  await user.save();

  return {
    user: serializeAuthenticatedUser(user),
  };
}
