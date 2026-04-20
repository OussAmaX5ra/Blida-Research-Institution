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
          In this section
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
          Data model
        </div>
        <p className="admin-body-copy">
          List and form routes in this section operate on MongoDB through the admin API. Use the main
          navigation entry for this area to manage live records rather than static placeholders.
        </p>
      </article>

      <article className="admin-editorial-card">
        <div className="admin-panel-heading">
          <Sparkles size={16} />
          Design note
        </div>
        <p className="admin-body-copy">
          The admin shell uses the same typography and spacing language as the dashboard so
          operational tasks feel distinct from the public marketing experience.
        </p>
        <div className="admin-inline-action">
          <span>Open the matching list from the sidebar to edit database records</span>
          <ArrowRight size={15} />
        </div>
      </article>
    </section>
  );
}
