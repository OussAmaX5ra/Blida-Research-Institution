import { Router } from "express";
import { z } from "zod";

import { authenticateAdmin } from "../../middleware/authenticate-admin.js";
import { requirePermissions } from "../../middleware/authorize.js";
import { RBAC_PERMISSIONS } from "../../utils/rbac.js";
import { validateRequest } from "../../validators/request-validator.js";
import {
  createAdminContent,
  deleteAdminContent,
  listAdminContent,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminContent,
  updateAdminUserAccess,
} from "./admin-content-service.js";

const adminContentRouter = Router();

const entityTypeParamSchema = z.object({
  entityType: z.enum(["gallery", "member", "news", "project", "publication", "team"]),
});

const objectIdParamSchema = z.object({
  id: z.string().min(1),
});

const entityPermissions = {
  gallery: {
    create: RBAC_PERMISSIONS.GALLERY_CREATE,
    delete: RBAC_PERMISSIONS.GALLERY_DELETE,
    read: RBAC_PERMISSIONS.GALLERY_READ,
    update: RBAC_PERMISSIONS.GALLERY_UPDATE,
  },
  member: {
    create: RBAC_PERMISSIONS.MEMBERS_CREATE,
    delete: RBAC_PERMISSIONS.MEMBERS_DELETE,
    read: RBAC_PERMISSIONS.MEMBERS_READ,
    update: RBAC_PERMISSIONS.MEMBERS_UPDATE,
  },
  news: {
    create: RBAC_PERMISSIONS.NEWS_CREATE,
    delete: RBAC_PERMISSIONS.NEWS_DELETE,
    read: RBAC_PERMISSIONS.NEWS_READ,
    update: RBAC_PERMISSIONS.NEWS_UPDATE,
  },
  project: {
    create: RBAC_PERMISSIONS.PROJECTS_CREATE,
    delete: RBAC_PERMISSIONS.PROJECTS_DELETE,
    read: RBAC_PERMISSIONS.PROJECTS_READ,
    update: RBAC_PERMISSIONS.PROJECTS_UPDATE,
  },
  publication: {
    create: RBAC_PERMISSIONS.PUBLICATIONS_CREATE,
    delete: RBAC_PERMISSIONS.PUBLICATIONS_DELETE,
    read: RBAC_PERMISSIONS.PUBLICATIONS_READ,
    update: RBAC_PERMISSIONS.PUBLICATIONS_UPDATE,
  },
  team: {
    create: RBAC_PERMISSIONS.TEAMS_CREATE,
    delete: RBAC_PERMISSIONS.TEAMS_DELETE,
    read: RBAC_PERMISSIONS.TEAMS_READ,
    update: RBAC_PERMISSIONS.TEAMS_UPDATE,
  },
};

function requireEntityPermission(action) {
  return (request, response, next) => {
    const entityType = request.validated?.params?.entityType ?? request.params.entityType;
    const permission = entityPermissions[entityType]?.[action];

    if (!permission) {
      next();
      return;
    }

    requirePermissions(permission)(request, response, next);
  };
}

adminContentRouter.get(
  "/users",
  authenticateAdmin,
  requirePermissions(RBAC_PERMISSIONS.USERS_READ),
  async (request, response, next) => {
    try {
      response.status(200).json(await listAdminUsers(request.user.id));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.patch(
  "/users/:id/access",
  authenticateAdmin,
  validateRequest({ params: objectIdParamSchema }),
  requirePermissions(RBAC_PERMISSIONS.USERS_UPDATE),
  async (request, response, next) => {
    try {
      response
        .status(200)
        .json(await updateAdminUserAccess(request.validated.params.id, request.body, request.user.id));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.post(
  "/users/:id/password-reset",
  authenticateAdmin,
  validateRequest({ params: objectIdParamSchema }),
  requirePermissions(RBAC_PERMISSIONS.USERS_RESET_PASSWORD),
  async (request, response, next) => {
    try {
      response
        .status(200)
        .json(await resetAdminUserPassword(request.validated.params.id, request.user.id));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.get(
  "/:entityType",
  authenticateAdmin,
  validateRequest({ params: entityTypeParamSchema }),
  requireEntityPermission("read"),
  async (request, response, next) => {
    try {
      response.status(200).json(await listAdminContent(request.validated.params.entityType));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.post(
  "/:entityType",
  authenticateAdmin,
  validateRequest({ params: entityTypeParamSchema }),
  requireEntityPermission("create"),
  async (request, response, next) => {
    try {
      response
        .status(201)
        .json(await createAdminContent(request.validated.params.entityType, request.body, request.user));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.put(
  "/:entityType/:id",
  authenticateAdmin,
  validateRequest({
    params: entityTypeParamSchema.and(objectIdParamSchema),
  }),
  requireEntityPermission("update"),
  async (request, response, next) => {
    try {
      const { entityType, id } = request.validated.params;
      response.status(200).json(await updateAdminContent(entityType, id, request.body, request.user));
    } catch (error) {
      next(error);
    }
  },
);

adminContentRouter.delete(
  "/:entityType/:id",
  authenticateAdmin,
  validateRequest({
    params: entityTypeParamSchema.and(objectIdParamSchema),
  }),
  requireEntityPermission("delete"),
  async (request, response, next) => {
    try {
      const { entityType, id } = request.validated.params;
      response.status(200).json(await deleteAdminContent(entityType, id));
    } catch (error) {
      next(error);
    }
  },
);

export { adminContentRouter };
