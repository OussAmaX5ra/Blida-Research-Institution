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
- `npm run dev` starts the backend in watch mode
- `npm run start` starts the backend once

## Current Bootstrap

- `src/app.js` creates the base Express app
- `src/server.js` starts the HTTP server and handles graceful shutdown
- `src/db/mongoose.js` manages MongoDB connect and disconnect lifecycle
- `GET /api/health` returns a basic health payload including database connection state
