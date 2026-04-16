import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-project-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-project-drafts:change';
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_STATUSES = new Set(['Planned', 'Ongoing', 'Completed']);

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

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

export function slugifyProjectTitle(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readStoredProjects() {
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

function writeStoredProjects(projects) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function toStoredProjectRecord(project) {
  return {
    axisId: project.axisId ?? project.axis?.id ?? '',
    createdAt: project.createdAt ?? new Date().toISOString(),
    id: String(project.id ?? project.slug),
    lead: normalizeText(project.lead),
    leadMemberSlug: project.leadMemberSlug ?? '',
    milestone: normalizeText(project.milestone),
    phdLinked: Boolean(project.phdLinked),
    slug: normalizeText(project.slug),
    status: normalizeText(project.status),
    summary: normalizeText(project.summary ?? project.description),
    teamSlug: project.teamSlug ?? project.team?.slug ?? '',
    themes: parseList(project.themes),
    title: normalizeText(project.title),
    updatedAt: project.updatedAt ?? new Date().toISOString(),
    year: Number(project.year) || new Date().getFullYear(),
  };
}

function ensureSeededProjects(sourceProjects) {
  const storedProjects = readStoredProjects();

  if (storedProjects?.length) {
    return storedProjects;
  }

  if (!sourceProjects.length) {
    return [];
  }

  const seededProjects = sourceProjects.map((project) => toStoredProjectRecord(project));
  writeStoredProjects(seededProjects);
  return seededProjects;
}

function buildUniqueSlug(slug, projects, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (projects.some((project) => project.id !== currentId && project.slug === nextSlug)) {
    nextSlug = `${slug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

export function validateProjectDraft(values, projects, teams, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyProjectTitle(values.slug || values.title);
  const themes = parseList(values.themes);
  const normalizedYear = Number(values.year);
  const selectedTeam = teams.find((team) => team.slug === values.teamSlug) ?? null;

  if (!normalizeText(values.title)) {
    nextErrors.title = 'Project title is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (projects.some((project) => project.id !== currentId && project.slug === normalizedSlug)) {
    nextErrors.slug = 'Another project already uses this slug.';
  }

  if (!selectedTeam) {
    nextErrors.teamSlug = 'Assign the project to a team.';
  }

  if (!normalizeText(values.lead)) {
    nextErrors.lead = 'Choose or enter a lead researcher.';
  }

  if (!ALLOWED_STATUSES.has(normalizeText(values.status))) {
    nextErrors.status = 'Choose Planned, Ongoing, or Completed.';
  }

  if (!Number.isInteger(normalizedYear) || normalizedYear < 2000 || normalizedYear > 2100) {
    nextErrors.year = 'Use a valid four-digit year.';
  }

  if (!normalizeText(values.summary)) {
    nextErrors.summary = 'Project summary is required.';
  } else if (normalizeText(values.summary).length < 40) {
    nextErrors.summary = 'Use at least 40 characters so the summary is meaningful.';
  }

  if (!normalizeText(values.milestone)) {
    nextErrors.milestone = 'Add the current milestone or project note.';
  }

  if (!themes.length) {
    nextErrors.themes = 'Add at least one research theme.';
  }

  return {
    errors: nextErrors,
    normalizedSlug,
    selectedTeam,
    themes,
    year: normalizedYear,
  };
}

function buildStoredProjectFromForm(values, projects, teams, currentId = null) {
  const validation = validateProjectDraft(values, projects, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      project: null,
    };
  }

  const existingProject = currentId
    ? projects.find((project) => project.id === currentId) ?? null
    : null;

  return {
    errors: {},
    project: {
      axisId: validation.selectedTeam?.axis?.id ?? validation.selectedTeam?.axisId ?? '',
      createdAt: existingProject?.createdAt ?? new Date().toISOString(),
      id: currentId ?? `local-project-${Date.now()}`,
      lead: normalizeText(values.lead),
      leadMemberSlug: normalizeText(values.leadMemberSlug),
      milestone: normalizeText(values.milestone),
      phdLinked: Boolean(values.phdLinked),
      slug: buildUniqueSlug(validation.normalizedSlug, projects, currentId),
      status: normalizeText(values.status),
      summary: normalizeText(values.summary),
      teamSlug: validation.selectedTeam.slug,
      themes: validation.themes,
      title: normalizeText(values.title),
      updatedAt: new Date().toISOString(),
      year: validation.year,
    },
  };
}

export function createAdminProjectDraft(values, projects, teams) {
  const result = buildStoredProjectFromForm(values, projects, teams);

  if (!result.project) {
    return result;
  }

  const nextProjects = [result.project, ...projects];
  writeStoredProjects(nextProjects);

  return {
    errors: {},
    project: result.project,
    projects: nextProjects,
  };
}

export function updateAdminProjectDraft(projectId, values, projects, teams) {
  const result = buildStoredProjectFromForm(values, projects, teams, projectId);

  if (!result.project) {
    return result;
  }

  const nextProjects = projects.map((project) => (project.id === projectId ? result.project : project));
  writeStoredProjects(nextProjects);

  return {
    errors: {},
    project: result.project,
    projects: nextProjects,
  };
}

export function deleteAdminProjectDraft(projectId, projects) {
  const nextProjects = projects.filter((project) => project.id !== projectId);
  writeStoredProjects(nextProjects);
  return nextProjects;
}

function enrichProject(project, teams, members) {
  const team = teams.find((entry) => entry.slug === project.teamSlug) ?? null;
  const leadMember = project.leadMemberSlug
    ? members.find((entry) => entry.slug === project.leadMemberSlug) ?? null
    : members.find((entry) => entry.name === project.lead) ?? null;

  return {
    ...project,
    axisId: project.axisId || team?.axis?.id || '',
    leadMember,
    team,
  };
}

export function useAdminProjectDrafts(sourceProjects, teams, members) {
  const normalizedSourceProjects = useMemo(
    () => sourceProjects.map((project) => toStoredProjectRecord(project)),
    [sourceProjects],
  );
  const [projects, setProjects] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncProjects = () => {
      const nextProjects = ensureSeededProjects(normalizedSourceProjects);
      setProjects(nextProjects);
      setIsReady(true);
    };

    syncProjects();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncProjects);
    window.addEventListener('storage', syncProjects);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncProjects);
      window.removeEventListener('storage', syncProjects);
    };
  }, [normalizedSourceProjects]);

  const enrichedProjects = useMemo(
    () =>
      projects
        .map((project) => enrichProject(project, teams, members))
        .toSorted((left, right) => right.year - left.year || left.title.localeCompare(right.title)),
    [members, projects, teams],
  );

  return {
    isReady,
    projects: enrichedProjects,
    findProjectBySlug(slug) {
      return enrichedProjects.find((project) => project.slug === slug) ?? null;
    },
    createProject(values) {
      const result = createAdminProjectDraft(values, projects, teams);

      if (result.projects) {
        setProjects(result.projects);
      }

      return result;
    },
    updateProject(projectId, values) {
      const result = updateAdminProjectDraft(projectId, values, projects, teams);

      if (result.projects) {
        setProjects(result.projects);
      }

      return result;
    },
    deleteProject(projectId) {
      const nextProjects = deleteAdminProjectDraft(projectId, projects);
      setProjects(nextProjects);
      return nextProjects;
    },
  };
}
