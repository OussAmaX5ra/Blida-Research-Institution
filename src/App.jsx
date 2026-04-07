import { useEffect, useState } from 'react';
import PublicLayout from './components/site/PublicLayout';
import { matchPublicRoute, normalizePathname } from './site/publicRouting';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import MembersPage from './pages/MembersPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import NewsPage from './pages/NewsPage';
import PublicationDetailsPage from './pages/PublicationDetailsPage';
import ProjectsPage from './pages/ProjectsPage';
import PublicationsPage from './pages/PublicationsPage';
import ResearchAxesPage from './pages/ResearchAxesPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import TeamsPage from './pages/TeamsPage';
import { usePublicData } from './providers/PublicDataProvider.jsx';
import { applyDocumentMetadata, buildRouteMetadata } from './site/documentMetadata';

export default function App() {
  const { collections } = usePublicData();
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '/' : normalizePathname(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePathname(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function handleNavigate(event, nextPath) {
    const normalizedNextPath = normalizePathname(nextPath);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    if (normalizedNextPath === pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', normalizedNextPath);
    setPathname(normalizedNextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const { route, params } = matchPublicRoute(pathname);
  const activeTeam = route?.id === 'team-details'
    ? collections.teams.find((team) => team.slug === params.slug) ?? null
    : null;
  const activePublication = route?.id === 'publication-details'
    ? collections.publications.find((publication) => publication.slug === params.slug) ?? null
    : null;
  const activeNews = route?.id === 'news-details'
    ? collections.news.find((item) => item.slug === params.slug) ?? null
    : null;
  const currentRoute = activeTeam
    ? {
        ...route,
        label: activeTeam.name,
      }
    : activePublication
      ? {
          ...route,
          label: activePublication.title,
        }
    : activeNews
      ? {
          ...route,
          label: activeNews.headline,
        }
      : route;

  useEffect(() => {
    const metadata = buildRouteMetadata({
      currentRoute,
      pathname,
      activeTeam,
      activePublication,
      activeNews,
    });

    applyDocumentMetadata(metadata);
  }, [activeNews, activePublication, activeTeam, currentRoute, pathname]);

  const homePage = currentRoute?.id === 'home'
    ? <HomePage onNavigate={handleNavigate} />
    : null;
  const aboutPage = currentRoute?.id === 'about'
    ? <AboutPage onNavigate={handleNavigate} />
    : null;
  const researchAxesPage = currentRoute?.id === 'research-axes'
    ? <ResearchAxesPage onNavigate={handleNavigate} />
    : null;
  const teamsPage = currentRoute?.id === 'teams'
    ? <TeamsPage onNavigate={handleNavigate} />
    : null;
  const membersPage = currentRoute?.id === 'members'
    ? <MembersPage onNavigate={handleNavigate} />
    : null;
  const projectsPage = currentRoute?.id === 'projects'
    ? <ProjectsPage onNavigate={handleNavigate} />
    : null;
  const publicationsPage = currentRoute?.id === 'publications'
    ? <PublicationsPage onNavigate={handleNavigate} />
    : null;
  const newsPage = currentRoute?.id === 'news'
    ? <NewsPage onNavigate={handleNavigate} />
    : null;
  const galleryPage = currentRoute?.id === 'gallery'
    ? <GalleryPage onNavigate={handleNavigate} />
    : null;
  const contactPage = currentRoute?.id === 'contact'
    ? <ContactPage onNavigate={handleNavigate} />
    : null;
  const adminLoginPage = currentRoute?.id === 'admin-login'
    ? <AdminLoginPage onNavigate={handleNavigate} />
    : null;
  const newsDetailsPage = currentRoute?.id === 'news-details'
    ? <NewsDetailsPage slug={params.slug} onNavigate={handleNavigate} />
    : null;
  const publicationDetailsPage = currentRoute?.id === 'publication-details'
    ? <PublicationDetailsPage slug={params.slug} onNavigate={handleNavigate} />
    : null;
  const teamDetailsPage = currentRoute?.id === 'team-details'
    ? <TeamDetailsPage slug={params.slug} onNavigate={handleNavigate} />
    : null;

  return (
    <PublicLayout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {homePage ?? aboutPage ?? researchAxesPage ?? teamsPage ?? membersPage ?? projectsPage ?? publicationsPage ?? newsPage ?? galleryPage ?? contactPage ?? adminLoginPage ?? newsDetailsPage ?? publicationDetailsPage ?? teamDetailsPage}
    </PublicLayout>
  );
}
