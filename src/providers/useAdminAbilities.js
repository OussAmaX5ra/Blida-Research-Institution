import { useContext, useMemo } from 'react';

import {
  clientHasPermission,
  entityCreatePermission,
  entityDeletePermission,
  entityPublishPermission,
  entityUpdatePermission,
  isSuperAdminRole,
} from '../lib/admin-permission-utils.js';
import { AdminAbilitiesContext } from './AdminAbilitiesContext.js';

export function useAdminAbilities() {
  const context = useContext(AdminAbilitiesContext);

  if (!context) {
    throw new Error('useAdminAbilities must be used within an AdminAbilitiesProvider.');
  }

  return context;
}

/**
 * @param {{ role?: string, permissions?: string[] } | null} user
 */
export function buildAdminAbilities(user) {
  const permissions = user?.permissions ?? [];
  const role = user?.role ?? '';

  return {
    permissions,
    role,
    isSuperAdmin: isSuperAdminRole(role),
    hasPermission(permission) {
      return clientHasPermission(permissions, permission);
    },
    canDelete(entity) {
      return entityDeletePermission(permissions, entity);
    },
    canCreate(entity) {
      return entityCreatePermission(permissions, entity);
    },
    canUpdate(entity) {
      return entityUpdatePermission(permissions, entity);
    },
    canPublish(entity) {
      return entityPublishPermission(permissions, entity);
    },
  };
}

export function useBuildAdminAbilities(user) {
  return useMemo(() => buildAdminAbilities(user), [user]);
}
