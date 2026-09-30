/**
 * One version for the whole design system.
 *
 * Changesets versions the root `package.json` and nothing else. The same number
 * is also the design system's version served to agents (`version` in
 * `design-system.index.json`, then `design_system_version` in `ds-metadata.json`)
 * and the MCP server's (`mcp-server/package.json`, then `mcp_server_version`):
 * one release tag, `vX.Y.Z`, names all of it. This script copies the root
 * version to every place that carries it, lockfiles included, and its `--check`
 * mode fails when one of them has drifted.
 *
 *   npx tsx scripts/sync-versions.ts            copy the root version everywhere
 *   npx tsx scripts/sync-versions.ts --check    fail on a place that differs
 *   --root <dir>                                act on another checkout (the release test)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const CHECK = args.includes("--check")
const ROOT = args.includes("--root")
  ? resolve(args[args.indexOf("--root") + 1])
  : resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** The first two-space `"version"` of a file is the top-level one. */
const TOP = /^( {2}"version": ")[^"]*(")/m
/** In a lockfile, `packages[""]` is the first entry: its `"version"` is the first one indented by six spaces. */
const LOCK_ROOT = /^( {6}"version": ")[^"]*(")/m

type Json = {
  version?: string
  packages?: Record<string, { version?: string }>
}

/** Each file that carries the version, the regular expressions that rewrite it, how to read it back. */
const TARGETS: { file: string; patterns: RegExp[]; lock: boolean }[] = [
  { file: "design-system.index.json", patterns: [TOP], lock: false },
  { file: "mcp-server/package.json", patterns: [TOP], lock: false },
  { file: "package-lock.json", patterns: [TOP, LOCK_ROOT], lock: true },
  {
    file: "mcp-server/package-lock.json",
    patterns: [TOP, LOCK_ROOT],
    lock: true,
  },
]

const read = (file: string) => readFileSync(resolve(ROOT, file), "utf-8")

const source = (JSON.parse(read("package.json")) as Json).version
if (!source || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(source)) {
  console.error(
    `❌ sync-versions: package.json has no valid version ("${source}")`
  )
  process.exit(1)
}

/** The versions a file carries, in the order of its patterns. */
function versionsOf(file: string, lock: boolean): (string | undefined)[] {
  const json = JSON.parse(read(file)) as Json
  return lock ? [json.version, json.packages?.[""]?.version] : [json.version]
}

const drifted: string[] = []
for (const { file, patterns, lock } of TARGETS) {
  const found = versionsOf(file, lock)
  if (found.every((version) => version === source)) continue
  if (CHECK) {
    drifted.push(`${file}: ${found.join(", ")} (package.json: ${source})`)
    continue
  }
  let text = read(file)
  for (const pattern of patterns) text = text.replace(pattern, `$1${source}$2`)
  writeFileSync(resolve(ROOT, file), text)
  const after = versionsOf(file, lock)
  if (!after.every((version) => version === source)) {
    console.error(
      `❌ sync-versions: could not rewrite the version in ${file} (${after.join(", ")})`
    )
    process.exit(1)
  }
  console.log(`sync-versions: ${file} → ${source}`)
}

if (drifted.length > 0) {
  console.error(
    "❌ sync-versions: a version differs from package.json. Run `npm run versions:sync`.\n" +
      drifted.map((line) => `  ${line}`).join("\n")
  )
  process.exit(1)
}
if (CHECK) console.log(`✅ sync-versions: every version is ${source}`)
