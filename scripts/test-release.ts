/**
 * Release pipeline test: a changeset becomes a version, a CHANGELOG entry and
 * one number everywhere the design system serves it.
 *
 * It runs the real `changeset version` and the real version scripts on a copy
 * of the files that carry the version, in a temporary directory, so the working
 * tree is never touched:
 *
 *   ① the changeset lint accepts a changeset that follows the policy and
 *      refuses one that does not (a visual change declared as minor);
 *   ② `changeset version` bumps package.json and writes the expected
 *      CHANGELOG entry, then consumes the changeset;
 *   ③ `versions:check` catches the copies that did not follow, and
 *      `versions:sync` brings them along, lockfiles included.
 *
 *   npx tsx scripts/test-release.ts
 */

import { spawnSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHANGESET_CLI = resolve(ROOT, "node_modules/@changesets/cli/bin.js")
const SUMMARY = "component-api: Add the `xs` size to Button."

const tmp = mkdtempSync(join(tmpdir(), "dsai-release-"))
const failures: string[] = []

function expect(ok: boolean, what: string) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${what}`)
  if (!ok) failures.push(what)
}

function run(command: string, args: string[], cwd = ROOT) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" })
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}` }
}

const script = (name: string, ...args: string[]) =>
  run("npx", ["tsx", `scripts/${name}.ts`, "--root", tmp, ...args])

const readJson = (file: string) =>
  JSON.parse(readFileSync(join(tmp, file), "utf-8")) as {
    version: string
    dependencies: Record<string, string>
    packages?: Record<string, { version: string }>
  }

const changeset = (name: string, bump: string, summary: string) =>
  writeFileSync(
    join(tmp, ".changeset", name),
    `---\n"dsaireadable": ${bump}\n---\n\n${summary}\n`
  )

try {
  mkdirSync(join(tmp, ".changeset"))
  mkdirSync(join(tmp, "mcp-server"))
  mkdirSync(join(tmp, "packages/eslint-plugin"), { recursive: true })
  mkdirSync(join(tmp, ".claude-plugin"))
  for (const file of [
    "package.json",
    "package-lock.json",
    "design-system.index.json",
    "mcp-server/package.json",
    "packages/eslint-plugin/package.json",
    ".claude-plugin/marketplace.json",
    ".changeset/config.json",
  ]) {
    cpSync(resolve(ROOT, file), join(tmp, file))
  }
  writeFileSync(join(tmp, "CHANGELOG.md"), "# Changelog\n")
  // changesets finds its root through git
  run("git", ["init", "-q"], tmp)
  const before = readJson("package.json").version
  expect(
    before === readJson("design-system.index.json").version,
    `every file starts at ${before}`
  )

  // ① the policy
  changeset("visual-minor.md", "minor", "visual: Round the corners of Card.")
  const refused = script("lint-changesets")
  expect(
    !refused.ok && refused.output.includes('"visual" is patch, not minor'),
    "the lint refuses a visual change declared as minor"
  )
  rmSync(join(tmp, ".changeset/visual-minor.md"))
  changeset("uncategorized.md", "patch", "Fix a typo.")
  expect(
    !script("lint-changesets").ok,
    "the lint refuses a summary with no category"
  )
  rmSync(join(tmp, ".changeset/uncategorized.md"))

  changeset("button-xs.md", "minor", SUMMARY)
  expect(
    script("lint-changesets").ok,
    "the lint accepts a changeset that follows the policy"
  )

  // ② changeset version
  const versioned = run(process.execPath, [CHANGESET_CLI, "version"], tmp)
  expect(versioned.ok, "changeset version runs")
  const after = readJson("package.json").version
  expect(
    after === "0.1.0",
    `a minor changeset takes ${before} to 0.1.0 (got ${after})`
  )
  const changelog = readFileSync(join(tmp, "CHANGELOG.md"), "utf-8")
  expect(
    changelog.includes(`## 0.1.0\n\n### Minor Changes\n\n- ${SUMMARY}\n`),
    "the CHANGELOG gets the entry, under the version and its bump"
  )
  expect(
    !existsSync(join(tmp, ".changeset/button-xs.md")),
    "the changeset is consumed"
  )

  // ③ the copies of the version
  const drift = script("sync-versions", "--check")
  expect(
    !drift.ok &&
      [
        "design-system.index.json",
        "mcp-server/package.json",
        "packages/eslint-plugin/package.json",
        "package-lock.json",
        ".claude-plugin/marketplace.json",
      ].every((file) => drift.output.includes(file)),
    "versions:check catches every copy that did not follow"
  )
  expect(script("sync-versions").ok, "versions:sync runs")
  expect(
    script("sync-versions", "--check").ok,
    "versions:check passes after the sync"
  )
  expect(
    readJson("design-system.index.json").version === "0.1.0" &&
      readJson("mcp-server/package.json").version === "0.1.0" &&
      readJson("packages/eslint-plugin/package.json").version === "0.1.0" &&
      readJson("mcp-server/package.json").dependencies[
        "@dsaireadable/eslint-plugin"
      ] === "0.1.0" &&
      ["", "mcp-server", "packages/eslint-plugin"].every(
        (key) =>
          readJson("package-lock.json").packages?.[key].version === "0.1.0"
      ),
    "the index, the server, the plugin (and the server's pin of it) and every lockfile entry carry 0.1.0"
  )
  const marketplace = readFileSync(
    join(tmp, ".claude-plugin/marketplace.json"),
    "utf-8"
  )
  expect(
    marketplace.includes('"version": "0.1.0"') &&
      marketplace.includes('"@dsaireadable/mcp-server@0.1.0"'),
    "the Claude Code plugin and the server it starts carry 0.1.0"
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\n❌ test-release: ${failures.length} failed`)
  process.exit(1)
}
console.log("\n✅ test-release: the release pipeline holds")
