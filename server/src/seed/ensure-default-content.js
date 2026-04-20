import {
  contactInfo,
  faculty,
  gallery,
  labInfo,
  news,
  projects,
  publications,
  researchAxes,
  teams,
} from "../../../shared/src/mockData.js";
import { GalleryItem } from "../models/gallery-item.js";
import { Member } from "../models/member.js";
import { NewsItem } from "../models/news-item.js";
import { Project } from "../models/project.js";
import { Publication } from "../models/publication.js";
import { SiteConfig } from "../models/site-config.js";
import { Team } from "../models/team.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fallbackTitle(member, team) {
  if (member.role === "Professor") {
    return member.name === team.leader ? "Professor & Team Lead" : "Professor";
  }

  return member.role === "Doctor" ? "Doctoral Researcher" : "PhD Student Researcher";
}

function buildDefaultMembers() {
  const facultyLookup = new Map(faculty.map((entry) => [entry.name, entry]));
  const teamByAcronym = new Map(teams.map((team) => [team.acronym, team]));

  return teams.flatMap((team) =>
    team.members.map((member) => {
      const facultyProfile = facultyLookup.get(member.name);
      const teamPublications = publications.filter(
        (publication) => publication.teamTag === team.acronym,
      ).length;
      const teamProjects = projects.filter(
        (project) =>
          project.teamSlug === team.slug ||
          project.teamTag === team.acronym ||
          teamByAcronym.get(project.teamTag)?.slug === team.slug,
      ).length;

      return {
        avatar: member.avatar,
        email: "",
        expertise:
          facultyProfile?.expertise ?? team.themes.slice(0, 2).join(", "),
        isLeader: member.name === team.leader,
        name: member.name,
        primaryTeamSlug: team.slug,
        projectCount: teamProjects,
        publicationCount: teamPublications,
        role: member.role,
        slug: slugify(member.name),
        teamSlugs: [team.slug],
        themes: team.themes,
        title: facultyProfile?.title ?? fallbackTitle(member, team),
      };
    }),
  );
}

function mapDefaultTeams() {
  return teams.map((team) => ({
    acronym: team.acronym,
    axisId: team.axisId,
    color: team.color,
    focus: team.focus,
    leader: team.leader,
    name: team.name,
    slug: team.slug,
    status: "active",
    summary: team.summary,
    themes: team.themes,
  }));
}

function mapDefaultProjects() {
  const teamSlugByAcronym = new Map(teams.map((team) => [team.acronym, team.slug]));

  return projects.map((project) => ({
    axisId: project.axisId,
    lead: project.lead,
    leadMemberSlug: project.leadMemberSlug ?? "",
    milestone: project.milestone,
    phdLinked: Boolean(project.phdLinked),
    slug: project.slug,
    status: project.status,
    summary: project.summary,
    teamSlug: project.teamSlug ?? teamSlugByAcronym.get(project.teamTag) ?? "",
    themes: project.themes,
    title: project.title,
    year: project.year,
  }));
}

function mapDefaultPublications() {
  const teamSlugByAcronym = new Map(teams.map((team) => [team.acronym, team.slug]));

  return publications.map((publication) => ({
    abstract: publication.abstract,
    authors: publication.authors,
    citations: publication.citations,
    doi: publication.doi,
    entryType: publication.entryType,
    journal: publication.journal,
    pdfLink: publication.pdfLink,
    publisher: publication.publisher,
    slug: publication.slug,
    status: "Published",
    teamSlug: publication.teamSlug ?? teamSlugByAcronym.get(publication.teamTag) ?? "",
    themes: publication.themes,
    title: publication.title,
    year: publication.year,
  }));
}

function mapDefaultNews() {
  const teamSlugByAcronym = new Map(teams.map((team) => [team.acronym, team.slug]));

  return news.map((item) => ({
    body: item.body,
    category: item.category,
    dateIso: item.dateIso,
    excerpt: item.excerpt,
    headline: item.headline,
    image: item.image,
    slug: item.slug,
    status: "Published",
    teamSlugs: (item.teamTags ?? [])
      .map((teamTag) => teamSlugByAcronym.get(teamTag) ?? "")
      .filter(Boolean),
  }));
}

function mapDefaultGallery() {
  const teamSlugByAcronym = new Map(teams.map((team) => [team.acronym, team.slug]));

  return gallery.map((item) => ({
    caption: item.caption,
    category: item.category,
    dateIso: item.dateIso,
    image: item.image,
    slug: item.slug,
    status: "Published",
    teamSlug: item.teamSlug ?? teamSlugByAcronym.get(item.teamTag) ?? "",
    title: item.title,
  }));
}

export async function ensureDefaultContentSeeded() {
  const counts = await Promise.all([
    SiteConfig.estimatedDocumentCount(),
    Team.estimatedDocumentCount(),
    Member.estimatedDocumentCount(),
    Project.estimatedDocumentCount(),
    Publication.estimatedDocumentCount(),
    NewsItem.estimatedDocumentCount(),
    GalleryItem.estimatedDocumentCount(),
  ]);

  const [
    siteConfigCount,
    teamCount,
    memberCount,
    projectCount,
    publicationCount,
    newsCount,
    galleryCount,
  ] = counts;

  if (siteConfigCount === 0) {
    await SiteConfig.create({
      _id: "default",
      contactInfo,
      labInfo,
      researchAxes,
    });
  }

  if (teamCount === 0) {
    await Team.insertMany(mapDefaultTeams());
  }

  if (memberCount === 0) {
    await Member.insertMany(buildDefaultMembers());
  }

  if (projectCount === 0) {
    await Project.insertMany(mapDefaultProjects());
  }

  if (publicationCount === 0) {
    await Publication.insertMany(mapDefaultPublications());
  }

  if (newsCount === 0) {
    await NewsItem.insertMany(mapDefaultNews());
  }

  if (galleryCount === 0) {
    await GalleryItem.insertMany(mapDefaultGallery());
  }
}
