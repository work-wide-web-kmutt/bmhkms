import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    entry: "./src/main.ts",
    format: "esm",
    noExternal: [/^@bmhkms\//u],
    outDir: "./dist",
  },
  test: {
    exclude: ["**/dist/**"],
    include: ["src/**/*.test.ts"],
  },
});
