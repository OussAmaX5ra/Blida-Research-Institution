import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  FlaskConical,
  Microscope,
  Users2,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { fallbackLabInfo } from '../lib/site-context.js';
import { usePublicData } from '../providers/usePublicData.js';

const institutionalValues = [
  {
    title: 'Scientific Rigor',
    description:
      'Research communication should be precise, credible, and grounded in real output rather than generic claims.',
  },
  {
    title: 'Interdisciplinary Collaboration',
    description:
      'The lab brings together intelligent systems, bioinformatics, human-computer interaction, and distributed computing under one institutional umbrella.',
  },
  {
    title: 'Public Visibility',
    description:
      'The public website should make it easy for students, partners, and institutional stakeholders to understand who the lab is and what it produces.',
  },
];

const institutionalTimeline = [
  {
    year: '2009',
    title: 'Laboratory Foundation',
    description:
      'The lab was established as a structured university research environment with a focus on scientific credibility and long-term institutional presence.',
  },
  {
    year: '2015',
    title: 'Interdisciplinary Expansion',
    description:
      'Research activity broadened into multiple technical domains, creating clearer team structure and a richer publication profile.',
  },
  {
    year: 'Today',
    title: 'Modern Public Platform',
    description:
      'The current platform direction presents the lab as a serious, modern, and discoverable institutional research body.',
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

export default function AboutPage({ onNavigate }) {
  const {
    collections: { publications, teams },
    error,
    hasLoaded,
    isLoading,
    retry,
    siteContext,
  } = usePublicData();

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="About"
        title="Loading the institutional profile."
        description="The about page is pulling its live team and publication signals from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The institutional profile could not load."
        description="The page copy is available, but the public-facing output and team signals need a successful API response."
        error={error}
        onRetry={retry}
      />
    );
  }

  const labInfo = siteContext.labInfo ?? fallbackLabInfo;
  const highlightedOutputs = publications.slice(0, 2);

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            About The Lab
          </p>
          <h1
            className="page-hero-title max-w-4xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A modern institutional research lab built on credibility, clarity, and scientific depth.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-black/66">
            The About page explains the lab beyond its output. It gives visitors the institutional context,
            mission, values, and scientific structure needed to understand why the lab exists and how its
            research culture is organized.
          </p>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[2rem] border p-7 text-white"
            style={{
              borderColor: 'rgba(201,168,76,0.22)',
              background: 'linear-gradient(160deg, #11161d, #1b2430 68%, #20424b)',
              boxShadow: '0 28px 60px rgba(13,17,23,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Institutional Snapshot</p>
              <FlaskConical size={16} className="text-[var(--color-gold)]" />
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Founded</p>
                <p
                  className="mt-2 text-4xl font-semibold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {labInfo.founded}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {labInfo.stats.slice(0, 2).map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.4rem] border p-4"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-7"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,253,248,0.78)',
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Positioning</p>
            <p
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The lab should feel established before a visitor reaches the first database record.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              This page sets the institutional tone and explains the lab's place within a credible
              research ecosystem.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Mission And Vision"
            title="The lab exists to make serious research visible, legible, and collaborative."
            description="The About page carries the institutional narrative: why the lab exists, what kind of scientific contribution it values, and what it hopes to become."
            onNavigate={onNavigate}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.7rem] border border-black/8 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Mission</p>
                <BadgeCheck size={16} className="text-[var(--color-teal)]" />
              </div>
              <p
                className="mt-4 text-3xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {labInfo.mission}
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-black/8 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Vision</p>
                <Microscope size={16} className="text-[var(--color-gold-dark)]" />
              </div>
              <p
                className="mt-4 text-3xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {labInfo.vision}
              </p>
            </article>
          </div>
        </div>

        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Values"
            title="A public-facing lab platform should reflect how the lab works internally."
            description="Values here are not filler statements. They define the tone of the public institution and the expectations for how scientific work is presented."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {institutionalValues.map((value) => (
              <div
                key={value.title}
                className="rounded-[1.5rem] border border-black/8 p-5"
                style={{ background: 'rgba(255,255,255,0.72)' }}
              >
                <p
                  className="text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {value.title}
                </p>
                <p className="mt-3 text-base leading-8 text-black/64">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="History And Context"
            title="Institutional maturity should be visible in the narrative, not only in the statistics."
            description="The page should situate the lab across time: how it began, how it expanded, and how it presents itself now."
            onNavigate={onNavigate}
          />

          <div className="space-y-6">
            {institutionalTimeline.map((milestone, index) => (
              <div key={milestone.year} className="grid gap-4 md:grid-cols-[110px_1fr]">
                <div className="text-sm uppercase tracking-[0.24em] text-black/42">{milestone.year}</div>
                <div className={`${index < institutionalTimeline.length - 1 ? 'border-b border-black/8 pb-6' : ''}`}>
                  <p
                    className="text-2xl font-semibold leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {milestone.title}
                  </p>
                  <p className="mt-3 text-base leading-8 text-black/64">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[2rem] border p-7"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,255,255,0.62)',
            }}
          >
            <SectionIntro
              eyebrow="Research Structure"
              title="The lab's scientific identity is expressed through its axes and teams."
              description="Rather than presenting disconnected content domains, the platform should show how axes, teams, and outputs reinforce one another."
              action={{ href: '/research-axes', label: 'Open research axes page' }}
              onNavigate={onNavigate}
            />

            <div className="space-y-4">
              {labInfo.axes.map((axis, index) => (
                <div
                  key={axis}
                  className="flex items-start gap-4 rounded-[1.4rem] border border-black/8 px-5 py-5"
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-ink))' }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-black/82">{axis}</p>
                    <p className="mt-2 text-sm leading-7 text-black/60">
                      Supported by active teams, ongoing projects, and a visible publication stream.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-7 text-white"
            style={{
              borderColor: 'rgba(201,168,76,0.2)',
              background: 'linear-gradient(160deg, #11161d, #15202d 65%, #1e454d)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Connected Output</p>
              <BookOpen size={16} className="text-[var(--color-gold)]" />
            </div>
            <div className="mt-5 space-y-4">
              {highlightedOutputs.map((publication) => (
                <div
                  key={publication.id}
                  className="rounded-[1.4rem] border px-5 py-5"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                    {publication.journal} | {publication.year}
                  </p>
                  <p
                    className="mt-3 text-2xl font-semibold leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {publication.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">What Comes Next</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The About page should send visitors deeper into research, teams, and publications.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              This page establishes identity, but it should also act as a launch point into the rest of
              the public experience so visitors can continue into the lab's actual scientific content.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Users2,
                label: 'Research Teams',
                value: `${teams.length} structured teams with distinct focus areas and leadership context.`,
                href: '/teams',
              },
              {
                icon: BookOpen,
                label: 'Publications',
                value: `${publications.length}+ visible publication records can reinforce the lab's scientific profile.`,
                href: '/publications',
              },
              {
                icon: Microscope,
                label: 'Research Axes',
                value: 'Axes provide the conceptual frame that ties teams, projects, and outputs together.',
                href: '/research-axes',
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
