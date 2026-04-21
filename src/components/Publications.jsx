import { useState, useMemo, useCallback, useTransition } from 'react';
import { Search, ExternalLink, Quote, Copy, Check, Filter } from 'lucide-react';
import { usePublicData } from '../providers/usePublicData';

function generateBibTeX(pub) {
  const key = `${(pub.authors?.[0] ?? '').split('.').pop().trim()}${pub.year}`;
  return `@article{${key},
  title     = {${pub.title}},
  author    = {${(pub.authors ?? []).join(' and ')}},
  journal   = {${pub.journal}},
  year      = {${pub.year}}
}`;
}

function generateAPA(pub) {
  const authorsStr = (pub.authors ?? []).join(', ');
  return `${authorsStr} (${pub.year}). ${pub.title}. ${pub.journal}.`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button onClick={handleCopy}
            className="p-1.5 rounded transition-all duration-200 hover:opacity-70"
            style={{ color: copied ? '#2d6a4f' : 'var(--color-muted)' }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function CitationModal({ pub, onClose }) {
  const [format, setFormat] = useState('bibtex');
  const citation = format === 'bibtex' ? generateBibTeX(pub) : generateAPA(pub);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(13,17,23,0.75)', backdropFilter: 'blur(4px)' }}
         onClick={onClose}>
      <div className="w-full max-w-lg rounded-sm p-6 animate-fade-up"
           style={{ background: 'var(--color-surface)', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{ color: 'var(--color-ink)' }}>Export Citation</h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:opacity-70" style={{ color: 'var(--color-muted)' }}>✕</button>
        </div>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>
          {pub.title}
        </p>

        <div className="flex gap-2 mb-4">
          {['bibtex', 'apa'].map(f => (
            <button key={f}
                    onClick={() => setFormat(f)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide transition-all duration-200"
                    style={{
                      background: format === f ? 'var(--color-teal)' : 'var(--color-surface-alt)',
                      color: format === f ? 'white' : 'var(--color-muted)',
                    }}>
              {f}
            </button>
          ))}
        </div>

        <div className="relative rounded p-4"
             style={{ background: 'var(--color-ink)', fontFamily: 'monospace' }}>
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {citation}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={citation} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicationCard({ pub, onCite }) {
  return (
    <article className="p-5 rounded-sm transition-all duration-200 hover:-translate-y-0.5 group"
             style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Tag & year */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(26,92,107,0.1)', color: 'var(--color-teal)' }}>
          {pub.teamTag}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{pub.year}</span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-semibold leading-snug mb-2 group-hover:text-teal-700 transition-colors duration-200"
          style={{ color: 'var(--color-ink)' }}>
        {pub.title}
      </h3>

      {/* Authors */}
      <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
        {(pub.authors ?? []).join(', ')}
      </p>

      {/* Journal */}
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-gold-dark)' }}>
        {pub.journal}
      </p>

      {/* Abstract */}
      <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
        {pub.abstract}
      </p>

      {/* Citations & actions */}
      <div className="flex items-center justify-between pt-3"
           style={{ borderTop: '1px solid var(--color-surface-alt)' }}>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          <strong style={{ color: 'var(--color-ink)' }}>{pub.citations}</strong> citations
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => onCite(pub)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all duration-200 hover:opacity-80"
                  style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--color-gold-dark)' }}>
            <Quote size={11} />
            Cite
          </button>
          <a href={pub.pdfLink}
             className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all duration-200 hover:opacity-80"
             style={{ background: 'rgba(26,92,107,0.1)', color: 'var(--color-teal)' }}>
            <ExternalLink size={11} />
            PDF
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Publications() {
  const { collections } = usePublicData();

  const allTags = useMemo(
    () => ['All', ...(collections?.teams ?? []).map(t => t.acronym)],
    [collections?.teams],
  );

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [citingPub, setCitingPub] = useState(null);
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(e => {
    startTransition(() => setQuery(e.target.value));
  }, []);

  const filtered = useMemo(() => {
    const publications = collections?.publications ?? [];
    const q = query.toLowerCase();
    return publications.filter(p => {
      const matchTag = activeTag === 'All' || p.teamTag === activeTag;
      const matchQuery = !q || p.title.toLowerCase().includes(q) || (p.authors ?? []).some(a => a.toLowerCase().includes(q)) || p.journal.toLowerCase().includes(q);
      return matchTag && matchQuery;
    });
  }, [query, activeTag, collections?.publications]);

  return (
    <section id="publications" className="py-24 px-6" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            Scientific Output
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-ink)' }}>
              Publications
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {filtered.length} of {collections?.publications?.length ?? 0} papers
            </p>
          </div>
          <div className="h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, author, or journal…"
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-sm outline-none transition-all duration-200"
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                color: 'var(--color-ink)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-teal)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} style={{ color: 'var(--color-muted)' }} />
            {allTags.map(tag => (
              <button key={tag}
                      onClick={() => setActiveTag(tag)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide transition-all duration-200"
                      style={{
                        background: activeTag === tag ? 'var(--color-teal)' : 'white',
                        color: activeTag === tag ? 'white' : 'var(--color-muted)',
                        border: '1px solid',
                        borderColor: activeTag === tag ? 'var(--color-teal)' : 'rgba(0,0,0,0.08)',
                      }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(pub => (
            <PublicationCard key={pub.id || pub.slug} pub={pub} onCite={setCitingPub} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--color-muted)' }}>
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p>No publications match your search.</p>
            </div>
          )}
        </div>
      </div>

      {citingPub && <CitationModal pub={citingPub} onClose={() => setCitingPub(null)} />}
    </section>
  );
}
