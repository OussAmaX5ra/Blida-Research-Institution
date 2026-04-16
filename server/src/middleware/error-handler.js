import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

function getStatusCode(error) {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error?.statusCode && Number.isInteger(error.statusCode)) {
    return error.statusCode;
  }

  if (error?.status && Number.isInteger(error.status)) {
    return error.status;
  }

  return 500;
}

function getCode(error, statusCode) {
  if (error instanceof AppError && error.code) {
    return error.code;
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return "INVALID_JSON";
  }

  return statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR";
}

function getMessage(error, statusCode) {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return "Request body contains invalid JSON.";
  }

  return statusCode >= 500 ? "An unexpected error occurred." : error.message;
}

export function errorHandler(error, request, response, next) {
  void next; // Express error handler requires 4 params even if last one isn't used
  const statusCode = getStatusCode(error);
  const code = getCode(error, statusCode);
  const message = getMessage(error, statusCode);

  if (statusCode >= 500) {
    console.error("Unhandled request error", {
      method: request.method,
      path: request.originalUrl,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  const payload = {
    error: {
      code,
      message,
    },
  };

  if (error instanceof AppError && error.details) {
    payload.error.details = error.details;
  }

  if (env.NODE_ENV !== "production" && error instanceof Error) {
    payload.error.stack = error.stack;
  }

  response.status(statusCode).json(payload);
}
