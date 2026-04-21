import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const linkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: ["pdf", "presentation", "document", "other"],
    },
  },
  { _id: true },
);

const phdProgressSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    memberSlug: {
      type: String,
      required: true,
      trim: true,
    },
    milestoneType: {
      type: String,
      enum: [
        "Coursework",
        "Qualifying",
        "Comprehensive",
        "Proposal",
        "Research",
        "Defense",
        "Other",
      ],
      required: true,
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    projectSlug: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Deferred"],
      default: "Pending",
      required: true,
    },
    teamSlug: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Private",
    },
    attachments: {
      type: [linkSchema],
      default: [],
    },
  },
  {
    collection: "phd_progress",
    timestamps: true,
  },
);

phdProgressSchema.index({ memberSlug: 1, status: 1 });
phdProgressSchema.index({ projectSlug: 1 });
phdProgressSchema.index({ teamSlug: 1 });
phdProgressSchema.index({ visibility: 1 });
phdProgressSchema.index({ status: 1 });
phdProgressSchema.index({ milestoneType: 1 });

export const PhDProgress =
  mongoose.models.PhDProgress ?? mongoose.model("PhDProgress", phdProgressSchema);