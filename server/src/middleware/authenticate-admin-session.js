import { AppError } from "../utils/app-error.js";
import { resolveAuthenticatedAdminFromAccessCookie } from "./authenticate-admin.js";
import { resolveAuthenticatedAdminFromRefreshCookie } from "../utils/refresh-session.js";

function getUnauthorizedError() {
  return new AppError("Authentication is required.", {
    statusCode: 401,
    code: "UNAUTHORIZED",
  });
}

export async function authenticateAdminWithRefreshSession(request, _response, next) {
  try {
    const refreshContext = await resolveAuthenticatedAdminFromRefreshCookie(request);
    request.authSession = refreshContext.session;
    request.refreshToken = refreshContext.refreshToken;
    request.user = refreshContext.userSummary;
    next();
  } catch (error) {
    next(error);
  }
}

export async function authenticateAdminWithAnySession(request, _response, next) {
  try {
    try {
      request.user = await resolveAuthenticatedAdminFromAccessCookie(request);
      next();
      return;
    } catch {
      const refreshContext = await resolveAuthenticatedAdminFromRefreshCookie(request);
      request.authSession = refreshContext.session;
      request.refreshToken = refreshContext.refreshToken;
      request.user = refreshContext.userSummary;
      next();
    }
  } catch (error) {
    next(error instanceof AppError ? error : getUnauthorizedError());
  }
}
