import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { getDatabaseState } from "./db/mongoose.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      environment: env.NODE_ENV,
      database: getDatabaseState(),
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

