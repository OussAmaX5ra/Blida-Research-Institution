# Repository Structure

This document records both the current implemented layout and the target repository structure for the Blida Research Institute platform.

## Current Implemented Layout

The repository currently runs as a hybrid full-stack workspace:

```text
research-lab/
  src/                # current React frontend
  public/             # current frontend static assets
  server/             # Express + Mongo backend
  docs/               # planning and status documents
  package.json        # current frontend package
```

## What Is True Today

- The frontend is still rooted at the repository top level rather than under `client/`.
- The backend is correctly isolated under `server/`.
- Public API responses are backed by MongoDB domain collections.
- The server no longer imports data directly from the frontend tree.

## Target Architecture

The intended long-term structure remains:

```text
research-lab/
  client/
    src/
    public/
    package.json
  server/
    src/
    package.json
  docs/
  package.json
  .gitignore
```

## Why The Target Still Matters

- `client/` keeps frontend tooling and routing concerns separate from backend runtime code.
- `server/` owns API, auth, persistence, and security-critical logic.
- A shared package is optional and should only contain runtime-safe utilities when reintroduced.

## Current Boundary Rules

- `server/` must not import from `src/` or other frontend-only paths.
- Public and admin clients should consume data through API adapters in `src/lib`.
- Server data dependencies should remain inside `server/src`.

## Migration Status

- `server/`: implemented and active
- `shared/`: removed from runtime data flow
- `client/`: planned but not yet extracted from the root frontend

## Decision Summary

- The repo is currently a transitional hybrid layout.
- The implemented structure is now documented honestly.
- The target `client/` + `server/` + `shared/` architecture remains the planned end state, not the current state.
