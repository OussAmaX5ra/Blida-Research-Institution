import { useEffect, useMemo, useState } from 'react';
import AdminShell from './components/admin/AdminShell';
import PublicLayout from './components/site/PublicLayout';
import { matchPublicRoute, normalizePathname } from './site/publicRouting';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminMemberFormPage from './pages/admin/AdminMemberFormPage.jsx';
import AdminMembersPage from './pages/admin/AdminMembersPage.jsx';
import AdminPublicationFormPage from './pages/admin/AdminPublicationFormPage.jsx';
import AdminPublicationsPage from './pages/admin/AdminPublicationsPage.jsx';
import AdminNewsFormPage from './pages/admin/AdminNewsFormPage.jsx';
import AdminNewsPage from './pages/admin/AdminNewsPage.jsx';
import AdminGalleryFormPage from './pages/admin/AdminGalleryFormPage.jsx';
import AdminGalleryPage from './pages/admin/AdminGalleryPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminProjectFormPage from './pages/admin/AdminProjectFormPage.jsx';
import AdminProjectsPage from './pages/admin/AdminProjectsPage.jsx';
import AdminTeamFormPage from './pages/admin/AdminTeamFormPage.jsx';
import AdminTeamsPage from './pages/admin/AdminTeamsPage.jsx';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import MembersPage from './pages/MembersPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import NewsPage from './pages/NewsPage';
import PhdProgressPage from './pages/PhdProgressPage';
import PublicationDetailsPage from './pages/PublicationDetailsPage';
import ProjectsPage from './pages/ProjectsPage';
import PublicationsPage from './pages/PublicationsPage';
import ResearchAxesPage from './pages/ResearchAxesPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import TeamsPage from './pages/TeamsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminSectionPage from './pages/admin/AdminSectionPage.jsx';
import { useAdminSession } from './providers/useAdminSession.js';
import { usePublicData } from './providers/usePublicData.js';
import { applyDocumentMetadata, buildRouteMetadata } from './site/documentMetadata';
import AdminActivityPage from './pages/admin/AdminActivityPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminAbilitiesProvider from './providers/AdminAbilitiesProvider.jsx';
import { canAccessAdminRoute } from './lib/admin-permission-utils.js';

function replacePath(nextPath) {
  window.history.replaceState({}, '', nextPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function App() {
  const { collections } = usePublicData();
  const { isAuthenticated, isLoading: isAdminSessionLoading, logout, user } = useAdminSession();
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
    window.dispatchEvent(new PopStateEvent('popstate'));
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
  const currentRoute = useMemo(() => activeTeam
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
    : route, [route, activeTeam, activePublication, activeNews]);
  const isProtectedAdminRoute =
    currentRoute?.id?.startsWith('admin-') && currentRoute.id !== 'admin-login';

  useEffect(() => {
    if (isProtectedAdminRoute && !isAdminSessionLoading && !isAuthenticated) {
      replacePath('/admin/login');
    }
  }, [isAuthenticated, isAdminSessionLoading, isProtectedAdminRoute]);

  useEffect(() => {
    if (currentRoute?.id === 'admin-login' && !isAdminSessionLoading && isAuthenticated) {
      replacePath('/admin');
    }
  }, [currentRoute?.id, isAuthenticated, isAdminSessionLoading]);

  useEffect(() => {
    if (
      !isProtectedAdminRoute
      || isAdminSessionLoading
      || !isAuthenticated
      || !user
      || !currentRoute?.id
    ) {
      return;
    }

    if (!canAccessAdminRoute(currentRoute.id, user)) {
      replacePath('/admin');
    }
  }, [
    currentRoute?.id,
    isAuthenticated,
    isAdminSessionLoading,
    isProtectedAdminRoute,
    user,
  ]);

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
  const phdProgressPage = currentRoute?.id === 'phd-progress'
    ? <PhdProgressPage onNavigate={handleNavigate} />
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
  const adminDashboardPage = currentRoute?.id === 'admin-dashboard'
    ? <AdminDashboardPage />
    : null;
  const adminTeamsPage = currentRoute?.id === 'admin-teams'
    ? <AdminTeamsPage onNavigate={handleNavigate} />
    : null;
  const adminMembersPage = currentRoute?.id === 'admin-members'
    ? <AdminMembersPage onNavigate={handleNavigate} />
    : null;
  const adminProjectsPage = currentRoute?.id === 'admin-projects'
    ? <AdminProjectsPage onNavigate={handleNavigate} />
    : null;
  const adminPublicationsPage = currentRoute?.id === 'admin-publications'
    ? <AdminPublicationsPage onNavigate={handleNavigate} />
    : null;
  const adminNewsPage = currentRoute?.id === 'admin-news'
    ? <AdminNewsPage onNavigate={handleNavigate} />
    : null;
  const adminGalleryPage = currentRoute?.id === 'admin-gallery'
    ? <AdminGalleryPage onNavigate={handleNavigate} />
    : null;
  const adminUsersPage = currentRoute?.id === 'admin-users'
    ? <AdminUsersPage />
    : null;
  const adminActivityPage = currentRoute?.id === 'admin-activity'
    ? <AdminActivityPage />
    : null;
  const adminSettingsPage = currentRoute?.id === 'admin-settings'
    ? <AdminSettingsPage />
    : null;
  const adminTeamCreatePage = currentRoute?.id === 'admin-team-create'
    ? <AdminTeamFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminTeamEditPage = currentRoute?.id === 'admin-team-edit'
    ? <AdminTeamFormPage mode="edit" onNavigate={handleNavigate} teamSlug={params.slug} />
    : null;
  const adminMemberCreatePage = currentRoute?.id === 'admin-member-create'
    ? <AdminMemberFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminMemberEditPage = currentRoute?.id === 'admin-member-edit'
    ? <AdminMemberFormPage mode="edit" onNavigate={handleNavigate} memberSlug={params.slug} />
    : null;
  const adminProjectCreatePage = currentRoute?.id === 'admin-project-create'
    ? <AdminProjectFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminProjectEditPage = currentRoute?.id === 'admin-project-edit'
    ? <AdminProjectFormPage mode="edit" onNavigate={handleNavigate} projectSlug={params.slug} />
    : null;
  const adminPublicationCreatePage = currentRoute?.id === 'admin-publication-create'
    ? <AdminPublicationFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminPublicationEditPage = currentRoute?.id === 'admin-publication-edit'
    ? <AdminPublicationFormPage mode="edit" onNavigate={handleNavigate} publicationSlug={params.slug} />
    : null;
  const adminNewsCreatePage = currentRoute?.id === 'admin-news-create'
    ? <AdminNewsFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminNewsEditPage = currentRoute?.id === 'admin-news-edit'
    ? <AdminNewsFormPage mode="edit" onNavigate={handleNavigate} newsSlug={params.slug} />
    : null;
  const adminGalleryCreatePage = currentRoute?.id === 'admin-gallery-create'
    ? <AdminGalleryFormPage mode="create" onNavigate={handleNavigate} />
    : null;
  const adminGalleryEditPage = currentRoute?.id === 'admin-gallery-edit'
    ? <AdminGalleryFormPage mode="edit" onNavigate={handleNavigate} gallerySlug={params.slug} />
    : null;
  const adminSectionPage = currentRoute?.id?.startsWith('admin-') &&
    currentRoute.id !== 'admin-dashboard' &&
    currentRoute.id !== 'admin-teams' &&
    currentRoute.id !== 'admin-members' &&
    currentRoute.id !== 'admin-projects' &&
    currentRoute.id !== 'admin-publications' &&
    currentRoute.id !== 'admin-news' &&
    currentRoute.id !== 'admin-gallery' &&
    currentRoute.id !== 'admin-users' &&
    currentRoute.id !== 'admin-activity' &&
    currentRoute.id !== 'admin-settings' &&
    currentRoute.id !== 'admin-team-create' &&
    currentRoute.id !== 'admin-team-edit' &&
    currentRoute.id !== 'admin-member-create' &&
    currentRoute.id !== 'admin-member-edit' &&
    currentRoute.id !== 'admin-project-create' &&
    currentRoute.id !== 'admin-project-edit' &&
    currentRoute.id !== 'admin-publication-create' &&
    currentRoute.id !== 'admin-publication-edit' &&
    currentRoute.id !== 'admin-news-create' &&
    currentRoute.id !== 'admin-news-edit' &&
    currentRoute.id !== 'admin-gallery-create' &&
    currentRoute.id !== 'admin-gallery-edit' &&
    currentRoute.id !== 'admin-login'
    ? <AdminSectionPage routeId={currentRoute.id} />
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

  if (currentRoute?.id === 'admin-login') {
    return adminLoginPage;
  }

  if (isProtectedAdminRoute) {
    return (
      <AdminShell
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        user={user}
        onLogout={async () => {
          await logout();
          replacePath('/admin/login');
        }}
      >
        {isAdminSessionLoading
          ? (
            <section className="admin-loading-state">
              <p className="admin-section-kicker">Session Check</p>
              <h3>Opening the protected workspace...</h3>
              <p className="admin-body-copy">
                We&apos;re validating your admin session before rendering the navigation shell.
              </p>
            </section>
            )
          : (
            <AdminAbilitiesProvider user={user}>
              {adminDashboardPage ??
                adminTeamsPage ??
                adminMembersPage ??
                adminProjectsPage ??
                adminPublicationsPage ??
                adminNewsPage ??
                adminGalleryPage ??
                adminUsersPage ??
                adminActivityPage ??
                adminSettingsPage ??
                adminTeamCreatePage ??
                adminTeamEditPage ??
                adminMemberCreatePage ??
                adminMemberEditPage ??
                adminProjectCreatePage ??
                adminProjectEditPage ??
                adminPublicationCreatePage ??
                adminPublicationEditPage ??
                adminNewsCreatePage ??
                adminNewsEditPage ??
                adminGalleryCreatePage ??
                adminGalleryEditPage ??
                adminSectionPage}
            </AdminAbilitiesProvider>
            )}
      </AdminShell>
    );
  }

  return (
    <PublicLayout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {homePage ?? aboutPage ?? researchAxesPage ?? teamsPage ?? membersPage ?? projectsPage ?? publicationsPage ?? phdProgressPage ?? newsPage ?? galleryPage ?? contactPage ?? adminLoginPage ?? newsDetailsPage ?? publicationDetailsPage ?? teamDetailsPage}
    </PublicLayout>
  );
}
