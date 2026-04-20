import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarRange,
  Layers3,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import { fallbackSiteContext } from '../../lib/site-context.js';
import { useAdminMemberDrafts } from '../../lib/admin-member-drafts.js';
import { useAdminProjectDrafts } from '../../lib/admin-project-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOrder = ['Ongoing', 'Planned', 'Completed'];
const sortLabels = {
  title: 'Title A-Z',
  year: 'Newest year',
  team: 'Team name',
  status: 'Status order',
};

function AdminProjectsLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Projects Desk</p>
        <h3>Loading the protected project registry.</h3>
        <p className="admin-body-copy">
          The admin projects desk is hydrating team, member, and project context before the
          management workflow can render.
        </p>
      </article>
    </section>
  );
}

function AdminProjectsErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">Projects Desk</p>
        <h3>The projects management view could not load.</h3>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry project collections
        </button>
      </article>
    </section>
  );
}

function ProjectToolbar({
  isRefreshing,
  onNavigate,
  onRefresh,
  searchValue,
  selectedStatus,
  selectedTeam,
  selectedYear,
  setSearchValue,
  setSelectedStatus,
  setSelectedTeam,
  setSelectedYear,
  setSortValue,
  sortValue,
  statusCounts,
  teamOptions,
  yearOptions,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Projects Desk</p>
        <h3>The protected project workflow now covers list, create, edit, and delete inside one management surface.</h3>
        <p className="admin-body-copy">
          Projects are now treated as operational records with visible team ownership, lead
          assignment, project status, and milestone context rather than placeholder route content.
        </p>

        <div className="admin-summary-strip">
          {statusOrder.map((status) => (
            <div key={status} className="admin-summary-chip">
              <span>{status}</span>
              <strong>{statusCounts[status] ?? 0}</strong>
            </div>
          ))}
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
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by title, lead, milestone, or theme"
            />
          </label>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Status</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Team</span>
              <select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}>
                <option value="all">All teams</option>
                {teamOptions.map((team) => (
                  <option key={team.slug} value={team.slug}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Year</span>
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                <option value="all">All years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Sort</span>
              <select value={sortValue} onChange={(event) => setSortValue(event.target.value)}>
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
              onClick={(event) => onNavigate(event, '/admin/projects/new')}
            >
              <Plus size={15} />
              Add project
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

function ProjectCard({ onDeleteRequest, onNavigate, project }) {
  return (
    <article className="admin-team-row">
      <div className="admin-team-row-header">
        <div className="admin-team-row-title">
          <div className="admin-team-title-line">
            <span className="admin-team-acronym">{project.team?.acronym ?? 'TEAM'}</span>
            <span className="admin-status-badge admin-status-badge-stable">{project.status}</span>
            <span className="admin-team-axis-pill">{project.year}</span>
            {project.phdLinked ? <span className="admin-local-pill">PhD-linked</span> : null}
          </div>
          <h4>{project.title}</h4>
          <p>{project.summary}</p>
        </div>

        <div className="admin-team-row-actions">
          <button
            type="button"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/admin/projects/${project.slug}/edit`)}
          >
            <PencilLine size={14} />
            Edit project
          </button>
          <button
            type="button"
            className="admin-inline-link admin-inline-link-danger"
            onClick={() => onDeleteRequest(project)}
          >
            <Trash2 size={14} />
            Delete project
          </button>
          {project.team ? (
            <a
              href={`/teams/${project.team.slug}`}
              className="admin-inline-link"
              onClick={(event) => onNavigate(event, `/teams/${project.team.slug}`)}
            >
              Open team
              <ArrowRight size={14} />
            </a>
          ) : null}
        </div>
      </div>

      <div className="admin-team-metadata-grid">
        <div className="admin-team-metadata-cell">
          <span>Lead</span>
          <strong>{project.lead}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Team</span>
          <strong>{project.team?.name ?? 'Unassigned team'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Axis</span>
          <strong>{project.team?.axis?.name ?? 'Research axis'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Year</span>
          <strong>{project.year}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Current milestone</span>
          <strong>{project.milestone}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Lead source</span>
          <strong>{project.leadMember ? 'From member registry' : 'Manual lead entry'}</strong>
        </div>
      </div>

      <div className="admin-team-footer">
        <div className="admin-team-theme-row">
          {project.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
        <div className="admin-team-signal">
          <CalendarRange size={15} />
          {project.status} in {project.year}
        </div>
      </div>
    </article>
  );
}

export default function AdminProjectsPage({ onNavigate }) {
  const {
    collections: { members: sourceMembers, projects: sourceProjects, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
    siteContext = fallbackSiteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams, siteContext.researchAxes ?? []);
  const { isReady: areMembersReady, members } = useAdminMemberDrafts(sourceMembers, teams);
  const { deleteProject, isReady, projects } = useAdminProjectDrafts(sourceProjects, teams, members);
  const [pendingDeleteProject, setPendingDeleteProject] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortValue, setSortValue] = useState('year');
  const deferredSearchValue = useDeferredValue(searchValue);

  const statusCounts = useMemo(
    () =>
      statusOrder.reduce(
        (counts, status) => ({
          ...counts,
          [status]: projects.filter((project) => project.status === status).length,
        }),
        {},
      ),
    [projects],
  );
  const teamOptions = useMemo(
    () => teams.toSorted((left, right) => left.name.localeCompare(right.name)),
    [teams],
  );
  const yearOptions = useMemo(
    () => [...new Set(projects.map((project) => project.year))].toSorted((left, right) => right - left),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextProjects = projects.filter((project) => {
      const matchesSearch = normalizedSearch
        ? [project.title, project.lead, project.summary, project.milestone, project.themes.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = selectedStatus === 'all' ? true : project.status === selectedStatus;
      const matchesTeam = selectedTeam === 'all' ? true : project.teamSlug === selectedTeam;
      const matchesYear = selectedYear === 'all' ? true : String(project.year) === selectedYear;

      return matchesSearch && matchesStatus && matchesTeam && matchesYear;
    });

    return nextProjects.toSorted((left, right) => {
      if (sortValue === 'title') {
        return left.title.localeCompare(right.title);
      }

      if (sortValue === 'team') {
        return (left.team?.name ?? '').localeCompare(right.team?.name ?? '') || left.title.localeCompare(right.title);
      }

      if (sortValue === 'status') {
        return statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status) || right.year - left.year;
      }

      return right.year - left.year || left.title.localeCompare(right.title);
    });
  }, [deferredSearchValue, projects, selectedStatus, selectedTeam, selectedYear, sortValue]);

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady || !areMembersReady) {
    return <AdminProjectsLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminProjectsErrorState error={error} onRetry={retry} />;
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteProject || deleteConfirmation !== pendingDeleteProject.slug) {
      return;
    }

    await deleteProject(pendingDeleteProject.id);
    setPendingDeleteProject(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <ProjectToolbar
          isRefreshing={isRefreshing}
          onNavigate={onNavigate}
          onRefresh={retry}
          searchValue={searchValue}
          selectedStatus={selectedStatus}
          selectedTeam={selectedTeam}
          selectedYear={selectedYear}
          setSearchValue={setSearchValue}
          setSelectedStatus={setSelectedStatus}
          setSelectedTeam={setSelectedTeam}
          setSelectedYear={setSelectedYear}
          setSortValue={setSortValue}
          sortValue={sortValue}
          statusCounts={statusCounts}
          teamOptions={teamOptions}
          yearOptions={yearOptions}
        />

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <ShieldCheck size={16} />
            Registry snapshot
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>{projects.length} project records are currently indexed.</h4>
              <p>The protected desk is now reading projects as operational records rather than placeholder route stubs.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredProjects.length} projects match the active filters.</h4>
              <p>Status, team, year, and direct search now work together inside the admin workflow.</p>
            </div>
            <div className="admin-note-item">
              <h4>{projects.filter((project) => project.phdLinked).length} projects are PhD-linked.</h4>
              <p>That gives the projects desk a clear bridge into the later PhD progress milestone work.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <BriefcaseBusiness size={16} />
            Project list
          </div>

          {filteredProjects.length ? (
            <div className="admin-team-list">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onDeleteRequest={(entry) => {
                    setPendingDeleteProject(entry);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching projects</p>
              <h3>The current filters hide the whole project registry.</h3>
              <p className="admin-body-copy">
                Try widening the status, team, year, or search filters to bring the project desk back into view.
              </p>
            </div>
          )}
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete project"
        confirmValue={deleteConfirmation}
        description={
          pendingDeleteProject
            ? `This removes ${pendingDeleteProject.title} from the protected project draft store. Type "${pendingDeleteProject.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the project slug to confirm"
        isOpen={Boolean(pendingDeleteProject)}
        onCancel={() => {
          setPendingDeleteProject(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeleteProject ? `Delete ${pendingDeleteProject.title}?` : 'Delete project?'}
      />
    </>
  );
}
