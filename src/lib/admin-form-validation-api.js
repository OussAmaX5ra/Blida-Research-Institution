function mapValidationDetailsToFieldErrors(details) {
  if (!Array.isArray(details)) {
    return {};
  }

  return details.reduce((errors, detail) => {
    const path = typeof detail?.path === 'string' ? detail.path : '';

    if (!path || errors[path]) {
      return errors;
    }

    return {
      ...errors,
      [path]: detail.message ?? 'This field is invalid.',
    };
  }, {});
}

export async function validateAdminFormOnServer(entityType, values) {
  const response = await fetch(`/api/admin/validation/${entityType}`, {
    body: JSON.stringify(values),
    credentials: 'same-origin',
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
