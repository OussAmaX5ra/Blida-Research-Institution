import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Quote,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import { validateAdminFormOnServer } from '../../lib/admin-form-validation-api.js';
import {
  buildPublicationApaCitation,
  buildPublicationBibtex,
  slugifyPublicationTitle,
  useAdminPublicationDrafts,
  validatePublicationDraft,
} from '../../lib/admin-publication-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { usePublicData } from '../../providers/usePublicData.js';

const entryTypeOptions = [
  { label: 'Journal article', value: 'article' },
  { label: 'Conference paper', value: 'inproceedings' },
];
const statusOptions = ['Draft', 'Review', 'Published'];

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function buildInitialValues(publication) {
  if (!publication) {
    return {
      abstract: '',
      authors: '',
      citations: 0,
      doi: '',
      entryType: 'article',
      journal: '',
      pdfLink: '#',
      publisher: '',
      slug: '',
      status: 'Draft',
      teamSlug: '',
      themes: '',
      title: '',
      year: new Date().getFullYear(),
    };
  }

  return {
    abstract: publication.abstract ?? '',
    authors: (publication.authors ?? []).join(', '),
    citations: publication.citations ?? 0,
    doi: publication.doi ?? '',
    entryType: publication.entryType ?? 'article',
    journal: publication.journal ?? '',
    pdfLink: publication.pdfLink ?? '#',
    publisher: publication.publisher ?? '',
    slug: publication.slug ?? '',
    status: publication.status ?? 'Published',
    teamSlug: publication.teamSlug ?? publication.team?.slug ?? '',
    themes: (publication.themes ?? []).join(', '),
    title: publication.title ?? '',
    year: publication.year ?? new Date().getFullYear(),
  };
}

function PublicationFormField({ children, error, help, label }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function PublicationFormSidebar({ mode, selectedTeam, values }) {
  const authors = values.authors
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const themes = values.themes
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const previewPublication = {
    authors,
    doi: values.doi,
    entryType: values.entryType,
    journal: values.journal,
    pdfLink: values.pdfLink,
    publisher: values.publisher,
    slug: values.slug || slugifyPublicationTitle(values.title),
    title: values.title,
    year: values.year,
  };
  const apaPreview = authors.length && values.title ? buildPublicationApaCitation(previewPublication) : '';
  const bibtexPreview = authors.length && values.title ? buildPublicationBibtex(previewPublication) : '';

  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <BookOpen size={16} />
          Form preview
        </div>

        <p className="admin-section-kicker">{mode === 'create' ? 'New Publication' : 'Edit Publication'}</p>
        <h3>{values.title || 'Untitled publication record'}</h3>
        <p className="admin-body-copy">
          {values.abstract || 'The abstract, scholarly metadata, and citation previews will appear here as the form fills.'}
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Status</span>
            <strong>{values.status}</strong>
          </div>
          <div>
            <span>Record type</span>
            <strong>{values.entryType === 'article' ? 'Article' : 'Conference'}</strong>
          </div>
          <div>
            <span>Year</span>
            <strong>{values.year}</strong>
          </div>
          <div>
            <span>Team</span>
            <strong>{selectedTeam?.name ?? 'Choose a team'}</strong>
          </div>
          <div>
            <span>Authors</span>
            <strong>{authors.length ? `${authors.length} listed` : 'Add authors in order'}</strong>
          </div>
          <div>
            <span>Citations</span>
            <strong>{values.citations}</strong>
          </div>
        </div>

        <div className="admin-team-theme-row">
          {themes.length ? themes.map((theme) => <span key={theme}>{theme}</span>) : <span>No themes yet</span>}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Quote size={16} />
          APA preview
        </div>
        <p className="admin-body-copy">
          {apaPreview || 'Add title, ordered authors, venue metadata, and DOI to preview the APA citation.'}
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <FileText size={16} />
          BibTeX preview
        </div>
        <p className="admin-body-copy" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {bibtexPreview || 'Add title, authors, venue metadata, and DOI to preview the BibTeX export.'}
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Workflow note
        </div>
        <p className="admin-body-copy">
          Publication records currently save into the protected browser-side admin draft store. This
          keeps the CRUD loop working while backend publication endpoints are still pending.
        </p>
      </article>
    </div>
  );
}

export default function AdminPublicationFormPage({ mode, onNavigate, publicationSlug = '' }) {
  const {
    collections: { publications: sourcePublications, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(sourceTeams);
  const { createPublication, deletePublication, findPublicationBySlug, isReady, publications, updatePublication } =
    useAdminPublicationDrafts(sourcePublications, teams);
  const existingPublication = mode === 'edit' ? findPublicationBySlug(publicationSlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingPublication));
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingPublication?.slug));
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingPublication && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingPublication));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingPublication?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingPublication, mode]);

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
          <p className="admin-section-kicker">Publication Form</p>
          <h3>Loading the protected publication form.</h3>
          <p className="admin-body-copy">
            The publication and team draft stores are initializing before the form can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Publication Form</p>
          <h3>The publication form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingPublication) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Publication</p>
          <h3>This publication draft could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the protected admin publication registry. Return to the
            publications list and choose another record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/publications')}>
            <ArrowLeft size={15} />
            Back to publications
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
        nextState.slug = slugifyPublicationTitle(nextValue);
      }

      return nextState;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validatePublicationDraft(values, publications, teams, existingPublication?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Publication not created' : 'Publication not saved',
        message: mode === 'create'
          ? 'The publication could not be created yet. Review the highlighted fields and try again.'
          : 'The publication could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    const serverValidation = await validateAdminFormOnServer('publication', values);

    if (Object.keys(serverValidation.errors ?? {}).length) {
      setErrors(serverValidation.errors);
      setGlobalMessage(serverValidation.message ?? 'Server-side validation rejected this publication draft.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Publication not created' : 'Publication not saved',
        message: 'Protected validation rejected the current publication values. Review the highlighted fields and try again.',
      });
      return;
    }

    const result = mode === 'create'
      ? createPublication(values)
      : updatePublication(existingPublication.id, values);

    if (Object.keys(result.errors ?? {}).length) {
      setErrors(result.errors);
      setGlobalMessage('The publication could not be saved yet. Review the highlighted fields and try again.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Publication not created' : 'Publication not saved',
        message: mode === 'create'
          ? 'The publication could not be created yet. Review the highlighted fields and try again.'
          : 'The publication could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    queueAdminToast({
      type: 'success',
      title: mode === 'create' ? 'Publication created' : 'Publication updated',
      message: mode === 'create'
        ? `${result.publication.title} was created successfully.`
        : `${result.publication.title} was saved successfully.`,
    });
    onNavigate(event, '/admin/publications');
  }

  function handleDeleteConfirm() {
    if (!existingPublication || deleteConfirmation !== existingPublication.slug) {
      setGlobalMessage('Type the exact publication slug before confirming the delete workflow.');
      return;
    }

    deletePublication(existingPublication.id);
    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/publications');
  }

  function handleBibtexExport() {
    const previewPublication = {
      authors: values.authors.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
      doi: values.doi,
      entryType: values.entryType,
      journal: values.journal,
      pdfLink: values.pdfLink,
      publisher: values.publisher,
      slug: values.slug || slugifyPublicationTitle(values.title),
      title: values.title,
      year: values.year,
    };

    downloadTextFile(`${previewPublication.slug || 'publication'}.bib`, buildPublicationBibtex(previewPublication));
    setLocalToast({
      type: 'success',
      title: 'BibTeX exported',
      message: 'A BibTeX preview file was downloaded from the current form values.',
    });
  }

  function handleApaExport() {
    const previewPublication = {
      authors: values.authors.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
      doi: values.doi,
      publisher: values.publisher,
      title: values.title,
      year: values.year,
    };

    downloadTextFile(`${values.slug || slugifyPublicationTitle(values.title) || 'publication'}-apa.txt`, buildPublicationApaCitation(previewPublication));
    setLocalToast({
      type: 'success',
      title: 'APA citation exported',
      message: 'An APA citation preview file was downloaded from the current form values.',
    });
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Publication' : 'Edit Publication'}</p>
              <h3>{mode === 'create' ? 'Build a new protected publication draft.' : `Refine ${existingPublication.title}.`}</h3>
              <p className="admin-body-copy">
                Capture ordered authorship, venue metadata, DOI, PDF linkage, and review state here.
                The protected publication desk updates immediately once this draft is saved.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/publications')}>
              <ArrowLeft size={15} />
              Back to publications
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
              <PublicationFormField label="Publication title" error={errors.title}>
                <input value={values.title} onChange={(event) => updateField('title', event.target.value)} />
              </PublicationFormField>

              <PublicationFormField label="Slug" error={errors.slug} help="Used by the public publication URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </PublicationFormField>

              <PublicationFormField label="Owning team" error={errors.teamSlug}>
                <select value={values.teamSlug} onChange={(event) => updateField('teamSlug', event.target.value)}>
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.slug} value={team.slug}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </PublicationFormField>

              <PublicationFormField label="Status" error={errors.status}>
                <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </PublicationFormField>

              <PublicationFormField label="Record type" error={errors.entryType}>
                <select value={values.entryType} onChange={(event) => updateField('entryType', event.target.value)}>
                  {entryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </PublicationFormField>

              <PublicationFormField label="Reference year" error={errors.year}>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={values.year}
                  onChange={(event) => updateField('year', event.target.value)}
                />
              </PublicationFormField>

              <PublicationFormField label="Publisher" error={errors.publisher}>
                <input value={values.publisher} onChange={(event) => updateField('publisher', event.target.value)} />
              </PublicationFormField>

              <PublicationFormField label="Journal / conference label" error={errors.journal}>
                <input value={values.journal} onChange={(event) => updateField('journal', event.target.value)} />
              </PublicationFormField>

              <PublicationFormField label="DOI" error={errors.doi}>
                <input value={values.doi} onChange={(event) => updateField('doi', event.target.value)} />
              </PublicationFormField>

              <PublicationFormField
                label="PDF link"
                error={errors.pdfLink}
                help="Use #, an absolute URL, or a root-relative file path."
              >
                <input value={values.pdfLink} onChange={(event) => updateField('pdfLink', event.target.value)} />
              </PublicationFormField>

              <PublicationFormField label="Citation count" error={errors.citations}>
                <input
                  type="number"
                  min="0"
                  value={values.citations}
                  onChange={(event) => updateField('citations', event.target.value)}
                />
              </PublicationFormField>

              <PublicationFormField
                label="Ordered authors"
                error={errors.authors}
                help="Use commas or line breaks and keep the intended author order."
              >
                <textarea
                  rows="5"
                  value={values.authors}
                  onChange={(event) => updateField('authors', event.target.value)}
                />
              </PublicationFormField>

              <PublicationFormField
                label="Abstract"
                error={errors.abstract}
                help="Use a concise scholarly abstract rather than a marketing summary."
              >
                <textarea
                  rows="7"
                  value={values.abstract}
                  onChange={(event) => updateField('abstract', event.target.value)}
                />
              </PublicationFormField>

              <PublicationFormField
                label="Research themes"
                error={errors.themes}
                help="Use commas or line breaks between themes."
              >
                <textarea
                  rows="4"
                  value={values.themes}
                  onChange={(event) => updateField('themes', event.target.value)}
                />
              </PublicationFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Save publication draft' : 'Save publication changes'}
              </button>
              <button type="button" className="admin-secondary-button" onClick={handleBibtexExport}>
                <Download size={15} />
                Export BibTeX preview
              </button>
              <button type="button" className="admin-secondary-button" onClick={handleApaExport}>
                <Quote size={15} />
                Export APA preview
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
                Deleting this publication removes the record from the protected admin publication registry.
                Type the publication slug to confirm before the draft is removed.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete publication
              </button>
            </section>
          ) : null}
        </article>

        <PublicationFormSidebar mode={mode} selectedTeam={selectedTeam} values={values} />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete publication"
        confirmValue={deleteConfirmation}
        description={
          existingPublication
            ? `This removes ${existingPublication.title} from the protected publication draft store. Type "${existingPublication.slug}" to confirm the delete workflow.`
            : ''
        }
        inputLabel="Type the publication slug to confirm"
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingPublication ? `Delete ${existingPublication.title}?` : 'Delete publication?'}
      />
    </>
  );
}
