import { getRolePermissions } from "./rbac.js";

export function serializeAuthenticatedUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    memberId: user.memberId ?? null,
    permissions: getRolePermissions(user.role),
    role: user.role,
    status: user.status,
    lastProfileUpdate: user.lastProfileUpdate ?? null,
  };
}
