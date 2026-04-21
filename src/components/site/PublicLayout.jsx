import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Menu,
  Shield,
  X,
} from 'lucide-react';
import {
  publicFooterNavigation,
  publicPrimaryNavigation,
  publicUtilityNavigation,
} from '../../site/publicRouteMap';
import { getRouteBranch, isRouteActive } from '../../site/publicRouting';

function NavLink({
  route,
  currentRoute,
  onNavigate,
  className = '',
  showArrow = false,
  variant = 'primary',
}) {
  const active = isRouteActive(currentRoute, route);

  return (
    <a
      href={route.path}
      className={`nav-link ${className}`.trim()}
      aria-current={active ? 'page' : undefined}
      data-active={active ? 'true' : 'false'}
      data-variant={variant}
      onClick={(event) => onNavigate(event, route.path)}
    >
      <span>{route.label}</span>
      {showArrow ? <ArrowRight size={14} /> : null}
    </a>
  );
}

function PublicHeader({ currentRoute, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRailRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (navRailRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRailRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const scrollNav = (direction) => {
    if (navRailRef.current) {
      const scrollAmount = 200;
      navRailRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Close mobile menu when route changes
  const prevRouteRef = useRef(currentRoute?.path);
  useEffect(() => {
    if (prevRouteRef.current !== currentRoute?.path) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileOpen(false);
      prevRouteRef.current = currentRoute?.path;
    }
  }, [currentRoute?.path]);

  return (
    <header
      className="site-header"
    >
      <div className="shell-width flex items-center gap-6 py-4">
        <a
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={(event) => onNavigate(event, '/')}
        >
          <div className="brand-mark brand-mark-logo">
            <img
              src="/blida-research-institute-logo.png"
              alt="Blida Research Institute logo"
              className="brand-logo-image"
            />
          </div>
          <div className="min-w-0">
            <p className="brand-title">Blida Research Institute</p>
            <p className="brand-kicker">Institutional Research Platform</p>
          </div>
        </a>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollNav('left')}
              className="nav-scroll-btn nav-scroll-left"
              aria-label="Scroll navigation left"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <ul
            ref={navRailRef}
            className={`nav-rail ${canScrollLeft ? 'scroll-left' : ''} ${canScrollRight ? 'scroll-right' : ''}`}
            onScroll={updateScrollButtons}
          >
            {publicPrimaryNavigation.map((route) => (
              <li key={route.id}>
                <NavLink
                  route={route}
                  currentRoute={currentRoute}
                  onNavigate={onNavigate}
                  className="inline-flex shrink-0"
                  variant="primary"
                />
              </li>
            ))}
          </ul>
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollNav('right')}
              className="nav-scroll-btn nav-scroll-right"
              aria-label="Scroll navigation right"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {publicUtilityNavigation.map((route) => (
            <NavLink
              key={route.id}
              route={route}
              currentRoute={currentRoute}
              onNavigate={onNavigate}
              showArrow
              className="inline-flex"
              variant="utility"
            />
          ))}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen((value) => !value)}
          style={{
            background: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(13,17,23,0.08)',
          }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="mobile-drawer px-6 py-4 lg:hidden"
        >
          <div className="shell-width space-y-5 px-0">
            <div className="grid gap-2">
              {publicPrimaryNavigation.map((route) => (
                <NavLink
                  key={route.id}
                  route={route}
                  currentRoute={currentRoute}
                  onNavigate={onNavigate}
                  className="flex"
                  showArrow
                  variant="mobile"
                />
              ))}
            </div>

            <div className="panel-dark rounded-[1.5rem] p-4">
              <p className="brand-kicker brand-kicker-inverse mb-3">Utility</p>
              {publicUtilityNavigation.map((route) => (
                <NavLink
                  key={route.id}
                  route={route}
                  currentRoute={currentRoute}
                  onNavigate={onNavigate}
                  className="flex"
                  showArrow
                  variant="dark"
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Breadcrumbs({ currentRoute }) {
  if (!currentRoute || currentRoute.id === 'home') {
    return null;
  }

  const branch = getRouteBranch(currentRoute);

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="breadcrumb-text flex flex-wrap items-center gap-2">
        {branch.map((route, index) => (
          <li key={route.id} className="inline-flex items-center gap-2">
            {index > 0 ? <ChevronRight size={12} style={{ color: 'var(--color-muted)' }} /> : null}
            <span style={{ color: index === branch.length - 1 ? 'var(--color-ink)' : 'var(--color-muted)' }}>
              {route.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function RoutePreview({ currentRoute }) {
  if (!currentRoute) {
    return (
      <section className="panel-muted p-8 md:p-10">
        <p className="eyebrow eyebrow-rust">Not Found</p>
        <h1 className="section-heading text-4xl font-bold md:text-5xl">
          Unknown Public Route
        </h1>
        <p className="text-body-muted mt-4 max-w-2xl text-base">
          The public shell is active, but this path is not part of the milestone 2 route map.
        </p>
      </section>
    );
  }

  const sectionLabel =
    currentRoute.pageType.charAt(0).toUpperCase() + currentRoute.pageType.slice(1);

  return (
    <section className="panel-soft">
      <div className="grid gap-8 p-8 md:grid-cols-[1.5fr_0.9fr] md:p-10">
        <div>
          <p className="eyebrow eyebrow-teal">{sectionLabel} Page</p>
          <h1 className="section-heading text-4xl font-bold md:text-6xl">
            {currentRoute.label}
          </h1>
          <p className="text-body-muted mt-5 max-w-2xl text-base">
            This shared layout step establishes the public shell, persistent navigation, footer structure,
            and route-aware framing. The dedicated content for this page comes in later milestone 2 tasks.
          </p>
        </div>

        <div className="panel-dark p-6">
          <div className="space-y-5 text-sm">
            <div>
              <p className="detail-label">Path</p>
              <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.84)' }}>
                {currentRoute.path}
              </p>
            </div>
            <div>
              <p className="detail-label">Hierarchy</p>
              <div className="flex flex-wrap gap-2">
                {getRouteBranch(currentRoute).map((route) => (
                  <span key={route.id} className="meta-chip">
                    {route.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="detail-label">Navigation Group</p>
              <p style={{ color: 'rgba(255,255,255,0.84)' }}>
                {currentRoute.navGroup ?? 'contextual'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicFooter({ currentRoute, onNavigate }) {
  return (
    <footer
      className="site-footer"
    >
      <div className="shell-width grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="brand-mark brand-mark-logo brand-mark-soft brand-mark-footer">
              <img
                src="/blida-research-institute-logo.png"
                alt="Blida Research Institute logo"
                className="brand-logo-image"
              />
            </div>
            <div>
              <p className="brand-title brand-title-inverse text-2xl tracking-[0.03em] normal-case">
                Blida Research Institute
              </p>
              <p className="brand-kicker brand-kicker-inverse">Public academic platform</p>
            </div>
          </div>
          <p className="text-body-inverse mt-5 max-w-lg text-sm">
            Explore the institute's teams, publications, news, and gallery while keeping
            administrative access clearly separated from the public academic experience.
          </p>
        </div>

        <div>
          <p className="brand-kicker brand-kicker-inverse mb-4">Explore</p>
          <div className="grid gap-2">
            {publicFooterNavigation.map((route) => (
              <NavLink
                key={route.id}
                route={route}
                currentRoute={currentRoute}
                onNavigate={onNavigate}
                className="inline-flex"
                variant="footer"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="brand-kicker brand-kicker-inverse mb-4">Boundary</p>
          <div className="footer-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full"
                   style={{ background: 'rgba(201,168,76,0.12)' }}>
                <Shield size={16} style={{ color: 'var(--color-gold)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'white' }}>
                Admin access stays separate
              </p>
            </div>
            <p className="text-sm leading-7" style={{ color: 'rgba(255,255,255,0.58)' }}>
              Utility navigation lives outside the academic primary nav and keeps `/admin/login`
              visually distinct from public discovery flows.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="shell-width flex flex-col gap-3 px-0 text-xs uppercase tracking-[0.2em] md:flex-row md:items-center md:justify-between"
             style={{ color: 'rgba(255,255,255,0.36)' }}>
          <p>Blida Research Institute | Public Platform</p>
          <p>{currentRoute ? currentRoute.label : 'Unknown Route'}</p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ currentRoute, onNavigate, children }) {
  return (
    <div className="site-frame">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <PublicHeader currentRoute={currentRoute} onNavigate={onNavigate} />

      <main id="main-content" className="site-main shell-width">
        <Breadcrumbs currentRoute={currentRoute} />
        {children ?? <RoutePreview currentRoute={currentRoute} />}
      </main>

      <PublicFooter currentRoute={currentRoute} onNavigate={onNavigate} />
    </div>
  );
}
