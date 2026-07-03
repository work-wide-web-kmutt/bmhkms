import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "!(*.gen).ts": "ultracite fix",
    "*.{js,jsx,tsx,vue,svelte,css,md}": "ultracite fix",
    "*.{json,jsonc}": "vp check --fix",
  },
});
