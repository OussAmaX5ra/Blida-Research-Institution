# PhD Progress Schema Specification

## Overview

This document defines the schema and data model for tracking PhD student progress through milestones.

## Schema: `phd_progress`

### Purpose

Track PhD student progress through research milestones with timestamps, notes, and related project linking.

### Fields

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `slug` | string | yes | Unique identifier |
| `title` | string | yes | Milestone title |
| `description` | string | no | Detailed description |
| `memberSlug` | string | yes | Associated PhD student (ref: members) |
| `projectSlug` | string | no | Associated project (ref: projects) |
| `teamSlug` | string | no | Associated team (ref: teams) |
| `status` | enum | yes | Status: `Pending`, `In Progress`, `Completed`, `Deferred` |
| `milestoneType` | enum | yes | Type: `Coursework`, `Qualifying`, `Comprehensive`, `Proposal`, `Research`, `Defense`, `Other` |
| `dueDate` | date | no | Target completion date |
| `completedAt` | date | no | Actual completion date |
| `visibility` | enum | yes | Visibility: `Public`, `Private` (default: `Private`) |
| `notes` | array | no | Array of note objects |
| `attachments` | array | no | Array of resource links |
| `createdBy` | ObjectId | no | Created by user (ref: users) |
| `updatedBy` | ObjectId | no | Updated by user (ref: users) |
| `createdAt` | date | yes | Creation timestamp |
| `updatedAt` | date | yes | Update timestamp |

### Note Object

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `content` | string | yes | Note content |
| `author` | string | no | Author name |
| `createdAt` | date | yes | Note timestamp |

### Link Object

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `label` | string | yes | Link label |
| `url` | string | yes | URL |
| `kind` | enum | no | Type: `pdf`, `presentation`, `document`, `other` |

## API Endpoints

- `GET /api/phd-progress` - List all progress records (filtered by visibility)
- `GET /api/phd-progress/:identifier` - Get single progress record
- `POST /api/admin/content/phd-progress` - Create progress record (admin only)
- `PUT /api/admin/content/phd-progress/:id` - Update progress record (admin only)
- `DELETE /api/admin/content/phd-progress/:id` - Delete progress record (admin only)

## Milestone Types

1. **Coursework** - Graduate course requirements
2. **Qualifying** - Qualifying examinations
3. **Comprehensive** - Comprehensive examinations
4. **Proposal** - Dissertation proposal defense
5. **Research** - Primary research completion
6. **Defense** - Final dissertation defense
7. **Other** - Other milestones

## Status Flow

- `Pending` → `In Progress` → `Completed`
- Any status can be set to `Deferred`

## Public Visibility

- Only records with `visibility: "Public"` are exposed via public API
- Admin users can see all records regardless of visibility