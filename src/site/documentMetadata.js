const DEFAULT_SITE_NAME = 'Blida Research Institute';
const DEFAULT_DESCRIPTION =
  'Blida Research Institute public platform for research teams, members, projects, publications, news, and institutional updates.';

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  return element;
}

function ensureCanonicalLink() {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  return link;
}

export function applyDocumentMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = '/',
  robots = 'index,follow',
}) {
  if (typeof document === 'undefined') {
    return;
  }

  const resolvedTitle = title
    ? `${title} | ${DEFAULT_SITE_NAME}`
    : DEFAULT_SITE_NAME;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl =
    typeof window === 'undefined'
      ? pathname
      : new URL(pathname, window.location.origin).toString();

  document.title = resolvedTitle;

  ensureMeta('meta[name="description"]', { name: 'description' }).setAttribute(
    'content',
    resolvedDescription,
  );
  ensureMeta('meta[name="robots"]', { name: 'robots' }).setAttribute('content', robots);
  ensureMeta('meta[property="og:title"]', { property: 'og:title' }).setAttribute(
    'content',
    resolvedTitle,
  );
  ensureMeta('meta[property="og:description"]', {
    property: 'og:description',
  }).setAttribute('content', resolvedDescription);
  ensureMeta('meta[property="og:type"]', { property: 'og:type' }).setAttribute(
    'content',
    'website',
  );
  ensureMeta('meta[property="og:url"]', { property: 'og:url' }).setAttribute(
    'content',
    canonicalUrl,
  );
  ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute(
    'content',
    'summary_large_image',
  );
  ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' }).setAttribute(
    'content',
    resolvedTitle,
  );
  ensureMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
  }).setAttribute('content', resolvedDescription);

  ensureCanonicalLink().setAttribute('href', canonicalUrl);
}

export function buildRouteMetadata({
  currentRoute,
  pathname,
  activeTeam,
  activePublication,
  activeNews,
}) {
  if (!currentRoute) {
    return {
      title: 'Page Not Found',
      description:
        'The requested page is not part of the public Blida Research Institute route map.',
      pathname,
      robots: 'noindex,follow',
    };
  }

  const staticMetadata = {
    home: {
      title: 'Home',
      description:
        'Discover Blida Research Institute research teams, publications, institutional news, and public academic activity.',
    },
    about: {
      title: 'About the Lab',
      description:
        'Learn about the Blida Research Institute mission, institutional position, and scientific direction.',
    },
    'research-axes': {
      title: 'Research Axes',
      description:
        'Explore the major scientific axes shaping Blida Research Institute across AI, bioinformatics, HCI, and distributed systems.',
    },
    teams: {
      title: 'Research Teams',
      description:
        'Browse the Blida Research Institute research teams, their leaders, themes, and scientific focus areas.',
    },
    members: {
      title: 'Members Directory',
      description:
        'Search the public directory of Blida Research Institute professors, doctors, and PhD students by role, team, and theme.',
    },
    projects: {
      title: 'Projects',
      description:
        'Review active and completed Blida Research Institute projects by team, status, year, and scientific theme.',
    },
    publications: {
      title: 'Publications',
      description:
        'Search the Blida Research Institute publication library by year, publisher, team, author, and scientific theme.',
    },
    news: {
      title: 'News',
      description:
        'Read institutional news, awards, funding, milestones, and research updates from Blida Research Institute.',
    },
    gallery: {
      title: 'Gallery',
      description:
        'Browse public imagery and institutional moments from Blida Research Institute events, workshops, and research life.',
    },
    contact: {
      title: 'Contact',
      description:
        'Find contact details, institutional location, and outreach guidance for Blida Research Institute.',
    },
    'admin-login': {
      title: 'Admin Login',
      description:
        'Secure administrator sign-in for the Blida Research Institute management portal.',
      robots: 'noindex,nofollow',
    },
  };

  if (currentRoute.id === 'team-details') {
    return activeTeam
      ? {
          title: `${activeTeam.name}`,
          description: `${activeTeam.summary} Explore members, projects, publications, and related news for this research team.`,
          pathname,
        }
      : {
          title: 'Team Not Found',
          description:
            'The requested research team could not be found in the current public lab dataset.',
          pathname,
          robots: 'noindex,follow',
        };
  }

  if (currentRoute.id === 'publication-details') {
    return activePublication
      ? {
          title: activePublication.title,
          description:
            activePublication.abstract ??
            `Publication record from ${activePublication.publisher} (${activePublication.year}) in the Blida Research Institute library.`,
          pathname,
        }
      : {
          title: 'Publication Not Found',
          description:
            'The requested publication could not be found in the current public lab library.',
          pathname,
          robots: 'noindex,follow',
        };
  }

  if (currentRoute.id === 'news-details') {
    return activeNews
      ? {
          title: activeNews.headline,
          description:
            activeNews.excerpt ??
            'Institutional news and research update from the Blida Research Institute public platform.',
          pathname,
        }
      : {
          title: 'News Story Not Found',
          description:
            'The requested institutional news story could not be found in the current public dataset.',
          pathname,
          robots: 'noindex,follow',
        };
  }

  return {
    ...staticMetadata[currentRoute.id],
    pathname,
  };
}
