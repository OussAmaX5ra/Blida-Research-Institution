const STORAGE_KEY = 'research-lab.admin-toast.v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function queueAdminToast(toast) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...toast,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    }),
  );
}

export function consumeQueuedAdminToast() {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
