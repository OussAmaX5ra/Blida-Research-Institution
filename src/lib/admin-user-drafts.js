import { useEffect, useMemo, useState } from 'react';

import {
  fetchAdminUsers,
  issueAdminUserPasswordReset,
  updateAdminUserAccess as updateAdminUserAccessApi,
} from './admin-content-api.js';
import { recordAdminActivity } from './admin-activity-log.js';

export const ADMIN_USER_ROLE_OPTIONS = ['super_admin', 'content_admin', 'editor'];
export const ADMIN_USER_STATUS_OPTIONS = ['active', 'inactive', 'locked'];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCapabilities(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return [];
}

function toStoredUserRecord(account) {
  return {
    accessScope: normalizeText(account.accessScope),
    capabilities: normalizeCapabilities(account.capabilities),
    createdAt: account.createdAt ?? new Date().toISOString(),
    email: normalizeText(account.email).toLowerCase(),
    fullName: normalizeText(account.fullName),
    id: String(account.id),
    isCurrentSession: Boolean(account.isCurrentSession),
    lastLoginAt: account.lastLoginAt ?? null,
    memberId: account.memberId ?? null,
    memberLabel: normalizeText(account.memberLabel),
    mustChangePassword: Boolean(account.mustChangePassword),
    passwordResetAt: account.passwordResetAt ?? null,
    passwordResetReference: normalizeText(account.passwordResetReference),
    role: ADMIN_USER_ROLE_OPTIONS.includes(account.role) ? account.role : 'editor',
    status: ADMIN_USER_STATUS_OPTIONS.includes(account.status) ? account.status : 'active',
    updatedAt: account.updatedAt ?? new Date().toISOString(),
  };
}

export function useAdminUserDrafts(sessionUser) {
  const [storedUsers, setStoredUsers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    async function loadUsers() {
      try {
        const records = await fetchAdminUsers(abortController.signal);

        if (isCancelled) {
          return;
        }

        setStoredUsers(records.map((account) => toStoredUserRecord(account)));
      } catch {
        if (!isCancelled) {
          setStoredUsers([]);
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    loadUsers();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [sessionUser?.id]);

  const accounts = useMemo(() => storedUsers, [storedUsers]);

  function findStoredUser(accountId) {
    return storedUsers.find((account) => account.id === accountId) ?? null;
  }

  function isCurrentSessionAccount(account) {
    return Boolean(account?.isCurrentSession);
  }

  return {
    accounts,
    isReady,
    async updateAccountAccess(accountId, nextAccess) {
      const existingAccount = findStoredUser(accountId);

      if (!existingAccount) {
        return {
          account: null,
          error: 'The selected admin account could not be found.',
        };
      }

      if (isCurrentSessionAccount(existingAccount)) {
        return {
          account: null,
          error: 'The current signed-in account cannot be reassigned from this browser session.',
        };
      }

      try {
        const updatedAccount = toStoredUserRecord(
          await updateAdminUserAccessApi(accountId, {
            role: nextAccess.role,
            status: nextAccess.status,
          }),
        );
        const nextUsers = storedUsers.map((account) =>
          account.id === accountId ? updatedAccount : account,
        );

        setStoredUsers(nextUsers);
        recordAdminActivity({
          action: 'user.update',
          afterSnapshot: updatedAccount,
          beforeSnapshot: existingAccount,
          entityId: updatedAccount.id,
          entityLabel: updatedAccount.fullName,
          entityType: 'user',
          summary: `${updatedAccount.fullName} had protected access settings updated.`,
        });

        return {
          account: updatedAccount,
          changes: {
            roleChanged: updatedAccount.role !== existingAccount.role,
            statusChanged: updatedAccount.status !== existingAccount.status,
          },
          error: '',
        };
      } catch (error) {
        return {
          account: null,
          error:
            error instanceof Error
              ? error.message
              : 'The selected admin account could not be updated.',
        };
      }
    },
    async issuePasswordReset(accountId) {
      const existingAccount = findStoredUser(accountId);

      if (!existingAccount) {
        return {
          account: null,
          error: 'The selected admin account could not be found.',
          temporaryPassword: '',
        };
      }

      if (isCurrentSessionAccount(existingAccount)) {
        return {
          account: null,
          error: 'Reset the current signed-in account from a different administrative session.',
          temporaryPassword: '',
        };
      }

      try {
        const result = await issueAdminUserPasswordReset(accountId);
        const nextAccount = toStoredUserRecord(result.account);
        const nextUsers = storedUsers.map((account) =>
          account.id === accountId ? nextAccount : account,
        );

        setStoredUsers(nextUsers);
        recordAdminActivity({
          action: 'user.reset_password',
          afterSnapshot: nextAccount,
          beforeSnapshot: existingAccount,
          entityId: nextAccount.id,
          entityLabel: nextAccount.fullName,
          entityType: 'user',
          summary: `${nextAccount.fullName} received a one-time password reset workflow.`,
        });

        return {
          account: nextAccount,
          error: '',
          temporaryPassword: result.temporaryPassword,
        };
      } catch (error) {
        return {
          account: null,
          error:
            error instanceof Error
              ? error.message
              : 'The password reset could not be issued.',
          temporaryPassword: '',
        };
      }
    },
  };
}
