import { useState, useMemo } from 'react';
import { Search, Filter, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { PublicPageError, PublicPageLoading } from '../components/site/PublicAsyncState';
import { usePublicData } from '../providers/usePublicData.js';

const statusColors = {
  'Pending': { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', label: 'Pending' },
  'In Progress': { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', label: 'In Progress' },
  'Completed': { bg: 'rgba(16,185,129,0.1)', text: '#10b981', label: 'Completed' },
  'Deferred': { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'Deferred' },
};

const milestoneTypeLabels = {
  Coursework: 'Coursework',
  Qualifying: 'Qualifying Exam',
  Comprehensive: 'Comprehensive Exam',
  Proposal: 'Proposal Defense',
  Research: 'Research',
  Defense: 'Final Defense',
  Other: 'Other',
};

function formatDate(dateString) {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ProgressCard({ record, onNavigate }) {
  const status = statusColors[record.status] || statusColors.Pending;
  const milestoneLabel = milestoneTypeLabels[record.milestoneType] || record.milestoneType;

  const StatusIcon = {
    'Pending': Circle,
    'In Progress': Clock,
    'Completed': CheckCircle,
    'Deferred': AlertCircle,
  }[record.status] || Circle;

  return (
    <article 
      className="p-5 rounded-sm transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span 
          className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ background: status.bg, color: status.text }}
        >
          <StatusIcon size={10} className="inline mr-1" />
          {status.label}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          {formatDate(record.dueDate)}
        </span>
      </div>

      <div className="mb-2">
        <span 
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-gold-dark)' }}
        >
          {milestoneLabel}
        </span>
      </div>

      <h3 
        className="font-display text-base font-semibold leading-snug mb-2 group-hover:text-teal-700 transition-colors duration-200"
        style={{ color: 'var(--color-ink)' }}
      >
        {record.title}
      </h3>

      {record.member && (
        <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
          {record.member.name}
        </p>
      )}

      {record.team && (
        <span 
          className="inline-block text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mt-2"
          style={{ background: 'rgba(26,92,107,0.1)', color: 'var(--color-teal)' }}
        >
          {record.team.acronym}
        </span>
      )}

      {record.status === 'Completed' && record.completedAt && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Completed: {formatDate(record.completedAt)}
          </p>
        </div>
      )}
    </article>
  );
}

export default function PhdProgressPage({ onNavigate }) {
  const { collections, error, hasLoaded, isLoading, retry } = usePublicData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { phdProgress: records } = collections || {};

  const filtered = useMemo(() => {
    if (!records || !Array.isArray(records)) return [];
    return records.filter(r => {
      const matchesQuery = !query || 
        r.title?.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase()) ||
        r.member?.name?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, statusFilter]);

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Deferred'];

  if (!hasLoaded && isLoading) {
    return (
      <PublicPageLoading
        eyebrow="PhD Progress"
        title="Loading the progress records."
        description="The page is fetching PhD milestone data from the public API."
      />
    );
  }

  if (!hasLoaded && error) {
    return (
      <PublicPageError
        title="The progress records could not load."
        description="This page needs the public API to return PhD progress data."
        error={error}
        onRetry={retry}
      />
    );
  }

  return (
    <section className="py-24 px-6" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-gold)' }}>
            PhD Milestones
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: 'var(--color-ink)' }}>
              PhD Progress
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {filtered.length} milestones
            </p>
          </div>
          <div className="h-px" style={{ background: 'linear-gradient(to right, var(--color-gold), transparent)' }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, student, or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-sm outline-none transition-all duration-200"
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                color: 'var(--color-ink)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} style={{ color: 'var(--color-muted)' }} />
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide transition-all duration-200"
                style={{
                  background: statusFilter === status ? 'var(--color-teal)' : 'white',
                  color: statusFilter === status ? 'white' : 'var(--color-muted)',
                  border: '1px solid',
                  borderColor: statusFilter === status ? 'var(--color-teal)' : 'rgba(0,0,0,0.08)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(record => (
            <ProgressCard key={record.id || record.slug} record={record} onNavigate={onNavigate} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--color-muted)' }}>
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              <p>No progress records match your search.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}