import { BookCopy, History } from 'lucide-react';

import { useAdminActivityLog } from '../../lib/admin-activity-log.js';
import { usePublicData } from '../../providers/usePublicData.js';
import { AdminDashboardCharts } from '../../components/admin/AdminDashboardCharts.jsx';

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

export default function AdminDashboardPage() {
  const { collections } = usePublicData();
  const { entries } = useAdminActivityLog();
  const recentActivity = entries.slice(0, 6);

  return (
    <section className="admin-dashboard-grid">
      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <BookCopy size={16} />
          Data Analytics
        </div>
        <AdminDashboardCharts collections={collections} />
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <History size={16} />
          Recent Activity
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
    </section>
  );
}