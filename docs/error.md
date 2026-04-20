# Page-by-Page Error Audit and Fix Plan

Date: 2026-04-20  
Environment: local (`server` on `:4000`, `vite` on `:5173`)  
Scope: public pages + admin routes in `publicRouteMap`

## Audit Method

- Ran a browser-driven route pass across static, detail, and admin routes.
- Captured:
  - browser console errors
  - `pageerror` exceptions
  - network responses with status `>= 400`
- Grouped findings into:
  - **real app defects**
  - **expected auth behavior that currently pollutes console/logs**
  - **rate-limit side effects**

## Findings Summary

### 1) Runtime crash on Teams page (high severity)

- Route: `/teams`
- Error observed: `PAGEERROR: researchAxes is not defined`
- Root cause: `TeamCard` references `researchAxes` without receiving it as a prop or defining it in local scope.
- Impact:
  - Teams listing can crash or fail rendering under route load.
  - Blocks normal page usage.

### 2) Admin session probe runs on every route and emits noisy 401 errors (medium severity)

- Routes affected: effectively all public routes (`/`, `/about`, `/research-axes`, `/teams`, etc.)
- Error pattern:
  - `401 /api/admin/auth/me`
  - `401 /api/admin/auth/refresh`
- Likely behavior:
  - `AdminSessionProvider` tries to resolve admin session globally, including on public pages when user is not authenticated.
  - 401 is expected for anonymous visitors, but currently appears as repeated failed-resource noise.
- Impact:
  - Polluted browser console and potential monitoring noise.
  - Harder to spot true regressions.

### 3) Auth endpoints get rate-limited during page sweep (medium severity)

- Routes affected: mostly later routes in the audit run, especially admin routes.
- Error pattern:
  - `429 /api/admin/auth/me`
- Root cause likely:
  - `authRouteRateLimiter` (`limit: 20`) is applied to `/api/admin/auth/*`, including `/me`.
  - Repeated route loads + repeated session checks exceed the limit quickly in dev testing.
- Impact:
  - Admin session resolution becomes unstable during navigation/audit.
  - Can mask other route-specific issues.

### 4) Tooling artifact during audit (not an app bug)

- Error seen in audit output: `NAVIGATION: page.waitForTimeout is not a function`
- This is from the audit script implementation, not from the app code.
- Should be ignored as product issue.

## Page Coverage Snapshot

- Public: `/`, `/about`, `/research-axes`, `/teams`, `/members`, `/projects`, `/publications`, `/news`, `/gallery`, `/contact`
- Detail: `/teams/:slug`, `/publications/:slug`, `/news/:slug`
- Admin: `/admin/login`, `/admin`, `/admin/*` listing/new/edit/settings/activity routes

## Fix Plan (Prioritized)

## Phase 1 - Stabilize page rendering

1. **Fix Teams page crash**
   - Update `TeamCard` in `src/pages/TeamsPage.jsx` to receive `researchAxes` via props (or compute axis map once in parent and pass derived value).
   - Ensure `TeamCard` no longer references undeclared variables.
2. **Validate**
   - Open `/teams` and `/teams/:slug` and confirm no `pageerror`.

## Phase 2 - Reduce auth noise on public pages

1. **Scope admin session check to admin contexts**
   - Option A: move session fetch trigger so it runs only when current route is admin.
   - Option B: keep global provider but short-circuit fetches on non-admin routes.
2. **Handle unauthenticated state quietly**
   - Treat 401 on `/api/admin/auth/me` as expected anonymous state without noisy console/network error surfacing.
3. **Validate**
   - Open all public routes and confirm no recurring 401 spam in console.

## Phase 3 - Tune rate limiting for session-read endpoint

1. **Adjust auth limiter strategy**
   - Keep strict limits on sensitive routes (`/login`, `/refresh`), but loosen or separate limiter for `/me`.
   - Consider dedicated limiter for `/me` with higher threshold and shorter window for UX stability.
2. **Validate**
   - Run route sweep again; confirm no 429 during normal navigation.

## Phase 4 - Regression sweep

1. Re-run page-by-page checks after fixes:
   - public routes
   - detail routes
   - admin routes (unauthenticated and authenticated)
2. Confirm:
   - zero uncaught runtime exceptions
   - no unexpected 4xx/5xx network calls in idle page load
   - auth behavior remains secure and predictable

## Proposed Implementation Order

1. Teams crash fix (`src/pages/TeamsPage.jsx`)
2. Admin session-fetch scoping (`src/providers/AdminSessionProvider.jsx` and app integration)
3. Auth rate-limit tuning (`server/src/middleware/security.js`, optionally route-level limiter splits in `server/src/app.js`)
4. Final route sweep and documentation update

## Notes

- `docs/mcp_screenshots/` is prepared for future captures.
- No screenshots were stored in this pass.
