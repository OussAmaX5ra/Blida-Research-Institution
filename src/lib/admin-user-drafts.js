import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-user-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-user-drafts:change';

export const ADMIN_USER_ROLE_OPTIONS = ['super_admin', 'content_admin', 'editor'];
export const ADMIN_USER_STATUS_OPTIONS = ['active', 'inactive', 'locked'];

const seededAccounts = [
  {
    id: 'seed-user-01',
    fullName: 'Pr. Nadia Benkirane',
    email: 'nadia.benkirane@blida-ri.dz',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: '2026-04-15T16:40:00Z',
    memberId: 'member-governance-01',
    memberLabel: 'Directorate and institute governance',
    accessScope: 'Owns security, publishing policy, user governance, and system oversight.',
    capabilities: ['Security approvals', 'Role governance', 'Platform settings'],
  },
  {
    id: 'seed-user-02',
    fullName: 'Samir Tighilt',
    email: 'samir.tighilt@blida-ri.dz',
    role: 'content_admin',
    status: 'active',
    lastLoginAt: '2026-04-15T11:12:00Z',
    memberId: 'member-archive-02',
    memberLabel: 'Publication and archive coordination',
    accessScope: 'Stewards publications, institutional stories, and visual archive quality.',
    capabilities: ['Publication queue', 'News desk', 'Gallery archive'],
  },
  {
    id: 'seed-user-03',
    fullName: 'Meriem Azzouz',
    email: 'meriem.azzouz@blida-ri.dz',
    role: 'editor',
    status: 'active',
    lastLoginAt: '2026-04-14T09:25:00Z',
    memberId: 'member-editorial-03',
    memberLabel: 'Doctoral communications desk',
    accessScope: 'Supports editorial cleanup and structured metadata hygiene across admin surfaces.',
    capabilities: ['Editorial cleanup', 'Metadata checks', 'Draft review'],
  },
  {
    id: 'seed-user-04',
    fullName: 'Yacine Khellaf',
    email: 'yacine.khellaf@blida-ri.dz',
    role: 'content_admin',
    status: 'inactive',
    lastLoginAt: '2026-03-28T08:05:00Z',
    memberId: null,
    memberLabel: 'Former grant communication liaison',
    accessScope: 'Previously coordinated grant and partnership announcements.',
    capabilities: ['Research updates', 'Partner notes', 'Archive review'],
  },
  {
    id: 'seed-user-05',
    fullName: 'Lina Boukhalfa',
    email: 'lina.boukhalfa@blida-ri.dz',
    role: 'editor',
    status: 'locked',
    lastLoginAt: '2026-04-10T18:30:00Z',
    memberId: null,
    memberLabel: 'Student newsroom coordination',
    accessScope: 'Handles first-pass edits for campus-facing updates and event coverage.',
    capabilities: ['Story intake', 'Caption review', 'Editorial staging'],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCapabilities(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return [];
}

function toStoredUserRecord(account, { isCurrentSession = false } = {}) {
  return {
    accessScope: normalizeText(account.accessScope),
    capabilities: normalizeCapabilities(account.capabilities),
    createdAt: account.createdAt ?? new Date().toISOString(),
    email: normalizeText(account.email).toLowerCase(),
    fullName: normalizeText(account.fullName),
    id: String(account.id),
    isCurrentSession,
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

function readStoredUsers() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredUsers(users) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function ensureSeededUsers() {
  const storedUsers = readStoredUsers();

  if (storedUsers?.length) {
    return storedUsers;
  }

  const nextUsers = seededAccounts.map((account) => toStoredUserRecord(account));
  writeStoredUsers(nextUsers);
  return nextUsers;
}

function buildTemporaryPassword() {
  return `BRI-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAdminUserDrafts(sessionUser) {
  const [storedUsers, setStoredUsers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const sessionAccount = useMemo(() => {
    if (!sessionUser) {
      return null;
    }

    return toStoredUserRecord(
      {
        id: sessionUser.id,
        fullName: sessionUser.fullName,
        email: sessionUser.email,
        role: sessionUser.role,
        status: sessionUser.status,
        lastLoginAt: null,
        memberId: sessionUser.memberId ?? null,
        memberLabel: sessionUser.memberId
          ? 'Linked to a member profile in the protected system.'
          : 'Authenticated directly as an admin account.',
        accessScope: 'This is the authenticated account active in the current browser session.',
        capabilities:
          sessionUser.permissions?.length
            ? sessionUser.permissions.slice(0, 3).map((permission) => permission.replaceAll('-', ' '))
            : ['Protected workspace'],
      },
      { isCurrentSession: true },
    );
  }, [sessionUser]);

  useEffect(() => {
    const syncUsers = () => {
      const nextUsers = ensureSeededUsers();
      setStoredUsers(nextUsers);
      setIsReady(true);
    };

    syncUsers();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncUsers);
    window.addEventListener('storage', syncUsers);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncUsers);
      window.removeEventListener('storage', syncUsers);
    };
  }, []);

  const accounts = useMemo(() => {
    const accountMap = new Map(
      storedUsers.map((account) => [account.email.toLowerCase(), account]),
    );

    if (sessionAccount) {
      const existingAccount = accountMap.get(sessionAccount.email.toLowerCase());

      accountMap.set(sessionAccount.email.toLowerCase(), {
        ...existingAccount,
        ...sessionAccount,
        role: sessionAccount.role,
        status: sessionAccount.status,
        isCurrentSession: true,
      });
    }

    return [...accountMap.values()];
  }, [sessionAccount, storedUsers]);

  function findStoredUser(accountId) {
    return storedUsers.find((account) => account.id === accountId) ?? null;
  }

  function isCurrentSessionAccount(account) {
    return Boolean(
      sessionAccount &&
        account &&
        account.email.toLowerCase() === sessionAccount.email.toLowerCase(),
    );
  }

  return {
    accounts,
    isReady,
    updateAccountAccess(accountId, nextAccess) {
      const existingAccount = findStoredUser(accountId);

      if (!existingAccount) {
        return {
          account: null,
          error: 'The selected admin account could not be found in the local user draft store.',
        };
      }

      if (isCurrentSessionAccount(existingAccount)) {
        return {
          account: null,
          error: 'The current signed-in account cannot be reassigned from this browser session.',
        };
      }

      const nextRole = ADMIN_USER_ROLE_OPTIONS.includes(nextAccess.role)
        ? nextAccess.role
        : existingAccount.role;
      const nextStatus = ADMIN_USER_STATUS_OPTIONS.includes(nextAccess.status)
        ? nextAccess.status
        : existingAccount.status;
      const nextAccount = {
        ...existingAccount,
        role: nextRole,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      const nextUsers = storedUsers.map((account) =>
        account.id === accountId ? nextAccount : account,
      );

      writeStoredUsers(nextUsers);
      setStoredUsers(nextUsers);

      return {
        account: nextAccount,
        changes: {
          roleChanged: nextRole !== existingAccount.role,
          statusChanged: nextStatus !== existingAccount.status,
        },
        error: '',
      };
    },
    issuePasswordReset(accountId) {
      const existingAccount = findStoredUser(accountId);

      if (!existingAccount) {
        return {
          account: null,
          error: 'The selected admin account could not be found in the local user draft store.',
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

      const issuedAt = new Date().toISOString();
      const temporaryPassword = buildTemporaryPassword();
      const nextAccount = {
        ...existingAccount,
        mustChangePassword: true,
        passwordResetAt: issuedAt,
        passwordResetReference: `RESET-${Date.now().toString(36).toUpperCase()}`,
        updatedAt: issuedAt,
      };
      const nextUsers = storedUsers.map((account) =>
        account.id === accountId ? nextAccount : account,
      );

      writeStoredUsers(nextUsers);
      setStoredUsers(nextUsers);

      return {
        account: nextAccount,
        error: '',
        temporaryPassword,
      };
    },
  };
}
