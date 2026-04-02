import { env } from "./env.js";

console.log("Environment configuration loaded successfully.");
console.log(
  JSON.stringify(
    {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      CLIENT_ORIGIN: env.CLIENT_ORIGIN,
      LOG_LEVEL: env.LOG_LEVEL,
    },
    null,
    2,
  ),
);

