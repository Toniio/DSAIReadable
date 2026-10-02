/**
 * Changeset lint — the semver policy of CONTRIBUTING.md, checked on each
 * pending `.changeset/*.md`.
 *
 * An agent cannot see a visual change, so the category a changeset declares is
 * what tells a consumer how much to trust an upgrade. The bump has to match it:
 *
 *   token-breaking   a token renamed, removed or repurposed: the breaking bump
 *   component-api    a prop, export, variant, component, registry item or new
 *                    token added, or one renamed or removed: minor or major
 *   mcp              the MCP server's tools and served content: minor or major;
 *                    patch for a correction that adds, renames or removes nothing
 *   skills           the agent skills of skills/ and the Claude Code plugin
 *                    that ships them: the same as mcp
 *   lint             a rule or config of @dsaireadable/eslint-plugin: patch for
 *                    a message, a link or a fix that reports less; minor or
 *                    major for one that reports more
 *   visual           appearance or behavior with no change of API, described in
 *                    full: patch
 *   docs             specs and guidance only: patch
 *
 * The breaking bump is `major` from 1.0.0 on and `minor` before it (SemVer § 4:
 * in 0.x, minor carries both breaking and additive changes, patch the rest).
 * The lint cannot tell an addition from a correction under `mcp`, `skills` or
 * `lint`, nor a breaking change from one that is not: the reviewer does.
 *
 * Changes nothing outside the repository can observe (CI, the repository's own
 * lint, tests, a refactor) need no changeset at all.
 *
 *   npx tsx scripts/lint-changesets.ts [--root <dir>]
 */

import { readdirSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const ROOT = args.includes("--root")
  ? resolve(args[args.indexOf("--root") + 1])
  : resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = resolve(ROOT, ".changeset")

type Bump = "major" | "minor" | "patch"

const pkg = JSON.parse(
  readFileSync(resolve(ROOT, "package.json"), "utf-8")
) as {
  name: string
  version: string
}
const breaking: Bump =
  Number(pkg.version.split(".")[0]) >= 1 ? "major" : "minor"

const CATEGORIES: Record<string, Bump[]> = {
  "token-breaking": [breaking],
  "component-api": ["minor", "major"],
  mcp: ["patch", "minor", "major"],
  skills: ["patch", "minor", "major"],
  lint: ["patch", "minor", "major"],
  visual: ["patch"],
  docs: ["patch"],
}

const errors: string[] = []
const files = readdirSync(DIR).filter(
  (file) => file.endsWith(".md") && file !== "README.md"
)

for (const file of files) {
  const fail = (message: string) =>
    errors.push(`.changeset/${file}: ${message}`)
  const text = readFileSync(resolve(DIR, file), "utf-8")
  const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)
  if (!parts) {
    fail(
      "no frontmatter; it starts with --- and names the package and its bump"
    )
    continue
  }

  const bumps = parts[1]
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => /^"?([^":]+)"?:\s*(major|minor|patch)$/.exec(line.trim()))
  if (bumps.some((bump) => bump === null) || bumps.length !== 1) {
    fail(
      `the frontmatter is exactly one line: "${pkg.name}": major | minor | patch`
    )
    continue
  }
  const [, name, bump] = bumps[0] as RegExpExecArray
  if (name !== pkg.name) {
    fail(`"${name}" is not a package of this repository; use "${pkg.name}"`)
    continue
  }

  const summary = parts[2].trim()
  const category = /^([a-z-]+): \S/.exec(summary)?.[1]
  if (!category || !(category in CATEGORIES)) {
    fail(
      `the summary starts with a category and a colon, one of ${Object.keys(CATEGORIES).join(", ")}`
    )
    continue
  }
  if (!CATEGORIES[category].includes(bump as Bump)) {
    fail(
      `"${category}" is ${CATEGORIES[category].join(" or ")}, not ${bump} (version ${pkg.version})`
    )
  }
}

if (errors.length > 0) {
  console.error(
    "❌ changesets:lint — the policy is in CONTRIBUTING.md, Versioning.\n" +
      errors.map((error) => `  ${error}`).join("\n")
  )
  process.exit(1)
}
console.log(
  `✅ changesets:lint — ${files.length} pending changeset${files.length === 1 ? "" : "s"}`
)
