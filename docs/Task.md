# Project Task Plan

This file tracks the implementation plan derived from [PRD.md](C:/Users/Oussama.M/Desktop/research-lab/docs/PRD.md).

## Status Legend

- `[x]` Done
- `[ ]` Not done

## Milestone 1: Foundation

### Goal

Establish the product definition, technical direction, data structure, backend foundation, and security model.

### Tasks

- `[x]` Finalize the PRD
- `[x]` Define the public website information architecture
- `[x]` Define the admin portal information architecture in implementation detail
- `[x]` Define the database schemas for `users`, `teams`, `members`, `projects`, `publications`, `news`, `gallery`, `phd_progress`, and `activity_logs`
- `[x]` Define entity relationships and data ownership rules
- `[x]` Define slug, timestamp, and audit field conventions
- `[x]` Decide the final repository structure (`client/`, `server/`, optional `shared/`)
- `[x]` Set up the backend folder and environment configuration
- `[x]` Configure MongoDB connection and base server bootstrap
- `[ ]` Set up centralized backend error handling
- `[ ]` Set up validation strategy for requests and payloads
- `[ ]` Design authentication flow for admin users
- `[ ]` Implement password hashing and secure login flow
- `[ ]` Implement RBAC middleware for `Super Admin`, `Content Admin`, and future `Editor`
- `[ ]` Protect admin routes and sensitive API endpoints
- `[ ]` Add rate limiting, secure headers, and base security middleware

### Milestone Status

- `[ ]` Milestone 1 complete

## Milestone 2: Core Public Experience

### Goal

Deliver the public-facing institutional website with real content structure, polished UI, and data-driven pages.

### Tasks

- `[ ]` Define the public route map and page hierarchy
- `[ ]` Define the global layout, header, footer, and navigation system
- `[ ]` Define the visual design system using Tailwind CSS 4
- `[ ]` Use the `frontend-design` skill for high-quality public UI direction
- `[ ]` Build the Home page
- `[ ]` Build the About the Lab page
- `[ ]` Build the Research Axes page
- `[ ]` Build the Research Teams listing page
- `[ ]` Build the Team Details page
- `[ ]` Build the Members Directory page
- `[ ]` Build the Projects page
- `[ ]` Build the Publications page
- `[ ]` Build the Publication Details page
- `[ ]` Build the News listing page
- `[ ]` Build the News Details page
- `[ ]` Build the Gallery page
- `[ ]` Build the Contact page
- `[ ]` Build the public Login page for admins
- `[ ]` Implement public API endpoints for teams, members, projects, publications, news, and gallery
- `[ ]` Implement public data fetching and loading states
- `[ ]` Implement publication filters and search UI
- `[ ]` Implement member grouping by role and team in the UI
- `[ ]` Add SEO-ready page titles, metadata hooks, and clean slugs
- `[ ]` Ensure the full public experience is responsive on mobile, tablet, and desktop

### Milestone Status

- `[ ]` Milestone 2 complete

## Milestone 3: Admin Portal

### Goal

Create a secure management portal that allows authenticated admins to manage all core content through full CRUD workflows.

### Tasks

- `[ ]` Define the admin route map and dashboard information architecture
- `[ ]` Build the admin shell layout with sidebar, header, and protected navigation
- `[ ]` Build the admin dashboard overview
- `[ ]` Build the Teams management list view
- `[ ]` Build the Team create form
- `[ ]` Build the Team edit form
- `[ ]` Build the Team delete workflow with confirmation
- `[ ]` Build the Members management list view
- `[ ]` Build the Member create form
- `[ ]` Build the Member edit form
- `[ ]` Build the Member delete workflow with confirmation
- `[ ]` Ensure member roles are handled separately as `Professor`, `Doctor`, and `PhD Student`
- `[ ]` Build the Projects management list view
- `[ ]` Build the Project create form
- `[ ]` Build the Project edit form
- `[ ]` Build the Project delete workflow with confirmation
- `[ ]` Build the Publications management list view
- `[ ]` Build the Publication create form
- `[ ]` Build the Publication edit form
- `[ ]` Build the Publication delete workflow with confirmation
- `[ ]` Build the News management list view
- `[ ]` Build the News create form
- `[ ]` Build the News edit form
- `[ ]` Build the News delete workflow with confirmation
- `[ ]` Build the Gallery management list view
- `[ ]` Build the Gallery create form
- `[ ]` Build the Gallery edit form
- `[ ]` Build the Gallery delete workflow with confirmation
- `[ ]` Build the User management interface
- `[ ]` Implement user activation, deactivation, role assignment, and password reset workflows
- `[ ]` Implement admin activity logging for important actions
- `[ ]` Implement client-side and server-side validation across all admin forms

### Milestone Status

- `[ ]` Milestone 3 complete

## Milestone 4: Innovation Features

### Goal

Ship the mandatory differentiators that elevate the platform beyond a basic academic site.

### Tasks

- `[ ]` Define the publication citation metadata requirements
- `[ ]` Implement BibTeX citation generation
- `[ ]` Implement APA citation generation
- `[ ]` Add citation export actions to publication cards and/or publication details
- `[ ]` Validate citation output against real publication examples
- `[ ]` Define the `phd_progress` schema and milestone model
- `[ ]` Build the admin CRUD workflow for PhD progress tracking
- `[ ]` Build the public-facing PhD progress timeline UI
- `[ ]` Link PhD progress records to related members and projects
- `[ ]` Support configurable visibility for progress records if needed
- `[ ]` Ensure the PhD progress tracker is readable on mobile and desktop

### Milestone Status

- `[ ]` Milestone 4 complete

## Milestone 5: Production Hardening

### Goal

Prepare the platform for stable, secure, accessible, and production-ready deployment.

### Tasks

- `[ ]` Add backend API tests for critical routes
- `[ ]` Add frontend tests for key user flows
- `[ ]` Test authentication and authorization edge cases
- `[ ]` Test CRUD flows across all major entities
- `[ ]` Test publication search and filters with realistic data
- `[ ]` Test citation export end-to-end
- `[ ]` Test the PhD progress tracker end-to-end
- `[ ]` Run accessibility review and fix keyboard, contrast, and labeling issues
- `[ ]` Review semantic HTML and screen-reader behavior
- `[ ]` Optimize public page performance and bundle size
- `[ ]` Optimize gallery and media loading
- `[ ]` Review large-list pagination, loading, and empty states
- `[ ]` Run security review for auth, cookies, validation, rate limiting, and protected routes
- `[ ]` Add audit logging review and sensitive action verification
- `[ ]` Prepare environment variables and deployment configuration
- `[ ]` Prepare production build pipeline
- `[ ]` Validate deployment readiness checklist
- `[ ]` Perform final smoke test on production-like environment

### Milestone Status

- `[ ]` Milestone 5 complete

## Current Progress Snapshot

- `[x]` Planning document created: `PRD.md`
- `[x]` Task tracker created: `Task.md`
- `[x]` Implementation started
- `[ ]` Production-ready release achieved
