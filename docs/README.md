# Documentation Index

This folder contains the planning and implementation documents for the Blida Research Institute platform.

## What Is Here

- `website-documentation.md`: Complete guide to the entire website including all pages, features, API endpoints, and technical details
- `PRD.md`: product scope, goals, and feature requirements
- `Task.md`: milestone tracker and current delivery status
- `public-information-architecture.md`: public site route and page planning
- `admin-information-architecture.md`: admin portal route and workflow planning
- `database-schemas.md`: target MongoDB schema design
- `authentication-flow.md`: admin authentication design
- `repository-structure.md`: current repository layout and target architecture
- `validation-strategy.md`: request validation rules and approach

## How To Read These Docs

- Treat `PRD.md` and the architecture documents as the product target.
- Treat `Task.md` as the status tracker for what is already implemented.
- Treat implementation notes inside the docs as the source of truth when the current repo shape has not yet reached the target architecture.

## Current Implementation Snapshot

- The public frontend currently lives at the repository root under `src/`, `public/`, and the root `package.json`.
- The backend lives under `server/`.
- Public pages are driven by the backend public API and backed by MongoDB collections.
- The admin authentication backend is implemented and the admin portal UI uses protected API-backed CRUD workflows for teams, members, projects, publications, news, gallery, users, and activity review.
- Admin form submissions now run both client-side validation and protected server-side validation before saving.
- Admin CRUD changes are reflected through API-driven collection refreshes in the frontend public data provider.
