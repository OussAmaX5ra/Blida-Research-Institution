import { useDeferredValue, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  FileText,
  FlaskConical,
  Layers3,
  Newspaper,
  Search,
  Sparkles,
  Tags,
  Users2,
  X,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

const notes = [
  'News should reinforce that the lab is active, funded, visible, and institutionally credible.',
  'Dates, categories, and related teams need to remain obvious so visitors can scan the feed quickly.',
  'The listing should feel editorial and current without drifting into a generic blog layout.',
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
        style={{ color: dark ? 'white' : 'var(--color-ink)' }}
      >
        <option value="" style={{ background: dark ? '#1a1a2e' : 'white' }}>{label === 'Year' ? 'All years' : `All ${label.toLowerCase()}s`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: dark ? 'white' : 'var(--color-ink)', background: dark ? '#1a1a2e' : 'white' }}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NewsCard({ item, featured = false, onNavigate }) {
  return (
    <article
      className="overflow-hidden rounded-[1.8rem] border"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.74)',
      }}
    >
      <div className={featured ? 'grid gap-0 lg:grid-cols-[1.05fr_0.95fr]' : 'grid gap-0 md:grid-cols-[0.85fr_1.15fr]'}>
        <div className={featured ? 'order-2 lg:order-1' : ''}>
          <img
            src={item.image}
            alt={item.headline}
            className={`h-full w-full object-cover ${featured ? 'min-h-[18rem] sm:min-h-[22rem]' : 'min-h-[14rem] sm:min-h-[16rem]'}`}
          />
        </div>

        <div className={`p-6 md:p-7 ${featured ? 'order-1 lg:order-2' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/56" style={{ borderColor: 'rgba(13,17,23,0.08)' }}>
              {item.category}
            </span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-black/42">{item.date}</span>
          </div>

          <a href={`/news/${item.slug}`} onClick={(event) => onNavigate(event, `/news/${item.slug}`)} className="block">
            <h3
              className={`mt-5 font-semibold leading-tight ${featured ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.headline}
            </h3>
          </a>

          <p className="mt-4 text-base leading-8 text-black/66">{item.excerpt}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.relatedTeams.map((team) => (
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

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]">
            <a href={`/news/${item.slug}`} onClick={(event) => onNavigate(event, `/news/${item.slug}`)} className="inline-flex items-center gap-2">
              <span>Open story</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function NewsPage({ onNavigate }) {
  const {
    collections: { news: liveNews, teams: liveTeams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const deferredQuery = useDeferredValue(query);

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="News"
        title="Loading the public institutional news feed."
        description="Live stories, categories, dates, and related teams are being fetched from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The institutional news feed could not load."
        description="The editorial shell is ready, but the live news records need the API before they can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const categoryOptions = [...new Set(liveNews.map((item) => item.category))].toSorted();
  const yearOptions = [...new Set(liveNews.map((item) => item.dateIso.slice(0, 4)))].toSorted((left, right) => Number(right) - Number(left));
  const teamOptions = liveTeams.map((team) => ({ label: team.name, value: team.acronym, slug: team.slug }));
  const newsRecords = liveNews
    .map((item) => ({
      ...item,
      relatedTeams: item.teams ?? [],
    }))
    .toSorted((left, right) => new Date(right.dateIso) - new Date(left.dateIso));
  const snapshot = [
    {
      label: 'Visible updates',
      value: `${newsRecords.length}`,
      detail: 'Public news records presented as a chronological institutional feed.',
    },
    {
      label: 'Categories',
      value: `${new Set(newsRecords.map((item) => item.category)).size}`,
      detail: 'Awards, funding, partnerships, and milestone signals across the lab.',
    },
    {
      label: 'Teams referenced',
      value: `${new Set(newsRecords.flatMap((item) => item.relatedTeams.map((team) => team.acronym))).size}`,
      detail: 'Research units already represented in the current public updates stream.',
    },
    {
      label: 'Latest year',
      value: newsRecords[0]?.dateIso.slice(0, 4) ?? 'N/A',
      detail: 'The most recent reporting period currently visible in the feed.',
    },
  ];

  const filteredNews = newsRecords.filter((item) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? `${item.headline} ${item.excerpt}`.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesTeam = selectedTeam ? item.teamTags?.includes(selectedTeam) : true;
    const matchesYear = selectedYear ? item.dateIso.startsWith(selectedYear) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });

  const activeFilters = [
    query.trim() ? `Query: ${query}` : null,
    selectedCategory ? `Category: ${selectedCategory}` : null,
    selectedTeam ? `Team: ${teamOptions.find((team) => team.value === selectedTeam)?.label ?? selectedTeam}` : null,
    selectedYear ? `Year: ${selectedYear}` : null,
  ].filter(Boolean);

  const featuredStory = filteredNews[0] ?? null;
  const remainingStories = featuredStory ? filteredNews.slice(1) : [];

  function resetFilters() {
    setQuery('');
    setSelectedCategory('');
    setSelectedTeam('');
    setSelectedYear('');
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            News
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A public feed of awards, partnerships, milestones, and current institutional activity.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            The news page makes the lab feel current and active. It surfaces the latest institutional signals in a chronological editorial feed while keeping categories, dates, and related teams easy to scan.
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">News Snapshot</p>
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
              The news layer should feel like a live institutional record, not a generic campus blog.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The page emphasizes momentum, visibility, and public relevance while staying visually aligned with the rest of the research atlas.
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
            eyebrow="Reading The Feed"
            title="The listing should clarify what counts as a news signal before visitors filter the stream."
            description="These notes keep the page grounded in institutional communication instead of generic content marketing."
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
            Filter the feed by query, category, team, or year.
          </p>
          <p className="mt-4 text-base leading-8 text-white/62">
            The controls act like a compact editorial index, helping visitors move quickly through awards, funding news, partnerships, and milestone stories.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Search updates</span>
              <div className="mt-3 flex items-center gap-3">
                <Search size={16} className="text-[var(--color-gold)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search headline or summary"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
                />
              </div>
            </label>

            <SelectField
              label="Category"
              value={selectedCategory}
              options={categoryOptions.map((category) => ({ label: category, value: category }))}
              onChange={setSelectedCategory}
              dark
            />
            <SelectField
              label="Team"
              value={selectedTeam}
              options={teamOptions.map((team) => ({ label: team.label, value: team.value }))}
              onChange={setSelectedTeam}
              dark
            />
            <SelectField
              label="Year"
              value={selectedYear}
              options={yearOptions.map((year) => ({ label: year, value: year }))}
              onChange={setSelectedYear}
              dark
            />

            <div
              className="rounded-[1.4rem] border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Visible updates</p>
              <p
                className="mt-2 text-3xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {filteredNews.length}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                {deferredQuery === query ? 'Updates currently visible after the active controls.' : 'Refining the feed view...'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Categories', value: `${new Set(filteredNews.map((item) => item.category)).size}`, icon: Tags },
              { label: 'Teams', value: `${new Set(filteredNews.flatMap((item) => item.teamTags ?? [])).size}`, icon: Users2 },
              { label: 'Latest', value: featuredStory?.dateIso.slice(0, 4) ?? 'N/A', icon: CalendarDays },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.3rem] border p-4"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">{item.label}</p>
                  <item.icon size={16} className="text-[var(--color-gold)]" />
                </div>
                <p
                  className="mt-2 text-3xl font-semibold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.value}
                </p>
              </div>
            ))}
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

      {featuredStory ? (
        <section className="space-y-5">
          <SectionIntro
            eyebrow="Lead Story"
            title="The most recent institutional signal should open the feed with a stronger editorial frame."
            description="The featured record gives the page a clear entry point before visitors move into the broader chronological stream."
            action={{ href: '/publications', label: 'Open publication library' }}
            onNavigate={onNavigate}
          />

          <NewsCard item={featuredStory} featured onNavigate={onNavigate} />
        </section>
      ) : null}

      <section className="space-y-5">
        <SectionIntro
          eyebrow="News Feed"
          title="A chronological record of recent updates across the lab."
          description="The listing keeps category, date, team context, and visual hierarchy intact so the feed stays useful as it grows."
          action={{ href: '/teams', label: 'Browse research teams' }}
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

        {remainingStories.length ? (
          <div className="grid gap-5">
            {remainingStories.map((item) => (
              <NewsCard key={item.id} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ) : filteredNews.length ? null : (
          <div
            className="rounded-[2rem] border p-8 text-center md:p-10"
            style={{
              borderColor: 'rgba(13,17,23,0.08)',
              background: 'rgba(255,255,255,0.7)',
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Matching Updates</p>
            <h3
              className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No news record matches the current filter combination.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Try broadening the query or clearing one of the filters to return to the wider public feed.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Reset news filters
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">What Comes Next</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The listing now gives the site a live institutional feed; the next layer can deepen individual stories.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              With the public feed in place, the next step is the news detail page where each update can carry a full story, featured image, date context, and linked content.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Newspaper,
                label: 'Publications',
                value: 'Follow awards and milestones back to the papers and outputs that triggered them.',
                href: '/publications',
              },
              {
                icon: Users2,
                label: 'Research Teams',
                value: "Reconnect each update to the units carrying the lab's public activity.",
                href: '/teams',
              },
              {
                icon: FileText,
                label: 'Projects',
                value: 'Trace news signals back to project lines, grants, and ongoing research work.',
                href: '/projects',
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

