# Admin Authentication Flow

## Purpose

This document defines the authentication flow for admin users of the Blida Research Lab platform. It turns the PRD security requirements into an implementation-ready backend design.

## Goals

- Allow only authorized admins to access the admin portal and protected API routes
- Use a production-safe session model for web clients
- Keep credentials and session tokens out of frontend JavaScript where possible
- Support future role-based authorization for `super_admin`, `content_admin`, and `editor`
- Keep the flow simple enough to implement incrementally in the current backend

## Chosen Strategy

- Use email and password authentication for admin users
- Use short-lived access tokens and longer-lived refresh tokens
- Store both tokens in secure HTTP-only cookies
- Keep the access token focused on API authorization
- Use refresh rotation so a fresh refresh token is issued whenever a session is renewed
- Revoke all active sessions for a user if refresh token reuse is detected

This is a token-based session flow delivered through cookies rather than local storage.

## Why This Strategy

- It matches the PRD recommendation for production-safe auth with cookie-based protection
- It avoids exposing tokens directly to frontend JavaScript
- It supports protected admin routes cleanly in a React frontend
- It gives a clear path for logout, token refresh, and future session revocation

## User Eligibility Rules

Only `users` collection records may authenticate.

A login may succeed only when all of the following are true:

- The user exists
- The email matches exactly after normalization
- The password hash check succeeds
- The account status is `active`
- The role is one of `super_admin`, `content_admin`, or `editor`

Login must fail when:

- The email does not exist
- The password is incorrect
- The account status is `inactive`
- The account status is `locked`

## Data Model Requirements

The existing `users` schema already covers the core identity fields. The auth implementation should additionally support:

- `passwordHash`
- `status`
- `role`
- `lastLoginAt`

The implementation should also add a server-side session store collection for refresh sessions, for example `auth_sessions`, with fields such as:

- `userId`
- `refreshTokenHash`
- `expiresAt`
- `lastUsedAt`
- `createdAt`
- `revokedAt`
- `ipAddress`
- `userAgent`

Refresh tokens must be stored hashed in the database, never in plaintext.

## Token Model

### Access Token

- Short-lived
- Suggested lifetime: 15 minutes
- Signed by the backend
- Includes:
  - `sub` as the user id
  - `role`
  - `sessionId`
  - token type marker such as `access`

### Refresh Token

- Long-lived relative to access token
- Suggested lifetime: 7 days
- Stored in HTTP-only cookie
- Rotated on every successful refresh
- Backed by a hashed session record in the database
- Includes:
  - `sub` as the user id
  - `sessionId`
  - token type marker such as `refresh`

## Cookie Strategy

Use cookies for browser-based admin authentication:

- Access token cookie:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: "strict"` by default
  - short `maxAge`
- Refresh token cookie:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: "strict"` by default
  - longer `maxAge`
  - path should be limited to auth endpoints if practical, such as `/api/admin/auth`

If the deployed frontend and backend end up on different top-level sites, `sameSite` and CORS/cookie settings may need to move to a cross-site configuration. The first implementation should assume same-site deployment and prefer `strict` unless a concrete deployment requirement forces relaxation.

## Auth Endpoints

The backend should expose a focused auth surface under:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/logout`
- `POST /api/admin/auth/logout-all`
- `GET /api/admin/auth/me`

## Request and Response Behavior

### `POST /api/admin/auth/login`

Request body:

- `email`
- `password`

Flow:

1. Validate payload
2. Normalize email
3. Find user
4. Verify password hash
5. Verify status and allowed role
6. Create refresh session record
7. Issue access token cookie
8. Issue refresh token cookie
9. Update `lastLoginAt`
10. Write audit log event such as `auth.login`

Response body:

- authenticated user summary only
- no raw tokens in JSON

### `POST /api/admin/auth/refresh`

Flow:

1. Read refresh token from cookie
2. Verify token signature and token type
3. Find matching session by `sessionId`
4. Compare provided token against stored refresh hash
5. Reject revoked, expired, missing, or reused sessions
6. Rotate refresh token
7. Issue fresh access token cookie
8. Issue fresh refresh token cookie
9. Update session usage metadata

If refresh token reuse is detected, revoke all active sessions for that user immediately, clear auth cookies, and require a full login again. For an admin portal, the security risk is high enough that global session revocation is preferred over preserving convenience.

### `POST /api/admin/auth/logout`

Flow:

1. Read refresh token or session id context
2. Revoke the current refresh session in storage
3. Clear auth cookies
4. Write audit log event such as `auth.logout`

### `POST /api/admin/auth/logout-all`

Flow:

1. Authenticate current user through the access token or, if needed, through a valid refresh-token-backed session
2. Revoke all active refresh sessions for that user
3. Clear auth cookies
4. Write audit log event such as `auth.logout_all`

### `GET /api/admin/auth/me`

Flow:

1. Authenticate via access token cookie
2. Return current user summary:
  - `id`
  - `email`
  - `fullName`
  - `role`
  - `status`
  - optional `memberId`

This endpoint allows the frontend to restore the current admin session on page load.

## Middleware Flow

Protected admin API requests should use this sequence:

1. Read access token from cookie
2. Verify token signature and type
3. Load minimal user context
4. Reject missing, invalid, expired, inactive, or locked accounts
5. Attach authenticated user data to `request.user`
6. Pass control to later RBAC middleware

Authentication should answer the question "who is this user?".
Authorization should answer the question "can this user perform this action?".

Token verification should allow a small clock-skew tolerance, such as 30 seconds, to reduce false `401` responses caused by minor environment time drift.

## Frontend Session Behavior

For the admin portal:

- Login page submits credentials to `POST /api/admin/auth/login`
- Successful login redirects to `/admin/dashboard`
- App bootstrap calls `GET /api/admin/auth/me`
- If access token is expired, frontend calls `POST /api/admin/auth/refresh`
- If refresh fails, frontend clears local auth state and redirects to `/admin/login`
- Logout button calls `POST /api/admin/auth/logout`

The frontend should not store the access token or refresh token in local storage.

## Failure Cases

Use generic credential failure messaging for login:

- "Invalid email or password."

Do not reveal whether the email exists.

Use explicit session failure responses for expired or invalid sessions:

- `401 UNAUTHORIZED` for missing or invalid authentication
- `403 FORBIDDEN` for authenticated users without permission

Locked or inactive users should not receive a valid session.

## Security Controls

- Hash passwords with Argon2 or bcrypt before storage
- Hash refresh tokens before persistence
- Use HTTP-only cookies
- Use secure cookies in production
- Rate limit login, refresh, and password reset related endpoints
- Apply rate limits using both IP-based and account-identifier signals such as normalized email
- Validate all auth payloads with Zod
- Log auth-sensitive events to `activity_logs`
- Clear cookies on logout and invalid-session detection
- Reject inactive and locked accounts even if old tokens are still presented

Rate limiting policy should not rely only on IP or only on email:

- IP-based limits help absorb broad credential stuffing and abusive network traffic
- Email-based limits help protect individual accounts from repeated guessing attempts
- Combining both reduces bypass risk and avoids making either control the only line of defense

## Audit Events

The auth flow should create audit log events for:

- `auth.login`
- `auth.login_failed`
- `auth.refresh`
- `auth.logout`
- `auth.logout_all`
- `auth.access_denied`

Sensitive secrets, raw passwords, and raw tokens must never be stored in logs.

## Implementation Order

1. Add password hashing support and user password verification
2. Add auth validation schemas
3. Add token signing and verification utilities
4. Add refresh session persistence model
5. Implement auth controller endpoints
6. Implement authentication middleware
7. Implement RBAC middleware
8. Add rate limiting and security headers

## Decision Summary

- Admin authentication will use email and password
- Session handling will use access and refresh tokens in secure HTTP-only cookies
- Refresh sessions will be stored server-side with hashed refresh tokens
- Auth and RBAC remain separate middleware concerns
- The first protected auth endpoints are login, refresh, logout, logout-all, and me
