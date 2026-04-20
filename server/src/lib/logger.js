import { env } from "../config/env.js";

const LEVEL_RANK = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function activeRank() {
  return LEVEL_RANK[env.LOG_LEVEL] ?? LEVEL_RANK.info;
}

function line(level, message, meta) {
  const ts = new Date().toISOString();
  const suffix =
    meta !== undefined && meta !== null && typeof meta === "object" && Object.keys(meta).length > 0
      ? ` ${JSON.stringify(meta)}`
      : typeof meta === "string"
        ? ` ${meta}`
        : "";
  return `[${ts}] [${level}] [research-lab] ${message}${suffix}`;
}

export function logError(message, meta) {
  console.error(line("ERROR", message, meta));
}

export function logWarn(message, meta) {
  if (activeRank() < LEVEL_RANK.warn) {
    return;
  }
  console.warn(line("WARN", message, meta));
}

export function logInfo(message, meta) {
  if (activeRank() < LEVEL_RANK.info) {
    return;
  }
  console.log(line("INFO", message, meta));
}

export function logDebug(message, meta) {
  if (activeRank() < LEVEL_RANK.debug) {
    return;
  }
  console.log(line("DEBUG", message, meta));
}

export function isDebugEnabled() {
  return activeRank() >= LEVEL_RANK.debug;
}

/** Redact userinfo in MongoDB URIs for safe logs. */
export function redactMongoUri(uri) {
  if (typeof uri !== "string" || !uri.includes("@")) {
    return "(invalid or local URI)";
  }
  return uri.replace(/\/\/([^@/]+)@/, "//***:***@");
}
