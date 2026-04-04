import { getPublicRouteById, publicRouteMap } from './publicRouteMap';

function trimTrailingSlash(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function normalizePathname(pathname) {
  if (!pathname) {
    return '/';
  }

  return trimTrailingSlash(pathname.startsWith('/') ? pathname : `/${pathname}`);
}

function createPatternRegex(pathPattern) {
  const source = pathPattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([a-zA-Z0-9_]+)/g, '(?<$1>[^/]+)');

  return new RegExp(`^${source}$`);
}

export function matchPublicRoute(pathname) {
  const normalizedPathname = normalizePathname(pathname);

  for (const route of publicRouteMap) {
    const routePattern = createPatternRegex(route.path);
    const match = normalizedPathname.match(routePattern);

    if (match) {
      return {
        route,
        params: match.groups ?? {},
      };
    }
  }

  return {
    route: null,
    params: {},
  };
}

export function getRouteBranch(route) {
  if (!route) {
    return [];
  }

  const branch = [];
  let cursor = route;

  while (cursor) {
    branch.unshift(cursor);
    cursor = cursor.parentId ? getPublicRouteById(cursor.parentId) : null;
  }

  return branch;
}

export function isRouteActive(currentRoute, candidateRoute) {
  if (!currentRoute || !candidateRoute) {
    return false;
  }

  return (
    currentRoute.id === candidateRoute.id ||
    currentRoute.parentId === candidateRoute.id
  );
}
