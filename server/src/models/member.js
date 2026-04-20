import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    expertise: {
      type: String,
      required: true,
      trim: true,
    },
    isLeader: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    primaryTeamSlug: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Professor", "Doctor", "PhD Student"],
      required: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    teamSlugs: {
      type: [String],
      default: [],
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
  },
  {
    collection: "members",
    timestamps: true,
  },
);

memberSchema.index({ primaryTeamSlug: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ teamSlugs: 1 });

export const Member = mongoose.models.Member ?? mongoose.model("Member", memberSchema);
