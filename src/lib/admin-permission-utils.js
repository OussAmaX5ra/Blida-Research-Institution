/**
 * Permission strings must match server/src/utils/rbac.js (RBAC_PERMISSIONS).
 */

export const RBAC_PERMISSIONS = Object.freeze({
  AUDIT_READ: 'audit.read',
  DASHBOARD_READ: 'dashboard.read',
  GALLERY_CREATE: 'gallery.create',
  GALLERY_DELETE: 'gallery.delete',
  GALLERY_PUBLISH: 'gallery.publish',
  GALLERY_READ: 'gallery.read',
  GALLERY_UPDATE: 'gallery.update',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_DELETE: 'members.delete',
  MEMBERS_READ: 'members.read',
  MEMBERS_UPDATE: 'members.update',
  NEWS_CREATE: 'news.create',
  NEWS_DELETE: 'news.delete',
  NEWS_PUBLISH: 'news.publish',
  NEWS_READ: 'news.read',
  NEWS_UPDATE: 'news.update',
  PHD_PROGRESS_CREATE: 'phd_progress.create',
  PHD_PROGRESS_DELETE: 'phd_progress.delete',
  PHD_PROGRESS_READ: 'phd_progress.read',
  PHD_PROGRESS_UPDATE: 'phd_progress.update',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PUBLICATIONS_CREATE: 'publications.create',
  PUBLICATIONS_DELETE: 'publications.delete',
  PUBLICATIONS_PUBLISH: 'publications.publish',
  PUBLICATIONS_READ: 'publications.read',
  PUBLICATIONS_UPDATE: 'publications.update',
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  TEAMS_CREATE: 'teams.create',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_READ: 'teams.read',
  TEAMS_UPDATE: 'teams.update',
  USERS_CREATE: 'users.create',
  USERS_DELETE: 'users.delete',
  USERS_READ: 'users.read',
  USERS_RESET_PASSWORD: 'users.reset_password',
  USERS_UPDATE: 'users.update',
});

const ALL = '*';

const ROUTE_REQUIRED_PERMISSION = {
  'admin-dashboard': RBAC_PERMISSIONS.DASHBOARD_READ,
  'admin-teams': RBAC_PERMISSIONS.TEAMS_READ,
  'admin-team-create': RBAC_PERMISSIONS.TEAMS_CREATE,
  'admin-team-edit': RBAC_PERMISSIONS.TEAMS_UPDATE,
  'admin-members': RBAC_PERMISSIONS.MEMBERS_READ,
  'admin-member-create': RBAC_PERMISSIONS.MEMBERS_CREATE,
  'admin-member-edit': RBAC_PERMISSIONS.MEMBERS_UPDATE,
  'admin-projects': RBAC_PERMISSIONS.PROJECTS_READ,
  'admin-project-create': RBAC_PERMISSIONS.PROJECTS_CREATE,
  'admin-project-edit': RBAC_PERMISSIONS.PROJECTS_UPDATE,
  'admin-publications': RBAC_PERMISSIONS.PUBLICATIONS_READ,
  'admin-publication-create': RBAC_PERMISSIONS.PUBLICATIONS_CREATE,
  'admin-publication-edit': RBAC_PERMISSIONS.PUBLICATIONS_UPDATE,
  'admin-news': RBAC_PERMISSIONS.NEWS_READ,
  'admin-news-create': RBAC_PERMISSIONS.NEWS_CREATE,
  'admin-news-edit': RBAC_PERMISSIONS.NEWS_UPDATE,
  'admin-gallery': RBAC_PERMISSIONS.GALLERY_READ,
  'admin-gallery-create': RBAC_PERMISSIONS.GALLERY_CREATE,
  'admin-gallery-edit': RBAC_PERMISSIONS.GALLERY_UPDATE,
  'admin-users': RBAC_PERMISSIONS.USERS_READ,
};

const SUPER_ADMIN_ONLY_ROUTE_IDS = new Set(['admin-settings', 'admin-activity']);

export function clientHasPermission(permissions, permission) {
  if (!Array.isArray(permissions) || !permission) {
    return false;
  }

  if (permissions.includes(ALL)) {
    return true;
  }

  return permissions.includes(permission);
}

export function clientHasAnyPermission(permissions, ...permissionList) {
  return permissionList.some((p) => clientHasPermission(permissions, p));
}

export function isSuperAdminRole(role) {
  return role === 'super_admin';
}

/**
 * @param {string} routeId
 * @param {{ role?: string, permissions?: string[] } | null} user
 */
export function canAccessAdminRoute(routeId, user) {
  if (!user || !routeId || !routeId.startsWith('admin-') || routeId === 'admin-login') {
    return false;
  }

  const permissions = user.permissions ?? [];

  if (SUPER_ADMIN_ONLY_ROUTE_IDS.has(routeId)) {
    return isSuperAdminRole(user.role);
  }

  if (routeId === 'admin-users') {
    return clientHasPermission(permissions, RBAC_PERMISSIONS.USERS_READ);
  }

  const required = ROUTE_REQUIRED_PERMISSION[routeId];
  if (required) {
    return clientHasPermission(permissions, required);
  }

  return clientHasPermission(permissions, RBAC_PERMISSIONS.DASHBOARD_READ);
}

/**
 * @param {Array<{ id: string }>} routes
 * @param {{ role?: string, permissions?: string[] } | null} user
 */
export function filterAdminNavRoutes(routes, user) {
  if (!user) {
    return [];
  }

  return routes.filter((route) => canAccessAdminRoute(route.id, user));
}

const ENTITY_DELETE = {
  team: RBAC_PERMISSIONS.TEAMS_DELETE,
  member: RBAC_PERMISSIONS.MEMBERS_DELETE,
  project: RBAC_PERMISSIONS.PROJECTS_DELETE,
  publication: RBAC_PERMISSIONS.PUBLICATIONS_DELETE,
  news: RBAC_PERMISSIONS.NEWS_DELETE,
  gallery: RBAC_PERMISSIONS.GALLERY_DELETE,
};

const ENTITY_CREATE = {
  team: RBAC_PERMISSIONS.TEAMS_CREATE,
  member: RBAC_PERMISSIONS.MEMBERS_CREATE,
  project: RBAC_PERMISSIONS.PROJECTS_CREATE,
  publication: RBAC_PERMISSIONS.PUBLICATIONS_CREATE,
  news: RBAC_PERMISSIONS.NEWS_CREATE,
  gallery: RBAC_PERMISSIONS.GALLERY_CREATE,
};

const ENTITY_UPDATE = {
  team: RBAC_PERMISSIONS.TEAMS_UPDATE,
  member: RBAC_PERMISSIONS.MEMBERS_UPDATE,
  project: RBAC_PERMISSIONS.PROJECTS_UPDATE,
  publication: RBAC_PERMISSIONS.PUBLICATIONS_UPDATE,
  news: RBAC_PERMISSIONS.NEWS_UPDATE,
  gallery: RBAC_PERMISSIONS.GALLERY_UPDATE,
};

const ENTITY_PUBLISH = {
  publication: RBAC_PERMISSIONS.PUBLICATIONS_PUBLISH,
  news: RBAC_PERMISSIONS.NEWS_PUBLISH,
  gallery: RBAC_PERMISSIONS.GALLERY_PUBLISH,
};

/**
 * @param {string[]} permissions
 * @param {'team'|'member'|'project'|'publication'|'news'|'gallery'} entity
 */
export function entityDeletePermission(permissions, entity) {
  const key = ENTITY_DELETE[entity];
  return key ? clientHasPermission(permissions, key) : false;
}

export function entityCreatePermission(permissions, entity) {
  const key = ENTITY_CREATE[entity];
  return key ? clientHasPermission(permissions, key) : false;
}

export function entityUpdatePermission(permissions, entity) {
  const key = ENTITY_UPDATE[entity];
  return key ? clientHasPermission(permissions, key) : false;
}

export function entityPublishPermission(permissions, entity) {
  const key = ENTITY_PUBLISH[entity];
  return key ? clientHasPermission(permissions, key) : false;
}
