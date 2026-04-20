/* globals process */
import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./db/mongoose.js";
import { logError, logInfo, redactMongoUri } from "./lib/logger.js";

const app = createApp();
const server = createServer(app);

let isShuttingDown = false;

function getStartupMessage(error) {
  if (error?.name === "MongooseServerSelectionError") {
    return [
      "Failed to start server: MongoDB is unreachable.",
      `Configured URI (redacted): ${redactMongoUri(env.MONGODB_URI)}`,
      "Nothing is currently accepting connections at that address.",
      "Start a local MongoDB server, start Docker Desktop and run a Mongo container, or replace MONGODB_URI with a hosted MongoDB URI.",
    ].join("\n");
  }

  return `Failed to start server: ${error instanceof Error ? error.stack ?? error.message : String(error)}`;
}

async function startServer() {
  await connectToDatabase();

  return new Promise((resolve) => {
    server.listen(env.PORT, () => {
      logInfo("server:listening", { port: env.PORT, logLevel: env.LOG_LEVEL, nodeEnv: env.NODE_ENV });
      resolve();
    });
  });
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logInfo("server:shutdown", { signal });

  server.close(async () => {
    try {
      await disconnectFromDatabase();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

startServer().catch((error) => {
  logError("server:start-failed", { message: getStartupMessage(error) });
  process.exit(1);
});
