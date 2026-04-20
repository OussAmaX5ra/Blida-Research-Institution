import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    acronym: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    axisId: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    focus: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
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
      enum: ["active", "inactive", "archived"],
      default: "active",
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    themes: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "teams",
    timestamps: true,
  },
);

teamSchema.index({ acronym: 1 }, { unique: true });
teamSchema.index({ axisId: 1 });
teamSchema.index({ status: 1 });

export const Team = mongoose.models.Team ?? mongoose.model("Team", teamSchema);
