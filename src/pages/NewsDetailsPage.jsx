import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  FlaskConical,
  Newspaper,
  Sparkles,
  Users2,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/PublicDataProvider.jsx';

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

function NewsNotFound({ slug, onNavigate }) {
  return (
    <section
      className="rounded-[2rem] border p-8 md:p-10"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">News Story Not Found</p>
      <h1
        className="mt-4 text-4xl font-semibold leading-tight md:text-6xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        No news record matches the slug `{slug}`.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-black/64">
        The public shell is active, but this story does not exist in the current milestone 2 dataset.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/news"
          onClick={(event) => onNavigate(event, '/news')}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: '#0d1117', color: '#f7f5f0' }}
        >
          <ArrowLeft size={15} />
          Back to News
        </a>
        <a
          href="/teams"
          onClick={(event) => onNavigate(event, '/teams')}
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
          style={{
            borderColor: 'rgba(13,17,23,0.12)',
            background: 'rgba(255,255,255,0.58)',
          }}
        >
          Explore Teams
        </a>
      </div>
    </section>
  );
}

export default function NewsDetailsPage({ slug, onNavigate }) {
  const {
    collections: {
      news: liveNews,
      projects: liveProjects,
      publications: livePublications,
      teams: liveTeams,
    },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="News Details"
        title="Loading the institutional story."
        description="The detail page is fetching the live story together with its related teams, projects, and publications."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The institutional story could not load."
        description="This page needs the public API to return the story and its related context before it can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const story = liveNews.find((item) => item.slug === slug);

  if (!story) {
    return <NewsNotFound slug={slug} onNavigate={onNavigate} />;
  }

  const relatedTeams = story.teams ?? [];
  const relatedPublications = livePublications
    .filter((publication) => relatedTeams.some((team) => team.acronym === publication.team?.acronym))
    .slice(0, 2);
  const relatedProjects = liveProjects
    .filter((project) => relatedTeams.some((team) => team.acronym === project.team?.acronym))
    .slice(0, 2);
  const adjacentStories = liveNews
    .filter((item) => item.slug !== story.slug && (item.teams ?? []).some((team) => relatedTeams.some((relatedTeam) => relatedTeam.acronym === team.acronym)))
    .slice(0, 2);

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <a
            href="/news"
            onClick={(event) => onNavigate(event, '/news')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            <ArrowLeft size={15} />
            Back to news feed
          </a>

          <p className="mb-4 mt-6 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            News Details
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {story.headline}
          </h1>
          <p className="page-copy-lg mt-6 max-w-3xl text-black/66">
            This story expands the public feed into a full institutional record with date context, featured imagery, related teams, and connected research content.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span
              className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56"
              style={{ borderColor: 'rgba(13,17,23,0.08)' }}
            >
              {story.category}
            </span>
            {relatedTeams.map((team) => (
              <a
                key={team.acronym}
                href={`/teams/${team.slug}`}
                onClick={(event) => onNavigate(event, `/teams/${team.slug}`)}
                className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: `${team.color}14`, color: team.color }}
              >
                {team.acronym}
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-black/58">
            <div className="inline-flex items-center gap-2">
              <CalendarDays size={15} className="text-[var(--color-teal)]" />
              {story.date}
            </div>
            <div className="inline-flex items-center gap-2">
              <Newspaper size={15} className="text-[var(--color-teal)]" />
              Public institutional update
            </div>
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Story Snapshot</p>
              <FlaskConical size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Category', value: story.category },
                { label: 'Date', value: story.date },
                { label: 'Teams', value: `${relatedTeams.length}` },
                { label: 'Related outputs', value: `${relatedPublications.length + relatedProjects.length}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{item.label}</p>
                  <p
                    className="mt-2 text-2xl font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.value}
                  </p>
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
              A news detail page should read like a documented institutional update rather than just an enlarged teaser.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The story keeps public activity tied to dates, teams, research outputs, and visible institutional momentum.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <img
          src={story.image}
          alt={story.headline}
          className="h-64 w-full rounded-[2rem] border object-cover sm:h-80 md:h-[30rem]"
          style={{ borderColor: 'rgba(13,17,23,0.08)' }}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Full Story"
            title="The detail page should carry the full narrative behind the update."
            description="Longer copy helps visitors understand why the event matters to the lab instead of treating it as a passing announcement."
            onNavigate={onNavigate}
          />

          <div className="space-y-5">
            {story.body.map((paragraph, index) => (
              <p key={index} className="text-base leading-9 text-black/72">
                {paragraph}
              </p>
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
              eyebrow="Related Teams"
              title="The story should stay anchored to the teams carrying the public activity."
              description="This keeps news connected to the research structure already established across the site."
              onNavigate={onNavigate}
            />

            <div className="space-y-4">
              {relatedTeams.map((team) => (
                <a
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  onClick={(event) => onNavigate(event, `/teams/${team.slug}`)}
                  className="block rounded-[1.5rem] border p-5 transition-transform duration-200 hover:-translate-y-[1px]"
                  style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.82)' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{ background: `${team.color}14`, color: team.color }}
                    >
                      {team.acronym}
                    </span>
                    <Users2 size={16} style={{ color: team.color }} />
                  </div>
                  <p
                    className="mt-4 text-2xl font-semibold leading-tight text-black/84"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {team.name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-black/62">{team.focus}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Related Publications"
            title="News stories should lead naturally into the outputs that give them research weight."
            description="Linking into publications helps the public feed feel connected to the lab’s actual scientific record."
            action={{ href: '/publications', label: 'Open publication library' }}
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {relatedPublications.map((publication) => (
              <a
                key={publication.id}
                href={`/publications/${publication.slug}`}
                onClick={(event) => onNavigate(event, `/publications/${publication.slug}`)}
                className="block rounded-[1.5rem] border p-5 transition-transform duration-200 hover:-translate-y-[1px]"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.82)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">{publication.publisher}</p>
                  <BookOpen size={16} className="text-[var(--color-teal)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight text-black/84"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {publication.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{publication.authors.join(', ')}</p>
              </a>
            ))}
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
            eyebrow="Optional Related Content"
            title="Project lines and adjacent stories help the update sit inside a broader public timeline."
            description="This section gives visitors a few sensible next steps without turning the page into a content maze."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {relatedProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.82)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">{project.status}</p>
                  <Sparkles size={16} className="text-[var(--color-teal)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight text-black/84"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {project.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{project.summary}</p>
              </div>
            ))}

            {adjacentStories.map((item) => (
              <a
                key={item.id}
                href={`/news/${item.slug}`}
                onClick={(event) => onNavigate(event, `/news/${item.slug}`)}
                className="block rounded-[1.5rem] border p-5 transition-transform duration-200 hover:-translate-y-[1px]"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Related story</p>
                  <FileText size={16} className="text-[var(--color-teal)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight text-black/84"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.headline}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{item.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
