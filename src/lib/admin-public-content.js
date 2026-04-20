export const ADMIN_PUBLIC_CONTENT_EVENTS = [
  'research-lab:admin-team-drafts:change',
  'research-lab:admin-member-drafts:change',
  'research-lab:admin-project-drafts:change',
  'research-lab:admin-publication-drafts:change',
  'research-lab:admin-news-drafts:change',
  'research-lab:admin-gallery-drafts:change',
];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function serializeAxis(axisId, axisById) {
  const axis = axisById.get(axisId);

  if (!axis) {
    return null;
  }

  return {
    accent: axis.accent,
    id: axis.id,
    name: axis.name,
    shortLabel: axis.shortLabel,
    summary: axis.summary,
  };
}

function createFallbackTeamSummary(teamSlug = '') {
  return {
    acronym: 'TBD',
    color: '#1a5c6b',
    focus: '',
    id: teamSlug || 'unassigned-team',
    leader: 'Unassigned leader',
    name: 'Unassigned team',
    slug: teamSlug || 'unassigned-team',
    summary: '',
  };
}

function normalizeTeamRecord(record, axisById) {
  const axisId = normalizeText(record.axisId ?? record.axis?.id);

  return {
    acronym: normalizeText(record.acronym).toUpperCase(),
    axisId,
    color: normalizeText(record.color) || axisById.get(axisId)?.accent || '#1a5c6b',
    id: String(record.id ?? record.slug),
    leader: normalizeText(record.leader),
    memberCounts: record.memberCounts ?? { Doctor: 0, 'PhD Student': 0, Professor: 0 },
    name: normalizeText(record.name),
    slug: normalizeText(record.slug),
    status: normalizeText(record.status) || 'active',
    summary: normalizeText(record.summary ?? record.description),
    themes: parseList(record.themes),
    focus: normalizeText(record.focus ?? record.researchFocus),
  };
}

function normalizeMemberRecord(record) {
  const explicitTeamSlugs = Array.isArray(record.teamSlugs) ? record.teamSlugs.filter(Boolean) : [];
  const derivedTeamSlugs = record.team?.slug
    ? [record.team.slug]
    : record.primaryTeamSlug
      ? [record.primaryTeamSlug]
      : record.teamSlug
        ? [record.teamSlug]
        : [];
  const teamSlugs = explicitTeamSlugs.length ? explicitTeamSlugs : derivedTeamSlugs;

  return {
    avatar: normalizeText(record.avatar) || normalizeText(record.name ?? record.fullName).slice(0, 2).toUpperCase(),
    email: normalizeText(record.email),
    expertise: normalizeText(record.expertise ?? record.bio),
    id: String(record.id ?? record.slug),
    isLeader: Boolean(record.isLeader),
    name: normalizeText(record.name ?? record.fullName),
    primaryTeamSlug: normalizeText(record.primaryTeamSlug ?? record.team?.slug ?? record.teamSlug ?? teamSlugs[0] ?? ''),
    role: normalizeText(record.role),
    slug: normalizeText(record.slug),
    teamSlugs,
    themes: parseList(record.themes),
    title: normalizeText(record.title ?? record.academicTitle),
  };
}

function normalizeProjectRecord(record) {
  return {
    axisId: normalizeText(record.axisId ?? record.axis?.id),
    id: String(record.id ?? record.slug),
    lead: normalizeText(record.lead),
    leadMemberSlug: normalizeText(record.leadMemberSlug),
    milestone: normalizeText(record.milestone),
    phdLinked: Boolean(record.phdLinked),
    slug: normalizeText(record.slug),
    status: normalizeText(record.status),
    summary: normalizeText(record.summary ?? record.description),
    teamSlug: normalizeText(record.teamSlug ?? record.team?.slug),
    themes: parseList(record.themes),
    title: normalizeText(record.title),
    year: Number(record.year) || new Date().getFullYear(),
  };
}

function normalizePublicationRecord(record) {
  const authors = Array.isArray(record.authors)
    ? record.authors.map((author) => (typeof author === 'string' ? author : normalizeText(author?.displayName))).filter(Boolean)
    : parseList(record.authors);

  return {
    abstract: normalizeText(record.abstract),
    authors,
    citations: Number(record.citations) || 0,
    doi: normalizeText(record.doi),
    entryType: normalizeText(record.entryType) || 'article',
    id: String(record.id ?? record.slug),
    journal: normalizeText(record.journal),
    pdfLink: normalizeText(record.pdfLink) || '#',
    publisher: normalizeText(record.publisher),
    slug: normalizeText(record.slug),
    status: normalizeText(record.status) || 'Published',
    teamSlug: normalizeText(record.teamSlug ?? record.team?.slug),
    themes: parseList(record.themes),
    title: normalizeText(record.title),
    year: Number(record.year) || new Date().getFullYear(),
  };
}

function normalizeNewsRecord(record, teamSlugByAcronym) {
  const explicitTeamSlugs = Array.isArray(record.teamSlugs) ? record.teamSlugs.filter(Boolean) : [];
  const derivedTeamSlugs = Array.isArray(record.teams) && record.teams.length
    ? record.teams.map((team) => team.slug).filter(Boolean)
    : Array.isArray(record.teamTags)
      ? record.teamTags.map((teamTag) => teamSlugByAcronym.get(teamTag) ?? '').filter(Boolean)
      : [];

  return {
    body: Array.isArray(record.body) ? record.body.filter(Boolean) : parseList(record.body),
    category: normalizeText(record.category),
    dateIso: normalizeText(record.dateIso),
    excerpt: normalizeText(record.excerpt),
    headline: normalizeText(record.headline),
    id: String(record.id ?? record.slug),
    image: normalizeText(record.image),
    slug: normalizeText(record.slug),
    status: normalizeText(record.status) || 'Published',
    teamSlugs: explicitTeamSlugs.length ? explicitTeamSlugs : derivedTeamSlugs,
  };
}

function normalizeGalleryRecord(record, teamSlugByAcronym) {
  const teamSlug = normalizeText(
    record.teamSlug ??
      record.team?.slug ??
      (record.teamTag ? teamSlugByAcronym.get(record.teamTag) : ''),
  );

  return {
    caption: normalizeText(record.caption),
    category: normalizeText(record.category),
    dateIso: normalizeText(record.dateIso),
    id: String(record.id ?? record.slug),
    image: normalizeText(record.image),
    slug: normalizeText(record.slug),
    status: normalizeText(record.status) || 'Published',
    teamSlug,
    title: normalizeText(record.title),
  };
}

function formatDisplayDate(dateIso) {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function createTeamSummary(team) {
  return {
    acronym: team.acronym,
    color: team.color,
    id: team.id,
    leader: team.leader,
    name: team.name,
    slug: team.slug,
  };
}

function createBridgedMeta(records) {
  return {
    count: records.length,
    source: 'admin-bridged',
  };
}

export function buildBridgedPublicData(baseCollections, researchAxes = []) {
  const axisById = new Map((researchAxes ?? []).map((axis) => [axis.id, axis]));

  const sourceCollections = {
    gallery: baseCollections?.gallery ?? [],
    members: baseCollections?.members ?? [],
    news: baseCollections?.news ?? [],
    projects: baseCollections?.projects ?? [],
    publications: baseCollections?.publications ?? [],
    teams: baseCollections?.teams ?? [],
  };

  const normalizedTeams = sourceCollections.teams
    .map((record) => normalizeTeamRecord(record, axisById));
  const teamSlugByAcronym = new Map(normalizedTeams.map((team) => [team.acronym, team.slug]));
  const normalizedMembers = sourceCollections.members
    .map((record) => normalizeMemberRecord(record));
  const normalizedProjects = sourceCollections.projects
    .map((record) => normalizeProjectRecord(record));
  const normalizedPublications = sourceCollections.publications
    .map((record) => normalizePublicationRecord(record));
  const normalizedNews = sourceCollections.news
    .map((record) => normalizeNewsRecord(record, teamSlugByAcronym));
  const normalizedGallery = sourceCollections.gallery
    .map((record) => normalizeGalleryRecord(record, teamSlugByAcronym));

  const publicTeams = normalizedTeams.map((team) => {
    const axis = serializeAxis(team.axisId, axisById);
    const membersForTeam = normalizedMembers.filter((member) => member.teamSlugs.includes(team.slug));
    const projectsForTeam = normalizedProjects.filter((project) => project.teamSlug === team.slug);
    const publicationsForTeam = normalizedPublications.filter((publication) => publication.teamSlug === team.slug);

    const derivedRoleCounts = membersForTeam.reduce(
      (counts, member) => ({
        ...counts,
        [member.role]: (counts[member.role] ?? 0) + 1,
      }),
      { Doctor: 0, 'PhD Student': 0, Professor: 0 },
    );

    return {
      acronym: team.acronym,
      axis,
      axisId: team.axisId,
      color: team.color,
      focus: team.focus,
      id: team.id,
      leader: team.leader,
      memberCount: membersForTeam.length,
      memberCounts: derivedRoleCounts,
      name: team.name,
      projectCount: projectsForTeam.length,
      publicationCount: publicationsForTeam.length,
      slug: team.slug,
      status: team.status,
      summary: team.summary,
      themes: team.themes,
    };
  });
  const publicTeamBySlug = new Map(publicTeams.map((team) => [team.slug, team]));

  const publicMembers = normalizedMembers.map((member) => {
    const primaryTeam = publicTeamBySlug.get(member.primaryTeamSlug)
      ?? publicTeamBySlug.get(member.teamSlugs[0])
      ?? createFallbackTeamSummary(member.primaryTeamSlug);
    const projectCount = normalizedProjects.filter((project) => member.teamSlugs.includes(project.teamSlug)).length;
    const publicationCount = normalizedPublications.filter((publication) => member.teamSlugs.includes(publication.teamSlug)).length;

    return {
      avatar: member.avatar,
      axis: serializeAxis(primaryTeam.axisId, axisById),
      expertise: member.expertise,
      isLeader: member.isLeader || member.name === primaryTeam.leader,
      name: member.name,
      projectCount,
      publicationCount,
      role: member.role,
      slug: member.slug,
      team: createTeamSummary(primaryTeam),
      teamSlugs: member.teamSlugs,
      themes: member.themes,
      title: member.title,
    };
  });

  const publicProjects = normalizedProjects.map((project) => {
    const team = publicTeamBySlug.get(project.teamSlug) ?? createFallbackTeamSummary(project.teamSlug);
    const axisId = project.axisId || team.axisId;

    return {
      axis: serializeAxis(axisId, axisById),
      axisId,
      id: project.id,
      lead: project.lead,
      leadMemberSlug: project.leadMemberSlug,
      milestone: project.milestone,
      phdLinked: project.phdLinked,
      slug: project.slug,
      status: project.status,
      summary: project.summary,
      team: createTeamSummary(team),
      teamSlug: team.slug,
      teamTag: team.acronym,
      themes: project.themes,
      title: project.title,
      year: project.year,
    };
  });

  const publicPublications = normalizedPublications.map((publication) => {
    const team = publicTeamBySlug.get(publication.teamSlug) ?? createFallbackTeamSummary(publication.teamSlug);

    return {
      abstract: publication.abstract,
      authors: publication.authors,
      citations: publication.citations,
      doi: publication.doi,
      entryType: publication.entryType,
      id: publication.id,
      journal: publication.journal,
      pdfLink: publication.pdfLink,
      publisher: publication.publisher,
      slug: publication.slug,
      status: publication.status,
      team: createTeamSummary(team),
      teamSlug: team.slug,
      teamTag: team.acronym,
      themes: publication.themes,
      title: publication.title,
      year: publication.year,
    };
  });

  const publicNews = normalizedNews.map((item) => {
    const teams = item.teamSlugs
      .map((teamSlug) => publicTeamBySlug.get(teamSlug))
      .filter(Boolean)
      .map((team) => createTeamSummary(team));

    return {
      body: item.body,
      category: item.category,
      date: formatDisplayDate(item.dateIso),
      dateIso: item.dateIso,
      excerpt: item.excerpt,
      headline: item.headline,
      id: item.id,
      image: item.image,
      slug: item.slug,
      status: item.status,
      teamSlugs: item.teamSlugs,
      teamTags: teams.map((team) => team.acronym),
      teams,
    };
  });

  const publicGallery = normalizedGallery.map((item) => {
    const team = item.teamSlug ? publicTeamBySlug.get(item.teamSlug) ?? null : null;

    return {
      caption: item.caption,
      category: item.category,
      date: formatDisplayDate(item.dateIso),
      dateIso: item.dateIso,
      id: item.id,
      image: item.image,
      slug: item.slug,
      status: item.status,
      team: team ? createTeamSummary(team) : null,
      teamSlug: team?.slug ?? '',
      teamTag: team?.acronym ?? '',
      title: item.title,
    };
  });

  return {
    collections: {
      gallery: publicGallery,
      members: publicMembers,
      news: publicNews,
      projects: publicProjects,
      publications: publicPublications,
      teams: publicTeams,
    },
    meta: {
      gallery: createBridgedMeta(publicGallery),
      members: createBridgedMeta(publicMembers),
      news: createBridgedMeta(publicNews),
      projects: createBridgedMeta(publicProjects),
      publications: createBridgedMeta(publicPublications),
      teams: createBridgedMeta(publicTeams),
    },
  };
}
