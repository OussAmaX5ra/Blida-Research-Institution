import { useEffect, useMemo, useState } from 'react';

import {
  createAdminContentItem,
  deleteAdminContentItem,
  fetchAdminContentCollection,
  mapAdminApiError,
  updateAdminContentItem,
} from './admin-content-api.js';
import { mergeRecordsBySlug } from './mergeRecordsBySlug.js';
import { recordAdminActivity } from './admin-activity-log.js';

const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_ROLES = new Set(['Professor', 'Doctor', 'PhD Student']);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function slugifyMemberName(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toStoredMemberRecord(member) {
  return {
    avatar: normalizeText(member.avatar) || normalizeText(member.name).slice(0, 2).toUpperCase(),
    createdAt: member.createdAt ?? new Date().toISOString(),
    email: normalizeText(member.email ?? ''),
    expertise: normalizeText(member.expertise ?? member.bio),
    id: String(member.id ?? member.slug),
    isLeader: Boolean(member.isLeader),
    name: normalizeText(member.name ?? member.fullName),
    primaryTeamSlug: member.primaryTeamSlug ?? member.team?.slug ?? member.teamSlug ?? '',
    projectCount: member.projectCount ?? 0,
    publicationCount: member.publicationCount ?? 0,
    role: normalizeText(member.role),
    slug: normalizeText(member.slug),
    teamSlugs: member.teamSlugs ?? (member.team?.slug ? [member.team.slug] : []),
    themes: parseList(member.themes),
    title: normalizeText(member.title ?? member.academicTitle),
    updatedAt: member.updatedAt ?? new Date().toISOString(),
  };
}

function buildUniqueSlug(slug, members, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (members.some((member) => member.id !== currentId && member.slug === nextSlug)) {
    nextSlug = `${slug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

function buildInitialAvatar(name) {
  return normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function isValidEmail(value) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateMemberDraft(values, members, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyMemberName(values.slug || values.name);
  const teamSlugs = Array.isArray(values.teamSlugs)
    ? values.teamSlugs.filter(Boolean)
    : parseList(values.teamSlugs);
  const themes = parseList(values.themes);

  if (!normalizeText(values.name)) {
    nextErrors.name = 'Member name is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (members.some((member) => member.id !== currentId && member.slug === normalizedSlug)) {
    nextErrors.slug = 'Another member already uses this slug.';
  }

  if (!ALLOWED_ROLES.has(normalizeText(values.role))) {
    nextErrors.role = 'Choose Professor, Doctor, or PhD Student.';
  }

  if (!normalizeText(values.title)) {
    nextErrors.title = 'Academic title is required.';
  }

  if (!normalizeText(values.expertise)) {
    nextErrors.expertise = 'Add the member expertise or bio summary.';
  }

  if (!teamSlugs.length) {
    nextErrors.teamSlugs = 'Assign at least one team.';
  }

  if (!themes.length) {
    nextErrors.themes = 'Add at least one research theme.';
  }

  if (!isValidEmail(normalizeText(values.email))) {
    nextErrors.email = 'Use a valid email address or leave the field blank.';
  }

  if (normalizeText(values.avatar) && !/^[A-Z]{1,4}$/.test(normalizeText(values.avatar).toUpperCase())) {
    nextErrors.avatar = 'Avatar initials should use 1 to 4 uppercase letters.';
  }

  return {
    errors: nextErrors,
    normalizedSlug,
    teamSlugs,
    themes,
  };
}

function buildStoredMemberFromForm(values, members, currentId = null, existingMember = null) {
  const { errors, normalizedSlug, teamSlugs, themes } = validateMemberDraft(values, members, currentId);

  if (Object.keys(errors).length) {
    return {
      errors,
      payload: null,
      preview: null,
    };
  }

  const preview = {
    avatar: normalizeText(values.avatar).toUpperCase() || buildInitialAvatar(values.name),
    createdAt: existingMember?.createdAt ?? new Date().toISOString(),
    email: normalizeText(values.email),
    expertise: normalizeText(values.expertise),
    id: currentId ?? existingMember?.id ?? '',
    isLeader: existingMember?.isLeader ?? false,
    name: normalizeText(values.name),
    primaryTeamSlug: values.primaryTeamSlug && teamSlugs.includes(values.primaryTeamSlug)
      ? values.primaryTeamSlug
      : teamSlugs[0],
    projectCount: existingMember?.projectCount ?? 0,
    publicationCount: existingMember?.publicationCount ?? 0,
    role: normalizeText(values.role),
    slug: buildUniqueSlug(normalizedSlug, members, currentId),
    teamSlugs,
    themes,
    title: normalizeText(values.title),
    updatedAt: new Date().toISOString(),
  };

  return {
    errors: {},
    payload: {
      avatar: preview.avatar,
      email: preview.email,
      expertise: preview.expertise,
      name: preview.name,
      primaryTeamSlug: preview.primaryTeamSlug,
      role: preview.role,
      slug: preview.slug,
      teamSlugs: preview.teamSlugs,
      themes: preview.themes,
      title: preview.title,
    },
    preview,
  };
}

function enrichMember(member, teams) {
  const assignedTeams = member.teamSlugs
    .map((teamSlug) => teams.find((team) => team.slug === teamSlug))
    .filter(Boolean);
  const primaryTeam = assignedTeams.find((team) => team.slug === member.primaryTeamSlug) ?? assignedTeams[0] ?? null;

  return {
    ...member,
    assignedTeams,
    primaryTeam,
  };
}

export function useAdminMemberDrafts(sourceMembers, teams) {
  const normalizedSourceMembers = useMemo(
    () => sourceMembers.map((member) => toStoredMemberRecord(member)),
    [sourceMembers],
  );
  const [members, setMembers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadMembers() {
      try {
        const records = await fetchAdminContentCollection('member', abortController.signal);

        if (isCancelled) {
          return;
        }

        const fromApi = records.map((member) => toStoredMemberRecord(member));
        setMembers(mergeRecordsBySlug(normalizedSourceMembers, fromApi));
      } catch {
        if (!isCancelled) {
          setMembers(normalizedSourceMembers);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadMembers();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [normalizedSourceMembers]);

  const enrichedMembers = useMemo(
    () =>
      members
        .map((member) => enrichMember(member, teams))
        .toSorted((left, right) => left.name.localeCompare(right.name)),
    [members, teams],
  );

  return {
    isReady,
    members: enrichedMembers,
    findMemberBySlug(slug) {
      return enrichedMembers.find((member) => member.slug === slug) ?? null;
    },
    async createMember(values) {
      const result = buildStoredMemberFromForm(values, members);

      if (!result.payload) {
        return result;
      }

      try {
        const savedMember = await createAdminContentItem('member', result.payload);
        const normalizedMember = toStoredMemberRecord(savedMember);
        const nextMembers = [normalizedMember, ...members];
        setMembers(nextMembers);
        recordAdminActivity({
          action: 'member.create',
          afterSnapshot: normalizedMember,
          entityId: normalizedMember.id,
          entityLabel: normalizedMember.name,
          entityType: 'member',
          summary: `${normalizedMember.name} was added to the member directory.`,
        });

        return {
          errors: {},
          member: enrichMember(normalizedMember, teams),
          members: nextMembers,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The member could not be created.');
        return {
          errors: apiError.errors,
          member: null,
          message: apiError.message,
        };
      }
    },
    async updateMember(memberId, values) {
      const previousMember = members.find((member) => member.id === memberId) ?? null;
      const result = buildStoredMemberFromForm(values, members, memberId, previousMember);

      if (!result.payload) {
        return result;
      }

      try {
        const savedMember = await updateAdminContentItem('member', memberId, result.payload);
        const normalizedMember = toStoredMemberRecord(savedMember);
        const nextMembers = members.map((member) => (member.id === memberId ? normalizedMember : member));
        setMembers(nextMembers);
        recordAdminActivity({
          action: 'member.update',
          afterSnapshot: normalizedMember,
          beforeSnapshot: previousMember,
          entityId: normalizedMember.id,
          entityLabel: normalizedMember.name,
          entityType: 'member',
          summary: `${normalizedMember.name} was updated in the member directory.`,
        });

        return {
          errors: {},
          member: enrichMember(normalizedMember, teams),
          members: nextMembers,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The member could not be updated.');
        return {
          errors: apiError.errors,
          member: null,
          message: apiError.message,
        };
      }
    },
    async deleteMember(memberId) {
      const previousMember = members.find((member) => member.id === memberId) ?? null;

      try {
        await deleteAdminContentItem('member', memberId);
        const nextMembers = members.filter((member) => member.id !== memberId);
        setMembers(nextMembers);

        if (previousMember) {
          recordAdminActivity({
            action: 'member.delete',
            beforeSnapshot: previousMember,
            entityId: previousMember.id,
            entityLabel: previousMember.name,
            entityType: 'member',
            summary: `${previousMember.name} was removed from the member directory.`,
          });
        }

        return {
          error: '',
          members: nextMembers,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected member could not be deleted.',
          members,
        };
      }
    },
  };
}
