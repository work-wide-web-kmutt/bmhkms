const commitTypes = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

const scopeSyntaxPattern = /^\w+\(.*\): /u;

/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerCorrespondence: ["type", "scope", "subject"],
      headerPattern: /^(\w+)(?:\((.*)\))?: (.+)$/u,
    },
  },
  plugins: [
    {
      rules: {
        "no-scope": (parsed) => [
          !scopeSyntaxPattern.test(parsed.header ?? ""),
          "scope is not allowed",
        ],
      },
    },
  ],
  rules: {
    "no-scope": [2, "always"],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "type-enum": [2, "always", commitTypes],
  },
};

export default config;
