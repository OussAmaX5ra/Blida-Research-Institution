import { GalleryItem } from "../../models/gallery-item.js";
import { Member } from "../../models/member.js";
import { NewsItem } from "../../models/news-item.js";
import { Project } from "../../models/project.js";
import { Publication } from "../../models/publication.js";
import { SiteConfig } from "../../models/site-config.js";
import { Team } from "../../models/team.js";
import { AppError } from "../../utils/app-error.js";

const roleOrder = ["Professor", "Doctor", "PhD Student"];

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

function formatDisplayDate(dateIso) {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function serializeAxisSummary(axis) {
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

function serializeTeamSummary(team) {
  if (!team) {
    return null;
  }

  return {
    acronym: team.acronym,
    color: team.color,
    id: team.id,
    leader: team.leader,
    name: team.name,
    slug: team.slug,
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

  return [team?.slug, team?.acronym, team?.name, teamSlug, teamTag]
    .filter(Boolean)
    .some((value) => normalizeText(value) === normalizedFilter);
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
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  return record;
}

async function loadPublicSourceData() {
  const [siteConfig, teams, members, projects, publications, news, gallery] = await Promise.all([
    SiteConfig.findById("default").lean(),
    Team.find().sort({ name: 1 }).lean(),
    Member.find().sort({ name: 1 }).lean(),
    Project.find().sort({ year: -1, title: 1 }).lean(),
    Publication.find().sort({ year: -1, title: 1 }).lean(),
    NewsItem.find().sort({ dateIso: -1, headline: 1 }).lean(),
    GalleryItem.find().sort({ dateIso: -1, title: 1 }).lean(),
  ]);

  const axes = siteConfig?.researchAxes ?? [];
  const axisById = new Map(axes.map((axis) => [axis.id, axis]));
  const teamBySlug = new Map(
    teams.map((team) => [
      team.slug,
      {
        ...team,
        id: team._id.toString(),
      },
    ]),
  );

  const memberRecords = members
    .map((member) => {
      const normalizedMember = {
        ...member,
        id: member._id.toString(),
      };
      const primaryTeam =
        teamBySlug.get(normalizedMember.primaryTeamSlug) ??
        teamBySlug.get(normalizedMember.teamSlugs?.[0]);
      const axis = primaryTeam ? axisById.get(primaryTeam.axisId) : null;
      const projectCount = projects.filter((project) =>
        normalizedMember.teamSlugs.includes(project.teamSlug),
      ).length;
      const publicationCount = publications.filter((publication) =>
        normalizedMember.teamSlugs.includes(publication.teamSlug),
      ).length;

      return {
        avatar:
          normalizedMember.avatar ??
          normalizedMember.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join(""),
        axis: serializeAxisSummary(axis),
        email: normalizedMember.email ?? "",
        expertise: normalizedMember.expertise,
        id: normalizedMember.id,
        isLeader:
          Boolean(normalizedMember.isLeader) ||
          normalizedMember.name === primaryTeam?.leader,
        name: normalizedMember.name,
        projectCount,
        publicationCount,
        role: normalizedMember.role,
        slug: normalizedMember.slug,
        team: serializeTeamSummary(primaryTeam),
        teamSlugs: normalizedMember.teamSlugs,
        themes: normalizedMember.themes,
        title: normalizedMember.title,
      };
    })
    .toSorted((left, right) => {
      const roleDiff = roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role);

      if (roleDiff !== 0) {
        return roleDiff;
      }

      const teamDiff = (left.team?.name ?? "").localeCompare(right.team?.name ?? "");

      if (teamDiff !== 0) {
        return teamDiff;
      }

      return left.name.localeCompare(right.name);
    });

  const teamSummaryRecords = [...teamBySlug.values()].map((team) => {
    const axis = axisById.get(team.axisId);
    const membersForTeam = memberRecords.filter((member) => member.team?.slug === team.slug);
    const projectsForTeam = projects.filter((project) => project.teamSlug === team.slug);
    const publicationsForTeam = publications.filter(
      (publication) => publication.teamSlug === team.slug,
    );
    const memberCounts = roleOrder.reduce((counts, role) => {
      counts[role] = membersForTeam.filter((member) => member.role === role).length;
      return counts;
    }, {});

    return {
      acronym: team.acronym,
      axis: serializeAxisSummary(axis),
      axisId: team.axisId,
      color: team.color,
      focus: team.focus,
      id: team.id,
      leader: team.leader,
      memberCount: membersForTeam.length,
      memberCounts,
      name: team.name,
      projectCount: projectsForTeam.length,
      publicationCount: publicationsForTeam.length,
      slug: team.slug,
      status: team.status,
      summary: team.summary,
      themes: team.themes,
    };
  });

  const publicTeamBySlug = new Map(teamSummaryRecords.map((team) => [team.slug, team]));

  const projectRecords = projects.map((project) => {
    const team = publicTeamBySlug.get(project.teamSlug);

    return {
      axis: serializeAxisSummary(axisById.get(project.axisId ?? team?.axisId)),
      axisId: project.axisId ?? team?.axisId ?? "",
      id: project._id.toString(),
      lead: project.lead,
      leadMemberSlug: project.leadMemberSlug ?? "",
      milestone: project.milestone,
      phdLinked: Boolean(project.phdLinked),
      slug: project.slug,
      status: project.status,
      summary: project.summary,
      team: serializeTeamSummary(team),
      teamSlug: team?.slug ?? project.teamSlug,
      teamTag: team?.acronym ?? "",
      themes: project.themes,
      title: project.title,
      year: project.year,
    };
  });

  const publicationRecords = publications.map((publication) => {
    const team = publicTeamBySlug.get(publication.teamSlug);

    return {
      abstract: publication.abstract,
      authors: publication.authors,
      citations: publication.citations,
      doi: publication.doi,
      entryType: publication.entryType,
      id: publication._id.toString(),
      journal: publication.journal,
      pdfLink: publication.pdfLink,
      publisher: publication.publisher,
      slug: publication.slug,
      status: publication.status,
      team: serializeTeamSummary(team),
      teamSlug: team?.slug ?? publication.teamSlug,
      teamTag: team?.acronym ?? "",
      themes: publication.themes,
      title: publication.title,
      year: publication.year,
    };
  });

  const newsRecords = news.map((item) => ({
    body: item.body,
    category: item.category,
    date: formatDisplayDate(item.dateIso),
    dateIso: item.dateIso,
    excerpt: item.excerpt,
    headline: item.headline,
    id: item._id.toString(),
    image: item.image,
    slug: item.slug,
    status: item.status,
    teamSlugs: item.teamSlugs,
    teamTags: item.teamSlugs
      .map((teamSlug) => publicTeamBySlug.get(teamSlug)?.acronym ?? "")
      .filter(Boolean),
    teams: item.teamSlugs
      .map((teamSlug) => serializeTeamSummary(publicTeamBySlug.get(teamSlug)))
      .filter(Boolean),
  }));

  const galleryRecords = gallery.map((item) => {
    const team = item.teamSlug ? publicTeamBySlug.get(item.teamSlug) ?? null : null;

    return {
      caption: item.caption,
      category: item.category,
      date: formatDisplayDate(item.dateIso),
      dateIso: item.dateIso,
      id: item._id.toString(),
      image: item.image,
      slug: item.slug,
      status: item.status,
      team: team ? serializeTeamSummary(team) : null,
      teamSlug: team?.slug ?? item.teamSlug ?? "",
      teamTag: team?.acronym ?? "",
      title: item.title,
    };
  });

  return {
    galleryRecords,
    memberRecords,
    newsRecords,
    projectRecords,
    publicationRecords,
    siteConfig: {
      contactInfo: siteConfig?.contactInfo ?? null,
      labInfo: siteConfig?.labInfo ?? null,
      researchAxes: axes,
    },
    teamSummaryRecords,
  };
}

function filterTeams(records, filters = {}) {
  return records.filter((team) => {
    const matchesQuery = filters.query
      ? [team.name, team.summary, team.focus, team.acronym].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesAxis = filters.axis
      ? [team.axis?.id, team.axis?.name]
          .filter(Boolean)
          .some((value) => normalizeText(value) === normalizeText(filters.axis))
      : true;
    const matchesTheme = matchesOptionalArray(team.themes, filters.theme);

    return matchesQuery && matchesAxis && matchesTheme;
  });
}

function filterMembers(records, filters = {}) {
  return records.filter((member) => {
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

function filterProjects(records, filters = {}) {
  return records.filter((project) => {
    const matchesQuery = filters.query
      ? [project.title, project.summary, project.lead, project.milestone].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesTeam = matchesOptionalTeamFilter(project, filters.team);
    const matchesStatus = filters.status
      ? normalizeText(project.status) === normalizeText(filters.status)
      : true;
    const matchesTheme = matchesOptionalArray(project.themes, filters.theme);
    const matchesYear = filters.year ? Number(project.year) === Number(filters.year) : true;

    return matchesQuery && matchesTeam && matchesStatus && matchesTheme && matchesYear;
  });
}

function filterPublications(records, filters = {}) {
  return records.filter((publication) => {
    const matchesQuery = filters.query
      ? [publication.title, publication.abstract, publication.publisher, publication.journal].some(
          (value) => normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesTeam = matchesOptionalTeamFilter(publication, filters.team);
    const matchesYear = filters.year ? Number(publication.year) === Number(filters.year) : true;
    const matchesPublisher = matchesOptionalText(publication.publisher, filters.publisher);
    const matchesAuthor = filters.author
      ? publication.authors.some((author) =>
          normalizeText(author).includes(normalizeText(filters.author)),
        )
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

function filterNews(records, filters = {}) {
  return records.filter((item) => {
    const matchesQuery = filters.query
      ? [item.headline, item.excerpt, ...(item.body ?? [])].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesCategory = filters.category
      ? normalizeText(item.category) === normalizeText(filters.category)
      : true;
    const matchesTeam = filters.team
      ? (item.teams ?? []).some((team) => matchesOptionalTeamFilter({ team }, filters.team))
      : true;
    const matchesYear = filters.year ? item.dateIso.startsWith(String(filters.year)) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });
}

function filterGallery(records, filters = {}) {
  return records.filter((item) => {
    const matchesQuery = filters.query
      ? [item.title, item.caption].some((value) =>
          normalizeText(value).includes(normalizeText(filters.query)),
        )
      : true;
    const matchesCategory = filters.category
      ? normalizeText(item.category) === normalizeText(filters.category)
      : true;
    const matchesTeam = matchesOptionalTeamFilter(item, filters.team);
    const matchesYear = filters.year ? item.dateIso.startsWith(String(filters.year)) : true;

    return matchesQuery && matchesCategory && matchesTeam && matchesYear;
  });
}

export async function getPublicSiteContext() {
  const { siteConfig } = await loadPublicSourceData();

  return {
    data: siteConfig,
  };
}

export async function listPublicTeams(filters = {}) {
  const { teamSummaryRecords } = await loadPublicSourceData();
  const records = filterTeams(teamSummaryRecords, filters);

  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export async function getPublicTeam(identifier) {
  const { newsRecords, projectRecords, publicationRecords, teamSummaryRecords } =
    await loadPublicSourceData();
  const team = getByIdentifier(teamSummaryRecords, identifier, "Team");

  return {
    data: {
      ...team,
      relatedNews: newsRecords.filter((item) =>
        item.teams.some((entry) => entry.acronym === team.acronym),
      ),
      relatedProjects: projectRecords.filter(
        (project) => project.team?.acronym === team.acronym,
      ),
      relatedPublications: publicationRecords.filter(
        (publication) => publication.team?.acronym === team.acronym,
      ),
    },
  };
}

export async function listPublicMembers(filters = {}) {
  const { memberRecords } = await loadPublicSourceData();
  const records = filterMembers(memberRecords, filters);

  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export async function getPublicMember(identifier) {
  const { memberRecords, projectRecords, publicationRecords } = await loadPublicSourceData();
  const member = getByIdentifier(memberRecords, identifier, "Member");

  return {
    data: {
      ...member,
      relatedProjects: projectRecords.filter(
        (project) => project.team?.slug === member.team.slug,
      ),
      relatedPublications: publicationRecords.filter(
        (publication) => publication.team?.slug === member.team.slug,
      ),
    },
  };
}

export async function getGroupedPublicMembers(filters = {}) {
  const { memberRecords, teamSummaryRecords } = await loadPublicSourceData();
  const records = filterMembers(memberRecords, filters);

  return {
    data: {
      byRole: roleOrder.map((role) => ({
        count: records.filter((member) => member.role === role).length,
        key: role,
        label: role,
        members: records.filter((member) => member.role === role),
      })),
      byTeam: teamSummaryRecords.map((team) => ({
        count: records.filter((member) => member.team.slug === team.slug).length,
        key: team.slug,
        label: team.name,
        members: records.filter((member) => member.team.slug === team.slug),
        team,
      })),
    },
    meta: buildMeta(records, filters),
  };
}

export async function listPublicProjects(filters = {}) {
  const { projectRecords } = await loadPublicSourceData();
  const records = filterProjects(projectRecords, filters);

  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export async function getPublicProject(identifier) {
  const { projectRecords, publicationRecords } = await loadPublicSourceData();
  const project = getByIdentifier(projectRecords, identifier, "Project");

  return {
    data: {
      ...project,
      relatedPublications: publicationRecords.filter(
        (publication) => publication.team?.acronym === project.team?.acronym,
      ),
    },
  };
}

export async function listPublicPublications(filters = {}) {
  const { publicationRecords } = await loadPublicSourceData();
  const records = filterPublications(publicationRecords, filters);

  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export async function getPublicPublication(identifier) {
  const { projectRecords, publicationRecords } = await loadPublicSourceData();
  const publication = getByIdentifier(publicationRecords, identifier, "Publication");

  return {
    data: {
      ...publication,
      relatedProjects: projectRecords.filter(
        (project) => project.team?.acronym === publication.team?.acronym,
      ),
      relatedPublications: publicationRecords.filter(
        (entry) =>
          entry.team?.acronym === publication.team?.acronym &&
          entry.slug !== publication.slug,
      ),
    },
  };
}

export async function listPublicNews(filters = {}) {
  const { newsRecords } = await loadPublicSourceData();
  const records = filterNews(newsRecords, filters);

  return {
    data: records,
    meta: buildMeta(records, filters),
  };
}

export async function getPublicNewsItem(identifier) {
  const { newsRecords, publicationRecords } = await loadPublicSourceData();
  const item = getByIdentifier(newsRecords, identifier, "News item");

  return {
    data: {
      ...item,
      relatedPublications: publicationRecords.filter((publication) =>
        item.teams.some((team) => team.acronym === publication.team?.acronym),
      ),
    },
  };
}

export async function listPublicGallery(filters = {}) {
  const { galleryRecords } = await loadPublicSourceData();
  const records = filterGallery(galleryRecords, filters);
  const limit = toNumber(filters.limit);
  const offset = toNumber(filters.offset) ?? 0;
  const slicedRecords =
    limit === null ? records.slice(offset) : records.slice(offset, offset + limit);

  return {
    data: slicedRecords,
    meta: {
      ...buildMeta(slicedRecords, filters),
      limit,
      offset,
      total: records.length,
    },
  };
}

export async function getPublicGalleryItem(identifier) {
  const { galleryRecords } = await loadPublicSourceData();

  return {
    data: getByIdentifier(galleryRecords, identifier, "Gallery item"),
  };
}
