import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BellDot,
  LogOut,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import AdminToast from './AdminToast.jsx';
import { consumeQueuedAdminToast } from '../../lib/admin-toast.js';
import { adminPrimaryNavigation } from '../../site/publicRouteMap';
import { getRouteBranch, isRouteActive } from '../../site/publicRouting';

function AdminNavLink({ route, currentRoute, onNavigate }) {
  const active = isRouteActive(currentRoute, route);

  return (
    <a
      href={route.path}
      className={`admin-nav-link ${active ? 'is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => onNavigate(event, route.path)}
    >
      <span>{route.label}</span>
    </a>
  );
}

function AdminBreadcrumbs({ currentRoute }) {
  const branch = getRouteBranch(currentRoute).filter((route) => route.id !== 'admin-dashboard');

  if (!branch.length) {
    return (
      <div className="admin-crumbs">
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <div className="admin-crumbs">
      <span>Dashboard</span>
      {branch.map((route) => (
        <span key={route.id}>/ {route.label}</span>
      ))}
    </div>
  );
}

export default function AdminShell({
  currentRoute,
  onNavigate,
  onLogout,
  user,
  children,
}) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const queuedToast = consumeQueuedAdminToast();

    if (!queuedToast) {
      return undefined;
    }

    setToast(queuedToast);

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentRoute?.id]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a
          href="/"
          className="admin-sidebar-home"
          onClick={(event) => onNavigate(event, '/')}
        >
          <ArrowLeft size={15} />
          Return to public site
        </a>

        <div className="admin-brand-block">
          <div className="admin-brand-mark">
            <PanelLeftOpen size={18} />
          </div>
          <div>
            <p className="admin-brand-kicker">Administrative Boundary</p>
            <h1>Mission Control</h1>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <a
            href="/admin"
            className={`admin-nav-link ${currentRoute?.id === 'admin-dashboard' ? 'is-active' : ''}`}
            onClick={(event) => onNavigate(event, '/admin')}
          >
            <span>Dashboard</span>
          </a>
          {adminPrimaryNavigation.map((route) => (
            <AdminNavLink
              key={route.id}
              route={route}
              currentRoute={currentRoute}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="admin-sidebar-note">
          <div className="admin-note-title">
            <ShieldCheck size={16} />
            Protected navigation
          </div>
          <p>
            This shell is the foundation for Milestone 3. It separates administration from the
            public platform and gives each future CRUD workflow a stable route and workspace.
          </p>
        </div>
      </aside>

      <div className="admin-main">
        <AdminToast toast={toast} onClose={() => setToast(null)} />

        <header className="admin-header">
          <div>
            <AdminBreadcrumbs currentRoute={currentRoute} />
            <h2>{currentRoute?.label ?? 'Admin'}</h2>
          </div>

          <div className="admin-header-actions">
            <div className="admin-status-pill">
              <Sparkles size={14} />
              Protected workspace
            </div>
            <div className="admin-status-pill admin-status-pill-muted">
              <BellDot size={14} />
              3 items need review
            </div>
            <div className="admin-user-card">
              <strong>{user?.fullName ?? 'Loading session'}</strong>
              <span>{user?.role?.replaceAll('_', ' ') ?? '...'}</span>
            </div>
            <button type="button" className="admin-logout-button" onClick={onLogout}>
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
