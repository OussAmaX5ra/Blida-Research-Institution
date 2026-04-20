import { useMemo } from 'react';
import { BookCopy, ChartNoAxesCombined, History, ShieldCheck } from 'lucide-react';

import { useAdminActivityLog } from '../../lib/admin-activity-log.js';
import { usePublicData } from '../../providers/usePublicData.js';

function formatActivityTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });
}

const EDITORIAL_QUEUE = new Set(['Review', 'Draft']);

function countEditorialQueue(news, publications, gallery) {
  const n = news.filter((item) => EDITORIAL_QUEUE.has(item.status)).length;
  const p = publications.filter((item) => EDITORIAL_QUEUE.has(item.status)).length;
  const g = gallery.filter((item) => EDITORIAL_QUEUE.has(item.status)).length;
  return n + p + g;
}

export default function AdminDashboardPage() {
  const { collections } = usePublicData();
  const { entries } = useAdminActivityLog();
  const recentActivity = entries.slice(0, 6);

  const metrics = useMemo(() => {
    const {
      teams = [],
      members = [],
      projects = [],
      publications = [],
      news = [],
      gallery = [],
    } = collections;

    const contentTotal =
      publications.length + news.length + gallery.length + projects.length;
    const editorialQueue = countEditorialQueue(news, publications, gallery);

    return [
      {
        change: `${teams.length} research teams`,
        label: 'Teams',
        tone: 'up',
        value: String(teams.length),
      },
      {
        change: `${members.length} people`,
        label: 'Members',
        tone: 'neutral',
        value: String(members.length),
      },
      {
        change: `${contentTotal} across projects, publications, news, gallery`,
        label: 'Content records',
        tone: 'warn',
        value: String(contentTotal),
      },
      {
        change:
          editorialQueue > 0
            ? `${editorialQueue} not yet published`
            : 'Nothing waiting in Review/Draft',
        label: 'Editorial queue',
        tone: editorialQueue > 0 ? 'down' : 'up',
        value: String(editorialQueue),
      },
    ];
  }, [collections]);

  const briefing = useMemo(() => {
    const { projects = [], publications = [], news = [], gallery = [] } = collections;
    return [
      {
        body: `${projects.length} project${projects.length === 1 ? '' : 's'} in the database with team and year metadata.`,
        title: 'Projects',
      },
      {
        body: `${publications.length} publication${publications.length === 1 ? '' : 's'} indexed for the public bibliography.`,
        title: 'Publications',
      },
      {
        body: `${news.length} news stor${news.length === 1 ? 'y' : 'ies'} and ${gallery.length} gallery entr${gallery.length === 1 ? 'y' : 'ies'}.`,
        title: 'News & gallery',
      },
    ];
  }, [collections]);

  return (
    <section className="admin-editorial-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Admin overview</p>
        <h3>Content is loaded from the API and stored in MongoDB.</h3>
        <p className="admin-body-copy">
          Counts below reflect the same collections that power the public site. Use the navigation to
          create or edit records; successful saves call the protected admin API and invalidate the
          public cache.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ShieldCheck size={16} />
          Live inventory
        </div>
        <div className="admin-metric-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className={`admin-metric-chip admin-metric-${metric.tone}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <em>{metric.change}</em>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <BookCopy size={16} />
          Collection snapshot
        </div>
        <div className="admin-note-list">
          {briefing.map((note) => (
            <div key={note.title} className="admin-note-item">
              <h4>{note.title}</h4>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <History size={16} />
          Recent activity
        </div>
        {recentActivity.length ? (
          <div className="admin-timeline-list">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="admin-timeline-row">
                <time>{formatActivityTime(entry.createdAt)}</time>
                <div>
                  <strong>{entry.entityLabel || entry.action}</strong>
                  <span>{entry.summary || entry.action}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-body-copy">
            Content saves and deletes will appear here as you work in this browser (local activity log).
          </p>
        )}
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ChartNoAxesCombined size={16} />
          Data flow
        </div>
        <p className="admin-body-copy">
          Public pages read from <code className="text-sm">/api/public</code> aggregates. Admin forms
          write through <code className="text-sm">/api/admin/content/…</code> with validation. After a
          successful write, the public data provider refreshes so the site stays aligned with the
          database.
        </p>
      </article>
    </section>
  );
}
