import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [
    "apps/fumadocs/src/routeTree.gen.ts",
    "apps/web/src/routeTree.gen.ts",
  ],
  overrides: [
    {
      files: ["packages/db/src/schema/**/*.ts"],
      rules: {
        "no-inline-comments": "off",
      },
    },
    {
      files: ["apps/server/src/index.ts"],
      rules: {
        "promise/prefer-await-to-callbacks": "off",
      },
    },
  ],
  rules: {
    "func-style": ["error", "declaration"],
    "no-use-before-define": [
      "error",
      {
        classes: true,
        functions: false,
        variables: true,
      },
    ],
  },
});
