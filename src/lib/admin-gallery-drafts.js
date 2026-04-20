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

function toStoredGalleryRecord(item, teams) {
  const dateIso = normalizeText(item.dateIso);

  return {
    caption: normalizeText(item.caption),
    category: normalizeText(item.category),
    createdAt: item.createdAt ?? new Date().toISOString(),
    date: normalizeText(item.date) || formatDisplayDate(dateIso),
    dateIso,
    id: String(item.id ?? item.slug),
    image: normalizeText(item.image),
    isLocalOnly: false,
    slug: normalizeText(item.slug),
    status: normalizeText(item.status) || 'Published',
    teamSlug: findTeamSlug(item, teams),
    title: normalizeText(item.title),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
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

function buildStoredGalleryFromForm(values, items, teams, currentId = null, existingItem = null) {
  const validation = validateGalleryDraft(values, items, teams, currentId);

  if (Object.keys(validation.errors).length) {
    return {
      errors: validation.errors,
      item: null,
      payload: null,
    };
  }

  const dateIso = normalizeText(values.dateIso);
  const preview = {
    caption: normalizeText(values.caption),
    category: normalizeText(values.category),
    createdAt: existingItem?.createdAt ?? new Date().toISOString(),
    date: formatDisplayDate(dateIso),
    dateIso,
    id: currentId ?? existingItem?.id ?? '',
    image: normalizeText(values.image),
    isLocalOnly: false,
    slug: buildUniqueSlug(validation.normalizedSlug, items, currentId),
    status: normalizeText(values.status),
    teamSlug: validation.selectedTeam?.slug ?? '',
    title: normalizeText(values.title),
    updatedAt: new Date().toISOString(),
  };

  return {
    errors: {},
    item: preview,
    payload: {
      caption: preview.caption,
      category: preview.category,
      dateIso: preview.dateIso,
      image: preview.image,
      slug: preview.slug,
      status: preview.status,
      teamSlug: preview.teamSlug,
      title: preview.title,
    },
  };
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
  const [gallery, setGallery] = useState(normalizedSourceGallery);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadGallery() {
      try {
        const records = await fetchAdminContentCollection('gallery', abortController.signal);

        if (isCancelled) {
          return;
        }

        setGallery(records.map((item) => toStoredGalleryRecord(item, teams)));
      } catch {
        if (!isCancelled) {
          setGallery(normalizedSourceGallery);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadGallery();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [normalizedSourceGallery, teams]);

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
    async createGallery(values) {
      const result = buildStoredGalleryFromForm(values, gallery, teams);

      if (!result.payload) {
        return result;
      }

      try {
        const savedItem = await createAdminContentItem('gallery', result.payload);
        const normalizedItem = toStoredGalleryRecord(savedItem, teams);
        const nextGallery = [normalizedItem, ...gallery];
        setGallery(nextGallery);
        recordAdminActivity({
          action: 'gallery.create',
          afterSnapshot: normalizedItem,
          entityId: normalizedItem.id,
          entityLabel: normalizedItem.title,
          entityType: 'gallery',
          summary: `${normalizedItem.title} was added to the protected gallery archive.`,
        });

        return {
          errors: {},
          gallery: nextGallery,
          item: enrichGalleryItem(normalizedItem, teams),
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The gallery item could not be created.');
        return {
          errors: apiError.errors,
          item: null,
          message: apiError.message,
        };
      }
    },
    async updateGallery(itemId, values) {
      const previousItem = gallery.find((item) => item.id === itemId) ?? null;
      const result = buildStoredGalleryFromForm(values, gallery, teams, itemId, previousItem);

      if (!result.payload) {
        return result;
      }

      try {
        const savedItem = await updateAdminContentItem('gallery', itemId, result.payload);
        const normalizedItem = toStoredGalleryRecord(savedItem, teams);
        const nextGallery = gallery.map((item) => (item.id === itemId ? normalizedItem : item));
        setGallery(nextGallery);
        recordAdminActivity({
          action: 'gallery.update',
          afterSnapshot: normalizedItem,
          beforeSnapshot: previousItem,
          entityId: normalizedItem.id,
          entityLabel: normalizedItem.title,
          entityType: 'gallery',
          summary: `${normalizedItem.title} was updated in the protected gallery archive.`,
        });

        return {
          errors: {},
          gallery: nextGallery,
          item: enrichGalleryItem(normalizedItem, teams),
        };
      } catch (error) {
        const apiError = mapAdminApiError(error, 'The gallery item could not be updated.');
        return {
          errors: apiError.errors,
          item: null,
          message: apiError.message,
        };
      }
    },
    async deleteGallery(itemId) {
      const previousItem = gallery.find((item) => item.id === itemId) ?? null;

      try {
        await deleteAdminContentItem('gallery', itemId);
        const nextGallery = gallery.filter((item) => item.id !== itemId);
        setGallery(nextGallery);

        if (previousItem) {
          recordAdminActivity({
            action: 'gallery.delete',
            beforeSnapshot: previousItem,
            entityId: previousItem.id,
            entityLabel: previousItem.title,
            entityType: 'gallery',
            summary: `${previousItem.title} was removed from the protected gallery archive.`,
          });
        }

        return {
          error: '',
          gallery: nextGallery,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'The selected gallery item could not be deleted.',
          gallery,
        };
      }
    },
  };
}
