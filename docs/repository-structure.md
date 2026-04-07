# Repository Structure

This document records both the current implemented layout and the target repository structure for the Blida Research Institute platform.

## Current Implemented Layout

The repository currently runs as a hybrid full-stack workspace:

```text
research-lab/
  src/                # current React frontend
  public/             # current frontend static assets
  server/             # Express + Mongo backend
  shared/             # runtime-safe shared data and future shared utilities
  docs/               # planning and status documents
  package.json        # current frontend package
```

## What Is True Today

- The frontend is still rooted at the repository top level rather than under `client/`.
- The backend is correctly isolated under `server/`.
- A `shared/` folder now exists for code and data that can be consumed by both runtimes safely.
- Public API responses are still derived from shared mock data rather than MongoDB domain collections.
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
  shared/
    src/
    package.json
  docs/
  package.json
  .gitignore
```

## Why The Target Still Matters

- `client/` keeps frontend tooling and routing concerns separate from backend runtime code.
- `server/` owns API, auth, persistence, and security-critical logic.
- `shared/` provides a safe home for constants, schema fragments, API contract helpers, and other cross-runtime modules.

## Current Boundary Rules

- `server/` must not import from `src/` or other frontend-only paths.
- `src/` may import from `shared/`.
- `server/` may import from `shared/`.
- `shared/` must stay runtime-safe and dependency-light.

## Migration Status

- `server/`: implemented and active
- `shared/`: introduced and active
- `client/`: planned but not yet extracted from the root frontend

## Decision Summary

- The repo is currently a transitional hybrid layout.
- The implemented structure is now documented honestly.
- The target `client/` + `server/` + `shared/` architecture remains the planned end state, not the current state.
