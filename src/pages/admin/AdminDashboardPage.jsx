import {
  AlarmClockCheck,
  BookCopy,
  ChartNoAxesCombined,
  ShieldCheck,
  Siren,
} from 'lucide-react';

import {
  adminApprovalTimeline,
  adminDashboardMetrics,
  adminDeskNotes,
  adminQuickActions,
} from '../../data/adminData.js';

export default function AdminDashboardPage() {
  return (
    <section className="admin-editorial-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">Editorial Mission Control</p>
        <h3>Institutional signal is strong, but approval flow is slipping.</h3>
        <p className="admin-body-copy">
          The admin side now has its own visual system and a protected shell. From here, Milestone 3
          can grow into real content workflows without borrowing the public site’s browsing patterns.
        </p>
        <div className="admin-callout-row">
          <div>
            <span className="admin-callout-label">Priority desk</span>
            <strong>Publication review</strong>
          </div>
          <div>
            <span className="admin-callout-label">Risk horizon</span>
            <strong>DOI mismatch on 2 records</strong>
          </div>
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ShieldCheck size={16} />
          Signal board
        </div>
        <div className="admin-metric-grid">
          {adminDashboardMetrics.map((metric) => (
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
          Morning briefing
        </div>
        <div className="admin-note-list">
          {adminDeskNotes.map((note) => (
            <div key={note.title} className="admin-note-item">
              <h4>{note.title}</h4>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <AlarmClockCheck size={16} />
          Approval clock
        </div>
        <div className="admin-timeline-list">
          {adminApprovalTimeline.map((entry) => (
            <div key={entry.time + entry.item} className="admin-timeline-row">
              <time>{entry.time}</time>
              <div>
                <strong>{entry.item}</strong>
                <span>{entry.status}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card admin-editorial-card-alert">
        <div className="admin-panel-heading">
          <Siren size={16} />
          Visible risk
        </div>
        <p className="admin-body-copy">
          One high-traffic publication still points to a placeholder PDF, and the homepage hero
          references a story card whose category tag has not yet been normalized.
        </p>
        <div className="admin-quick-list">
          {adminQuickActions.map((action) => (
            <span key={action}>{action}</span>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ChartNoAxesCombined size={16} />
          Review tempo
        </div>
        <div className="admin-tempo-bars" aria-label="Review tempo chart">
          <div style={{ '--bar-height': '46%' }} />
          <div style={{ '--bar-height': '68%' }} />
          <div style={{ '--bar-height': '54%' }} />
          <div style={{ '--bar-height': '88%' }} />
          <div style={{ '--bar-height': '73%' }} />
          <div style={{ '--bar-height': '59%' }} />
        </div>
        <p className="admin-chart-note">
          Pace is strongest when news and publications are reviewed on the same editorial cycle.
        </p>
      </article>
    </section>
  );
}
