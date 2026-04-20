import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Newspaper,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import { validateAdminFormOnServer } from '../../lib/admin-form-validation-api.js';
import {
  slugifyNewsHeadline,
  useAdminNewsDrafts,
  validateNewsDraft,
} from '../../lib/admin-news-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOptions = ['Draft', 'Review', 'Published'];

function buildInitialValues(item) {
  if (!item) {
    return {
      body: '',
      category: '',
      dateIso: new Date().toISOString().slice(0, 10),
      excerpt: '',
      headline: '',
      image: '',
      slug: '',
      status: 'Draft',
      teamSlugs: [],
    };
  }

  return {
    body: (item.body ?? []).join('\n\n'),
    category: item.category ?? '',
    dateIso: item.dateIso ?? new Date().toISOString().slice(0, 10),
    excerpt: item.excerpt ?? '',
    headline: item.headline ?? '',
    image: item.image ?? '',
    slug: item.slug ?? '',
    status: item.status ?? 'Published',
    teamSlugs: item.teamSlugs ?? [],
  };
}

function NewsFormField({ children, error, help, label }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function NewsFormSidebar({ linkedTeams, mode, values }) {
  const paragraphs = values.body
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Newspaper size={16} />
          Form preview
        </div>

        <p className="admin-section-kicker">{mode === 'create' ? 'New Story' : 'Edit Story'}</p>
        <h3>{values.headline || 'Untitled institutional update'}</h3>
        <p className="admin-body-copy">
          {values.excerpt || 'The story framing, schedule, and linked-team context will appear here as the form fills.'}
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Status</span>
            <strong>{values.status}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{values.category || 'Choose a category'}</strong>
          </div>
          <div>
            <span>Publish date</span>
            <strong>{values.dateIso || 'Set a date'}</strong>
          </div>
          <div>
            <span>Teams</span>
            <strong>{linkedTeams.length ? `${linkedTeams.length} linked` : 'Link one or more teams'}</strong>
          </div>
          <div>
            <span>Paragraphs</span>
            <strong>{paragraphs.length}</strong>
          </div>
          <div>
            <span>Image</span>
            <strong>{values.image ? 'Configured' : 'Add an image source'}</strong>
          </div>
        </div>

        <div className="admin-team-theme-row">
          {linkedTeams.length ? linkedTeams.map((team) => <span key={team.slug}>{team.name}</span>) : <span>No linked teams yet</span>}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <CalendarDays size={16} />
          Editorial note
        </div>
        <p className="admin-body-copy">
          Keep the publish date concrete and the category decisive. Those two fields control how fast
          visitors can scan the public feed for relevance and recency.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Workflow note
        </div>
        <p className="admin-body-copy">
          Story records currently save into the protected browser-side admin draft store. That keeps
          the CRUD loop working while backend news endpoints are still pending.
        </p>
      </article>
    </div>
  );
}

export default function AdminNewsFormPage({ mode, onNavigate, newsSlug = '' }) {
  const {
    collections: { news: sourceNews, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams);
  const { createNews, deleteNews, findNewsBySlug, isReady, news, updateNews } = useAdminNewsDrafts(sourceNews, teams);
  const existingNews = mode === 'edit' ? findNewsBySlug(newsSlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingNews));
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingNews?.slug));
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingNews && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingNews));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingNews?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingNews, mode]);

  useEffect(() => {
    if (!localToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLocalToast(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [localToast]);

  const linkedTeams = useMemo(
    () => teams.filter((team) => values.teamSlugs.includes(team.slug)),
    [teams, values.teamSlugs],
  );

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">News Form</p>
          <h3>Loading the protected story form.</h3>
          <p className="admin-body-copy">
            The news and team draft stores are initializing before the form can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">News Form</p>
          <h3>The story form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingNews) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Story</p>
          <h3>This story draft could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the protected admin news registry. Return to the news list
            and choose another record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/news')}>
            <ArrowLeft size={15} />
            Back to news
          </button>
        </article>
      </section>
    );
  }

  function updateField(field, nextValue) {
    setValues((current) => {
      const nextState = {
        ...current,
        [field]: nextValue,
      };

      if (field === 'headline' && !slugTouched) {
        nextState.slug = slugifyNewsHeadline(nextValue);
      }

      return nextState;
    });
  }

  function handleTeamToggle(teamSlug) {
    const nextSlugs = values.teamSlugs.includes(teamSlug)
      ? values.teamSlugs.filter((slug) => slug !== teamSlug)
      : [...values.teamSlugs, teamSlug];

    updateField('teamSlugs', nextSlugs);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateNewsDraft(values, news, teams, existingNews?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Story not created' : 'Story not saved',
        message: mode === 'create'
          ? 'The story could not be created yet. Review the highlighted fields and try again.'
          : 'The story could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    const serverValidation = await validateAdminFormOnServer('news', values);

    if (Object.keys(serverValidation.errors ?? {}).length) {
      setErrors(serverValidation.errors);
      setGlobalMessage(serverValidation.message ?? 'Server-side validation rejected this story draft.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Story not created' : 'Story not saved',
        message: 'Protected validation rejected the current story values. Review the highlighted fields and try again.',
      });
      return;
    }

    const result = mode === 'create'
      ? createNews(values)
      : updateNews(existingNews.id, values);

    if (Object.keys(result.errors ?? {}).length) {
      setErrors(result.errors);
      setGlobalMessage('The story could not be saved yet. Review the highlighted fields and try again.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Story not created' : 'Story not saved',
        message: mode === 'create'
          ? 'The story could not be created yet. Review the highlighted fields and try again.'
          : 'The story could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    queueAdminToast({
      type: 'success',
      title: mode === 'create' ? 'Story created' : 'Story updated',
      message: mode === 'create'
        ? `${result.item.headline} was created successfully.`
        : `${result.item.headline} was saved successfully.`,
    });
    onNavigate(event, '/admin/news');
  }

  function handleDeleteConfirm() {
    if (!existingNews || deleteConfirmation !== existingNews.slug) {
      setGlobalMessage('Type the exact story slug before confirming the delete workflow.');
      return;
    }

    deleteNews(existingNews.id);
    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/news');
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Story' : 'Edit Story'}</p>
              <h3>{mode === 'create' ? 'Build a new protected story draft.' : `Refine ${existingNews.headline}.`}</h3>
              <p className="admin-body-copy">
                Capture the headline, category, schedule, linked teams, image, excerpt, and full story body here.
                The protected news desk updates immediately once this draft is saved.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/news')}>
              <ArrowLeft size={15} />
              Back to news
            </button>
          </div>

          {globalMessage ? (
            <div className="admin-inline-banner">
              <ShieldAlert size={16} />
              <span>{globalMessage}</span>
            </div>
          ) : null}

          <form className="admin-form-layout" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <NewsFormField label="Headline" error={errors.headline}>
                <input value={values.headline} onChange={(event) => updateField('headline', event.target.value)} />
              </NewsFormField>

              <NewsFormField label="Slug" error={errors.slug} help="Used by the public news URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </NewsFormField>

              <NewsFormField label="Category" error={errors.category}>
                <input value={values.category} onChange={(event) => updateField('category', event.target.value)} />
              </NewsFormField>

              <NewsFormField label="Status" error={errors.status}>
                <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </NewsFormField>

              <NewsFormField label="Publish date" error={errors.dateIso}>
                <input
                  type="date"
                  value={values.dateIso}
                  onChange={(event) => updateField('dateIso', event.target.value)}
                />
              </NewsFormField>

              <NewsFormField
                label="Featured image URL"
                error={errors.image}
                help="Use an absolute image URL or a root-relative file path."
              >
                <input value={values.image} onChange={(event) => updateField('image', event.target.value)} />
              </NewsFormField>

              <NewsFormField
                label="Linked teams"
                error={errors.teamSlugs}
                help="At least one team should anchor the story to the lab's research structure."
              >
                <div className="admin-check-grid">
                  {teams.map((team) => (
                    <label key={team.slug} className="admin-check-card">
                      <input
                        type="checkbox"
                        checked={values.teamSlugs.includes(team.slug)}
                        onChange={() => handleTeamToggle(team.slug)}
                      />
                      <div>
                        <strong>{team.name}</strong>
                        <span>{team.acronym}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </NewsFormField>

              <NewsFormField
                label="Excerpt"
                error={errors.excerpt}
                help="Use a strong public-facing summary that works inside the feed card."
              >
                <textarea
                  rows="4"
                  value={values.excerpt}
                  onChange={(event) => updateField('excerpt', event.target.value)}
                />
              </NewsFormField>

              <NewsFormField
                label="Story body"
                error={errors.body}
                help="Separate paragraphs with blank lines."
              >
                <textarea
                  rows="10"
                  value={values.body}
                  onChange={(event) => updateField('body', event.target.value)}
                />
              </NewsFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Save story draft' : 'Save story changes'}
              </button>
            </div>
          </form>

          {mode === 'edit' ? (
            <section className="admin-danger-zone">
              <div className="admin-panel-heading">
                <Trash2 size={16} />
                Danger zone
              </div>
              <p className="admin-body-copy">
                Deleting this story removes the record from the protected admin news registry.
                Type the story slug to confirm before the draft is removed.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete story
              </button>
            </section>
          ) : null}
        </article>

        <NewsFormSidebar linkedTeams={linkedTeams} mode={mode} values={values} />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete story"
        confirmValue={deleteConfirmation}
        description={
          existingNews
            ? `This removes ${existingNews.headline} from the protected news draft store. Type "${existingNews.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the story slug to confirm"
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingNews ? `Delete ${existingNews.headline}?` : 'Delete story?'}
      />
    </>
  );
}
