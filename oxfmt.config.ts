import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    "node_modules/**",
    "**/node_modules/**",
    "apps/staff/.tanstack/**",
    "apps/staff/src/routeTree.gen.ts",
    "apps/web/dist/**",
    "apps/web/.tanstack/**",
    "apps/web/src/routeTree.gen.ts",
    "apps/server/dist/**",
    "packages/db/dist/**",
    "packages/db/src/migrations",
  ],
});
