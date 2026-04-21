# Vercel Deployment

This repository is now set up for a two-project Vercel deployment:

- Frontend project: deploy the repository root
- Backend project: deploy the `server/` directory

## What was added

- `vercel.json` at the repo root for Vite SPA deep-link rewrites
- `server/src/index.js` so the Express API can run on Vercel Functions
- frontend API helpers that support a separate backend URL through `VITE_API_BASE_URL`
- backend CORS support for one or more frontend origins, including wildcard preview patterns

## 1. Deploy the backend

Create a new Vercel project from this repository and set:

- Root Directory: `server`
- Framework Preset: `Other`

Add these environment variables in the backend project:

```bash
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-frontend.vercel.app
CLIENT_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-git-*.vercel.app
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE?retryWrites=true&w=majority
LOG_LEVEL=info
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret-at-least-32-characters
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret-at-least-32-characters
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
PASSWORD_SALT_ROUNDS=12
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_SAME_SITE=strict
API_RATE_LIMIT_MAX=800
```

Notes:

- `CLIENT_ORIGIN` is the main frontend URL.
- `CLIENT_ORIGINS` is optional and can include extra exact URLs or wildcard preview URLs.
- For preview deployments on Vercel, a pattern like `https://your-frontend-git-*.vercel.app` is the easiest option.
- If you use two different custom domains for frontend and backend, set `AUTH_COOKIE_SAME_SITE=none`.

After deploy, note the backend URL, for example:

```bash
https://your-backend.vercel.app
```

Health check:

```bash
https://your-backend.vercel.app/api/health
```

## 2. Deploy the frontend

Create a second Vercel project from the same repository and set:

- Root Directory: `.`
- Framework Preset: `Vite`

Add this environment variable in the frontend project:

```bash
VITE_API_BASE_URL=https://your-backend.vercel.app
```

Then deploy.

The frontend is configured to:

- use the backend URL above for all API requests
- send cookies with cross-origin admin requests
- rewrite deep links to `index.html` so routes like `/about` and `/admin/login` work on refresh

## 3. Custom domains

If you later attach custom domains:

- update `VITE_API_BASE_URL` in the frontend project
- update `CLIENT_ORIGIN` and `CLIENT_ORIGINS` in the backend project
- if frontend and backend are on different sites, use `AUTH_COOKIE_SAME_SITE=none`

## 4. Local development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run dev
```

Optional frontend `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## 5. Creating the first admin user

Run this locally against the same production MongoDB database:

```bash
cd server
npm run create-admin -- --email=admin@example.com --password=StrongPass123! --fullName="Admin User"
```

Use the production backend environment values locally before running the command.

## 6. Files to use as templates

- Frontend env template: `.env.example`
- Backend env template: `server/.env.example`
- Production reference: `.env.production`
