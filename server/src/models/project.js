import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    axisId: {
      type: String,
      required: true,
      trim: true,
    },
    lead: {
      type: String,
      required: true,
      trim: true,
    },
    leadMemberSlug: {
      type: String,
      trim: true,
    },
    milestone: {
      type: String,
      required: true,
      trim: true,
    },
    phdLinked: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Planned", "Ongoing", "Completed"],
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    teamSlug: {
      type: String,
      required: true,
      trim: true,
    },
    themes: {
      type: [String],
      default: [],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "projects",
    timestamps: true,
  },
);

projectSchema.index({ teamSlug: 1, year: -1 });
projectSchema.index({ status: 1 });

export const Project =
  mongoose.models.Project ?? mongoose.model("Project", projectSchema);
