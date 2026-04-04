import mongoose from "mongoose";

export const ADMIN_USER_ROLES = ["super_admin", "content_admin", "editor"];
export const ADMIN_USER_STATUSES = ["active", "inactive", "locked"];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ADMIN_USER_ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: ADMIN_USER_STATUSES,
      required: true,
      default: "active",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

userSchema.index({ memberId: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
