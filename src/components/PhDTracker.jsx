import { useRef, useEffect, useState, memo, useMemo } from 'react';
import { GraduationCap, BookOpen, FlaskConical, FileText, Award, Clock, CheckCircle2, Circle, Loader } from 'lucide-react';
import { usePublicData } from '../providers/usePublicData';

// Module-level static data (rendering-hoist-jsx pattern)
const phdStudents = [
  {
    id: 1,
    name: 'Lucas Ferreira',
    team: 'ISAI',
    topic: 'AutoML for Heterogeneous Graph Data',
    supervisor: 'Prof. Sarah Chen',
    startYear: 2022,
    expectedEnd: 2025,
    currentPhase: 3,
    phases: [
      { label: 'Coursework', icon: BookOpen, status: 'done', year: '2022', detail: 'Completed 12 graduate credits with distinction.' },
      { label: 'Literature Review', icon: FileText, status: 'done', year: '2023 Q1', detail: 'Surveyed 140+ papers; published a survey in JMLR.' },
      { label: 'Research & Experiments', icon: FlaskConical, status: 'active', year: '2023–2024', detail: '3 papers submitted; benchmarking on 8 datasets ongoing.' },
      { label: 'Thesis Writing', icon: FileText, status: 'pending', year: '2025 Q1', detail: 'Manuscript drafting scheduled.' },
      { label: 'Defense', icon: Award, status: 'pending', year: '2025 Q3', detail: 'Expected graduation with honours.' },
    ],
  },
  {
    id: 2,
    name: 'Ting Wei',
    team: 'BIG',
    topic: 'Contrastive Learning for Protein Structures',
    supervisor: 'Prof. James Okafor',
    startYear: 2021,
    expectedEnd: 2025,
    currentPhase: 4,
    phases: [
      { label: 'Coursework', icon: BookOpen, status: 'done', year: '2021', detail: 'Completed bioinformatics & ML curricula.' },
      { label: 'Literature Review', icon: FileText, status: 'done', year: '2022 Q1', detail: 'Comprehensive review of protein ML landscape.' },
      { label: 'Research & Experiments', icon: FlaskConical, status: 'done', year: '2022–2023', detail: '2 papers published in Nature Comp. Sci.' },
      { label: 'Thesis Writing', icon: FileText, status: 'active', year: '2024', detail: 'Final thesis chapters under review by supervisor.' },
      { label: 'Defense', icon: Award, status: 'pending', year: '2025 Q1', detail: 'Pre-defense scheduled for December 2024.' },
    ],
  },
  {
    id: 3,
    name: 'Amara Diallo',
    team: 'HCI',
    topic: 'Cognitive Accessibility in Adaptive Interfaces',
    supervisor: 'Prof. Marie Dupont',
    startYear: 2023,
    expectedEnd: 2026,
    currentPhase: 2,
    phases: [
      { label: 'Coursework', icon: BookOpen, status: 'done', year: '2023', detail: 'HCI, cognitive science, and UX research courses.' },
      { label: 'Literature Review', icon: FileText, status: 'active', year: '2024', detail: 'Reviewing 80+ papers on accessibility and adaptive UI.' },
      { label: 'Research & Experiments', icon: FlaskConical, status: 'pending', year: '2024–2025', detail: 'User studies planned with neurodiverse participants.' },
      { label: 'Thesis Writing', icon: FileText, status: 'pending', year: '2025–2026', detail: 'Manuscript to begin after experiments.' },
      { label: 'Defense', icon: Award, status: 'pending', year: '2026 Q2', detail: 'Projected graduation mid-2026.' },
    ],
  },
  {
    id: 4,
    name: 'Chen Jing',
    team: 'DEC',
    topic: 'Byzantine-Resilient Federated Learning',
    supervisor: 'Prof. Carlos Rivera',
    startYear: 2022,
    expectedEnd: 2025,
    currentPhase: 3,
    phases: [
      { label: 'Coursework', icon: BookOpen, status: 'done', year: '2022', detail: 'Distributed systems and cryptography coursework.' },
      { label: 'Literature Review', icon: FileText, status: 'done', year: '2022–2023', detail: 'In-depth review of federated learning & Byzantine attacks.' },
      { label: 'Research & Experiments', icon: FlaskConical, status: 'active', year: '2023–2024', detail: 'Protocol prototyped; 1 paper accepted at IEEE ICDCS.' },
      { label: 'Thesis Writing', icon: FileText, status: 'pending', year: '2025 Q1', detail: 'Writing to begin Q1 2025.' },
      { label: 'Defense', icon: Award, status: 'pending', year: '2025 Q4', detail: 'Final defense expected end of 2025.' },
    ],
  },
];

const defaultTeamColors = new Map([['ISAI', '#1a5c6b'], ['BIG', '#7c4d8a'], ['HCI', '#b85c38'], ['DEC', '#2d6a4f']]);

const statusConfig = {
  done:    { icon: CheckCircle2, label: 'Completed', color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)',  border: 'rgba(45,106,79,0.3)' },
  active:  { icon: Loader,       label: 'In Progress', color: '#c9a84c', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.4)' },
  pending: { icon: Circle,       label: 'Upcoming',   color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' },
};

// Progress bar — animates in when card becomes visible
function ProgressBar({ progress, color }) {
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-1.5 w-full rounded-full overflow-hidden"
         style={{ background: 'var(--color-surface-alt)' }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: animated ? `${progress}%` : '0%',
          background: `linear-gradient(to right, ${color}, ${color}aa)`,
        }}
      />
    </div>
  );
}

// Individual PhD card
const PhDCard = memo(function PhDCard({ student, teamColorMap }) {
  const [expanded, setExpanded] = useState(false);
  const color = teamColorMap.get(student.team) ?? defaultTeamColors.get(student.team) ?? '#6b7280';

  const progress = useMemo(() => {
    const done  = student.phases.filter(p => p.status === 'done').length;
    const total = student.phases.length;
    const active = student.phases.find(p => p.status === 'active') ? 0.5 : 0;
    return Math.round(((done + active) / total) * 100);
  }, [student.phases]);

  const yearsIn = new Date().getFullYear() - student.startYear;

  return (
    <article
      className="rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Color top bar */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                 style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm leading-snug" style={{ color: 'var(--color-ink)' }}>
                {student.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {student.supervisor}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${color}18`, color }}>
            {student.team}
          </span>
        </div>

        {/* Topic */}
        <p className="text-xs italic leading-relaxed mb-4"
           style={{ color: 'var(--color-muted)', borderLeft: `2px solid ${color}`, paddingLeft: '8px' }}>
          "{student.topic}"
        </p>

        {/* Progress bar + stats */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
              Progress
            </span>
            <span className="text-xs font-bold" style={{ color }}>
              {progress}%
            </span>
          </div>
          <ProgressBar progress={progress} color={color} />
        </div>

        {/* Meta stats */}
        <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>Year {yearsIn} of PhD</span>
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap size={11} />
            <span>Expected {student.expectedEnd}</span>
          </div>
        </div>

        {/* Toggle timeline button */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full text-xs font-semibold py-2 rounded transition-all duration-200 hover:opacity-80"
          style={{ background: `${color}12`, color }}
        >
          {expanded ? '▲ Hide Timeline' : '▼ View Phase Timeline'}
        </button>

        {/* Expandable timeline */}
        {expanded && (
          <div className="mt-4 space-y-0 animate-fade-in">
            {student.phases.map((phase, i) => {
              const cfg = statusConfig[phase.status];
              const StatusIcon = cfg.icon;
              const PhaseIcon = phase.icon;
              const isLast = i === student.phases.length - 1;

              return (
                <div key={phase.label} className="flex gap-3">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                      <StatusIcon size={12} style={{ color: cfg.color }} />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 my-1" style={{ background: 'var(--color-surface-alt)', minHeight: '20px' }} />
                    )}
                  </div>

                  {/* Phase content */}
                  <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <PhaseIcon size={11} style={{ color: cfg.color, flexShrink: 0 }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-ink)' }}>
                        {phase.label}
                      </span>
                      <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                        {phase.year}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
                      {phase.detail}
                    </p>
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color, fontSize: '10px' }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
});

export default function PhDTracker() {
  const { collections } = usePublicData();
  const teamColorMap = useMemo(
    () => new Map((collections?.teams ?? []).map(t => [t.acronym, t.color])),
    [collections?.teams],
  );

  return (
    <section id="phd-tracker" className="py-24 px-6" style={{ background: 'var(--color-ink)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            Innovation
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'white' }}>
              PhD Progress Tracker
            </h2>
            <p className="text-base max-w-sm text-right" style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
              A live overview of each doctoral researcher's journey from coursework to defense.
            </p>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-10 flex-wrap">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <Icon size={12} style={{ color: cfg.color }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {phdStudents.map(student => (
            <PhDCard key={student.id} student={student} teamColorMap={teamColorMap} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs mt-10" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Timelines are indicative and updated each semester by team leaders.
        </p>
      </div>
    </section>
  );
}
