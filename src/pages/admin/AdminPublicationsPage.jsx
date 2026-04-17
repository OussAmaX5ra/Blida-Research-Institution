import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  Layers3,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tags,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import {
  buildPublicationApaCitation,
  useAdminPublicationDrafts,
} from '../../lib/admin-publication-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOrder = ['Published', 'Review', 'Draft'];
const sortLabels = {
  citations: 'Most cited',
  title: 'Title A-Z',
  updated: 'Recently updated',
  year: 'Newest year',
};
const statusMeta = {
  Published: {
    description: 'Visible records with enough metadata quality to stand in the public library.',
    tone: 'stable',
  },
  Review: {
    description: 'Metadata is in motion and still needs editorial or citation verification.',
    tone: 'warn',
  },
  Draft: {
    description: 'Internal publication drafts stay protected until their public metadata is ready.',
    tone: 'muted',
  },
};

function formatDate(value) {
  if (!value) {
    return 'No update time';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'No update time';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getEntryTypeLabel(entryType) {
  return entryType === 'article' ? 'Journal article' : 'Conference paper';
}

function PublicationStatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-badge-${statusMeta[status]?.tone ?? 'muted'}`}>
      {status}
    </span>
  );
}

function AdminPublicationsLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Publication Desk</p>
        <h3>Loading the protected publication registry.</h3>
        <p className="admin-body-copy">
          The publication desk is hydrating team and publication context before the management
          workflow can render.
        </p>
      </article>
    </section>
  );
}

function AdminPublicationsErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">Publication Desk</p>
        <h3>The publications management view could not load.</h3>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry publication collections
        </button>
      </article>
    </section>
  );
}

function PublicationToolbar({
  authorOptions,
  isRefreshing,
  onNavigate,
  onRefresh,
  publisherOptions,
  searchValue,
  selectedAuthor,
  selectedPublisher,
  selectedStatus,
  selectedTeam,
  selectedTheme,
  selectedYear,
  setSearchValue,
  setSelectedAuthor,
  setSelectedPublisher,
  setSelectedStatus,
  setSelectedTeam,
  setSelectedTheme,
  setSelectedYear,
  setSortValue,
  sortValue,
  statusCounts,
  teamOptions,
  themeOptions,
  yearOptions,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Publication Desk</p>
        <h3>The protected publication workflow now covers list, create, edit, and delete inside one editorial surface.</h3>
        <p className="admin-body-copy">
          Publications are now managed as citation-aware records with team ownership, ordered
          authorship, PDF linkage, and scholarly metadata quality checks.
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
              placeholder="Search by title, author, DOI, publisher, or theme"
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
          </div>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Publisher</span>
              <select value={selectedPublisher} onChange={(event) => setSelectedPublisher(event.target.value)}>
                <option value="all">All publishers</option>
                {publisherOptions.map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Author</span>
              <select value={selectedAuthor} onChange={(event) => setSelectedAuthor(event.target.value)}>
                <option value="all">All authors</option>
                {authorOptions.map((author) => (
                  <option key={author} value={author}>
                    {author}
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
              onClick={(event) => onNavigate(event, '/admin/publications/new')}
            >
              <Plus size={15} />
              Add publication
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

function PublicationCard({ onDeleteRequest, onNavigate, publication }) {
  const citationPreview = buildPublicationApaCitation(publication);

  return (
    <article className="admin-team-row">
      <div className="admin-team-row-header">
        <div className="admin-team-row-title">
          <div className="admin-team-title-line">
            <span className="admin-team-acronym">{publication.team?.acronym ?? 'TEAM'}</span>
            <PublicationStatusBadge status={publication.status} />
            <span className="admin-team-axis-pill">{publication.year}</span>
            {publication.isLocalOnly ? <span className="admin-local-pill">Draft only</span> : null}
          </div>
          <h4>{publication.title}</h4>
          <p>{citationPreview}</p>
        </div>

        <div className="admin-team-row-actions">
          <button
            type="button"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/admin/publications/${publication.slug}/edit`)}
          >
            <PencilLine size={14} />
            Edit publication
          </button>
          <button
            type="button"
            className="admin-inline-link admin-inline-link-danger"
            onClick={() => onDeleteRequest(publication)}
          >
            <Trash2 size={14} />
            Delete publication
          </button>
          {!publication.isLocalOnly ? (
            <a
              href={`/publications/${publication.slug}`}
              className="admin-inline-link"
              onClick={(event) => onNavigate(event, `/publications/${publication.slug}`)}
            >
              Open public record
              <ArrowRight size={14} />
            </a>
          ) : (
            <span className="admin-row-note">This publication is still protected and not on the public site yet.</span>
          )}
        </div>
      </div>

      <div className="admin-team-metadata-grid">
        <div className="admin-team-metadata-cell">
          <span>Authors</span>
          <strong>{publication.authors.join(', ')}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Publisher</span>
          <strong>{publication.publisher}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Venue</span>
          <strong>{publication.journal}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Team</span>
          <strong>{publication.team?.name ?? 'Unassigned team'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Record type</span>
          <strong>{getEntryTypeLabel(publication.entryType)}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Last updated</span>
          <strong>{formatDate(publication.updatedAt)}</strong>
        </div>
      </div>

      <div className="admin-team-footer">
        <div className="admin-team-theme-row">
          {publication.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
        <div className="admin-team-signal">
          <Download size={15} />
          {publication.citations} citations tracked for this record
        </div>
      </div>
    </article>
  );
}

export default function AdminPublicationsPage({ onNavigate }) {
  const {
    collections: { publications: sourcePublications, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams);
  const { deletePublication, isReady, publications } = useAdminPublicationDrafts(
    sourcePublications,
    teams,
  );
  const [pendingDeletePublication, setPendingDeletePublication] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortValue, setSortValue] = useState('year');
  const deferredSearchValue = useDeferredValue(searchValue);

  const statusCounts = useMemo(
    () =>
      statusOrder.reduce(
        (counts, status) => ({
          ...counts,
          [status]: publications.filter((publication) => publication.status === status).length,
        }),
        {},
      ),
    [publications],
  );

  const teamOptions = useMemo(
    () => teams.toSorted((left, right) => left.name.localeCompare(right.name)),
    [teams],
  );

  const yearOptions = useMemo(
    () => [...new Set(publications.map((publication) => publication.year))].toSorted((left, right) => right - left),
    [publications],
  );

  const publisherOptions = useMemo(
    () => [...new Set(publications.map((publication) => publication.publisher))].toSorted(),
    [publications],
  );

  const authorOptions = useMemo(
    () => [...new Set(publications.flatMap((publication) => publication.authors))].toSorted(),
    [publications],
  );

  const themeOptions = useMemo(
    () => [...new Set(publications.flatMap((publication) => publication.themes))].toSorted(),
    [publications],
  );

  const filteredPublications = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextPublications = publications.filter((publication) => {
      const matchesSearch = normalizedSearch
        ? [
            publication.title,
            publication.abstract,
            publication.authors.join(' '),
            publication.publisher,
            publication.journal,
            publication.doi,
            publication.themes.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = selectedStatus === 'all' ? true : publication.status === selectedStatus;
      const matchesYear = selectedYear === 'all' ? true : String(publication.year) === selectedYear;
      const matchesTeam = selectedTeam === 'all' ? true : publication.teamSlug === selectedTeam;
      const matchesPublisher = selectedPublisher === 'all' ? true : publication.publisher === selectedPublisher;
      const matchesAuthor = selectedAuthor === 'all' ? true : publication.authors.includes(selectedAuthor);
      const matchesTheme = selectedTheme === 'all' ? true : publication.themes.includes(selectedTheme);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesYear &&
        matchesTeam &&
        matchesPublisher &&
        matchesAuthor &&
        matchesTheme
      );
    });

    return nextPublications.toSorted((left, right) => {
      if (sortValue === 'title') {
        return left.title.localeCompare(right.title);
      }

      if (sortValue === 'updated') {
        return new Date(right.updatedAt) - new Date(left.updatedAt) || left.title.localeCompare(right.title);
      }

      if (sortValue === 'citations') {
        return right.citations - left.citations || right.year - left.year;
      }

      return right.year - left.year || left.title.localeCompare(right.title);
    });
  }, [
    deferredSearchValue,
    publications,
    selectedAuthor,
    selectedPublisher,
    selectedStatus,
    selectedTeam,
    selectedTheme,
    selectedYear,
    sortValue,
  ]);

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return <AdminPublicationsLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminPublicationsErrorState error={error} onRetry={retry} />;
  }

  function handleDeleteConfirm() {
    if (!pendingDeletePublication || deleteConfirmation !== pendingDeletePublication.slug) {
      return;
    }

    deletePublication(pendingDeletePublication.id);
    setPendingDeletePublication(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <PublicationToolbar
          authorOptions={authorOptions}
          isRefreshing={isRefreshing}
          onNavigate={onNavigate}
          onRefresh={retry}
          publisherOptions={publisherOptions}
          searchValue={searchValue}
          selectedAuthor={selectedAuthor}
          selectedPublisher={selectedPublisher}
          selectedStatus={selectedStatus}
          selectedTeam={selectedTeam}
          selectedTheme={selectedTheme}
          selectedYear={selectedYear}
          setSearchValue={setSearchValue}
          setSelectedAuthor={setSelectedAuthor}
          setSelectedPublisher={setSelectedPublisher}
          setSelectedStatus={setSelectedStatus}
          setSelectedTeam={setSelectedTeam}
          setSelectedTheme={setSelectedTheme}
          setSelectedYear={setSelectedYear}
          setSortValue={setSortValue}
          sortValue={sortValue}
          statusCounts={statusCounts}
          teamOptions={teamOptions}
          themeOptions={themeOptions}
          yearOptions={yearOptions}
        />

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <ShieldCheck size={16} />
            Registry snapshot
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>{publications.length} publication records are currently indexed.</h4>
              <p>The protected desk now treats publication metadata as an operational editorial workflow rather than a placeholder route.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredPublications.length} publications match the active filters.</h4>
              <p>Search, scholarly metadata filters, and review status now work together inside the same admin surface.</p>
            </div>
            <div className="admin-note-item">
              <h4>{publications.reduce((sum, publication) => sum + publication.citations, 0)} citations are represented in the registry.</h4>
              <p>The desk can now surface high-impact records quickly while still keeping DOI and PDF hygiene visible.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <BookOpen size={16} />
            Publication list
          </div>

          {filteredPublications.length ? (
            <div className="admin-team-list">
              {filteredPublications.map((publication) => (
                <PublicationCard
                  key={publication.id}
                  onDeleteRequest={(entry) => {
                    setPendingDeletePublication(entry);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                  publication={publication}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching publications</p>
              <h3>The current filters hide the whole publication registry.</h3>
              <p className="admin-body-copy">
                Try widening the search or clearing one of the metadata filters to bring the desk back into view.
              </p>
            </div>
          )}
        </article>

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <Tags size={16} />
            Editorial read
          </div>

          <div className="admin-note-list">
            {statusOrder.map((status) => (
              <div key={status} className="admin-note-item">
                <h4>{status}</h4>
                <p>{statusMeta[status].description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <FileText size={16} />
            Workflow note
          </div>

          <p className="admin-body-copy">
            Newly created publication records currently live in the protected admin draft store.
            Seeded records still link to the public library, while local drafts stay safely inside the admin shell until backend CRUD is wired.
          </p>
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete publication"
        confirmValue={deleteConfirmation}
        description={
          pendingDeletePublication
            ? `This removes ${pendingDeletePublication.title} from the protected publication draft store. Type "${pendingDeletePublication.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the publication slug to confirm"
        isOpen={Boolean(pendingDeletePublication)}
        onCancel={() => {
          setPendingDeletePublication(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeletePublication ? `Delete ${pendingDeletePublication.title}?` : 'Delete publication?'}
      />
    </>
  );
}
