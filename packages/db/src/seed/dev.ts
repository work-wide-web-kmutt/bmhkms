import type { SeedRole, SeedUser } from "./shared";
import { reconcileSeedUser } from "./shared";

const devUsers: SeedUser[] = [
  {
    displayUsername: "dev-admin",
    email: "dev-admin+bmhk-local-dev@kmutt.ac.th",
    name: "Dev Admin",
    password: "dev-admin",
    role: "admin",
    username: "dev-admin",
  },
  {
    displayUsername: "dev-records-staff",
    email: "dev-records-staff+bmhk-local-dev@kmutt.ac.th",
    name: "Dev Records Staff",
    password: "dev-records-staff",
    role: "records_staff",
    username: "dev-records-staff",
  },
  {
    displayUsername: "dev-staff",
    email: "dev-staff+bmhk-local-dev@kmutt.ac.th",
    name: "Dev Staff",
    password: "dev-staff",
    role: "staff",
    username: "dev-staff",
  },
  {
    displayUsername: "dev-observer",
    email: "dev-observer+bmhk-local-dev@gmail.com",
    name: "Dev Observer",
    password: "dev-observer",
    role: "observer",
    username: "dev-observer",
  },
  {
    displayUsername: "student-1",
    email: "student-1+bmhk-local-dev@gmail.com",
    name: "Student 1",
    password: "student-1",
    role: "contestant",
    username: "student-1",
  },
  {
    displayUsername: "student-2",
    email: "student-2+bmhk-local-dev@gmail.com",
    name: "Student 2",
    password: "student-2",
    role: "contestant",
    username: "student-2",
  },
  {
    displayUsername: "student-3",
    email: "student-3+bmhk-local-dev@gmail.com",
    name: "Student 3",
    password: "student-3",
    role: "contestant",
    username: "student-3",
  },
];

const roleCounts = new Map<SeedRole, number>();

async function seedUsers(users: SeedUser[], index = 0): Promise<void> {
  const user = users[index];

  if (!user) {
    return;
  }

  const result = await reconcileSeedUser(user);
  const currentCount = roleCounts.get(result.role) ?? 0;

  roleCounts.set(result.role, currentCount + 1);
  console.info(
    `seed:dev ${result.status} ${result.email} with role ${result.role}`
  );

  await seedUsers(users, index + 1);
}

await seedUsers(devUsers);

const summary = [...roleCounts.entries()]
  .map(([role, count]) => `${role}=${count}`)
  .join(", ");

console.info(`seed:dev complete ${devUsers.length} users (${summary})`);
