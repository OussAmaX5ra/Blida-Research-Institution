# Public Website Information Architecture

## Purpose

This document defines the implementation-level information architecture for the public-facing website of the Blida Research Lab platform. It translates the PRD into a concrete structure that can guide frontend routing, layout planning, content modeling, and public API design.

## Core Objectives

- Present the lab as a credible and modern research institution
- Make the main scientific content easy to browse, search, and understand
- Surface teams, members, projects, publications, news, and media through a clear navigation model
- Keep public discovery flows intuitive on desktop and mobile
- Support clean URLs, strong SEO structure, and reusable page patterns

## Primary Audiences

### Prospective Students

- Need to understand research areas, teams, members, and PhD opportunities

### Researchers and Academic Partners

- Need to discover publications, projects, team focus areas, and collaboration signals

### University Leadership and Institutional Stakeholders

- Need a high-level view of the lab, its structure, activity, and scientific output

### General Public and Media Visitors

- Need an accessible overview of the lab, its news, and public-facing achievements

## Site Structure

The public website should be organized around a simple top-level information architecture:

1. Home
2. About the Lab
3. Research Axes
4. Research Teams
5. Team Details
6. Members Directory
7. Member Details
8. Projects
9. Project Details
10. Publications
11. Publication Details
12. News
13. News Details
14. Gallery
15. Contact
16. Admin Login

## Navigation Model

### Primary Navigation

- Home
- About
- Research Axes
- Teams
- Members
- Projects
- Publications
- News
- Gallery
- Contact

### Secondary Navigation

- Team details breadcrumbs
- Member details breadcrumbs
- Project details breadcrumbs
- Publication details breadcrumbs
- News details breadcrumbs
- Contextual filters on listing pages
- Admin login entry in the utility area rather than the primary academic navigation

### Footer Navigation

- About the Lab
- Research Teams
- Publications
- News
- Gallery
- Contact
- Admin Login

## Route Map Proposal

- `/`
- `/about`
- `/research-axes`
- `/teams`
- `/teams/:slug`
- `/members`
- `/members/:slug`
- `/projects`
- `/projects/:slug`
- `/publications`
- `/publications/:slug`
- `/news`
- `/news/:slug`
- `/gallery`
- `/contact`
- `/admin/login`

The public website should not expose admin entry through a generic `/login` route. Using `/admin/login` keeps the admin boundary visually and structurally separate from the academic browsing experience.

## Layout System

The public website should use a consistent shell built from:

- Global header with main navigation
- Responsive mobile navigation
- Main content area
- Reusable section container system
- Global footer with institutional links and contact shortcuts

## Page Architecture

### Home

- Hero section introducing the lab identity
- Mission and positioning summary
- Key statistics or highlights
- Featured research teams
- Featured publications
- Latest news preview
- Gallery preview
- Contact or collaboration call to action

### About the Lab

- Mission
- Vision
- History or institutional context
- Values
- Research axes summary

### Research Axes

- Overview of the lab's major scientific themes
- Clear grouping of focus areas
- Links to related teams, members, projects, or publications where relevant

For the first implementation, research axes should be treated as a curated institutional page at `/research-axes` rather than a dynamic entity with its own slug route. If axes later become database-managed records, the route model can expand to `/research-axes/:slug`.

### Research Teams Listing

- Team cards in a responsive grid or list
- Team name
- Research focus
- Team leader
- Member counts by role
- Active project count
- Link to team details

### Team Details

- Team identity and summary
- Research focus and themes
- Team leader
- Members grouped by role
- Linked projects
- Related publications
- Optional related gallery or news references

### Members Directory

- Search by name
- Filter by role
- Filter by team
- Filter by research theme when data supports it
- Member cards with core profile information and team associations

### Member Details

- Full profile summary
- Role and academic title
- Team memberships
- Research interests
- Related projects
- Related publications
- Optional PhD progress reference when applicable

### Projects

- Project listing with summary cards or rows
- Filters by team, status, theme, and year
- Visibility of lead member and related team
- Optional links into related PhD progress context when applicable

### Project Details

- Project identity and summary
- Team and lead member context
- Status and timeline
- Milestones
- Related members
- Related publications
- Optional related PhD progress links

### Publications

- Searchable and filterable publication library
- Filters for query, year, team, publisher, author, and theme
- Publication cards showing title, authors, year, publisher, and team context
- Direct links to publication details and external resources

### Publication Details

- Full citation metadata
- Abstract or summary
- Authors
- Team links
- External links such as PDF or DOI
- Citation export actions for BibTeX and APA

### News Listing

- Chronological news feed
- Featured image, title, summary, and publication date
- Optional category or related-entity context

### News Details

- Headline
- Publication date
- Featured image
- Full article body
- Optional links to related team, project, publication, or PhD progress content

### Gallery

- Responsive media gallery
- Category grouping or filters when useful
- Media thumbnails with captions and dates
- Future-friendly support for team- or project-linked media
- Use pagination, load-more, or infinite-scroll behavior intentionally rather than rendering the full media library at once
- The first implementation should prefer paginated or load-more fetching so large galleries remain performant and mobile-friendly

### Contact

- Official contact details
- Email and phone
- Physical location
- Optional map embed
- Clear instructions for collaboration or outreach

### Admin Login

- Public-facing entry point for authorized admins
- Minimal interface separate from the main academic browsing flow

## Shared Page Patterns

The public website should reuse a small set of predictable page types:

### Listing Pages

- Support search, filters, sorting, loading states, and empty states where appropriate

### Detail Pages

- Present canonical entity content using clean slugs and relationship-driven sections

### Not Found and Error States

- Unknown public routes should render a styled site-wide `404` page rather than a blank or broken screen
- Missing entity slugs such as `/publications/nonexistent-slug` should render a contextual not-found state inside the public shell
- Data-loading failures should show resilient error states with retry guidance where appropriate

### Institutional Pages

- Present curated narrative content with strong visual hierarchy and clear calls to action

## Content Relationships

- Teams should link to their members, projects, and publications
- Members should expose role and team relationships
- Publications should link to related teams and optionally member profiles through authorship
- News may reference teams, members, projects, publications, or PhD progress records
- Gallery items may optionally connect to teams or projects for filtered browsing

## URL and SEO Conventions

- Public entity detail pages should use slugs instead of ids
- Page titles and metadata should reflect the primary entity or page purpose
- Listing pages should support crawlable, descriptive paths
- Breadcrumbs should be used on detail pages where they improve orientation
- Admin entry should remain outside the public academic route language through `/admin/login`

## Data Requirements by Route

- Home needs aggregate summaries plus selected featured content
- Listing pages need paginated public data endpoints with filtering support
- Detail pages need fully resolved entity relationships for public display
- Navigation and footer should rely on stable public routes, not admin-oriented structures

## Decision Summary

- The public website uses a clear institutional navigation model
- Public routes are organized around entity listing and detail pages
- Teams, members, projects, publications, news, and gallery are first-class public content domains
- Clean slugs, reusable page patterns, and relationship-driven content shape the frontend implementation
