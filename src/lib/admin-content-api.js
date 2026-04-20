import { notifyPublicDataInvalidated } from './public-api.js';

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
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
    error.details = payload?.error?.details ?? payload?.details ?? [];
    throw error;
  }

  return payload;
}

function mapValidationError(error) {
  const details = Array.isArray(error?.details) ? error.details : [];
  return Object.fromEntries(
    details
      .filter((detail) => typeof detail?.path === 'string' && detail.path.length > 0)
      .map((detail) => {
        const root = detail.path.includes('.') ? detail.path.split('.')[0] : detail.path;
        return [root, detail.message ?? 'This field is invalid.'];
      }),
  );
}

export async function fetchAdminContentCollection(entityType, signal) {
  const payload = await requestJson(`/api/admin/content/${entityType}`, {
    method: 'GET',
    signal,
  });

  return payload?.data ?? [];
}

export async function createAdminContentItem(entityType, values) {
  const payload = await requestJson(`/api/admin/content/${entityType}`, {
    method: 'POST',
    body: JSON.stringify(values),
  });

  notifyPublicDataInvalidated();
  return payload?.data ?? null;
}

export async function updateAdminContentItem(entityType, id, values) {
  const payload = await requestJson(`/api/admin/content/${entityType}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  });

  notifyPublicDataInvalidated();
  return payload?.data ?? null;
}

export async function deleteAdminContentItem(entityType, id) {
  const payload = await requestJson(`/api/admin/content/${entityType}/${id}`, {
    method: 'DELETE',
  });

  notifyPublicDataInvalidated();
  return payload?.data ?? null;
}

export async function fetchAdminUsers(signal) {
  const payload = await requestJson('/api/admin/content/users', {
    method: 'GET',
    signal,
  });

  return payload?.data ?? [];
}

export async function updateAdminUserAccess(accountId, values) {
  const payload = await requestJson(`/api/admin/content/users/${accountId}/access`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });

  return payload?.data ?? null;
}

export async function issueAdminUserPasswordReset(accountId) {
  const payload = await requestJson(`/api/admin/content/users/${accountId}/password-reset`, {
    method: 'POST',
  });

  return {
    account: payload?.data ?? null,
    temporaryPassword: payload?.temporaryPassword ?? '',
  };
}

export function mapAdminApiError(error, fallbackMessage) {
  return {
    errors: mapValidationError(error),
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}
