# Public Website Information Architecture

## Purpose

This document defines the public-facing information architecture for the Blida Research Institute platform and separates what is implemented now from what remains planned.

## Current Public Experience

The public site currently includes these implemented routes:

- `/`
- `/about`
- `/research-axes`
- `/teams`
- `/teams/:slug`
- `/members`
- `/projects`
- `/publications`
- `/publications/:slug`
- `/news`
- `/news/:slug`
- `/gallery`
- `/contact`
- `/admin/login`

## Current Routing Notes

- The site uses a custom client-side routing layer rather than `react-router`.
- Detail pages are currently implemented for teams, publications, and news.
- Member detail and project detail pages are not yet implemented and should not be treated as active public routes.
- Unknown routes fall back to the shared public shell instead of a blank screen.

## Current Data Model In The Public UI

- Core public collections fetch from backend endpoints under `/api/*`.
- Those endpoints are currently backed by shared mock data rather than MongoDB collections.
- Shared institutional framing content such as mission copy, contact details, and research-axis descriptors still comes from shared static modules.
- The current milestone should therefore be read as API-driven for teams, members, projects, publications, news, and gallery, but not yet database-backed.

## Current Public UX Notes

- SEO-ready page titles, descriptions, canonical tags, and robots directives are implemented through the client-side metadata layer.
- The public experience is responsive across mobile, tablet, and desktop breakpoints.

## Implemented Top-Level Navigation

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

The admin entry stays in utility navigation through `/admin/login`.

## Implemented Page Coverage

### Home

- Hero, mission, statistics, featured teams, publications, news, gallery preview, and collaboration CTA

### About

- Mission, vision, institutional framing, and lab positioning

### Research Axes

- Curated institutional page for the lab's major scientific directions

### Teams

- Team listing and team detail page
- Team detail groups members by role and links projects, publications, and related news

### Members

- Searchable and filterable member directory
- No individual member detail page yet

### Projects

- Searchable and filterable project catalogue
- No individual project detail page yet

### Publications

- Searchable library and publication detail page
- Detail page includes citation export actions in the frontend

### News

- News listing and news detail page

### Gallery

- Public gallery listing page

### Contact

- Institutional contact page

### Admin Login

- Public-facing login entry for administrators

## Planned Extensions

These remain part of the product direction but are not implemented yet:

- `/members/:slug`
- `/projects/:slug`
- Database-backed public collections
- Dedicated public 404 page content beyond the shared route fallback

## Decision Summary

- The implemented public site is broad but not fully complete.
- The route map is now documented according to what actually renders today.
- Member and project detail pages remain planned extensions, not shipped functionality.
