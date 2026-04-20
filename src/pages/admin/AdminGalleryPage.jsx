import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Grid3X3,
  Image,
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
import { useAdminGalleryDrafts } from '../../lib/admin-gallery-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { useAdminAbilities } from '../../providers/useAdminAbilities.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOrder = ['Published', 'Review', 'Draft'];
const sortLabels = {
  date: 'Newest date',
  title: 'Title A-Z',
  updated: 'Recently updated',
};
const statusMeta = {
  Published: {
    description: 'Media records are polished enough to sit inside the public visual archive.',
    tone: 'stable',
  },
  Review: {
    description: 'Visual records still need editorial review, caption cleanup, or media verification.',
    tone: 'warn',
  },
  Draft: {
    description: 'Draft media items stay protected until the public archive entry is ready.',
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

function GalleryStatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-badge-${statusMeta[status]?.tone ?? 'muted'}`}>
      {status}
    </span>
  );
}

function AdminGalleryLoadingState() {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Gallery Archive</p>
        <h3>Loading the protected media registry.</h3>
        <p className="admin-body-copy">
          The gallery desk is hydrating category, team, and media context before the curation
          workflow can render.
        </p>
      </article>
    </section>
  );
}

function AdminGalleryErrorState({ error, onRetry }) {
  return (
    <section className="admin-teams-grid">
      <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
        <p className="admin-section-kicker">Gallery Archive</p>
        <h3>The gallery management view could not load.</h3>
        <p className="admin-body-copy">{error}</p>
        <button type="button" className="admin-secondary-button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry media collections
        </button>
      </article>
    </section>
  );
}

function GalleryToolbar({
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
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Gallery Archive</p>
        <h3>The protected gallery workflow now covers list, create, edit, and delete inside one curation surface.</h3>
        <p className="admin-body-copy">
          Media items are now managed as captioned institutional records with image sources, date
          context, category framing, and optional team ownership.
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
              placeholder="Search by title, caption, category, or team"
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
            {canCreateGallery ? (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={(event) => onNavigate(event, '/admin/gallery/new')}
              >
                <Plus size={15} />
                Add media item
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}

function GalleryCard({ canDeleteGallery, item, onDeleteRequest, onNavigate }) {
  return (
    <article className="admin-team-row">
      <div className="admin-team-row-header">
        <div className="admin-team-row-title">
          <div className="admin-team-title-line">
            <span className="admin-team-acronym">{item.team?.acronym ?? 'MEDIA'}</span>
            <GalleryStatusBadge status={item.status} />
            <span className="admin-team-axis-pill">{item.category}</span>
          </div>
          <h4>{item.title}</h4>
          <p>{item.caption}</p>
        </div>

        <div className="admin-team-row-actions">
          <button
            type="button"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, `/admin/gallery/${item.slug}/edit`)}
          >
            <PencilLine size={14} />
            Edit media
          </button>
          {canDeleteGallery ? (
            <button
              type="button"
              className="admin-inline-link admin-inline-link-danger"
              onClick={() => onDeleteRequest(item)}
            >
              <Trash2 size={14} />
              Delete media
            </button>
          ) : null}
          <a
            href="/gallery"
            className="admin-inline-link"
            onClick={(event) => onNavigate(event, '/gallery')}
          >
            Open public archive
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <div className="admin-team-metadata-grid">
        <div className="admin-team-metadata-cell">
          <span>Capture date</span>
          <strong>{formatDate(item.dateIso)}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Team</span>
          <strong>{item.team?.name ?? 'Institution-wide item'}</strong>
        </div>
        <div className="admin-team-metadata-cell">
          <span>Category</span>
          <strong>{item.category}</strong>
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
          <span>Visibility</span>
          <strong>{item.team ? 'Team-linked archive record' : 'Institution-wide archive record'}</strong>
        </div>
      </div>

      <div className="admin-team-footer">
        <div className="admin-team-theme-row">
          <span>{item.category}</span>
          {item.team ? <span>{item.team.name}</span> : <span>Institution-wide</span>}
        </div>
        <div className="admin-team-signal">
          <CalendarDays size={15} />
          Dated {formatDate(item.dateIso)}
        </div>
      </div>
    </article>
  );
}

export default function AdminGalleryPage({ onNavigate }) {
  const {
    collections: { gallery: sourceGallery, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    isRefreshing,
    retry,
    siteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams, siteContext.researchAxes ?? []);
  const { deleteGallery, gallery, isReady } = useAdminGalleryDrafts(sourceGallery, teams);
  const { canCreate, canDelete } = useAdminAbilities();
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
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
          [status]: gallery.filter((item) => item.status === status).length,
        }),
        {},
      ),
    [gallery],
  );

  const categoryOptions = useMemo(
    () => [...new Set(gallery.map((item) => item.category))].toSorted(),
    [gallery],
  );

  const teamOptions = useMemo(
    () => teams.toSorted((left, right) => left.name.localeCompare(right.name)),
    [teams],
  );

  const yearOptions = useMemo(
    () => [...new Set(gallery.map((item) => item.dateIso.slice(0, 4)).filter(Boolean))].toSorted((left, right) => Number(right) - Number(left)),
    [gallery],
  );

  const filteredGallery = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextGallery = gallery.filter((item) => {
      const matchesSearch = normalizedSearch
        ? [
            item.title,
            item.caption,
            item.category,
            item.team?.name ?? '',
            item.team?.acronym ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = selectedStatus === 'all' ? true : item.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' ? true : item.category === selectedCategory;
      const matchesTeam = selectedTeam === 'all' ? true : item.teamSlug === selectedTeam;
      const matchesYear = selectedYear === 'all' ? true : item.dateIso.startsWith(selectedYear);

      return matchesSearch && matchesStatus && matchesCategory && matchesTeam && matchesYear;
    });

    return nextGallery.toSorted((left, right) => {
      if (sortValue === 'title') {
        return left.title.localeCompare(right.title);
      }

      if (sortValue === 'updated') {
        return new Date(right.updatedAt) - new Date(left.updatedAt) || left.title.localeCompare(right.title);
      }

      return new Date(right.dateIso) - new Date(left.dateIso) || left.title.localeCompare(right.title);
    });
  }, [deferredSearchValue, gallery, selectedCategory, selectedStatus, selectedTeam, selectedYear, sortValue]);

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return <AdminGalleryLoadingState />;
  }

  if (!hasLoaded && error) {
    return <AdminGalleryErrorState error={error} onRetry={retry} />;
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteItem || deleteConfirmation !== pendingDeleteItem.slug) {
      return;
    }

    await deleteGallery(pendingDeleteItem.id);
    setPendingDeleteItem(null);
    setDeleteConfirmation('');
  }

  return (
    <>
      <section className="admin-teams-grid">
        <GalleryToolbar
          canCreateGallery={canCreate('gallery')}
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
              <h4>{gallery.length} media records are currently indexed.</h4>
              <p>The protected desk now treats gallery items as structured visual records instead of a placeholder route.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredGallery.length} media items match the active filters.</h4>
              <p>Search, category, team, year, and review state all work together inside the same curation surface.</p>
            </div>
            <div className="admin-note-item">
              <h4>{new Set(gallery.map((item) => item.category)).size} media categories are represented.</h4>
              <p>The desk can now surface archive breadth while keeping every image tied to a caption and date.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <Grid3X3 size={16} />
            Media list
          </div>

          {filteredGallery.length ? (
            <div className="admin-team-list">
              {filteredGallery.map((item) => (
                <GalleryCard
                  key={item.id}
                  canDeleteGallery={canDelete('gallery')}
                  item={item}
                  onDeleteRequest={(entry) => {
                    setPendingDeleteItem(entry);
                    setDeleteConfirmation('');
                  }}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching media</p>
              <h3>The current filters hide the whole gallery registry.</h3>
              <p className="admin-body-copy">
                Try widening the search or clearing one of the archive filters to bring the media desk back into view.
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
            Gallery items are stored in MongoDB and appear on the public gallery after the cache refreshes.
          </p>
        </article>
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete media"
        confirmValue={deleteConfirmation}
        description={
          pendingDeleteItem
            ? `This removes ${pendingDeleteItem.title} from the database. Type "${pendingDeleteItem.slug}" to confirm.`
            : ''
        }
        inputLabel="Type the media slug to confirm"
        isOpen={Boolean(pendingDeleteItem)}
        onCancel={() => {
          setPendingDeleteItem(null);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={pendingDeleteItem ? `Delete ${pendingDeleteItem.title}?` : 'Delete media?'}
      />
    </>
  );
}
