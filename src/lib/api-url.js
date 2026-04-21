const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

export function buildApiUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('API paths must start with "/".');
  }

  return configuredApiBaseUrl ? `${configuredApiBaseUrl}${path}` : path;
}

