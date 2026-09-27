/**
 * Pre-commit checks. Each entry returns its command as a string, which tells
 * lint-staged not to append the staged filenames (npm scripts take no args).
 */
export default {
  "*.{ts,tsx}": (files) => [
    `prettier --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    `eslint --fix ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    // App, node scripts and MCP server at once: a type error in any project
    // must block the commit, not just in the app.
    "npm run typecheck:all",
  ],

  "*.md": (files) =>
    `prettier --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,

  // Editing a token source without regenerating tokens.css is the drift this
  // whole pipeline exists to prevent.
  "{tokens/*.json,tokens.css}": () => [
    "npm run tokens:check",
    "npm run tokens:lint-naming",
    "npm run tokens:lint-values",
    "npm run tokens:lint-bridge",
    "npm run tokens:lint-lifecycle",
    "npm run tokens:lint-monotonic",
    "npm run tokens:lint-chart",
  ],

  // The @theme bridge breaks silently, so check it whenever it is touched.
  "app/globals.css": () => "npm run tokens:lint-bridge",
}
