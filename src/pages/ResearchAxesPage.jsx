import {
  ArrowRight,
  BookOpen,
  Brain,
  Dna,
  Microscope,
  MonitorSmartphone,
  Network,
  Orbit,
  Sparkles,
  Users2,
} from 'lucide-react';
import { labInfo, researchAxes } from '../data/mockData';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/PublicDataProvider.jsx';

const axisIcons = {
  'artificial-intelligence': Brain,
  bioinformatics: Dna,
  'human-computer-interaction': MonitorSmartphone,
  'distributed-systems': Network,
};

const relationshipPrompts = [
  {
    title: 'Axes create a conceptual map',
    description:
      'They explain what the lab studies before visitors dive into specific people, records, or projects.',
  },
  {
    title: 'Teams turn themes into operational units',
    description:
      'Each axis is carried by a team that concentrates expertise, supervision, and execution.',
  },
  {
    title: 'Projects and papers make the axes tangible',
    description:
      'The page should connect scientific direction to output, not leave themes as abstract slogans.',
  },
];

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

function AxisCard({ axis, onNavigate, projects, publications, teams }) {
  const relatedTeams = teams.filter((team) => axis.teamAcronyms.includes(team.acronym));
  const relatedPublications = publications.filter((publication) =>
    axis.teamAcronyms.includes(publication.team?.acronym),
  );
  const relatedProjects = projects.filter((project) => axis.teamAcronyms.includes(project.team?.acronym));
  const leadTeam = relatedTeams[0];
  const Icon = axisIcons[axis.id] ?? Orbit;
  const projectCount = relatedTeams.reduce((sum, team) => sum + team.projectCount, 0);
  const memberCount = relatedTeams.reduce((sum, team) => sum + team.memberCount, 0);

  return (
    <article
      className="rounded-[2rem] border p-7 md:p-8"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.68)',
      }}
    >
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-[1.1rem] border"
              style={{
                borderColor: `${axis.accent}35`,
                background: `${axis.accent}12`,
                color: axis.accent,
              }}
            >
              <Icon size={20} />
            </div>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{
                background: `${axis.accent}14`,
                color: axis.accent,
              }}
            >
              {axis.shortLabel}
            </span>
          </div>

          <h3
            className="mt-5 text-4xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {axis.name}
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-black/66">{axis.summary}</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-black/58">{axis.position}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Lead team', value: leadTeam?.acronym ?? 'N/A' },
              { label: 'Projects', value: `${projectCount}` },
              { label: 'Researchers', value: `${memberCount}` },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border px-4 py-4"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.74)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">{item.label}</p>
                <p
                  className="mt-2 text-2xl font-semibold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Methods</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {axis.methods.map((method) => (
                  <span
                    key={method}
                    className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56"
                    style={{ borderColor: 'rgba(13,17,23,0.08)' }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Outcomes</p>
              <div className="mt-3 space-y-3">
                {axis.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-3">
                    <Sparkles size={15} className="mt-1" style={{ color: axis.accent }} />
                    <p className="text-sm leading-7 text-black/62">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[1.7rem] border p-5 text-white"
            style={{
              borderColor: `${axis.accent}30`,
              background: `linear-gradient(160deg, #10151c, ${axis.accent})`,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/46">Connected team</p>
              <Users2 size={16} className="text-[var(--color-gold)]" />
            </div>

            {relatedTeams.map((team) => (
              <div key={team.id} className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">{team.acronym}</p>
                <p
                  className="mt-2 text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {team.name}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/70">{team.focus}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedProjects
                    .filter((project) => project.team?.slug === team.slug)
                    .map((project) => (
                    <span
                      key={project.slug}
                      className="rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/72"
                    >
                      {project.title}
                    </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {relatedPublications[0] ? (
            <div
              className="rounded-[1.7rem] border p-5"
              style={{
                borderColor: 'rgba(13,17,23,0.08)',
                background: 'rgba(255,253,248,0.82)',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Featured publication</p>
                <BookOpen size={16} className="text-[var(--color-teal)]" />
              </div>
              <p
                className="mt-4 text-2xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {relatedPublications[0].title}
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[var(--color-teal)]">
                {relatedPublications[0].journal} | {relatedPublications[0].year}
              </p>
              <p className="mt-4 text-sm leading-7 text-black/62">{relatedPublications[0].abstract}</p>
            </div>
          ) : null}

          <a
            href="/teams"
            onClick={(event) => onNavigate(event, '/teams')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            View the related research team
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ResearchAxesPage({ onNavigate }) {
  const {
    collections: { projects, publications, teams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Research Axes"
        title="Loading the lab's scientific map."
        description="Axis relationships are being connected to live team and publication records from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The research-axis map could not load."
        description="The conceptual structure is static, but the live team and publication relationships need the public API to respond."
        error={error}
        onRetry={retry}
      />
    );
  }

  const totalProjects = teams.reduce((sum, team) => sum + team.projectCount, 0);
  const totalPublications = teams.reduce((sum, team) => sum + team.publicationCount, 0);
  const totalResearchers = teams.reduce((sum, team) => sum + team.memberCount, 0);

  const platformSignals = [
    {
      label: 'Research teams',
      value: `${teams.length}`,
      detail: 'Structured around distinct scientific identities and leadership.',
    },
    {
      label: 'Active project lines',
      value: `${totalProjects}`,
      detail: 'Applied streams that translate themes into visible lab activity.',
    },
    {
      label: 'Publication footprint',
      value: `${totalPublications}+`,
      detail: 'A cumulative record spanning flagship conferences and journals.',
    },
    {
      label: 'Researchers',
      value: `${totalResearchers}`,
      detail: 'Professors, doctors, and PhD students contributing across the axes.',
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Research Axes
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Four scientific axes organize how the lab thinks, builds, and publishes.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            This page frames the lab&apos;s major research themes as a curated institutional map. It shows
            how conceptual directions connect to teams, active project lines, and publication output so
            visitors can understand the lab before browsing individual records.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/teams"
              onClick={(event) => onNavigate(event, '/teams')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Explore Research Teams
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Atlas Snapshot</p>
              <Microscope size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {platformSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{signal.label}</p>
                  <p
                    className="mt-2 text-3xl font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {signal.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{signal.detail}</p>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Why This Page Matters</p>
            <p
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Research axes should feel like the lab&apos;s intellectual front door, not a loose tag list.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              {labInfo.mission} The page gives that mission structure by translating broad ambition into a
              readable scientific map.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Reading The Map"
            title="Each axis explains a domain of inquiry, a method family, and a visible output stream."
            description="Visitors should be able to move from broad theme to concrete evidence. This section clarifies the logic before the individual axis records begin."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {relationshipPrompts.map((item, index) => (
              <div
                key={item.title}
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
                  <div>
                    <p
                      className="text-2xl font-semibold leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-3 text-base leading-8 text-black/64">{item.description}</p>
                  </div>
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
          <SectionIntro
            eyebrow="Axis Index"
            title="The four axes are distinct, but together they define the lab&apos;s full scientific territory."
            description="The index acts like a quick table of contents: one sentence per axis, with a clean path toward related teams and publication browsing."
            onNavigate={onNavigate}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {researchAxes.map((axis) => {
              const Icon = axisIcons[axis.id] ?? Orbit;

              return (
                <div
                  key={axis.id}
                  className="rounded-[1.5rem] border p-5"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem]"
                      style={{ background: `${axis.accent}30`, color: '#fff' }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                      {axis.shortLabel}
                    </span>
                  </div>
                  <p
                    className="mt-4 text-2xl font-semibold leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {axis.name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/68">{axis.summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Axis Records"
          title="A dedicated read on each scientific theme."
          description="These records connect concept, operating team, flagship project lines, and publication evidence in one view."
          action={{ href: '/about', label: 'Return to about the lab' }}
          onNavigate={onNavigate}
        />

        <div className="space-y-5">
          {researchAxes.map((axis) => (
            <AxisCard
              key={axis.id}
              axis={axis}
              onNavigate={onNavigate}
              projects={projects}
              publications={publications}
              teams={teams}
            />
          ))}
        </div>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Continue Exploring</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The axes are the conceptual layer. Teams and publications provide the operational and evidential layers.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              After orienting visitors around the themes, the next best paths are into the team directory,
              publication library, and institutional narrative that explain how the lab sustains those themes.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Users2,
                label: 'Research Teams',
                value: 'See leadership, focus areas, and member composition for each team.',
                href: '/teams',
              },
              {
                icon: BookOpen,
                label: 'Publications',
                value: 'Trace each scientific axis into concrete papers and scholarly output.',
                href: '/publications',
              },
              {
                icon: Microscope,
                label: 'About The Lab',
                value: 'Return to the broader institutional mission, values, and history.',
                href: '/about',
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
