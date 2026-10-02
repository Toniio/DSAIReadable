/**
 * Re-anchoring on shadcn/ui: each component is re-anchored (its upstream
 * component run through the re-tokenization codemod, plus the classes it
 * declares adding, with the reason), a fork (which also declares the upstream
 * classes it drops), or outside shadcn/ui (no upstream item).
 *
 * `shadcn-upstream.json` holds the three parts: the upstream release the
 * components are anchored to (`upstream`), the codemod's mapping table (`map`,
 * the single source of truth for "a shadcn/ui class → the design system's"),
 * and the classification of the 65 components (`components`).
 *
 * The upstream component is rebuilt the way `shadcn add` writes it, offline
 * from ui.shadcn.com: the raw source of the base (`radix`) and the style sheet
 * of the style (`lyra`) are read from the shadcn/ui repository at the anchored
 * tag, the style's classes are applied by `shadcn/utils`, then the installed
 * shadcn CLI adds the items from a registry served on localhost, which runs
 * every transform of the CLI (imports, icon library, menu colors, RTL).
 *
 *   npx tsx scripts/retokenize-codemod.ts           # offline check, in `npm run check`
 *   npx tsx scripts/retokenize-codemod.ts --drift   # rebuild upstream and compare (network)
 *   npx tsx scripts/retokenize-codemod.ts --update shadcn@4.22.0
 *       # three-way merge of the upstream changes between the anchored tag and
 *       # this one into components/ui (network), then re-run --drift
 *
 * The offline check: every replacement of the table is a fixpoint, every
 * component file goes through the codemod unchanged (the design system's
 * classes are never rewritten), and each inventory entry is classified.
 * `--drift` adds: the codemod run twice gives the result of running it once,
 * a re-anchored component has exactly the classes of its retokenized upstream,
 * and a fork has exactly the differences it declares.
 */

import { execFile, spawnSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { tmpdir } from "node:os"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { promisify } from "node:util"
import * as prettier from "prettier"
import { createStyleMap, transformStyle } from "shadcn/utils"
import { equivalence, type Equivalence } from "./lib/class-equivalence"
import {
  classesOf,
  mapClass,
  replacementOf,
  retokenize,
  type ClassConstant,
  type Replacement,
  type RetokenizeMap,
} from "./lib/retokenize"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CONFIG_FILE = "shadcn-upstream.json"
const OUT_DIR = ".shadcn-vanilla"
const DRIFT = process.argv.includes("--drift")
const UPDATE_TO = (() => {
  const i = process.argv.indexOf("--update")
  return i < 0 ? undefined : process.argv[i + 1]
})()

type Status = "reanchored" | "fork" | "outside"

interface Classification {
  status: Status
  reason?: string
  /** Classes the component adds to its retokenized upstream. */
  added?: string[]
  /** A fork only: the upstream classes it drops or replaces. */
  removed?: string[]
}

interface Config {
  upstream: {
    repository: string
    ref: string
    base: string
    style: string
  }
  map: RetokenizeMap
  components: Record<string, Classification>
}

interface Entry {
  name: string
  code_path: string
  shadcn: { item: string | null }
}

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as T

const config = readJson<Config>(CONFIG_FILE)
const inventory = readJson<{ inventory: Entry[] }>(
  "design-system.index.json"
).inventory
const fileOf = (entry: Entry) => basename(entry.code_path, ".tsx")
const errors: string[] = []

async function loadConstants(): Promise<ClassConstant[]> {
  const out: ClassConstant[] = []
  for (const { name, module } of config.map.constants) {
    const path = resolve(ROOT, module.replace(/^@\//, "") + ".ts")
    const value = ((await import(pathToFileURL(path).href)) as never)[name]
    if (typeof value !== "string")
      errors.push(`map.constants: ${module} exports no string "${name}"`)
    else out.push({ name, module, value })
  }
  return out
}

/** Every replacement maps to itself: a second run changes nothing. */
function checkTable() {
  const replacements = [
    ...Object.values(config.map.classes),
    ...Object.values(config.map.utilities),
    ...Object.values(config.map.files).flatMap((r) => [
      ...Object.values(r.classes ?? {}),
      ...Object.values(r.utilities ?? {}),
    ]),
  ].map(replacementOf)
  for (const replacement of replacements)
    for (const token of replacement.split(/\s+/).filter(Boolean)) {
      const again = mapClass(token, "", config.map)
      if (again !== token)
        errors.push(
          `map: "${token}" is a replacement, but the table maps it again, to "${again}"`
        )
    }
  for (const [pattern] of config.map.patterns)
    try {
      new RegExp(pattern)
    } catch {
      errors.push(`map.patterns: invalid regular expression ${pattern}`)
    }
}

/**
 * Every entry of the table that does not draw what its upstream class drew
 * says why. `map` is checked as it is: a bare string must be provably the same
 * CSS, an entry with a `reason` is taken as the declaration of the change.
 */
function unexplained(map: RetokenizeMap, same: Equivalence): string[] {
  const out: string[] = []
  const check = (
    where: string,
    from: string,
    replacement: Replacement,
    equal: boolean
  ) => {
    if (typeof replacement === "string") {
      if (!equal)
        out.push(
          `${where}["${from}"] → "${replacement}" does not draw what "${from}" draws, and gives no reason: write {"to": "${replacement}", "reason": "…"}`
        )
    } else if (!replacement.reason.trim())
      out.push(`${where}["${from}"]: an empty reason`)
  }
  const rules = (
    where: string,
    entries: Record<string, Replacement> | undefined
  ) => {
    for (const [from, replacement] of Object.entries(entries ?? {}))
      check(
        where,
        from,
        replacement,
        same.sameClasses(from, replacementOf(replacement))
      )
  }
  rules("map.classes", map.classes)
  rules("map.utilities", map.utilities)
  for (const [item, rule] of Object.entries(map.files)) {
    rules(`map.files.${item}.classes`, rule.classes)
    rules(`map.files.${item}.utilities`, rule.utilities)
  }
  const values = (
    where: string,
    entries: Record<string, Replacement> | undefined
  ) => {
    for (const [from, replacement] of Object.entries(entries ?? {}))
      check(
        where,
        from,
        replacement,
        same.sameValue(from, replacementOf(replacement))
      )
  }
  values("map.values", map.values)
  for (const [item, rule] of Object.entries(map.files))
    values(`map.files.${item}.values`, rule.values)
  return out
}

/** The table's reasons, and the proof that this check still catches a change. */
async function checkReasons() {
  const same = await equivalence(ROOT)
  errors.push(...unexplained(config.map, same))

  // Canaries on arbitrary values, which no token change can move: a changed
  // value, a removed class and a class swallowed by the design system must be
  // told from the same value spelled another way.
  const canary = (entries: Record<string, string>): string[] =>
    unexplained(
      {
        classes: entries,
        utilities: {},
        patterns: [],
        values: {},
        files: {},
        constants: [],
      },
      same
    )
  const flagged = canary({
    "w-[100px]": "w-[96px]",
    "w-[6rem]": "w-[96px]",
    "duration-[1s]": "duration-[1000ms]",
    "gap-[calc(1rem+8px)]": "gap-[24px]",
    "min-w-[1px]": "",
    "opacity-[50%]": "opacity-[0.5]",
  })
  const want = ['"w-[100px]"', '"min-w-[1px]"']
  if (
    flagged.length !== want.length ||
    !want.every((key, i) => flagged[i]?.includes(key))
  )
    errors.push(
      `map: the check of reasons no longer tells a changed value from the same value spelled another way; it flagged:\n${flagged.join("\n") || "(nothing)"}`
    )
}

function checkClassification() {
  const names = new Set(inventory.map(fileOf))
  for (const entry of inventory) {
    const c = config.components[fileOf(entry)]
    if (!c) {
      errors.push(`components: "${fileOf(entry)}" is not classified`)
      continue
    }
    if (!["reanchored", "fork", "outside"].includes(c.status))
      errors.push(`components.${fileOf(entry)}: unknown status "${c.status}"`)
    if ((c.status === "outside") !== (entry.shadcn.item === null))
      errors.push(
        `components.${fileOf(entry)}: "outside" exactly when the index declares no shadcn/ui item`
      )
    const declares = !!c.added?.length || !!c.removed?.length
    if ((c.status !== "reanchored" || declares) && !c.reason)
      errors.push(
        `components.${fileOf(entry)}: a ${c.status} component that declares classes, or is not re-anchored, says why ("reason")`
      )
    if (c.status === "fork" && !c.removed?.length)
      errors.push(
        `components.${fileOf(entry)}: a fork drops upstream classes ("removed"); one that only adds classes is re-anchored`
      )
    if (c.status !== "fork" && c.removed)
      errors.push(
        `components.${fileOf(entry)}: only a fork drops upstream classes ("removed")`
      )
    if (c.status === "outside" && c.added)
      errors.push(`components.${fileOf(entry)}: "outside" declares no classes`)
  }
  for (const name of Object.keys(config.components))
    if (!names.has(name))
      errors.push(`components: "${name}" is not in the inventory`)
}

/** The codemod leaves the design system's own files as they are. */
async function checkFixpoint(constants: ClassConstant[]) {
  for (const entry of inventory) {
    const source = readFileSync(resolve(ROOT, entry.code_path), "utf-8")
    const out = await format(
      retokenize(source, fileOf(entry), config.map, constants),
      fileOf(entry)
    )
    if (out !== source)
      errors.push(
        `${entry.code_path}: the codemod would rewrite it — a class the table maps is back, or a constant's classes are spelled out:\n${lineDiff(source, out)}`
      )
  }
}

function lineDiff(a: string, b: string) {
  const [x, y] = [a.split("\n"), b.split("\n")]
  const out: string[] = []
  for (let i = 0; i < Math.max(x.length, y.length) && out.length < 8; i++)
    if (x[i] !== y[i]) out.push(`    - ${x[i] ?? ""}`, `    + ${y[i] ?? ""}`)
  return out.join("\n")
}

// ── The upstream build (network) ─────────────────────────────────────

async function fetchText(path: string, ref: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${config.upstream.repository}/${encodeURIComponent(ref)}/${path}`
  const response = await fetch(url)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.text()
}

/**
 * The upstream components at `ref`, as `shadcn add` writes them into this
 * repository, then formatted by its Prettier configuration.
 */
async function buildUpstream(ref: string): Promise<Map<string, string>> {
  const { base, style } = config.upstream
  const components = readJson<{ tailwind: { baseColor: string } }>(
    "components.json"
  )
  const css = await fetchText(`apps/v4/registry/styles/style-${style}.css`, ref)
  const color = await fetchText(
    `apps/v4/public/r/colors/${components.tailwind.baseColor}.json`,
    ref
  )
  if (!css || !color) throw new Error(`${ref}: no style-${style}.css or color`)
  const styleMap = createStyleMap(css)

  const served = new Map<string, string>()
  served.set(`/r/colors/${components.tailwind.baseColor}.json`, color)
  const items = [
    ...new Set(
      inventory.flatMap((e) => (e.shadcn.item ? [e.shadcn.item] : []))
    ),
  ]
  const found: string[] = []
  for (const item of items) {
    const raw = await fetchText(
      `apps/v4/registry/bases/${base}/ui/${item}.tsx`,
      ref
    )
    if (raw === null) {
      errors.push(`${item}: no upstream source at ${ref}`)
      continue
    }
    const content = (await transformStyle(raw, { styleMap }))
      .replaceAll(`@/registry/bases/${base}/`, `@/registry/${base}-${style}/`)
      .replaceAll('from "cn"', 'from "@/lib/utils"')
    served.set(
      `/r/styles/${base}-${style}/${item}.json`,
      JSON.stringify({
        name: item,
        type: "registry:ui",
        files: [
          {
            path: `registry/${base}-${style}/ui/${item}.tsx`,
            type: "registry:ui",
            content,
          },
        ],
      })
    )
    found.push(item)
  }

  const server = createServer((req, res) => {
    const body = served.get(req.url ?? "")
    res.writeHead(body ? 200 : 404, { "content-type": "application/json" })
    res.end(body ?? "{}")
  })
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done))
  const { port } = server.address() as AddressInfo

  const project = mkdtempSync(join(tmpdir(), "shadcn-vanilla-"))
  try {
    const pkg = readJson<Record<string, unknown>>("package.json")
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify({
        name: "vanilla",
        private: true,
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
      })
    )
    writeFileSync(
      join(project, "components.json"),
      readFileSync(resolve(ROOT, "components.json"))
    )
    writeFileSync(
      join(project, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./*"] } } })
    )
    mkdirSync(join(project, "styles"))
    // The CLI keeps `font-heading` when the style sheet defines --font-heading.
    writeFileSync(
      join(project, "styles/globals.css"),
      readFileSync(resolve(ROOT, "styles/globals.css"))
    )
    mkdirSync(join(project, "lib"))
    writeFileSync(
      join(project, "lib/utils.ts"),
      readFileSync(resolve(ROOT, "lib/utils.ts"))
    )
    symlinkSync(resolve(ROOT, "node_modules"), join(project, "node_modules"))
    await promisify(execFile)(
      resolve(ROOT, "node_modules/.bin/shadcn"),
      ["add", ...found, "--yes", "--overwrite", "--silent"],
      {
        cwd: project,
        env: { ...process.env, REGISTRY_URL: `http://127.0.0.1:${port}/r` },
        maxBuffer: 64 * 1024 * 1024,
      }
    )
    const out = new Map<string, string>()
    for (const item of found) {
      const file = join(project, "components/ui", `${item}.tsx`)
      out.set(item, await format(readFileSync(file, "utf-8"), item))
    }
    return out
  } finally {
    server.close()
    rmSync(project, { recursive: true, force: true })
  }
}

async function format(source: string, item: string) {
  const filepath = resolve(ROOT, "components/ui", `${item}.tsx`)
  const options = (await prettier.resolveConfig(filepath)) ?? {}
  return prettier.format(source, { ...options, filepath })
}

/** Multiset difference: what `a` has that `b` has not. */
function minus(a: string[], b: string[]) {
  const left = [...b]
  return a.filter((x) => {
    const i = left.indexOf(x)
    if (i < 0) return true
    left.splice(i, 1)
    return false
  })
}

const sameList = (a: string[], b: string[]) =>
  [...a].sort().join("\n") === [...b].sort().join("\n")

async function drift(constants: ClassConstant[]) {
  const { ref } = config.upstream
  const upstream = await buildUpstream(ref)
  const outDir = resolve(ROOT, OUT_DIR, ref)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const rows: string[] = []
  const counts: Record<Status, number> = { reanchored: 0, fork: 0, outside: 0 }
  for (const entry of inventory) {
    const item = fileOf(entry)
    const c = config.components[item]
    if (!c) continue
    counts[c.status]++
    if (!entry.shadcn.item) continue
    const vanilla = upstream.get(entry.shadcn.item)
    if (!vanilla) continue
    const once = await format(
      retokenize(vanilla, item, config.map, constants),
      item
    )
    const twice = await format(
      retokenize(once, item, config.map, constants),
      item
    )
    if (twice !== once)
      errors.push(`${item}: the codemod is not idempotent on the upstream file`)
    writeFileSync(join(outDir, `${item}.tsx`), once)

    const ours = classesOf(
      readFileSync(resolve(ROOT, entry.code_path), "utf-8"),
      constants
    )
    const theirs = classesOf(once, constants)
    const removed = minus(theirs, ours)
    const added = minus(ours, theirs)
    rows.push(
      `  ${item.padEnd(18)} ${c.status.padEnd(10)} -${removed.length} +${added.length}`
    )
    if (!sameList(c.removed ?? [], removed) || !sameList(c.added ?? [], added))
      errors.push(
        `${item}: ${c.status}, but its classes differ from the retokenized upstream (${OUT_DIR}/${ref}/${item}.tsx) other than it declares:\n    "removed": ${JSON.stringify(removed)}\n    "added":   ${JSON.stringify(added)}\n  Adopt the upstream classes, map them in "map", or declare the difference with its reason.`
      )
  }
  console.log(
    `${ref}: ${counts.reanchored} re-anchored, ${counts.fork} forks, ${counts.outside} outside shadcn/ui (retokenized upstream in ${OUT_DIR}/${ref}/)\n${rows.join("\n")}`
  )
}

/** The head of a file: its directive and imports, up to the last import. */
function importsOf(text: string) {
  const imports = [...text.matchAll(/^import [\s\S]*?from "[^"]+"\n/gm)]
  const last = imports.at(-1)
  return last ? text.slice(0, last.index + last[0].length) : ""
}

/** Three-way merge of the upstream changes from the anchored tag to `to`. */
async function update(to: string, constants: ClassConstant[]) {
  const from = config.upstream.ref
  const [before, after] = [await buildUpstream(from), await buildUpstream(to)]
  const work = mkdtempSync(join(tmpdir(), "shadcn-merge-"))
  const conflicts: string[] = []
  try {
    for (const entry of inventory) {
      const item = entry.shadcn.item
      if (!item || !before.has(item) || !after.has(item)) continue
      const name = fileOf(entry)
      const base = await format(
        retokenize(before.get(item)!, name, config.map, constants),
        name
      )
      const theirs = await format(
        retokenize(after.get(item)!, name, config.map, constants),
        name
      )
      if (base === theirs) continue
      const ours = resolve(ROOT, entry.code_path)
      // The imports are the component's own (its constants, UI_STRINGS):
      // both upstream sides take them, so only the code merges.
      const head = importsOf(readFileSync(ours, "utf-8"))
      const withHead = (text: string) =>
        head + text.slice(importsOf(text).length)
      writeFileSync(join(work, "base"), withHead(base))
      writeFileSync(join(work, "theirs"), withHead(theirs))
      const result = spawnSync("git", [
        "merge-file",
        "-L",
        "ours",
        "-L",
        from,
        "-L",
        to,
        ours,
        join(work, "base"),
        join(work, "theirs"),
      ])
      if (result.status !== 0) conflicts.push(entry.code_path)
      console.log(
        `${entry.code_path}: merged${result.status !== 0 ? " with conflicts" : ""}`
      )
    }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
  console.log(
    `\nSet "upstream.ref" to "${to}" in ${CONFIG_FILE}, resolve ${conflicts.length} conflict(s), then run --drift and npm run check.`
  )
}

const constants = await loadConstants()
checkTable()
await checkReasons()
checkClassification()
await checkFixpoint(constants)
if (UPDATE_TO) await update(UPDATE_TO, constants)
else if (DRIFT) await drift(constants)

if (errors.length > 0) {
  console.error(`❌ ${errors.length} error(s):\n\n${errors.join("\n\n")}`)
  process.exit(1)
}
const reanchored = Object.values(config.components).filter(
  (c) => c.status === "reanchored"
).length
console.log(
  `✅ re-tokenization: the table is a fixpoint, the ${inventory.length} components go through the codemod unchanged, ${reanchored} are re-anchored on ${config.upstream.ref}${DRIFT ? " and match their retokenized upstream" : ""}.`
)
