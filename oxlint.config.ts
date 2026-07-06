import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "node_modules/**",
    "**/node_modules/**",
    "apps/staff/.tanstack/**",
    "apps/staff/src/routeTree.gen.ts",
    "apps/web/dist/**",
    "apps/web/.tanstack/**",
    "apps/web/src/routeTree.gen.ts",
    "apps/server/dist/**",
    "packages/db/dist/**",
    "packages/db/src/schema/auth.ts",
    "packages/db/src/migrations",
  ],
  options: {
    typeAware: false,
    typeCheck: false,
  },
  rules: {
    "func-style": ["error", "declaration"],
    "no-use-before-define": [
      "error",
      {
        functions: false,
      },
    ],
  },
});
