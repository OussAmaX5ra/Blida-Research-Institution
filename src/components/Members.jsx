import { memo } from 'react';
import { GraduationCap, BookMarked } from 'lucide-react';
import { faculty, teams } from '../data/mockData';

// Build a Map for O(1) team color lookups (js-index-maps)
const teamColorMap = new Map(teams.map(t => [t.acronym, t.color]));

const MemberCard = memo(function MemberCard({ member }) {
  const color = teamColorMap.get(member.team) ?? '#6b7280';

  return (
    <article
      className="flex flex-col items-center text-center p-6 rounded-sm transition-all duration-300 hover:-translate-y-1 group"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        {member.avatar}
      </div>

      {/* Info */}
      <h3 className="font-display font-semibold text-sm leading-snug mb-1" style={{ color: 'var(--color-ink)' }}>
        {member.name}
      </h3>
      <p className="text-xs mb-3" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
        {member.title}
      </p>

      {/* Team badge */}
      <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3"
            style={{ background: `${color}18`, color }}>
        {member.team}
      </span>

      {/* Expertise */}
      <div className="mt-auto flex items-start gap-1.5 text-xs pt-3 w-full"
           style={{ borderTop: '1px solid var(--color-surface-alt)', color: 'var(--color-muted)' }}>
        <BookMarked size={11} className="mt-0.5 flex-shrink-0" style={{ color }} />
        <span className="leading-relaxed">{member.expertise}</span>
      </div>
    </article>
  );
});

export default function Members() {
  const professors = faculty.filter(f => f.title.startsWith('Prof'));
  const researchers = faculty.filter(f => !f.title.startsWith('Prof'));

  return (
    <section id="members" className="py-24 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            Our People
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-ink)' }}>
              Faculty & Researchers
            </h2>
            <p className="text-base max-w-sm text-right" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
              The brilliant minds behind NEXUS's world-class research.
            </p>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        {/* Professors */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap size={16} style={{ color: 'var(--color-teal)' }} />
            <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-teal)' }}>
              Professors
            </h3>
            <div className="flex-1 h-px ml-2" style={{ background: 'var(--color-surface-alt)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {professors.map(m => <MemberCard key={m.name} member={m} />)}
          </div>
        </div>

        {/* Researchers / Doctors */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookMarked size={16} style={{ color: 'var(--color-gold-dark)' }} />
            <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-gold-dark)' }}>
              Researchers
            </h3>
            <div className="flex-1 h-px ml-2" style={{ background: 'var(--color-surface-alt)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {researchers.map(m => <MemberCard key={m.name} member={m} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
