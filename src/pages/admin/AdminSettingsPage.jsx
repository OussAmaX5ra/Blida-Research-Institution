import { memo, useCallback, useDeferredValue, useEffect, useState, useTransition } from 'react';
import {
  Clock,
  KeyRound,
  LogOut,
  Settings,
  Shield,
  User,
} from 'lucide-react';

import { updateCurrentUserProfile } from '../../lib/admin-auth-api.js';
import { queueAdminToast } from '../../lib/admin-toast.js';
import { recordAdminActivity } from '../../lib/admin-activity-log.js';
import { useAdminSession } from '../../providers/useAdminSession.js';

const PAGINATION_OPTIONS = [10, 25, 50, 100];
const PAGINATION_STORAGE_KEY = 'research-lab.admin-pagination';
const PROFILE_COOLDOWN_DAYS = 7;

function getStoredPagination() {
  if (typeof window === 'undefined') return 25;
  const stored = localStorage.getItem(PAGINATION_STORAGE_KEY);
  const parsed = stored ? parseInt(stored, 10) : NaN;
  return PAGINATION_OPTIONS.includes(parsed) ? parsed : 25;
}

function formatDate(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function computeCanUpdateProfile(lastProfileUpdate) {
  if (!lastProfileUpdate) return { canUpdate: true, nextDate: null };
  const lastDate = new Date(lastProfileUpdate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + PROFILE_COOLDOWN_DAYS);
  const now = new Date();
  return {
    canUpdate: now >= nextDate,
    nextDate: nextDate.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

const ProfileSection = memo(function ProfileSection({ user, onProfileUpdate }) {
  const [isPending, startTransition] = useTransition();
  const [draftFullName, setDraftFullName] = useState(() => user?.fullName ?? '');
  const [draftEmail, setDraftEmail] = useState(() => user?.email ?? '');

  const profileUpdateInfo = computeCanUpdateProfile(user?.lastProfileUpdate);
  const canUpdateProfileFlag = profileUpdateInfo.canUpdate;
  const nextDate = profileUpdateInfo.nextDate;

  const hasChanges = draftFullName !== (user?.fullName ?? '') || draftEmail !== (user?.email ?? '');

  const handleFullNameChange = useCallback((e) => {
    setDraftFullName(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setDraftEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!canUpdateProfileFlag || isPending) return;

    startTransition(async () => {
      try {
        await updateCurrentUserProfile(null, {
          fullName: draftFullName.trim(),
          email: draftEmail.trim().toLowerCase(),
        });

        recordAdminActivity({
          action: 'settings.profile.update',
          actor: user,
          entityType: 'admin_user',
          entityId: user?.id,
          summary: `${draftFullName.trim()} updated their profile.`,
        });

        queueAdminToast({
          type: 'success',
          title: 'Profile updated',
          message: 'Your profile has been saved successfully.',
        });

        setDraftFullName(draftFullName.trim());
        setDraftEmail(draftEmail.trim().toLowerCase());
        onProfileUpdate?.();
      } catch (error) {
        const message = error?.message || 'Failed to update profile.';
        queueAdminToast({
          type: 'error',
          title: 'Update failed',
          message,
        });
      }
    });
  }, [canUpdateProfileFlag, draftFullName, draftEmail, isPending, onProfileUpdate, user]);

  const roleMeta = {
    super_admin: { label: 'Super Admin', color: 'var(--color-gold)' },
    content_admin: { label: 'Content Admin', color: 'var(--color-teal)' },
    editor: { label: 'Editor', color: 'var(--admin-paper)' },
  };

  const roleInfo = roleMeta[user?.role] ?? { label: user?.role, color: 'inherit' };
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <article className="admin-editorial-card">
      <div className="admin-panel-heading">
        <User size={16} />
        Profile
      </div>

      <div className="admin-profile-header">
        <div className="admin-profile-avatar">{initials}</div>
        <div className="admin-profile-info">
          <h4>{user?.fullName}</h4>
          <span className="admin-role-badge" style={{ color: roleInfo.color }}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-form-field">
            <span>Full Name</span>
            <input
              type="text"
              value={draftFullName}
              onChange={handleFullNameChange}
              disabled={!canUpdateProfileFlag || isPending}
              required
            />
          </label>

          <label className="admin-form-field">
            <span>Email Address</span>
            <input
              type="email"
              value={draftEmail}
              onChange={handleEmailChange}
              disabled={!canUpdateProfileFlag || isPending}
              required
            />
          </label>
        </div>

        {!canUpdateProfileFlag && (
          <div className="admin-cooldown-notice">
            <Clock size={14} />
            <span>
              Profile updates are allowed once per week. Next update available on {nextDate}.
            </span>
          </div>
        )}

        {hasChanges && canUpdateProfileFlag && (
          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      <div className="admin-profile-meta">
        <div className="admin-meta-item">
          <span>Last updated</span>
          <strong>{formatDate(user?.lastProfileUpdate)}</strong>
        </div>
        <div className="admin-meta-item">
          <span>Last login</span>
          <strong>{formatDateTime(user?.lastLoginAt)}</strong>
        </div>
      </div>
    </article>
  );
});

const PreferencesSection = memo(function PreferencesSection() {
  const [paginationCount, setPaginationCount] = useState(getStoredPagination);
  const deferredPagination = useDeferredValue(paginationCount);

  useEffect(() => {
    localStorage.setItem(PAGINATION_STORAGE_KEY, String(deferredPagination));
  }, [deferredPagination]);

  const handlePaginationChange = useCallback((e) => {
    setPaginationCount(parseInt(e.target.value, 10));
  }, []);

  return (
    <article className="admin-editorial-card">
      <div className="admin-panel-heading">
        <Settings size={16} />
        Preferences
      </div>

      <div className="admin-form-grid">
        <label className="admin-form-field">
          <span>Items per page</span>
          <select value={paginationCount} onChange={handlePaginationChange}>
            {PAGINATION_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num} items
              </option>
            ))}
          </select>
          <em>Default number of records to display in list views.</em>
        </label>
      </div>
    </article>
  );
});

const SessionSection = memo(function SessionSection({ user, onLogout }) {
  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onLogout?.();
    }
  }, [onLogout]);

  return (
    <article className="admin-editorial-card">
      <div className="admin-panel-heading">
        <Shield size={16} />
        Session
      </div>

      <div className="admin-session-info">
        <div className="admin-session-item">
          <KeyRound size={14} />
          <div>
            <span>Session ID</span>
            <strong>{user?.id?.slice(0, 8) ?? '—'}...</strong>
          </div>
        </div>

        <div className="admin-session-item">
          <Clock size={14} />
          <div>
            <span>Last login</span>
            <strong>{formatDateTime(user?.lastLoginAt)}</strong>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-button" onClick={handleLogout}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>

      <p className="admin-body-copy admin-session-note">
        Signing out will end your current session. You will need to sign in again to access the admin workspace.
      </p>
    </article>
  );
});

export default function AdminSettingsPage() {
  const { user, logout, retry } = useAdminSession();

  const handleProfileUpdate = useCallback(() => {
    retry();
  }, [retry]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (!user) {
    return (
      <section className="admin-teams-grid">
        <article className="admin-editorial-card admin-editorial-card-wide">
          <p className="admin-section-kicker">Settings</p>
          <h3>Loading your settings.</h3>
          <p className="admin-body-copy">
            Please wait while we load your profile information.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-settings-grid">
      <ProfileSection user={user} onProfileUpdate={handleProfileUpdate} />
      <PreferencesSection />
      <SessionSection user={user} onLogout={handleLogout} />
    </section>
  );
}