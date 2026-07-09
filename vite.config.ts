import type { UserConfig } from "vite-plus";
import { defineConfig } from "vite-plus";

import oxfmtConfig from "./oxfmt.config";
import oxlintConfig from "./oxlint.config";

export default defineConfig({
  fmt: oxfmtConfig as UserConfig["fmt"],
  lint: oxlintConfig as UserConfig["lint"],
  staged: {
    "!(*.gen).ts": "ultracite fix",
    "*.{css,md,json,jsonc}": "vp check --fix",
    "*.{js,jsx,tsx,vue,svelte}": "ultracite fix",
  },
  test: {
    projects: ["apps/*", "packages/*"],
  },
});
