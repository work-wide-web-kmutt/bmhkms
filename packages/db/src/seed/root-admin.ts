import { randomBytes } from "node:crypto";

import type { SeedUser } from "./shared";
import { createRootBootstrapUser, findUserByEmail } from "./shared";

const ROOT_ADMIN_EMAIL = "root-admin+bmhk@kmutt.ac.th";
const GENERATED_PASSWORD_BYTES = 32;

const existingUser = await findUserByEmail(ROOT_ADMIN_EMAIL);

if (existingUser?.user) {
  throw new Error(`Root admin already exists for email: ${ROOT_ADMIN_EMAIL}`);
}

const generatedPassword = randomBytes(GENERATED_PASSWORD_BYTES).toString(
  "base64url"
);

const rootAdminUser: SeedUser = {
  displayUsername: "root-admin",
  email: ROOT_ADMIN_EMAIL,
  name: "Root Admin",
  password: generatedPassword,
  role: "root",
  username: "root-admin",
};

const result = await createRootBootstrapUser(rootAdminUser);

console.info(
  `seed:root ${result.status} ${result.email} with role ${result.role}`
);
console.info(`seed:root generated password ${generatedPassword}`);
