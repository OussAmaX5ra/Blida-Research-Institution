import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Workflow,
} from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import { validateAdminFormOnServer } from '../../lib/admin-form-validation-api.js';
import {
  slugifyProjectTitle,
  useAdminProjectDrafts,
  validateProjectDraft,
} from '../../lib/admin-project-drafts.js';
import { useAdminMemberDrafts } from '../../lib/admin-member-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { useAdminAbilities } from '../../providers/useAdminAbilities.js';
import { usePublicData } from '../../providers/usePublicData.js';

const statusOptions = ['Planned', 'Ongoing', 'Completed'];

function buildInitialValues(project) {
  if (!project) {
    return {
      lead: '',
      leadMemberSlug: '',
      milestone: '',
      phdLinked: false,
      slug: '',
      status: 'Planned',
      summary: '',
      teamSlug: '',
      themes: '',
      title: '',
      year: new Date().getFullYear(),
    };
  }

  return {
    lead: project.lead ?? '',
    leadMemberSlug: project.leadMemberSlug ?? project.leadMember?.slug ?? '',
    milestone: project.milestone ?? '',
    phdLinked: Boolean(project.phdLinked),
    slug: project.slug ?? '',
    status: project.status ?? 'Planned',
    summary: project.summary ?? '',
    teamSlug: project.teamSlug ?? project.team?.slug ?? '',
    themes: (project.themes ?? []).join(', '),
    title: project.title ?? '',
    year: project.year ?? new Date().getFullYear(),
  };
}

function ProjectFormField({ children, error, help, label }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function ProjectFormSidebar({ eligibleLeadMembers, mode, selectedTeam, values }) {
  const parsedThemes = values.themes
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <BriefcaseBusiness size={16} />
          Form preview
        </div>

        <p className="admin-section-kicker">{mode === 'create' ? 'New Project' : 'Edit Project'}</p>
        <h3>{values.title || 'Untitled project record'}</h3>
        <p className="admin-body-copy">
          {values.summary || 'Project framing, team ownership, and milestone context will appear here as the form fills.'}
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Status</span>
            <strong>{values.status}</strong>
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
            <span>Lead</span>
            <strong>{values.lead || 'Assign a lead researcher'}</strong>
          </div>
          <div>
            <span>Lead pool</span>
            <strong>{selectedTeam ? `${eligibleLeadMembers.length} members` : 'Pick a team first'}</strong>
          </div>
          <div>
            <span>PhD-linked</span>
            <strong>{values.phdLinked ? 'Yes' : 'No'}</strong>
          </div>
        </div>

        <div className="admin-team-theme-row">
          {parsedThemes.length ? parsedThemes.map((theme) => <span key={theme}>{theme}</span>) : <span>No themes yet</span>}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Workflow size={16} />
          Milestone note
        </div>
        <p className="admin-body-copy">
          Keep milestone text operational and time-bound. This field is what makes a project record
          feel like active research management rather than a static catalogue entry.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Workflow note
        </div>
        <p className="admin-body-copy">
          Saves persist to MongoDB via the admin API; the public projects listing updates after the
          cache refreshes.
        </p>
      </article>
    </div>
  );
}

export default function AdminProjectFormPage({ mode, onNavigate, projectSlug = '' }) {
  const {
    collections: { members: sourceMembers, projects: sourceProjects, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    siteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(
    sourceTeams,
    siteContext.researchAxes ?? [],
  );
  const { isReady: areMembersReady, members } = useAdminMemberDrafts(sourceMembers, teams);
  const { createProject, deleteProject, findProjectBySlug, isReady, projects, updateProject } =
    useAdminProjectDrafts(sourceProjects, teams, members);
  const { canDelete } = useAdminAbilities();
  const existingProject = mode === 'edit' ? findProjectBySlug(projectSlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingProject));
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingProject?.slug));
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingProject && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingProject));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingProject?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingProject, mode]);

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

  const eligibleLeadMembers = useMemo(
    () =>
      members
        .filter((member) => member.teamSlugs.includes(values.teamSlug))
        .toSorted((left, right) => left.name.localeCompare(right.name)),
    [members, values.teamSlug],
  );

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady || !areMembersReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Project Form</p>
          <h3>Loading the protected project form.</h3>
          <p className="admin-body-copy">
            Loading project, team, and member data from the API before the form can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Project Form</p>
          <h3>The project form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingProject) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Project</p>
          <h3>This project could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the database. Return to the projects list and choose another
            record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/projects')}>
            <ArrowLeft size={15} />
            Back to projects
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
        nextState.slug = slugifyProjectTitle(nextValue);
      }

      if (field === 'teamSlug') {
        const currentLeadStillEligible = members.some(
          (member) => member.slug === current.leadMemberSlug && member.teamSlugs.includes(nextValue),
        );

        if (!currentLeadStillEligible) {
          nextState.leadMemberSlug = '';
        }
      }

      return nextState;
    });
  }

  function handleLeadMemberChange(nextSlug) {
    const selectedMember = eligibleLeadMembers.find((member) => member.slug === nextSlug) ?? null;

    setValues((current) => ({
      ...current,
      lead: selectedMember?.name ?? current.lead,
      leadMemberSlug: nextSlug,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateProjectDraft(values, projects, teams, existingProject?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Project not created' : 'Project not saved',
        message: mode === 'create'
          ? 'The project could not be created yet. Review the highlighted fields and try again.'
          : 'The project could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    const serverValidation = await validateAdminFormOnServer('project', values);

    if (Object.keys(serverValidation.errors ?? {}).length) {
      setErrors(serverValidation.errors);
      setGlobalMessage(serverValidation.message ?? 'Server-side validation rejected this project.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Project not created' : 'Project not saved',
        message: 'Protected validation rejected the current project values. Review the highlighted fields and try again.',
      });
      return;
    }

    const result = await (mode === 'create'
      ? createProject(values)
      : updateProject(existingProject.id, values));

    if (Object.keys(result.errors ?? {}).length) {
      setErrors(result.errors);
      setGlobalMessage('The project could not be saved yet. Review the highlighted fields and try again.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Project not created' : 'Project not saved',
        message: mode === 'create'
          ? 'The project could not be created yet. Review the highlighted fields and try again.'
          : 'The project could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    queueAdminToast({
      type: 'success',
      title: mode === 'create' ? 'Project created' : 'Project updated',
      message: mode === 'create'
        ? `${result.project.title} was created successfully.`
        : `${result.project.title} was saved successfully.`,
    });
    onNavigate(event, '/admin/projects');
  }

  function handleDeleteConfirm() {
    if (!existingProject || deleteConfirmation !== existingProject.slug) {
      setGlobalMessage('Type the exact project slug before confirming the delete workflow.');
      return;
    }

    deleteProject(existingProject.id);
    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/projects');
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Project' : 'Edit Project'}</p>
              <h3>{mode === 'create' ? 'Create a project.' : `Edit ${existingProject.title}`}</h3>
              <p className="admin-body-copy">
                Capture team ownership, lead assignment, milestone context, and research themes.
                Saves persist to MongoDB; the public projects listing updates after the cache refreshes.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/projects')}>
              <ArrowLeft size={15} />
              Back to projects
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
              <ProjectFormField label="Project title" error={errors.title}>
                <input value={values.title} onChange={(event) => updateField('title', event.target.value)} />
              </ProjectFormField>

              <ProjectFormField label="Slug" error={errors.slug} help="Used by the future public project URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </ProjectFormField>

              <ProjectFormField label="Owning team" error={errors.teamSlug}>
                <select value={values.teamSlug} onChange={(event) => updateField('teamSlug', event.target.value)}>
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.slug} value={team.slug}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </ProjectFormField>

              <ProjectFormField label="Status" error={errors.status}>
                <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </ProjectFormField>

              <ProjectFormField
                label="Lead member"
                help={selectedTeam ? 'Optional: selecting a member can auto-fill the lead name.' : 'Choose a team first to expose eligible members.'}
              >
                <select
                  value={values.leadMemberSlug}
                  onChange={(event) => handleLeadMemberChange(event.target.value)}
                  disabled={!selectedTeam}
                >
                  <option value="">Manual lead entry</option>
                  {eligibleLeadMembers.map((member) => (
                    <option key={member.slug} value={member.slug}>
                      {member.name} | {member.role}
                    </option>
                  ))}
                </select>
              </ProjectFormField>

              <ProjectFormField label="Lead display name" error={errors.lead}>
                <input value={values.lead} onChange={(event) => updateField('lead', event.target.value)} />
              </ProjectFormField>

              <ProjectFormField label="Reference year" error={errors.year}>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={values.year}
                  onChange={(event) => updateField('year', event.target.value)}
                />
              </ProjectFormField>

              <ProjectFormField
                label="PhD linkage"
                help="Use this when the project is directly tied to a doctoral progression line."
              >
                <label className="admin-check-card">
                  <input
                    type="checkbox"
                    checked={values.phdLinked}
                    onChange={(event) => updateField('phdLinked', event.target.checked)}
                  />
                  <div>
                    <strong>{values.phdLinked ? 'PhD-linked project' : 'Standalone project'}</strong>
                    <span>
                      {values.phdLinked
                        ? 'This project will be surfaced as connected to doctoral progress.'
                        : 'This project remains independent from the doctoral progress layer for now.'}
                    </span>
                  </div>
                </label>
              </ProjectFormField>

              <ProjectFormField
                label="Project summary"
                error={errors.summary}
                help="Use a concise institutional summary rather than a grant abstract."
              >
                <textarea
                  rows="6"
                  value={values.summary}
                  onChange={(event) => updateField('summary', event.target.value)}
                />
              </ProjectFormField>

              <ProjectFormField
                label="Current milestone"
                error={errors.milestone}
                help="Describe the current operational milestone, decision, or delivery point."
              >
                <textarea
                  rows="5"
                  value={values.milestone}
                  onChange={(event) => updateField('milestone', event.target.value)}
                />
              </ProjectFormField>

              <ProjectFormField
                label="Research themes"
                error={errors.themes}
                help="Use commas or line breaks between themes."
              >
                <textarea
                  rows="4"
                  value={values.themes}
                  onChange={(event) => updateField('themes', event.target.value)}
                />
              </ProjectFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Create project' : 'Save changes'}
              </button>
            </div>
          </form>

          {mode === 'edit' && canDelete('project') ? (
            <section className="admin-danger-zone">
              <div className="admin-panel-heading">
                <Trash2 size={16} />
                Danger zone
              </div>
              <p className="admin-body-copy">
                Deleting this project removes the record from the database. Type the project slug to
                confirm.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete project
              </button>
            </section>
          ) : null}
        </article>

        <ProjectFormSidebar
          eligibleLeadMembers={eligibleLeadMembers}
          mode={mode}
          selectedTeam={selectedTeam}
          values={values}
        />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete project"
        confirmValue={deleteConfirmation}
        description={
          existingProject
            ? `This removes ${existingProject.title} from the database. Type "${existingProject.slug}" to confirm.`
            : ''
        }
        inputLabel="Type the project slug to confirm"
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingProject ? `Delete ${existingProject.title}?` : 'Delete project?'}
      />
    </>
  );
}
