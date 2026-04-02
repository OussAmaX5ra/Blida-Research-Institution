# Admin Portal Information Architecture

## Purpose

This document defines the implementation-level information architecture for the admin portal of the Blida Research Lab Institutional Site. It translates the PRD into a concrete admin structure that can be used for routing, permissions, layouts, CRUD workflows, and backend/API planning.

## Core Objectives

- Give authorized staff a secure and efficient workspace to manage the full website
- Separate management responsibilities by domain: teams, members, projects, publications, news, gallery, and users
- Keep high-frequency workflows easy to access from the dashboard and sidebar
- Support production-grade operational tasks such as publishing, validation, auditing, and role-based access

## Admin User Types

### Super Admin

- Full access to all portal sections
- Can manage users, roles, settings, and content
- Can view activity logs and security-sensitive actions

### Content Admin

- Full access to content sections
- Can manage teams, members, projects, publications, news, gallery, and PhD progress
- Cannot manage system settings or user roles unless explicitly granted

### Editor

- Can create and update assigned content
- May have limited delete or publish permissions depending on final RBAC rules
- Cannot access user management or system settings

## Portal Structure

The admin portal should be organized around a persistent application shell:

- Top bar
- Left sidebar navigation
- Main content panel
- Contextual action bar on data-heavy pages
- Notification/toast layer

## Primary Navigation Model

### Level 1 Navigation

1. Dashboard
2. Research Structure
3. Scientific Output
4. Content
5. Administration
6. System

### Navigation Group Breakdown

#### Dashboard

- Overview
- Recent activity
- Quick actions

#### Research Structure

- Teams
- Members
- Projects
- PhD Progress

#### Scientific Output

- Publications
- Citation tools (can be embedded inside Publications rather than a separate page)

#### Content

- News
- Gallery
- Site Pages

#### Administration

- Users
- Roles and permissions
- Audit log

#### System

- Settings
- Profile
- Logout

## Route Map Proposal

### Shell Routes

- `/admin`
- `/admin/login`
- `/admin/forbidden`

### Dashboard

- `/admin/dashboard`

### Teams

- `/admin/teams`
- `/admin/teams/new`
- `/admin/teams/:teamId`
- `/admin/teams/:teamId/edit`

### Members

- `/admin/members`
- `/admin/members/new`
- `/admin/members/:memberId`
- `/admin/members/:memberId/edit`

### Projects

- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/:projectId`
- `/admin/projects/:projectId/edit`

### Publications

- `/admin/publications`
- `/admin/publications/new`
- `/admin/publications/:publicationId`
- `/admin/publications/:publicationId/edit`

### PhD Progress

- `/admin/phd-progress`
- `/admin/phd-progress/new`
- `/admin/phd-progress/:progressId`
- `/admin/phd-progress/:progressId/edit`

### News

- `/admin/news`
- `/admin/news/new`
- `/admin/news/:newsId`
- `/admin/news/:newsId/edit`

### Gallery

- `/admin/gallery`
- `/admin/gallery/new`
- `/admin/gallery/:mediaId`
- `/admin/gallery/:mediaId/edit`

### Users

- `/admin/users`
- `/admin/users/new`
- `/admin/users/:userId`
- `/admin/users/:userId/edit`

### Roles / Permissions

- `/admin/roles`

### Audit

- `/admin/audit-log`

### Settings

- `/admin/settings`
- `/admin/profile`

## Page Types

The portal should use a consistent set of page types:

### 1. Index / List Pages

Used for browsing entities in tables or cards with:

- Search
- Filter bar
- Sort controls
- Pagination
- Bulk actions where appropriate
- Primary CTA such as `Add Team` or `Add Publication`

### 2. Create Pages

Dedicated forms for creating new records with:

- Inline validation
- Required-field indicators
- Save draft and publish options where relevant
- Cancel action

### 3. Detail Pages

Read-oriented pages showing:

- Entity summary
- Metadata
- Linked relationships
- Recent updates
- Secondary actions such as edit, publish, archive, delete

### 4. Edit Pages

Structured forms with:

- Pre-filled data
- Change tracking awareness where possible
- Validation and submission states
- Destructive actions separated from primary editing actions

## Dashboard Architecture

### Dashboard Sections

- KPI cards
- Recent activity timeline
- Quick create shortcuts
- Content health panel
- Pending action panel

### KPI Cards

- Total teams
- Total members
- Total active projects
- Total publications
- Total news posts
- Total gallery items

### Recent Activity

Display recent admin actions such as:

- Team created
- Publication updated
- News published
- User role changed

### Quick Actions

- Add Team
- Add Member
- Add Project
- Add Publication
- Add News
- Add Gallery Item
- Add PhD Progress Entry

### Content Health Panel

Highlight operational issues:

- Unpublished drafts
- Missing required metadata
- Broken or empty PDF links
- Publications missing tags or teams
- Projects without assigned teams

## Domain Sections

### Teams Section

#### Purpose

Manage research teams and their structure.

#### Required Views

- Teams list
- Team detail
- Team create
- Team edit

#### List Page Modules

- Search by team name or focus
- Filter by status
- Sort by name, updated date, or number of members
- Table columns:
  - Team name
  - Leader
  - Research focus
  - Members count
  - Projects count
  - Status
  - Last updated

#### Team Detail Modules

- Team summary
- Leader information
- Members by role
- Linked projects
- Linked publications
- Activity history

### Members Section

#### Purpose

Manage all people records independently from teams.

#### Required Role Separation

- Professor
- Doctor
- PhD Student

#### Required Views

- Members list
- Member detail
- Member create
- Member edit

#### List Page Modules

- Search by name
- Filter by role
- Filter by team
- Filter by research theme
- Sort by display order or updated date

#### Member Detail Modules

- Profile summary
- Role
- Team assignments
- Research interests
- Linked projects
- Linked publications
- PhD progress record if applicable

### Projects Section

#### Purpose

Manage scientific projects and their relation to teams and researchers.

#### Required Views

- Projects list
- Project detail
- Project create
- Project edit

#### List Page Modules

- Search by title
- Filter by status
- Filter by team
- Filter by year

#### Project Detail Modules

- Project metadata
- Team association
- Lead researcher
- Milestones
- Related members
- Related publications
- Related PhD progress

### Publications Section

#### Purpose

Manage the lab's scientific output and the metadata required for search and citation export.

#### Required Views

- Publications list
- Publication detail
- Publication create
- Publication edit

#### List Page Modules

- Full-text search
- Filters for year, publisher, team, author, and theme
- Sort by year, title, or updated date
- Status indicator

#### Publication Detail Modules

- Publication metadata
- Author list
- Publisher details
- Team links
- Theme tags
- PDF link
- Citation preview
- Citation export actions

### PhD Progress Section

#### Purpose

Track milestone-based progress for PhD students and related research work.

#### Required Views

- Progress list
- Progress detail
- Progress create
- Progress edit

#### Detail Modules

- Student summary
- Related project
- Timeline milestones
- Current stage
- Visibility status
- Last updated

### News Section

#### Purpose

Manage public news posts and announcements.

#### Required Views

- News list
- News detail
- News create
- News edit

#### Detail Modules

- Headline
- Summary
- Featured image
- Publish state
- Publication date
- Full story body

### Gallery Section

#### Purpose

Manage the media library displayed on the public website.

#### Required Views

- Gallery list
- Gallery detail
- Gallery create
- Gallery edit

#### List Modules

- Grid and table toggle
- Filter by category
- Filter by date
- Preview thumbnail

### Users Section

#### Purpose

Manage admin accounts and permissions.

#### Required Views

- Users list
- User detail
- User create
- User edit

#### User Detail Modules

- Identity details
- Role
- Account status
- Last login
- Security actions

### Audit Log Section

#### Purpose

Provide accountability and traceability for high-impact admin actions.

#### Required Modules

- Filter by user
- Filter by entity type
- Filter by action type
- Filter by date range
- Event detail preview

## Shared UX Patterns

### Table Pattern

All admin list pages should support:

- Search
- Filters
- Sort
- Pagination
- Empty state
- Loading state
- Error state

### Form Pattern

All create/edit pages should support:

- Required fields
- Inline errors
- Dirty state awareness
- Save button
- Save and continue editing option where useful
- Cancel button
- Delete action separated from the primary save flow

### Confirmation Pattern

Require confirmation for:

- Delete actions
- Publish/unpublish actions
- Role changes
- Password resets

### Status Pattern

Use consistent badges for:

- Draft
- Published
- Archived
- Active
- Inactive
- Pending

## Cross-Linking Rules

To improve admin efficiency, entity detail pages should link to related records:

- Team details link to members, projects, and publications
- Member details link to teams, projects, publications, and PhD progress
- Project details link to team, lead member, and related progress
- Publication details link to teams and authors where modeled
- PhD progress details link to student and project

## Permission Matrix Summary

### Super Admin

- Full access to all sections and actions

### Content Admin

- Full access to content sections
- Read-only or no access to users, roles, and system settings depending on final security policy

### Editor

- Access to create/edit content in assigned sections
- Restricted delete, publish, and system actions

## Recommended Build Order

1. Admin shell and protected routing
2. Dashboard
3. Teams
4. Members
5. Projects
6. Publications
7. News
8. Gallery
9. PhD Progress
10. Users and roles
11. Audit log
12. Settings

## Acceptance Criteria

This task is considered complete when:

- The admin portal has a clear navigation hierarchy
- All major admin sections have named routes
- Each section has defined page types and responsibilities
- Shared CRUD patterns are standardized
- Role-sensitive sections are clearly identified
- The document is detailed enough to guide frontend routes and backend resource ownership
