# Public UI Direction

## Purpose

This document defines the visual direction for the public-facing website before page-by-page implementation begins. It exists to keep Milestone 2 builds consistent, distinctive, and intentionally separate from the older one-page prototype components.

## Build Principle

The public pages should be built from scratch within the new public shell and route structure.

- Do not extend the old section components as the basis for the new public pages
- Do not treat the earlier landing-page composition as the canonical design
- Reuse only stable assets, content, and data where useful
- Treat the current shell, route map, and design tokens as the foundation for new page work

## Experience Goal

The site should feel like a serious institutional research platform with editorial confidence rather than a generic academic brochure.

The visual experience should communicate:

- credibility
- clarity
- scientific depth
- institutional maturity
- modern polish

## Chosen Aesthetic Direction

The public site should follow an `editorial research atlas` direction.

This means:

- structured like a publication rather than a marketing landing page
- calm and premium, not flashy or startup-like
- asymmetrical layouts used deliberately to create hierarchy
- dense but readable information blocks
- subtle cartographic and archival cues in lines, dividers, overlays, and section framing

## Memorable Signature

The distinctive visual signature should be:

- layered paper-like surfaces over a quiet research-grid atmosphere
- strong display typography paired with restrained body text
- dark scientific inset panels used to highlight metadata, relationships, and institutional signals

The user should remember the site as:

`the research website that feels like an institutional journal or atlas`

## Typography Direction

Typography should do most of the branding work.

- Display type should feel scholarly, elegant, and confident
- Body type should feel modern, neutral, and highly readable
- Headings should use strong vertical rhythm and visible hierarchy
- Eyebrows, metadata labels, and breadcrumbs should use disciplined uppercase tracking

Implementation notes:

- Keep `Playfair Display` as the display family for now
- Keep `DM Sans` as the body family for now
- Avoid introducing generic fallback-driven aesthetics in new pages
- Use large display headlines sparingly and intentionally

## Color Direction

The palette should stay grounded in institutional tones:

- `ink` for seriousness and contrast
- `surface` and `surface-alt` for paper-like reading areas
- `teal` for research/navigation accents
- `gold` for institutional emphasis and premium cues
- `rust` for warnings, exceptions, or not-found states

Color usage rules:

- Most pages should remain light overall
- Dark sections should be used as contrast moments, not the default page mode
- Gold should be selective and meaningful rather than decorative everywhere
- Teal should carry most interactive and navigational emphasis

## Layout Principles

The public site should use a predictable but expressive structure.

- Each page should have a strong opening frame
- Content should be grouped into clearly bounded sections
- Important sections should mix narrative copy with metadata panels
- Listing pages should feel curated, not like raw database dumps
- Detail pages should balance story, metadata, and related entities

Composition rules:

- Prefer asymmetry over perfectly centered layouts
- Use negative space generously around headings and transitions
- Let one supporting panel or aside create tension in major page sections
- Avoid stacking too many equal-width cards without hierarchy

## Component Direction

The following shared component tone should guide all new public pages:

### Header

- quiet glass-like surface
- strong typographic identity
- utility admin entry visually separated from academic navigation

### Footer

- darker institutional tone
- concise link structure
- reinforces the public/admin boundary

### Hero Areas

- editorial headline treatment
- one strong content panel paired with one compact metadata block
- no generic centered marketing hero

### Listing Cards

- should feel archival and curated
- use clean borders, subtle elevation, and disciplined metadata
- avoid loud gradients or startup-card aesthetics

### Detail Pages

- should read like institutional records with narrative framing
- metadata should live in dark or bordered companion panels
- related content should be clearly grouped by relationship type

## Motion Direction

Motion should be restrained and deliberate.

- use subtle fades, rises, and hover lifts
- prioritize entry rhythm and hierarchy cues
- avoid excessive animated decorations
- animations should support readability, not compete with content

## Background And Texture Direction

The background system should remain subtle and atmospheric.

- paper-toned surfaces
- faint radial lighting in corners
- restrained grid or noise textures
- layered panels that imply depth without becoming glossy

Avoid:

- purple gradients
- glassmorphism-heavy page bodies
- overly futuristic neon treatments
- decorative shapes that do not support content hierarchy

## Content Presentation Rules

Academic content should feel easy to scan.

- titles should be crisp and prominent
- summaries should remain compact
- metadata should be grouped consistently
- filters and search areas should look like research tools, not ecommerce controls
- relationship sections should always explain why linked items matter

## Responsive Direction

Responsive behavior should preserve hierarchy, not just shrink layouts.

- major two-column sections should collapse into a clear reading order
- metadata panels should move beneath core narrative when needed
- mobile navigation should remain simple and authoritative
- small screens should still feel premium, not stripped down

## Anti-Patterns

Do not build future pages using:

- the old long-scroll landing-page section composition
- repeated full-width card grids with no pacing
- generic startup heroes with centered CTA stacks
- random accent colors per section
- decorative visuals that dilute institutional credibility

## Application To The Next Step

When building the Home page:

- start from a new page composition inside the current public shell
- do not revive the old `Hero`, `Ticker`, `Teams`, `Members`, `NewsGallery`, or `Contact` components as the design basis
- use this direction document as the visual brief
- keep the Home page as the first full proof of the `editorial research atlas` direction
