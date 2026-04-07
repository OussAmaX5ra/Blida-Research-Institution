import { Router } from "express";

import {
  getGroupedPublicMembers,
  getPublicGalleryItem,
  getPublicMember,
  getPublicNewsItem,
  getPublicProject,
  getPublicPublication,
  getPublicTeam,
  listPublicGallery,
  listPublicMembers,
  listPublicNews,
  listPublicProjects,
  listPublicPublications,
  listPublicTeams,
} from "./public-service.js";

const publicRouter = Router();

function getQueryFilters(query) {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}

publicRouter.get("/teams", (request, response, next) => {
  try {
    response.status(200).json(listPublicTeams(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/teams/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicTeam(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members", (request, response, next) => {
  try {
    response.status(200).json(listPublicMembers(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members/grouped", (request, response, next) => {
  try {
    response.status(200).json(getGroupedPublicMembers(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicMember(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/projects", (request, response, next) => {
  try {
    response.status(200).json(listPublicProjects(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/projects/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicProject(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications", (request, response, next) => {
  try {
    response.status(200).json(listPublicPublications(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications/search", (request, response, next) => {
  try {
    response.status(200).json(listPublicPublications(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicPublication(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/news", (request, response, next) => {
  try {
    response.status(200).json(listPublicNews(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/news/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicNewsItem(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/gallery", (request, response, next) => {
  try {
    response.status(200).json(listPublicGallery(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/gallery/:identifier", (request, response, next) => {
  try {
    response.status(200).json(getPublicGalleryItem(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

export { publicRouter };
