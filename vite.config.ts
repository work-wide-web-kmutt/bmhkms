import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,ts,jsx,tsx,vue,svelte,css,md}": "ultracite fix",
    "*.{json,jsonc}": "vp check --fix",
  },
});
