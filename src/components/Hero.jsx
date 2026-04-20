import { ArrowDown, ChevronRight, Microscope } from 'lucide-react';
import { usePublicData } from '../providers/usePublicData';
import { fallbackLabInfo } from '../lib/site-context';

export default function Hero() {
  const { siteContext } = usePublicData();
  const labInfo = siteContext?.labInfo ?? fallbackLabInfo;

  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'var(--color-ink)' }}
    >
      {/* Geometric background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{
             backgroundImage: 'linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)',
             backgroundSize: '60px 60px',
           }} />

      {/* Diagonal accent block */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-[0.06]"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, var(--color-teal) 100%)',
        }}
      />

      {/* Floating decorative circles */}
      <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full opacity-[0.05] animate-float"
           style={{ background: 'radial-gradient(circle, var(--color-gold), transparent)', animationDuration: '8s' }} />
      <div className="absolute bottom-32 left-[10%] w-40 h-40 rounded-full opacity-[0.04] animate-float"
           style={{ background: 'radial-gradient(circle, var(--color-teal-light), transparent)', animationDuration: '11s', animationDelay: '2s' }} />

      {/* Gold vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px opacity-20"
           style={{ background: 'linear-gradient(to bottom, transparent, var(--color-gold), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 animate-fade-up"
                 style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-gold" style={{ background: 'var(--color-gold)' }} />
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                Est. {labInfo.founded} · Active Research
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 animate-fade-up delay-100"
                style={{ color: 'white' }}>
              {labInfo.name.split(' ').slice(0, 1)}
              <span style={{ color: 'var(--color-gold)' }}> {labInfo.name.split(' ').slice(1, 2)}</span>
              <br />
              <span className="text-4xl lg:text-5xl font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {labInfo.name.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            <p className="text-base lg:text-lg leading-relaxed mb-10 animate-fade-up delay-200 max-w-xl"
               style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
              {labInfo.mission}
            </p>

            {/* Research axes */}
            <div className="flex flex-wrap gap-2 mb-10 animate-fade-up delay-300">
              {(labInfo.axes ?? []).map(axis => (
                <span key={axis}
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ background: 'rgba(26,92,107,0.3)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(42,127,147,0.3)' }}>
                  {axis}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4 animate-fade-up delay-400">
              <a href="#teams"
                 className="inline-flex items-center gap-2 px-6 py-3 font-medium text-sm rounded transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                 style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}>
                Explore Research
                <ChevronRight size={16} />
              </a>
              <a href="#publications"
                 className="inline-flex items-center gap-2 px-6 py-3 font-medium text-sm rounded transition-all duration-200"
                 style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                 onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                 onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
                View Publications
              </a>
            </div>
          </div>

          {/* Right: Stats cards */}
          <div className="grid grid-cols-2 gap-4 animate-fade-up delay-300">
            {(labInfo.stats ?? []).map((stat, i) => (
              <div key={stat.label}
                   className="p-6 rounded-sm transition-transform duration-300 hover:-translate-y-1"
                   style={{
                     background: 'rgba(255,255,255,0.04)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     animationDelay: `${0.3 + i * 0.1}s`,
                   }}>
                <div className="font-display text-4xl font-bold mb-1"
                     style={{ color: 'var(--color-gold)' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {stat.label}
                </div>
              </div>
            ))}

            {/* Vision card spanning full width */}
            <div className="col-span-2 p-5 rounded-sm"
                 style={{ background: 'rgba(26,92,107,0.2)', border: '1px solid rgba(42,127,147,0.25)' }}>
              <div className="flex items-start gap-3">
                <Microscope size={18} style={{ color: 'var(--color-teal-light)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-teal-light)' }}>
                    Our Vision
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
                    {labInfo.vision}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-600">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
          <ArrowDown size={14} style={{ color: 'rgba(255,255,255,0.3)' }} className="animate-float" />
        </div>
      </div>

      {/* Bottom divider wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16"
           style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface))' }} />
    </section>
  );
}
