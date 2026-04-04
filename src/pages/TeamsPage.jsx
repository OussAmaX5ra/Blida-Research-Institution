import {
  ArrowRight,
  BookOpen,
  Layers3,
  Microscope,
  Orbit,
  Sparkles,
  Users2,
} from 'lucide-react';
import { publications, researchAxes, teams } from '../data/mockData';

const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
const totalProjects = teams.reduce((sum, team) => sum + team.projects.length, 0);
const totalPublications = teams.reduce((sum, team) => sum + team.publications, 0);

const rosterStats = [
  {
    label: 'Research teams',
    value: `${teams.length}`,
    detail: 'Distinct units with their own leadership, focus, and project lines.',
  },
  {
    label: 'Researchers',
    value: `${totalMembers}`,
    detail: 'Structured across professors, doctors, and PhD students.',
  },
  {
    label: 'Project tracks',
    value: `${totalProjects}`,
    detail: 'Visible active lines that make each team\'s direction concrete.',
  },
  {
    label: 'Publication footprint',
    value: `${totalPublications}+`,
    detail: 'A cumulative output signal carried across the teams.',
  },
];

const rosterNotes = [
  {
    title: 'Leadership remains visible',
    description:
      'Each team card surfaces the lead researcher immediately so visitors can orient themselves quickly.',
  },
  {
    title: 'Roles stay separated',
    description:
      'The listing page previews composition by role instead of flattening all members into one undifferentiated count.',
  },
  {
    title: 'Scientific identity comes first',
    description:
      'Focus, axis alignment, projects, and publication activity appear before generic profile details.',
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
          className="text-4xl font-bold leading-tight md:text-5xl"
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

function getRoleCount(team, role) {
  return team.members.filter((member) => member.role === role).length;
}

function TeamCard({ team, onNavigate }) {
  const relatedAxis = researchAxes.find((axis) => axis.id === team.axisId);
  const relatedPublications = publications.filter((publication) => publication.teamTag === team.acronym);
  const roleCounts = [
    { label: 'Professor', value: getRoleCount(team, 'Professor') },
    { label: 'Doctors', value: getRoleCount(team, 'Doctor') },
    { label: 'PhD students', value: getRoleCount(team, 'PhD Student') },
  ];

  return (
    <article
      className="rounded-[2rem] border p-7 md:p-8"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{
                background: `${team.color}14`,
                color: team.color,
              }}
            >
              {team.acronym}
            </span>
            {relatedAxis ? (
              <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/56">
                {relatedAxis.name}
              </span>
            ) : null}
          </div>

          <h3
            className="mt-5 text-4xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {team.name}
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-black/66">{team.focus}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-4">
            <div
              className="rounded-[1.4rem] border px-4 py-4 sm:col-span-2"
              style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.76)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">Team leader</p>
              <p
                className="mt-2 text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {team.leader}
              </p>
            </div>

            <div
              className="rounded-[1.4rem] border px-4 py-4"
              style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.76)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">Projects</p>
              <p
                className="mt-2 text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {team.projects.length}
              </p>
            </div>

            <div
              className="rounded-[1.4rem] border px-4 py-4"
              style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.76)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/44">Papers</p>
              <p
                className="mt-2 text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {team.publications}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {roleCounts.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.3rem] border p-4"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-black/82">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Active project lines</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {team.projects.map((project) => (
                <span
                  key={project}
                  className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56"
                  style={{ borderColor: 'rgba(13,17,23,0.08)' }}
                >
                  {project}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-[1.7rem] border p-5 text-white"
            style={{
              borderColor: `${team.color}35`,
              background: `linear-gradient(160deg, #10151c, ${team.color})`,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/46">Composition</p>
              <Users2 size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-4 space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/48">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">Research signal</p>
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
            href={`/teams/${team.slug}`}
            onClick={(event) => onNavigate(event, `/teams/${team.slug}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            Open team details
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function TeamsPage({ onNavigate }) {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Research Teams
          </p>
          <h1
            className="max-w-5xl text-5xl font-bold leading-[0.98] md:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The lab&apos;s research work is organized into four teams with distinct scientific identities.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            This listing page is the public roster of the lab&apos;s operational structure. It should help
            visitors understand who leads each team, what each team studies, how members are distributed by
            role, and which active project lines shape the team&apos;s visible output.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/research-axes"
              onClick={(event) => onNavigate(event, '/research-axes')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              View Research Axes
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
              borderColor: 'rgba(201,168,76,0.22)',
              background: 'linear-gradient(160deg, #11161d, #1b2430 58%, #20424b)',
              boxShadow: '0 28px 60px rgba(13,17,23,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Roster Snapshot</p>
              <Microscope size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {rosterStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{stat.label}</p>
                  <p
                    className="mt-2 text-3xl font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{stat.detail}</p>
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
              Team pages should feel like academic units with evidence, not generic profile cards.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The listing is designed to balance leadership context, membership structure, and research
              output so each team reads like a serious scientific entity.
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
            eyebrow="How To Read The Teams"
            title="The page should explain structure before asking visitors to compare units."
            description="These notes set the rules of the roster and make the listing easier to scan across academic, student, and partner audiences."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {rosterNotes.map((item, index) => (
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
            eyebrow="Structure Map"
            title="Each team belongs to a larger scientific axis and carries its own operational focus."
            description="This index gives visitors a compact crosswalk between conceptual themes and the teams that execute them."
            onNavigate={onNavigate}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => {
              const axis = researchAxes.find((item) => item.id === team.axisId);

              return (
                <div
                  key={team.id}
                  className="rounded-[1.5rem] border p-5"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{ background: `${team.color}36`, color: '#fff' }}
                    >
                      {team.acronym}
                    </span>
                    <Layers3 size={16} className="text-[var(--color-gold)]" />
                  </div>
                  <p
                    className="mt-4 text-2xl font-semibold leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {team.name}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/42">
                    {axis?.name ?? 'Research axis'}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/68">{team.focus}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Team Directory"
          title="Each card surfaces leadership, role counts, projects, and research evidence."
          description="This is the main browsing area for the lab&apos;s teams and the foundation for the upcoming individual team detail pages."
          action={{ href: '/publications', label: 'Open publication library' }}
          onNavigate={onNavigate}
        />

        <div className="space-y-5">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onNavigate={onNavigate} />
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Next Layers</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              From here, visitors should move naturally into team details, member profiles, and publication evidence.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              The listing page establishes the lab&apos;s structure. The next public pages can deepen that
              structure by showing team-specific members, related projects, and publication records.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Orbit,
                label: 'Research Axes',
                value: 'Return to the conceptual map that groups the teams by scientific direction.',
                href: '/research-axes',
              },
              {
                icon: Users2,
                label: 'Members Directory',
                value: 'Browse the full lab roster once member pages are in place.',
                href: '/members',
              },
              {
                icon: Sparkles,
                label: 'Team Details',
                value: 'Each team card already points to a dedicated detail route for the next build step.',
                href: `/teams/${teams[0].slug}`,
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
