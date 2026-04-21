import { buildApiUrl } from './api-url.js';

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error?.message ?? payload?.message ?? `Request failed with status ${response.status}.`,
    );
    error.status = response.status;
    throw error;
  }

  return payload;
}

export async function loginAdmin({ email, password }) {
  const payload = await requestJson(buildApiUrl('/api/admin/auth/login'), {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  return payload?.user ?? null;
}

export async function fetchCurrentAdmin(signal) {
  const payload = await requestJson(buildApiUrl('/api/admin/auth/me'), {
    method: 'GET',
    signal,
  });

  return payload?.user ?? null;
}

export async function refreshAdminSession(signal) {
  const payload = await requestJson(buildApiUrl('/api/admin/auth/refresh'), {
    method: 'POST',
    signal,
  });

  return payload?.user ?? null;
}

export async function loadCurrentAdmin(signal, { attemptRefresh = true } = {}) {
  try {
    return await fetchCurrentAdmin(signal);
  } catch (error) {
    if (error?.status !== 401) {
      throw error;
    }
  }

  if (!attemptRefresh) {
    return null;
  }

  await refreshAdminSession(signal);
  return fetchCurrentAdmin(signal);
}

export async function logoutAdmin() {
  await fetch(buildApiUrl('/api/admin/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
}

export async function updateCurrentUserProfile(signal, values) {
  const payload = await requestJson(buildApiUrl('/api/admin/auth/settings/profile'), {
    method: 'PUT',
    signal,
    body: JSON.stringify(values),
  });

  return payload?.user ?? null;
}
