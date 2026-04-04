import { Router } from "express";

import {
  authenticateAdmin,
} from "../../middleware/authenticate-admin.js";
import {
  authenticateAdminWithAnySession,
  authenticateAdminWithRefreshSession,
} from "../../middleware/authenticate-admin-session.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/auth-cookies.js";
import { validateRequest } from "../../validators/request-validator.js";
import { loginBodySchema } from "../../validators/auth-schemas.js";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdminSession,
  logoutAllAdminSessions,
  refreshAdminSession,
} from "./auth-service.js";

const authRouter = Router();

authRouter.post(
  "/login",
  validateRequest({ body: loginBodySchema }),
  async (request, response, next) => {
    try {
      const { body } = request.validated;
      const session = await loginAdmin({
        ...body,
        request,
      });

      setAuthCookies(response, session);
      response.status(200).json({ user: session.user });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/refresh",
  authenticateAdminWithRefreshSession,
  async (request, response, next) => {
    try {
      const session = await refreshAdminSession(request);
      setAuthCookies(response, session);
      response.status(200).json({ user: session.user });
    } catch (error) {
      clearAuthCookies(response);
      next(error);
    }
  },
);

authRouter.post(
  "/logout",
  authenticateAdminWithAnySession,
  async (request, response, next) => {
    try {
      await logoutAdminSession(request);
      clearAuthCookies(response);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/logout-all",
  authenticateAdminWithAnySession,
  async (request, response, next) => {
    try {
      await logoutAllAdminSessions(request);
      clearAuthCookies(response);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

authRouter.get("/me", authenticateAdmin, async (request, response, next) => {
  try {
    const user = await getCurrentAdmin(request);
    response.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
