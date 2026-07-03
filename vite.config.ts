import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "!(*.gen).ts": "ultracite fix",
    "*.{css,md,json,jsonc}": "vp check --fix",
    "*.{js,jsx,tsx,vue,svelte}": "ultracite fix",
  },
});
