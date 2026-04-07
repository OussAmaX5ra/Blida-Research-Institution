---
title: Academic Research Lab Institutional Site PRD
version: 1.0
date: 2026-03-29
status: Approved for Planning
---

# Product Requirements Document

## 1. Product Overview

The Blida Research Institute Institutional Site is a production-ready university platform for presenting the laboratory's identity, research teams, members, projects, publications, news, and media. The platform must serve two core audiences:

- Public visitors who need a trustworthy, modern, searchable window into the lab's scientific work
- Authorized administrators who need a secure management portal for maintaining the lab's institutional and research data

This project will be built as a MERN application with a public-facing website and a protected admin portal.

## 2. Product Goals

### Primary Goals

- Present the laboratory as a credible, modern, research-focused institution
- Organize members into structured research teams with clear leadership and role separation
- Publish and manage the lab's scientific output through a searchable publication library
- Provide a secure back-office experience for authenticated administrators
- Support real university usage, not only classroom demonstration

### Business / Institutional Outcomes

- Improve visibility of the laboratory's mission, research axes, and scientific productivity
- Make it easier for students, faculty, partners, and visitors to discover teams and publications
- Reduce manual content maintenance through centralized admin workflows
- Establish a scalable digital foundation for future university adoption


## 3. Users and Roles

### Public Visitors

- Students exploring research opportunities
- Faculty and researchers seeking collaborations
- Conference or journal readers looking for publications
- University leadership and external partners
- General public and media visitors

### Authenticated Roles

#### Super Admin

- Full platform access
- Manage users and roles
- Full CRUD on all resources
- Publish or unpublish content

#### Content Admin

- Full CRUD on teams, members, publications, projects, news, and gallery
- No access to user/role administration unless explicitly granted

#### Editor

- Create and edit content
- Limited delete permissions depending on policy
- Cannot manage authentication or system configuration

The initial production release may launch with `Super Admin` and `Content Admin`, while keeping the data model ready for role expansion.

## 5. Product Scope

### In Scope

- Full public institutional website
- Secure authentication and role-based authorization
- Team management with separate member roles
- Full CRUD for teams, members, projects, publications, news, and gallery
- Publication search and filtering
- Citation export in BibTeX and APA
- PhD progress tracker
- Responsive UI using React, Tailwind CSS 4, and `lucide-react`
- Production-minded architecture, validation, and security

### Out of Scope for V1

- Multi-language localization
- Public user accounts
- Online paper upload/storage pipeline beyond URL-based linking unless later required
- Advanced analytics dashboard beyond basic admin insights
- Real-time collaboration between multiple admins

## 6. Product Vision

The site should feel like a serious institutional research platform rather than a generic academic brochure. It should combine credibility, clarity, and visual polish. The public site must be easy to scan and rich in scientific content, while the admin portal must be secure, efficient, and operationally reliable.

## 7. Proposed Information Architecture

### Public Website

1. Home
2. About the Lab
3. Research Axes
4. Research Teams
5. Team Details
6. Members Directory
7. Projects
8. Publications
9. Publication Details
10. News
11. News Details
12. Gallery
13. Contact
14. Login

### Admin Portal

1. Dashboard
2. Teams Management
3. Members Management
4. Projects Management
5. Publications Management
6. News Management
7. Gallery Management
8. User / Role Management
9. Audit / Activity View
10. Settings

## 8. Functional Requirements

### 8.1 Public Website

#### Home Page

- Present lab identity, mission, vision, key statistics, highlighted teams, featured publications, latest news, and gallery preview
- Include strong navigation to research areas, teams, and publications
- Include clear calls to action such as `Explore Teams`, `Browse Publications`, and `Contact the Lab`

#### About the Lab

- Display mission, vision, history, values, and institutional context
- Highlight core research axes

#### Research Teams

- Display all research teams in a responsive card/grid layout
- Each team card must show:
  - Team name
  - Research focus
  - Team leader
  - Member counts by role
  - Active project count
- Users can click into a team details page

#### Team Details

- Show team identity and scientific mission
- Show team leader
- Show members grouped separately by role:
  - Professors
  - Doctors
  - PhD Students
- Show active projects
- Show associated publications
- Show related themes/tags

#### Members Directory

- Allow browsing all members across the lab
- Support filters by role, team, research theme, and name
- Member cards should include profile basics, affiliation, and linked team(s)

#### Projects

- Show current and past scientific projects
- Allow project filtering by team, status, theme, and year
- For PhD-related projects, connect progress milestones to the progress tracker when relevant

#### Publications

- Display a searchable and filterable digital library
- Each publication card must include:
  - Title
  - Authors
  - Publisher (journal or conference)
  - Year
  - Tags / theme
  - Linked team(s)
  - PDF link
- Provide filters for query, year, team, publisher, author, and theme

#### Publication Details

- Show full metadata
- Show abstract or summary if available
- Link to related team(s)
- Provide `Open PDF`, `Export BibTeX`, and `Export APA citation`

#### News

- Public news feed with latest updates
- News details page with full story, publication date, featured image, and optional related content

#### Gallery

- Responsive media gallery with categories, captions, and dates
- Optimized for mobile and desktop viewing

#### Contact

- Show official contact information, location, email, phone, and optional embedded map

### 8.2 Authentication and Authorization

#### Authentication

- Real authentication is mandatory
- Support secure login for admins
- Passwords must be hashed
- Session strategy should be production-safe
- Recommended implementation:
  - JWT or session-based auth stored in secure HTTP-only cookies
  - Refresh strategy if JWT is used
  - Protected admin routes

#### Authorization

- Use role-based access control
- Restrict admin resources by role
- Prevent non-admin access to management features

#### Security Requirements

- Password hashing with bcrypt or Argon2
- HTTP-only cookies
- CSRF protection if cookie-based auth is used
- Input validation and sanitization
- Rate limiting on login and sensitive endpoints
- Secure headers
- Audit logging for critical actions

### 8.3 Admin Portal

#### Admin Dashboard

- Overview cards for teams, members, publications, projects, news, and gallery items
- Recent activity feed
- Quick actions for creating content
- Status indicators for drafts, published items, and incomplete records

#### Teams Management

- Full CRUD for research teams
- Team form fields:
  - Team name
  - Research focus
  - Leader
  - Team description
  - Research themes
  - Status
- Ability to assign members and projects to the team

#### Members Management

- Full CRUD for members
- Members must be modeled separately, not as plain text only
- Required role separation:
  - Professor
  - Doctor
  - PhD Student
- Suggested fields:
  - Full name
  - Role
  - Email
  - Profile image
  - Bio
  - Team reference(s)
  - Research interests
  - Academic title
  - Display order

#### Projects Management

- Full CRUD for projects
- Suggested fields:
  - Project title
  - Description
  - Team reference
  - Lead researcher
  - Start date
  - End date
  - Status
  - Related PhD student if applicable
  - Timeline milestones

#### Publications Management

- Full CRUD for publications
- Required fields:
  - Title
  - Authors
  - Publisher
  - Year
  - PDF link
  - Linked teams
  - Tags / scientific themes
- Recommended extra fields:
  - Abstract
  - DOI
  - Type (journal, conference, chapter, report)
  - Citation metadata
  - Featured flag
  - Cover image if available

#### News Management

- Full CRUD for news posts
- Suggested fields:
  - Headline
  - Date
  - Featured image
  - Full story
  - Summary
  - Publish status

#### Gallery Management

- Full CRUD for media items
- Support image title, caption, category, date, and ordering

#### User Management

- Create admin accounts
- Assign roles
- Activate or deactivate users
- Reset passwords securely

### 8.4 Search and Discovery

#### Publication Search API

- Endpoint pattern: `/api/publications/search`
- Support query params such as:
  - `query`
  - `year`
  - `team`
  - `author`
  - `publisher`
  - `theme`
  - `page`
  - `limit`
- Search must work against at least:
  - Title
  - Authors
  - Publisher
  - Tags
  - Team names

#### Members Grouping API

- Fetch members grouped by role and/or team
- Support usage in public team pages and admin management views

### 8.5 Innovation Features

#### Citation Exporter

- Each publication must support export to:
  - BibTeX
  - APA
- Export should be available from publication cards or detail pages
- Generated citations must use stored publication metadata reliably

#### PhD Progress Tracker

- Visual timeline for ongoing research progress
- Target use case:
  - Track progress of PhD students and related research projects
- Suggested milestone states:
  - Proposal
  - Literature Review
  - Data Collection
  - Experimentation
  - Writing
  - Submission
  - Defense / Completed
- Admins must be able to create and update milestones
- Public visibility can be configurable by item

## 9. Data Model Requirements

### Core Collections

- `users`
- `teams`
- `members`
- `projects`
- `publications`
- `news`
- `gallery`
- `phd_progress`
- `activity_logs`

### Recommended Relationships

- A `team` has many `members`
- A `team` has many `projects`
- A `team` has many `publications`
- A `member` belongs to one or more `teams`
- A `project` belongs to one primary `team`
- A `publication` can belong to one or more `teams`
- A `phd_progress` record belongs to a `member` and may reference a `project`

### Data Modeling Notes

- Use explicit references instead of duplicated free text where possible
- Keep denormalized display snapshots only where helpful for performance
- Preserve slugs for public URLs
- Include `createdAt` and `updatedAt` timestamps on all major collections
- Track `createdBy` and `updatedBy` for admin-managed entities where useful

## 10. API Requirements

### Suggested API Surface

#### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh` if token refresh is used

#### Teams

- `GET /api/teams`
- `GET /api/teams/:id`
- `POST /api/teams`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`

#### Members

- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`
- `GET /api/members/grouped`

#### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

#### Publications

- `GET /api/publications`
- `GET /api/publications/:id`
- `POST /api/publications`
- `PUT /api/publications/:id`
- `DELETE /api/publications/:id`
- `GET /api/publications/search`
- `GET /api/publications/:id/citation?format=bibtex`
- `GET /api/publications/:id/citation?format=apa`

#### News

- `GET /api/news`
- `GET /api/news/:id`
- `POST /api/news`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`

#### Gallery

- `GET /api/gallery`
- `GET /api/gallery/:id`
- `POST /api/gallery`
- `PUT /api/gallery/:id`
- `DELETE /api/gallery/:id`

#### PhD Progress

- `GET /api/phd-progress`
- `GET /api/phd-progress/:id`
- `POST /api/phd-progress`
- `PUT /api/phd-progress/:id`
- `DELETE /api/phd-progress/:id`

#### Users / Roles

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/status`
- `PATCH /api/users/:id/password`

## 11. Frontend Requirements

### Frontend Stack

- React
- Tailwind CSS 4
- `lucide-react` for icons
- Mobile-first responsive design

### Frontend Design Direction

The site should feel premium, institutional, and modern. It should avoid generic academic templates and instead present a confident research identity with strong typography, clear hierarchy, and polished content presentation.

### UX Principles

- Mobile-first layouts
- Fast scanning of dense academic content
- Clear separation between public browsing and admin workflows
- Accessible forms and table/filter patterns
- Strong search and filtering experience
- Consistent empty states, loading states, success states, and error states

### Page-Level UX Expectations

- Publications page must support fast filtering without confusing users
- Team pages must clearly separate roles instead of mixing all members together
- Admin forms must support validation, inline guidance, and safe destructive actions
- Citation export must feel immediate and obvious
- Progress timelines must be readable on both mobile and desktop

## 12. Non-Functional Requirements

### Performance

- Use pagination or lazy loading for large lists
- Optimize gallery and image delivery
- Avoid loading large admin bundles on public pages
- Keep search responsive

### Accessibility

- Semantic HTML
- Keyboard navigability
- Visible focus states
- Sufficient color contrast
- Accessible form labels and error messaging

### SEO

- Server-ready metadata strategy
- Clean URLs and slugs
- Proper page titles and descriptions
- Structured headings and crawlable public content

### Reliability

- Validation on both client and server
- Graceful fallback states for missing data
- Error boundaries in the frontend
- Logging and monitoring hooks for backend failures

### Security

- Secure auth implementation
- Restricted admin endpoints
- Input validation
- Rate limiting
- Secure environment variable handling
- Principle of least privilege

## 13. Technical Architecture Proposal

### Recommended Repository Structure

Use a full-stack structure such as:

```text
research-lab/
  client/
  server/
  shared/ (optional)
```

If a monorepo split is not desired immediately, the current root can temporarily remain the client and a `server/` folder can be added.

### Backend Proposal

- Node.js + Express
- MongoDB + Mongoose
- Validation with Zod, Joi, or express-validator
- Auth middleware
- RBAC middleware
- Centralized error handling

### Frontend Proposal

- React
- Tailwind CSS 4
- `lucide-react`
- Route-based page organization
- Shared UI primitives for cards, filters, tables, modals, and forms

## 14. Content Management Rules

- All public content should support draft/published state where applicable
- Destructive actions should require confirmation
- Important admin actions should be logged
- Forms should enforce required fields and URL/date validation
- Publication metadata should be normalized to reduce citation and search errors


## 16. Milestones

### Phase 1: Foundation

- Finalize PRD
- Define information architecture
- Define schemas and relationships
- Set up backend structure and environment configuration
- Implement auth and RBAC

### Phase 2: Core Public Experience

- Build public layout and navigation
- Build Home, About, Research Axes, Teams, Team Details, Publications, News, Gallery, and Contact pages
- Implement public APIs and data fetching

### Phase 3: Admin Portal

- Build dashboard and CRUD interfaces
- Implement content workflows for teams, members, projects, publications, news, and gallery

### Phase 4: Innovation Features

- Implement citation generator
- Implement PhD progress tracker

### Phase 5: Production Hardening

- Testing
- Accessibility review
- Performance tuning
- Security review
- Deployment readiness
