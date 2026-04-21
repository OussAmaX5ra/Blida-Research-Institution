import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { env } from "../config/env.js";

/** Global /api limiter: each page load + admin save triggers many requests (public collections, admin lists, validation, etc.). */
const apiRateLimitMax = env.API_RATE_LIMIT_MAX ?? (env.NODE_ENV === "development" ? 5000 : 800);

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
  limit: Number.isFinite(apiRateLimitMax) && apiRateLimitMax > 0 ? apiRateLimitMax : 800,
  skip: (request) => request.path === "/api/health" || request.path === "/api/admin/auth/me",
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const publicApiRateLimiter = rateLimit({
  handler: (request, response) => {
    sendRateLimitResponse(response, {
      path: request.originalUrl,
      scope: "public-api",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 1000,
  skip: (request) => request.path === "/health",
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

function authRouteSubPath(request) {
  const base = request.baseUrl ?? "";
  const path = request.path ?? "";
  if (base === "/api/admin/auth" && path) {
    return path;
  }
  const full = request.originalUrl?.split("?")[0] ?? "";
  if (full.startsWith("/api/admin/auth/")) {
    return full.slice("/api/admin/auth".length) || "/";
  }
  return path;
}

export const authRouteRateLimiter = rateLimit({
  skip: (request) => {
    const sub = authRouteSubPath(request);
    return sub === "/me" || sub === "/refresh" || sub === "/login";
  },
  handler: (_request, response) => {
    sendRateLimitResponse(response, {
      scope: "auth",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: env.NODE_ENV === "development" ? 200 : 60,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const adminSessionReadRateLimiter = rateLimit({
  handler: (_request, response) => {
    sendRateLimitResponse(response, {
      scope: "auth-session-read",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 300,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const authRefreshRateLimiter = rateLimit({
  handler: (_request, response) => {
    sendRateLimitResponse(response, {
      scope: "auth-refresh",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 120,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const authLoginRouteRateLimiter = rateLimit({
  handler: (_request, response) => {
    sendRateLimitResponse(response, {
      scope: "auth-login-route",
      windowMs: 15 * 60 * 1000,
    });
  },
  legacyHeaders: false,
  limit: 40,
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
