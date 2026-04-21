import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_OPTIONS = [
  { id: 'publications-year', label: 'Publications by Year', type: 'bar' },
  { id: 'content-distribution', label: 'Content Distribution', type: 'pie' },
  { id: 'news-category', label: 'News by Category', type: 'bar' },
  { id: 'projects-status', label: 'Projects by Status', type: 'pie' },
  { id: 'members-team', label: 'Members by Team', type: 'bar' },
];

const COLORS = {
  teal: '#1a9a9a',
  gold: '#c9a84c',
  rust: '#b85450',
  ink: '#0d1117',
  slate: '#4a5568',
  muted: '#6b7280',
};

const PIE_COLORS = [COLORS.teal, COLORS.gold, COLORS.rust, COLORS.slate, COLORS.muted];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: 'rgba(13, 17, 23, 0.95)',
        borderColor: 'rgba(201, 168, 76, 0.3)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.gold }}>
        {label}
      </p>
      <p className="mt-1 text-sm text-white">
        {payload[0].value} {payload[0].name || 'items'}
      </p>
    </div>
  );
}

function PublicationsByYearChart({ publications }) {
  const data = useMemo(() => {
    const yearCounts = {};
    publications.forEach((p) => {
      const year = p.year || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [publications]);

  if (!data.length) {
    return <p className="admin-body-copy">No publication data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="year"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="count" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ContentDistributionChart({ teams, members, projects, publications, news, gallery }) {
  const data = useMemo(() => [
    { name: 'Teams', value: teams.length },
    { name: 'Members', value: members.length },
    { name: 'Projects', value: projects.length },
    { name: 'Publications', value: publications.length },
    { name: 'News', value: news.length },
    { name: 'Gallery', value: gallery.length },
  ], [teams, members, projects, publications, news, gallery]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function NewsByCategoryChart({ news }) {
  const data = useMemo(() => {
    const categoryCounts = {};
    news.forEach((n) => {
      const cat = n.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [news]);

  if (!data.length) {
    return <p className="admin-body-copy">No news data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
        <XAxis
          type="number"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="count" fill={COLORS.teal} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ProjectsByStatusChart({ projects }) {
  const data = useMemo(() => {
    const statusCounts = {};
    projects.forEach((p) => {
      const status = p.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  if (!data.length) {
    return <p className="admin-body-copy">No project data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MembersByTeamChart({ teams, members }) {
  const data = useMemo(() => {
    const teamMemberCounts = {};
    members.forEach((m) => {
      if (m.team?.acronym) {
        teamMemberCounts[m.team.acronym] = (teamMemberCounts[m.team.acronym] || 0) + 1;
      }
    });
    return teams
      .map((team) => ({
        team: team.acronym,
        members: teamMemberCounts[team.acronym] || 0,
      }))
      .filter((d) => d.members > 0)
      .sort((a, b) => b.members - a.members);
  }, [teams, members]);

  if (!data.length) {
    return <p className="admin-body-copy">No member data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="team"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="members" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminDashboardCharts({ collections }) {
  const [selectedChart, setSelectedChart] = useState(CHART_OPTIONS[0].id);
  const { teams = [], members = [], projects = [], publications = [], news = [], gallery = [] } = collections;

  const renderChart = () => {
    switch (selectedChart) {
      case 'publications-year':
        return <PublicationsByYearChart publications={publications} />;
      case 'content-distribution':
        return <ContentDistributionChart {...{ teams, members, projects, publications, news, gallery }} />;
      case 'news-category':
        return <NewsByCategoryChart news={news} />;
      case 'projects-status':
        return <ProjectsByStatusChart projects={projects} />;
      case 'members-team':
        return <MembersByTeamChart teams={teams} members={members} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-chart-container">
      <div className="admin-chart-selector">
        <select
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
          className="admin-chart-select"
        >
          {CHART_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-chart-wrapper">
        {renderChart()}
      </div>
    </div>
  );
}