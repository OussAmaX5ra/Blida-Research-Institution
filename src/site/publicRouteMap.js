const publicPageHierarchy = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    pageType: 'institutional',
    navGroup: 'primary',
  },
  {
    id: 'about',
    label: 'About the Lab',
    path: '/about',
    pageType: 'institutional',
    navGroup: 'primary',
  },
  {
    id: 'research-axes',
    label: 'Research Axes',
    path: '/research-axes',
    pageType: 'institutional',
    navGroup: 'primary',
  },
  {
    id: 'teams',
    label: 'Research Teams',
    path: '/teams',
    pageType: 'listing',
    navGroup: 'primary',
    children: [
      {
        id: 'team-details',
        label: 'Team Details',
        path: '/teams/:slug',
        pageType: 'detail',
      },
    ],
  },
  {
    id: 'members',
    label: 'Members Directory',
    path: '/members',
    pageType: 'listing',
    navGroup: 'primary',
    children: [
      {
        id: 'member-details',
        label: 'Member Details',
        path: '/members/:slug',
        pageType: 'detail',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    pageType: 'listing',
    navGroup: 'primary',
    children: [
      {
        id: 'project-details',
        label: 'Project Details',
        path: '/projects/:slug',
        pageType: 'detail',
      },
    ],
  },
  {
    id: 'publications',
    label: 'Publications',
    path: '/publications',
    pageType: 'listing',
    navGroup: 'primary',
    children: [
      {
        id: 'publication-details',
        label: 'Publication Details',
        path: '/publications/:slug',
        pageType: 'detail',
      },
    ],
  },
  {
    id: 'news',
    label: 'News',
    path: '/news',
    pageType: 'listing',
    navGroup: 'primary',
    children: [
      {
        id: 'news-details',
        label: 'News Details',
        path: '/news/:slug',
        pageType: 'detail',
      },
    ],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    path: '/gallery',
    pageType: 'listing',
    navGroup: 'primary',
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    pageType: 'institutional',
    navGroup: 'primary',
  },
  {
    id: 'admin-login',
    label: 'Admin Login',
    path: '/admin/login',
    pageType: 'utility',
    navGroup: 'utility',
  },
];

function flattenHierarchy(nodes, parentId = null) {
  return nodes.flatMap((node) => {
    const { children = [], ...route } = node;

    return [
      {
        ...route,
        parentId,
      },
      ...flattenHierarchy(children, node.id),
    ];
  });
}

export const publicRouteMap = flattenHierarchy(publicPageHierarchy);

export const publicPrimaryNavigation = publicRouteMap.filter(
  (route) => route.navGroup === 'primary' && route.parentId === null,
);

export const publicUtilityNavigation = publicRouteMap.filter(
  (route) => route.navGroup === 'utility',
);

export const publicFooterNavigation = [
  'about',
  'teams',
  'publications',
  'news',
  'gallery',
  'contact',
  'admin-login',
].map((routeId) => publicRouteMap.find((route) => route.id === routeId));

export function getPublicRouteById(routeId) {
  return publicRouteMap.find((route) => route.id === routeId) ?? null;
}

export function getPublicRouteByPath(pathname) {
  return publicRouteMap.find((route) => route.path === pathname) ?? null;
}

export { publicPageHierarchy };
