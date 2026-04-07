import { Mail, MapPin, Phone, Send, GitBranch, AtSign, Globe } from 'lucide-react';

function ContactForm() {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
          { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@university.edu' },
        ].map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              className="w-full rounded-sm px-3 py-2.5 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
              onFocus={(event) => {
                event.target.style.borderColor = 'rgba(201,168,76,0.5)';
              }}
              onBlur={(event) => {
                event.target.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            />
          </div>
        ))}
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Subject
        </label>
        <select
          id="subject"
          className="w-full rounded-sm px-3 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <option value="">Select a topic...</option>
          <option>Research Collaboration</option>
          <option>PhD Application</option>
          <option>Internship Inquiry</option>
          <option>Media & Press</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tell us about your interest in our research..."
          className="w-full resize-none rounded-sm px-3 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          }}
          onFocus={(event) => {
            event.target.style.borderColor = 'rgba(201,168,76,0.5)';
          }}
          onBlur={(event) => {
            event.target.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        />
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
        style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}
      >
        <Send size={14} />
        Send Message
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <>
      <section id="contact" className="px-6 py-24" style={{ background: 'var(--color-ink)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <span
              className="mb-3 block text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--color-gold)' }}
            >
              Get In Touch
            </span>
            <h2 className="mb-4 font-display text-4xl font-bold lg:text-5xl" style={{ color: 'white' }}>
              Contact Us
            </h2>
            <div className="h-px w-24" style={{ background: 'var(--color-gold)' }} />
          </div>

          <div className="grid gap-12 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-2">
              <p
                className="text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}
              >
                Whether you're a prospective PhD student, a potential collaborator, or a journalist,
                we'd love to hear from you.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: 'Address',
                    value: 'Building A, Room 301\nUniversity Science Park\nAlgiers, Algeria',
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'contact@blida-research-institute.dz',
                  },
                  { icon: Phone, label: 'Phone', value: '+213 (0) 23 45 67 89' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div
                      className="h-9 w-9 flex-shrink-0 rounded-sm flex items-center justify-center"
                      style={{
                        background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.2)',
                      }}
                    >
                      <item.icon size={15} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <div>
                      <p
                        className="mb-1 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="whitespace-pre-line text-sm"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                {[
                  { icon: GitBranch, label: 'GitHub' },
                  { icon: AtSign, label: 'Twitter / X' },
                  { icon: Globe, label: 'LinkedIn' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-sm transition-all duration-200 hover:opacity-70"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <social.icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            <div
              className="rounded-sm p-6 lg:col-span-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#070a0e', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 overflow-hidden rounded bg-white p-0.5">
              <img
                src="/blida-research-institute-logo.png"
                alt="Blida Research Institute logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-display text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Blida Research Institute
            </span>
          </div>

          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} Blida Research Institute. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Accessibility'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors duration-200 hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
