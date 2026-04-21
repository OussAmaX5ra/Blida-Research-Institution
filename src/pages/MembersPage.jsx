import { useDeferredValue, useState } from 'react';
import { ArrowRight, BookOpen, FlaskConical, Layers3, Search, Sparkles, Users2, X } from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

const roleOrder = ['Professor', 'Doctor', 'PhD Student'];
const roleGroupLabels = {
  Professor: 'Professors',
  Doctor: 'Doctors',
  'PhD Student': 'PhD Students',
};
const roleAccents = {
  Professor: '#1a5c6b',
  Doctor: '#a4542a',
  'PhD Student': '#2d6a4f',
};

const notes = [
  'Role labels stay explicit so the academic structure is immediately legible.',
  'Each profile foregrounds team affiliation and research themes before secondary detail.',
  'Filters should feel like research tools, not ecommerce controls.',
];

function SectionIntro({ eyebrow, title, description, action, onNavigate }) {
  return (
    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-teal)]">
          {eyebrow}
        </p>
        <h2 className="page-section-title font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
      </div>
      <div className="max-w-xl">
        <p className="text-base leading-8 text-[var(--color-muted)]">{description}</p>
        {action ? (
          <a
            href={action.href}
            onClick={(event) => onNavigate(event, action.href)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            {action.label}
            <ArrowRight size={15} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="rounded-[1.4rem] border border-black/8 bg-white/72 px-4 py-4">
      <span className="text-[11px] uppercase tracking-[0.24em] text-black/42">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full bg-transparent text-base outline-none"
        style={{ color: 'var(--color-ink)' }}
      >
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: 'var(--color-ink)' }}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberCard({ member, onNavigate }) {
  return (
    <article className="rounded-[1.8rem] border p-6" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.74)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${member.team.color}, var(--color-ink))` }}>
            {member.avatar}
          </div>
          <div>
            <p className="text-2xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {member.name}
            </p>
            <p className="mt-1 text-sm text-black/54">{member.title}</p>
          </div>
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ background: `${member.team.color}14`, color: member.team.color }}>
          {member.team.acronym}
        </span>
      </div>

      <div className="mt-6 rounded-[1.3rem] border border-black/8 bg-[rgba(255,253,248,0.72)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Affiliation</p>
          {member.isLeader ? (
            <span className="rounded-full bg-[rgba(26,92,107,0.1)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--color-teal)]">
              Team leader
            </span>
          ) : null}
        </div>
        <a href={`/teams/${member.team.slug}`} onClick={(event) => onNavigate(event, `/teams/${member.team.slug}`)} className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-black/82">
          {member.team.name}
          <ArrowRight size={15} style={{ color: member.team.color }} />
        </a>
        <p className="mt-3 text-sm leading-7 text-black/60">{member.axis?.name ?? 'Research Axis'}</p>
      </div>

      <p className="mt-5 text-base leading-8 text-black/66">{member.expertise}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {member.themes.map((theme) => (
          <span key={theme} className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56" style={{ borderColor: 'rgba(13,17,23,0.08)' }}>
            {theme}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.2rem] border px-4 py-4" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.66)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Team projects</p>
          <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{member.projectCount}</p>
        </div>
        <div className="rounded-[1.2rem] border px-4 py-4" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.66)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Linked papers</p>
          <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{member.publicationCount}</p>
        </div>
      </div>
    </article>
  );
}

function GroupViewToggle({ activeMode, onChange }) {
  const options = [
    { key: 'role', label: 'By role', icon: Users2 },
    { key: 'team', label: 'By team', icon: Layers3 },
  ];

  return (
    <div
      className="inline-flex flex-wrap gap-2 rounded-full border p-2"
      style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          style={
            activeMode === option.key
              ? { background: '#0d1117', color: '#f7f5f0' }
              : { background: 'transparent', color: 'rgba(13,17,23,0.76)' }
          }
        >
          <option.icon size={15} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

function GroupPanel({ group, mode, onNavigate }) {
  const accent = mode === 'team' ? group.team.color : group.accent;

  return (
    <article
      className="rounded-[1.8rem] border p-6"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.74)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-2xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {group.label}
          </p>
          <p className="mt-2 text-sm leading-7 text-black/60">
            {mode === 'team'
              ? `${group.team.leader} leads this unit inside the public roster.`
              : group.description}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ background: `${accent}14`, color: accent }}
        >
          {group.members.length}
        </span>
      </div>

      {mode === 'team' ? (
        <a
          href={`/teams/${group.team.slug}`}
          onClick={(event) => onNavigate(event, `/teams/${group.team.slug}`)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: accent }}
        >
          Open team details
          <ArrowRight size={15} />
        </a>
      ) : null}

      <div className="mt-6 space-y-3">
        {group.members.map((member) => (
          <div
            key={member.slug}
            className="rounded-[1.25rem] border px-4 py-4"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,253,248,0.82)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold leading-tight text-black/84">{member.name}</p>
                <p className="mt-1 text-sm text-black/56">{member.title}</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: `${member.team.color}14`, color: member.team.color }}
              >
                {member.team.acronym}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/46">
              <span>{member.role}</span>
              <span>{member.team.name}</span>
              {member.isLeader ? <span style={{ color: accent }}>Team leader</span> : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function MembersPage({ onNavigate }) {
  const {
    collections: { members, teams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [groupMode, setGroupMode] = useState('role');
  const deferredQuery = useDeferredValue(query);

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Members Directory"
        title="Loading the public researcher directory."
        description="Member profiles are being fetched from the API with live role, team, and research-theme context."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The public member directory could not load."
        description="The page shell is available, but the live researcher records need the public API before they can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const teamOptions = teams.map((team) => ({ label: team.name, value: team.slug }));
  const themeOptions = [...new Set(members.flatMap((member) => member.themes ?? []))].toSorted();
  const snapshot = [
    { label: 'Total members', value: `${members.length}` },
    { label: 'Professors', value: `${members.filter((member) => member.role === 'Professor').length}` },
    { label: 'Doctors', value: `${members.filter((member) => member.role === 'Doctor').length}` },
    { label: 'PhD students', value: `${members.filter((member) => member.role === 'PhD Student').length}` },
  ];

  const filteredMembers = members.filter((member) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery = normalizedQuery ? member.name.toLowerCase().includes(normalizedQuery) : true;
    const matchesRole = selectedRole ? member.role === selectedRole : true;
    const matchesTeam = selectedTeam ? member.team.slug === selectedTeam : true;
    const matchesTheme = selectedTheme ? member.themes.includes(selectedTheme) : true;
    return matchesQuery && matchesRole && matchesTeam && matchesTheme;
  });

  const filteredCounts = roleOrder.map((role) => ({
    role,
    count: filteredMembers.filter((member) => member.role === role).length,
  }));
  const groupedByRole = roleOrder
    .map((role) => ({
      key: role,
      label: roleGroupLabels[role],
      accent: roleAccents[role],
      description:
        role === 'Professor'
          ? 'Supervision, leadership, and senior scientific direction stay visible as a distinct layer.'
          : role === 'Doctor'
            ? 'Doctoral researchers sit between institutional leadership and active dissertation work.'
            : 'PhD scholars remain clearly grouped as the lab’s active research pipeline.',
      members: filteredMembers.filter((member) => member.role === role),
    }))
    .filter((group) => group.members.length);
  const groupedByTeam = teams
    .map((team) => ({
      key: team.slug,
      label: team.name,
      team,
      members: filteredMembers.filter((member) => member.team.slug === team.slug),
    }))
    .filter((group) => group.members.length);
  const activeGroups = groupMode === 'role' ? groupedByRole : groupedByTeam;

  const activeFilters = [
    query.trim() ? `Name: ${query}` : null,
    selectedRole ? `Role: ${selectedRole}` : null,
    selectedTeam ? `Team: ${teamOptions.find((team) => team.value === selectedTeam)?.label ?? selectedTeam}` : null,
    selectedTheme ? `Theme: ${selectedTheme}` : null,
  ].filter(Boolean);

  function resetFilters() {
    setQuery('');
    setSelectedRole('');
    setSelectedTeam('');
    setSelectedTheme('');
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">Members Directory</p>
          <h1 className="page-hero-title max-w-5xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            A searchable public roster of the lab&apos;s researchers, supervisors, and PhD scholars.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            This page gathers every visible member record into one institutional directory. It helps visitors search the lab by name while keeping role, team affiliation, and scientific themes attached to each person.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/teams" onClick={(event) => onNavigate(event, '/teams')} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#0d1117', color: '#f7f5f0' }}>
              Browse Research Teams
              <ArrowRight size={15} />
            </a>
            <a href="/research-axes" onClick={(event) => onNavigate(event, '/research-axes')} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold" style={{ borderColor: 'rgba(13,17,23,0.12)', background: 'rgba(255,255,255,0.58)' }}>
              Open Research Axes
            </a>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border p-7 text-white" style={{ borderColor: 'rgba(201,168,76,0.22)', background: 'linear-gradient(160deg, #11161d, #1b2430 58%, #20424b)', boxShadow: '0 28px 60px rgba(13,17,23,0.18)' }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Roster Snapshot</p>
              <FlaskConical size={16} className="text-[var(--color-gold)]" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {snapshot.map((stat) => (
                <div key={stat.label} className="rounded-[1.4rem] border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border p-7" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Institutional Read</p>
            <p className="mt-4 text-3xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Member cards should read like academic records with context, not like social profile tiles.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The directory stays aligned with the rest of the site by foregrounding affiliation, themes, and research signals over decorative profile treatment.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border p-7" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.62)' }}>
          <SectionIntro
            eyebrow="Reading The Directory"
            title="The roster should explain the lab&apos;s human structure before visitors compare profiles."
            description="These notes frame why the page privileges role clarity, team alignment, and research context."
            onNavigate={onNavigate}
          />
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div key={note} className="rounded-[1.5rem] border p-5" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}>
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-ink))' }}>
                    0{index + 1}
                  </span>
                  <p className="text-base leading-8 text-black/64">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border p-7 text-white" style={{ borderColor: 'rgba(201,168,76,0.2)', background: 'linear-gradient(155deg, #11161d, #15202d 60%, #1e454d)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/44">Research Tooling</p>
            <Layers3 size={16} className="text-[var(--color-gold)]" />
          </div>
          <p className="mt-4 text-4xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Narrow the directory by name, role, team, or scientific theme.
          </p>
          <p className="mt-4 text-base leading-8 text-white/62">
            The controls keep the page readable while preserving the scholarly tone of the public atlas.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Search by name</span>
              <div className="mt-3 flex items-center gap-3">
                <Search size={16} className="text-[var(--color-gold)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the roster"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
                />
              </div>
            </label>

            <SelectField label="Role" value={selectedRole} options={roleOrder.map((role) => ({ label: role, value: role }))} onChange={setSelectedRole} />
            <SelectField label="Team" value={selectedTeam} options={teamOptions} onChange={setSelectedTeam} />
            <SelectField label="Theme" value={selectedTheme} options={themeOptions.map((theme) => ({ label: theme, value: theme }))} onChange={setSelectedTheme} />

            <div className="rounded-[1.4rem] border p-4" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Visible members</p>
              <p className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{filteredMembers.length}</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                {deferredQuery === query ? 'Profiles currently visible after the active controls.' : 'Refining the roster view...'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {filteredCounts.map((item) => (
              <div key={item.role} className="rounded-[1.3rem] border p-4" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">{item.role}</p>
                <p className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.count}</p>
              </div>
            ))}
          </div>

          {activeFilters.length ? (
            <button type="button" onClick={resetFilters} className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-white" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <X size={14} />
              Reset filters
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Grouped Explorer"
          title="Read the researcher directory as academic structure, not just a flat search result."
          description="The same filtered roster can be regrouped by role or by team, making hierarchy and lab composition easier to scan."
          action={{ href: '/teams', label: 'Compare research teams' }}
          onNavigate={onNavigate}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm leading-7 text-black/60">
              {activeFilters.length
                ? 'The grouped explorer reflects the active filters, so the visible structure updates as the directory narrows.'
                : 'With no filters applied, this grouped explorer shows the lab’s full public roster by role or by team.'}
            </p>
          </div>
          <GroupViewToggle activeMode={groupMode} onChange={setGroupMode} />
        </div>

        {activeGroups.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {activeGroups.map((group) => (
              <GroupPanel key={group.key} group={group} mode={groupMode} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-[2rem] border p-8 text-center md:p-10"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,255,255,0.7)',
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Grouped Results</p>
            <h3
              className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No grouping can be shown until at least one member matches the active filters.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Reset one or more filters to restore the grouped roster by role or by team.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Directory Results"
          title="Detailed profile cards across the lab&apos;s visible public membership."
          description="The grouped explorer gives the structure; the card view keeps the richer per-member context for scanning expertise, affiliation, and output signals."
          onNavigate={onNavigate}
        />

        {activeFilters.length ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span key={filter} className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/62" style={{ borderColor: 'rgba(13,17,23,0.08)' }}>
                {filter}
              </span>
            ))}
          </div>
        ) : null}

        {filteredMembers.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredMembers.map((member) => (
              <MemberCard key={member.slug} member={member} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border p-8 text-center md:p-10" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Matching Members</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              No member record matches the current filter combination.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Try broadening the search query or clearing one of the filters to return to the full public roster.
            </p>
            <button type="button" onClick={resetFilters} className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#0d1117', color: '#f7f5f0' }}>
              Reset directory filters
              <X size={14} />
            </button>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border p-8 md:p-10" style={{ borderColor: 'rgba(201,168,76,0.24)', background: 'linear-gradient(140deg, #10151c, #17212c 62%, #1e4a50)', color: 'white' }}>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Continue Through The Atlas</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              The people layer now connects cleanly to teams, themes, and publication evidence.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              With the member directory in place, the public experience can move next into project and publication records without losing the institutional thread that ties those records to actual researchers.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Layers3, label: 'Research Teams', value: 'Return to the unit-level view that groups members by leadership and mission.', href: '/teams' },
              { icon: BookOpen, label: 'Publications', value: 'Follow member expertise into the scholarly output layer of the platform.', href: '/publications' },
              { icon: Sparkles, label: 'Research Axes', value: 'Reconnect the roster to the four conceptual directions shaping the lab.', href: '/research-axes' },
            ].map((item) => (
              <a key={item.label} href={item.href} onClick={(event) => onNavigate(event, item.href)} className="rounded-[1.5rem] border px-5 py-5 transition-transform duration-200 hover:-translate-y-[1px]" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(201,168,76,0.14)' }}>
                    <item.icon size={16} className="text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/46">{item.label}</p>
                    <p className="mt-2 text-base leading-8 text-white/76">{item.value}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
