import {
  ArrowRight,
  Building2,
  Clock3,
  Compass,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import { contactInfo, labInfo } from '../data/mockData';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/PublicDataProvider.jsx';

const visitChecklist = [
  'Use the central mailbox for institutional questions, administrative coordination, and official correspondence.',
  'For collaboration requests, mention the relevant research axis or team so the inquiry can be directed quickly.',
  'For scheduled visits, refer to the laboratories wing and building information listed on this page.',
];

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

function ContactCard({ icon: Icon, label, value, detail, href, accent = 'var(--color-teal)' }) {
  const content = (
    <div
      className="rounded-[1.7rem] border p-6 transition-transform duration-200 hover:-translate-y-[1px]"
      style={{
        borderColor: 'rgba(13,17,23,0.08)',
        background: 'rgba(255,255,255,0.72)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.26em] text-black/44">{label}</p>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: `${accent}15`, color: accent }}
        >
          <Icon size={16} />
        </div>
      </div>
      <p
        className="mt-4 text-2xl font-semibold leading-tight text-black/84"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-black/62">{detail}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} className="block">
      {content}
    </a>
  );
}

export default function ContactPage({ onNavigate }) {
  const {
    collections: { teams },
    error,
    hasLoaded,
    isLoading,
    retry,
  } = usePublicData();

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="Contact"
        title="Loading the lab contact layer."
        description="The page is fetching the current team roster so outreach guidance can reflect the live public structure."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The contact page could not load live routing context."
        description="Static contact copy is ready, but the team-aware contact guidance needs the public API first."
        error={error}
        onRetry={retry}
      />
    );
  }

  const contactSnapshot = [
    {
      label: 'Research teams',
      value: `${teams.length}`,
      detail: 'Collaboration requests can be routed toward the most relevant scientific unit.',
    },
    {
      label: 'Office rhythm',
      value: '5 days',
      detail: 'Institutional coordination remains available across the standard academic work week.',
    },
    {
      label: 'Response window',
      value: '2 days',
      detail: 'General inquiries are acknowledged through the central lab office before team follow-up.',
    },
    {
      label: 'Campus base',
      value: 'Blida 1',
      detail: 'The public point of contact is framed as part of the university research environment.',
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
            Contact
          </p>
          <h1
            className="page-hero-title max-w-5xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A clear institutional point of contact for research inquiries, visits, and formal outreach.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-black/66">
            The contact page should feel like the public front desk of {labInfo.name}, with official
            details, location context, and enough guidance to help visitors route their request without
            turning the end of the public experience into a dead end.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`mailto:${contactInfo.email}`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: '#0d1117', color: '#f7f5f0' }}
            >
              Email The Lab
              <ArrowRight size={15} />
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
              Find The Right Team
            </a>
          </div>
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
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Contact Snapshot</p>
              <Compass size={16} className="text-[var(--color-gold)]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {contactSnapshot.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border p-4"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">{item.label}</p>
                  <p
                    className="mt-2 text-3xl font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/62">{item.detail}</p>
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
              The page should make outreach feel structured and credible rather than vague or generic.
            </p>
            <p className="mt-4 text-base leading-8 text-black/65">
              Contact information is presented as an institutional service layer that supports public
              discovery, research collaboration, and scheduled campus visits.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,255,255,0.62)',
          }}
        >
          <SectionIntro
            eyebrow="Official Channels"
            title="The core contact record should stay direct, legible, and immediately actionable."
            description="Visitors should not have to guess whether they should email, call, or orient themselves on campus first."
            onNavigate={onNavigate}
          />

          <div className="space-y-4">
            <ContactCard
              icon={Mail}
              label="Official Email"
              value={contactInfo.email}
              detail={contactInfo.responseWindow}
              href={`mailto:${contactInfo.email}`}
            />
            <ContactCard
              icon={Phone}
              label="Phone"
              value={contactInfo.phone}
              detail="Use the office line for scheduled visits, institutional coordination, and time-sensitive public inquiries."
              href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
              accent="var(--color-gold-dark)"
            />
            <ContactCard
              icon={Building2}
              label="Office"
              value={contactInfo.office}
              detail={`${contactInfo.campus}, ${contactInfo.city}`}
              accent="var(--color-rust)"
            />
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
            eyebrow="Visit And Reachability"
            title="Location, hours, and routing cues make the page useful before the first message is sent."
            description="This section acts like a compact institutional desk: where the lab sits, when coordination is available, and how visitors should orient themselves."
            onNavigate={onNavigate}
          />

          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div
              className="rounded-[1.6rem] border p-5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Office Hours</p>
                <Clock3 size={16} className="text-[var(--color-gold)]" />
              </div>
              <div className="mt-4 space-y-4">
                {contactInfo.officeHours.map((slot) => (
                  <div key={slot.label} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/44">{slot.label}</p>
                    <p
                      className="mt-2 text-2xl font-semibold text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {slot.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[1.6rem] border p-5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Campus Orientation</p>
                <MapPinned size={16} className="text-[var(--color-gold)]" />
              </div>
              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-[#f7f5f008] p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-5 text-center text-xs uppercase tracking-[0.24em] text-white/56">
                    Main Gate
                  </div>
                  <div className="rounded-[1rem] border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.14)] px-3 py-5 text-center text-xs uppercase tracking-[0.24em] text-white/82">
                    Building C
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-5 text-center text-xs uppercase tracking-[0.24em] text-white/56">
                    Labs Wing
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                {contactInfo.campus}, {contactInfo.city}
              </p>
              <div className="mt-4 space-y-3">
                {contactInfo.directions.map((step) => (
                  <div key={step} className="flex items-start gap-3">
                    <span
                      className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
                      style={{ background: 'rgba(201,168,76,0.18)', color: 'white' }}
                    >
                      +
                    </span>
                    <p className="text-sm leading-7 text-white/68">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionIntro
          eyebrow="Outreach Logic"
          title="Different visitors should know how to frame their first message."
          description="The contact page works better when it helps route collaboration, student interest, and formal public inquiries into the right channel."
          action={{ href: '/teams', label: 'Browse research teams' }}
          onNavigate={onNavigate}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {contactInfo.outreachTracks.map((track, index) => (
            <article
              key={track.title}
              className="rounded-[1.8rem] border p-6"
              style={{
                borderColor: 'rgba(13,17,23,0.08)',
                background: 'rgba(255,255,255,0.72)',
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-ink))' }}
                >
                  0{index + 1}
                </span>
                <Users2 size={16} className="text-[var(--color-teal)]" />
              </div>
              <h3
                className="mt-5 text-3xl font-semibold leading-tight text-black/84"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {track.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-black/64">{track.description}</p>
            </article>
          ))}
        </div>

        <div
          className="rounded-[2rem] border p-7"
          style={{
            borderColor: 'rgba(13,17,23,0.08)',
            background: 'rgba(255,253,248,0.78)',
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">Before You Visit</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {visitChecklist.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border p-5"
                style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.72)' }}
              >
                <p className="text-sm leading-8 text-black/64">{item}</p>
              </div>
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Next Steps</p>
            <h2
              className="mt-4 text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The public site now has a proper institutional contact layer before the admin boundary begins.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Visitors can now move from discovery into outreach with a clearer sense of who to contact,
              where the lab is based, and how collaboration requests should be framed.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Users2,
                label: 'Research Teams',
                value: 'Route a collaboration request toward the team that best matches the scientific topic.',
                href: '/teams',
              },
              {
                icon: ShieldCheck,
                label: 'Admin Login',
                value: 'Keep the administrative entry point structurally separate from public browsing.',
                href: '/admin/login',
              },
              {
                icon: Mail,
                label: 'Official Mailbox',
                value: contactInfo.email,
                href: `mailto:${contactInfo.email}`,
              },
            ].map((item) => {
              const isInternal = item.href.startsWith('/');

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={isInternal ? (event) => onNavigate(event, item.href) : undefined}
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
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
