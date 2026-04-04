import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Mail,
  Microscope,
  Newspaper,
  Users2,
} from 'lucide-react';
import { faculty, labInfo, news, publications, teams } from '../data/mockData';

const featuredTeams = teams.slice(0, 4);
const featuredPublications = publications.slice(0, 3);
const latestNews = news.slice(0, 3);
const featuredFaculty = faculty.slice(0, 4);
const galleryPreview = news.slice(0, 4);

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

function TeamCard({ team }) {
  return (
    <article
      className="rounded-[1.8rem] border p-6"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{
            background: `${team.color}18`,
            color: team.color,
          }}
        >
          {team.acronym}
        </span>
        <span className="text-sm text-black/46">{team.publications} papers</span>
      </div>

      <h3
        className="mt-5 text-2xl font-semibold leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {team.name}
      </h3>
      <p className="mt-3 text-base leading-8 text-black/64">{team.focus}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {team.projects.slice(0, 2).map((project) => (
          <span
            key={project}
            className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/52"
            style={{ borderColor: 'rgba(13,17,23,0.08)' }}
          >
            {project}
          </span>
        ))}
      </div>

      <div className="mt-6 border-t border-black/8 pt-4 text-sm uppercase tracking-[0.22em] text-black/46">
        Led by {team.leader}
      </div>
    </article>
  );
}

function PublicationRow({ publication }) {
  return (
    <article className="grid gap-3 py-5 md:grid-cols-[110px_1fr]">
      <div className="text-sm uppercase tracking-[0.24em] text-black/42">{publication.journal}</div>
      <div>
        <p
          className="text-2xl font-semibold leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {publication.title}
        </p>
        <p className="mt-2 text-sm leading-7 text-black/62">{publication.authors.join(', ')}</p>
      </div>
    </article>
  );
}

function NewsCard({ item }) {
  return (
    <article className="rounded-[1.5rem] border border-black/8 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.24em] text-black/42">{item.category}</span>
        <span className="text-sm text-black/38">{item.date}</span>
      </div>
      <p
        className="mt-3 text-xl font-semibold leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {item.headline}
      </p>
      <p className="mt-3 text-sm leading-7 text-black/62">{item.excerpt}</p>
    </article>
  );
}

export default function HomePage({ onNavigate }) {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Institutional Research Window
          </p>
          <h1
            className="max-w-4xl text-5xl font-bold leading-[0.98] md:text-7xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A research website that reads like an institutional journal, not a brochure.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-black/66">
            {labInfo.mission} The home page is built to balance institutional trust, scientific depth,
            and clear entry points into teams, publications, members, and current lab activity.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/teams"
              onClick={(event) => onNavigate(event, '/teams')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Explore Teams
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

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {labInfo.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.6rem] border px-5 py-5"
                style={{
                  borderColor: 'rgba(13,17,23,0.08)',
                  background: 'rgba(255,255,255,0.55)',
                }}
              >
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-black/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Research Axes</p>
            <div className="mt-4 space-y-4">
              {labInfo.axes.map((axis, index) => (
                <div key={axis} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{axis}</p>
                    <p className="mt-1 text-sm leading-7 text-white/58">
                      Connected to teams, projects, and publication streams within the lab.
                    </p>
                  </div>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">Featured Record</p>
            <h2
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {featuredPublications[0].title}
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[var(--color-teal)]">
              {featuredPublications[0].journal} | {featuredPublications[0].year}
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">{featuredPublications[0].abstract}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-black/45">About The Lab</p>
          <p
            className="mt-4 text-3xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The platform should make scientific credibility visible in the first thirty seconds.
          </p>
          <p className="mt-5 text-base leading-8 text-black/66">
            The lab was founded in {labInfo.founded} and is positioned as a modern institutional
            research environment. This homepage emphasizes mission, output, people, and signals of
            active work instead of generic marketing copy.
          </p>

          <div className="mt-6 space-y-3">
            {[
              'Mission, vision, and scientific positioning are visible immediately.',
              'Visitors can reach teams, members, publications, and news without friction.',
              'Editorial hierarchy keeps the experience premium while remaining information-rich.',
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <ChevronRight size={16} className="mt-1 text-[var(--color-gold-dark)]" />
                <p className="text-sm leading-7 text-black/64">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionIntro
            eyebrow="Featured Research Teams"
            title="Four teams, each with a distinct scientific identity."
            description="The homepage introduces the lab structure quickly, but still gives enough context for visitors to understand leadership, focus, and current activity."
            action={{ href: '/teams', label: 'View all research teams' }}
            onNavigate={onNavigate}
          />

          <div className="grid gap-5 md:grid-cols-2">
            {featuredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Latest Output"
            title="Recent publications stay visible at the homepage level."
            description="This gives prospective students, collaborators, and leadership an immediate sense of the lab's scientific productivity."
            action={{ href: '/publications', label: 'Open publication library' }}
            onNavigate={onNavigate}
          />

          <div className="divide-y divide-black/8">
            {featuredPublications.map((publication) => (
              <PublicationRow key={publication.id} publication={publication} />
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
              eyebrow="People"
              title="Leadership and expertise are visible, not buried."
              description="The homepage should quickly surface the lab's human depth alongside its research output."
              action={{ href: '/members', label: 'Meet the members' }}
              onNavigate={onNavigate}
            />

            <div className="space-y-4">
              {featuredFaculty.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-black/8 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-ink))' }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-black/84">{member.name}</p>
                      <p className="text-sm text-black/48">{member.expertise}</p>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-teal)]">
                    {member.team}
                  </span>
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Positioning</p>
              <Microscope size={16} className="text-[var(--color-gold)]" />
            </div>
            <p
              className="mt-4 text-3xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Serious, modern, and content-rich without feeling like a database dump.
            </p>
            <p className="mt-4 text-base leading-8 text-white/62">
              This page direction keeps the credibility of an institutional site while still feeling
              designed, intentional, and contemporary.
            </p>
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
            eyebrow="News And Signals"
            title="Current activity proves the lab is active, funded, and visible."
            description="The homepage should carry a small but meaningful stream of updates that reinforce momentum."
            action={{ href: '/news', label: 'Read all news' }}
            onNavigate={onNavigate}
          />

          <div className="space-y-5">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
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
            eyebrow="Gallery Preview"
            title="Visual moments help humanize the institution."
            description="Until a dedicated gallery dataset is in place, the homepage can still present a polished visual preview of lab life and public-facing achievements."
            action={{ href: '/gallery', label: 'Open gallery' }}
            onNavigate={onNavigate}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {galleryPreview.map((item, index) => (
              <figure
                key={item.id}
                className={`overflow-hidden rounded-[1.5rem] border border-black/8 ${index === 0 ? 'md:col-span-2' : ''}`}
              >
                <img
                  src={item.image}
                  alt={item.headline}
                  className={`w-full object-cover ${index === 0 ? 'h-72' : 'h-52'}`}
                />
                <figcaption className="border-t border-black/8 bg-white/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">{item.category}</p>
                  <p className="mt-2 text-base font-medium leading-7 text-black/76">{item.headline}</p>
                </figcaption>
              </figure>
            ))}
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
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Collaboration</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Open a conversation with the lab, a team lead, or a prospective research supervisor.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              The homepage should end with a clear invitation for collaboration, outreach, and academic discovery.
              This gives the public site a useful closing action without turning it into a marketing funnel.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Mail,
                label: 'General Contact',
                value: 'contact@nexus-lab.edu',
              },
              {
                icon: Users2,
                label: 'Research Teams',
                value: 'Explore teams and identify the best fit for collaboration.',
              },
              {
                icon: CalendarDays,
                label: 'Recent Activity',
                value: 'News, publications, and visual highlights remain accessible from the homepage.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border px-5 py-5"
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
              </div>
            ))}

            <div className="pt-2">
              <a
                href="/contact"
                onClick={(event) => onNavigate(event, '/contact')}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
              >
                Visit Contact Page
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
