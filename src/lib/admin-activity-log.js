import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-activity-log.v1';
const STORAGE_EVENT = 'research-lab:admin-activity-log:change';
const SESSION_ACTOR_KEY = 'research-lab.admin-session-actor.v1';
const MAX_ACTIVITY_ENTRIES = 250;
const SENSITIVE_KEY_PATTERN = /(password|token|cookie|secret|hash)/i;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createStorageEvent() {
  return new CustomEvent(STORAGE_EVENT);
}

function readStoredJson(key, fallbackValue) {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return fallbackValue;
    }

    const parsed = JSON.parse(raw);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredJson(key, value, { dispatch = false } = {}) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));

  if (dispatch) {
    window.dispatchEvent(createStorageEvent());
  }
}

function removeStoredValue(key) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

function sanitizeActivityValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeActivityValue(entry));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [
          key,
          SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeActivityValue(nestedValue),
        ]),
    );
  }

  return value;
}

function normalizeActor(actor) {
  if (!actor) {
    return {
      email: '',
      fullName: 'Unknown admin',
      id: 'session-unknown',
      role: 'unknown',
      status: '',
    };
  }

  return {
    email: normalizeText(actor.email).toLowerCase(),
    fullName: normalizeText(actor.fullName) || 'Unknown admin',
    id: String(actor.id ?? 'session-unknown'),
    role: normalizeText(actor.role) || 'unknown',
    status: normalizeText(actor.status),
  };
}

export function sanitizeActivitySnapshot(snapshot) {
  return sanitizeActivityValue(snapshot);
}

export function setCurrentAdminActivityActor(user) {
  if (!user) {
    removeStoredValue(SESSION_ACTOR_KEY);
    return;
  }

  writeStoredJson(
    SESSION_ACTOR_KEY,
    normalizeActor(user),
  );
}

export function clearCurrentAdminActivityActor() {
  removeStoredValue(SESSION_ACTOR_KEY);
}

export function readCurrentAdminActivityActor() {
  return normalizeActor(readStoredJson(SESSION_ACTOR_KEY, null));
}

export function readAdminActivityLog() {
  const storedEntries = readStoredJson(STORAGE_KEY, []);
  return Array.isArray(storedEntries) ? storedEntries : [];
}

function writeAdminActivityLog(entries) {
  writeStoredJson(STORAGE_KEY, entries, { dispatch: true });
}

export function recordAdminActivity({
  action,
  actor,
  afterSnapshot = null,
  beforeSnapshot = null,
  entityId = null,
  entityLabel = '',
  entityType = 'system',
  summary = '',
}) {
  if (!canUseStorage()) {
    return null;
  }

  const resolvedActor = normalizeActor(actor ?? readStoredJson(SESSION_ACTOR_KEY, null));
  const entry = {
    action: normalizeText(action),
    actorEmail: resolvedActor.email,
    actorName: resolvedActor.fullName,
    actorRole: resolvedActor.role,
    actorUserId: resolvedActor.id,
    afterSnapshot: afterSnapshot ? sanitizeActivitySnapshot(afterSnapshot) : null,
    beforeSnapshot: beforeSnapshot ? sanitizeActivitySnapshot(beforeSnapshot) : null,
    createdAt: new Date().toISOString(),
    entityId: entityId === null || entityId === undefined ? null : String(entityId),
    entityLabel: normalizeText(entityLabel),
    entityType: normalizeText(entityType) || 'system',
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    summary: normalizeText(summary),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
  const nextEntries = [entry, ...readAdminActivityLog()].slice(0, MAX_ACTIVITY_ENTRIES);

  writeAdminActivityLog(nextEntries);

  return entry;
}

export function useAdminActivityLog() {
  const [entries, setEntries] = useState(() => readAdminActivityLog());
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const syncEntries = () => {
      setEntries(readAdminActivityLog());
      setCurrentTime(Date.now());
    };

    syncEntries();

    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncEntries);
    window.addEventListener('storage', syncEntries);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncEntries);
      window.removeEventListener('storage', syncEntries);
    };
  }, []);

  const derivedState = useMemo(() => {
    const entityTypes = [...new Set(entries.map((entry) => entry.entityType).filter(Boolean))];
    const actionGroups = [
      ...new Set(entries.map((entry) => normalizeText(entry.action).split('.')[0]).filter(Boolean)),
    ];
    const actors = [
        ...new Set(entries.map((entry) => entry.actorName).filter(Boolean)),
      ];

    return {
      actionGroups,
      actors,
      entityTypes,
      lastSevenDaysCount: entries.filter((entry) => {
        const age = currentTime - new Date(entry.createdAt).getTime();
        return Number.isFinite(age) && age <= 7 * 24 * 60 * 60 * 1000;
      }).length,
      sensitiveCount: entries.filter((entry) =>
        /(delete|reset_password|logout_all|login_failed)/.test(entry.action),
      ).length,
    };
  }, [currentTime, entries]);

  return {
    entries,
    ...derivedState,
  };
}
