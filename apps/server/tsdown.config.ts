import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: "./src/index.ts",
  format: "esm",
  // oxlint-disable-next-line require-unicode-regexp
  noExternal: [/@bmhkms\/.*/],
  outDir: "./dist",
});
