import bcrypt from "bcryptjs";

import { env } from "../config/env.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, env.PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
