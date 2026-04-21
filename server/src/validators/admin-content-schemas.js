import { z } from "zod";

const RESERVED_SLUGS = new Set(["admin", "api", "login", "search", "new", "edit"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(normalizeText(slug));
}

export function createValidationError(details) {
  const error = new Error("Validation failed.");
  error.name = "ValidationError";
  error.statusCode = 400;
  error.details = details;
  return error;
}

export function formatSchemaIssues(issues) {
  return issues.map((issue) => ({
    message: issue.message,
    path: issue.path.join("."),
    source: "body",
  }));
}

export function buildDuplicateFieldError(field, message) {
  return createValidationError([
    {
      message,
      path: field,
      source: "body",
    },
  ]);
}

const slugSchema = z
  .string()
  .trim()
  .min(1, "A valid slug is required.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
  .refine((value) => !isReservedSlug(value), "This slug is reserved by the routing system.");

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Use a valid email address or leave the field blank.");

const urlLikeSchema = z
  .string()
  .trim()
  .refine((value) => value === "#" || /^(https?:\/\/|\/)/.test(value), "Use #, an absolute URL, or a root-relative file path.");

const imageUrlLikeSchema = z
  .string()
  .trim()
  .refine((value) => /^(https?:\/\/|\/)/.test(value), "Use an absolute image URL or a root-relative file path.");

const isoDateSchema = z
  .string()
  .trim()
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a valid date in YYYY-MM-DD format.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Use a valid calendar date.");

const listFromUnknownSchema = z
  .unknown()
  .transform((value) => parseList(value))
  .refine((value) => value.length > 0, "Add at least one item.");

export const adminContentSchemas = {
  gallery: z.object({
    caption: z.string().trim().min(25, "Use at least 25 characters so the caption is meaningful."),
    category: z.string().trim().min(1, "Category is required."),
    dateIso: isoDateSchema,
    image: imageUrlLikeSchema,
    slug: slugSchema,
    status: z.enum(["Draft", "Review", "Published"], {
      errorMap: () => ({ message: "Choose Draft, Review, or Published." }),
    }),
    teamSlug: z.string().trim().optional(),
    title: z.string().trim().min(1, "Title is required."),
  }),
  member: z.object({
    avatar: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? "")
      .refine((value) => value === "" || /^[A-Z]{1,4}$/.test(value.toUpperCase()), "Avatar initials should use 1 to 4 uppercase letters."),
    email: optionalEmailSchema,
    expertise: z.string().trim().min(1, "Add the member expertise or bio summary."),
    name: z.string().trim().min(1, "Member name is required."),
    primaryTeamSlug: z.string().trim().optional(),
    role: z.enum(["Professor", "Doctor", "PhD Student"], {
      errorMap: () => ({ message: "Choose Professor, Doctor, or PhD Student." }),
    }),
    slug: slugSchema,
    teamSlugs: z
      .array(z.string().trim().min(1))
      .min(1, "Assign at least one team."),
    themes: listFromUnknownSchema.refine((value) => value.length > 0, "Add at least one research theme."),
    title: z.string().trim().min(1, "Academic title is required."),
  }).superRefine((values, context) => {
    if (values.primaryTeamSlug && !values.teamSlugs.includes(values.primaryTeamSlug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The primary team must be one of the assigned teams.",
        path: ["primaryTeamSlug"],
      });
    }
  }),
  news: z.object({
    body: listFromUnknownSchema,
    category: z.string().trim().min(1, "Category is required."),
    dateIso: isoDateSchema,
    excerpt: z.string().trim().min(30, "Use at least 30 characters so the excerpt is meaningful."),
    headline: z.string().trim().min(1, "Headline is required."),
    image: imageUrlLikeSchema,
    slug: slugSchema,
    status: z.enum(["Draft", "Review", "Published"], {
      errorMap: () => ({ message: "Choose Draft, Review, or Published." }),
    }),
    teamSlugs: z
      .array(z.string().trim().min(1))
      .min(1, "Link the story to at least one team."),
  }),
  project: z.object({
    lead: z.string().trim().min(1, "Choose or enter a lead researcher."),
    leadMemberSlug: z.string().trim().optional(),
    milestone: z.string().trim().min(1, "Add the current milestone or project note."),
    phdLinked: z.boolean(),
    slug: slugSchema,
    status: z.enum(["Planned", "Ongoing", "Completed"], {
      errorMap: () => ({ message: "Choose Planned, Ongoing, or Completed." }),
    }),
    summary: z.string().trim().min(40, "Use at least 40 characters so the summary is meaningful."),
    teamSlug: z.string().trim().min(1, "Assign the project to a team."),
    themes: listFromUnknownSchema.refine((value) => value.length > 0, "Add at least one research theme."),
    title: z.string().trim().min(1, "Project title is required."),
    year: z.coerce.number().int().min(2000, "Use a valid four-digit year.").max(2100, "Use a valid four-digit year."),
  }),
  publication: z.object({
    abstract: z.string().trim().min(40, "Use at least 40 characters so the abstract is useful."),
    authors: listFromUnknownSchema.refine((value) => value.length > 0, "Add at least one author and keep the order intentional."),
    citations: z.coerce.number().int().min(0, "Citations must be zero or a positive whole number."),
    doi: z.string().trim().min(1, "DOI is required."),
    entryType: z.enum(["article", "inproceedings"], {
      errorMap: () => ({ message: "Choose article or inproceedings." }),
    }),
    journal: z.string().trim().min(1, "Journal or conference label is required."),
    pdfLink: urlLikeSchema,
    publisher: z.string().trim().min(1, "Publisher or venue group is required."),
    slug: slugSchema,
    status: z.enum(["Draft", "Review", "Published"], {
      errorMap: () => ({ message: "Choose Draft, Review, or Published." }),
    }),
    teamSlug: z.string().trim().min(1, "Assign the publication to a team."),
    themes: listFromUnknownSchema.refine((value) => value.length > 0, "Add at least one research theme."),
    title: z.string().trim().min(1, "Publication title is required."),
    year: z.coerce.number().int().min(2000, "Use a valid four-digit year.").max(2100, "Use a valid four-digit year."),
  }),
  team: z.object({
    acronym: z
      .string()
      .trim()
      .min(1, "A short acronym is required.")
      .regex(/^[A-Z0-9&-]{2,10}$/i, "Use 2 to 10 uppercase letters, numbers, ampersands, or hyphens."),
    axisId: z.string().trim().min(1, "Choose the research axis this team belongs to."),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a full 6-digit hex color such as #1a5c6b."),
    focus: z.string().trim().min(1, "Research focus is required."),
    leader: z.string().trim().min(1, "Assign a visible team leader."),
    name: z.string().trim().min(1, "Team name is required."),
    slug: slugSchema,
    status: z.enum(["active", "inactive", "archived"], {
      errorMap: () => ({ message: "Choose active, inactive, or archived." }),
    }),
    summary: z.string().trim().min(40, "Use at least 40 characters so the institutional summary is meaningful."),
    themes: listFromUnknownSchema.refine((value) => value.length > 0, "Add at least one scientific theme."),
  }),
  phdProgress: z.object({
    title: z.string().trim().min(1, "Title is required."),
    slug: slugSchema,
    description: z.string().trim().optional(),
    memberSlug: z.string().trim().min(1, "Assign a PhD student."),
    projectSlug: z.string().trim().optional(),
    teamSlug: z.string().trim().optional(),
    status: z.enum(["Pending", "In Progress", "Completed", "Deferred"], {
      errorMap: () => ({ message: "Choose Pending, In Progress, Completed, or Deferred." }),
    }),
    milestoneType: z.enum(
      ["Coursework", "Qualifying", "Comprehensive", "Proposal", "Research", "Defense", "Other"],
      { errorMap: () => ({ message: "Choose a valid milestone type." }) },
    ),
    dueDate: isoDateSchema.optional().or(z.literal("")),
    completedAt: isoDateSchema.optional().or(z.literal("")),
    visibility: z.enum(["Public", "Private"], {
      errorMap: () => ({ message: "Choose Public or Private visibility." }),
    }),
    notes: z
      .array(
        z.object({
          content: z.string().trim().min(1, "Note content is required."),
          author: z.string().trim().optional(),
          createdAt: isoDateSchema.optional(),
        }),
      )
      .default([]),
    attachments: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Label is required."),
          url: z.string().trim().url("Use a valid URL."),
          kind: z.enum(["pdf", "presentation", "document", "other"]).optional(),
        }),
      )
      .default([]),
  }),
};
