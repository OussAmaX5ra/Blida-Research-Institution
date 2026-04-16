import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  Layers3,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { usePublicData } from '../../providers/usePublicData.js';

const sortLabels = {
  name: 'Name A-Z',
  members: 'Most members',
  publications: 'Most publications',
  projects: 'Most projects',
};

const statusMeta = {
  operational: {
    label: 'Operational',
    tone: 'stable',
    description: 'Roster depth and publication evidence are both strong enough for public promotion.',
  },
  'output-watch': {
    label: 'Output watch',
    tone: 'warn',
    description: 'Project activity is visible, but publication density still needs editorial follow-through.',
  },
  'roster-watch': {
    label: 'Roster watch',
    tone: 'muted',
    description: 'The team profile is coherent, though the current roster is still compact for long-term visibility.',
  },
};

function deriveTeamStatus(team) {
  if ((team.publicationCount ?? 0) < 2) {
    return 'output-watch';
  }

  if ((team.memberCount ?? 0) < 5) {
    return 'roster-watch';
  }

  return 'operational';
}

function TeamStatusBadge({ statusId }) {
  const status = statusMeta[statusId];

  return (
    <span className={`admin-status-badge admin-status-badge-${status.tone}`}>
      {status.label}
    </span>
  );
}

function AdminTeamsLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Teams Registry</p>
        <h3>Loading the protected teams roster.</h3>
        <p className="admin-body-copy">
          The admin list view is hydrating the same public collections that already power the live
          institutional site so the management surface can render with real team signals.
        </p>
      </article>
    </section>
  );
}

function AdminTeamsErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">Teams Registry</p>
        <h3>The teams management view could not load.</h3>
        <p className="admin-body-copy">
          The protected shell is ready, but the collection feed behind the roster needs the public
          API before the list can render.
        </p>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry the roster feed
        </button>
      </article>
    </section>
  );
}

function TeamsToolbar({
  axisOptions,
  axisValue,
  onAxisChange,
  onNavigate,
  onRefresh,
  onSearchChange,
  onSortChange,
  onStatusChange,
  searchValue,
  sortValue,
  statusCounts,
  statusValue,
  isRefreshing,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Teams Registry</p>
        <h3>The team desk now supports create, edit, and delete workflows on top of the live roster view.</h3>
        <p className="admin-body-copy">
          These actions are implemented as protected admin drafts for now, which means the workflow
          is real in the UI even before database-backed CRUD arrives. The next backend phase can
          connect this exact interface to persisted team endpoints.
        </p>

        <div className="admin-summary-strip">
          <div className="admin-summary-chip">
            <span>Operational</span>
            <strong>{statusCounts.operational ?? 0}</strong>
          </div>
          <div className="admin-summary-chip">
            <span>Output watch</span>
            <strong>{statusCounts['output-watch'] ?? 0}</strong>
          </div>
          <div className="admin-summary-chip">
            <span>Roster watch</span>
            <strong>{statusCounts['roster-watch'] ?? 0}</strong>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Layers3 size={16} />
          Management controls
        </div>

        <div className="admin-toolbar-stack">
          <label className="admin-search-field">
            <Search size={16} />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by team, leader, focus, or theme"
            />
          </label>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Axis</span>
              <select value={axisValue} onChange={(event) => onAxisChange(event.target.value)}>
                <option value="all">All axes</option>
                {axisOptions.map((axis) => (
                  <option key={axis.id} value={axis.id}>
                    {axis.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Status</span>
              <select value={statusValue} onChange={(event) => onStatusChange(event.target.value)}>
                <option value="all">All statuses</option>
                {Object.entries(statusMeta).map(([value, status]) => (
                  <option key={value} value={value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Sort</span>
              <select value={sortValue} onChange={(event) => onSortChange(event.target.value)}>
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-toolbar-actions">
            <button type="button" className="admin-secondary-button" onClick={onRefresh}>
              <RefreshCw size={15} className={isRefreshing ? 'admin-spin' : undefined} />
              Refresh collections
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={(event) => onNavigate(event, '/admin/teams/new')}
            >
              <Plus size={15} />
              Add team
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

function TeamRow({ row, onDeleteRequest, onNavigate }) {
  return (
    <article className="admin-team-row">
      <div className="admin-team-row-header">
        <div className="admin-team-row-title">
          <div className="admin-team-title-line">
            <span className="admin-team-acronym">{row.acronym}</span>
            <TeamStatusBadge statusId={row.statusId} />
            <span className="admin-team-axis-pill">{row.axisName}</span>
            {row.isLocalOnly ? <span className="admin-local-pill">Draft only</span> : null}
          </div>
          <h4>{row.name}</h4>
          <p>{row.focus}</p>
        </div>

        <div className="admin-team-row-actions">
          <button
            type="button"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/admin/teams/${row.slug}/edit`)}
          >
            <PencilLine size={14} />
            Edit team
          </button>
          <button
            type="button"
            className="admin-inline-link admin-inline-link-danger"
            onClick={() => onDeleteRequest(row)}
          >
            <Trash2 size={14} />
            Delete team
          </button>
          {row.isLocalOnly ? (
            <span className="admin-row-note">Local admin draft until backend CRUD is wired.</span>
          ) : (
            <a
              href={`/teams/${row.slug}`}
              className="admin-inline-link"
              onClick={(event) => onNavigate(event, `/teams/${row.slug}`)}
            >
              Open public profile
              <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="admin-team-metadata-grid">
        <div className="admin-team-metadata-cell">
          <span>Leader</span>
          <strong>{row.leader}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Members</span>
          <strong>{row.memberCount}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Projects</span>
          <strong>{row.projectCount}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Publications</span>
          <strong>{row.publicationCount}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Role mix</span>
          <strong>{row.roleMix}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Health note</span>
          <strong>{row.statusDescription}</strong>
        </div>
      </div>

      <div className="admin-team-footer">
        <div className="admin-team-theme-row">
          {row.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
        <div className="admin-team-signal">
          <Users2 size={15} />
          {row.memberCount} people across {row.projectCount} active project lines
        </div>
      </div>
    </article>
  );
}

export default function AdminTeamsPage({ onNavigate }) {
  const {
    collections: { teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
  } = usePublicData();
  const { deleteTeam, isReady, teams } = useAdminTeamDrafts(sourceTeams);
  const [pendingDeleteTeam, setPendingDeleteTeam] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [axisValue, setAxisValue] = useState('all');
  const [statusValue, setStatusValue] = useState('all');
  const [sortValue, setSortValue] = useState('members');
  const deferredSearchValue = useDeferredValue(searchValue);

  const teamRows = useMemo(
    () =>
      teams.map((team) => {
        const statusId = deriveTeamStatus(team);
        const professorCount = team.memberCounts?.Professor ?? 0;
        const doctorCount = team.memberCounts?.Doctor ?? 0;
        const phdCount = team.memberCounts?.['PhD Student'] ?? 0;

        return {
          acronym: team.acronym,
          axisId: team.axis?.id ?? team.axisId ?? 'unassigned',
          axisName: team.axis?.name ?? 'Unassigned axis',
          focus: team.focus,
          id: team.id,
          isLocalOnly: Boolean(team.isLocalOnly),
          leader: team.leader,
          memberCount: team.memberCount ?? 0,
          name: team.name,
          projectCount: team.projectCount ?? 0,
          publicationCount: team.publicationCount ?? 0,
          roleMix: `${professorCount}P / ${doctorCount}D / ${phdCount}PhD`,
          slug: team.slug,
          statusDescription: statusMeta[statusId].description,
          statusId,
          summary: team.summary,
          themes: team.themes ?? [],
        };
      }),
    [teams],
  );

  const axisOptions = useMemo(
    () =>
      teamRows
        .map((team) => ({ id: team.axisId, name: team.axisName }))
        .filter(
          (axis, index, array) =>
            array.findIndex((candidate) => candidate.id === axis.id) === index,
        )
        .toSorted((left, right) => left.name.localeCompare(right.name)),
    [teamRows],
  );

  const statusCounts = useMemo(
    () =>
      teamRows.reduce(
        (counts, row) => ({
          ...counts,
          [row.statusId]: (counts[row.statusId] ?? 0) + 1,
        }),
        {},
      ),
    [teamRows],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextRows = teamRows.filter((row) => {
      const matchesSearch = normalizedSearch
        ? [row.name, row.acronym, row.leader, row.focus, row.summary, row.themes.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesAxis = axisValue === 'all' ? true : row.axisId === axisValue;
      const matchesStatus = statusValue === 'all' ? true : row.statusId === statusValue;

      return matchesSearch && matchesAxis && matchesStatus;
    });

    return nextRows.toSorted((left, right) => {
      if (sortValue === 'name') {
        return left.name.localeCompare(right.name);
      }

      if (sortValue === 'publications') {
        return right.publicationCount - left.publicationCount || left.name.localeCompare(right.name);
      }

      if (sortValue === 'projects') {
        return right.projectCount - left.projectCount || left.name.localeCompare(right.name);
      }

      return right.memberCount - left.memberCount || left.name.localeCompare(right.name);
    });
  }, [axisValue, deferredSearchValue, sortValue, statusValue, teamRows]);

  if ((!hasLoaded && isLoading) || !isReady) {
    return <AdminTeamsLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminTeamsErrorState error={error} onRetry={retry} />;
  }

  const totalResearchers = teamRows.reduce((sum, row) => sum + row.memberCount, 0);
  const totalProjects = teamRows.reduce((sum, row) => sum + row.projectCount, 0);

  function handleDeleteConfirm() {
    if (!pendingDeleteTeam || deleteConfirmation !== pendingDeleteTeam.slug) {
      return;
    }

    deleteTeam(pendingDeleteTeam.id);
    setPendingDeleteTeam(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <TeamsToolbar
          axisOptions={axisOptions}
          axisValue={axisValue}
          onAxisChange={setAxisValue}
          onNavigate={onNavigate}
          onRefresh={retry}
          onSearchChange={setSearchValue}
          onSortChange={setSortValue}
          onStatusChange={setStatusValue}
          searchValue={searchValue}
          sortValue={sortValue}
          statusCounts={statusCounts}
          statusValue={statusValue}
          isRefreshing={isRefreshing}
        />

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <ShieldCheck size={16} />
            Registry snapshot
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>{teamRows.length} teams are currently indexed.</h4>
              <p>The protected list is now working from a dedicated admin draft store rather than a read-only placeholder.</p>
            </div>
            <div className="admin-note-item">
              <h4>{totalResearchers} researchers are visible across the roster.</h4>
              <p>Role separation remains intact, so future CRUD can preserve professors, doctors, and PhD students cleanly.</p>
            </div>
            <div className="admin-note-item">
              <h4>{totalProjects} active project lines anchor the team profiles.</h4>
              <p>That gives the admin side enough context to judge whether a team page is promotion-ready before publishing changes later.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <Layers3 size={16} />
            Team list
          </div>

          {filteredRows.length ? (
            <div className="admin-team-list">
              {filteredRows.map((row) => (
                <TeamRow
                  key={row.id}
                  row={row}
                  onDeleteRequest={(team) => {
                    setPendingDeleteTeam(team);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching teams</p>
              <h3>The current filters hide the whole roster.</h3>
              <p className="admin-body-copy">
                Try widening the search or resetting the axis and status filters to bring the team
                registry back into view.
              </p>
            </div>
          )}
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete team"
        confirmValue={deleteConfirmation}
        description={
          pendingDeleteTeam
            ? `This removes ${pendingDeleteTeam.name} from the admin draft registry. Type "${pendingDeleteTeam.slug}" to confirm the delete workflow.`
            : ''
        }
        isOpen={Boolean(pendingDeleteTeam)}
        onCancel={() => {
          setPendingDeleteTeam(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeleteTeam ? `Delete ${pendingDeleteTeam.name}?` : 'Delete team?'}
      />
    </>
  );
}
