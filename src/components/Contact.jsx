import { Mail, MapPin, Phone, Send, GitBranch, AtSign, Globe, FlaskConical } from 'lucide-react';
import { labInfo } from '../data/mockData';

function ContactForm() {
  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
          { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@university.edu' },
        ].map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                   style={{ color: 'rgba(255,255,255,0.5)' }}>
              {field.label}
            </label>
            <input id={field.id} type={field.type} placeholder={field.placeholder}
                   className="w-full px-3 py-2.5 text-sm rounded-sm outline-none transition-all duration-200"
                   style={{
                     background: 'rgba(255,255,255,0.06)',
                     border: '1px solid rgba(255,255,255,0.1)',
                     color: 'white',
                   }}
                   onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                   onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
               style={{ color: 'rgba(255,255,255,0.5)' }}>
          Subject
        </label>
        <select id="subject"
                className="w-full px-3 py-2.5 text-sm rounded-sm outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
          <option value="">Select a topic…</option>
          <option>Research Collaboration</option>
          <option>PhD Application</option>
          <option>Internship Inquiry</option>
          <option>Media & Press</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
               style={{ color: 'rgba(255,255,255,0.5)' }}>
          Message
        </label>
        <textarea id="message" rows={4} placeholder="Tell us about your interest in our research…"
                  className="w-full px-3 py-2.5 text-sm rounded-sm outline-none transition-all duration-200 resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
      </div>

      <button type="submit"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}>
        <Send size={14} />
        Send Message
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="py-24 px-6" style={{ background: 'var(--color-ink)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-14">
            <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
              Get In Touch
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'white' }}>
              Contact Us
            </h2>
            <div className="h-px w-24" style={{ background: 'var(--color-gold)' }} />
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: info */}
            <div className="lg:col-span-2 space-y-8">
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
                Whether you're a prospective PhD student, a potential collaborator, or a journalist, we'd love to hear from you.
              </p>

              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Address', value: 'Building A, Room 301\nUniversity Science Park\nAlgiers, Algeria' },
                  { icon: Mail, label: 'Email', value: 'contact@nexus-lab.edu' },
                  { icon: Phone, label: 'Phone', value: '+213 (0) 23 45 67 89' },
                ].map(item => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <item.icon size={15} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {item.label}
                      </p>
                      <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-3 pt-2">
                {[
                  { icon: GitBranch, label: 'GitHub' },
                  { icon: AtSign, label: 'Twitter / X' },
                  { icon: Globe, label: 'LinkedIn' },
                ].map(s => (
                  <a key={s.label} href="#" aria-label={s.label}
                     className="w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 hover:opacity-70"
                     style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    <s.icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-3 p-6 rounded-sm"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#070a0e', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-light))' }}>
              <FlaskConical size={14} color="white" strokeWidth={1.5} />
            </div>
            <span className="font-display font-bold text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              NEXUS Research Laboratory
            </span>
          </div>

          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} NEXUS Research Laboratory. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Accessibility'].map(l => (
              <a key={l} href="#" className="text-xs transition-colors duration-200 hover:opacity-70"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
