# Backend Validation Strategy

## Purpose

This document defines how request and payload validation should be handled in the backend for the Blida Research Lab platform. It establishes one consistent approach so future routes do not invent their own validation rules or error shapes.

## Validation Standard

- Use `zod` as the primary validation library for backend request validation
- Validate request `body`, `query`, and `params` explicitly at the route boundary
- Treat validated data as the only trusted input for controllers and service logic
- Return validation failures in a consistent API error format
- Use `safeParse` inside middleware so validation failures are converted into structured `AppError` responses instead of uncaught thrown errors

## Scope of Validation

Validation should happen before business logic runs for:

- JSON request bodies
- URL params
- Query string filters and pagination inputs
- Authentication-related payloads
- Admin CRUD create and update payloads

Database-level validation in Mongoose is still important, but it is a second line of defense rather than the primary request contract.

## Where Schemas Live

- Route-facing validation schemas should live in `server/src/validators/`
- Domain-specific validators can later be grouped by entity, for example:
  - `server/src/validators/team-schemas.js`
  - `server/src/validators/member-schemas.js`
  - `server/src/validators/publication-schemas.js`
- Cross-runtime schemas should move to `shared/` only when they are truly reused by both client and server

Concrete examples:

- Good `shared/` candidates:
  - slug format rules
  - object id string format helpers
  - role enums
  - status enums
  - pagination schema fragments reused by both frontend and backend
- Keep server-side only:
  - auth request schemas
  - admin-only route validators
  - request schemas tied to Express route structure
  - validation that depends on backend-only persistence or security rules

## Middleware Strategy

- Use one reusable request-validation middleware for `body`, `query`, and `params`
- The middleware should parse inputs with Zod and attach sanitized values to `request.validated`
- Route handlers should prefer `request.validated.body`, `request.validated.query`, and `request.validated.params` over raw request input
- Controller convention: destructure from `request.validated` near the top of the handler, for example `const { body, params, query } = request.validated`
- Validation failures should raise a structured `AppError` with HTTP `400`

## Error Shape

Validation failures should use the centralized error handler and return:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      {
        "source": "body",
        "path": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

## Input Rules

- Reject malformed JSON through the global error middleware
- Reject unknown or invalid enum values
- Normalize values during parsing when appropriate, such as trimming strings or coercing numbers
- Keep normalization explicit inside schemas so transformations stay visible and testable
- Default to `strict()` schemas for authentication and other sensitive security routes so unexpected fields are rejected
- Default to strip-style object handling for general CRUD payloads unless a route has a clear reason to reject unknown keys

## Query String Guidance

- Query parameters arrive as strings and should usually use coercion-aware schemas
- Use `z.coerce.number()` for pagination and numeric filters instead of `z.number()`
- Use explicit transforms or coercion for booleans, dates, and enums when query strings need them
- Treat empty-string query values carefully so filtering behavior stays intentional

## Route Design Guidance

- Create separate schemas for create, update, list-filter, and id-param use cases
- Keep route schemas close to the backend contract rather than mirroring frontend form state exactly
- Use smaller shared schema fragments for repeated concepts such as pagination, slugs, ids, and status enums

## Relationship With Later Tasks

- This task sets up the validation foundation only
- Full entity-specific validation for admin forms and CRUD endpoints belongs to later implementation tasks
- When auth flows are added, login, password reset, and role-management payloads should all use the same validation pattern

## Decision Summary

- Backend request validation will use `zod`
- Validation runs at the route boundary through reusable middleware
- Sanitized values are stored on `request.validated`
- Validation failures return centralized `VALIDATION_ERROR` responses
