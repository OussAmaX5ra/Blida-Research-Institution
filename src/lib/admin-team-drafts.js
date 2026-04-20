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

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function slugifyTeamName(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseThemes(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function countMembersByRole(team) {
  const roles = team.members ?? [];

  return roles.reduce(
    (counts, member) => ({
      ...counts,
      [member.role]: (counts[member.role] ?? 0) + 1,
    }),
    {
      Professor: 0,
      Doctor: 0,
      'PhD Student': 0,
    },
  );
}

function getAxisMeta(axisId, researchAxes) {
  return researchAxes.find((axis) => axis.id === axisId) ?? null;
}

function toStoredTeamRecord(team, researchAxes) {
  const axisId = team.axisId ?? team.axis?.id ?? '';
  const axis = team.axis ?? getAxisMeta(axisId, researchAxes);

  return {
    acronym: normalizeText(team.acronym).toUpperCase(),
    axis: axis
      ? {
          id: axis.id,
          name: axis.name,
          shortLabel: axis.shortLabel,
          accent: axis.accent,
          summary: axis.summary,
        }
      : null,
    axisId,
    color: normalizeText(team.color) || axis?.accent || '#1a5c6b',
    createdAt: team.createdAt ?? new Date().toISOString(),
    focus: normalizeText(team.focus ?? team.researchFocus),
    id: String(team.id),
    isLocalOnly: false,
    leader: normalizeText(team.leader),
    memberCount: team.memberCount ?? team.members?.length ?? 0,
    memberCounts: team.memberCounts ?? countMembersByRole(team),
    name: normalizeText(team.name),
    projectCount: team.projectCount ?? team.projects?.length ?? 0,
    publicationCount: team.publicationCount ?? team.publications ?? 0,
    slug: normalizeText(team.slug),
    status: normalizeText(team.status) || 'active',
    summary: normalizeText(team.summary ?? team.description),
    themes: parseThemes(team.themes),
    updatedAt: team.updatedAt ?? new Date().toISOString(),
  };
}

function buildUniqueSlug(slug, teams, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (
    teams.some(
      (team) => team.id !== currentId && normalizeText(team.slug) === nextSlug,
    )
  ) {
    nextSlug = `${slug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

export function validateTeamDraft(values, teams, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyTeamName(values.slug || values.name);
  const parsedThemes = parseThemes(values.themes);

  if (!normalizeText(values.name)) {
    nextErrors.name = 'Team name is required.';
  }

  if (!normalizeText(values.acronym)) {
    nextErrors.acronym = 'A short acronym is required.';
  } else if (!/^[A-Z0-9&-]{2,10}$/.test(normalizeText(values.acronym).toUpperCase())) {
    nextErrors.acronym = 'Use 2 to 10 uppercase letters, numbers, ampersands, or hyphens.';
  }

  if (!values.axisId) {
    nextErrors.axisId = 'Choose the research axis this team belongs to.';
  }

  if (!normalizeText(values.leader)) {
    nextErrors.leader = 'Assign a visible team leader.';
  }

  if (!normalizeText(values.focus)) {
    nextErrors.focus = 'Research focus is required.';
  }

  if (!normalizeText(values.summary)) {
    nextErrors.summary = 'Team summary is required.';
  } else if (normalizeText(values.summary).length < 40) {
    nextErrors.summary = 'Use at least 40 characters so the institutional summary is meaningful.';
  }

  if (!parsedThemes.length) {
    nextErrors.themes = 'Add at least one scientific theme.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (teams.some((team) => team.id !== currentId && team.slug === normalizedSlug)) {
    nextErrors.slug = 'Another team already uses this slug.';
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(normalizeText(values.color))) {
    nextErrors.color = 'Use a full 6-digit hex color such as #1a5c6b.';
  }

  return {
    errors: nextErrors,
    normalizedSlug,
    parsedThemes,
  };
}

function buildStoredTeamFromForm(values, teams, researchAxes, currentId = null, currentTeam = null) {
  const { errors, normalizedSlug, parsedThemes } = validateTeamDraft(values, teams, currentId);

  if (Object.keys(errors).length) {
    return {
      errors,
      payload: null,
      preview: null,
    };
  }

  const axis = getAxisMeta(values.axisId, researchAxes);
  const nextSlug = buildUniqueSlug(normalizedSlug, teams, currentId);
  const preview = {
    acronym: normalizeText(values.acronym).toUpperCase(),
    axis: axis
      ? {
          id: axis.id,
          name: axis.name,
          shortLabel: axis.shortLabel,
          accent: axis.accent,
          summary: axis.summary,
        }
      : null,
    axisId: values.axisId,
    color: normalizeText(values.color),
    createdAt: currentTeam?.createdAt ?? new Date().toISOString(),
    focus: normalizeText(values.focus),
    id: currentId ?? currentTeam?.id ?? '',
    isLocalOnly: false,
    leader: normalizeText(values.leader),
    memberCount: currentTeam?.memberCount ?? 0,
    memberCounts: currentTeam?.memberCounts ?? {
      Professor: 0,
      Doctor: 0,
      'PhD Student': 0,
    },
    name: normalizeText(values.name),
    projectCount: currentTeam?.projectCount ?? 0,
    publicationCount: currentTeam?.publicationCount ?? 0,
    slug: nextSlug,
    status: normalizeText(values.status) || 'active',
    summary: normalizeText(values.summary),
    themes: parsedThemes,
    updatedAt: new Date().toISOString(),
  };

  return {
    errors: {},
    payload: {
      acronym: preview.acronym,
      axisId: preview.axisId,
      color: preview.color,
      focus: preview.focus,
      leader: preview.leader,
      name: preview.name,
      slug: preview.slug,
      status: preview.status,
      summary: preview.summary,
      themes: preview.themes,
    },
    preview,
  };
}

export function useAdminTeamDrafts(sourceTeams, researchAxes = []) {
  const normalizedSourceTeams = useMemo(
    () => sourceTeams.map((team) => toStoredTeamRecord(team, researchAxes)),
    [researchAxes, sourceTeams],
  );
  const [teams, setTeams] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadTeams() {
      try {
        const records = await fetchAdminContentCollection('team', abortController.signal);

        if (isCancelled) {
          return;
        }

        const fromApi = records.map((team) => toStoredTeamRecord(team, researchAxes));
        setTeams(mergeRecordsBySlug(normalizedSourceTeams, fromApi));
      } catch {
        if (isCancelled) {
          return;
        }

        setTeams(normalizedSourceTeams);
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadTeams();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [normalizedSourceTeams, researchAxes]);

  return {
    isReady,
    teams,
    findTeamBySlug(slug) {
      return teams.find((team) => team.slug === slug) ?? null;
    },
    async createTeam(values) {
      const result = buildStoredTeamFromForm(values, teams, researchAxes);

      if (!result.payload) {
        return result;
      }

      try {
        const savedTeam = await createAdminContentItem('team', result.payload);
        const normalizedTeam = toStoredTeamRecord(savedTeam, researchAxes);
        const nextTeams = [normalizedTeam, ...teams];
        setTeams(nextTeams);
        recordAdminActivity({
          action: 'team.create',
          afterSnapshot: normalizedTeam,
          entityId: normalizedTeam.id,
          entityLabel: normalizedTeam.name,
          entityType: 'team',
          summary: `${normalizedTeam.name} was added to the team directory.`,
        });

        return {
          errors: {},
          team: normalizedTeam,
          teams: nextTeams,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The team could not be created.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          team: null,
        };
      }
    },
    async updateTeam(teamId, values) {
      const previousTeam = teams.find((team) => team.id === teamId) ?? null;
      const result = buildStoredTeamFromForm(values, teams, researchAxes, teamId, previousTeam);

      if (!result.payload) {
        return result;
      }

      try {
        const savedTeam = await updateAdminContentItem('team', teamId, result.payload);
        const normalizedTeam = toStoredTeamRecord(savedTeam, researchAxes);
        const nextTeams = teams.map((team) => (team.id === teamId ? normalizedTeam : team));
        setTeams(nextTeams);
        recordAdminActivity({
          action: 'team.update',
          afterSnapshot: normalizedTeam,
          beforeSnapshot: previousTeam,
          entityId: normalizedTeam.id,
          entityLabel: normalizedTeam.name,
          entityType: 'team',
          summary: `${normalizedTeam.name} was updated in the team directory.`,
        });

        return {
          errors: {},
          team: normalizedTeam,
          teams: nextTeams,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The team could not be updated.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          team: null,
        };
      }
    },
    async deleteTeam(teamId) {
      const previousTeam = teams.find((team) => team.id === teamId) ?? null;

      try {
        await deleteAdminContentItem('team', teamId);
        const nextTeams = teams.filter((team) => team.id !== teamId);
        setTeams(nextTeams);

        if (previousTeam) {
          recordAdminActivity({
            action: 'team.delete',
            beforeSnapshot: previousTeam,
            entityId: previousTeam.id,
            entityLabel: previousTeam.name,
            entityType: 'team',
            summary: `${previousTeam.name} was removed from the team directory.`,
          });
        }

        return {
          error: '',
          teams: nextTeams,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected team could not be deleted.',
          teams,
        };
      }
    },
  };
}
