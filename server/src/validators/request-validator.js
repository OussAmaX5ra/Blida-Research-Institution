import { z } from "zod";

import { AppError } from "../utils/app-error.js";

function formatIssues(source, issues) {
  return issues.map((issue) => ({
    source,
    path: issue.path.length > 0 ? issue.path.join(".") : "",
    message: issue.message,
  }));
}

function parseSegment(schema, value, source) {
  if (!schema) {
    return { success: true, data: value, issues: [] };
  }

  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true, data: result.data, issues: [] };
  }

  return {
    success: false,
    data: undefined,
    issues: formatIssues(source, result.error.issues),
  };
}

export function validateRequest({ body, query, params } = {}) {
  return function requestValidator(request, _response, next) {
    const bodyResult = parseSegment(body, request.body, "body");
    const queryResult = parseSegment(query, request.query, "query");
    const paramsResult = parseSegment(params, request.params, "params");

    const issues = [
      ...bodyResult.issues,
      ...queryResult.issues,
      ...paramsResult.issues,
    ];

    if (issues.length > 0) {
      next(
        new AppError("Request validation failed.", {
          statusCode: 400,
          code: "VALIDATION_ERROR",
          details: issues,
        }),
      );
      return;
    }

    request.validated = {
      body: bodyResult.data,
      query: queryResult.data,
      params: paramsResult.data,
    };

    next();
  };
}

export const commonSchemas = {
  objectIdParam: z.object({
    id: z.string().min(1),
  }),
  paginationQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  slugParam: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  }),
};
