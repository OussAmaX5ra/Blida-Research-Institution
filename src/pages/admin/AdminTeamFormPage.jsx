import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Layers3, Save, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import { validateAdminFormOnServer } from '../../lib/admin-form-validation-api.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import {
  slugifyTeamName,
  useAdminTeamDrafts,
  validateTeamDraft,
} from '../../lib/admin-team-drafts.js';
import { fallbackSiteContext } from '../../lib/site-context.js';
import { usePublicData } from '../../providers/usePublicData.js';

function buildInitialValues(team) {
  if (!team) {
    return {
      acronym: '',
      axisId: '',
      color: '#1a5c6b',
      focus: '',
      leader: '',
      name: '',
      slug: '',
      status: 'active',
      summary: '',
      themes: '',
    };
  }

  return {
    acronym: team.acronym ?? '',
    axisId: team.axisId ?? team.axis?.id ?? '',
    color: team.color ?? '#1a5c6b',
    focus: team.focus ?? '',
    leader: team.leader ?? '',
    name: team.name ?? '',
    slug: team.slug ?? '',
    status: team.status ?? 'active',
    summary: team.summary ?? '',
    themes: (team.themes ?? []).join(', '),
  };
}

function TeamFormField({ error, label, children, help }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function FormSidebar({ values, mode, matchedAxis }) {
  const parsedThemes = values.themes
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Layers3 size={16} />
          Form preview
        </div>
        <p className="admin-section-kicker">{mode === 'create' ? 'New Team' : 'Edit Team'}</p>
        <h3>{values.name || 'Untitled research team'}</h3>
        <p className="admin-body-copy">
          {values.focus || 'Research focus will appear here once the summary form is filled.'}
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Axis</span>
            <strong>{matchedAxis?.name ?? 'Choose a research axis'}</strong>
          </div>
          <div>
            <span>Leader</span>
            <strong>{values.leader || 'Assign a visible lead'}</strong>
          </div>
          <div>
            <span>Acronym</span>
            <strong>{values.acronym || 'TBD'}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{values.status}</strong>
          </div>
        </div>

        <div className="admin-team-theme-row">
          {parsedThemes.length ? parsedThemes.map((theme) => <span key={theme}>{theme}</span>) : <span>No themes yet</span>}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Workflow note
        </div>
        <p className="admin-body-copy">
          This form currently saves to the protected admin draft store in the browser. That keeps
          the CRUD flow fully usable while the backend team endpoints are still pending.
        </p>
      </article>
    </div>
  );
}

export default function AdminTeamFormPage({ mode, onNavigate, teamSlug = '' }) {
  const {
    collections: { teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    siteContext = fallbackSiteContext,
  } = usePublicData();
  const researchAxes = siteContext.researchAxes ?? [];
  const { createTeam, deleteTeam, findTeamBySlug, isReady, teams, updateTeam } = useAdminTeamDrafts(sourceTeams, researchAxes);
  const existingTeam = mode === 'edit' ? findTeamBySlug(teamSlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingTeam));
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(Boolean(existingTeam?.slug));
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingTeam && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingTeam));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingTeam?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingTeam, mode]);

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

  const matchedAxis = useMemo(
    () => researchAxes.find((axis) => axis.id === values.axisId) ?? null,
    [values.axisId],
  );

  if ((!hasLoaded && isLoading) || !isReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Team Form</p>
          <h3>Loading the protected team form.</h3>
          <p className="admin-body-copy">
            The admin draft store is initializing before the team workflow can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Team Form</p>
          <h3>The team form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingTeam) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Team</p>
          <h3>This team draft could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the protected admin draft store. Return to the teams list
            and choose another record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/teams')}>
            <ArrowLeft size={15} />
            Back to teams
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

      if (field === 'name' && !slugTouched) {
        nextState.slug = slugifyTeamName(nextValue);
      }

      return nextState;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateTeamDraft(values, teams, existingTeam?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Team not created' : 'Team not saved',
        message: mode === 'create'
          ? 'The team could not be created yet. Review the highlighted fields and try again.'
          : 'The team could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    const serverValidation = await validateAdminFormOnServer('team', values);

    if (Object.keys(serverValidation.errors ?? {}).length) {
      setErrors(serverValidation.errors);
      setGlobalMessage(serverValidation.message ?? 'Server-side validation rejected this team draft.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Team not created' : 'Team not saved',
        message: 'Protected validation rejected the current team values. Review the highlighted fields and try again.',
      });
      return;
    }

    const result = await (mode === 'create'
      ? createTeam(values)
      : updateTeam(existingTeam.id, values));

    if (Object.keys(result.errors ?? {}).length) {
      setErrors(result.errors);
      setGlobalMessage(result.message ?? 'The team could not be saved yet. Review the highlighted fields and try again.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Team not created' : 'Team not saved',
        message: mode === 'create'
          ? 'The team could not be created yet. Review the highlighted fields and try again.'
          : 'The team could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    queueAdminToast({
      type: 'success',
      title: mode === 'create' ? 'Team created' : 'Team updated',
      message: mode === 'create'
        ? `${result.team.name} was created successfully.`
        : `${result.team.name} was saved successfully.`,
    });
    onNavigate(event, '/admin/teams');
  }

  async function handleDeleteConfirm() {
    if (!existingTeam || deleteConfirmation !== existingTeam.slug) {
      setGlobalMessage('Type the exact team slug before confirming the delete workflow.');
      return;
    }

    const result = await deleteTeam(existingTeam.id);

    if (result.error) {
      setGlobalMessage(result.error);
      return;
    }

    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/teams');
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Team' : 'Edit Team'}</p>
              <h3>{mode === 'create' ? 'Build a new protected team draft.' : `Refine ${existingTeam.name}.`}</h3>
              <p className="admin-body-copy">
                Capture the public identity, leadership, and research framing of the team here. The
                admin list view will update immediately once this draft is saved.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/teams')}>
              <ArrowLeft size={15} />
              Back to teams
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
              <TeamFormField label="Team name" error={errors.name}>
                <input value={values.name} onChange={(event) => updateField('name', event.target.value)} />
              </TeamFormField>

              <TeamFormField label="Acronym" error={errors.acronym} help="Example: ISAI or BIG">
                <input
                  value={values.acronym}
                  onChange={(event) => updateField('acronym', event.target.value.toUpperCase())}
                  maxLength={10}
                />
              </TeamFormField>

              <TeamFormField label="Slug" error={errors.slug} help="Used by the eventual public URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </TeamFormField>

              <TeamFormField label="Status" error={errors.status}>
                <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="archived">archived</option>
                </select>
              </TeamFormField>

              <TeamFormField label="Research axis" error={errors.axisId}>
                <select value={values.axisId} onChange={(event) => updateField('axisId', event.target.value)}>
                  <option value="">Select an axis</option>
                  {researchAxes.map((axis) => (
                    <option key={axis.id} value={axis.id}>
                      {axis.name}
                    </option>
                  ))}
                </select>
              </TeamFormField>

              <TeamFormField label="Accent color" error={errors.color}>
                <div className="admin-color-field">
                  <input
                    type="color"
                    value={values.color}
                    onChange={(event) => updateField('color', event.target.value)}
                  />
                  <input value={values.color} onChange={(event) => updateField('color', event.target.value)} />
                </div>
              </TeamFormField>

              <TeamFormField label="Team leader" error={errors.leader}>
                <input value={values.leader} onChange={(event) => updateField('leader', event.target.value)} />
              </TeamFormField>

              <TeamFormField
                label="Research focus"
                error={errors.focus}
                help="Short operational description used in admin list cards."
              >
                <textarea
                  rows="4"
                  value={values.focus}
                  onChange={(event) => updateField('focus', event.target.value)}
                />
              </TeamFormField>

              <TeamFormField
                label="Institutional summary"
                error={errors.summary}
                help="Longer public-facing description of the team mission."
              >
                <textarea
                  rows="6"
                  value={values.summary}
                  onChange={(event) => updateField('summary', event.target.value)}
                />
              </TeamFormField>

              <TeamFormField
                label="Themes"
                error={errors.themes}
                help="Use commas or line breaks between themes."
              >
                <textarea
                  rows="4"
                  value={values.themes}
                  onChange={(event) => updateField('themes', event.target.value)}
                />
              </TeamFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Save team draft' : 'Save team changes'}
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
                Deleting this team removes it from the protected admin draft registry. Type the team
                slug to confirm before the draft is removed.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete team
              </button>
            </section>
          ) : null}
        </article>

        <FormSidebar matchedAxis={matchedAxis} mode={mode} values={values} />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete team"
        confirmValue={deleteConfirmation}
        description={
          existingTeam
            ? `This removes ${existingTeam.name} from the admin draft store. Type "${existingTeam.slug}" to confirm the delete workflow.`
            : ''
        }
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingTeam ? `Delete ${existingTeam.name}?` : 'Delete team?'}
      />
    </>
  );
}
