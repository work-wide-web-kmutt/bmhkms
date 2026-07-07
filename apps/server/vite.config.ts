import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    entry: "./src/index.ts",
    format: "esm",
    // oxlint-disable-next-line require-unicode-regexp
    noExternal: [/@bmhkms\/.*/],
    outDir: "./dist",
  },
});
