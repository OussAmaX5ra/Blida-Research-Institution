import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Image,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import {
  slugifyGalleryTitle,
  useAdminGalleryDrafts,
  validateGalleryDraft,
} from '../../lib/admin-gallery-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOptions = ['Draft', 'Review', 'Published'];

function buildInitialValues(item) {
  if (!item) {
    return {
      caption: '',
      category: '',
      dateIso: new Date().toISOString().slice(0, 10),
      image: '',
      slug: '',
      status: 'Draft',
      teamSlug: '',
      title: '',
    };
  }

  return {
    caption: item.caption ?? '',
    category: item.category ?? '',
    dateIso: item.dateIso ?? new Date().toISOString().slice(0, 10),
    image: item.image ?? '',
    slug: item.slug ?? '',
    status: item.status ?? 'Published',
    teamSlug: item.teamSlug ?? item.team?.slug ?? '',
    title: item.title ?? '',
  };
}

function GalleryFormField({ children, error, help, label }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function GalleryFormSidebar({ mode, selectedTeam, values }) {
  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Image size={16} />
          Form preview
        </div>

        <p className="admin-section-kicker">{mode === 'create' ? 'New Media' : 'Edit Media'}</p>
        <h3>{values.title || 'Untitled gallery record'}</h3>
        <p className="admin-body-copy">
          {values.caption || 'The media framing, schedule, and team context will appear here as the form fills.'}
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
            <span>Date</span>
            <strong>{values.dateIso || 'Set a date'}</strong>
          </div>
          <div>
            <span>Team</span>
            <strong>{selectedTeam?.name ?? 'Institution-wide item'}</strong>
          </div>
        </div>

        {values.image ? (
          <img
            src={values.image}
            alt={values.title || 'Gallery preview'}
            className="mt-5 h-56 w-full rounded-[1.5rem] border object-cover"
            style={{ borderColor: 'rgba(13,17,23,0.08)' }}
          />
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-dashed p-6 text-sm text-black/54">
            Add an image URL to preview the media item here.
          </div>
        )}
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <CalendarDays size={16} />
          Editorial note
        </div>
        <p className="admin-body-copy">
          Keep captions descriptive and dates concrete. Those two fields are what make the gallery
          feel like an institutional archive instead of a loose image dump.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Workflow note
        </div>
        <p className="admin-body-copy">
          Gallery records currently save into the protected browser-side admin draft store. That keeps
          the CRUD loop working while backend media endpoints are still pending.
        </p>
      </article>
    </div>
  );
}

export default function AdminGalleryFormPage({ mode, onNavigate, gallerySlug = '' }) {
  const {
    collections: { gallery: sourceGallery, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams);
  const { createGallery, deleteGallery, findGalleryBySlug, gallery, isReady, updateGallery } =
    useAdminGalleryDrafts(sourceGallery, teams);
  const existingItem = mode === 'edit' ? findGalleryBySlug(gallerySlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingItem));
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingItem?.slug));
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingItem && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingItem));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingItem?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingItem, mode]);

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

  const selectedTeam = useMemo(
    () => teams.find((team) => team.slug === values.teamSlug) ?? null,
    [teams, values.teamSlug],
  );

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Gallery Form</p>
          <h3>Loading the protected media form.</h3>
          <p className="admin-body-copy">
            The gallery and team draft stores are initializing before the form can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Gallery Form</p>
          <h3>The media form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingItem) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Media</p>
          <h3>This gallery draft could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the protected admin gallery registry. Return to the gallery list
            and choose another record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/gallery')}>
            <ArrowLeft size={15} />
            Back to gallery
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

      if (field === 'title' && !slugTouched) {
        nextState.slug = slugifyGalleryTitle(nextValue);
      }

      return nextState;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validation = validateGalleryDraft(values, gallery, teams, existingItem?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Media not created' : 'Media not saved',
        message: mode === 'create'
          ? 'The media item could not be created yet. Review the highlighted fields and try again.'
          : 'The media item could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    const result = mode === 'create'
      ? createGallery(values)
      : updateGallery(existingItem.id, values);

    if (Object.keys(result.errors ?? {}).length) {
      setErrors(result.errors);
      setGlobalMessage('The media item could not be saved yet. Review the highlighted fields and try again.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Media not created' : 'Media not saved',
        message: mode === 'create'
          ? 'The media item could not be created yet. Review the highlighted fields and try again.'
          : 'The media item could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    queueAdminToast({
      type: 'success',
      title: mode === 'create' ? 'Media item created' : 'Media item updated',
      message: mode === 'create'
        ? `${result.item.title} was created successfully.`
        : `${result.item.title} was saved successfully.`,
    });
    onNavigate(event, '/admin/gallery');
  }

  function handleDeleteConfirm() {
    if (!existingItem || deleteConfirmation !== existingItem.slug) {
      setGlobalMessage('Type the exact media slug before confirming the delete workflow.');
      return;
    }

    deleteGallery(existingItem.id);
    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/gallery');
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Media' : 'Edit Media'}</p>
              <h3>{mode === 'create' ? 'Build a new protected gallery draft.' : `Refine ${existingItem.title}.`}</h3>
              <p className="admin-body-copy">
                Capture the title, category, archive date, image source, caption, and optional team context here.
                The protected gallery desk updates immediately once this draft is saved.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/gallery')}>
              <ArrowLeft size={15} />
              Back to gallery
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
              <GalleryFormField label="Title" error={errors.title}>
                <input value={values.title} onChange={(event) => updateField('title', event.target.value)} />
              </GalleryFormField>

              <GalleryFormField label="Slug" error={errors.slug} help="Used by the future media record URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </GalleryFormField>

              <GalleryFormField label="Category" error={errors.category}>
                <input value={values.category} onChange={(event) => updateField('category', event.target.value)} />
              </GalleryFormField>

              <GalleryFormField label="Status" error={errors.status}>
                <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </GalleryFormField>

              <GalleryFormField label="Archive date" error={errors.dateIso}>
                <input
                  type="date"
                  value={values.dateIso}
                  onChange={(event) => updateField('dateIso', event.target.value)}
                />
              </GalleryFormField>

              <GalleryFormField
                label="Image URL"
                error={errors.image}
                help="Use an absolute image URL or a root-relative file path."
              >
                <input value={values.image} onChange={(event) => updateField('image', event.target.value)} />
              </GalleryFormField>

              <GalleryFormField
                label="Linked team"
                error={errors.teamSlug}
                help="Optional: leave blank if the media item represents the institution more broadly."
              >
                <select value={values.teamSlug} onChange={(event) => updateField('teamSlug', event.target.value)}>
                  <option value="">Institution-wide item</option>
                  {teams.map((team) => (
                    <option key={team.slug} value={team.slug}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </GalleryFormField>

              <GalleryFormField
                label="Caption"
                error={errors.caption}
                help="Use a descriptive editorial caption rather than a file-style note."
              >
                <textarea
                  rows="6"
                  value={values.caption}
                  onChange={(event) => updateField('caption', event.target.value)}
                />
              </GalleryFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Save media draft' : 'Save media changes'}
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
                Deleting this media item removes the record from the protected admin gallery registry.
                Type the media slug to confirm before the draft is removed.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete media
              </button>
            </section>
          ) : null}
        </article>

        <GalleryFormSidebar mode={mode} selectedTeam={selectedTeam} values={values} />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete media"
        confirmValue={deleteConfirmation}
        description={
          existingItem
            ? `This removes ${existingItem.title} from the protected gallery draft store. Type "${existingItem.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the media slug to confirm"
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingItem ? `Delete ${existingItem.title}?` : 'Delete media?'}
      />
    </>
  );
}
