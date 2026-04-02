import { labInfo } from '../data/mockData';

const items = [...labInfo.axes, ...labInfo.axes]; // doubled for seamless loop

export default function Ticker() {
  return (
    <div className="overflow-hidden py-3"
         style={{ background: 'var(--color-teal)', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-semibold uppercase tracking-widest px-8 text-white/80">
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
