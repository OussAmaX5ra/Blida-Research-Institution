# Publication Citation Metadata Requirements

## Overview

This document defines the metadata fields required to generate accurate BibTeX and APA citations from publication records.

## Required Metadata Fields

For citation generation to work correctly, publications must store the following fields:

| Field | Type | Required | Description |
|------|-----|----------|--------------|
| `title` | string | yes | Publication title |
| `authors` | array of objects | yes | Ordered list of authors |
| `publisher` | string | yes | Journal or conference name |
| `year` | number | yes | Publication year |
| `doi` | string | no | Digital Object Identifier |
| `volume` | string | no | Journal volume number |
| `issue` | string | no | Journal issue number |
| `pages` | string | no | Page range (e.g., "1-15") |
| `pdfLink` | string | no | URL to PDF |

## Author Object Structure

Each author in the `authors` array must contain:

| Field | Type | Required | Description |
|------|-----|----------|--------------|
| `displayName` | string | yes | Full name for citation display |
| `firstName` | string | no | First/given name |
| `lastName` | string | no | Last/family name |

## Citation Formats

### BibTeX

The generated BibTeX entry follows this template:

```
@article{KEY,
  author = {Author1 and Author2 and Author3},
  title = {Title},
  journal = {Journal},
  year = {YYYY},
  volume = {V},
  number = {N},
  pages = {PP},
  doi = {DOI}
}
```

Key format: FirstAuthorLastNameYear (e.g., `smith2025`)

### APA 7th Edition

The generated APA citation follows this template:

```
Author1, F. M., Author2, F. M., & Author3, F. M. (Year). Title. Journal, Volume(Issue), Pages. https://doi.org/DOI
```

- Authors separated by commas, use `&` before last author
- First names use initials
- Year in parentheses
- Journal in italics
- DOI linked if available

## API Endpoints

- `GET /api/publications/:id/citation?format=bibtex` - Returns BibTeX citation
- `GET /api/publications/:id/citation?format=apa` - Returns APA citation

## Implementation Notes

- Authors should be stored as objects with `displayName`, `firstName`, `lastName`
- Generate citation on-demand from stored data, not pre-computed
- Handle missing optional fields gracefully in citation output
- Author names should be citation-safe (no special characters that break BibTeX)