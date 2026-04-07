import { startTransition, useDeferredValue, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  FileImage,
  FlaskConical,
  Grid3X3,
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
  'The gallery should humanize the institution without collapsing into a generic image board.',
  'Categories, dates, captions, and team context should stay readable so the visuals still behave like records.',
  'Load-more behavior keeps the page intentional and future-friendly instead of rendering an unbounded feed.',
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

function GalleryTile({ item, index, onNavigate }) {
  const tall = index % 5 === 0 || index % 5 === 3;

  return (
    <article
      className={`overflow-hidden rounded-[1.8rem] border ${tall ? 'md:row-span-2' : ''}`}
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.74)',
      }}
    >
      <img
        src={item.image}
        alt={item.title}
        className={`w-full object-cover ${tall ? 'h-80 sm:h-[24rem] md:h-[30rem]' : 'h-64 md:h-[18rem]'}`}
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/56" style={{ borderColor: 'rgba(13,17,23,0.08)' }}>
            {item.category}
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-black/42">{item.date}</span>
        </div>

        <h3
          className="mt-4 text-2xl font-semibold leading-tight text-black/84"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-black/62">{item.caption}</p>

        {item.team ? (
          <div className="mt-4">
            <a
              href={`/teams/${item.team.slug}`}
              onClick={(event) => onNavigate(event, `/teams/${item.team.slug}`)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ background: `${item.team.color}14`, color: item.team.color }}
            >
              {item.team.acronym}
              <ArrowRight size={12} />
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function GalleryPage({ onNavigate }) {
  const {
    collections: { gallery: liveGallery, teams: liveTeams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const deferredQuery = useDeferredValue(query);

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Gallery"
        title="Loading the public media gallery."
        description="Live gallery items, dates, categories, and team links are being fetched from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The media gallery could not load."
        description="The gallery layout is ready, but the live media records need the API before they can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const categoryOptions = [...new Set(liveGallery.map((item) => item.category))].toSorted();
  const yearOptions = [...new Set(liveGallery.map((item) => item.dateIso.slice(0, 4)))].toSorted((left, right) => Number(right) - Number(left));
  const teamOptions = liveTeams.map((team) => ({ label: team.name, value: team.acronym, slug: team.slug }));
  const galleryRecords = liveGallery
    .map((item) => ({
      ...item,
      team: item.team ?? null,
    }))
    .toSorted((left, right) => new Date(right.dateIso) - new Date(left.dateIso));
  const snapshot = [
    {
      label: 'Visible media',
      value: `${galleryRecords.length}`,
      detail: 'Curated visual records presented as a public institutional gallery rather than a raw image dump.',
    },
    {
      label: 'Categories',
      value: `${new Set(galleryRecords.map((item) => item.category)).size}`,
      detail: 'A mix of lab life, conferences, workshops, infrastructure, and milestone moments.',
    },
    {
      label: 'Teams represented',
      value: `${new Set(galleryRecords.map((item) => item.teamTag).filter(Boolean)).size}`,
      detail: 'Research units already visible across the current gallery selection.',
    },
    {
      label: 'Latest year',
      value: galleryRecords[0]?.dateIso.slice(0, 4) ?? 'N/A',
      detail: 'The most recent reporting year currently present in the media record.',
    },
  ];

  const filteredGallery = galleryRecords.filter((item) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? `${item.title} ${item.caption}`.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesTeam = selectedTeam ? item.teamTag === selectedTeam : true;
    const matchesYear = selectedYear ? item.dateIso.startsWith(selectedYear) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });

  const visibleGallery = filteredGallery.slice(0, visibleCount);
  const activeFilters = [
    query.trim() ? `Query: ${query}` : null,
    selectedCategory ? `Category: ${selectedCategory}` : null,
    selectedTeam ? `Team: ${teamOptions.find((team) => team.value === selectedTeam)?.label ?? selectedTeam}` : null,
    selectedYear ? `Year: ${selectedYear}` : null,
  ].filter(Boolean);

  function resetFilters() {
    setQuery('');
    setSelectedCategory('');
    setSelectedTeam('');
    setSelectedYear('');
    setVisibleCount(6);
  }

  function handleLoadMore() {
    startTransition(() => {
      setVisibleCount((count) => count + 4);
    });
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Gallery
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A visual archive of conferences, lab life, infrastructure, and institutional moments across the research platform.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            The gallery gives the public site a visual record of the lab as a working institution. It presents images with captions, dates, categories, and team context rather than treating media as decorative filler.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/news"
              onClick={(event) => onNavigate(event, '/news')}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Browse News
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Gallery Snapshot</p>
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
              The gallery should feel like a visual archive of the institution, not just a strip of promotional images.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              Each image remains tied to a date, a caption, and often a research team so the visual layer still behaves like structured public content.
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
            eyebrow="Reading The Archive"
            title="The page should explain how to read the visual record before visitors narrow it."
            description="These notes keep the gallery aligned with the rest of the public atlas instead of turning it into a disconnected media wall."
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
            Filter the archive by query, category, team, or year.
          </p>
          <p className="mt-4 text-base leading-8 text-white/62">
            The controls behave like a visual index, helping visitors move between lab moments, public milestones, and infrastructure views without losing context.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Search captions</span>
              <div className="mt-3 flex items-center gap-3">
                <Search size={16} className="text-[var(--color-gold)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title or caption"
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
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Visible media</p>
              <p
                className="mt-2 text-3xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {filteredGallery.length}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                {deferredQuery === query ? 'Gallery items currently visible after the active controls.' : 'Refining the archive view...'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Categories', value: `${new Set(filteredGallery.map((item) => item.category)).size}`, icon: Tags },
              { label: 'Teams', value: `${new Set(filteredGallery.map((item) => item.teamTag).filter(Boolean)).size}`, icon: Users2 },
              { label: 'Loaded', value: `${Math.min(visibleGallery.length, filteredGallery.length)}`, icon: Grid3X3 },
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
          eyebrow="Visual Archive"
          title="A responsive gallery of the lab's public moments and working environments."
          description="The archive stays visual, but each tile still carries category, date, caption, and team context so it reads as curated institutional material."
          action={{ href: '/news', label: 'Open news feed' }}
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

        {visibleGallery.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleGallery.map((item, index) => (
              <GalleryTile key={item.id} item={item} index={index} onNavigate={onNavigate} />
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">No Matching Media</p>
            <h3
              className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No gallery record matches the current filter combination.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-black/62">
              Try broadening the category, team, or year filters to reopen the visual archive.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Reset gallery filters
              <X size={14} />
            </button>
          </div>
        )}

        {visibleGallery.length < filteredGallery.length ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: 'rgba(13,17,23,0.12)', background: 'rgba(255,255,255,0.72)' }}
            >
              Load more media
              <ArrowRight size={14} />
            </button>
          </div>
        ) : null}
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Visual Continuity</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The gallery now gives the public site a visual archive that still behaves like institutional content.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              With the archive in place, the next public layer can move naturally into contact and admin login without leaving the public experience feeling incomplete.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Camera,
                label: 'News',
                value: 'Move from the visual archive back into the full narrative stories behind key public moments.',
                href: '/news',
              },
              {
                icon: FileImage,
                label: 'Research Teams',
                value: "Reconnect visuals to the teams carrying the lab's work and public presence.",
                href: '/teams',
              },
              {
                icon: Sparkles,
                label: 'Publications',
                value: 'Follow conference and institutional moments back to the research outputs that support them.',
                href: '/publications',
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

