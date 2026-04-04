# Server Workspace

This folder contains the backend API for the Blida Research Lab platform.

## Structure

- `src/config/` for environment configuration and runtime settings
- `src/db/` for database connection setup
- `src/models/` for Mongoose models
- `src/modules/` for domain services, controllers, and routes
- `src/middleware/` for Express middleware
- `src/validators/` for request validation logic
- `src/utils/` for backend-only helpers

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in the real runtime values
3. Run `npm run check-env` inside `server/` to validate the configuration

Additional auth, security, and deployment variables can be added as those tasks are implemented.

## Scripts

- `npm run check-env` validates required environment variables
- `npm run create-admin -- --email=admin@example.com --password=StrongPass123 --fullName=\"Admin User\"` creates a new admin account
- `npm run create-admin -- --email=admin@example.com --allowUpdate=true --fullName=\"Updated Name\"` updates an existing admin account intentionally
- `npm run dev` starts the backend in watch mode
- `npm run start` starts the backend once
- `npm run verify:milestone1` runs a repeatable Milestone 1 verification pass against auth, RBAC, security headers, and rate limits

## Current Bootstrap

- `src/app.js` creates the base Express app
- `src/server.js` starts the HTTP server and handles graceful shutdown
- `src/db/mongoose.js` manages MongoDB connect and disconnect lifecycle
- `GET /api/health` returns a basic health payload including database connection state
- `src/validators/request-validator.js` provides reusable Zod-based request validation middleware
- `src/modules/auth/auth-routes.js` exposes admin login, refresh, logout, logout-all, and current-user routes
- `src/middleware/authorize.js` provides reusable RBAC middleware for role and permission checks
- `src/middleware/authenticate-admin-session.js` protects refresh-token and any-session admin endpoints
- `src/middleware/security.js` adds secure headers, API rate limiting, auth-specific rate limits, and base request-size hardening
