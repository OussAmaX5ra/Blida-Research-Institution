import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { getDatabaseState } from "./db/mongoose.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import {
  apiRateLimiter,
  authRouteRateLimiter,
  loginEmailRateLimiter,
  securityHeadersMiddleware,
} from "./middleware/security.js";
import { authRouter } from "./modules/auth/auth-routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(securityHeadersMiddleware);
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(apiRateLimiter);
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      environment: env.NODE_ENV,
      database: getDatabaseState(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/admin/auth", authRouteRateLimiter);
  app.use("/api/admin/auth/login", loginEmailRateLimiter);
  app.use("/api/admin/auth", authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

