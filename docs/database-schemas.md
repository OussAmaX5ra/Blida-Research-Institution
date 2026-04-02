# Database Schemas

This document defines the MongoDB collections and fields for the Blida Research Lab Institutional Site. It is written to guide Mongoose schema implementation and API validation rules.

## Shared Conventions

- All collections use `_id` as ObjectId.
- All collections include `createdAt` and `updatedAt`.
- All public-facing entities include `slug` for clean URLs.
- All admin-managed entities include `createdBy` and `updatedBy` where practical.
- All soft-deletable mutable collections include optional `deletedAt`.
- Soft delete should be the default removal strategy for admin-managed content records; user accounts are lifecycle-managed through `status` instead.

## Slug, Timestamp, and Audit Field Conventions

### Slug Conventions

- `slug` is required for all public-facing collections: `teams`, `members`, `projects`, `publications`, `news`, and `gallery`.
- `users`, `phd_progress`, and `activity_logs` do not need slugs because they are not primary public URL resources.
- Slugs should be lowercase and use only letters, numbers, and hyphens.
- Slugs should be generated from the primary display field for the entity:
  - `teams.name`
  - `members.fullName`
  - `projects.title`
  - `publications.title`
  - `news.headline`
  - `gallery.title`
- Generation rules should:
  - trim whitespace
  - transliterate accented or non-Latin characters where possible
  - replace spaces and punctuation with hyphens
  - collapse repeated hyphens
  - remove leading and trailing hyphens
- Slugs must be unique per collection, not globally across the whole database.
- Reserved route words such as `admin`, `api`, `login`, `search`, `new`, and `edit` should not be allowed as final slugs.
- Manual slug overrides are allowed, but the same normalization and reserved-word validation still applies.
- Slugs should be treated as stable identifiers after first publication. If a slug must change later, that change should be rare, intentional, and recorded in the audit log.

### Timestamp Conventions

- All timestamps should be stored in UTC in MongoDB.
- Field names ending in `At` represent a precise point in time, for example `createdAt`, `updatedAt`, `deletedAt`, `publishedAt`, and `lastLoginAt`.
- Field names ending in `Date` represent domain dates where calendar meaning matters more than exact request time, for example `startDate`, `endDate`, and `shotDate`.
- `createdAt` is set once on insert and must be immutable afterward.
- `updatedAt` is updated automatically on every successful create, update, publish, archive, restore, or soft-delete operation.
- `deletedAt` is null or absent for active records and set to the UTC deletion time for soft-deleted records.
- Soft-deletable collections should include an index on `deletedAt` to support active-record and restore workflows efficiently.
- Semantic timestamps such as `publishedAt` or `lastLoginAt` do not replace `updatedAt`; both should be maintained when applicable.
- API responses should serialize timestamps as ISO 8601 strings.
- Sorting defaults should prefer:
  - public listings: semantic timestamps like `publishedAt` when relevant
  - admin listings: `updatedAt` descending unless a stronger domain-specific field is needed

### Audit Field Conventions

- `createdBy` and `updatedBy` should be present on admin-managed mutable entities wherever those fields exist in the schema.
- On create, `createdBy` and `updatedBy` should both be set to the authenticated actor.
- On update, `createdBy` must remain unchanged and `updatedBy` must be replaced with the current actor.
- On soft delete, restore, publish, archive, or status transitions, `updatedBy` must be updated to the acting user.
- `createdBy` and `updatedBy` may be null only for seed data, one-time imports, or system maintenance jobs where no authenticated human actor exists.
- `activity_logs.actorUserId` is the canonical audit actor field for recorded events and should align with the user written to `createdBy` or `updatedBy` when the event mutates a document.
- Audit log action names should use a stable `domain.verb` format such as `team.create`, `member.update`, `publication.publish`, `news.archive`, or `auth.login`.
- `beforeSnapshot` and `afterSnapshot` should be captured for destructive or high-impact changes when feasible, especially delete, restore, publish, role changes, and sensitive settings changes.
- Sensitive values such as `passwordHash`, session tokens, password reset secrets, and raw authentication cookies must never be stored in audit snapshots.
- Audit logging should be best-effort but not silent: if log creation fails for a sensitive action, the backend should surface the failure and decide explicitly whether the underlying action can proceed.

## Entity Relationships and Data Ownership Rules

### Relationship Principles

- References must point to existing documents only; free-text duplication should be avoided when an entity already exists in another collection.
- Each relationship should have one canonical owner for writes, even if the reverse side is stored for fast reads or admin convenience.
- Reverse reference arrays should be treated as derived mirrors and kept in sync in the service layer, not edited independently in conflicting ways.
- Public pages should resolve relationship data from references at read time or from controlled denormalized snapshots, never from manually duplicated strings.

### Canonical Ownership by Relationship

- `teams` to `members`: many-to-many. Canonical owner is `members.teamIds`. `teams.memberIds` is a derived mirror for easier team-centric reads.
- `teams` to `leaderMemberId`: one optional leader per team. Canonical owner is `teams.leaderMemberId`, and the referenced member must also belong to that team through `members.teamIds`.
- `teams` to `projects`: one-to-many. Canonical owner is `projects.teamId`. `teams.projectIds` is a derived mirror.
- `teams` to `publications`: many-to-many. Canonical owner is `publications.teamIds`. `teams.publicationIds` is a derived mirror.
- `projects` to `members`: one optional lead member per project through `projects.leadMemberId`. This does not replace team membership and should point to a member who belongs to the owning team unless there is an explicit cross-team collaboration rule later.
- `phd_progress` to `members`: one-to-one in normal operation. Canonical owner is `phd_progress.memberId`, and the referenced member must have role `phd_student`. A member should have at most one active progress record.
- `phd_progress` to `projects`: optional many-to-one through `phd_progress.projectId`. Canonical owner is `phd_progress.projectId`.
- `users` to `members`: optional one-to-one profile bridge through `users.memberId`. Canonical owner is `users.memberId` for login-to-profile linkage.
- `users` to admin-managed records: audit relationship only through `createdBy` and `updatedBy`. The business entity owns its own content; the user reference only records authorship and the latest updater.
- `activity_logs` to all entities: append-only audit references through `actorUserId`, `entityType`, and `entityId`. Logs are never the source of truth for current entity state.

### Entity-Level Ownership Rules

#### users

- Own authentication credentials, role, status, and profile fields for admin access.
- May optionally link to one `members` record through `memberId` when an admin account represents a real lab member.
- Must not be soft-deleted or hard-deleted in normal operation once referenced by `createdBy`, `updatedBy`, or `activity_logs`; use `inactive` or `locked` status instead.

#### teams

- Own team identity, public description, research focus, themes, status, and the optional team leader assignment.
- Team leader assignment must be validated only after the referenced member already belongs to the team in the same transaction or in existing persisted data.
- Do not own the canonical member, project, or publication relationship writes; those are owned by `members.teamIds`, `projects.teamId`, and `publications.teamIds`.

#### members

- Own person identity, role, profile metadata, and canonical team membership through `teamIds`.
- A `professor`, `doctor`, or `phd_student` record may exist without a user account.
- If a member is assigned as `leaderMemberId` or `leadMemberId`, those references must be cleared or reassigned before deletion.

#### projects

- Own project identity, lifecycle state, timeline, milestones, and canonical team assignment through `teamId`.
- May optionally own the lead researcher assignment through `leadMemberId`.
- Own date integrity rules; `endDate` must not be earlier than `startDate`.
- Related publication links should be resolved by queries or introduced later through an explicit join rule, not inferred from text.

#### publications

- Own citation metadata, external resource links, and canonical team associations through `teamIds`.
- Own an ordered author list where each author keeps a citation-safe display name and may optionally link to a `members` record.
- Public citations should be generated from stored author display names, not reconstructed from member profiles.

#### news

- Own their own publishing lifecycle and may optionally link to one related domain entity through a polymorphic reference.

#### gallery

- Own their own media metadata and publishing lifecycle.
- May optionally link to a related team or project for future filtered gallery views.
- If both `teamId` and `projectId` are set, `teamId` must match the owning team of the referenced project.
- If only `projectId` is set, team context may be resolved through the project at read time.

#### phd_progress

- Own stage history, visibility, and the current stage for one PhD student.
- Must reference a `members` record with role `phd_student`.
- May reference one related project, but the progress record remains owned by the student relationship, not the project.

#### activity_logs

- Own immutable audit events only.
- Should be append-only and never edited from the admin UI except for privileged internal maintenance if that is ever introduced.
- `entityId` should be present for entity-targeted actions and may be null only for system-level events such as login, logout, token refresh, or access denial logging.

### Write and Deletion Rules

- Relationship updates should be performed through the canonical owner and then synchronized to any mirrored arrays in the same transaction or service operation.
- Team creation and member assignment flows must support the leader assignment order explicitly: assign the member to the team first, then set `leaderMemberId` in the same service operation or a later update.
- Soft delete should be used by default for teams, members, projects, publications, news, gallery items, and PhD progress records when removal is needed.
- User accounts should be deactivated or locked through `status` instead of using `deletedAt`.
- A team should normally be archived instead of deleted if it still has linked members, projects, publications, or historical public URLs worth preserving.
- A member should not be deleted while referenced as a team leader, project lead, or PhD progress owner; those links must be removed or reassigned first.
- A project can be deleted only after dependent `phd_progress.projectId` references are cleared or reassigned.
- A publication can be deleted after its team mirrors are synchronized; citation exports should fail gracefully if the record no longer exists.
- A user should be deactivated instead of deleted to preserve audit trails and historical `createdBy` and `updatedBy` references.

### Validation Implications

- `teams.leaderMemberId` must reference a member whose `teamIds` includes that team.
- `teams.leaderMemberId` cannot be set unless team membership already exists in the same validated write path.
- `projects.teamId` is required and must reference an existing team.
- `projects.leadMemberId`, when present, should reference a member associated with the same team unless cross-team projects are explicitly supported later.
- `projects.endDate` must be greater than or equal to `startDate` when both are provided.
- `publications.teamIds` should contain unique team ids only.
- `publications.authors` must preserve author order.
- `publications.authors.memberId`, when present, must reference an existing member.
- `gallery.teamId`, when present without `projectId`, must reference an existing team.
- `gallery.projectId`, when present, must reference an existing project.
- `gallery.teamId` must equal the owning team of `gallery.projectId` when both fields are provided.
- `members.teamIds` should contain unique team ids only.
- `users.memberId` should be unique when present so one member is linked to at most one admin account.
- `phd_progress.memberId` should be unique at the database level in the implementation schema.
- `phd_progress.memberId` must reference a member with role `phd_student`.
- `activity_logs.entityType` should be restricted to a documented closed set: `user`, `team`, `member`, `project`, `publication`, `news`, `gallery`, `phd_progress`, and `system`.
- `news.relatedEntityType` and `news.relatedEntityId` must either both be set or both be null.
- `activity_logs.entityId` may be null only when `entityType` is `system`.

## users

### Purpose

Store admin accounts and authentication data.

### Fields

- `email`: string, required, unique, lowercased
- `passwordHash`: string, required
- `role`: enum, required, values: `super_admin`, `content_admin`, `editor`
- `status`: enum, required, values: `active`, `inactive`, `locked`
- `fullName`: string, required
- `avatarUrl`: string, optional
- `memberId`: ObjectId, optional, ref `members`
- `lastLoginAt`: date, optional
- `createdAt`: date, required
- `updatedAt`: date, required

### Indexes

- Unique index on `email`
- Unique sparse index on `memberId`
- Index on `role`
- Index on `status`

## teams

### Purpose

Represent research teams and their scientific focus.

### Fields

- `name`: string, required
- `slug`: string, required, unique
- `researchFocus`: string, required
- `description`: string, optional
- `leaderMemberId`: ObjectId, optional, ref `members`, set only after the member belongs to the team
- `themes`: array of strings, optional
- `status`: enum, required, values: `active`, `inactive`, `archived`
- `memberIds`: array of ObjectId, optional, ref `members`, derived mirror of `members.teamIds`
- `projectIds`: array of ObjectId, optional, ref `projects`, derived mirror of `projects.teamId`
- `publicationIds`: array of ObjectId, optional, ref `publications`, derived mirror of `publications.teamIds`
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Index on `name`
- Index on `status`

## members

### Purpose

Store people records with role separation.

### Fields

- `fullName`: string, required
- `slug`: string, required, unique
- `role`: enum, required, values: `professor`, `doctor`, `phd_student`
- `email`: string, optional
- `profileImageUrl`: string, optional
- `bio`: string, optional
- `academicTitle`: string, optional
- `researchInterests`: array of strings, optional
- `teamIds`: array of ObjectId, optional, ref `teams`, canonical owner of team membership
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Index on `role`
- Index on `fullName`

## projects

### Purpose

Represent scientific projects and their progress.

### Fields

- `title`: string, required
- `slug`: string, required, unique
- `description`: string, optional
- `teamId`: ObjectId, required, ref `teams`, canonical owner of project-to-team assignment
- `leadMemberId`: ObjectId, optional, ref `members`
- `status`: enum, required, values: `planned`, `active`, `paused`, `completed`
- `startDate`: date, optional
- `endDate`: date, optional, must be greater than or equal to `startDate` when present
- `milestones`: array of objects, optional
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Milestone Object

- `title`: string, required
- `description`: string, optional
- `date`: date, optional
- `status`: enum, required, values: `pending`, `in_progress`, `done`

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Index on `teamId`
- Index on `status`

## publications

### Purpose

Store scientific outputs and metadata for search and citations.

### Fields

- `title`: string, required
- `slug`: string, required, unique
- `authors`: array of objects, required, ordered
- `publisher`: string, required
- `year`: number, required
- `links`: array of objects, optional
- `teamIds`: array of ObjectId, optional, ref `teams`, canonical owner of publication-to-team assignments
- `themes`: array of strings, optional
- `abstract`: string, optional
- `doi`: string, optional
- `type`: enum, optional, values: `journal`, `conference`, `chapter`, `report`, `other`
- `featured`: boolean, optional
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Author Object

- `displayName`: string, required
- `memberId`: ObjectId, optional, ref `members`

### Link Object

- `label`: string, required
- `url`: string, required
- `kind`: enum, optional, values: `pdf`, `doi`, `publisher`, `repository`, `supplementary`, `other`

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Text index on `title`, `authors.displayName`, `publisher`, `themes`
- Index on `year`

## news

### Purpose

Manage public news posts and announcements.

### Fields

- `headline`: string, required
- `slug`: string, required, unique
- `summary`: string, optional
- `body`: string, required
- `publishedAt`: date, optional
- `imageUrl`: string, optional
- `relatedEntityType`: enum, optional, values: `team`, `member`, `project`, `publication`, `phd_progress`
- `relatedEntityId`: ObjectId, optional
- `status`: enum, required, values: `draft`, `published`, `archived`
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Index on `status`
- Index on `publishedAt`
- Compound index on `relatedEntityType` and `relatedEntityId`

## gallery

### Purpose

Store media items for the public gallery.

### Fields

- `title`: string, required
- `slug`: string, required, unique
- `caption`: string, optional
- `mediaUrl`: string, required
- `thumbnailUrl`: string, optional
- `category`: string, optional
- `teamId`: ObjectId, optional, ref `teams`, optional direct team association
- `projectId`: ObjectId, optional, ref `projects`, optional project association
- `shotDate`: date, optional
- `sortOrder`: number, optional
- `status`: enum, required, values: `draft`, `published`, `archived`
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Indexes

- Unique index on `slug`
- Index on `deletedAt`
- Index on `status`
- Index on `category`
- Index on `teamId`
- Index on `projectId`
- Index on `shotDate`

## phd_progress

### Purpose

Track PhD progress stages and public visibility.

### Fields

- `memberId`: ObjectId, required, ref `members`, canonical owner of student progress linkage
- `projectId`: ObjectId, optional, ref `projects`, optional related project reference
- `enrolledAt`: date, optional
- `visibility`: enum, required, values: `public`, `private`
- `currentStage`: enum, required, values: `proposal`, `literature_review`, `data_collection`, `experimentation`, `writing`, `submission`, `defense`, `completed`
- `stages`: array of objects, optional
- `createdBy`: ObjectId, optional, ref `users`
- `updatedBy`: ObjectId, optional, ref `users`
- `createdAt`: date, required
- `updatedAt`: date, required
- `deletedAt`: date, optional

### Stage Object

- `stage`: enum, required, same values as `currentStage`
- `date`: date, optional
- `note`: string, optional

### Indexes

- Unique index on `memberId`
- Index on `deletedAt`
- Index on `enrolledAt`
- Index on `projectId`
- Index on `visibility`

## activity_logs

### Purpose

Audit admin actions across the system.

### Fields

- `actorUserId`: ObjectId, required, ref `users`
- `action`: string, required
- `entityType`: enum-like string, required, values: `user`, `team`, `member`, `project`, `publication`, `news`, `gallery`, `phd_progress`, `system`
- `entityId`: ObjectId, conditionally required
- `beforeSnapshot`: object, optional
- `afterSnapshot`: object, optional
- `ipAddress`: string, optional
- `userAgent`: string, optional
- `createdAt`: date, required

### Null `entityId` Rules

- Allowed only for non-document actions such as `auth.login`, `auth.logout`, `auth.refresh`, or `auth.access_denied`
- Entity-targeted actions such as create, update, delete, publish, archive, restore, and role changes should always include both `entityType` and `entityId`

### Indexes

- Index on `actorUserId`
- Index on `action`
- Index on `entityType`
- Compound index on `entityType` and `entityId`
- Index on `createdAt`
