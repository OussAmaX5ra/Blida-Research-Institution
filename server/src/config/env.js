import dns from "node:dns";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

loadEnv();

const optionalStringSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

function splitConfiguredOrigins(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isWildcardOriginPattern(value) {
  return value.includes("*");
}

function isValidOrigin(value) {
  try {
    const parsed = new URL(value);
    return !parsed.pathname || parsed.pathname === "/";
  } catch {
    return false;
  }
}

function isValidOriginPattern(value) {
  if (!isWildcardOriginPattern(value)) {
    return false;
  }

  return /^https?:\/\/[^/]*\*[^/]*$/.test(value);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: optionalStringSchema,
  CLIENT_ORIGINS: optionalStringSchema,
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  AUTH_COOKIE_DOMAIN: optionalStringSchema,
  AUTH_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid server environment configuration:\n${issues}`);
}

const configuredClientOrigins = [
  ...splitConfiguredOrigins(parsedEnv.data.CLIENT_ORIGIN),
  ...splitConfiguredOrigins(parsedEnv.data.CLIENT_ORIGINS),
];

if (configuredClientOrigins.length === 0) {
  throw new Error(
    "Invalid server environment configuration:\nCLIENT_ORIGIN or CLIENT_ORIGINS must include at least one allowed frontend origin.",
  );
}

const invalidConfiguredOrigins = configuredClientOrigins.filter(
  (origin) => !isValidOrigin(origin) && !isValidOriginPattern(origin),
);

if (invalidConfiguredOrigins.length > 0) {
  throw new Error(
    `Invalid server environment configuration:\nUnsupported client origin values: ${invalidConfiguredOrigins.join(", ")}`,
  );
}

const exactClientOrigins = configuredClientOrigins.filter((origin) => !isWildcardOriginPattern(origin));
const clientOriginPatterns = configuredClientOrigins.filter(isWildcardOriginPattern);

const developmentDefaults = {
  ACCESS_TOKEN_SECRET: "development-access-token-secret-change-me-now",
  REFRESH_TOKEN_SECRET: "development-refresh-token-secret-change-me-now",
};

const resolvedEnv = {
  ...parsedEnv.data,
  CLIENT_ORIGIN: exactClientOrigins[0] ?? configuredClientOrigins[0],
  CLIENT_ORIGINS: configuredClientOrigins,
  CLIENT_ORIGIN_PATTERNS: clientOriginPatterns,
  ACCESS_TOKEN_SECRET:
    parsedEnv.data.ACCESS_TOKEN_SECRET ??
    (parsedEnv.data.NODE_ENV === "production"
      ? undefined
      : developmentDefaults.ACCESS_TOKEN_SECRET),
  REFRESH_TOKEN_SECRET:
    parsedEnv.data.REFRESH_TOKEN_SECRET ??
    (parsedEnv.data.NODE_ENV === "production"
      ? undefined
      : developmentDefaults.REFRESH_TOKEN_SECRET),
};

if (!resolvedEnv.ACCESS_TOKEN_SECRET || !resolvedEnv.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Invalid server environment configuration:\nACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required in production.",
  );
}

export const env = Object.freeze(resolvedEnv);
