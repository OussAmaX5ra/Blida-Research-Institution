import crypto from "node:crypto";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const TOKEN_ISSUER = "research-lab-server";
const TOKEN_AUDIENCE = "research-lab-admin";
const CLOCK_TOLERANCE_SECONDS = 30;

export const ACCESS_TOKEN_COOKIE_NAME = "rl_admin_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "rl_admin_refresh_token";

function getBaseTokenOptions(expiresIn) {
  return {
    algorithm: "HS256",
    audience: TOKEN_AUDIENCE,
    expiresIn,
    issuer: TOKEN_ISSUER,
  };
}

export function createAccessToken({ role, sessionId, userId }) {
  return jwt.sign(
    {
      role,
      sessionId,
      type: "access",
    },
    env.ACCESS_TOKEN_SECRET,
    {
      ...getBaseTokenOptions(`${env.ACCESS_TOKEN_TTL_MINUTES}m`),
      subject: userId,
    },
  );
}

export function createRefreshToken({ sessionId, userId }) {
  return jwt.sign(
    {
      sessionId,
      tokenId: crypto.randomUUID(),
      type: "refresh",
    },
    env.REFRESH_TOKEN_SECRET,
    {
      ...getBaseTokenOptions(`${env.REFRESH_TOKEN_TTL_DAYS}d`),
      subject: userId,
    },
  );
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
    audience: TOKEN_AUDIENCE,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
    issuer: TOKEN_ISSUER,
  });
}

export function verifyAccessToken(token) {
  return verifyToken(token, env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return verifyToken(token, env.REFRESH_TOKEN_SECRET);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}
