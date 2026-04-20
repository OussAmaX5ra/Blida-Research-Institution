import { inspect } from "node:util";

import mongoose from "mongoose";

import { env } from "../config/env.js";
import { isDebugEnabled, logDebug, logInfo, redactMongoUri } from "../lib/logger.js";

let connectionPromise = null;
let mongooseDebugAttached = false;

function attachMongooseDebugIfNeeded() {
  if (mongooseDebugAttached || !isDebugEnabled()) {
    return;
  }

  mongooseDebugAttached = true;
  mongoose.set("debug", (collectionName, methodName, ...methodArgs) => {
    const summary = inspect(
      methodArgs.map((arg) => (typeof arg === "function" ? "[callback]" : arg)),
      { breakLength: 100, depth: 3, maxArrayLength: 12, maxStringLength: 200 },
    );
    logDebug("mongoose:query", {
      collection: collectionName,
      method: methodName,
      summary,
    });
  });
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    attachMongooseDebugIfNeeded();
    return mongoose.connection;
  }

  if (!connectionPromise) {
    logInfo("database:connecting", { uri: redactMongoUri(env.MONGODB_URI) });

    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((instance) => {
        const { host, name: dbName } = instance.connection;
        logInfo("database:connected", { host, dbName });
        attachMongooseDebugIfNeeded();
        return instance.connection;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  logInfo("database:disconnecting", {});
  await mongoose.disconnect();
  logInfo("database:disconnected", {});
}

export function getDatabaseState() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] ?? "unknown";
}
