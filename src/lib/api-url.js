const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

function resolveFallbackApiBaseUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname, protocol } = window.location;
  const isKnownVercelDeployment =
    protocol === 'https:' &&
    (hostname === 'blida-research-institution.vercel.app' ||
      /^blida-research-institution(?:-git-[^.]+)?\.vercel\.app$/i.test(hostname));

  return isKnownVercelDeployment ? 'https://blida-research-institution.onrender.com' : '';
}

const apiBaseUrl = configuredApiBaseUrl || resolveFallbackApiBaseUrl();

export function buildApiUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('API paths must start with "/".');
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}
