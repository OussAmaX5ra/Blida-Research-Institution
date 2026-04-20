import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Layers3, Save, ShieldAlert, Sparkles, Trash2, Users2 } from 'lucide-react';

import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminToast from '../../components/admin/AdminToast.jsx';
import { validateAdminFormOnServer } from '../../lib/admin-form-validation-api.js';
import {
  slugifyMemberName,
  useAdminMemberDrafts,
  validateMemberDraft,
} from '../../lib/admin-member-drafts.js';
import { useAdminTeamDrafts } from '../../lib/admin-team-drafts.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { useAdminAbilities } from '../../providers/useAdminAbilities.js';
import { usePublicData } from '../../providers/usePublicData.js';

const roleOptions = ['Professor', 'Doctor', 'PhD Student'];

function buildInitialValues(member) {
  if (!member) {
    return {
      avatar: '',
      email: '',
      expertise: '',
      name: '',
      primaryTeamSlug: '',
      role: 'Professor',
      slug: '',
      teamSlugs: [],
      themes: '',
      title: '',
    };
  }

  return {
    avatar: member.avatar ?? '',
    email: member.email ?? '',
    expertise: member.expertise ?? '',
    name: member.name ?? '',
    primaryTeamSlug: member.primaryTeamSlug ?? '',
    role: member.role ?? 'Professor',
    slug: member.slug ?? '',
    teamSlugs: member.teamSlugs ?? [],
    themes: (member.themes ?? []).join(', '),
    title: member.title ?? '',
  };
}

function MemberFormField({ label, error, help, children }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <strong className="admin-field-error">{error}</strong> : null}
    </label>
  );
}

function MemberFormSidebar({ values, assignedTeams, mode }) {
  const parsedThemes = values.themes
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="admin-form-sidebar">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Users2 size={16} />
          Form preview
        </div>

        <p className="admin-section-kicker">{mode === 'create' ? 'New Member' : 'Edit Member'}</p>
        <h3>{values.name || 'Untitled member record'}</h3>
        <p className="admin-body-copy">
          {values.expertise || 'Expertise, title, and team assignments will appear here as the form fills.'}
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Role</span>
            <strong>{values.role}</strong>
          </div>
          <div>
            <span>Title</span>
            <strong>{values.title || 'Add an academic title'}</strong>
          </div>
          <div>
            <span>Avatar</span>
            <strong>{values.avatar || 'Auto-generated'}</strong>
          </div>
          <div>
            <span>Teams</span>
            <strong>{assignedTeams.length ? assignedTeams.length : 'Assign one or more teams'}</strong>
          </div>
        </div>

        <div className="admin-team-theme-row">
          {assignedTeams.length ? assignedTeams.map((team) => <span key={team.slug}>{team.name}</span>) : <span>No teams selected</span>}
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
          Saving calls the admin API; records persist in MongoDB and the public member directory
          refreshes after a successful write.
        </p>
      </article>
    </div>
  );
}

export default function AdminMemberFormPage({ mode, onNavigate, memberSlug = '' }) {
  const {
    collections: { members: sourceMembers, teams: sourceTeams },
    error,
    hasLoaded,
    isLoading,
    siteContext,
  } = usePublicData();
  const { isReady: areTeamsReady, teams } = useAdminTeamDrafts(
    sourceTeams,
    siteContext.researchAxes ?? [],
  );
  const { createMember, deleteMember, findMemberBySlug, isReady, members, updateMember } = useAdminMemberDrafts(sourceMembers, teams);
  const { canDelete } = useAdminAbilities();
  const existingMember = mode === 'edit' ? findMemberBySlug(memberSlug) : null;
  const [values, setValues] = useState(buildInitialValues(existingMember));
  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingMember?.slug));
  const [localToast, setLocalToast] = useState(null);

  useEffect(() => {
    if (!existingMember && mode === 'edit') {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(buildInitialValues(existingMember));
    setErrors({});
    setGlobalMessage('');
    setSlugTouched(Boolean(existingMember?.slug));
    setLocalToast(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [existingMember, mode]);

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

  const assignedTeams = useMemo(
    () => teams.filter((team) => values.teamSlugs.includes(team.slug)),
    [teams, values.teamSlugs],
  );

  if ((!hasLoaded && isLoading) || !isReady || !areTeamsReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Member Form</p>
          <h3>Loading the protected member form.</h3>
          <p className="admin-body-copy">
            Loading member and team data from the API before the form can render.
          </p>
        </article>
      </section>
    );
  }

  if (!hasLoaded && error) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Member Form</p>
          <h3>The member form could not load.</h3>
          <p className="admin-body-copy">{error}</p>
        </article>
      </section>
    );
  }

  if (mode === 'edit' && !existingMember) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide admin-editorial-card-alert">
          <p className="admin-section-kicker">Edit Member</p>
          <h3>This member could not be found.</h3>
          <p className="admin-body-copy">
            The slug no longer exists in the database-backed member list. Return to the members list
            and choose another record.
          </p>
          <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/members')}>
            <ArrowLeft size={15} />
            Back to members
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
        nextState.slug = slugifyMemberName(nextValue);
      }

      if (field === 'teamSlugs') {
        const nextTeamSlugs = nextValue;
        nextState.primaryTeamSlug = nextTeamSlugs.includes(current.primaryTeamSlug)
          ? current.primaryTeamSlug
          : nextTeamSlugs[0] ?? '';
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
    const validation = validateMemberDraft(values, members, existingMember?.id ?? null);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      setGlobalMessage('The form still has validation issues. Review the highlighted fields.');
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Member not created' : 'Member not saved',
        message: mode === 'create'
          ? 'The member could not be created yet. Review the highlighted fields and try again.'
          : 'The member could not be saved yet. Review the highlighted fields and try again.',
      });
      return;
    }

    try {
      const serverValidation = await validateAdminFormOnServer('member', values);

      if (Object.keys(serverValidation.errors ?? {}).length) {
        setErrors(serverValidation.errors);
        setGlobalMessage(serverValidation.message ?? 'Server-side validation rejected this member.');
        setLocalToast({
          type: 'error',
          title: mode === 'create' ? 'Member not created' : 'Member not saved',
          message:
            serverValidation.message
            ?? 'Validation rejected the current values. Review the highlighted fields and try again.',
        });
        return;
      }

      const result = await (mode === 'create'
        ? createMember(values)
        : updateMember(existingMember.id, values));

      if (Object.keys(result.errors ?? {}).length) {
        setErrors(result.errors);
        setGlobalMessage(
          result.message ?? 'The member could not be saved yet. Review the highlighted fields and try again.',
        );
        setLocalToast({
          type: 'error',
          title: mode === 'create' ? 'Member not created' : 'Member not saved',
          message: mode === 'create'
            ? 'The member could not be created yet. Review the highlighted fields and try again.'
            : 'The member could not be saved yet. Review the highlighted fields and try again.',
        });
        return;
      }

      if (!result.member) {
        const failMessage =
          result.message
          ?? (mode === 'create' ? 'The member could not be created.' : 'The member could not be saved.');
        setErrors({});
        setGlobalMessage(failMessage);
        setLocalToast({
          type: 'error',
          title: mode === 'create' ? 'Member not created' : 'Member not saved',
          message: failMessage,
        });
        return;
      }

      queueAdminToast({
        type: 'success',
        title: mode === 'create' ? 'Member created' : 'Member updated',
        message: mode === 'create'
          ? `${result.member.name} was created successfully.`
          : `${result.member.name} was saved successfully.`,
      });
      onNavigate(event, '/admin/members');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the server or save the member.';
      setErrors({});
      setGlobalMessage(message);
      setLocalToast({
        type: 'error',
        title: mode === 'create' ? 'Member not created' : 'Member not saved',
        message,
      });
    }
  }

  function handleDeleteConfirm() {
    if (!existingMember || deleteConfirmation !== existingMember.slug) {
      setGlobalMessage('Type the exact member slug before confirming the delete workflow.');
      return;
    }

    deleteMember(existingMember.id);
    setIsDeleteOpen(false);
    setDeleteConfirmation('');
    onNavigate({ preventDefault() {}, defaultPrevented: false, button: 0 }, '/admin/members');
  }

  return (
    <>
      <AdminToast toast={localToast} onClose={() => setLocalToast(null)} />

      <section className="admin-form-shell">
        <article className="admin-editorial-card admin-form-main">
          <div className="admin-form-header">
            <div>
              <p className="admin-section-kicker">{mode === 'create' ? 'Create Member' : 'Edit Member'}</p>
              <h3>{mode === 'create' ? 'Add a member to the database.' : `Edit ${existingMember.name}`}</h3>
              <p className="admin-body-copy">
                Capture role, academic framing, expertise, and team assignment. The roster updates after
                the server accepts the save.
              </p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={(event) => onNavigate(event, '/admin/members')}>
              <ArrowLeft size={15} />
              Back to members
            </button>
          </div>

          {globalMessage ? (
            <div className="admin-inline-banner">
              <ShieldAlert size={16} />
              <span>{globalMessage}</span>
            </div>
          ) : null}

          <form className="admin-form-layout" noValidate onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <MemberFormField label="Member name" error={errors.name}>
                <input value={values.name} onChange={(event) => updateField('name', event.target.value)} />
              </MemberFormField>

              <MemberFormField label="Role" error={errors.role}>
                <select value={values.role} onChange={(event) => updateField('role', event.target.value)}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </MemberFormField>

              <MemberFormField label="Slug" error={errors.slug} help="Used by the future public member URL">
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField('slug', event.target.value);
                  }}
                />
              </MemberFormField>

              <MemberFormField label="Avatar initials" error={errors.avatar} help="Leave blank to auto-generate from the name">
                <input
                  value={values.avatar}
                  onChange={(event) => updateField('avatar', event.target.value.toUpperCase())}
                  maxLength={4}
                />
              </MemberFormField>

              <MemberFormField label="Academic title" error={errors.title}>
                <input value={values.title} onChange={(event) => updateField('title', event.target.value)} />
              </MemberFormField>

              <MemberFormField label="Email" error={errors.email}>
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </MemberFormField>

              <MemberFormField label="Primary team" error={errors.primaryTeamSlug}>
                <select
                  value={values.primaryTeamSlug}
                  onChange={(event) => updateField('primaryTeamSlug', event.target.value)}
                >
                  <option value="">Select the primary team</option>
                  {assignedTeams.map((team) => (
                    <option key={team.slug} value={team.slug}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </MemberFormField>

              <MemberFormField
                label="Team assignments"
                error={errors.teamSlugs}
                help="A member can belong to more than one team in the future model."
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
              </MemberFormField>

              <MemberFormField
                label="Expertise / bio summary"
                error={errors.expertise}
                help="Use a concise scientific summary rather than a social profile bio."
              >
                <textarea
                  rows="6"
                  value={values.expertise}
                  onChange={(event) => updateField('expertise', event.target.value)}
                />
              </MemberFormField>

              <MemberFormField
                label="Research themes"
                error={errors.themes}
                help="Use commas or line breaks between themes."
              >
                <textarea
                  rows="4"
                  value={values.themes}
                  onChange={(event) => updateField('themes', event.target.value)}
                />
              </MemberFormField>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-logout-button">
                <Save size={15} />
                {mode === 'create' ? 'Create member' : 'Save changes'}
              </button>
            </div>
          </form>

          {mode === 'edit' && canDelete('member') ? (
            <section className="admin-danger-zone">
              <div className="admin-panel-heading">
                <Trash2 size={16} />
                Danger zone
              </div>
              <p className="admin-body-copy">
                Deleting this member removes the record from the database.
                Type the member slug to confirm.
              </p>
              <button type="button" className="admin-danger-button" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete member
              </button>
            </section>
          ) : null}
        </article>

        <MemberFormSidebar assignedTeams={assignedTeams} mode={mode} values={values} />
      </section>

      <AdminConfirmDialog
        confirmLabel="Delete member"
        confirmValue={deleteConfirmation}
        description={
          existingMember
            ? `This removes ${existingMember.name} from the database. Type "${existingMember.slug}" to confirm.`
            : ''
        }
        inputLabel="Type the member slug to confirm"
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmation('');
        }}
        onChange={setDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title={existingMember ? `Delete ${existingMember.name}?` : 'Delete member?'}
      />
    </>
  );
}
