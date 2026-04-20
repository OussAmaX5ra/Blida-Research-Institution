import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Image,
  Layers3,
  Newspaper,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tags,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import { useAdminNewsDrafts } from '../../lib/admin-news-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { useAdminAbilities } from '../../providers/useAdminAbilities.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOrder = ['Published', 'Review', 'Draft'];
const sortLabels = {
  headline: 'Headline A-Z',
  updated: 'Recently updated',
  date: 'Newest publish date',
};
const statusMeta = {
  Published: {
    description: 'Stories with enough editorial polish to stand in the public institutional feed.',
    tone: 'stable',
  },
  Review: {
    description: 'Stories are in motion and still need editorial review, fact checks, or image verification.',
    tone: 'warn',
  },
  Draft: {
    description: 'Draft stories stay protected until the public narrative is ready to publish.',
    tone: 'muted',
  },
};

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'No date';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function NewsStatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-badge-${statusMeta[status]?.tone ?? 'muted'}`}>
      {status}
    </span>
  );
}

function AdminNewsLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">News Desk</p>
        <h3>Loading the protected story registry.</h3>
        <p className="admin-body-copy">
          The news desk is hydrating story, category, team, and publish-date context before the
          editorial workflow can render.
        </p>
      </article>
    </section>
  );
}

function AdminNewsErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">News Desk</p>
        <h3>The news management view could not load.</h3>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry story collections
        </button>
      </article>
    </section>
  );
}

function NewsToolbar({
  categoryOptions,
  isRefreshing,
  onNavigate,
  onRefresh,
  searchValue,
  selectedCategory,
  selectedStatus,
  selectedTeam,
  selectedYear,
  setSearchValue,
  setSelectedCategory,
  setSelectedStatus,
  setSelectedTeam,
  setSelectedYear,
  setSortValue,
  sortValue,
  statusCounts,
  teamOptions,
  yearOptions,
  canCreateNews,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">News Desk</p>
        <h3>The protected news workflow now covers list, create, edit, and delete inside one editorial surface.</h3>
        <p className="admin-body-copy">
          Stories are now managed as structured institutional updates with publish-date control,
          category framing, linked teams, featured imagery, and full narrative body editing.
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
              placeholder="Search by headline, excerpt, category, or story body"
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
              <span>Category</span>
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
              <span>Year</span>
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                <option value="all">All years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

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
            {canCreateNews ? (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={(event) => onNavigate(event, '/admin/news/new')}
              >
                <Plus size={15} />
                Add story
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}

function NewsCard({ canDeleteNews, item, onDeleteRequest, onNavigate }) {
  return (
    <article className="admin-team-row">
      <div className="admin-team-row-header">
        <div className="admin-team-row-title">
          <div className="admin-team-title-line">
            <span className="admin-team-acronym">{item.teams[0]?.acronym ?? 'NEWS'}</span>
            <NewsStatusBadge status={item.status} />
            <span className="admin-team-axis-pill">{item.category}</span>
          </div>
          <h4>{item.headline}</h4>
          <p>{item.excerpt}</p>
        </div>

        <div className="admin-team-row-actions">
          <button
            type="button"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/admin/news/${item.slug}/edit`)}
          >
            <PencilLine size={14} />
            Edit story
          </button>
          {canDeleteNews ? (
            <button
              type="button"
              className="admin-inline-link admin-inline-link-danger"
              onClick={() => onDeleteRequest(item)}
            >
              <Trash2 size={14} />
              Delete story
            </button>
          ) : null}
          <a
            href={`/news/${item.slug}`}
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/news/${item.slug}`)}
          >
            Open public story
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <div className="admin-team-metadata-grid">
        <div className="admin-team-metadata-cell">
          <span>Publish date</span>
          <strong>{formatDate(item.dateIso)}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Teams</span>
          <strong>{item.teams.length ? item.teams.map((team) => team.acronym).join(', ') : 'No teams linked'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Body paragraphs</span>
          <strong>{item.body.length}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Image source</span>
          <strong>{item.image.startsWith('/') ? 'Local asset path' : 'Remote URL'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Last updated</span>
          <strong>{formatDate(item.updatedAt)}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Story scope</span>
          <strong>{item.teams.length > 1 ? 'Cross-team update' : 'Single-team signal'}</strong>
        </div>
      </div>

      <div className="admin-team-footer">
        <div className="admin-team-theme-row">
          {item.teams.length
            ? item.teams.map((team) => <span key={team.slug}>{team.name}</span>)
            : <span>No teams linked</span>}
        </div>
        <div className="admin-team-signal">
          <CalendarDays size={15} />
          Scheduled for {formatDate(item.dateIso)}
        </div>
      </div>
    </article>
  );
}

export default function AdminNewsPage({ onNavigate }) {
  const {
    collections: { news: sourceNews, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
    siteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams, siteContext.researchAxes ?? []);
  const { deleteNews, isReady, news } = useAdminNewsDrafts(sourceNews, teams);
  const { canCreate, canDelete } = useAdminAbilities();
  const [pendingDeleteNews, setPendingDeleteNews] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortValue, setSortValue] = useState('date');
  const deferredSearchValue = useDeferredValue(searchValue);

  const statusCounts = useMemo(
    () =>
      statusOrder.reduce(
        (counts, status) => ({
          ...counts,
          [status]: news.filter((item) => item.status === status).length,
        }),
        {},
      ),
    [news],
  );

  const categoryOptions = useMemo(
    () => [...new Set(news.map((item) => item.category))].toSorted(),
    [news],
  );

  const teamOptions = useMemo(
    () => teams.toSorted((left, right) => left.name.localeCompare(right.name)),
    [teams],
  );

  const yearOptions = useMemo(
    () => [...new Set(news.map((item) => item.dateIso.slice(0, 4)).filter(Boolean))].toSorted((left, right) => Number(right) - Number(left)),
    [news],
  );

  const filteredNews = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextNews = news.filter((item) => {
      const matchesSearch = normalizedSearch
        ? [
            item.headline,
            item.excerpt,
            item.category,
            item.body.join(' '),
            item.teams.map((team) => team.name).join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = selectedStatus === 'all' ? true : item.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' ? true : item.category === selectedCategory;
      const matchesTeam = selectedTeam === 'all' ? true : item.teamSlugs.includes(selectedTeam);
      const matchesYear = selectedYear === 'all' ? true : item.dateIso.startsWith(selectedYear);

      return matchesSearch && matchesStatus && matchesCategory && matchesTeam && matchesYear;
    });

    return nextNews.toSorted((left, right) => {
      if (sortValue === 'headline') {
        return left.headline.localeCompare(right.headline);
      }

      if (sortValue === 'updated') {
        return new Date(right.updatedAt) - new Date(left.updatedAt) || left.headline.localeCompare(right.headline);
      }

      return new Date(right.dateIso) - new Date(left.dateIso) || left.headline.localeCompare(right.headline);
    });
  }, [deferredSearchValue, news, selectedCategory, selectedStatus, selectedTeam, selectedYear, sortValue]);

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return <AdminNewsLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminNewsErrorState error={error} onRetry={retry} />;
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteNews || deleteConfirmation !== pendingDeleteNews.slug) {
      return;
    }

    await deleteNews(pendingDeleteNews.id);
    setPendingDeleteNews(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <NewsToolbar
          canCreateNews={canCreate('news')}
          categoryOptions={categoryOptions}
          isRefreshing={isRefreshing}
          onNavigate={onNavigate}
          onRefresh={retry}
          searchValue={searchValue}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedTeam={selectedTeam}
          selectedYear={selectedYear}
          setSearchValue={setSearchValue}
          setSelectedCategory={setSelectedCategory}
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
              <h4>{news.length} story records are currently indexed.</h4>
              <p>The protected desk now treats news as a structured editorial workflow instead of a placeholder route.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredNews.length} stories match the active filters.</h4>
              <p>Search, category, team, year, and review state all work together inside the same admin surface.</p>
            </div>
            <div className="admin-note-item">
              <h4>{new Set(news.flatMap((item) => item.teamSlugs)).size} teams are represented in the story registry.</h4>
              <p>The desk can now surface editorial coverage breadth while still keeping stories tied to actual research units.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <Newspaper size={16} />
            Story list
          </div>

          {filteredNews.length ? (
            <div className="admin-team-list">
              {filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  canDeleteNews={canDelete('news')}
                  item={item}
                  onDeleteRequest={(entry) => {
                    setPendingDeleteNews(entry);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching stories</p>
              <h3>The current filters hide the whole news registry.</h3>
              <p className="admin-body-copy">
                Try widening the search or clearing one of the editorial filters to bring the story desk back into view.
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
            <Image size={16} />
            Workflow note
          </div>

          <p className="admin-body-copy">
            Stories are stored in MongoDB. The public news feed reflects the same records after the
            cache refreshes.
          </p>
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete story"
        confirmValue={deleteConfirmation}
        description={
          pendingDeleteNews
            ? `This removes ${pendingDeleteNews.headline} from the database. Type "${pendingDeleteNews.slug}" to confirm.`
            : ''
        }
        inputLabel="Type the story slug to confirm"
        isOpen={Boolean(pendingDeleteNews)}
        onCancel={() => {
          setPendingDeleteNews(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeleteNews ? `Delete ${pendingDeleteNews.headline}?` : 'Delete story?'}
      />
    </>
  );
}
