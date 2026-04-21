import { env } from "../config/env.js";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "./auth-tokens.js";

function getSharedCookieOptions() {
  return {
    domain: env.AUTH_COOKIE_DOMAIN,
    httpOnly: true,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    secure: env.NODE_ENV === "production",
  };
}

export function setAuthCookies(response, { accessToken, refreshToken }) {
  response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    ...getSharedCookieOptions(),
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000,
    path: "/",
  });

  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...getSharedCookieOptions(),
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/admin/auth",
  });
}

export function clearAuthCookies(response) {
  response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    ...getSharedCookieOptions(),
    path: "/",
  });

  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    ...getSharedCookieOptions(),
    path: "/api/admin/auth",
  });
}
