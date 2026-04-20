import { useEffect, useMemo, useState } from 'react';

import {
  createAdminContentItem,
  deleteAdminContentItem,
  fetchAdminContentCollection,
  mapAdminApiError,
  updateAdminContentItem,
} from './admin-content-api.js';
import { recordAdminActivity } from './admin-activity-log.js';

const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_STATUSES = new Set(['Planned', 'Ongoing', 'Completed']);

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

function buildStoredProjectFromForm(values, projects, teams, currentId = null, existingProject = null) {
  const validation = validateProjectDraft(values, projects, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      payload: null,
      project: null,
    };
  }

  const preview = {
    axisId: validation.selectedTeam?.axis?.id ?? validation.selectedTeam?.axisId ?? '',
    createdAt: existingProject?.createdAt ?? new Date().toISOString(),
    id: currentId ?? existingProject?.id ?? '',
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
  };

  return {
    errors: {},
    payload: {
      lead: preview.lead,
      leadMemberSlug: preview.leadMemberSlug,
      milestone: preview.milestone,
      phdLinked: preview.phdLinked,
      slug: preview.slug,
      status: preview.status,
      summary: preview.summary,
      teamSlug: preview.teamSlug,
      themes: preview.themes,
      title: preview.title,
      year: preview.year,
    },
    project: preview,
  };
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
  const [projects, setProjects] = useState(normalizedSourceProjects);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadProjects() {
      try {
        const records = await fetchAdminContentCollection('project', abortController.signal);

        if (isCancelled) {
          return;
        }

        setProjects(records.map((project) => toStoredProjectRecord(project)));
      } catch {
        if (!isCancelled) {
          setProjects(normalizedSourceProjects);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadProjects();

    return () => {
      isCancelled = true;
      abortController.abort();
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
    async createProject(values) {
      const result = buildStoredProjectFromForm(values, projects, teams);

      if (!result.payload) {
        return result;
      }

      try {
        const savedProject = await createAdminContentItem('project', result.payload);
        const normalizedProject = toStoredProjectRecord(savedProject);
        const nextProjects = [normalizedProject, ...projects];
        setProjects(nextProjects);
        recordAdminActivity({
          action: 'project.create',
          afterSnapshot: normalizedProject,
          entityId: normalizedProject.id,
          entityLabel: normalizedProject.title,
          entityType: 'project',
          summary: `${normalizedProject.title} was added to the protected project board.`,
        });

        return {
          errors: {},
          project: enrichProject(normalizedProject, teams, members),
          projects: nextProjects,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The project could not be created.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          project: null,
        };
      }
    },
    async updateProject(projectId, values) {
      const previousProject = projects.find((project) => project.id === projectId) ?? null;
      const result = buildStoredProjectFromForm(values, projects, teams, projectId, previousProject);

      if (!result.payload) {
        return result;
      }

      try {
        const savedProject = await updateAdminContentItem('project', projectId, result.payload);
        const normalizedProject = toStoredProjectRecord(savedProject);
        const nextProjects = projects.map((project) => (project.id === projectId ? normalizedProject : project));
        setProjects(nextProjects);
        recordAdminActivity({
          action: 'project.update',
          afterSnapshot: normalizedProject,
          beforeSnapshot: previousProject,
          entityId: normalizedProject.id,
          entityLabel: normalizedProject.title,
          entityType: 'project',
          summary: `${normalizedProject.title} was updated in the protected project board.`,
        });

        return {
          errors: {},
          project: enrichProject(normalizedProject, teams, members),
          projects: nextProjects,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The project could not be updated.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          project: null,
        };
      }
    },
    async deleteProject(projectId) {
      const previousProject = projects.find((project) => project.id === projectId) ?? null;

      try {
        await deleteAdminContentItem('project', projectId);
        const nextProjects = projects.filter((project) => project.id !== projectId);
        setProjects(nextProjects);

        if (previousProject) {
          recordAdminActivity({
            action: 'project.delete',
            beforeSnapshot: previousProject,
            entityId: previousProject.id,
            entityLabel: previousProject.title,
            entityType: 'project',
            summary: `${previousProject.title} was removed from the protected project board.`,
          });
        }

        return {
          error: '',
          projects: nextProjects,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected project could not be deleted.',
          projects,
        };
      }
    },
  };
}
