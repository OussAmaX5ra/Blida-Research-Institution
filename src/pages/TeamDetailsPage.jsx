import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  Layers3,
  Microscope,
  Newspaper,
  Sparkles,
  Users2,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

const roleOrder = ['Professor', 'Doctor', 'PhD Student'];

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

function TeamNotFound({ slug, onNavigate }) {
  return (
    <section
      className="rounded-[2rem] border p-8 md:p-10"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">Team Not Found</p>
      <h1
        className="mt-4 text-4xl font-semibold leading-tight md:text-6xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        No research team matches the slug `{slug}`.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-black/64">
        The public shell is active, but this team record does not exist in the current milestone 2 dataset.
        You can return to the team directory or browse the research axes instead.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/teams"
          onClick={(event) => onNavigate(event, '/teams')}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: '#0d1117', color: '#f7f5f0' }}
        >
          <ArrowLeft size={15} />
          Back to Teams
        </a>
        <a
          href="/research-axes"
          onClick={(event) => onNavigate(event, '/research-axes')}
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
          style={{
            borderColor: 'rgba(13,17,23,0.12)',
            background: 'rgba(255,255,255,0.58)',
          }}
        >
          Open Research Axes
        </a>
      </div>
    </section>
  );
}

function MemberGroup({ title, members, accent }) {
  return (
    <section
      className="rounded-[1.8rem] border p-6"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.72)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-2xl font-semibold leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </p>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ background: `${accent}14`, color: accent }}
        >
          {members.length}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {members.map((member) => (
          <article
            key={member.name}
            className="rounded-[1.3rem] border px-4 py-4"
            style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.84)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, var(--color-ink))` }}
              >
                {member.avatar}
              </div>
              <div>
                <p className="font-medium text-black/84">{member.name}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">{member.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function TeamDetailsPage({ slug, onNavigate }) {
  const {
    collections: { members, news, projects, publications, teams },
    error,
    hasLoaded,
    isLoading,
    retry,
    siteContext,
  } = usePublicData();

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Team Details"
        title="Loading the team profile."
        description="The page is fetching the live team record together with its members, projects, publications, and related news."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The team profile could not load."
        description="This route needs the public API to return the team record before the detail page can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const team = teams.find((entry) => entry.slug === slug);

  if (!team) {
    return <TeamNotFound slug={slug} onNavigate={onNavigate} />;
  }

  const researchAxes = siteContext.researchAxes ?? [];
  const relatedAxis = researchAxes.find((axis) => axis.id === team.axisId);
  const relatedMembers = members.filter((member) => member.team.slug === team.slug);
  const relatedProjects = projects.filter((project) => project.team?.slug === team.slug);
  const relatedPublications = publications.filter((publication) => publication.team?.acronym === team.acronym);
  const relatedNews = news.filter((item) => (item.teams ?? []).some((entry) => entry.acronym === team.acronym));
  const groupedMembers = roleOrder.map((role) => ({
    role,
    members: relatedMembers.filter((member) => member.role === role),
  }));

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <a
            href="/teams"
            onClick={(event) => onNavigate(event, '/teams')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            <ArrowLeft size={15} />
            Back to research teams
          </a>

          <p className="mb-4 mt-6 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Team Details
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {team.name}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            {team.summary}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/publications"
              onClick={(event) => onNavigate(event, '/publications')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Browse Publications
              <ArrowRight size={15} />
            </a>
            <a
              href="/members"
              onClick={(event) => onNavigate(event, '/members')}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
              style={{
                borderColor: 'rgba(13,17,23,0.12)',
                background: 'rgba(255,255,255,0.58)',
              }}
            >
              Browse Members
            </a>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[2rem] border p-7 text-white"
            style={{
              borderColor: `${team.color}35`,
              background: `linear-gradient(160deg, #11161d, #1b2430 52%, ${team.color})`,
              boxShadow: '0 28px 60px rgba(13,17,23,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Team Snapshot</p>
              <Microscope size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Acronym', value: team.acronym },
                { label: 'Leader', value: team.leader },
                { label: 'Members', value: `${team.memberCount}` },
                { label: 'Projects', value: `${team.projectCount}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{item.label}</p>
                  <p
                    className={`mt-2 font-semibold text-white ${item.label === 'Leader' ? 'text-lg' : 'text-3xl'}`}
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Scientific Mission</p>
            <p
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {team.focus}
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              {relatedAxis?.position ?? "This team contributes to one of the lab's core institutional research directions."}
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
            eyebrow="Identity And Themes"
            title="The detail page should frame the team as a coherent scientific unit."
            description="This section ties the team's mission to its parent axis, theme vocabulary, and institutional role within the lab."
            onNavigate={onNavigate}
          />

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-black/8 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">Parent axis</p>
                <Compass size={16} className="text-[var(--color-teal)]" />
              </div>
              <p
                className="mt-4 text-3xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {relatedAxis?.name ?? 'Research Axis'}
              </p>
              <p className="mt-3 text-base leading-8 text-black/64">{relatedAxis?.summary}</p>
            </div>

            <div className="rounded-[1.5rem] border border-black/8 p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">Theme tags</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {team.themes.map((theme) => (
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
            eyebrow="Methods And Outcomes"
            title="Teams are easier to understand when methods and outcomes are made explicit."
            description="The detail page should show how the team operates, what kinds of methods it uses, and what forms of impact or output it aims to produce."
            onNavigate={onNavigate}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Methods</p>
                <Layers3 size={16} className="text-[var(--color-gold)]" />
              </div>
              <div className="mt-4 space-y-3">
                {(relatedAxis?.methods ?? []).map((method) => (
                  <div key={method} className="flex items-start gap-3">
                    <Sparkles size={15} className="mt-1 text-[var(--color-gold)]" />
                    <p className="text-sm leading-7 text-white/72">{method}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Outcomes</p>
                <BriefcaseBusiness size={16} className="text-[var(--color-gold)]" />
              </div>
              <div className="mt-4 space-y-3">
                {(relatedAxis?.outcomes ?? []).map((outcome) => (
                  <div key={outcome} className="flex items-start gap-3">
                    <Sparkles size={15} className="mt-1 text-[var(--color-gold)]" />
                    <p className="text-sm leading-7 text-white/72">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Team Members"
          title="Members are grouped separately by role, not flattened into one list."
          description="This keeps the academic structure visible and matches the product requirement for distinct role groupings."
          action={{ href: '/teams', label: 'Back to team directory' }}
          onNavigate={onNavigate}
        />

        <div className="grid gap-5 xl:grid-cols-3">
          {groupedMembers.map((group) => (
            <MemberGroup
              key={group.role}
              title={group.role === 'PhD Student' ? 'PhD Students' : `${group.role}${group.members.length > 1 ? 's' : ''}`}
              members={group.members}
              accent={team.color}
            />
          ))}
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
            eyebrow="Active Projects"
            title="Projects show how the team turns its scientific direction into ongoing work."
            description="Even before dedicated project pages exist, the team detail should make active lines of work concrete and visible."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {relatedProjects.map((project, index) => (
              <article
                key={project.slug}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.8)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ background: `${team.color}14`, color: team.color }}
                  >
                    0{index + 1}
                  </span>
                  <BriefcaseBusiness size={16} style={{ color: team.color }} />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {project.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">
                  This project line sits within the team's broader mission and contributes to the
                  {` ${relatedAxis?.name ?? 'lab'} `} research direction.
                </p>
              </article>
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
            eyebrow="Associated Publications"
            title="Publications provide the clearest evidence of the team's scientific output."
            description="The detail page should connect people and projects to actual papers rather than leaving the team as a purely descriptive profile."
            action={{ href: '/publications', label: 'Browse all publications' }}
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {relatedPublications.map((publication) => (
              <article
                key={publication.id}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.82)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
                    {publication.journal}
                  </p>
                  <BookOpen size={16} className="text-[var(--color-teal)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {publication.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{publication.authors.join(', ')}</p>
                <p className="mt-3 text-sm leading-7 text-black/58">{publication.abstract}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedNews.length ? (
        <section
          className="rounded-[2rem] border p-8 md:p-10"
          style={{
            borderColor: 'rgba(201,168,76,0.24)',
            background: 'linear-gradient(140deg, #10151c, #17212c 62%, #1e4a50)',
            color: 'white',
          }}
        >
          <SectionIntro
            eyebrow="Related News"
            title="News references add current institutional signals around the team."
            description="Awards, grants, partnerships, and milestones help the team feel active and publicly visible."
            action={{ href: '/news', label: 'Open all news' }}
            onNavigate={onNavigate}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {relatedNews.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">{item.category}</p>
                  <Newspaper size={16} className="text-[var(--color-gold)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.headline}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/42">{item.date}</p>
                <p className="mt-3 text-sm leading-7 text-white/72">{item.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="rounded-[2rem] border p-8 md:p-10"
        style={{
          borderColor: 'rgba(13,17,23,0.08)',
          background: 'rgba(255,255,255,0.7)',
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-teal)]">Next Routes</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              This detail page now anchors the team; the next layers can deepen member, project, and publication browsing.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/62">
              With the team route in place, the public experience can now branch into member directories,
              project browsing, and richer publication detail pages without losing institutional context.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Users2,
                label: 'Members Directory',
                value: 'Use the team roster as a launch point into full member browsing.',
                href: '/members',
              },
              {
                icon: BookOpen,
                label: 'Publications',
                value: "Follow the team's output into the broader publication library.",
                href: '/publications',
              },
              {
                icon: Layers3,
                label: 'Research Teams',
                value: 'Return to the full team listing to compare scientific units across the lab.',
                href: '/teams',
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => onNavigate(event, item.href)}
                className="rounded-[1.5rem] border px-5 py-5 transition-transform duration-200 hover:-translate-y-[1px]"
                style={{
                  borderColor: 'rgba(13,17,23,0.08)',
                  background: 'rgba(255,253,248,0.82)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: `${team.color}14` }}
                  >
                    <item.icon size={16} style={{ color: team.color }} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-black/46">{item.label}</p>
                    <p className="mt-2 text-base leading-8 text-black/72">{item.value}</p>
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
