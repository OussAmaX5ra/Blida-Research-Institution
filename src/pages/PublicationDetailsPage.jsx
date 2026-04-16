import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Files,
  FlaskConical,
  Link2,
  Quote,
  Sparkles,
} from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

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

function buildBibtex(publication) {
  const citationKey = `${publication.slug.replace(/-/g, '_')}_${publication.year}`;
  const authors = publication.authors.join(' and ');
  const venueField = publication.entryType === 'article' ? 'journal' : 'booktitle';
  const venueValue = publication.entryType === 'article' ? publication.journal : publication.journal;

  return `@${publication.entryType}{${citationKey},
  title = {${publication.title}},
  author = {${authors}},
  ${venueField} = {${venueValue}},
  year = {${publication.year}},
  publisher = {${publication.publisher}},
  doi = {${publication.doi}},
  url = {${publication.pdfLink}}
}`;
}

function buildApaCitation(publication) {
  return `${publication.authors.join(', ')} (${publication.year}). ${publication.title}. ${publication.publisher}. ${publication.doi}`;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function PublicationNotFound({ slug, onNavigate }) {
  return (
    <section
      className="rounded-[2rem] border p-8 md:p-10"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">Publication Not Found</p>
      <h1
        className="mt-4 text-4xl font-semibold leading-tight md:text-6xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        No publication record matches the slug `{slug}`.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-black/64">
        The public shell is active, but this publication detail record does not exist in the current milestone 2 dataset.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/publications"
          onClick={(event) => onNavigate(event, '/publications')}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: '#0d1117', color: '#f7f5f0' }}
        >
          <ArrowLeft size={15} />
          Back to Publications
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

export default function PublicationDetailsPage({ slug, onNavigate }) {
  const {
    collections: {
      projects: liveProjects,
      publications: livePublications,
      teams: liveTeams,
    },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();
  const [feedback, setFeedback] = useState('');

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Publication Details"
        title="Loading the publication record."
        description="The detail page is fetching the live publication, project, and team context from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The publication record could not load."
        description="This page needs the public API to return the publication and its related context before it can render."
        error={error}
        onRetry={retry}
      />
    );
  }

  const publication = livePublications.find((entry) => entry.slug === slug);

  if (!publication) {
    return <PublicationNotFound slug={slug} onNavigate={onNavigate} />;
  }

  const team = liveTeams.find((entry) => entry.acronym === publication.teamTag);
  const relatedProjects = liveProjects.filter((project) => project.team?.acronym === publication.teamTag).slice(0, 3);
  const relatedPublications = livePublications
    .filter((entry) => entry.team?.acronym === publication.teamTag && entry.slug !== publication.slug)
    .slice(0, 2);
  const bibtex = buildBibtex(publication);
  const apaCitation = buildApaCitation(publication);

  function handleBibtexExport() {
    downloadTextFile(`${publication.slug}.bib`, bibtex);
    setFeedback('BibTeX exported.');
  }

  function handleApaExport() {
    downloadTextFile(`${publication.slug}-apa.txt`, apaCitation);
    setFeedback('APA citation exported.');
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <a
            href="/publications"
            onClick={(event) => onNavigate(event, '/publications')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
          >
            <ArrowLeft size={15} />
            Back to publication library
          </a>

          <p className="mb-4 mt-6 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Publication Details
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {publication.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            This publication detail page turns the library record into a canonical scholarly view, keeping citation metadata, abstract, team context, and export actions visible in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {publication.themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-black/56"
                style={{ borderColor: 'rgba(13,17,23,0.08)' }}
              >
                {theme}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={publication.pdfLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Open PDF
              <ExternalLink size={15} />
            </a>
            <button
              type="button"
              onClick={handleBibtexExport}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: 'rgba(13,17,23,0.12)', background: 'rgba(255,255,255,0.58)' }}
            >
              Export BibTeX
              <Download size={15} />
            </button>
            <button
              type="button"
              onClick={handleApaExport}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: 'rgba(13,17,23,0.12)', background: 'rgba(255,255,255,0.58)' }}
            >
              Export APA citation
              <Quote size={15} />
            </button>
          </div>

          {feedback ? (
            <p className="mt-4 text-sm font-medium text-[var(--color-teal)]">{feedback}</p>
          ) : null}
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Record Snapshot</p>
              <FlaskConical size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Publisher', value: publication.publisher },
                { label: 'Year', value: `${publication.year}` },
                { label: 'Citations', value: `${publication.citations}` },
                { label: 'Team', value: publication.teamTag },
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
              A publication detail page should feel like a stable scholarly record, not just a bigger card from the listing.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              The page makes the paper legible as a research artifact by anchoring it in venue, authorship, team, and citation context.
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
            eyebrow="Full Metadata"
            title="The canonical record should keep bibliographic precision easy to read."
            description="This section consolidates the metadata that supports citation, verification, and external reference without burying it in a collapsed panel."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            {[
              { label: 'Title', value: publication.title },
              { label: 'Authors', value: publication.authors.join(', ') },
              { label: 'Venue', value: publication.journal },
              { label: 'Publisher', value: publication.publisher },
              { label: 'DOI', value: publication.doi },
              { label: 'Record type', value: publication.entryType === 'article' ? 'Journal article' : 'Conference paper' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">{item.label}</p>
                <p className="mt-3 text-base leading-8 text-black/76">{item.value}</p>
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
            eyebrow="Abstract And Export"
            title="Abstract clarity and citation actions turn the detail page into a usable research record."
            description="The abstract explains the contribution, while BibTeX and APA export give the page real academic utility."
            onNavigate={onNavigate}
          />

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Abstract</p>
                <BookOpen size={16} className="text-[var(--color-gold)]" />
              </div>
              <p className="mt-4 text-sm leading-8 text-white/74">{publication.abstract}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Citation exports</p>
                <Files size={16} className="text-[var(--color-gold)]" />
              </div>
              <div className="mt-4 grid gap-4">
                <button
                  type="button"
                  onClick={handleBibtexExport}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm leading-7 text-white/76"
                >
                  Export BibTeX
                </button>
                <button
                  type="button"
                  onClick={handleApaExport}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm leading-7 text-white/76"
                >
                  Export APA citation
                </button>
              </div>
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
            eyebrow="Related Team"
            title="The publication record should remain anchored to the team that carried the work."
            description="Linking the paper back to its research unit keeps the library connected to the broader institutional structure."
            onNavigate={onNavigate}
          />

          {team ? (
            <div
              className="rounded-[1.6rem] border p-6"
              style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,253,248,0.82)' }}
            >
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: `${team.color}14`, color: team.color }}
              >
                {team.acronym}
              </span>
              <p
                className="mt-4 text-3xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {team.name}
              </p>
              <p className="mt-4 text-base leading-8 text-black/64">{team.summary}</p>
              <a
                href={`/teams/${team.slug}`}
                onClick={(event) => onNavigate(event, `/teams/${team.slug}`)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-teal)]"
              >
                Open team details
                <ArrowRight size={15} />
              </a>
            </div>
          ) : null}
        </div>

        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Related Context"
            title="Project lines and adjacent papers help place the record inside a larger research thread."
            description="This keeps the detail page from feeling isolated and gives visitors natural next steps inside the same scientific area."
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
                  <Sparkles size={16} style={{ color: team?.color ?? 'var(--color-teal)' }} />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {project.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{project.summary}</p>
              </div>
            ))}

            {relatedPublications.map((item) => (
              <a
                key={item.id}
                href={`/publications/${item.slug}`}
                onClick={(event) => onNavigate(event, `/publications/${item.slug}`)}
                className="block rounded-[1.5rem] border p-5 transition-transform duration-200 hover:-translate-y-[1px]"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Adjacent publication</p>
                  <Link2 size={16} className="text-[var(--color-teal)]" />
                </div>
                <p
                  className="mt-4 text-2xl font-semibold leading-tight text-black/84"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-black/62">{item.authors.join(', ')}</p>
              </a>
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
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Next Library Layers</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The record page now supports citation use, team context, and a clearer route into related research.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              With canonical publication detail in place, the next public layers can move naturally into news, gallery, and richer cross-links between outputs and institutional activity.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: FileText,
                label: 'Publication Library',
                value: 'Return to the full searchable library to compare papers across teams and years.',
                href: '/publications',
              },
              {
                icon: BookOpen,
                label: 'Projects',
                value: 'Follow the publication back to its surrounding project lines and active milestones.',
                href: '/projects',
              },
              {
                icon: Sparkles,
                label: 'Research Teams',
                value: 'Reconnect the paper to the broader scientific identity of the team behind it.',
                href: team ? `/teams/${team.slug}` : '/teams',
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
