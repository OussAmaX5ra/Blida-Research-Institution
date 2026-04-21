import { buildApiUrl } from './api-url.js';

const publicEndpoints = {
  siteContext: buildApiUrl('/api/site-context'),
  teams: buildApiUrl('/api/teams'),
  members: buildApiUrl('/api/members'),
  projects: buildApiUrl('/api/projects'),
  publications: buildApiUrl('/api/publications'),
  news: buildApiUrl('/api/news'),
  gallery: buildApiUrl('/api/gallery'),
  phdProgress: buildApiUrl('/api/phd-progress'),
};

export const PUBLIC_DATA_INVALIDATED_EVENT = 'research-lab:public-data-invalidated';

export function notifyPublicDataInvalidated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(PUBLIC_DATA_INVALIDATED_EVENT));
}

async function requestJson(path, signal) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

export async function fetchPublicCollections(signal) {
  const endpointEntries = Object.entries(publicEndpoints);
  const settledResponses = await Promise.allSettled(
    endpointEntries.map(([, path]) => requestJson(path, signal)),
  );

  return Object.fromEntries(
    settledResponses.map((result, index) => {
      const [key] = endpointEntries[index];

      if (result.status === 'fulfilled') {
        return [
          key,
          {
            data: result.value?.data ?? [],
            meta: result.value?.meta ?? {},
          },
        ];
      }

      return [
        key,
        {
          data: [],
          meta: {
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unable to load this public collection.',
          },
        },
      ];
    }),
  );
}
