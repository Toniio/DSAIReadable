export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allowed types = the branch prefixes of the trunk-based workflow.
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "ci", "refactor", "test", "style", "perf", "build", "revert"],
    ],
    // With squash merges, the PR title becomes the commit message: it must
    // stay readable in a changelog.
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0],
  },
}
