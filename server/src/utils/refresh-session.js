import { AuthSession } from "../models/auth-session.js";
import { ADMIN_USER_ROLES, User } from "../models/user.js";
import { AppError } from "./app-error.js";
import {
  hashToken,
  REFRESH_TOKEN_COOKIE_NAME,
  verifyRefreshToken,
} from "./auth-tokens.js";
import { serializeAuthenticatedUser } from "./auth-user.js";

const ACTIVE_ADMIN_ROLES = new Set(ADMIN_USER_ROLES);

function getUnauthorizedError() {
  return new AppError("Authentication is invalid or expired.", {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}

function ensureEligibleAdmin(user) {
  return user && user.status === "active" && ACTIVE_ADMIN_ROLES.has(user.role);
}

export function readRefreshToken(request) {
  const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    throw getUnauthorizedError();
  }

  return refreshToken;
}

export async function revokeAllSessionsForUser(userId) {
  await AuthSession.updateMany(
    {
      revokedAt: null,
      userId,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
}

export async function resolveAuthenticatedAdminFromRefreshCookie(request) {
  const refreshToken = readRefreshToken(request);

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw getUnauthorizedError();
  }

  if (payload.type !== "refresh") {
    throw getUnauthorizedError();
  }

  const session = await AuthSession.findById(payload.sessionId);

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw getUnauthorizedError();
  }

  const providedRefreshHash = hashToken(refreshToken);

  if (session.refreshTokenHash !== providedRefreshHash) {
    await revokeAllSessionsForUser(session.userId);

    throw new AppError("Authentication is invalid or expired.", {
      statusCode: 401,
      code: "SESSION_REUSED",
    });
  }

  const user = await User.findById(payload.sub);

  if (!ensureEligibleAdmin(user)) {
    throw getUnauthorizedError();
  }

  return {
    refreshToken,
    session,
    user,
    userSummary: serializeAuthenticatedUser(user),
  };
}
