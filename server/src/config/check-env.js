import { env } from "./env.js";

console.log("Environment configuration loaded successfully.");
console.log(
  JSON.stringify(
    {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      CLIENT_ORIGIN: env.CLIENT_ORIGIN,
      LOG_LEVEL: env.LOG_LEVEL,
      ACCESS_TOKEN_TTL_MINUTES: env.ACCESS_TOKEN_TTL_MINUTES,
      REFRESH_TOKEN_TTL_DAYS: env.REFRESH_TOKEN_TTL_DAYS,
      PASSWORD_SALT_ROUNDS: env.PASSWORD_SALT_ROUNDS,
      AUTH_COOKIE_DOMAIN: env.AUTH_COOKIE_DOMAIN ?? null,
    },
    null,
    2,
  ),
);

