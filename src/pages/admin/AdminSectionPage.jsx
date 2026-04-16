import { ArrowRight, Layers3, ShieldCheck, Sparkles } from 'lucide-react';

import { adminSectionContentById } from '../../data/adminData.js';

export default function AdminSectionPage({ routeId }) {
  const content = adminSectionContentById[routeId];

  if (!content) {
    return null;
  }

  return (
    <section className="admin-placeholder-grid">
      <article className="admin-editorial-card admin-editorial-card-wide">
        <p className="admin-section-kicker">{content.eyebrow}</p>
        <h3>{content.title}</h3>
        <p className="admin-body-copy">{content.description}</p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Layers3 size={16} />
          Next milestone tasks
        </div>
        <div className="admin-quick-list">
          {content.highlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <ShieldCheck size={16} />
          Why this route exists now
        </div>
        <p className="admin-body-copy">
          The protected shell is the first Milestone 3 deliverable. Each section now has a stable
          destination, shared navigation context, and consistent admin framing before CRUD behavior
          is layered in.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Design note
        </div>
        <p className="admin-body-copy">
          This workspace inherits the dashboard’s editorial direction so the entire admin system can
          feel like a serious operational surface instead of a copy of the public marketing site.
        </p>
        <div className="admin-inline-action">
          <span>Ready for the next CRUD task in this section</span>
          <ArrowRight size={15} />
        </div>
      </article>
    </section>
  );
}
