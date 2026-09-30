/**
 * One version for the whole design system.
 *
 * Changesets versions the root `package.json` and nothing else. The same number
 * is also the design system's version served to agents (`version` in
 * `design-system.index.json`, then `design_system_version` in `ds-metadata.json`)
 * and the MCP server's (`mcp-server/package.json`, then `mcp_server_version`),
 * and the ESLint plugin's (`packages/eslint-plugin/package.json`), which the
 * server pins to the exact version it ships with: one release tag, `vX.Y.Z`,
 * names all of it. This script copies the root version to every place that
 * carries it, the workspace lockfile included, and its `--check` mode fails
 * when one of them has drifted.
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
/** The `"version"` of a workspace's entry in the lockfile (`packages["mcp-server"]`). */
const lockWorkspace = (key: string) =>
  new RegExp(
    `(^ {4}"${key}": \\{\\n {6}"name": "[^"]+",\\n {6}"version": ")[^"]*(")`,
    "m"
  )
/** The server pins the plugin to the exact version it ships with. */
const PLUGIN_PIN = /("@dsaireadable\/eslint-plugin": ")[^"]*(")/

type Json = {
  version?: string
  dependencies?: Record<string, string>
  packages?: Record<
    string,
    { version?: string; dependencies?: Record<string, string> }
  >
}

/** One place that carries the version: how to rewrite it in the text, how to read it back. */
interface Slot {
  file: string
  /** Named in the drift report. */
  label: string
  pattern: RegExp
  read: (json: Json) => string | undefined
}

const fileVersion = (file: string): Slot => ({
  file,
  label: "version",
  pattern: TOP,
  read: (json) => json.version,
})
const lockEntry = (key: string, pattern: RegExp): Slot => ({
  file: "package-lock.json",
  label: `packages["${key}"]`,
  pattern,
  read: (json) => json.packages?.[key]?.version,
})

const SLOTS: Slot[] = [
  fileVersion("design-system.index.json"),
  fileVersion("mcp-server/package.json"),
  fileVersion("packages/eslint-plugin/package.json"),
  {
    file: "mcp-server/package.json",
    label: "plugin pin",
    pattern: PLUGIN_PIN,
    read: (json) => json.dependencies?.["@dsaireadable/eslint-plugin"],
  },
  fileVersion("package-lock.json"),
  lockEntry("", LOCK_ROOT),
  lockEntry("mcp-server", lockWorkspace("mcp-server")),
  lockEntry("packages/eslint-plugin", lockWorkspace("packages/eslint-plugin")),
  {
    file: "package-lock.json",
    label: "plugin pin",
    pattern: PLUGIN_PIN,
    read: (json) =>
      json.packages?.["mcp-server"]?.dependencies?.[
        "@dsaireadable/eslint-plugin"
      ],
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

const found = ({ file, read }: Slot) =>
  read(JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as Json)

const drifted: string[] = []
const rewritten = new Set<string>()
for (const slot of SLOTS) {
  const before = found(slot)
  if (before === source) continue
  if (CHECK) {
    drifted.push(
      `${slot.file} ${slot.label}: ${before} (package.json: ${source})`
    )
    continue
  }
  writeFileSync(
    resolve(ROOT, slot.file),
    read(slot.file).replace(slot.pattern, `$1${source}$2`)
  )
  if (found(slot) !== source) {
    console.error(
      `❌ sync-versions: could not rewrite the version in ${slot.file} (${found(slot)})`
    )
    process.exit(1)
  }
  rewritten.add(slot.file)
}
for (const file of rewritten) console.log(`sync-versions: ${file} → ${source}`)

if (drifted.length > 0) {
  console.error(
    "❌ sync-versions: a version differs from package.json. Run `npm run versions:sync`.\n" +
      drifted.map((line) => `  ${line}`).join("\n")
  )
  process.exit(1)
}
if (CHECK) console.log(`✅ sync-versions: every version is ${source}`)
