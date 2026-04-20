import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  Layers3,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import { fallbackSiteContext } from '../../lib/site-context.js';
import { useAdminMemberDrafts } from '../../lib/admin-member-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { usePublicData } from '../../providers/usePublicData.js';

const roleOrder = ['Professor', 'Doctor', 'PhD Student'];
const roleMeta = {
  Professor: {
    description: 'Senior supervision and institutional leadership stay visible as a distinct layer.',
    tone: 'stable',
  },
  Doctor: {
    description: 'Doctoral researchers sit between lab leadership and dissertation pipelines.',
    tone: 'warn',
  },
  'PhD Student': {
    description: 'PhD scholars remain the clearest signal of the lab’s active research pipeline.',
    tone: 'muted',
  },
};

const sortLabels = {
  name: 'Name A-Z',
  team: 'Primary team',
  publications: 'Most linked papers',
  projects: 'Most linked projects',
};

function MemberRoleBadge({ role }) {
  return (
    <span className={`admin-status-badge admin-status-badge-${roleMeta[role]?.tone ?? 'muted'}`}>
      {role}
    </span>
  );
}

function AdminMembersLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Members Registry</p>
        <h3>Loading the protected member roster.</h3>
        <p className="admin-body-copy">
          The member management surface is hydrating role, team, and research-theme context before
          the protected workflow can render.
        </p>
      </article>
    </section>
  );
}

function AdminMembersErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">Members Registry</p>
        <h3>The member management view could not load.</h3>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry member collections
        </button>
      </article>
    </section>
  );
}

function MemberToolbar({
  onNavigate,
  onRefresh,
  searchValue,
  setSearchValue,
  selectedRole,
  setSelectedRole,
  selectedTeam,
  setSelectedTeam,
  selectedTheme,
  setSelectedTheme,
  sortValue,
  setSortValue,
  teamOptions,
  themeOptions,
  memberCounts,
  isRefreshing,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Members Registry</p>
        <h3>The protected member workflow now covers the full CRUD loop with role-separated management.</h3>
        <p className="admin-body-copy">
          This list treats professors, doctors, and PhD students as distinct admin concerns while
          preserving search, filtering, and team assignment context across the roster.
        </p>

        <div className="admin-summary-strip">
          {roleOrder.map((role) => (
            <div key={role} className="admin-summary-chip">
              <span>{role}</span>
              <strong>{memberCounts[role] ?? 0}</strong>
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
              placeholder="Search by member, title, expertise, or theme"
            />
          </label>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Role</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                <option value="all">All roles</option>
                {roleOrder.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Primary team</span>
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
              <span>Theme</span>
              <select value={selectedTheme} onChange={(event) => setSelectedTheme(event.target.value)}>
                <option value="all">All themes</option>
                {themeOptions.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
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
              onClick={(event) => onNavigate(event, '/admin/members/new')}
            >
              <Plus size={15} />
              Add member
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

function MemberGroupCard({ group, onDeleteRequest, onNavigate }) {
  return (
    <article className="admin-editorial-card">
      <div className="admin-panel-heading">
        <Users2 size={16} />
        {group.role}
      </div>

      <p className="admin-body-copy">{roleMeta[group.role].description}</p>

      <div className="admin-member-list">
        {group.members.map((member) => (
          <article key={member.id} className="admin-member-row">
            <div className="admin-member-avatar">{member.avatar}</div>
            <div className="admin-member-main">
              <div className="admin-member-title-line">
                <h4>{member.name}</h4>
                <MemberRoleBadge role={member.role} />
              </div>
              <p>{member.title}</p>
              <div className="admin-member-meta-row">
                <span>{member.primaryTeam?.name ?? 'No assigned team'}</span>
                <span>{member.projectCount} projects</span>
                <span>{member.publicationCount} papers</span>
              </div>
              <div className="admin-team-theme-row">
                {member.themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
            </div>
            <div className="admin-member-actions">
              <button
                type="button"
                className="admin-inline-link"
                onClick={(event) => onNavigate(event, `/admin/members/${member.slug}/edit`)}
              >
                <PencilLine size={14} />
                Edit
              </button>
              <button
                type="button"
                className="admin-inline-link admin-inline-link-danger"
                onClick={() => onDeleteRequest(member)}
              >
                <Trash2 size={14} />
                Delete
              </button>
              {member.primaryTeam ? (
                <a
                  href={`/teams/${member.primaryTeam.slug}`}
                  className="admin-inline-link"
                  onClick={(event) => onNavigate(event, `/teams/${member.primaryTeam.slug}`)}
                >
                  Open team
                  <ArrowRight size={14} />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

export default function AdminMembersPage({ onNavigate }) {
  const {
    collections: { members: sourceMembers, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
    siteContext = fallbackSiteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams, siteContext.researchAxes ?? []);
  const { deleteMember, isReady, members } = useAdminMemberDrafts(sourceMembers, teams);
  const [pendingDeleteMember, setPendingDeleteMember] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortValue, setSortValue] = useState('name');
  const deferredSearchValue = useDeferredValue(searchValue);

  const teamOptions = useMemo(
    () => teams.toSorted((left, right) => left.name.localeCompare(right.name)),
    [teams],
  );

  const themeOptions = useMemo(
    () => [...new Set(members.flatMap((member) => member.themes ?? []))].toSorted(),
    [members],
  );

  const memberCounts = useMemo(
    () =>
      roleOrder.reduce(
        (counts, role) => ({
          ...counts,
          [role]: members.filter((member) => member.role === role).length,
        }),
        {},
      ),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextMembers = members.filter((member) => {
      const matchesSearch = normalizedSearch
        ? [member.name, member.title, member.expertise, member.themes.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesRole = selectedRole === 'all' ? true : member.role === selectedRole;
      const matchesTeam = selectedTeam === 'all' ? true : member.teamSlugs.includes(selectedTeam);
      const matchesTheme = selectedTheme === 'all' ? true : member.themes.includes(selectedTheme);

      return matchesSearch && matchesRole && matchesTeam && matchesTheme;
    });

    return nextMembers.toSorted((left, right) => {
      if (sortValue === 'team') {
        return (left.primaryTeam?.name ?? '').localeCompare(right.primaryTeam?.name ?? '') || left.name.localeCompare(right.name);
      }

      if (sortValue === 'publications') {
        return right.publicationCount - left.publicationCount || left.name.localeCompare(right.name);
      }

      if (sortValue === 'projects') {
        return right.projectCount - left.projectCount || left.name.localeCompare(right.name);
      }

      return left.name.localeCompare(right.name);
    });
  }, [deferredSearchValue, members, selectedRole, selectedTeam, selectedTheme, sortValue]);

  const groupedMembers = useMemo(
    () =>
      roleOrder
        .map((role) => ({
          role,
          members: filteredMembers.filter((member) => member.role === role),
        }))
        .filter((group) => group.members.length),
    [filteredMembers],
  );

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return <AdminMembersLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminMembersErrorState error={error} onRetry={retry} />;
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteMember || deleteConfirmation !== pendingDeleteMember.slug) {
      return;
    }

    await deleteMember(pendingDeleteMember.id);
    setPendingDeleteMember(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <MemberToolbar
          isRefreshing={isRefreshing}
          memberCounts={memberCounts}
          onNavigate={onNavigate}
          onRefresh={retry}
          searchValue={searchValue}
          selectedRole={selectedRole}
          selectedTeam={selectedTeam}
          selectedTheme={selectedTheme}
          setSearchValue={setSearchValue}
          setSelectedRole={setSelectedRole}
          setSelectedTeam={setSelectedTeam}
          setSelectedTheme={setSelectedTheme}
          setSortValue={setSortValue}
          sortValue={sortValue}
          teamOptions={teamOptions}
          themeOptions={themeOptions}
        />

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <ShieldCheck size={16} />
            Registry snapshot
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>{members.length} member records are currently indexed.</h4>
              <p>The protected list separates the roster by academic role without flattening the institution into one generic people table.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredMembers.length} members match the active filters.</h4>
              <p>Role, team, and theme filters all remain active together so the workflow behaves like a real research management tool.</p>
            </div>
            <div className="admin-note-item">
              <h4>{themeOptions.length} distinct research themes are visible.</h4>
              <p>That makes it easier to keep member records aligned with the rest of the site’s scientific language.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <Layers3 size={16} />
            Member list
          </div>

          {groupedMembers.length ? (
            <div className="admin-member-groups">
              {groupedMembers.map((group) => (
                <MemberGroupCard
                  key={group.role}
                  group={group}
                  onDeleteRequest={(member) => {
                    setPendingDeleteMember(member);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching members</p>
              <h3>The current filters hide the whole member registry.</h3>
              <p className="admin-body-copy">
                Try widening the search, team, role, or theme filters to bring the roster back into view.
              </p>
            </div>
          )}
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete member"
        confirmValue={deleteConfirmation}
        description={
          pendingDeleteMember
            ? `This removes ${pendingDeleteMember.name} from the protected member draft store. Type "${pendingDeleteMember.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the member slug to confirm"
        isOpen={Boolean(pendingDeleteMember)}
        onCancel={() => {
          setPendingDeleteMember(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeleteMember ? `Delete ${pendingDeleteMember.name}?` : 'Delete member?'}
      />
    </>
  );
}
