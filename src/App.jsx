import { useEffect, useState } from 'react';
import PublicLayout from './components/site/PublicLayout';
import { matchPublicRoute, normalizePathname } from './site/publicRouting';
import { teams } from './data/mockData';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import ResearchAxesPage from './pages/ResearchAxesPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import TeamsPage from './pages/TeamsPage';

export default function App() {
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
    ? teams.find((team) => team.slug === params.slug) ?? null
    : null;
  const currentRoute = activeTeam
    ? {
        ...route,
        label: activeTeam.name,
      }
    : route;

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
  const teamDetailsPage = currentRoute?.id === 'team-details'
    ? <TeamDetailsPage slug={params.slug} onNavigate={handleNavigate} />
    : null;

  return (
    <PublicLayout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {homePage ?? aboutPage ?? researchAxesPage ?? teamsPage ?? teamDetailsPage}
    </PublicLayout>
  );
}
