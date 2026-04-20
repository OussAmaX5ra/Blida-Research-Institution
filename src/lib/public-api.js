const publicEndpoints = {
  siteContext: '/api/site-context',
  teams: '/api/teams',
  members: '/api/members',
  projects: '/api/projects',
  publications: '/api/publications',
  news: '/api/news',
  gallery: '/api/gallery',
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
    credentials: 'same-origin',
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
