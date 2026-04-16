import { useDeferredValue, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarRange,
  FlaskConical,
  Layers3,
  Search,
  Sparkles,
  Workflow,
  X,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

const statusOrder = ['Ongoing', 'Planned', 'Completed'];

function SectionIntro({ eyebrow, title, description, action, onNavigate }) {
  return (
    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-teal)]">
          {eyebrow}
        </p>
        <h2
          className="page-section-title font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
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

function SelectField({ label, value, options, onChange, dark = false }) {
  return (
    <label
      className="rounded-[1.4rem] px-4 py-4"
      style={
        dark
          ? { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }
          : { border: '1px solid rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }
      }
    >
      <span className={`text-[11px] uppercase tracking-[0.24em] ${dark ? 'text-white/42' : 'text-black/42'}`}>
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 w-full bg-transparent text-base outline-none ${dark ? 'text-white' : 'text-black/84'}`}
      >
        <option value="">{label === 'Year' ? 'All years' : `All ${label.toLowerCase()}s`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProjectCard({ project, onNavigate }) {
  return (
    <article
      className="rounded-[1.8rem] border p-6"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.74)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: `${project.teamColor}14`, color: project.teamColor }}
          >
            {project.teamTag}
          </span>
          <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/56" style={{ borderColor: 'rgba(13,17,23,0.08)' }}>
            {project.status}
          </span>
          {project.phdLinked ? (
            <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--color-rust)]" style={{ borderColor: 'rgba(164,84,42,0.18)', background: 'rgba(164,84,42,0.08)' }}>
              PhD-linked
            </span>
          ) : null}
        </div>
        <span className="text-sm uppercase tracking-[0.2em] text-black/42">{project.year}</span>
      </div>

      <h3
        className="mt-5 text-3xl font-semibold leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {project.title}
      </h3>
      <p className="mt-4 text-base leading-8 text-black/66">{project.summary}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.2rem] border px-4 py-4" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Lead</p>
          <p className="mt-2 text-base font-medium text-black/82">{project.lead}</p>
        </div>
        <div className="rounded-[1.2rem] border px-4 py-4" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Team</p>
          <a
            href={`/teams/${project.teamSlug}`}
            onClick={(event) => onNavigate(event, `/teams/${project.teamSlug}`)}
            className="mt-2 inline-flex items-center gap-2 text-base font-medium text-black/82"
          >
            {project.teamName}
            <ArrowRight size={14} style={{ color: project.teamColor }} />
          </a>
        </div>
        <div className="rounded-[1.2rem] border px-4 py-4" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Axis</p>
          <p className="mt-2 text-base font-medium text-black/82">{project.axisName}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Research themes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56"
              style={{ borderColor: 'rgba(13,17,23,0.08)' }}
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.4rem] border p-5" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.66)' }}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Current milestone</p>
            <Workflow size={16} style={{ color: project.teamColor }} />
          </div>
          <p className="mt-3 text-sm leading-7 text-black/64">{project.milestone}</p>
        </div>

        <div className="rounded-[1.4rem] border p-5" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.66)' }}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Related publication signal</p>
            <BookOpen size={16} className="text-[var(--color-teal)]" />
          </div>
          {project.relatedPublication ? (
            <>
              <p className="mt-3 text-lg font-semibold leading-tight text-black/84" style={{ fontFamily: 'var(--font-display)' }}>
                {project.relatedPublication.title}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--color-teal)]">
                {project.relatedPublication.journal} | {project.relatedPublication.year}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-7 text-black/58">
              Publication evidence for this project line will appear as the library expands.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage({ onNavigate }) {
  const {
    collections: { projects, publications, teams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [query, setQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const deferredQuery = useDeferredValue(query);

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Projects"
        title="Loading the public project catalogue."
        description="Live project records, statuses, and related publication signals are being fetched from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The public project catalogue could not load."
        description="The page shell is ready, but the live project records need the API before they can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const teamOptions = teams.map((team) => ({ label: team.name, value: team.slug }));
  const themeOptions = [...new Set(projects.flatMap((project) => project.themes ?? []))].toSorted();
  const yearOptions = [...new Set(projects.map((project) => project.year))].toSorted((left, right) => right - left);
  const projectRecords = projects
    .map((project) => {
      const relatedPublications = publications.filter(
        (publication) => publication.team?.acronym === project.team?.acronym,
      );

      return {
        ...project,
        teamName: project.team?.name ?? 'Research Team',
        teamColor: project.team?.color ?? '#1a5c6b',
        axisName: project.axis?.name ?? 'Research Axis',
        relatedPublication: relatedPublications[0] ?? null,
      };
    })
    .toSorted((left, right) => {
      const yearDiff = right.year - left.year;
      if (yearDiff !== 0) return yearDiff;
      const statusDiff = statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status);
      if (statusDiff !== 0) return statusDiff;
      return left.title.localeCompare(right.title);
    });
  const snapshot = [
    { label: 'Visible projects', value: `${projectRecords.length}`, detail: 'Current and completed research lines visible in the public catalogue.' },
    { label: 'Ongoing', value: `${projectRecords.filter((project) => project.status === 'Ongoing').length}`, detail: 'Actively advancing within the lab\'s present research cycle.' },
    { label: 'PhD-linked', value: `${projectRecords.filter((project) => project.phdLinked).length}`, detail: 'Project lines already tied to doctoral progress and future timeline work.' },
    { label: 'Axes covered', value: `${new Set(projectRecords.map((project) => project.axisId)).size}`, detail: 'The project layer spans the lab\'s full scientific map.' },
  ];

  const notes = [
    'Projects should feel like evidence of active scientific work, not generic portfolio tiles.',
    'Status, team alignment, year, and theme need to remain visible even when visitors are scanning quickly.',
    'PhD-linked initiatives should already signal that they connect to the future progress tracker layer.',
  ];

  const filteredProjects = projectRecords.filter((project) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? `${project.title} ${project.summary} ${project.lead}`.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesTeam = selectedTeam ? project.teamSlug === selectedTeam : true;
    const matchesStatus = selectedStatus ? project.status === selectedStatus : true;
    const matchesTheme = selectedTheme ? project.themes.includes(selectedTheme) : true;
    const matchesYear = selectedYear ? String(project.year) === selectedYear : true;

    return matchesQuery && matchesTeam && matchesStatus && matchesTheme && matchesYear;
  });

  const filteredCounts = statusOrder.map((status) => ({
    status,
    count: filteredProjects.filter((project) => project.status === status).length,
  }));

  const activeFilters = [
    query.trim() ? `Query: ${query}` : null,
    selectedTeam ? `Team: ${teamOptions.find((team) => team.value === selectedTeam)?.label ?? selectedTeam}` : null,
    selectedStatus ? `Status: ${selectedStatus}` : null,
    selectedTheme ? `Theme: ${selectedTheme}` : null,
    selectedYear ? `Year: ${selectedYear}` : null,
  ].filter(Boolean);

  function resetFilters() {
    setQuery('');
    setSelectedTeam('');
    setSelectedStatus('');
    setSelectedTheme('');
    setSelectedYear('');
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Projects
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A public catalogue of the lab&apos;s active and completed scientific project lines.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            The projects page shows how research themes become operational work. It gives visitors a way
            to browse initiatives by team, status, year, and theme while keeping leadership, milestones,
            and publication evidence in view.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/teams"
              onClick={(event) => onNavigate(event, '/teams')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Compare Research Teams
              <ArrowRight size={15} />
            </a>
            <a
              href="/publications"
              onClick={(event) => onNavigate(event, '/publications')}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
              style={{
                borderColor: 'rgba(13,17,23,0.12)',
                background: 'rgba(255,255,255,0.58)',
              }}
            >
              Browse Publications
            </a>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[2rem] border p-7 text-white"
            style={{
              borderColor: 'rgba(201,168,76,0.22)',
              background: 'linear-gradient(160deg, #11161d, #1b2430 58%, #20424b)',
              boxShadow: '0 28px 60px rgba(13,17,23,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Project Snapshot</p>
              <FlaskConical size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {snapshot.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{item.label}</p>
                  <p
                    className="mt-2 text-3xl font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-7"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,253,248,0.78)',
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Institutional Read</p>
            <p
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Projects should reveal how the lab turns scientific direction into visible, time-bound work.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              This page sits between teams and publications, making ongoing research activity legible before
              visitors drill into detail records.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Reading The Project Layer"
            title="The catalogue should explain why these records matter before asking visitors to compare them."
            description="These notes define the tone of the page and keep the project list from collapsing into a loose grid of titles."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {notes.map((note, index) => (
              <div
                key={note}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-ink))' }}
                  >
                    0{index + 1}
                  </span>
                  <p className="text-base leading-8 text-black/64">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[2rem] border p-7 text-white"
          style={{
            borderColor: 'rgba(201,168,76,0.2)',
            background: 'linear-gradient(155deg, #11161d, #15202d 60%, #1e454d)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/44">Research Tooling</p>
            <Layers3 size={16} className="text-[var(--color-gold)]" />
          </div>
          <p className="mt-4 text-4xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Filter the project layer by team, status, theme, year, or a direct text query.
          </p>
          <p className="mt-4 text-base leading-8 text-white/62">
            The controls behave like a research index, helping visitors move between active lines, completed work, and upcoming initiatives.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Search projects</span>
              <div className="mt-3 flex items-center gap-3">
                <Search size={16} className="text-[var(--color-gold)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, summary, or lead"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
                />
              </div>
            </label>

            <SelectField label="Team" value={selectedTeam} options={teamOptions} onChange={setSelectedTeam} dark />
            <SelectField
              label="Status"
              value={selectedStatus}
              options={statusOrder.map((status) => ({ label: status, value: status }))}
              onChange={setSelectedStatus}
              dark
            />
            <SelectField
              label="Theme"
              value={selectedTheme}
              options={themeOptions.map((theme) => ({ label: theme, value: theme }))}
              onChange={setSelectedTheme}
              dark
            />
            <SelectField
              label="Year"
              value={selectedYear}
              options={yearOptions.map((year) => ({ label: `${year}`, value: `${year}` }))}
              onChange={setSelectedYear}
              dark
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {filteredCounts.map((item) => (
              <div
                key={item.status}
                className="rounded-[1.3rem] border p-4"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">{item.status}</p>
                <p
                  className="mt-2 text-3xl font-semibold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.count}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Visible projects</p>
              <CalendarRange size={16} className="text-[var(--color-gold)]" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {filteredProjects.length}
            </p>
            <p className="mt-2 text-sm leading-7 text-white/62">
              {deferredQuery === query ? 'Projects currently visible after the active controls.' : 'Refining the catalogue view...'}
            </p>
          </div>

          {activeFilters.length ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={14} />
              Reset filters
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Project Catalogue"
          title="Current and past scientific work organized as an institutional record."
          description="Each card connects lead, team, milestone, themes, and publication evidence so project browsing feels grounded rather than generic."
          action={{ href: '/members', label: 'Browse members' }}
          onNavigate={onNavigate}
        />

        {activeFilters.length ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/62"
                style={{ borderColor: 'rgba(13,17,23,0.08)' }}
              >
                {filter}
              </span>
            ))}
          </div>
        ) : null}

        {filteredProjects.length ? (
          <div className="grid gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onNavigate={onNavigate} />
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Matching Projects</p>
            <h3
              className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No project record matches the current filter combination.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Try widening the year, theme, or status filters to return to the broader project catalogue.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Reset project filters
              <X size={14} />
            </button>
          </div>
        )}
      </section>

      <section
        className="rounded-[2rem] border p-8 md:p-10"
        style={{
          borderColor: 'rgba(201,168,76,0.24)',
          background: 'linear-gradient(140deg, #10151c, #17212c 62%, #1e4a50)',
          color: 'white',
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Continue Through The Atlas</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The project layer now connects strategy, teams, and output into one public narrative.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              From here the platform can move naturally into publication detail pages and richer project records without losing the institutional frame established across the public site.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: BriefcaseBusiness,
                label: 'Research Teams',
                value: 'Return to the team layer to compare which units carry each project line.',
                href: '/teams',
              },
              {
                icon: BookOpen,
                label: 'Publications',
                value: 'Follow project momentum into the library of papers and conference output.',
                href: '/publications',
              },
              {
                icon: Sparkles,
                label: 'Members Directory',
                value: 'Reconnect project leadership to the people driving the lab’s current work.',
                href: '/members',
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => onNavigate(event, item.href)}
                className="rounded-[1.5rem] border px-5 py-5 transition-transform duration-200 hover:-translate-y-[1px]"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: 'rgba(201,168,76,0.14)' }}
                  >
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
