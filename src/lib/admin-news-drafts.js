import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-news-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-news-drafts:change';
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_STATUSES = new Set(['Published', 'Review', 'Draft']);

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

function readStoredNews() {
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

function writeStoredNews(news) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function toStoredNewsRecord(item, teams, { isLocalOnly = false } = {}) {
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
    isLocalOnly,
    slug: normalizeText(item.slug),
    status: normalizeText(item.status) || 'Published',
    teamSlugs: findTeamSlugs(item, teams),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function ensureSeededNews(sourceNews) {
  const storedNews = readStoredNews();

  if (storedNews?.length) {
    return storedNews;
  }

  if (!sourceNews.length) {
    return [];
  }

  const seededNews = sourceNews.map((item) => item);
  writeStoredNews(seededNews);
  return seededNews;
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

function buildStoredNewsFromForm(values, news, teams, currentId = null) {
  const validation = validateNewsDraft(values, news, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      item: null,
    };
  }

  const existingItem = currentId ? news.find((item) => item.id === currentId) ?? null : null;
  const dateIso = normalizeText(values.dateIso);

  return {
    errors: {},
    item: {
      body: validation.body,
      category: normalizeText(values.category),
      createdAt: existingItem?.createdAt ?? new Date().toISOString(),
      date: formatDisplayDate(dateIso),
      dateIso,
      excerpt: normalizeText(values.excerpt),
      headline: normalizeText(values.headline),
      id: currentId ?? `local-news-${Date.now()}`,
      image: normalizeText(values.image),
      isLocalOnly: existingItem?.isLocalOnly ?? true,
      slug: buildUniqueSlug(validation.normalizedSlug, news, currentId),
      status: normalizeText(values.status),
      teamSlugs: validation.teamSlugs,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createAdminNewsDraft(values, news, teams) {
  const result = buildStoredNewsFromForm(values, news, teams);

  if (!result.item) {
    return result;
  }

  const nextNews = [result.item, ...news];
  writeStoredNews(nextNews);

  return {
    errors: {},
    item: result.item,
    news: nextNews,
  };
}

export function updateAdminNewsDraft(newsId, values, news, teams) {
  const result = buildStoredNewsFromForm(values, news, teams, newsId);

  if (!result.item) {
    return result;
  }

  const nextNews = news.map((item) => (item.id === newsId ? result.item : item));
  writeStoredNews(nextNews);

  return {
    errors: {},
    item: result.item,
    news: nextNews,
  };
}

export function deleteAdminNewsDraft(newsId, news) {
  const nextNews = news.filter((item) => item.id !== newsId);
  writeStoredNews(nextNews);
  return nextNews;
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
  const [news, setNews] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncNews = () => {
      const nextNews = ensureSeededNews(normalizedSourceNews);
      setNews(nextNews);
      setIsReady(true);
    };

    syncNews();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncNews);
    window.addEventListener('storage', syncNews);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncNews);
      window.removeEventListener('storage', syncNews);
    };
  }, [normalizedSourceNews]);

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
    createNews(values) {
      const result = createAdminNewsDraft(values, news, teams);

      if (result.news) {
        setNews(result.news);
      }

      return result;
    },
    updateNews(newsId, values) {
      const result = updateAdminNewsDraft(newsId, values, news, teams);

      if (result.news) {
        setNews(result.news);
      }

      return result;
    },
    deleteNews(newsId) {
      const nextNews = deleteAdminNewsDraft(newsId, news);
      setNews(nextNews);
      return nextNews;
    },
  };
}
