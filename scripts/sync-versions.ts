/**
 * One version for the whole design system.
 *
 * Changesets versions the root `package.json` and nothing else. The same number
 * is also the design system's version served to agents (`version` in
 * `design-system.index.json`, then `design_system_version` in `ds-metadata.json`)
 * and the MCP server's (`mcp-server/package.json`, then `mcp_server_version`),
 * and the ESLint plugin's (`packages/eslint-plugin/package.json`), which the
 * server pins to the exact version it ships with, and the Claude Code plugin's
 * (`.claude-plugin/marketplace.json`), which pins the server the same way: one
 * release tag, `vX.Y.Z`, names all of it. The links a package or a registry item
 * distributes name it too: the `conventions` item (its install line and its spec
 * link), the server's README, the root README's `npx skills add`, and the Claude
 * Code plugin's `ref`. This script copies the root version to every place that
 * carries it, the workspace lockfile included, and its `--check` mode fails
 * when one of them has drifted, or when a distributed file links to the moving
 * `main` instead (the ESLint plugin reads its own version at run time).
 *
 *   npx tsx scripts/sync-versions.ts            copy the root version everywhere
 *   npx tsx scripts/sync-versions.ts --check    fail on a place that differs
 *   --root <dir>                                act on another checkout (the release test)
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
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
/** The Claude Code plugin's entry: its one `"version"`, and the server it starts. */
const MARKETPLACE_VERSION = /("version": ")[^"]*(")/
const SERVER_PIN = /("@dsaireadable\/mcp-server@)[^"]*(")/

/**
 * A link or an install command that names the release: `blob/v0.1.1/`,
 * `<item>#v0.1.1`. The `v` stays in the text, so a pattern keeps it in its first
 * group and the version is what sits between the two.
 */
const CONVENTIONS_INSTALL = /(Toniio\/DSAIReadable\/<item>#v)[\w.-]+()/g
const CONVENTIONS_SPEC =
  /(DSAIReadable\/blob\/v)[\w.-]+(\/specs\/components\/)/g
const SERVER_README = /(DSAIReadable\/blob\/v)[\w.-]+(\/README\.md#mcp-server)/g
const SKILLS_ADD = /(npx skills add Toniio\/DSAIReadable#v)[\w.-]+()/g
const PLUGIN_REF = /("ref": "v)[^"]*(")/

type Json = {
  version?: string
  plugins?: {
    version?: string
    source?: string | { ref?: string }
    mcpServers?: Record<string, { args?: string[] }>
  }[]
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
  /** Every version the file carries there: none is a drift, a JSON field reads one. */
  read: (text: string) => (string | undefined)[]
}

/** A field of a JSON file. */
const jsonSlot = (
  file: string,
  label: string,
  pattern: RegExp,
  field: (json: Json) => string | undefined
): Slot => ({
  file,
  label,
  pattern,
  read: (text) => [field(JSON.parse(text) as Json)],
})
/** Every occurrence of a pattern in a text file (a link, an install command): what sits between its two groups. */
const textSlot = (file: string, label: string, pattern: RegExp): Slot => ({
  file,
  label,
  pattern,
  read: (text) =>
    [...text.matchAll(pattern)].map((m) =>
      m[0].slice(m[1].length, m[0].length - m[2].length)
    ),
})

const fileVersion = (file: string): Slot =>
  jsonSlot(file, "version", TOP, (json) => json.version)
const lockEntry = (key: string, pattern: RegExp): Slot =>
  jsonSlot(
    "package-lock.json",
    `packages["${key}"]`,
    pattern,
    (json) => json.packages?.[key]?.version
  )

const SLOTS: Slot[] = [
  fileVersion("design-system.index.json"),
  fileVersion("mcp-server/package.json"),
  fileVersion("packages/eslint-plugin/package.json"),
  jsonSlot(
    "mcp-server/package.json",
    "plugin pin",
    PLUGIN_PIN,
    (json) => json.dependencies?.["@dsaireadable/eslint-plugin"]
  ),
  fileVersion("package-lock.json"),
  lockEntry("", LOCK_ROOT),
  lockEntry("mcp-server", lockWorkspace("mcp-server")),
  lockEntry("packages/eslint-plugin", lockWorkspace("packages/eslint-plugin")),
  jsonSlot(
    "package-lock.json",
    "plugin pin",
    PLUGIN_PIN,
    (json) =>
      json.packages?.["mcp-server"]?.dependencies?.[
        "@dsaireadable/eslint-plugin"
      ]
  ),
  jsonSlot(
    ".claude-plugin/marketplace.json",
    "plugin version",
    MARKETPLACE_VERSION,
    (json) => json.plugins?.[0]?.version
  ),
  jsonSlot(
    ".claude-plugin/marketplace.json",
    "server pin",
    SERVER_PIN,
    (json) =>
      json.plugins?.[0]?.mcpServers?.dsaireadable?.args
        ?.find((arg) => arg.startsWith("@dsaireadable/mcp-server@"))
        ?.split("@")
        .at(-1)
  ),
  // The skills of the plugin come from the tag, like the server it starts.
  jsonSlot(
    ".claude-plugin/marketplace.json",
    "skills ref",
    PLUGIN_REF,
    (json) => {
      const source = json.plugins?.[0]?.source
      return typeof source === "object"
        ? source.ref?.replace(/^v/, "")
        : undefined
    }
  ),
  textSlot(
    "registry/conventions/dsaireadable.md",
    "install line",
    CONVENTIONS_INSTALL
  ),
  textSlot(
    "registry/conventions/dsaireadable.md",
    "spec link",
    CONVENTIONS_SPEC
  ),
  textSlot("mcp-server/README.md", "README link", SERVER_README),
  textSlot("README.md", "skills add", SKILLS_ADD),
]

/**
 * What a package or a registry item distributes must not link to the moving
 * `main`: a reader of version X reads the specs of version X (`llms.txt` does
 * the same). A bare repository link is fine; a branch, or an anchor of the
 * default branch's README, is not.
 */
const MOVING_LINKS = [
  /github\.com\/Toniio\/DSAIReadable\/(?:blob|tree|raw)\/main\b/,
  /raw\.githubusercontent\.com\/Toniio\/DSAIReadable\/main\b/,
  /github\.com\/Toniio\/DSAIReadable#/,
]
/** Where it looks: the files of each registry item, the packages and the plugin. */
const DISTRIBUTED = [
  "README.md",
  "registry/conventions",
  "packages/eslint-plugin/README.md",
  "packages/eslint-plugin/src",
  "mcp-server/README.md",
  "mcp-server/src",
  "mcp-server/context",
  "skills",
  ".claude-plugin",
]
const TEXT_FILE = /\.(?:md|json|txt|ts|tsx|mjs|js|css)$/

function filesUnder(path: string): string[] {
  const full = resolve(ROOT, path)
  if (!existsSync(full)) return []
  if (!statSync(full).isDirectory()) return [path]
  return readdirSync(full).flatMap((name) =>
    name === "node_modules" || name === "dist"
      ? []
      : filesUnder(join(path, name))
  )
}

/** The distributed files that link to `main`, with the line. */
function movingLinks(): string[] {
  const registry = existsSync(resolve(ROOT, "registry.json"))
    ? (JSON.parse(readFileSync(resolve(ROOT, "registry.json"), "utf-8")) as {
        items?: { files?: { path: string }[] }[]
      })
    : {}
  const items = (registry.items ?? []).flatMap((item) =>
    (item.files ?? []).map((file) => file.path)
  )
  return [...new Set([...DISTRIBUTED.flatMap(filesUnder), ...items])]
    .filter((file) => TEXT_FILE.test(file) && existsSync(resolve(ROOT, file)))
    .flatMap((file) =>
      readFileSync(resolve(ROOT, file), "utf-8")
        .split("\n")
        .flatMap((line, i) =>
          MOVING_LINKS.some((link) => link.test(line))
            ? [`${relative(".", file)}:${i + 1} ${line.trim().slice(0, 120)}`]
            : []
        )
    )
}

const read = (file: string) => readFileSync(resolve(ROOT, file), "utf-8")

const source = (JSON.parse(read("package.json")) as Json).version
if (!source || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(source)) {
  console.error(
    `❌ sync-versions: package.json has no valid version ("${source}")`
  )
  process.exit(1)
}

/** What a slot carries now: one version per occurrence, `undefined` for a missing one. */
const found = ({ file, read: values }: Slot) => {
  const versions = values(read(file))
  return versions.length > 0 ? versions : [undefined]
}
const inStep = (versions: (string | undefined)[]) =>
  versions.every((version) => version === source)

const drifted: string[] = []
const rewritten = new Set<string>()
for (const slot of SLOTS) {
  const before = found(slot)
  if (inStep(before)) continue
  if (CHECK) {
    drifted.push(
      `${slot.file} ${slot.label}: ${before.join(", ")} (package.json: ${source})`
    )
    continue
  }
  writeFileSync(
    resolve(ROOT, slot.file),
    read(slot.file).replace(slot.pattern, `$1${source}$2`)
  )
  if (!inStep(found(slot))) {
    console.error(
      `❌ sync-versions: could not rewrite the version in ${slot.file} (${found(slot).join(", ")})`
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
if (CHECK) {
  const moving = movingLinks()
  if (moving.length > 0) {
    console.error(
      "❌ sync-versions: a distributed file links to `main`, which moves. Link to the release tag (`blob/vX.Y.Z/…`), which `versions:sync` keeps.\n" +
        moving.map((line) => `  ${line}`).join("\n")
    )
    process.exit(1)
  }
  console.log(`✅ sync-versions: every version is ${source}`)
}
