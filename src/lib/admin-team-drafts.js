import { useEffect, useMemo, useState } from 'react';

import { researchAxes } from '../data/mockData.js';

const STORAGE_KEY = 'research-lab.admin-team-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-team-drafts:change';
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

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

function getAxisMeta(axisId) {
  return researchAxes.find((axis) => axis.id === axisId) ?? null;
}

function toStoredTeamRecord(team, { isLocalOnly = false } = {}) {
  const axisId = team.axisId ?? team.axis?.id ?? '';
  const axis = team.axis ?? getAxisMeta(axisId);

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
    isLocalOnly,
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
    updatedAt: new Date().toISOString(),
  };
}

function readStoredTeams() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredTeams(teams) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function ensureSeededTeams(sourceTeams) {
  const storedTeams = readStoredTeams();

  if (storedTeams?.length) {
    return storedTeams;
  }

  if (!sourceTeams.length) {
    return [];
  }

  const seededTeams = sourceTeams.map((team) => toStoredTeamRecord(team));
  writeStoredTeams(seededTeams);
  return seededTeams;
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

function buildStoredTeamFromForm(values, teams, currentId = null) {
  const { errors, normalizedSlug, parsedThemes } = validateTeamDraft(values, teams, currentId);

  if (Object.keys(errors).length) {
    return {
      errors,
      team: null,
    };
  }

  const axis = getAxisMeta(values.axisId);
  const matchingCurrentTeam = currentId
    ? teams.find((team) => team.id === currentId) ?? null
    : null;
  const nextId = currentId ?? `local-team-${Date.now()}`;
  const nextSlug = buildUniqueSlug(normalizedSlug, teams, currentId);

  return {
    errors: {},
    team: {
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
      createdAt: matchingCurrentTeam?.createdAt ?? new Date().toISOString(),
      focus: normalizeText(values.focus),
      id: nextId,
      isLocalOnly: matchingCurrentTeam?.isLocalOnly ?? true,
      leader: normalizeText(values.leader),
      memberCount: matchingCurrentTeam?.memberCount ?? 0,
      memberCounts: matchingCurrentTeam?.memberCounts ?? {
        Professor: 0,
        Doctor: 0,
        'PhD Student': 0,
      },
      name: normalizeText(values.name),
      projectCount: matchingCurrentTeam?.projectCount ?? 0,
      publicationCount: matchingCurrentTeam?.publicationCount ?? 0,
      slug: nextSlug,
      status: normalizeText(values.status) || 'active',
      summary: normalizeText(values.summary),
      themes: parsedThemes,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createAdminTeamDraft(values, teams) {
  const result = buildStoredTeamFromForm(values, teams);

  if (!result.team) {
    return result;
  }

  const nextTeams = [result.team, ...teams];
  writeStoredTeams(nextTeams);

  return {
    errors: {},
    team: result.team,
    teams: nextTeams,
  };
}

export function updateAdminTeamDraft(teamId, values, teams) {
  const result = buildStoredTeamFromForm(values, teams, teamId);

  if (!result.team) {
    return result;
  }

  const nextTeams = teams.map((team) => (team.id === teamId ? result.team : team));
  writeStoredTeams(nextTeams);

  return {
    errors: {},
    team: result.team,
    teams: nextTeams,
  };
}

export function deleteAdminTeamDraft(teamId, teams) {
  const nextTeams = teams.filter((team) => team.id !== teamId);
  writeStoredTeams(nextTeams);
  return nextTeams;
}

export function useAdminTeamDrafts(sourceTeams) {
  const normalizedSourceTeams = useMemo(
    () => sourceTeams.map((team) => toStoredTeamRecord(team)),
    [sourceTeams],
  );
  const [teams, setTeams] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncTeams = () => {
      const nextTeams = ensureSeededTeams(normalizedSourceTeams);
      setTeams(nextTeams);
      setIsReady(true);
    };

    syncTeams();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncTeams);
    window.addEventListener('storage', syncTeams);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncTeams);
      window.removeEventListener('storage', syncTeams);
    };
  }, [normalizedSourceTeams]);

  return {
    isReady,
    teams,
    findTeamBySlug(slug) {
      return teams.find((team) => team.slug === slug) ?? null;
    },
    createTeam(values) {
      const result = createAdminTeamDraft(values, teams);

      if (result.teams) {
        setTeams(result.teams);
      }

      return result;
    },
    updateTeam(teamId, values) {
      const result = updateAdminTeamDraft(teamId, values, teams);

      if (result.teams) {
        setTeams(result.teams);
      }

      return result;
    },
    deleteTeam(teamId) {
      const nextTeams = deleteAdminTeamDraft(teamId, teams);
      setTeams(nextTeams);
      return nextTeams;
    },
  };
}
