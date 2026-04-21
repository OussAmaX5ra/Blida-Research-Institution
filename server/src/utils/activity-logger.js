import { ActivityLog } from "../models/activity-log.js";

export async function logActivity({
  action,
  entityType,
  entityId,
  userId,
  metadata = {},
  request,
}) {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      userId,
      metadata,
      ipAddress: request?.ip || request?.headers?.["x-forwarded-for"],
      userAgent: request?.headers?.["user-agent"],
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function createActivityLogger(getUserId) {
  return ({ action, entityType, entityId, metadata = {} }) => {
    const userId = getUserId();
    return logActivity({ action, entityType, entityId, userId, metadata });
  };
}