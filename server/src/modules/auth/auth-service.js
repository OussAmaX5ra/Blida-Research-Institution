import mongoose from "mongoose";

import { AuthSession } from "../../models/auth-session.js";
import { ADMIN_USER_ROLES, User } from "../../models/user.js";
import { AppError } from "../../utils/app-error.js";
import { serializeAuthenticatedUser } from "../../utils/auth-user.js";
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken,
} from "../../utils/auth-tokens.js";
import { verifyPassword } from "../../utils/password.js";
import {
  resolveAuthenticatedAdminFromRefreshCookie,
  revokeAllSessionsForUser,
} from "../../utils/refresh-session.js";

const ACTIVE_ADMIN_ROLES = new Set(ADMIN_USER_ROLES);

function getAuthError(message = "Invalid email or password.", code = "INVALID_CREDENTIALS") {
  return new AppError(message, {
    statusCode: 401,
    code,
  });
}

function getAuthContext(request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get("user-agent"),
  };
}

function ensureEligibleAdmin(user) {
  return user && user.status === "active" && ACTIVE_ADMIN_ROLES.has(user.role);
}

function buildSessionTokens({ role, sessionId, userId }) {
  return {
    accessToken: createAccessToken({ role, sessionId, userId }),
    refreshToken: createRefreshToken({ sessionId, userId }),
  };
}

export async function loginAdmin({ email, password, request }) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !ensureEligibleAdmin(user)) {
    throw getAuthError();
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw getAuthError();
  }

  const sessionId = new mongoose.Types.ObjectId();
  const { accessToken, refreshToken } = buildSessionTokens({
    role: user.role,
    sessionId: sessionId.toString(),
    userId: user.id,
  });

  await AuthSession.create({
    _id: sessionId,
    ...getAuthContext(request),
    expiresAt: getRefreshTokenExpiresAt(),
    lastUsedAt: new Date(),
    refreshTokenHash: hashToken(refreshToken),
    userId: user.id,
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: serializeAuthenticatedUser(user),
  };
}

export async function refreshAdminSession(request) {
  const refreshContext =
    request.authSession && request.refreshToken && request.user
      ? {
          refreshToken: request.refreshToken,
          session: request.authSession,
          user: await User.findById(request.user.id),
        }
      : await resolveAuthenticatedAdminFromRefreshCookie(request);
  const { session, user } = refreshContext;

  const { accessToken, refreshToken: nextRefreshToken } = buildSessionTokens({
    role: user.role,
    sessionId: session.id,
    userId: user.id,
  });

  session.expiresAt = getRefreshTokenExpiresAt();
  session.ipAddress = request.ip;
  session.lastUsedAt = new Date();
  session.refreshTokenHash = hashToken(nextRefreshToken);
  session.userAgent = request.get("user-agent");
  await session.save();

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    user: serializeAuthenticatedUser(user),
  };
}

export async function logoutAdminSession(request) {
  if (!request.authSession) {
    return;
  }

  await AuthSession.findByIdAndUpdate(request.authSession.id, {
    $set: {
      revokedAt: new Date(),
    },
  });
}

export async function logoutAllAdminSessions(request) {
  if (!request.user) {
    throw new AppError("Authentication is required.", {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  await revokeAllSessionsForUser(request.user.id);
}

export async function getCurrentAdmin(request) {
  if (request.user) {
    return request.user;
  }

  throw new AppError("Authentication is required.", {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}
