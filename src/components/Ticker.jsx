import { useMemo } from 'react';
import { usePublicData } from '../providers/usePublicData';
import { fallbackLabInfo } from '../lib/site-context';

export default function Ticker() {
  const { siteContext } = usePublicData();
  const labInfo = siteContext?.labInfo ?? fallbackLabInfo;

  const items = useMemo(() => {
    const axes = labInfo.axes ?? [];
    // Doubled for seamless loop
    return [...axes, ...axes, ...axes, ...axes];
  }, [labInfo.axes]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="overflow-hidden py-3"
         style={{ background: 'var(--color-teal)', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((item, i) => (
          <span key={i} className="text-xs font-semibold uppercase tracking-widest px-8 text-white/80">
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
