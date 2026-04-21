import { buildApiUrl } from './api-url.js';

function mapValidationDetailsToFieldErrors(details) {
  if (!Array.isArray(details)) {
    return {};
  }

  return details.reduce((errors, detail) => {
    const path = typeof detail?.path === 'string' ? detail.path : '';
    const root = path.includes('.') ? path.split('.')[0] : path;

    if (!root || errors[root]) {
      return errors;
    }

    return {
      ...errors,
      [root]: detail.message ?? 'This field is invalid.',
    };
  }, {});
}

export async function validateAdminFormOnServer(entityType, values) {
  const response = await fetch(buildApiUrl(`/api/admin/validation/${entityType}`), {
    body: JSON.stringify(values),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 400) {
      return {
        errors: mapValidationDetailsToFieldErrors(payload?.error?.details),
        message: payload?.error?.message ?? 'Server-side validation failed.',
      };
    }

    throw new Error(
      payload?.error?.message ?? payload?.message ?? `Request failed with status ${response.status}.`,
    );
  }

  return {
    errors: {},
    values: payload?.values ?? values,
  };
}
