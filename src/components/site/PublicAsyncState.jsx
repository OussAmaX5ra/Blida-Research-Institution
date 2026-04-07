import { LoaderCircle, RefreshCcw, WifiOff } from 'lucide-react';

function PanelShell({ children }) {
  return (
    <section
      className="rounded-[2rem] border p-8 md:p-10"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.72)',
      }}
    >
      {children}
    </section>
  );
}

export function PublicPageLoading({ eyebrow = 'Loading', title, description }) {
  return (
    <PanelShell>
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-teal)]">{eyebrow}</p>
      <div className="mt-5 inline-flex items-center gap-3 text-[var(--color-teal)]">
        <LoaderCircle size={18} className="animate-spin" />
        <span className="text-sm font-semibold uppercase tracking-[0.22em]">Fetching live public records</span>
      </div>
      <h1
        className="page-section-title mt-5 max-w-4xl font-semibold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-black/64">{description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 rounded-[1.5rem] border bg-white/50"
            style={{ borderColor: 'rgba(13,17,23,0.08)' }}
          />
        ))}
      </div>
    </PanelShell>
  );
}

export function PublicPageError({ title, description, error, onRetry }) {
  return (
    <PanelShell>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(164,84,42,0.1)] text-[var(--color-rust)]">
        <WifiOff size={20} />
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[var(--color-rust)]">Data unavailable</p>
      <h1
        className="page-section-title mt-4 max-w-4xl font-semibold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-black/64">{description}</p>
      <p className="mt-4 rounded-[1.25rem] border border-[rgba(164,84,42,0.12)] bg-[rgba(164,84,42,0.05)] px-4 py-3 text-sm text-[var(--color-rust)]">
        {error}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        style={{ background: '#0d1117', color: '#f7f5f0' }}
      >
        <RefreshCcw size={15} />
        Retry loading
      </button>
    </PanelShell>
  );
}
