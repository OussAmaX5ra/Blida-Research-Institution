import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-gallery-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-gallery-drafts:change';
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_STATUSES = new Set(['Published', 'Review', 'Draft']);

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function slugifyGalleryTitle(value) {
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

function findTeamSlug(item, teams) {
  if (item.team?.slug) {
    return item.team.slug;
  }

  if (item.teamSlug) {
    return item.teamSlug;
  }

  if (item.teamTag) {
    return teams.find((team) => team.acronym === item.teamTag)?.slug ?? '';
  }

  return '';
}

function readStoredGallery() {
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

function writeStoredGallery(items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function toStoredGalleryRecord(item, teams, { isLocalOnly = false } = {}) {
  const dateIso = normalizeText(item.dateIso);

  return {
    caption: normalizeText(item.caption),
    category: normalizeText(item.category),
    createdAt: item.createdAt ?? new Date().toISOString(),
    date: normalizeText(item.date) || formatDisplayDate(dateIso),
    dateIso,
    id: String(item.id ?? item.slug),
    image: normalizeText(item.image),
    isLocalOnly,
    slug: normalizeText(item.slug),
    status: normalizeText(item.status) || 'Published',
    teamSlug: findTeamSlug(item, teams),
    title: normalizeText(item.title),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function ensureSeededGallery(sourceGallery) {
  const storedGallery = readStoredGallery();

  if (storedGallery?.length) {
    return storedGallery;
  }

  if (!sourceGallery.length) {
    return [];
  }

  const seededGallery = sourceGallery.map((item) => item);
  writeStoredGallery(seededGallery);
  return seededGallery;
}

function buildUniqueSlug(slug, items, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (items.some((item) => item.id !== currentId && item.slug === nextSlug)) {
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

export function validateGalleryDraft(values, items, teams, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyGalleryTitle(values.slug || values.title);
  const selectedTeam = values.teamSlug
    ? teams.find((team) => team.slug === values.teamSlug) ?? null
    : null;

  if (!normalizeText(values.title)) {
    nextErrors.title = 'Title is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (items.some((item) => item.id !== currentId && item.slug === normalizedSlug)) {
    nextErrors.slug = 'Another gallery item already uses this slug.';
  }

  if (!normalizeText(values.category)) {
    nextErrors.category = 'Category is required.';
  }

  if (!ALLOWED_STATUSES.has(normalizeText(values.status))) {
    nextErrors.status = 'Choose Published, Review, or Draft.';
  }

  if (!isValidDateIso(values.dateIso)) {
    nextErrors.dateIso = 'Use a valid capture date in YYYY-MM-DD format.';
  }

  if (!isValidUrlLike(values.image)) {
    nextErrors.image = 'Use an absolute image URL or a root-relative file path.';
  }

  if (!normalizeText(values.caption)) {
    nextErrors.caption = 'Caption is required.';
  } else if (normalizeText(values.caption).length < 25) {
    nextErrors.caption = 'Use at least 25 characters so the caption is meaningful.';
  }

  if (values.teamSlug && !selectedTeam) {
    nextErrors.teamSlug = 'Choose a valid team or leave the item institution-wide.';
  }

  return {
    errors: nextErrors,
    normalizedSlug,
    selectedTeam,
  };
}

function buildStoredGalleryFromForm(values, items, teams, currentId = null) {
  const validation = validateGalleryDraft(values, items, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      item: null,
    };
  }

  const existingItem = currentId ? items.find((item) => item.id === currentId) ?? null : null;
  const dateIso = normalizeText(values.dateIso);

  return {
    errors: {},
    item: {
      caption: normalizeText(values.caption),
      category: normalizeText(values.category),
      createdAt: existingItem?.createdAt ?? new Date().toISOString(),
      date: formatDisplayDate(dateIso),
      dateIso,
      id: currentId ?? `local-gallery-${Date.now()}`,
      image: normalizeText(values.image),
      isLocalOnly: existingItem?.isLocalOnly ?? true,
      slug: buildUniqueSlug(validation.normalizedSlug, items, currentId),
      status: normalizeText(values.status),
      teamSlug: validation.selectedTeam?.slug ?? '',
      title: normalizeText(values.title),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createAdminGalleryDraft(values, items, teams) {
  const result = buildStoredGalleryFromForm(values, items, teams);

  if (!result.item) {
    return result;
  }

  const nextGallery = [result.item, ...items];
  writeStoredGallery(nextGallery);

  return {
    errors: {},
    gallery: nextGallery,
    item: result.item,
  };
}

export function updateAdminGalleryDraft(itemId, values, items, teams) {
  const result = buildStoredGalleryFromForm(values, items, teams, itemId);

  if (!result.item) {
    return result;
  }

  const nextGallery = items.map((item) => (item.id === itemId ? result.item : item));
  writeStoredGallery(nextGallery);

  return {
    errors: {},
    gallery: nextGallery,
    item: result.item,
  };
}

export function deleteAdminGalleryDraft(itemId, items) {
  const nextGallery = items.filter((item) => item.id !== itemId);
  writeStoredGallery(nextGallery);
  return nextGallery;
}

function enrichGalleryItem(item, teams) {
  const team = item.teamSlug
    ? teams.find((entry) => entry.slug === item.teamSlug) ?? null
    : null;

  return {
    ...item,
    team,
    teamTag: team?.acronym ?? '',
  };
}

export function useAdminGalleryDrafts(sourceGallery, teams) {
  const normalizedSourceGallery = useMemo(
    () => sourceGallery.map((item) => toStoredGalleryRecord(item, teams)),
    [sourceGallery, teams],
  );
  const [gallery, setGallery] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncGallery = () => {
      const nextGallery = ensureSeededGallery(normalizedSourceGallery);
      setGallery(nextGallery);
      setIsReady(true);
    };

    syncGallery();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncGallery);
    window.addEventListener('storage', syncGallery);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncGallery);
      window.removeEventListener('storage', syncGallery);
    };
  }, [normalizedSourceGallery]);

  const enrichedGallery = useMemo(
    () =>
      gallery
        .map((item) => enrichGalleryItem(item, teams))
        .toSorted((left, right) => new Date(right.dateIso) - new Date(left.dateIso)),
    [gallery, teams],
  );

  return {
    gallery: enrichedGallery,
    isReady,
    findGalleryBySlug(slug) {
      return enrichedGallery.find((item) => item.slug === slug) ?? null;
    },
    createGallery(values) {
      const result = createAdminGalleryDraft(values, gallery, teams);

      if (result.gallery) {
        setGallery(result.gallery);
      }

      return result;
    },
    updateGallery(itemId, values) {
      const result = updateAdminGalleryDraft(itemId, values, gallery, teams);

      if (result.gallery) {
        setGallery(result.gallery);
      }

      return result;
    },
    deleteGallery(itemId) {
      const nextGallery = deleteAdminGalleryDraft(itemId, gallery);
      setGallery(nextGallery);
      return nextGallery;
    },
  };
}
