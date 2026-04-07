import { useDeferredValue, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  FlaskConical,
  Layers3,
  Search,
  Sparkles,
  Tags,
  Users2,
  X,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/PublicDataProvider.jsx';

const notes = [
  'The publications page should read like a curated institutional library, not an undifferentiated search dump.',
  'Publisher, year, authorship, and team context need to stay visible even when filters narrow the list aggressively.',
  'Theme tags should make each record easier to scan without replacing the paper title as the primary anchor.',
];

function getInitialPublicationFilters() {
  if (typeof window === 'undefined') {
    return {
      author: '',
      publisher: '',
      query: '',
      team: '',
      theme: '',
      year: '',
    };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    author: searchParams.get('author') ?? '',
    publisher: searchParams.get('publisher') ?? '',
    query: searchParams.get('query') ?? '',
    team: searchParams.get('team') ?? '',
    theme: searchParams.get('theme') ?? '',
    year: searchParams.get('year') ?? '',
  };
}

function syncPublicationFiltersToUrl(filters) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextSearchParams = new URLSearchParams();

  if (filters.query) nextSearchParams.set('query', filters.query);
  if (filters.year) nextSearchParams.set('year', filters.year);
  if (filters.team) nextSearchParams.set('team', filters.team);
  if (filters.publisher) nextSearchParams.set('publisher', filters.publisher);
  if (filters.author) nextSearchParams.set('author', filters.author);
  if (filters.theme) nextSearchParams.set('theme', filters.theme);

  const nextSearch = nextSearchParams.toString();
  const nextUrl = nextSearch
    ? `${window.location.pathname}?${nextSearch}`
    : window.location.pathname;

  window.history.replaceState({}, '', nextUrl);
}

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

function PublicationCard({ publication, onNavigate }) {
  const teamHref = publication.teamSlug ? `/teams/${publication.teamSlug}` : '/teams';

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
            style={{ background: `${publication.teamColor}14`, color: publication.teamColor }}
          >
            {publication.teamTag}
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/56"
            style={{ borderColor: 'rgba(13,17,23,0.08)' }}
          >
            {publication.publisher}
          </span>
        </div>
        <span className="text-sm uppercase tracking-[0.2em] text-black/42">{publication.year}</span>
      </div>

      <a
        href={`/publications/${publication.slug}`}
        onClick={(event) => onNavigate(event, `/publications/${publication.slug}`)}
        className="block"
      >
        <h3
          className="mt-5 text-3xl font-semibold leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {publication.title}
        </h3>
      </a>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-black/60">
        <span>{publication.authors.join(', ')}</span>
        <span className="text-black/28">|</span>
        <span>{publication.journal}</span>
      </div>

      <p className="mt-4 text-base leading-8 text-black/66">{publication.abstract}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-[1.2rem] border px-4 py-4"
          style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Team</p>
          <a
            href={teamHref}
            onClick={(event) => onNavigate(event, teamHref)}
            className="mt-2 inline-flex items-center gap-2 text-base font-medium text-black/82"
          >
            {publication.teamName}
            <ArrowRight size={14} style={{ color: publication.teamColor }} />
          </a>
        </div>

        <div
          className="rounded-[1.2rem] border px-4 py-4"
          style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Citations</p>
          <p className="mt-2 text-2xl font-semibold text-black/84" style={{ fontFamily: 'var(--font-display)' }}>
            {publication.citations}
          </p>
        </div>

        <div
          className="rounded-[1.2rem] border px-4 py-4"
          style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.78)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">PDF</p>
          <a
            href={publication.pdfLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-base font-medium text-[var(--color-teal)]"
          >
            Open PDF
            <Download size={14} />
          </a>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Themes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(publication.themes ?? []).map((theme) => (
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

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/publications/${publication.slug}`}
          onClick={(event) => onNavigate(event, `/publications/${publication.slug}`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
        >
          Open record
          <ArrowRight size={14} />
        </a>
        <a
          href={publication.pdfLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/62"
        >
          Open PDF
          <Download size={14} />
        </a>
      </div>
    </article>
  );
}

export default function PublicationsPage({ onNavigate }) {
  const {
    collections: { publications: livePublications, teams: liveTeams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [initialFilters] = useState(getInitialPublicationFilters);
  const [query, setQuery] = useState(initialFilters.query);
  const [selectedYear, setSelectedYear] = useState(initialFilters.year);
  const [selectedTeam, setSelectedTeam] = useState(initialFilters.team);
  const [selectedPublisher, setSelectedPublisher] = useState(initialFilters.publisher);
  const [selectedAuthor, setSelectedAuthor] = useState(initialFilters.author);
  const [selectedTheme, setSelectedTheme] = useState(initialFilters.theme);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    syncPublicationFiltersToUrl({
      author: selectedAuthor,
      publisher: selectedPublisher,
      query: query.trim(),
      team: selectedTeam,
      theme: selectedTheme,
      year: selectedYear,
    });
  }, [query, selectedAuthor, selectedPublisher, selectedTeam, selectedTheme, selectedYear]);

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Publications"
        title="Loading the public publication library."
        description="Live publication records and filter metadata are being fetched from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The publication library could not load."
        description="The public library shell is ready, but the live records need the API before they can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const teamOptions = liveTeams
    .map((team) => ({ label: team.name, value: team.slug, tag: team.acronym }))
    .toSorted((left, right) => left.label.localeCompare(right.label));
  const yearOptions = [...new Set(livePublications.map((publication) => publication.year))].toSorted((left, right) => right - left);
  const publisherOptions = [...new Set(livePublications.map((publication) => publication.publisher))].toSorted();
  const themeOptions = [...new Set(livePublications.flatMap((publication) => publication.themes ?? []))].toSorted();
  const authorOptions = [...new Set(livePublications.flatMap((publication) => publication.authors))].toSorted();
  const publicationRecords = livePublications
    .map((publication) => ({
      ...publication,
      teamTag: publication.team?.acronym ?? publication.teamTag ?? 'Unassigned',
      teamName: publication.team?.name ?? 'Research Team',
      teamSlug: publication.team?.slug ?? publication.teamSlug ?? '',
      teamColor: publication.team?.color ?? '#1a5c6b',
    }))
    .toSorted((left, right) => {
      const yearDiff = right.year - left.year;
      if (yearDiff !== 0) return yearDiff;
      return right.citations - left.citations;
    });
  const snapshot = [
    {
      label: 'Library records',
      value: `${publicationRecords.length}`,
      detail: 'Visible papers presented as a public research library rather than a loose card grid.',
    },
    {
      label: 'Total citations',
      value: `${publicationRecords.reduce((sum, publication) => sum + publication.citations, 0)}`,
      detail: 'A compact signal of scholarly reach across the currently visible record set.',
    },
    {
      label: 'Publishers',
      value: `${new Set(publicationRecords.map((publication) => publication.publisher)).size}`,
      detail: 'Conference and journal venues represented in the library.',
    },
    {
      label: 'Teams represented',
      value: `${new Set(publicationRecords.map((publication) => publication.teamTag).filter(Boolean)).size}`,
      detail: 'Research units already surfaced through the publication layer.',
    },
  ];

  const filteredPublications = publicationRecords.filter((publication) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? `${publication.title} ${publication.abstract} ${publication.authors.join(' ')} ${publication.publisher} ${publication.journal} ${publication.teamName} ${(publication.themes ?? []).join(' ')}`.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesYear = selectedYear ? String(publication.year) === selectedYear : true;
    const matchesTeam = selectedTeam ? publication.teamSlug === selectedTeam : true;
    const matchesPublisher = selectedPublisher ? publication.publisher === selectedPublisher : true;
    const matchesAuthor = selectedAuthor ? publication.authors.includes(selectedAuthor) : true;
    const matchesTheme = selectedTheme ? (publication.themes ?? []).includes(selectedTheme) : true;

    return matchesQuery && matchesYear && matchesTeam && matchesPublisher && matchesAuthor && matchesTheme;
  });

  const activeFilters = [
    query.trim() ? `Query: ${query}` : null,
    selectedYear ? `Year: ${selectedYear}` : null,
    selectedTeam ? `Team: ${teamOptions.find((team) => team.value === selectedTeam)?.label ?? selectedTeam}` : null,
    selectedPublisher ? `Publisher: ${selectedPublisher}` : null,
    selectedAuthor ? `Author: ${selectedAuthor}` : null,
    selectedTheme ? `Theme: ${selectedTheme}` : null,
  ].filter(Boolean);

  const visibleTeams = new Set(filteredPublications.map((publication) => publication.teamTag).filter(Boolean)).size;
  const visibleCitations = filteredPublications.reduce((sum, publication) => sum + publication.citations, 0);

  function resetFilters() {
    setQuery('');
    setSelectedYear('');
    setSelectedTeam('');
    setSelectedPublisher('');
    setSelectedAuthor('');
    setSelectedTheme('');
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Publications
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A searchable public library of the lab&apos;s papers, conference contributions, and scholarly output.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            The publications page gives the public site a true research library layer. Visitors can filter
            by year, team, publisher, author, and theme while still reading each paper as a credible institutional record.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/projects"
              onClick={(event) => onNavigate(event, '/projects')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Browse Projects
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Library Snapshot</p>
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
              The publication layer should feel like a scholarly index, not just a list of titles and dates.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The page balances bibliographic precision with readable hierarchy so visitors can scan the lab&apos;s output without losing context.
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
            eyebrow="Reading The Library"
            title="The page should explain how to interpret the record set before visitors narrow it."
            description="These notes keep the library grounded in scholarly context instead of letting it read like a generic search interface."
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
            Filter the library by query, year, team, publisher, author, or theme.
          </p>
          <p className="mt-4 text-base leading-8 text-white/62">
            The controls behave like a research index, making the record set searchable without sacrificing academic readability.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Search publications</span>
              <div className="mt-3 flex items-center gap-3">
                <Search size={16} className="text-[var(--color-gold)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, abstract, author, publisher, or theme"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
                />
              </div>
            </label>

            <SelectField
              label="Year"
              value={selectedYear}
              options={yearOptions.map((year) => ({ label: `${year}`, value: `${year}` }))}
              onChange={setSelectedYear}
              dark
            />
            <SelectField
              label="Team"
              value={selectedTeam}
              options={teamOptions}
              onChange={setSelectedTeam}
              dark
            />
            <SelectField
              label="Publisher"
              value={selectedPublisher}
              options={publisherOptions.map((publisher) => ({ label: publisher, value: publisher }))}
              onChange={setSelectedPublisher}
              dark
            />
            <SelectField
              label="Author"
              value={selectedAuthor}
              options={authorOptions.map((author) => ({ label: author, value: author }))}
              onChange={setSelectedAuthor}
              dark
            />
            <SelectField
              label="Theme"
              value={selectedTheme}
              options={themeOptions.map((theme) => ({ label: theme, value: theme }))}
              onChange={setSelectedTheme}
              dark
            />

            <div
              className="rounded-[1.4rem] border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Visible records</p>
              <p
                className="mt-2 text-3xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {filteredPublications.length}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                {deferredQuery === query ? 'Records currently visible after the active controls.' : 'Refining the library view...'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Teams', value: `${visibleTeams}`, icon: Users2 },
              {
                label: 'Themes',
                value: `${new Set(filteredPublications.flatMap((publication) => publication.themes ?? [])).size}`,
                icon: Tags,
              },
              { label: 'Citations', value: `${visibleCitations}`, icon: BookOpen },
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

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Publication Library"
          title="A searchable record of the lab&apos;s visible scholarly output."
          description="Each card surfaces citation context, publisher, authorship, theme tags, team links, and direct PDF access so the library feels genuinely useful."
          action={{ href: '/projects', label: 'Return to projects' }}
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

        {filteredPublications.length ? (
          <div className="grid gap-5">
            {filteredPublications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} onNavigate={onNavigate} />
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Matching Publications</p>
            <h3
              className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No publication record matches the current filter combination.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Try broadening the search query or clearing one of the bibliographic filters to reopen the library.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Reset library filters
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
              The publication layer now gives the public site a proper scholarly library rather than a placeholder list.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              From here the next natural step is the publication detail page, where citation export, full metadata, and canonical record views can deepen the library.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: FileText,
                label: 'Projects',
                value: 'Trace each paper back to the project lines that gave it context and momentum.',
                href: '/projects',
              },
              {
                icon: Users2,
                label: 'Members Directory',
                value: 'Reconnect authorship to the people carrying the lab\'s research profile.',
                href: '/members',
              },
              {
                icon: Sparkles,
                label: 'Research Teams',
                value: 'Return to the unit-level view that organizes publication output by scientific identity.',
                href: '/teams',
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
