import { User } from "../models/user.js";
import { AppError } from "../utils/app-error.js";
import { serializeAuthenticatedUser } from "../utils/auth-user.js";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  verifyAccessToken,
} from "../utils/auth-tokens.js";

function getUnauthorizedError(message = "Authentication is required.") {
  return new AppError(message, {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}

export async function resolveAuthenticatedAdminFromAccessCookie(request) {
  const accessToken = request.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

  if (!accessToken) {
    throw getUnauthorizedError();
  }

  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw getUnauthorizedError("Authentication is invalid or expired.");
  }

  if (payload.type !== "access") {
    throw getUnauthorizedError("Authentication is invalid or expired.");
  }

  const user = await User.findById(payload.sub);

  if (!user || user.status !== "active") {
    throw getUnauthorizedError("Authentication is invalid or expired.");
  }

  return serializeAuthenticatedUser(user);
}

export async function authenticateAdmin(request, _response, next) {
  try {
    request.user = await resolveAuthenticatedAdminFromAccessCookie(request);
    next();
  } catch (error) {
    next(error);
  }
}
