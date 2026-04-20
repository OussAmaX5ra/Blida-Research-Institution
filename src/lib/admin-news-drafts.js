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

export function slugifyNewsHeadline(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDisplayDate(dateIso) {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function findTeamSlugs(item, teams) {
  if (Array.isArray(item.teamSlugs) && item.teamSlugs.length) {
    return item.teamSlugs;
  }

  if (Array.isArray(item.teams) && item.teams.length) {
    return item.teams.map((team) => team.slug).filter(Boolean);
  }

  if (Array.isArray(item.teamTags) && item.teamTags.length) {
    return item.teamTags
      .map((teamTag) => teams.find((team) => team.acronym === teamTag)?.slug ?? '')
      .filter(Boolean);
  }

  return [];
}

function toStoredNewsRecord(item, teams) {
  const dateIso = normalizeText(item.dateIso);

  return {
    body: parseList(item.body),
    category: normalizeText(item.category),
    createdAt: item.createdAt ?? new Date().toISOString(),
    date: normalizeText(item.date) || formatDisplayDate(dateIso),
    dateIso,
    excerpt: normalizeText(item.excerpt),
    headline: normalizeText(item.headline),
    id: String(item.id ?? item.slug),
    image: normalizeText(item.image),
    isLocalOnly: false,
    slug: normalizeText(item.slug),
    status: normalizeText(item.status) || 'Published',
    teamSlugs: findTeamSlugs(item, teams),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function buildUniqueSlug(slug, news, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (news.some((item) => item.id !== currentId && item.slug === nextSlug)) {
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

  return /^(https?:\/\/|\/)/.test(normalized);
}

function isValidDateIso(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizeText(value))) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function validateNewsDraft(values, news, teams, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyNewsHeadline(values.slug || values.headline);
  const body = parseList(values.body);
  const teamSlugs = Array.isArray(values.teamSlugs)
    ? values.teamSlugs.filter(Boolean)
    : parseList(values.teamSlugs);

  if (!normalizeText(values.headline)) {
    nextErrors.headline = 'Headline is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (news.some((item) => item.id !== currentId && item.slug === normalizedSlug)) {
    nextErrors.slug = 'Another story already uses this slug.';
  }

  if (!normalizeText(values.category)) {
    nextErrors.category = 'Category is required.';
  }

  if (!ALLOWED_STATUSES.has(normalizeText(values.status))) {
    nextErrors.status = 'Choose Published, Review, or Draft.';
  }

  if (!isValidDateIso(values.dateIso)) {
    nextErrors.dateIso = 'Use a valid publish date in YYYY-MM-DD format.';
  }

  if (!isValidUrlLike(values.image)) {
    nextErrors.image = 'Use an absolute image URL or a root-relative file path.';
  }

  if (!normalizeText(values.excerpt)) {
    nextErrors.excerpt = 'Excerpt is required.';
  } else if (normalizeText(values.excerpt).length < 30) {
    nextErrors.excerpt = 'Use at least 30 characters so the excerpt is meaningful.';
  }

  if (!body.length) {
    nextErrors.body = 'Add at least one story paragraph.';
  }

  if (!teamSlugs.length) {
    nextErrors.teamSlugs = 'Link the story to at least one team.';
  } else if (teamSlugs.some((teamSlug) => !teams.some((team) => team.slug === teamSlug))) {
    nextErrors.teamSlugs = 'Each linked team must exist in the protected team registry.';
  }

  return {
    body,
    errors: nextErrors,
    normalizedSlug,
    teamSlugs,
  };
}

function buildStoredNewsFromForm(values, news, teams, currentId = null, existingItem = null) {
  const validation = validateNewsDraft(values, news, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      item: null,
      payload: null,
    };
  }

  const dateIso = normalizeText(values.dateIso);
  const preview = {
    body: validation.body,
    category: normalizeText(values.category),
    createdAt: existingItem?.createdAt ?? new Date().toISOString(),
    date: formatDisplayDate(dateIso),
    dateIso,
    excerpt: normalizeText(values.excerpt),
    headline: normalizeText(values.headline),
    id: currentId ?? existingItem?.id ?? '',
    image: normalizeText(values.image),
    isLocalOnly: false,
    slug: buildUniqueSlug(validation.normalizedSlug, news, currentId),
    status: normalizeText(values.status),
    teamSlugs: validation.teamSlugs,
    updatedAt: new Date().toISOString(),
  };

  return {
    errors: {},
    item: preview,
    payload: {
      body: preview.body,
      category: preview.category,
      dateIso: preview.dateIso,
      excerpt: preview.excerpt,
      headline: preview.headline,
      image: preview.image,
      slug: preview.slug,
      status: preview.status,
      teamSlugs: preview.teamSlugs,
    },
  };
}

function enrichNewsItem(item, teams) {
  const relatedTeams = item.teamSlugs
    .map((teamSlug) => teams.find((team) => team.slug === teamSlug))
    .filter(Boolean);

  return {
    ...item,
    teamTags: relatedTeams.map((team) => team.acronym),
    teams: relatedTeams,
  };
}

export function useAdminNewsDrafts(sourceNews, teams) {
  const normalizedSourceNews = useMemo(
    () => sourceNews.map((item) => toStoredNewsRecord(item, teams)),
    [sourceNews, teams],
  );
  const [news, setNews] = useState(normalizedSourceNews);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadNews() {
      try {
        const records = await fetchAdminContentCollection('news', abortController.signal);

        if (isCancelled) {
          return;
        }

        setNews(records.map((item) => toStoredNewsRecord(item, teams)));
      } catch {
        if (!isCancelled) {
          setNews(normalizedSourceNews);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadNews();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [normalizedSourceNews, teams]);

  const enrichedNews = useMemo(
    () =>
      news
        .map((item) => enrichNewsItem(item, teams))
        .toSorted((left, right) => new Date(right.dateIso) - new Date(left.dateIso)),
    [news, teams],
  );

  return {
    isReady,
    news: enrichedNews,
    findNewsBySlug(slug) {
      return enrichedNews.find((item) => item.slug === slug) ?? null;
    },
    async createNews(values) {
      const result = buildStoredNewsFromForm(values, news, teams);

      if (!result.payload) {
        return result;
      }

      try {
        const savedItem = await createAdminContentItem('news', result.payload);
        const normalizedItem = toStoredNewsRecord(savedItem, teams);
        const nextNews = [normalizedItem, ...news];
        setNews(nextNews);
        recordAdminActivity({
          action: 'news.create',
          afterSnapshot: normalizedItem,
          entityId: normalizedItem.id,
          entityLabel: normalizedItem.headline,
          entityType: 'news',
          summary: `${normalizedItem.headline} was added to the protected news desk.`,
        });

        return {
          errors: {},
          item: enrichNewsItem(normalizedItem, teams),
          news: nextNews,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The news item could not be created.');
        return {
          errors: apiError.errors,
          item: null,
          message: apiError.message,
        };
      }
    },
    async updateNews(newsId, values) {
      const previousItem = news.find((item) => item.id === newsId) ?? null;
      const result = buildStoredNewsFromForm(values, news, teams, newsId, previousItem);

      if (!result.payload) {
        return result;
      }

      try {
        const savedItem = await updateAdminContentItem('news', newsId, result.payload);
        const normalizedItem = toStoredNewsRecord(savedItem, teams);
        const nextNews = news.map((item) => (item.id === newsId ? normalizedItem : item));
        setNews(nextNews);
        recordAdminActivity({
          action: 'news.update',
          afterSnapshot: normalizedItem,
          beforeSnapshot: previousItem,
          entityId: normalizedItem.id,
          entityLabel: normalizedItem.headline,
          entityType: 'news',
          summary: `${normalizedItem.headline} was updated in the protected news desk.`,
        });

        return {
          errors: {},
          item: enrichNewsItem(normalizedItem, teams),
          news: nextNews,
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The news item could not be updated.');
        return {
          errors: apiError.errors,
          item: null,
          message: apiError.message,
        };
      }
    },
    async deleteNews(newsId) {
      const previousItem = news.find((item) => item.id === newsId) ?? null;

      try {
        await deleteAdminContentItem('news', newsId);
        const nextNews = news.filter((item) => item.id !== newsId);
        setNews(nextNews);

        if (previousItem) {
          recordAdminActivity({
            action: 'news.delete',
            beforeSnapshot: previousItem,
            entityId: previousItem.id,
            entityLabel: previousItem.headline,
            entityType: 'news',
            summary: `${previousItem.headline} was removed from the protected news desk.`,
          });
        }

        return {
          error: '',
          news: nextNews,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected news item could not be deleted.',
          news,
        };
      }
    },
  };
}
