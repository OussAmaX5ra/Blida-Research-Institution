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
const ALLOWED_ENTRY_TYPES = new Set(['article', 'inproceedings']);
const ALLOWED_STATUSES = new Set(['Published', 'Review', 'Draft']);

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

export function slugifyPublicationTitle(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findTeamForPublication(publication, teams) {
  if (publication.team?.slug) {
    return teams.find((team) => team.slug === publication.team.slug) ?? null;
  }

  if (publication.teamSlug) {
    return teams.find((team) => team.slug === publication.teamSlug) ?? null;
  }

  if (publication.teamTag) {
    return teams.find((team) => team.acronym === publication.teamTag) ?? null;
  }

  return null;
}

function toStoredPublicationRecord(publication, teams) {
  const team = findTeamForPublication(publication, teams);

  return {
    abstract: normalizeText(publication.abstract),
    authors: parseList(publication.authors),
    citations: Number(publication.citations) || 0,
    createdAt: publication.createdAt ?? new Date().toISOString(),
    doi: normalizeText(publication.doi),
    entryType: normalizeText(publication.entryType) || 'article',
    id: String(publication.id ?? publication.slug),
    isLocalOnly: false,
    journal: normalizeText(publication.journal),
    pdfLink: normalizeText(publication.pdfLink),
    publisher: normalizeText(publication.publisher),
    slug: normalizeText(publication.slug),
    status: normalizeText(publication.status) || 'Published',
    teamSlug: publication.teamSlug ?? team?.slug ?? '',
    themes: parseList(publication.themes),
    title: normalizeText(publication.title),
    updatedAt: publication.updatedAt ?? new Date().toISOString(),
    year: Number(publication.year) || new Date().getFullYear(),
  };
}

function buildUniqueSlug(slug, publications, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (publications.some((publication) => publication.id !== currentId && publication.slug === nextSlug)) {
    nextSlug = `${slug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

function isValidUrlLike(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return false;
  }

  return normalized === '#' || /^(https?:\/\/|\/)/.test(normalized);
}

export function buildPublicationBibtex(publication) {
  const citationKey = `${publication.slug.replace(/-/g, '_')}_${publication.year}`;
  const authors = publication.authors.join(' and ');
  const venueField = publication.entryType === 'article' ? 'journal' : 'booktitle';

  return `@${publication.entryType}{${citationKey},
  title = {${publication.title}},
  author = {${authors}},
  ${venueField} = {${publication.journal}},
  year = {${publication.year}},
  publisher = {${publication.publisher}},
  doi = {${publication.doi}},
  url = {${publication.pdfLink}}
}`;
}

export function buildPublicationApaCitation(publication) {
  return `${publication.authors.join(', ')} (${publication.year}). ${publication.title}. ${publication.publisher}. ${publication.doi}`;
}

export function validatePublicationDraft(values, publications, teams, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyPublicationTitle(values.slug || values.title);
  const authors = parseList(values.authors);
  const themes = parseList(values.themes);
  const normalizedYear = Number(values.year);
  const normalizedCitations = Number(values.citations);
  const selectedTeam = teams.find((team) => team.slug === values.teamSlug) ?? null;

  if (!normalizeText(values.title)) {
    nextErrors.title = 'Publication title is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (publications.some((publication) => publication.id !== currentId && publication.slug === normalizedSlug)) {
    nextErrors.slug = 'Another publication already uses this slug.';
  }

  if (!selectedTeam) {
    nextErrors.teamSlug = 'Assign the publication to a team.';
  }

  if (!ALLOWED_STATUSES.has(normalizeText(values.status))) {
    nextErrors.status = 'Choose Published, Review, or Draft.';
  }

  if (!ALLOWED_ENTRY_TYPES.has(normalizeText(values.entryType))) {
    nextErrors.entryType = 'Choose article or inproceedings.';
  }

  if (!authors.length) {
    nextErrors.authors = 'Add at least one author and keep the order intentional.';
  }

  if (!Number.isInteger(normalizedYear) || normalizedYear < 2000 || normalizedYear > 2100) {
    nextErrors.year = 'Use a valid four-digit year.';
  }

  if (!normalizeText(values.publisher)) {
    nextErrors.publisher = 'Publisher or venue group is required.';
  }

  if (!normalizeText(values.journal)) {
    nextErrors.journal = 'Journal or conference label is required.';
  }

  if (!normalizeText(values.doi)) {
    nextErrors.doi = 'DOI is required.';
  }

  if (!isValidUrlLike(values.pdfLink)) {
    nextErrors.pdfLink = 'Use #, an absolute URL, or a root-relative file path.';
  }

  if (!normalizeText(values.abstract)) {
    nextErrors.abstract = 'Abstract is required.';
  } else if (normalizeText(values.abstract).length < 40) {
    nextErrors.abstract = 'Use at least 40 characters so the abstract is useful.';
  }

  if (!themes.length) {
    nextErrors.themes = 'Add at least one research theme.';
  }

  if (!Number.isInteger(normalizedCitations) || normalizedCitations < 0) {
    nextErrors.citations = 'Citations must be zero or a positive whole number.';
  }

  return {
    authors,
    citations: normalizedCitations,
    errors: nextErrors,
    normalizedSlug,
    selectedTeam,
    themes,
    year: normalizedYear,
  };
}

function buildStoredPublicationFromForm(values, publications, teams, currentId = null, existingPublication = null) {
  const validation = validatePublicationDraft(values, publications, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      payload: null,
      publication: null,
    };
  }

  const preview = {
    abstract: normalizeText(values.abstract),
    authors: validation.authors,
    citations: validation.citations,
    createdAt: existingPublication?.createdAt ?? new Date().toISOString(),
    doi: normalizeText(values.doi),
    entryType: normalizeText(values.entryType),
    id: currentId ?? existingPublication?.id ?? '',
    isLocalOnly: false,
    journal: normalizeText(values.journal),
    pdfLink: normalizeText(values.pdfLink),
    publisher: normalizeText(values.publisher),
    slug: buildUniqueSlug(validation.normalizedSlug, publications, currentId),
    status: normalizeText(values.status),
    teamSlug: validation.selectedTeam.slug,
    themes: validation.themes,
    title: normalizeText(values.title),
    updatedAt: new Date().toISOString(),
    year: validation.year,
  };

  return {
    errors: {},
    payload: {
      abstract: preview.abstract,
      authors: preview.authors,
      citations: preview.citations,
      doi: preview.doi,
      entryType: preview.entryType,
      journal: preview.journal,
      pdfLink: preview.pdfLink,
      publisher: preview.publisher,
      slug: preview.slug,
      status: preview.status,
      teamSlug: preview.teamSlug,
      themes: preview.themes,
      title: preview.title,
      year: preview.year,
    },
    publication: preview,
  };
}

function enrichPublication(publication, teams) {
  const team = teams.find((entry) => entry.slug === publication.teamSlug) ?? null;

  return {
    ...publication,
    team,
  };
}

export function useAdminPublicationDrafts(sourcePublications, teams) {
  const normalizedSourcePublications = useMemo(
    () =>
      sourcePublications.map((publication) => toStoredPublicationRecord(publication, teams)),
    [sourcePublications, teams],
  );
  const [publications, setPublications] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadPublications() {
      try {
        const records = await fetchAdminContentCollection('publication', abortController.signal);

        if (isCancelled) {
          return;
        }

        const fromApi = records.map((publication) => toStoredPublicationRecord(publication, teams));
        setPublications(mergeRecordsBySlug(normalizedSourcePublications, fromApi));
      } catch {
        if (!isCancelled) {
          setPublications(normalizedSourcePublications);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadPublications();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [normalizedSourcePublications, teams]);

  const enrichedPublications = useMemo(
    () =>
      publications
        .map((publication) => enrichPublication(publication, teams))
        .toSorted((left, right) => right.year - left.year || left.title.localeCompare(right.title)),
    [publications, teams],
  );

  return {
    isReady,
    publications: enrichedPublications,
    findPublicationBySlug(slug) {
      return enrichedPublications.find((publication) => publication.slug === slug) ?? null;
    },
    async createPublication(values) {
      const result = buildStoredPublicationFromForm(values, publications, teams);

      if (!result.payload) {
        return result;
      }

      try {
        const savedPublication = await createAdminContentItem('publication', result.payload);
        const normalizedPublication = toStoredPublicationRecord(savedPublication, teams);
        const nextPublications = [normalizedPublication, ...publications];
        setPublications(nextPublications);
        recordAdminActivity({
          action: 'publication.create',
          afterSnapshot: normalizedPublication,
          entityId: normalizedPublication.id,
          entityLabel: normalizedPublication.title,
          entityType: 'publication',
          summary: `${normalizedPublication.title} was added to the protected publication desk.`,
        });

        return {
          errors: {},
          publication: enrichPublication(normalizedPublication, teams),
          publications: nextPublications,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The publication could not be created.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          publication: null,
        };
      }
    },
    async updatePublication(publicationId, values) {
      const previousPublication = publications.find((publication) => publication.id === publicationId) ?? null;
      const result = buildStoredPublicationFromForm(values, publications, teams, publicationId, previousPublication);

      if (!result.payload) {
        return result;
      }

      try {
        const savedPublication = await updateAdminContentItem('publication', publicationId, result.payload);
        const normalizedPublication = toStoredPublicationRecord(savedPublication, teams);
        const nextPublications = publications.map((publication) => (
          publication.id === publicationId ? normalizedPublication : publication
        ));
        setPublications(nextPublications);
        recordAdminActivity({
          action: 'publication.update',
          afterSnapshot: normalizedPublication,
          beforeSnapshot: previousPublication,
          entityId: normalizedPublication.id,
          entityLabel: normalizedPublication.title,
          entityType: 'publication',
          summary: `${normalizedPublication.title} was updated in the protected publication desk.`,
        });

        return {
          errors: {},
          publication: enrichPublication(normalizedPublication, teams),
          publications: nextPublications,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The publication could not be updated.');
        return {
          errors: apiError.errors,
          message: apiError.message,
          publication: null,
        };
      }
    },
    async deletePublication(publicationId) {
      const previousPublication = publications.find((publication) => publication.id === publicationId) ?? null;

      try {
        await deleteAdminContentItem('publication', publicationId);
        const nextPublications = publications.filter((publication) => publication.id !== publicationId);
        setPublications(nextPublications);

        if (previousPublication) {
          recordAdminActivity({
            action: 'publication.delete',
            beforeSnapshot: previousPublication,
            entityId: previousPublication.id,
            entityLabel: previousPublication.title,
            entityType: 'publication',
            summary: `${previousPublication.title} was removed from the protected publication desk.`,
          });
        }

        return {
          error: '',
          publications: nextPublications,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected publication could not be deleted.',
          publications,
        };
      }
    },
  };
}
