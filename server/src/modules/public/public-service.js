import {
  faculty,
  gallery,
  news,
  projects,
  publications,
  researchAxes,
  teams,
} from "../../../../shared/src/mockData.js";

import { AppError } from "../../utils/app-error.js";

const roleOrder = ["Professor", "Doctor", "PhD Student"];
const facultyLookup = new Map(faculty.map((member) => [member.name, member]));
const axisById = new Map(researchAxes.map((axis) => [axis.id, axis]));
const teamByAcronym = new Map(teams.map((team) => [team.acronym, team]));
const teamBySlug = new Map(teams.map((team) => [team.slug, team]));

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function serializeAxisSummary(axis) {
  if (!axis) {
    return null;
  }

  return {
    id: axis.id,
    name: axis.name,
    shortLabel: axis.shortLabel,
    accent: axis.accent,
    summary: axis.summary,
  };
}

function serializeTeamSummary(team) {
  if (!team) {
    return null;
  }

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    acronym: team.acronym,
    color: team.color,
    leader: team.leader,
  };
}

function matchesIdentifier(record, identifier) {
  return String(record.id) === identifier || record.slug === identifier;
}

function matchesOptionalText(value, filterValue) {
  if (!filterValue) {
    return true;
  }

  return normalizeText(value).includes(normalizeText(filterValue));
}

function matchesOptionalArray(values, filterValue) {
  if (!filterValue) {
    return true;
  }

  const normalizedFilter = normalizeText(filterValue);
  return values.some((value) => normalizeText(value) === normalizedFilter);
}

function matchesOptionalTeamFilter({ team, teamSlug, teamTag }, filterValue) {
  if (!filterValue) {
    return true;
  }

  const normalizedFilter = normalizeText(filterValue);

  return [
    team?.slug,
    team?.acronym,
    team?.name,
    teamSlug,
    teamTag,
  ]
    .filter(Boolean)
    .some((value) => normalizeText(value) === normalizedFilter);
}

function fallbackTitle(member, team) {
  if (member.role === "Professor") {
    return member.name === team.leader ? "Professor & Team Lead" : "Professor";
  }

  return member.role === "Doctor" ? "Doctoral Researcher" : "PhD Student Researcher";
}

const memberRecords = teams
  .flatMap((team) => {
    const axis = axisById.get(team.axisId);
    const publicationCount = publications.filter((publication) => publication.teamTag === team.acronym).length;

    return team.members.map((member) => {
      const facultyProfile = facultyLookup.get(member.name);

      return {
        slug: slugify(member.name),
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        title: facultyProfile?.title ?? fallbackTitle(member, team),
        expertise: facultyProfile?.expertise ?? team.themes.slice(0, 2).join(", "),
        team: serializeTeamSummary(team),
        axis: serializeAxisSummary(axis),
        themes: team.themes,
        projectCount: team.projects.length,
        publicationCount,
        isLeader: member.name === team.leader,
      };
    });
  })
  .toSorted((left, right) => {
    const roleDiff = roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role);

    if (roleDiff !== 0) {
      return roleDiff;
    }

    const teamDiff = left.team.name.localeCompare(right.team.name);

    if (teamDiff !== 0) {
      return teamDiff;
    }

    return left.name.localeCompare(right.name);
  });

const teamSummaryRecords = teams.map((team) => {
  const axis = axisById.get(team.axisId);
  const memberCounts = roleOrder.reduce((counts, role) => {
    counts[role] = team.members.filter((member) => member.role === role).length;
    return counts;
  }, {});

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    acronym: team.acronym,
    leader: team.leader,
    summary: team.summary,
    focus: team.focus,
    themes: team.themes,
    color: team.color,
    axis: serializeAxisSummary(axis),
    memberCounts,
    memberCount: team.members.length,
    projectCount: team.projects.length,
    publicationCount: team.publications,
  };
});

const projectRecords = projects.map((project) => {
  const team = project.teamTag ? teamByAcronym.get(project.teamTag) : teamBySlug.get(project.teamSlug);

  return {
    ...project,
    team: serializeTeamSummary(team),
    axis: serializeAxisSummary(axisById.get(project.axisId)),
  };
});

const publicationRecords = publications.map((publication) => ({
  ...publication,
  team: serializeTeamSummary(teamByAcronym.get(publication.teamTag)),
}));

const newsRecords = news.map((item) => ({
  ...item,
  teams: (item.teamTags ?? [])
    .map((teamTag) => serializeTeamSummary(teamByAcronym.get(teamTag)))
    .filter(Boolean),
}));

const galleryRecords = gallery
  .map((item) => ({
    ...item,
    team: item.teamTag ? serializeTeamSummary(teamByAcronym.get(item.teamTag)) : null,
  }))
  .toSorted((left, right) => new Date(right.dateIso) - new Date(left.dateIso));

function filterTeams(filters = {}) {
  return teamSummaryRecords.filter((team) => {
    const matchesQuery = filters.query
      ? [team.name, team.summary, team.focus, team.acronym].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesAxis = filters.axis
      ? [team.axis?.id, team.axis?.name].filter(Boolean).some((value) => normalizeText(value) === normalizeText(filters.axis))
      : true;
    const matchesTheme = matchesOptionalArray(team.themes, filters.theme);

    return matchesQuery && matchesAxis && matchesTheme;
  });
}

function filterMembers(filters = {}) {
  return memberRecords.filter((member) => {
    const matchesQuery = filters.query
      ? [member.name, member.title, member.expertise].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesRole = filters.role ? member.role === filters.role : true;
    const matchesTeam = matchesOptionalTeamFilter({ team: member.team }, filters.team);
    const matchesTheme = matchesOptionalArray(member.themes, filters.theme);

    return matchesQuery && matchesRole && matchesTeam && matchesTheme;
  });
}

function filterProjects(filters = {}) {
  return projectRecords.filter((project) => {
    const matchesQuery = filters.query
      ? [project.title, project.summary, project.lead, project.milestone].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesTeam = matchesOptionalTeamFilter(project, filters.team);
    const matchesStatus = filters.status ? normalizeText(project.status) === normalizeText(filters.status) : true;
    const matchesTheme = matchesOptionalArray(project.themes, filters.theme);
    const matchesYear = filters.year ? Number(project.year) === Number(filters.year) : true;

    return matchesQuery && matchesTeam && matchesStatus && matchesTheme && matchesYear;
  });
}

function filterPublications(filters = {}) {
  return publicationRecords.filter((publication) => {
    const matchesQuery = filters.query
      ? [publication.title, publication.abstract, publication.publisher, publication.journal].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesTeam = matchesOptionalTeamFilter(publication, filters.team);
    const matchesYear = filters.year ? Number(publication.year) === Number(filters.year) : true;
    const matchesPublisher = matchesOptionalText(publication.publisher, filters.publisher);
    const matchesAuthor = filters.author
      ? publication.authors.some((author) => normalizeText(author).includes(normalizeText(filters.author)))
      : true;
    const matchesTheme = matchesOptionalArray(publication.themes, filters.theme);

    return (
      matchesQuery &&
      matchesTeam &&
      matchesYear &&
      matchesPublisher &&
      matchesAuthor &&
      matchesTheme
    );
  });
}

function filterNews(filters = {}) {
  return newsRecords.filter((item) => {
    const matchesQuery = filters.query
      ? [item.headline, item.excerpt, ...(item.body ?? [])].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesCategory = filters.category ? normalizeText(item.category) === normalizeText(filters.category) : true;
    const matchesTeam = filters.team
      ? (item.teams ?? []).some((team) => matchesOptionalTeamFilter({ team }, filters.team))
      : true;
    const matchesYear = filters.year ? item.dateIso.startsWith(String(filters.year)) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });
}

function filterGallery(filters = {}) {
  return galleryRecords.filter((item) => {
    const matchesQuery = filters.query
      ? [item.title, item.caption].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesCategory = filters.category ? normalizeText(item.category) === normalizeText(filters.category) : true;
    const matchesTeam = matchesOptionalTeamFilter(item, filters.team);
    const matchesYear = filters.year ? item.dateIso.startsWith(String(filters.year)) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });
}

function buildMeta(records, filters) {
  return {
    count: records.length,
    filters,
  };
}

function getByIdentifier(records, identifier, entityLabel) {
  const record = records.find((entry) => matchesIdentifier(entry, identifier));

  if (!record) {
    throw new AppError(`${entityLabel} was not found.`, {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return record;
}

export function listPublicTeams(filters = {}) {
  const records = filterTeams(filters);
  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export function getPublicTeam(identifier) {
  const team = getByIdentifier(teams, identifier, "Team");
  const relatedAxis = axisById.get(team.axisId);
  const relatedProjects = projectRecords.filter((project) => project.team?.acronym === team.acronym);
  const relatedPublications = publicationRecords.filter((publication) => publication.team?.acronym === team.acronym);
  const relatedNews = newsRecords.filter((item) =>
    (item.teams ?? []).some((entry) => entry.acronym === team.acronym),
  );

  return {
    data: {
      ...team,
      axis: serializeAxisSummary(relatedAxis),
      relatedProjects,
      relatedPublications,
      relatedNews,
    },
  };
}

export function listPublicMembers(filters = {}) {
  const records = filterMembers(filters);
  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export function getPublicMember(identifier) {
  const member = getByIdentifier(memberRecords, identifier, "Member");
  const relatedProjects = projectRecords.filter((project) => project.team?.slug === member.team.slug);
  const relatedPublications = publicationRecords.filter((publication) => publication.team?.slug === member.team.slug);

  return {
    data: {
      ...member,
      relatedProjects,
      relatedPublications,
    },
  };
}

export function getGroupedPublicMembers(filters = {}) {
  const records = filterMembers(filters);
  const byRole = roleOrder.map((role) => ({
    key: role,
    label: role,
    count: records.filter((member) => member.role === role).length,
    members: records.filter((member) => member.role === role),
  }));
  const byTeam = teamSummaryRecords.map((team) => ({
    key: team.slug,
    label: team.name,
    team,
    count: records.filter((member) => member.team.slug === team.slug).length,
    members: records.filter((member) => member.team.slug === team.slug),
  }));

  return {
    data: {
      byRole,
      byTeam,
    },
    meta: buildMeta(records, filters),
  };
}

export function listPublicProjects(filters = {}) {
  const records = filterProjects(filters);
  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export function getPublicProject(identifier) {
  const project = getByIdentifier(projectRecords, identifier, "Project");
  const relatedPublications = publicationRecords.filter(
    (publication) => publication.team?.acronym === project.team?.acronym,
  );

  return {
    data: {
      ...project,
      relatedPublications,
    },
  };
}

export function listPublicPublications(filters = {}) {
  const records = filterPublications(filters);
  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export function getPublicPublication(identifier) {
  const publication = getByIdentifier(publicationRecords, identifier, "Publication");
  const relatedProjects = projectRecords.filter(
    (project) => project.team?.acronym === publication.team?.acronym,
  );
  const relatedPublications = publicationRecords.filter(
    (entry) => entry.team?.acronym === publication.team?.acronym && entry.slug !== publication.slug,
  );

  return {
    data: {
      ...publication,
      relatedProjects,
      relatedPublications,
    },
  };
}

export function listPublicNews(filters = {}) {
  const records = filterNews(filters);
  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export function getPublicNewsItem(identifier) {
  const item = getByIdentifier(newsRecords, identifier, "News item");
  const relatedPublications = publicationRecords.filter((publication) =>
    item.teams.some((team) => team.acronym === publication.team?.acronym),
  );

  return {
    data: {
      ...item,
      relatedPublications,
    },
  };
}

export function listPublicGallery(filters = {}) {
  const records = filterGallery(filters);
  const limit = toNumber(filters.limit);
  const offset = toNumber(filters.offset) ?? 0;
  const slicedRecords =
    limit === null ? records.slice(offset) : records.slice(offset, offset + limit);

  return {
    data: slicedRecords,
    meta: {
      ...buildMeta(slicedRecords, filters),
      total: records.length,
      offset,
      limit,
    },
  };
}

export function getPublicGalleryItem(identifier) {
  return {
    data: getByIdentifier(galleryRecords, identifier, "Gallery item"),
  };
}
