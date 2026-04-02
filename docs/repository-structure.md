# Repository Structure Decision

This document finalizes the repository layout for the Blida Research Lab platform so implementation can proceed without ambiguity.

## Decision

The project will use a root-level monorepo-style structure with:

- `client/` for the React frontend
- `server/` for the Node.js and Express backend
- `shared/` for code that is intentionally reused by both sides
- `docs/` for planning and product documentation

This means `shared/` is not just optional in theory; it is part of the chosen final structure from the start.

## Why This Structure

- The product clearly has two runtime applications: a public/admin web client and a backend API.
- The schema and validation planning already introduces concepts that both sides benefit from sharing, such as enums, role names, entity names, route-safe constants, and validation shapes.
- Separating `client/` and `server/` keeps frontend build tooling isolated from backend runtime concerns.
- Keeping `shared/` explicit from day one reduces duplicated constants and helps the admin UI and API stay aligned.
- The project frontend will be built with React without committing the architecture to Vite-specific tooling.
- This decision formalizes the next step: the frontend should live in `client/` once implementation begins.

## Final Layout

```text
research-lab/
  client/
    src/
      app/
      components/
      features/
      pages/
      layouts/
      routes/
      lib/
      hooks/
      styles/
      assets/
    public/
    package.json
  server/
    src/
      config/
      db/
      models/
      modules/
      middleware/
      validators/
      utils/
      app.*
      server.*
    package.json
  shared/
    src/
      constants/
      types/
      schemas/
      utils/
    package.json
  docs/
  package.json
  .gitignore
```

## Ownership Rules

### `client/`

- Owns all UI code for the public site and admin portal.
- Owns route definitions, page composition, data-fetching hooks, forms, layout components, and client-side UX state.
- Must not own database models or backend-only business logic.

### `server/`

- Owns the Express app, API routes, auth, RBAC, database connection, Mongoose models, service logic, and server-side validation enforcement.
- Owns all persistence and security-critical workflows.
- Must not import from `client/`.

### `shared/`

- Owns code that is truly cross-runtime and stable across both frontend and backend.
- Intended examples:
  - role constants
  - entity names
  - status enums
  - shared Zod schemas or schema fragments used on both client and server
  - lightweight TypeScript types for API contracts
  - small pure utility helpers with no browser-only or server-only dependencies
- Must not contain React components, Mongoose models, Express middleware, or browser-only APIs.

### `docs/`

- Owns PRD, information architecture, schema decisions, and task tracking.
- Remains outside the runtime code folders.

## Package Boundary Rules

- Imports may flow from `client/` to `shared/`.
- Imports may flow from `server/` to `shared/`.
- Imports must not flow from `server/` to `client/` or from `client/` to `server/`.
- `shared/` must remain dependency-light so it can be consumed by both runtimes safely.
- If a module starts needing Node-specific or browser-specific APIs, it should move out of `shared/`.

## Root-Level Tooling Guidance

- Keep a root `package.json` to coordinate workspace scripts if desired.
- Root scripts should orchestrate development tasks such as:
  - installing workspace dependencies
  - running client and server in development
  - running lint and test commands across the repo
- Environment files should be separated by runtime:
  - `client/.env`
  - `server/.env`
- Secret values must never live in `shared/` or in root-level frontend config.

## Implementation Consequences

- The next backend setup tasks should target `server/`.
- The existing or future React frontend should live under `client/`.
- Shared enums and validation primitives should be introduced in `shared/` only when they are genuinely reused by both sides.
- If the repo currently contains frontend files at the root, they should be moved into `client/` during the implementation setup phase rather than preserved as the long-term layout.

## Decision Summary

- Final structure: `client/` + `server/` + `shared/` + `docs/`
- `shared/` is included from the start
- Root remains the coordination layer, not the main application source folder
