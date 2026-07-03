import { spawnSync } from "node:child_process";
import path from "node:path";

import { defineConfig } from "vite-plus";

const stagedUltraciteIgnoreList = new Set(["apps/web/src/routeTree.gen.ts"]);

function normalizeStagedFilePath(filePath: string): string {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

export default defineConfig({
  staged: {
    "*.{js,ts,jsx,tsx,vue,svelte,css,md}": {
      task: (stagedFiles) => {
        const lintableFiles = stagedFiles.filter(
          (file) =>
            !stagedUltraciteIgnoreList.has(normalizeStagedFilePath(file))
        );

        if (lintableFiles.length === 0) {
          return;
        }

        const result = spawnSync(
          "bun",
          ["x", "ultracite", "fix", ...lintableFiles],
          {
            stdio: "inherit",
          }
        );

        if (result.status !== 0) {
          throw new Error("ultracite fix failed");
        }
      },
      title: "ultracite fix",
    },
    "*.{json,jsonc}": "vp check --fix",
  },
});
