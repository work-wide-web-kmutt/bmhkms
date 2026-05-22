import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ".agents/**",
    "packages/db/src/schema/auth.ts",
    ...(ultracite.ignorePatterns ?? []),
  ],
});
