import type { SeedUser } from "./shared";
import { reconcileSeedUser } from "./shared";

const rootAdminUser: SeedUser = {
  displayUsername: "root-admin",
  email: "root-admin+bmhk@kmutt.ac.th",
  name: "Root Admin",
  password: "root-admin",
  role: "root",
  username: "root-admin",
};

const result = await reconcileSeedUser(rootAdminUser);

console.info(
  `seed:root ${result.status} ${result.email} with role ${result.role}`
);
