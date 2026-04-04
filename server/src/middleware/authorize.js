import { AppError } from "../utils/app-error.js";
import { hasAnyPermission } from "../utils/rbac.js";

function getUnauthorizedError() {
  return new AppError("Authentication is required.", {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}

function getForbiddenError(details) {
  return new AppError("You do not have permission to perform this action.", {
    statusCode: 403,
    code: "FORBIDDEN",
    details,
  });
}

export function requireRoles(...allowedRoles) {
  const allowedRoleSet = new Set(allowedRoles);

  return function roleAuthorizationMiddleware(request, _response, next) {
    if (!request.user) {
      next(getUnauthorizedError());
      return;
    }

    if (!allowedRoleSet.has(request.user.role)) {
      next(
        getForbiddenError({
          allowedRoles,
          currentRole: request.user.role,
          type: "role",
        }),
      );
      return;
    }

    next();
  };
}

export function requirePermissions(...permissions) {
  return function permissionAuthorizationMiddleware(request, _response, next) {
    if (!request.user) {
      next(getUnauthorizedError());
      return;
    }

    if (!hasAnyPermission(request.user.role, permissions)) {
      next(
        getForbiddenError({
          currentRole: request.user.role,
          permissions,
          type: "permission",
        }),
      );
      return;
    }

    next();
  };
}
