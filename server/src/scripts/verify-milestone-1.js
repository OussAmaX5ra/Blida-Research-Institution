import cookieParser from "cookie-parser";
import express from "express";

import { createApp } from "../app.js";
import { connectToDatabase, disconnectFromDatabase } from "../db/mongoose.js";
import { authenticateAdmin } from "../middleware/authenticate-admin.js";
import { requirePermissions, requireRoles } from "../middleware/authorize.js";
import { errorHandler } from "../middleware/error-handler.js";
import { AuthSession } from "../models/auth-session.js";
import { User } from "../models/user.js";
import { createOrUpdateAdminUser } from "./create-admin-user.js";
import { createAccessToken } from "../utils/auth-tokens.js";
import { hashPassword } from "../utils/password.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function logStep(message) {
  console.log(`[verify-m1] ${message}`);
}

function mergeCookies(existing, setCookieHeaders) {
  const cookieMap = new Map();

  for (const cookie of existing) {
    const [pair] = cookie.split(";");
    const [name, value] = pair.split("=");
    cookieMap.set(name, value);
  }

  for (const cookie of setCookieHeaders) {
    const [pair] = cookie.split(";");
    const [name, value] = pair.split("=");
    cookieMap.set(name, value);
  }

  return Array.from(cookieMap.entries()).map(([name, value]) => `${name}=${value}`);
}

function withoutCookie(cookies, nameToRemove) {
  return cookies.filter((cookie) => !cookie.startsWith(`${nameToRemove}=`));
}

async function upsertUser({ email, fullName, password, role, status = "active" }) {
  const passwordHash = await hashPassword(password);

  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        fullName,
        passwordHash,
        role,
        status,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).select("+passwordHash");
}

async function cleanupUsers(emails) {
  const users = await User.find({ email: { $in: emails } }).select("_id");
  const userIds = users.map((user) => user._id);

  if (userIds.length > 0) {
    await AuthSession.deleteMany({ userId: { $in: userIds } });
  }

  await User.deleteMany({ email: { $in: emails } });
}

async function verifyAppBehavior({ loginEmail, loginPassword, rateLimitEmail }) {
  const app = createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const { port } = server.address();
        let cookies = [];

        logStep("checking health route and security headers");
        const healthResponse = await fetch(`http://127.0.0.1:${port}/api/health`);
        assert(healthResponse.status === 200, "Expected /api/health to return 200.");
        assert(
          healthResponse.headers.get("x-powered-by") === null,
          "Expected x-powered-by header to be disabled.",
        );
        assert(
          healthResponse.headers.get("x-content-type-options") === "nosniff",
          "Expected helmet to set x-content-type-options.",
        );

        logStep("checking not-found handling");
        const missingResponse = await fetch(`http://127.0.0.1:${port}/api/missing`);
        assert(missingResponse.status === 404, "Expected missing route to return 404.");

        logStep("checking malformed JSON handling");
        const invalidJsonResponse = await fetch(`http://127.0.0.1:${port}/api/admin/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{invalid",
        });
        assert(invalidJsonResponse.status === 400, "Expected malformed JSON to return 400.");

        logStep("checking strict login payload validation");
        const strictValidationResponse = await fetch(
          `http://127.0.0.1:${port}/api/admin/auth/login`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: loginEmail,
              password: loginPassword,
              unexpected: true,
            }),
          },
        );
        assert(
          strictValidationResponse.status === 400,
          "Expected strict login validation to reject unexpected fields.",
        );

        logStep("checking invalid-credentials response");
        const badLoginResponse = await fetch(`http://127.0.0.1:${port}/api/admin/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: "WrongPass123" }),
        });
        assert(badLoginResponse.status === 401, "Expected wrong password to return 401.");

        logStep("checking successful login flow");
        const loginResponse = await fetch(`http://127.0.0.1:${port}/api/admin/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        cookies = mergeCookies(cookies, loginResponse.headers.getSetCookie());
        assert(loginResponse.status === 200, "Expected login to return 200.");
        assert(
          cookies.some((cookie) => cookie.startsWith("rl_admin_access_token=")),
          "Expected login to set an access token cookie.",
        );
        assert(
          cookies.some((cookie) => cookie.startsWith("rl_admin_refresh_token=")),
          "Expected login to set a refresh token cookie.",
        );

        logStep("checking authenticated me route");
        const meResponse = await fetch(`http://127.0.0.1:${port}/api/admin/auth/me`, {
          headers: { cookie: cookies.join("; ") },
        });
        assert(meResponse.status === 200, "Expected /me to succeed with an access cookie.");

        logStep("checking refresh route with refresh-only cookie");
        const refreshOnlyCookies = withoutCookie(cookies, "rl_admin_access_token");
        const refreshResponse = await fetch(`http://127.0.0.1:${port}/api/admin/auth/refresh`, {
          method: "POST",
          headers: { cookie: refreshOnlyCookies.join("; ") },
        });
        cookies = mergeCookies(cookies, refreshResponse.headers.getSetCookie());
        assert(refreshResponse.status === 200, "Expected refresh to succeed with a refresh cookie.");

        logStep("checking logout-all fallback with refresh-only cookie");
        const refreshOnlyAfterRefresh = withoutCookie(cookies, "rl_admin_access_token");
        const logoutAllResponse = await fetch(
          `http://127.0.0.1:${port}/api/admin/auth/logout-all`,
          {
            method: "POST",
            headers: { cookie: refreshOnlyAfterRefresh.join("; ") },
          },
        );
        assert(
          logoutAllResponse.status === 204,
          "Expected logout-all to work with a valid refresh-only session.",
        );

        logStep("checking me route remains access-token protected");
        const meWithRefreshOnly = await fetch(`http://127.0.0.1:${port}/api/admin/auth/me`, {
          headers: { cookie: refreshOnlyAfterRefresh.join("; ") },
        });
        assert(
          meWithRefreshOnly.status === 401,
          "Expected /me to reject refresh-only requests.",
        );

        logStep("checking auth rate limiting");
        for (let attempt = 1; attempt <= 6; attempt += 1) {
          const response = await fetch(`http://127.0.0.1:${port}/api/admin/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: rateLimitEmail, password: "WrongPass123" }),
          });

          if (attempt < 6) {
            assert(response.status === 401, `Expected bad login attempt ${attempt} to return 401.`);
          } else {
            assert(response.status === 429, "Expected sixth bad login attempt to hit rate limit.");
          }
        }

        logStep("checking global limiter health exemption");
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const response = await fetch(`http://127.0.0.1:${port}/api/health`);
          assert(response.status === 200, "Expected /api/health to remain available.");
        }

        server.close(() => resolve());
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

async function verifyRbacBehavior({ editorEmail, superAdminEmail }) {
  const superAdmin = await User.findOne({ email: superAdminEmail });
  const editor = await User.findOne({ email: editorEmail });

  assert(superAdmin, "Expected super admin test user to exist.");
  assert(editor, "Expected editor test user to exist.");

  const app = express();
  app.use(cookieParser());
  app.get("/super-only", authenticateAdmin, requireRoles("super_admin"), (_request, response) => {
    response.status(200).json({ ok: true });
  });
  app.get(
    "/publish-only",
    authenticateAdmin,
    requirePermissions("publications.publish"),
    (_request, response) => {
      response.status(200).json({ ok: true });
    },
  );
  app.use(errorHandler);

  await new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const { port } = server.address();
        const superToken = createAccessToken({
          userId: superAdmin.id,
          role: superAdmin.role,
          sessionId: "verify-m1-super-session",
        });
        const editorToken = createAccessToken({
          userId: editor.id,
          role: editor.role,
          sessionId: "verify-m1-editor-session",
        });

        logStep("checking RBAC role gate");
        const superRoleResponse = await fetch(`http://127.0.0.1:${port}/super-only`, {
          headers: { cookie: `rl_admin_access_token=${superToken}` },
        });
        assert(superRoleResponse.status === 200, "Expected super admin role gate to pass.");

        const editorRoleResponse = await fetch(`http://127.0.0.1:${port}/super-only`, {
          headers: { cookie: `rl_admin_access_token=${editorToken}` },
        });
        assert(editorRoleResponse.status === 403, "Expected editor role gate to be forbidden.");

        logStep("checking RBAC permission gate");
        const editorPermissionResponse = await fetch(`http://127.0.0.1:${port}/publish-only`, {
          headers: { cookie: `rl_admin_access_token=${editorToken}` },
        });
        assert(
          editorPermissionResponse.status === 403,
          "Expected editor publish permission gate to be forbidden.",
        );

        server.close(() => resolve());
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

async function verifyCreateAdminScript(email) {
  logStep("checking safe create-admin defaults");
  let duplicateCreateFailed = false;

  try {
    await createOrUpdateAdminUser({
      email,
      password: "AnotherPass123",
    });
  } catch {
    duplicateCreateFailed = true;
  }

  assert(
    duplicateCreateFailed,
    "Expected create-admin to refuse updating an existing account without --allowUpdate=true.",
  );

  logStep("checking create-admin update mode");
  await createOrUpdateAdminUser({
    allowUpdate: true,
    email,
    fullName: "Verify Updated Name",
  });

  const updatedUser = await User.findOne({ email });
  assert(
    updatedUser?.fullName === "Verify Updated Name",
    "Expected create-admin update mode to apply the requested change.",
  );
}

async function main() {
  const runId = Date.now();
  const emails = {
    editor: `verify-m1-editor-${runId}@example.com`,
    rateLimit: `verify-m1-rate-${runId}@example.com`,
    superAdmin: `verify-m1-super-${runId}@example.com`,
  };

  await connectToDatabase();

  try {
    logStep("creating verification users");
    await upsertUser({
      email: emails.superAdmin,
      fullName: "Verify Milestone One Super",
      password: "StrongPass123",
      role: "super_admin",
    });
    await upsertUser({
      email: emails.editor,
      fullName: "Verify Milestone One Editor",
      password: "StrongPass123",
      role: "editor",
    });

    await verifyAppBehavior({
      loginEmail: emails.superAdmin,
      loginPassword: "StrongPass123",
      rateLimitEmail: emails.rateLimit,
    });
    await verifyRbacBehavior({
      editorEmail: emails.editor,
      superAdminEmail: emails.superAdmin,
    });
    await verifyCreateAdminScript(emails.superAdmin);

    console.log("Milestone 1 verification passed.");
  } finally {
    logStep("cleaning up verification users");
    await cleanupUsers([emails.superAdmin, emails.editor]);
    await disconnectFromDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
