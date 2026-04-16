/* globals process */
import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./db/mongoose.js";

const app = createApp();
const server = createServer(app);

let isShuttingDown = false;

function getStartupMessage(error) {
  if (error?.name === "MongooseServerSelectionError") {
    return [
      "Failed to start server: MongoDB is unreachable.",
      `Configured URI: ${env.MONGODB_URI}`,
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
      console.log(`Server listening on port ${env.PORT}`);
      resolve();
    });
  });
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

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
  console.error(getStartupMessage(error));
  process.exit(1);
});
