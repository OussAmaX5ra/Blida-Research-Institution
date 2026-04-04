import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

function sendRateLimitResponse(response, details) {
  response.status(429).json({
    error: {
      code: "RATE_LIMITED",
      details,
      message: "Too many requests. Please try again later.",
    },
  });
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const apiRateLimiter = rateLimit({
  handler: (request, response) => {
    sendRateLimitResponse(response, {
      scope: "api",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 200,
  skip: (request) => request.path === "/api/health",
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const authRouteRateLimiter = rateLimit({
  handler: (_request, response) => {
    sendRateLimitResponse(response, {
      scope: "auth",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 20,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const loginEmailRateLimiter = rateLimit({
  handler: (request, response) => {
    sendRateLimitResponse(response, {
      identifier: normalizeEmail(request.body?.email) || null,
      scope: "auth-login-email",
      windowMs: 15 * 60 * 1000,
    });
  },
  keyGenerator: (request) => {
    const email = normalizeEmail(request.body?.email);
    return email || `ip:${ipKeyGenerator(request.ip)}`;
  },
  legacyHeaders: false,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});
