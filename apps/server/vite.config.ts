import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    entry: "./src/index.ts",
    format: "esm",
    noExternal: [/^@bmhkms\//u],
    outDir: "./dist",
  },
});
