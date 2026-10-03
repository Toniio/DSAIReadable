/**
 * Release pipeline test: a changeset becomes a version, a CHANGELOG entry and
 * one number everywhere the design system serves it, llms.txt links included.
 *
 * It runs the real `changeset version` and the real version scripts on a copy
 * of the files that carry the version, in a temporary directory, so the working
 * tree is never touched:
 *
 *   ① the changeset lint accepts a changeset that follows the policy and
 *      refuses one that does not (a visual change declared as minor, a
 *      category the policy does not know); `lint` and a corrective `mcp` or
 *      `skills` are patches;
 *   ② `changeset version` bumps package.json and writes the expected
 *      CHANGELOG entry, then consumes the changeset;
 *   ③ `versions:check` catches the copies that did not follow, and
 *      `versions:sync` brings them along, lockfiles included, and the links
 *      and install commands that name the release tag (the `conventions`
 *      item, the server's README, `npx skills add`, the Claude Code plugin's
 *      `ref`); it also refuses a distributed file that links to `main`;
 *   ④ `docs:llms:check` passes on the copy at the old version, fails once the
 *      version moves, and `docs:llms` takes every link of llms.txt to a file
 *      to the new tag (the documentation site's address stays as it is).
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
/** The documentation site's address, the one link of llms.txt that is not a file. */
const SITE_URL = "https://toniio.github.io/DSAIReadable/"
/** A link of llms.txt: the path of the file it opens at the release tag. */
const LINKED =
  /\]\(https:\/\/raw\.githubusercontent\.com\/Toniio\/DSAIReadable\/[^/)]+\/([^)]+)\)/g

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
  mkdirSync(join(tmp, "registry/conventions"), { recursive: true })
  for (const file of [
    "package.json",
    "package-lock.json",
    "design-system.index.json",
    "mcp-server/package.json",
    "packages/eslint-plugin/package.json",
    ".claude-plugin/marketplace.json",
    "registry/conventions/dsaireadable.md",
    "mcp-server/README.md",
    "README.md",
    ".changeset/config.json",
    "llms.txt",
  ]) {
    cpSync(resolve(ROOT, file), join(tmp, file))
  }
  // llms.txt refuses a link to a file that does not exist: copy each one, and
  // the specs it is built from. CHANGELOG.md is one; the test's own replaces it.
  for (const [, path] of readFileSync(join(tmp, "llms.txt"), "utf-8").matchAll(
    LINKED
  )) {
    mkdirSync(join(tmp, dirname(path)), { recursive: true })
    cpSync(resolve(ROOT, path), join(tmp, path))
  }
  writeFileSync(join(tmp, "CHANGELOG.md"), "# Changelog\n")
  // changesets finds its root through git
  run("git", ["init", "-q"], tmp)
  const before = readJson("package.json").version
  // A minor changeset: the next minor of whatever the repository is at.
  const [major, minor] = before.split(".").map(Number)
  const next = `${major}.${minor + 1}.0`
  expect(
    before === readJson("design-system.index.json").version,
    `every file starts at ${before}`
  )
  expect(
    script("build-llms-txt", "--check").ok,
    `llms.txt starts on the tag v${before}`
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
  changeset("unknown.md", "patch", "chore: Tidy the scripts.")
  expect(
    !script("lint-changesets").ok,
    "the lint refuses a category the policy does not know"
  )
  rmSync(join(tmp, ".changeset/unknown.md"))
  for (const [name, summary] of [
    ["lint-patch.md", "lint: Name the corrected class in a message."],
    ["mcp-patch.md", "mcp: Correct a served rule that named a class wrongly."],
    ["skills-patch.md", "skills: Correct a sentence of a skill."],
  ])
    changeset(name, "patch", summary)
  expect(
    script("lint-changesets").ok,
    "the lint accepts a patch for lint, and for a correction under mcp or skills"
  )
  for (const name of ["lint-patch.md", "mcp-patch.md", "skills-patch.md"])
    rmSync(join(tmp, ".changeset", name))
  changeset("api-patch.md", "patch", "component-api: Add the `xs` size.")
  expect(
    !script("lint-changesets").ok,
    "the lint still refuses a component-api change declared as patch"
  )
  rmSync(join(tmp, ".changeset/api-patch.md"))

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
    after === next,
    `a minor changeset takes ${before} to ${next} (got ${after})`
  )
  const changelog = readFileSync(join(tmp, "CHANGELOG.md"), "utf-8")
  expect(
    changelog.includes(`## ${next}\n\n### Minor Changes\n\n- ${SUMMARY}\n`),
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
        "registry/conventions/dsaireadable.md",
        "mcp-server/README.md",
        "README.md",
      ].every((file) => drift.output.includes(file)),
    "versions:check catches every copy that did not follow"
  )
  expect(script("sync-versions").ok, "versions:sync runs")
  expect(
    script("sync-versions", "--check").ok,
    "versions:check passes after the sync"
  )
  expect(
    readJson("design-system.index.json").version === next &&
      readJson("mcp-server/package.json").version === next &&
      readJson("packages/eslint-plugin/package.json").version === next &&
      readJson("mcp-server/package.json").dependencies[
        "@dsaireadable/eslint-plugin"
      ] === next &&
      ["", "mcp-server", "packages/eslint-plugin"].every(
        (key) => readJson("package-lock.json").packages?.[key].version === next
      ),
    `the index, the server, the plugin (and the server's pin of it) and every lockfile entry carry ${next}`
  )
  const marketplace = readFileSync(
    join(tmp, ".claude-plugin/marketplace.json"),
    "utf-8"
  )
  expect(
    marketplace.includes(`"version": "${next}"`) &&
      marketplace.includes(`"@dsaireadable/mcp-server@${next}"`),
    `the Claude Code plugin and the server it starts carry ${next}`
  )

  const text = (file: string) => readFileSync(join(tmp, file), "utf-8")
  const marketplaceRef = (
    JSON.parse(marketplace) as {
      plugins: { source: { ref: string } }[]
    }
  ).plugins[0].source.ref
  expect(
    marketplaceRef === `v${next}`,
    `the Claude Code plugin installs its skills from the tag v${next}`
  )
  const conventions = text("registry/conventions/dsaireadable.md")
  expect(
    conventions.includes(`Toniio/DSAIReadable/<item>#v${next}`) &&
      conventions.includes(
        `DSAIReadable/blob/v${next}/specs/components/<Component>.md`
      ),
    `the conventions item installs and links its specs at the tag v${next}`
  )
  expect(
    text("mcp-server/README.md").includes(
      `DSAIReadable/blob/v${next}/README.md#mcp-server`
    ) &&
      text("README.md").includes(`npx skills add Toniio/DSAIReadable#v${next}`),
    `the server's README and \`npx skills add\` name the tag v${next}`
  )
  // A link to the moving `main`, wherever it hides in what is distributed.
  mkdirSync(join(tmp, "skills"), { recursive: true })
  for (const link of [
    "https://github.com/Toniio/DSAIReadable/blob/main/specs/components/Button.md",
    "https://github.com/Toniio/DSAIReadable/tree/main/skills",
    "https://raw.githubusercontent.com/Toniio/DSAIReadable/main/llms.txt",
    "https://github.com/Toniio/DSAIReadable#mcp-server",
  ]) {
    writeFileSync(join(tmp, "skills/leak.md"), `See ${link}\n`)
    const leak = script("sync-versions", "--check")
    expect(
      !leak.ok && leak.output.includes("skills/leak.md:1"),
      `versions:check refuses a distributed file that links to ${link.replace("https://", "")}`
    )
  }
  rmSync(join(tmp, "skills/leak.md"))
  expect(
    script("sync-versions", "--check").ok,
    "versions:check passes again once the link is gone"
  )

  // ④ llms.txt, whose links name the release tag
  expect(
    !script("build-llms-txt", "--check").ok,
    "docs:llms:check catches llms.txt still on the previous tag"
  )
  expect(script("build-llms-txt").ok, "docs:llms runs")
  const links = [
    ...readFileSync(join(tmp, "llms.txt"), "utf-8").matchAll(
      /\]\((https:[^)]+)\)/g
    ),
  ].map(([, url]) => url)
  // The documentation site is an address, not a file: it has no tag.
  const files = links.filter((url) => url !== SITE_URL)
  expect(
    files.length > 0 &&
      files.every((url) =>
        url.startsWith(
          `https://raw.githubusercontent.com/Toniio/DSAIReadable/v${next}/`
        )
      ),
    `every link of llms.txt to a file names the tag v${next}`
  )
  expect(
    links.length === files.length + 1,
    "llms.txt links the documentation site once"
  )
  expect(
    script("build-llms-txt", "--check").ok,
    "docs:llms:check passes once llms.txt is regenerated"
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\n❌ test-release: ${failures.length} failed`)
  process.exit(1)
}
console.log("\n✅ test-release: the release pipeline holds")
