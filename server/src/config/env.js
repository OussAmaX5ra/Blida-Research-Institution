import dns from "node:dns";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

loadEnv();

const optionalStringSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  AUTH_COOKIE_DOMAIN: optionalStringSchema,
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid server environment configuration:\n${issues}`);
}

const developmentDefaults = {
  ACCESS_TOKEN_SECRET: "development-access-token-secret-change-me-now",
  REFRESH_TOKEN_SECRET: "development-refresh-token-secret-change-me-now",
};

const resolvedEnv = {
  ...parsedEnv.data,
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

