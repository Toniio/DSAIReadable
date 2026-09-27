export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Types autorises = prefixes de branche du workflow trunk-based.
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "ci", "refactor", "test", "style", "perf", "build", "revert"],
    ],
    // Le titre de PR devient le message de commit en squash merge : il doit
    // rester lisible dans un changelog.
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0],
  },
}
