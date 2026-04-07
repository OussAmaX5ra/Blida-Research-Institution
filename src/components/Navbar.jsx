import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Teams', href: '#teams' },
  { label: 'Publications', href: '#publications' },
  { label: 'Members', href: '#members' },
  { label: 'News', href: '#news' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(247,245,240,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 overflow-hidden rounded bg-white p-0.5 shadow-sm">
            <img
              src="/blida-research-institute-logo.png"
              alt="Blida Research Institute logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--color-ink)' }}>
              BRI
            </span>
            <span className="text-xs ml-1.5 font-light" style={{ color: 'var(--color-muted)' }}>
              Blida Research Institute
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium transition-colors duration-200 relative group"
                style={{ color: 'var(--color-ink)' }}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                      style={{ background: 'var(--color-gold)' }} />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--color-teal)', color: 'white' }}
        >
          Join the Lab
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-6 pt-2 border-t animate-fade-in"
             style={{ background: 'rgba(247,245,240,0.98)', borderColor: 'rgba(201,168,76,0.2)' }}>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="block py-3 text-sm font-medium border-b"
              style={{ color: 'var(--color-ink)', borderColor: 'var(--color-surface-alt)' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
