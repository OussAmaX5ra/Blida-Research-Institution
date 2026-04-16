import { memo } from 'react';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { news } from '../data/mockData';

const categoryColors = {
  Award: { bg: 'rgba(201,168,76,0.15)', text: '#8a6e2f', border: 'rgba(201,168,76,0.35)' },
  Funding: { bg: 'rgba(45,106,79,0.12)', text: '#2d6a4f', border: 'rgba(45,106,79,0.3)' },
  Partnership: { bg: 'rgba(26,92,107,0.12)', text: '#1a5c6b', border: 'rgba(26,92,107,0.3)' },
  Milestone: { bg: 'rgba(124,77,138,0.12)', text: '#7c4d8a', border: 'rgba(124,77,138,0.3)' },
};

const NewsCard = memo(function NewsCard({ item, featured = false }) {
  const colors = categoryColors[item.category] ?? categoryColors.Partnership;

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-sm group cursor-pointer row-span-2"
               style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={item.image} alt={item.headline}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.95) 40%, rgba(13,17,23,0.3) 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative h-full min-h-[400px] flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              {item.category}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Calendar size={10} />
              {item.date}
            </span>
          </div>

          <h3 className="font-display font-bold text-xl text-white mb-2 leading-snug">
            {item.headline}
          </h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
            {item.excerpt}
          </p>

          <button className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 hover:gap-3"
                  style={{ color: 'var(--color-gold)' }}>
            Read full story <ArrowRight size={13} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-4 p-4 rounded-sm group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
             style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0">
        <img src={item.image} alt={item.headline}
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {item.category}
          </span>
        </div>
        <h3 className="font-display font-semibold text-sm leading-snug mb-1.5 group-hover:text-teal-700 transition-colors"
            style={{ color: 'var(--color-ink)' }}>
          {item.headline}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
          {item.excerpt}
        </p>
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
          <Calendar size={10} />
          {item.date}
        </div>
      </div>
    </article>
  );
});

export default function NewsGallery() {
  const [featured, ...rest] = news;

  return (
    <section id="news" className="py-24 px-6" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            Lab Life
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-ink)' }}>
              News & Updates
            </h2>
            <button className="flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-3"
                    style={{ color: 'var(--color-teal)' }}>
              View all news <ArrowRight size={15} />
            </button>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        {/* Grid: featured + list */}
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <NewsCard item={featured} featured />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4">
            {rest.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        </div>

        {/* Gallery strip */}
        <div className="mt-14">
          <h3 className="font-display text-2xl font-semibold mb-6" style={{ color: 'var(--color-ink)' }}>
            Gallery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {news.map((item) => (
              <div key={item.id}
                   className="aspect-video rounded-sm overflow-hidden relative group cursor-pointer"
                   style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <img src={item.image} alt={item.headline}
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.85), transparent)' }}>
                  <p className="text-white text-xs font-medium leading-snug line-clamp-2">{item.headline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
