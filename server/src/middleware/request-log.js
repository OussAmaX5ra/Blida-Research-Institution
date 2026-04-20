import { randomBytes } from "node:crypto";

import { logDebug, logInfo } from "../lib/logger.js";

/**
 * Assigns request.id, logs each HTTP response when finished (duration + status).
 * Does not log bodies (avoids leaking passwords on /login).
 */
export function requestLogMiddleware(request, response, next) {
  request.id = randomBytes(4).toString("hex");

  const startedAt = Date.now();
  const { method, originalUrl, id } = request;

  logDebug("request:start", {
    id,
    method,
    path: originalUrl,
  });

  response.on("finish", () => {
    const ms = Date.now() - startedAt;
    logInfo("request:done", {
      id,
      method,
      path: originalUrl,
      status: response.statusCode,
      ms,
    });
  });

  next();
}
