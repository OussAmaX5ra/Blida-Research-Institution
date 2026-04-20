import { useDeferredValue, useMemo, useState } from 'react';
import {
  History,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Users2,
} from 'lucide-react';

import { useAdminActivityLog } from '../../lib/admin-activity-log.js';

const dateWindowOptions = {
  all: 'All time',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

const entityTypeLabels = {
  gallery: 'Gallery',
  member: 'Member',
  news: 'News',
  project: 'Project',
  publication: 'Publication',
  system: 'System',
  team: 'Team',
  user: 'User',
};

const verbLabels = {
  create: 'Created',
  delete: 'Deleted',
  login: 'Signed in',
  login_failed: 'Login failed',
  logout: 'Signed out',
  logout_all: 'Closed all sessions',
  reset_password: 'Issued reset',
  update: 'Updated',
};

function formatTimestamp(value) {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return 'Unknown time';
  }

  return timestamp.toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildActionLabel(action) {
  const [domain, verb] = String(action).split('.');
  const domainLabel = entityTypeLabels[domain] ?? domain ?? 'System';
  const verbLabel = verbLabels[verb] ?? verb?.replaceAll('_', ' ') ?? action;

  return `${domainLabel} | ${verbLabel}`;
}

function buildWindowThreshold(windowValue) {
  if (windowValue === '24h') {
    return Date.now() - 24 * 60 * 60 * 1000;
  }

  if (windowValue === '7d') {
    return Date.now() - 7 * 24 * 60 * 60 * 1000;
  }

  if (windowValue === '30d') {
    return Date.now() - 30 * 24 * 60 * 60 * 1000;
  }

  return null;
}

function formatSnapshot(snapshot) {
  const serialized = JSON.stringify(snapshot, null, 2);
  return serialized.length > 500 ? `${serialized.slice(0, 500)}...` : serialized;
}

function ActivityEntry({ entry }) {
  return (
    <article
      className="rounded-[1.6rem] border p-5"
      style={{
        background: 'rgba(255,255,255,0.72)',
        borderColor: 'rgba(13,17,23,0.08)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-section-kicker">{buildActionLabel(entry.action)}</p>
          <h4 className="text-xl font-semibold text-[var(--color-ink)]">
            {entry.entityLabel || entityTypeLabels[entry.entityType] || 'Protected system event'}
          </h4>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {entry.summary || 'A protected admin action was recorded in the activity stream.'}
          </p>
        </div>

        <div className="text-right text-sm text-[var(--color-muted)]">
          <p>{formatTimestamp(entry.createdAt)}</p>
          <p>{entry.actorName || 'Unknown admin'}</p>
          <p>{entry.actorRole ? entry.actorRole.replaceAll('_', ' ') : 'unknown role'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.2rem] border border-black/8 bg-white/70 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Before
          </span>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-[var(--color-ink)]">
            {entry.beforeSnapshot ? formatSnapshot(entry.beforeSnapshot) : 'No previous snapshot recorded.'}
          </pre>
        </div>

        <div className="rounded-[1.2rem] border border-black/8 bg-white/70 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            After
          </span>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-[var(--color-ink)]">
            {entry.afterSnapshot ? formatSnapshot(entry.afterSnapshot) : 'No next snapshot recorded.'}
          </pre>
        </div>
      </div>
    </article>
  );
}

export default function AdminActivityPage() {
  const { actionGroups, actors, entries, entityTypes, lastSevenDaysCount, sensitiveCount } = useAdminActivityLog();
  const [searchValue, setSearchValue] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedActionGroup, setSelectedActionGroup] = useState('all');
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const [selectedWindow, setSelectedWindow] = useState('7d');
  const deferredSearchValue = useDeferredValue(searchValue);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();
    const threshold = buildWindowThreshold(selectedWindow);

    return entries.filter((entry) => {
      const entryTimestamp = new Date(entry.createdAt).getTime();
      const actionGroup = String(entry.action).split('.')[0];
      const matchesSearch = normalizedSearch
        ? [
            entry.action,
            entry.actorEmail,
            entry.actorName,
            entry.entityLabel,
            entry.entityType,
            entry.summary,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesActor = selectedActor === 'all' ? true : entry.actorName === selectedActor;
      const matchesAction = selectedActionGroup === 'all' ? true : actionGroup === selectedActionGroup;
      const matchesEntity = selectedEntityType === 'all' ? true : entry.entityType === selectedEntityType;
      const matchesWindow = threshold === null
        ? true
        : Number.isFinite(entryTimestamp) && entryTimestamp >= threshold;

      return matchesSearch && matchesActor && matchesAction && matchesEntity && matchesWindow;
    });
  }, [
    deferredSearchValue,
    entries,
    selectedActionGroup,
    selectedActor,
    selectedEntityType,
    selectedWindow,
  ]);

  const uniqueActorsInView = useMemo(
    () => new Set(filteredEntries.map((entry) => entry.actorName)).size,
    [filteredEntries],
  );

  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Audit Stream</p>
        <h3>The admin workspace now keeps an append-only record of important protected actions.</h3>
        <p className="admin-body-copy">
          Logins, draft CRUD changes, access updates, and password reset workflows are now written
          into a shared audit stream so the current Milestone 3 admin surface has real operational
          memory instead of a placeholder route.
        </p>

        <div className="admin-summary-strip">
          <div className="admin-summary-chip">
            <span>Visible events</span>
            <strong>{filteredEntries.length}</strong>
          </div>
          <div className="admin-summary-chip">
            <span>Actors in view</span>
            <strong>{uniqueActorsInView}</strong>
          </div>
          <div className="admin-summary-chip">
            <span>Last 7 days</span>
            <strong>{lastSevenDaysCount}</strong>
          </div>
          <div className="admin-summary-chip">
            <span>Sensitive actions</span>
            <strong>{sensitiveCount}</strong>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <History size={16} />
          Activity controls
        </div>

        <div className="admin-toolbar-stack">
          <label className="admin-search-field">
            <Search size={16} />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by actor, action, entity, or summary"
            />
          </label>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Actor</span>
              <select value={selectedActor} onChange={(event) => setSelectedActor(event.target.value)}>
                <option value="all">All actors</option>
                {actors.map((actor) => (
                  <option key={actor} value={actor}>
                    {actor}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Action</span>
              <select value={selectedActionGroup} onChange={(event) => setSelectedActionGroup(event.target.value)}>
                <option value="all">All action groups</option>
                {actionGroups.map((actionGroup) => (
                  <option key={actionGroup} value={actionGroup}>
                    {entityTypeLabels[actionGroup] ?? actionGroup}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Entity</span>
              <select value={selectedEntityType} onChange={(event) => setSelectedEntityType(event.target.value)}>
                <option value="all">All entity types</option>
                {entityTypes.map((entityType) => (
                  <option key={entityType} value={entityType}>
                    {entityTypeLabels[entityType] ?? entityType}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Date window</span>
              <select value={selectedWindow} onChange={(event) => setSelectedWindow(event.target.value)}>
                {Object.entries(dateWindowOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Users2 size={16} />
          What is being tracked
        </div>

        <div className="admin-note-list">
          <div className="admin-note-item">
            <h4>Protected content changes now leave a trail.</h4>
            <p>Teams, members, projects, publications, news, and gallery draft mutations are all recorded.</p>
          </div>
          <div className="admin-note-item">
            <h4>Access-sensitive workflows are visible too.</h4>
            <p>User access updates, password reset issuance, sign-ins, sign-outs, and failed login attempts appear here.</p>
          </div>
          <div className="admin-note-item">
            <h4>Snapshots are sanitized before storage.</h4>
            <p>Keys that look like passwords, tokens, cookies, secrets, or hashes are redacted before they reach the audit stream.</p>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ShieldCheck size={16} />
          Review signals
        </div>

        <div className="admin-note-list">
          <div className="admin-note-item">
            <h4>{filteredEntries.filter((entry) => entry.action.endsWith('.delete')).length} delete actions are visible in the current review window.</h4>
            <p>Destructive events keep their pre-change snapshots so you can confirm what left the protected registry.</p>
          </div>
          <div className="admin-note-item">
            <h4>{filteredEntries.filter((entry) => entry.action === 'user.reset_password').length} password reset events are currently in view.</h4>
            <p>Temporary passwords are never stored in the audit stream, but the reset workflow itself remains visible for accountability.</p>
          </div>
          <div className="admin-note-item">
            <h4>{filteredEntries.filter((entry) => entry.action.startsWith('auth.')).length} authentication events match the active filters.</h4>
            <p>The audit desk can now separate content activity from sign-in and sign-out behavior.</p>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card admin-editorial-card-wide">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Activity feed
        </div>

        {filteredEntries.length ? (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <ActivityEntry key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <p className="admin-section-kicker">No matching activity</p>
            <h3>The current filters hide the audit stream.</h3>
            <p className="admin-body-copy">
              Try widening the date window or clearing one of the filters to bring protected actions back into view.
            </p>
          </div>
        )}
      </article>

      <article className="admin-editorial-card admin-editorial-card-alert">
        <div className="admin-panel-heading">
          <Siren size={16} />
          Milestone note
        </div>
        <p className="admin-body-copy">
          This audit stream is intentionally browser-backed for the current Milestone 3 admin
          architecture, which still uses protected local draft stores for most CRUD workflows. It
          gives the admin portal meaningful accountability now and creates a clean handoff point for
          later database-backed audit persistence.
        </p>
      </article>
    </section>
  );
}
