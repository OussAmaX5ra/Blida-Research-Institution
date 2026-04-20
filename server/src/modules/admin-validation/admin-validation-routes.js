import { Router } from "express";
import { z } from "zod";

import { authenticateAdmin } from "../../middleware/authenticate-admin.js";
import { AppError } from "../../utils/app-error.js";
import { adminContentSchemas } from "../../validators/admin-content-schemas.js";
import { validateRequest } from "../../validators/request-validator.js";

const validationRouter = Router();

const entityTypeParamSchema = z.object({
  entityType: z.enum(["gallery", "member", "news", "project", "publication", "team"]),
});

function formatSchemaIssues(issues) {
  return issues.map((issue) => ({
    message: issue.message,
    path: issue.path.join("."),
    source: "body",
  }));
}

validationRouter.post(
  "/:entityType",
  authenticateAdmin,
  validateRequest({ params: entityTypeParamSchema }),
  (request, response, next) => {
    try {
      const { entityType } = request.validated.params;
      const schema = adminContentSchemas[entityType];
      const result = schema.safeParse(request.body);

      if (!result.success) {
        throw new AppError("Request validation failed.", {
          code: "VALIDATION_ERROR",
          details: formatSchemaIssues(result.error.issues),
          statusCode: 400,
        });
      }

      response.status(200).json({
        entityType,
        ok: true,
        values: result.data,
      });
    } catch (error) {
      next(error);
    }
  },
);

export { validationRouter };
