import { useState, memo, useMemo } from 'react';
import { Users, ChevronDown, ChevronUp, Beaker, BookOpen } from 'lucide-react';
import { usePublicData } from '../providers/usePublicData';

const roleColors = {
  Professor: { bg: 'rgba(201,168,76,0.12)', text: '#8a6e2f', border: 'rgba(201,168,76,0.3)' },
  Doctor: { bg: 'rgba(26,92,107,0.12)', text: '#1a5c6b', border: 'rgba(26,92,107,0.3)' },
  'PhD Student': { bg: 'rgba(107,114,128,0.1)', text: '#4b5563', border: 'rgba(107,114,128,0.25)' },
};

const Avatar = memo(function Avatar({ initials, color }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
         style={{ background: color }}>
      {initials}
    </div>
  );
});

const TeamCard = memo(function TeamCard({ team, members }) {
  const [expanded, setExpanded] = useState(false);

  const teamMembers = useMemo(
    () => members.filter(m => m.team?.slug === team.slug),
    [members, team.slug],
  );

  return (
    <article
      className="rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      {/* Top color accent */}
      <div className="h-1" style={{ background: team.color }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: `${team.color}18`, color: team.color }}>
              {team.acronym}
            </span>
            <h3 className="font-display text-lg font-semibold leading-snug" style={{ color: 'var(--color-ink)' }}>
              {team.name}
            </h3>
          </div>
        </div>

        {/* Leader */}
        <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--color-muted)' }}>
          <Users size={13} />
          <span>Led by <strong style={{ color: 'var(--color-ink)' }}>{team.leader}</strong></span>
        </div>

        {/* Focus */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
          {team.focus}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 pb-4"
             style={{ borderBottom: '1px solid var(--color-surface-alt)' }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Users size={12} />
            <span>{team.memberCount ?? teamMembers.length} members</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <BookOpen size={12} />
            <span>{team.publicationCount ?? 0} publications</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Beaker size={12} />
            <span>{team.projectCount ?? 0} projects</span>
          </div>
        </div>

        {/* Active themes */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
            Research Themes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(team.themes ?? []).map(t => (
              <span key={t} className="px-2 py-0.5 text-xs rounded-full"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-alt)', color: 'var(--color-ink)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Expand/collapse members */}
        {teamMembers.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold w-full justify-center py-2 rounded transition-all duration-200 hover:opacity-80"
              style={{ background: `${team.color}12`, color: team.color }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Hide Members' : 'See All Members'}
            </button>

            {/* Members list */}
            {expanded && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {teamMembers.map(m => {
                  const colors = roleColors[m.role] || roleColors['PhD Student'];
                  return (
                    <div key={m.slug || m.name} className="flex items-center gap-3 p-2 rounded"
                         style={{ background: 'var(--color-surface)' }}>
                      <Avatar initials={m.avatar} color={team.color} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{m.name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        {m.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
});

export default function Teams() {
  const { collections } = usePublicData();
  const teams = collections?.teams ?? [];
  const members = collections?.members ?? [];

  return (
    <section id="teams" className="py-24 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            Our Divisions
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-ink)' }}>
              Research Teams
            </h2>
            <p className="text-base max-w-md text-right" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
              Four specialized divisions, each pushing the boundaries of their respective scientific domains.
            </p>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        {/* Team grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
          {teams.map(team => (
            <TeamCard key={team.id || team.slug} team={team} members={members} />
          ))}
        </div>
      </div>
    </section>
  );
}
