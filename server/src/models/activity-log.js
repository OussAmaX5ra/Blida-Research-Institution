import mongoose from "mongoose";

export const ACTIVITY_ACTIONS = [
  "user.login",
  "user.logout",
  "user.create",
  "user.update",
  "user.role_change",
  "user.password_reset",
  "user.lock",
  "user.unlock",
  "team.create",
  "team.update",
  "team.delete",
  "member.create",
  "member.update",
  "member.delete",
  "project.create",
  "project.update",
  "project.delete",
  "publication.create",
  "publication.update",
  "publication.delete",
  "publication.publish",
  "news.create",
  "news.update",
  "news.delete",
  "news.publish",
  "gallery.create",
  "gallery.update",
  "gallery.delete",
  "gallery.publish",
  "phd_progress.create",
  "phd_progress.update",
  "phd_progress.delete",
  "phd_progress.publish",
];

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        "user",
        "team",
        "member",
        "project",
        "publication",
        "news",
        "gallery",
        "phd_progress",
      ],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    collection: "activity_logs",
    timestamps: true,
  },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog ?? mongoose.model("ActivityLog", activityLogSchema);