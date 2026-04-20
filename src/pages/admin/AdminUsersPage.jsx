import { useDeferredValue, useMemo, useState } from 'react';
import {
  KeyRound,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  Users2,
} from 'lucide-react';

import { queueAdminToast } from '../../lib/admin-toast.js';
import {
  ADMIN_USER_ROLE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
  useAdminUserDrafts,
} from '../../lib/admin-user-drafts.js';
import { useAdminSession } from '../../providers/useAdminSession.js';

const roleOrder = ADMIN_USER_ROLE_OPTIONS;
const statusOrder = ADMIN_USER_STATUS_OPTIONS;
const sortLabels = {
  recent: 'Recent session activity',
  name: 'Name A-Z',
  role: 'Role priority',
  status: 'Status priority',
};
const roleMeta = {
  super_admin: {
    label: 'Super admin',
    tone: 'stable',
    description: 'Owns security posture, protected routing policy, and high-trust platform decisions.',
  },
  content_admin: {
    label: 'Content admin',
    tone: 'warn',
    description: 'Coordinates the publishing desks and keeps institutional content quality aligned.',
  },
  editor: {
    label: 'Editor',
    tone: 'muted',
    description: 'Handles day-to-day operational edits inside the publication, news, and gallery surfaces.',
  },
};
const statusMeta = {
  active: {
    label: 'Active',
    tone: 'stable',
    description: 'Accounts can sign in and operate inside the protected workspace.',
  },
  inactive: {
    label: 'Inactive',
    tone: 'muted',
    description: 'Accounts remain listed but should not be treated as currently operational.',
  },
  locked: {
    label: 'Locked',
    tone: 'warn',
    description: 'These accounts need attention before they can safely re-enter the admin workflow.',
  },
};

function formatDate(value) {
  if (!value) {
    return 'Live session';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown session time';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) {
    return 'No reset issued';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'No reset issued';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getActivityTimestamp(account) {
  if (account.isCurrentSession) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = account.lastLoginAt ? new Date(account.lastLoginAt).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function StatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-badge-${statusMeta[status]?.tone ?? 'muted'}`}>
      {statusMeta[status]?.label ?? status}
    </span>
  );
}

function AccessWorkflowDialog({
  account,
  draftRole,
  draftStatus,
  issuedTemporaryPassword,
  onClose,
  onIssueReset,
  onRoleChange,
  onSave,
  onStatusChange,
}) {
  if (!account) {
    return null;
  }

  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-access-title"
      >
        <p className="admin-section-kicker">Access Workflow</p>
        <h3 id="admin-user-access-title">Manage {account.fullName}.</h3>
        <p className="admin-body-copy">
          Adjust the account role, change whether this administrator can sign in, or issue a
          one-time temporary password from the protected draft workflow.
        </p>

        <div className="admin-form-preview-grid">
          <div>
            <span>Account email</span>
            <strong>{account.email}</strong>
          </div>
          <div>
            <span>Current status</span>
            <strong>{statusMeta[account.status]?.label ?? account.status}</strong>
          </div>
          <div>
            <span>Last sign-in</span>
            <strong>{formatDate(account.lastLoginAt)}</strong>
          </div>
          <div>
            <span>Password reset</span>
            <strong>{formatDateTime(account.passwordResetAt)}</strong>
          </div>
        </div>

        {issuedTemporaryPassword ? (
          <>
            <div className="admin-inline-banner">
              <KeyRound size={16} />
              <span>
                Temporary password issued. Share it securely once; the account is now flagged to
                rotate credentials on next use.
              </span>
            </div>

            <label className="admin-form-field">
              <span>Temporary password</span>
              <input readOnly value={issuedTemporaryPassword} />
              <em>This value is only shown in this workflow after issuance.</em>
            </label>
          </>
        ) : null}

        <div className="admin-form-grid">
          <label className="admin-form-field">
            <span>Assigned role</span>
            <select value={draftRole} onChange={(event) => onRoleChange(event.target.value)}>
              {roleOrder.map((role) => (
                <option key={role} value={role}>
                  {roleMeta[role].label}
                </option>
              ))}
            </select>
            <em>{roleMeta[draftRole].description}</em>
          </label>

          <label className="admin-form-field">
            <span>Account status</span>
            <select value={draftStatus} onChange={(event) => onStatusChange(event.target.value)}>
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {statusMeta[status].label}
                </option>
              ))}
            </select>
            <em>{statusMeta[draftStatus].description}</em>
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-secondary-button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="admin-secondary-button" onClick={onIssueReset}>
            <KeyRound size={15} />
            Issue password reset
          </button>
          <button type="button" className="admin-danger-button" onClick={onSave}>
            <UserCog size={15} />
            Save access changes
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersToolbar({
  isRefreshing,
  onRefresh,
  pendingResetCount,
  searchValue,
  selectedLinkage,
  selectedRole,
  selectedStatus,
  setSearchValue,
  setSelectedLinkage,
  setSelectedRole,
  setSelectedStatus,
  setSortValue,
  sortValue,
  statusCounts,
}) {
  return (
    <>
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Access Control</p>
        <h3>The protected user registry now has a real interface for reviewing who can enter the admin workspace.</h3>
        <p className="admin-body-copy">
          This milestone now covers visibility and action: account roles, sign-in posture, and
          password recovery workflows sit inside one protected management surface.
        </p>

        <div className="admin-summary-strip">
          {statusOrder.map((status) => (
            <div key={status} className="admin-summary-chip">
              <span>{statusMeta[status].label}</span>
              <strong>{statusCounts[status] ?? 0}</strong>
            </div>
          ))}
          <div className="admin-summary-chip">
            <span>Password resets</span>
            <strong>{pendingResetCount}</strong>
          </div>
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
              placeholder="Search by account, email, capability, or access scope"
            />
          </label>

          <div className="admin-filter-grid">
            <label className="admin-select-field">
              <span>Role</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                <option value="all">All roles</option>
                {roleOrder.map((role) => (
                  <option key={role} value={role}>
                    {roleMeta[role].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Status</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusMeta[status].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-select-field">
              <span>Linkage</span>
              <select value={selectedLinkage} onChange={(event) => setSelectedLinkage(event.target.value)}>
                <option value="all">All accounts</option>
                <option value="current">Current session</option>
                <option value="linked">Member-linked</option>
                <option value="standalone">Standalone account</option>
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
              Refresh session context
            </button>
          </div>
        </div>
      </article>
    </>
  );
}

function UserAccountRow({ account, onManageAccess }) {
  return (
    <article className="admin-member-row">
      <div className="admin-member-avatar">{buildInitials(account.fullName)}</div>

      <div className="admin-member-main">
        <div className="admin-member-title-line">
          <h4>{account.fullName}</h4>
          <StatusBadge status={account.status} />
          <span className="admin-team-axis-pill">{roleMeta[account.role]?.label ?? account.role}</span>
          {account.isCurrentSession ? <span className="admin-local-pill">Current session</span> : null}
        </div>

        <p>{account.email}</p>

        <div className="admin-member-meta-row">
          <span>{account.memberId ? 'Member-linked account' : 'Standalone access account'}</span>
          <span>Last sign-in {formatDate(account.lastLoginAt)}</span>
          <span>{account.memberLabel}</span>
          <span>{account.mustChangePassword ? 'Password rotation pending' : 'No pending rotation'}</span>
        </div>

        <p>{account.accessScope}</p>

        <div className="admin-team-theme-row">
          {account.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>

      <div className="admin-member-actions">
        {account.isCurrentSession ? (
          <span className="admin-row-note">
            The current signed-in account stays view-only here so you cannot deactivate or demote
            the browser session you are actively using.
          </span>
        ) : (
          <button type="button" className="admin-secondary-button" onClick={() => onManageAccess(account)}>
            <UserCog size={15} />
            Manage access
          </button>
        )}
      </div>
    </article>
  );
}

export default function AdminUsersPage() {
  const { isPending, retry, user } = useAdminSession();
  const { accounts, isReady, issuePasswordReset, updateAccountAccess } = useAdminUserDrafts(user);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLinkage, setSelectedLinkage] = useState('all');
  const [sortValue, setSortValue] = useState('recent');
  const [activeAccountId, setActiveAccountId] = useState('');
  const [draftRole, setDraftRole] = useState(roleOrder[0]);
  const [draftStatus, setDraftStatus] = useState(statusOrder[0]);
  const [issuedTemporaryPassword, setIssuedTemporaryPassword] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId) ?? null,
    [accounts, activeAccountId],
  );

  const roleCounts = useMemo(
    () => ({
      currentSession: accounts.filter((account) => account.isCurrentSession).length,
      linked: accounts.filter((account) => account.memberId).length,
      standalone: accounts.filter((account) => !account.memberId).length,
    }),
    [accounts],
  );

  const statusCounts = useMemo(
    () =>
      statusOrder.reduce(
        (counts, status) => ({
          ...counts,
          [status]: accounts.filter((account) => account.status === status).length,
        }),
        {},
      ),
    [accounts],
  );

  const pendingResetCount = useMemo(
    () => accounts.filter((account) => account.mustChangePassword).length,
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = deferredSearchValue.trim().toLowerCase();

    const nextAccounts = accounts.filter((account) => {
      const matchesSearch = normalizedSearch
        ? [
            account.fullName,
            account.email,
            account.memberLabel,
            account.accessScope,
            account.capabilities.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesRole = selectedRole === 'all' ? true : account.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' ? true : account.status === selectedStatus;
      const matchesLinkage =
        selectedLinkage === 'all'
          ? true
          : selectedLinkage === 'current'
            ? Boolean(account.isCurrentSession)
            : selectedLinkage === 'linked'
              ? Boolean(account.memberId)
              : !account.memberId;

      return matchesSearch && matchesRole && matchesStatus && matchesLinkage;
    });

    return nextAccounts.toSorted((left, right) => {
      if (sortValue === 'name') {
        return left.fullName.localeCompare(right.fullName);
      }

      if (sortValue === 'role') {
        return roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role) || left.fullName.localeCompare(right.fullName);
      }

      if (sortValue === 'status') {
        return statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status) || left.fullName.localeCompare(right.fullName);
      }

      return getActivityTimestamp(right) - getActivityTimestamp(left) || left.fullName.localeCompare(right.fullName);
    });
  }, [accounts, deferredSearchValue, selectedLinkage, selectedRole, selectedStatus, sortValue]);

  function openAccessWorkflow(account) {
    setActiveAccountId(account.id);
    setDraftRole(account.role);
    setDraftStatus(account.status);
    setIssuedTemporaryPassword('');
  }

  function closeAccessWorkflow() {
    setActiveAccountId('');
    setIssuedTemporaryPassword('');
  }

  function handleSaveAccess() {
    if (!activeAccount) {
      return;
    }

    const result = updateAccountAccess(activeAccount.id, {
      role: draftRole,
      status: draftStatus,
    });

    if (result.error) {
      queueAdminToast({
        type: 'error',
        title: 'Access update blocked',
        message: result.error,
      });
      return;
    }

    const changeSummary = [];

    if (result.changes.roleChanged) {
      changeSummary.push(`role set to ${roleMeta[result.account.role].label}`);
    }

    if (result.changes.statusChanged) {
      changeSummary.push(`status set to ${statusMeta[result.account.status].label}`);
    }

    if (!changeSummary.length) {
      queueAdminToast({
        type: 'success',
        title: 'No changes needed',
        message: `${result.account.fullName} already matches the selected access configuration.`,
      });
      closeAccessWorkflow();
      return;
    }

    queueAdminToast({
      type: 'success',
      title: 'Access updated',
      message: `${result.account.fullName}: ${changeSummary.join(' and ')}.`,
    });
    closeAccessWorkflow();
  }

  function handleIssueReset() {
    if (!activeAccount) {
      return;
    }

    const result = issuePasswordReset(activeAccount.id);

    if (result.error) {
      queueAdminToast({
        type: 'error',
        title: 'Reset blocked',
        message: result.error,
      });
      return;
    }

    setIssuedTemporaryPassword(result.temporaryPassword);
    queueAdminToast({
      type: 'success',
      title: 'Temporary password issued',
      message: `${result.account.fullName} must rotate credentials after the next sign-in.`,
    });
  }

  if (!isReady) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Access Control</p>
          <h3>Loading the protected account registry.</h3>
          <p className="admin-body-copy">
            Loading admin accounts from the API before the access desk can render.
          </p>
        </article>
      </section>
    );
  }

  return (
    <>
      <section className="admin-teams-grid">
        <UsersToolbar
          isRefreshing={isPending}
          onRefresh={retry}
          pendingResetCount={pendingResetCount}
          searchValue={searchValue}
          selectedLinkage={selectedLinkage}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
          setSearchValue={setSearchValue}
          setSelectedLinkage={setSelectedLinkage}
          setSelectedRole={setSelectedRole}
          setSelectedStatus={setSelectedStatus}
          setSortValue={setSortValue}
          sortValue={sortValue}
          statusCounts={statusCounts}
        />

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <ShieldCheck size={16} />
            Registry snapshot
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>{accounts.length} access accounts are visible in the management interface.</h4>
              <p>The registry now gives the admin shell a real trust map instead of a placeholder route.</p>
            </div>
            <div className="admin-note-item">
              <h4>{filteredAccounts.length} accounts match the active filters.</h4>
              <p>Search, role, status, and linkage filters now work together in the same review surface.</p>
            </div>
            <div className="admin-note-item">
              <h4>{roleCounts.linked} accounts are tied to member identities.</h4>
              <p>The rest remain standalone administration accounts, which keeps privileged access separate from public-facing profiles.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card admin-editorial-card-wide">
          <div className="admin-panel-heading">
            <Users2 size={16} />
            Account list
          </div>

          {filteredAccounts.length ? (
            <div className="admin-member-list">
              {filteredAccounts.map((account) => (
                <UserAccountRow
                  key={account.id}
                  account={account}
                  onManageAccess={openAccessWorkflow}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <p className="admin-section-kicker">No matching accounts</p>
              <h3>The current filters hide the whole access registry.</h3>
              <p className="admin-body-copy">
                Try widening the search or clearing one of the review filters to bring the account list back into view.
              </p>
            </div>
          )}
        </article>

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <UserCog size={16} />
            Permission bands
          </div>

          <div className="admin-note-list">
            {roleOrder.map((role) => (
              <div key={role} className="admin-note-item">
                <h4>{roleMeta[role].label}</h4>
                <p>{roleMeta[role].description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <KeyRound size={16} />
            Workflow note
          </div>

          <div className="admin-note-list">
            <div className="admin-note-item">
              <h4>Activation, deactivation, and role assignment persist in the database.</h4>
              <p>Changes call the protected users API and update MongoDB-backed admin accounts.</p>
            </div>
            <div className="admin-note-item">
              <h4>Password resets issue one-time temporary credentials in the dialog.</h4>
              <p>The stored registry only keeps the reset reference and forced-rotation flag, while the generated password is shown once at the time of issuance.</p>
            </div>
            <div className="admin-note-item">
              <h4>The current signed-in admin remains read-only.</h4>
              <p>That prevents the browser session from accidentally deactivating or demoting itself while still keeping the live account visible in the registry.</p>
            </div>
          </div>
        </article>

        <article className="admin-editorial-card">
          <div className="admin-panel-heading">
            <UserRoundCheck size={16} />
            Status read
          </div>

          <div className="admin-note-list">
            {statusOrder.map((status) => (
              <div key={status} className="admin-note-item">
                <h4>{statusMeta[status].label}</h4>
                <p>{statusMeta[status].description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <AccessWorkflowDialog
        account={activeAccount}
        draftRole={draftRole}
        draftStatus={draftStatus}
        issuedTemporaryPassword={issuedTemporaryPassword}
        onClose={closeAccessWorkflow}
        onIssueReset={handleIssueReset}
        onRoleChange={setDraftRole}
        onSave={handleSaveAccess}
        onStatusChange={setDraftStatus}
      />
    </>
  );
}
