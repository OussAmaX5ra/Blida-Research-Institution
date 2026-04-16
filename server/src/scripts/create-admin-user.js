/* globals process */
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { connectToDatabase, disconnectFromDatabase } from "../db/mongoose.js";
import { User } from "../models/user.js";
import { hashPassword } from "../utils/password.js";

const inputSchema = z.object({
  activate: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  allowUpdate: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(["super_admin", "content_admin", "editor"]).optional(),
});

function parseArguments(argv) {
  const values = {};

  for (const argument of argv) {
    const [rawKey, ...rest] = argument.split("=");
    const key = rawKey.replace(/^--/, "");
    values[key] = rest.join("=");
  }

  return inputSchema.parse({
    activate: values.activate,
    allowUpdate: values.allowUpdate,
    email: values.email,
    fullName: values.fullName,
    password: values.password,
    role: values.role,
  });
}

export async function createOrUpdateAdminUser({
  activate = false,
  allowUpdate = false,
  email,
  fullName,
  password,
  role,
}) {
  const existingUser = await User.findOne({ email }).select("+passwordHash");

  if (existingUser) {
    if (!allowUpdate) {
      throw new Error(
        `A user with email ${email} already exists. Re-run with --allowUpdate=true to modify the existing account.`,
      );
    }

    const updates = {};

    if (fullName) {
      updates.fullName = fullName;
    }

    if (role) {
      updates.role = role;
    }

    if (password) {
      updates.passwordHash = await hashPassword(password);
    }

    if (activate) {
      updates.status = "active";
    }

    const user =
      Object.keys(updates).length > 0
        ? await User.findOneAndUpdate(
            { email },
            {
              $set: updates,
            },
            {
              new: true,
            },
          ).select("+passwordHash")
        : existingUser;

    return {
      user,
      updated: Object.keys(updates),
    };
  }

  if (!password) {
    throw new Error("A password is required when creating a new admin user.");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    fullName: fullName ?? "Admin User",
    passwordHash,
    role: role ?? "super_admin",
    status: "active",
  });

  return {
    user,
    updated: ["email", "fullName", "passwordHash", "role", "status"],
  };
}

async function main() {
  const parsedInput = parseArguments(process.argv.slice(2));

  await connectToDatabase();

  const { user, updated } = await createOrUpdateAdminUser(parsedInput);

  console.log(
    JSON.stringify(
      {
        email: user.email,
        fullName: user.fullName,
        id: user.id,
        role: user.role,
        status: user.status,
        updated,
      },
      null,
      2,
    ),
  );
}

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.stack ?? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectFromDatabase();
    });
}
