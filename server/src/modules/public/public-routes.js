import { Router } from "express";

import {
  getGroupedPublicMembers,
  getPublicGalleryItem,
  getPublicMember,
  getPublicNewsItem,
  getPublicProject,
  getPublicPublication,
  getPublicSiteContext,
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

publicRouter.get("/site-context", async (_request, response, next) => {
  try {
    response.status(200).json(await getPublicSiteContext());
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/teams", async (request, response, next) => {
  try {
    response.status(200).json(await listPublicTeams(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/teams/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicTeam(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members", async (request, response, next) => {
  try {
    response.status(200).json(await listPublicMembers(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members/grouped", async (request, response, next) => {
  try {
    response.status(200).json(await getGroupedPublicMembers(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/members/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicMember(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/projects", async (request, response, next) => {
  try {
    response.status(200).json(await listPublicProjects(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/projects/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicProject(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications", async (request, response, next) => {
  try {
    response
      .status(200)
      .json(await listPublicPublications(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications/search", async (request, response, next) => {
  try {
    response
      .status(200)
      .json(await listPublicPublications(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/publications/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicPublication(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/news", async (request, response, next) => {
  try {
    response.status(200).json(await listPublicNews(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/news/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicNewsItem(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/gallery", async (request, response, next) => {
  try {
    response.status(200).json(await listPublicGallery(getQueryFilters(request.query)));
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/gallery/:identifier", async (request, response, next) => {
  try {
    response.status(200).json(await getPublicGalleryItem(request.params.identifier));
  } catch (error) {
    next(error);
  }
});

export { publicRouter };
