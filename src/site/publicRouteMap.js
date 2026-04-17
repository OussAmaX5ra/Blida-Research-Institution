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
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    pageType: 'listing',
    navGroup: 'primary',
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
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/admin',
    pageType: 'admin',
    navGroup: 'admin',
    children: [
      {
        id: 'admin-teams',
        label: 'Teams',
        path: '/admin/teams',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-team-create',
            label: 'Create Team',
            path: '/admin/teams/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-team-edit',
            label: 'Edit Team',
            path: '/admin/teams/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-members',
        label: 'Members',
        path: '/admin/members',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-member-create',
            label: 'Create Member',
            path: '/admin/members/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-member-edit',
            label: 'Edit Member',
            path: '/admin/members/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-projects',
        label: 'Projects',
        path: '/admin/projects',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-project-create',
            label: 'Create Project',
            path: '/admin/projects/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-project-edit',
            label: 'Edit Project',
            path: '/admin/projects/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-publications',
        label: 'Publications',
        path: '/admin/publications',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-publication-create',
            label: 'Create Publication',
            path: '/admin/publications/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-publication-edit',
            label: 'Edit Publication',
            path: '/admin/publications/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-news',
        label: 'News',
        path: '/admin/news',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-news-create',
            label: 'Create News',
            path: '/admin/news/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-news-edit',
            label: 'Edit News',
            path: '/admin/news/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-gallery',
        label: 'Gallery',
        path: '/admin/gallery',
        pageType: 'admin',
        navGroup: 'admin',
        children: [
          {
            id: 'admin-gallery-create',
            label: 'Create Gallery Item',
            path: '/admin/gallery/new',
            pageType: 'admin',
            navGroup: 'admin',
          },
          {
            id: 'admin-gallery-edit',
            label: 'Edit Gallery Item',
            path: '/admin/gallery/:slug/edit',
            pageType: 'admin',
            navGroup: 'admin',
          },
        ],
      },
      {
        id: 'admin-users',
        label: 'Users & Roles',
        path: '/admin/users',
        pageType: 'admin',
        navGroup: 'admin',
      },
      {
        id: 'admin-activity',
        label: 'Activity',
        path: '/admin/activity',
        pageType: 'admin',
        navGroup: 'admin',
      },
      {
        id: 'admin-settings',
        label: 'Settings',
        path: '/admin/settings',
        pageType: 'admin',
        navGroup: 'admin',
      },
    ],
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

export const adminPrimaryNavigation = publicRouteMap.filter(
  (route) => route.navGroup === 'admin' && route.parentId === 'admin-dashboard',
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
