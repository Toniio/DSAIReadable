/**
 * shadcn/ui API compatibility — every way a component's API departs from
 * shadcn/ui's is declared in `design-system.index.json`.
 *
 * Models know the shadcn/ui API from their training data: it is the surface
 * they get right without being told. Every undeclared divergence (a renamed
 * prop, a removed export, another default) is a place where an agent writes
 * the vanilla API and gets code that does not compile, or that compiles and
 * behaves differently. The policy (AGENTS.md § 1): divergences are additive,
 * and the few that are not are declared, machine-readable, and served by the
 * MCP server with the component's spec.
 *
 * The upstream API is not fetched on every run: `shadcn-api.baseline.json`
 * holds it, extracted from the shadcn/ui registry (the style of
 * `components.json`) by the same TypeScript reader as `specs:api`. The check
 * compares each component file with it, offline:
 *
 * - exports: added, removed, or of another kind (a component, a hook);
 * - for a component, the element that receives its props, and each prop it
 *   accepts: added, removed, another type, another default. A prop whose type
 *   is a union of literals (`size`, `variant`) is compared value by value;
 *   a default read from `UI_STRINGS` is compared by its text.
 *
 * Each difference must match one `shadcn.divergences` entry of the index, and
 * each entry one difference: a declaration the code no longer needs fails too.
 *
 * Coverage: the baseline also lists every `registry:ui` item of the upstream
 * registry. Each one is either in the inventory or excluded, with its reason,
 * in the index's `shadcn.excluded` — so a component shadcn/ui adds later fails
 * the first check after the baseline is refetched, instead of going unseen
 * while agents import it from memory.
 *
 *   npx tsx scripts/lint-shadcn-api.ts            # the check (offline)
 *   npx tsx scripts/lint-shadcn-api.ts --update   # refetch the upstream API (network)
 */

import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { UI_STRINGS } from "../lib/ui-strings"
import { apiOf, loadProgram, type ApiExport } from "./lib/component-api"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const BASELINE_FILE = "shadcn-api.baseline.json"
const UPSTREAM_DIR = ".shadcn-upstream"
const UPDATE = process.argv.includes("--update")

type DivergenceType = "added" | "removed" | "renamed" | "changed"

/** One declared divergence (`design-system.schema.json` documents the fields). */
interface Divergence {
  export?: string
  prop?: string
  value?: string
  type: DivergenceType
  upstream?: string
  note: string
}

/** A shadcn/ui item the design system does not ship, and what to use. */
interface Exclusion {
  item: string
  reason: string
  instead?: string
}

interface Entry {
  name: string
  code_path: string
  shadcn: { item: string | null; divergences: Divergence[] }
}

interface BaselineProp {
  /**
   * The type, for a prop the component file declares. A prop it inherits
   * (Radix, Recharts, the DOM) comes from the same package on both sides, and
   * the checker prints the same type differently from one file to another.
   */
  type?: string
  default?: string
}

type BaselineExport =
  | {
      name: string
      kind: "component"
      element: string
      /** Its base props type, as written: `React.ComponentProps<"div">`. */
      base?: string
      /** Key of the set of React DOM attributes it accepts, in `dom`. */
      dom: string
      /** Every other prop: the component's own, and its library's (Radix…). */
      props: Record<string, BaselineProp>
    }
  | { name: string; kind: "hook"; signature: string }
  | { name: string; kind: "variants" }
  | { name: string; kind: "other"; type: string }

interface Baseline {
  source: string
  fetched: string
  /**
   * The React DOM attributes the exports accept, by set: `common` holds those
   * most sets share, and each set lists what it adds to them (`type` and
   * `form` for a button…) and what it lacks (every one, for a provider).
   */
  dom: {
    common: string[]
    sets: Record<string, { add?: string[]; drop?: string[] }>
  }
  /** Upstream API by registry item; an item shadcn/ui does not have is absent. */
  items: Record<string, BaselineExport[]>
  /** Items looked up and not found upstream. */
  absent: string[]
  /** Every `registry:ui` item of the upstream registry, by name. */
  upstream: string[]
}

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as T

const index = readJson<{
  inventory: Entry[]
  shadcn: { excluded: Exclusion[] }
}>("design-system.index.json")
const inventory = index.inventory
const excluded = index.shadcn.excluded
const itemOf = (entry: Entry) => basename(entry.code_path, ".tsx")

/** A default as the reader sees it: `UI_STRINGS.dialog.close` is its text. */
function defaultText(code: string | undefined): string | undefined {
  if (code === undefined) return undefined
  const path = code.match(/^UI_STRINGS((?:\.\w+)+)$/)?.[1]
  if (!path) return code
  let value: unknown = UI_STRINGS
  for (const key of path.slice(1).split("."))
    value = (value as Record<string, unknown>)[key]
  return typeof value === "string" ? JSON.stringify(value) : code
}

/** The API of one file, in the baseline's shape. */
function snapshot(api: ApiExport[], domSets: Map<string, string[]>) {
  return api.map((e): BaselineExport => {
    if (e.kind === "hook")
      return {
        name: e.name,
        kind: "hook",
        signature: `${e.signature}: ${e.returns}`,
      }
    if (e.kind !== "component") return e
    const dom = [...e.accepts.values()]
      .filter((p) => p.dom)
      .map((p) => p.name)
      .sort()
    const key = createHash("sha1").update(dom.join(",")).digest("hex")
    domSets.set(key.slice(0, 10), dom)
    const props: Record<string, BaselineProp> = {}
    for (const p of [...e.accepts.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ))
      if (!p.dom)
        props[p.name] = {
          ...(p.own && { type: p.type }),
          ...(p.default !== undefined && { default: defaultText(p.default) }),
        }
    return {
      name: e.name,
      kind: "component",
      element: e.renders.element,
      ...(e.rest !== undefined && { base: e.rest }),
      dom: key.slice(0, 10),
      props,
    }
  })
}

// ── --update: extract the upstream API ──────────────────────────────

async function update() {
  const { style } = readJson<{ style: string }>("components.json")
  const source = `https://ui.shadcn.com/r/styles/${style}`
  const dir = resolve(ROOT, UPSTREAM_DIR)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  // The registry's icons are a placeholder the CLI swaps for the chosen kit.
  writeFileSync(
    resolve(dir, "icon-placeholder.tsx"),
    "export function IconPlaceholder(_props: Record<string, unknown>) {\n  return null\n}\n"
  )

  try {
    const registry = await fetch(`${source}/registry.json`)
    if (!registry.ok)
      throw new Error(`${source}/registry.json: HTTP ${registry.status}`)
    const upstream = (
      (await registry.json()) as { items: { name: string; type: string }[] }
    ).items
      .filter((i) => i.type === "registry:ui")
      .map((i) => i.name)
      .sort()

    const items = [
      ...new Set(
        inventory.flatMap((e) =>
          e.shadcn?.item ? [itemOf(e), e.shadcn.item] : [itemOf(e)]
        )
      ),
    ]
    const found: string[] = []
    const absent: string[] = []
    for (const item of items) {
      const response = await fetch(`${source}/${item}.json`)
      if (response.status === 404) {
        absent.push(item)
        continue
      }
      if (!response.ok)
        throw new Error(`${source}/${item}.json: HTTP ${response.status}`)
      const json = (await response.json()) as {
        files: { path: string; content: string }[]
      }
      const file = json.files.find((f) => f.path.endsWith(`/${item}.tsx`))
      if (!file) throw new Error(`${item}: no ${item}.tsx in the registry item`)
      const unknown: string[] = []
      const content = file.content.replace(
        /from "([^"]+)"/g,
        (whole, from: string) => {
          if (from === "cn") return 'from "@/lib/utils"'
          if (from.endsWith("/icon-placeholder"))
            return 'from "./icon-placeholder"'
          const local = from.match(/^@\/registry\/[^/]+\/(ui|hooks|lib)\/(.+)$/)
          if (local)
            return local[1] === "ui"
              ? `from "./${local[2]}"`
              : `from "@/${local[1]}/${local[2]}"`
          if (from.startsWith("@/")) unknown.push(from)
          return whole
        }
      )
      if (unknown.length > 0)
        throw new Error(`${item}: unknown import(s) ${unknown.join(", ")}`)
      writeFileSync(resolve(dir, `${item}.tsx`), content)
      found.push(item)
    }

    const files = found.map((item) => `${UPSTREAM_DIR}/${item}.tsx`)
    const program = loadProgram(ROOT, files)
    // An import that does not resolve types its props as `any`: every
    // comparison with it would pass.
    const unresolved = ts
      .getPreEmitDiagnostics(program)
      .filter(
        (d) => d.code === 2307 && d.file?.fileName.includes(`/${UPSTREAM_DIR}/`)
      )
      .map(
        (d) =>
          `${basename(d.file!.fileName)}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`
      )
    if (unresolved.length > 0)
      throw new Error(
        `unresolved upstream imports:\n  ${unresolved.join("\n  ")}`
      )

    const domSets = new Map<string, string[]>()
    const baseline: Baseline = {
      source,
      fetched: new Date().toISOString().slice(0, 10),
      dom: { common: [], sets: {} },
      items: {},
      absent: absent.sort(),
      upstream,
    }
    for (const item of found.sort())
      baseline.items[item] = snapshot(
        apiOf(program, resolve(dir, `${item}.tsx`)),
        domSets
      )
    const sets = [...domSets].sort(([a], [b]) => a.localeCompare(b))
    const names = [...new Set(sets.flatMap(([, set]) => set))].sort()
    const common = names.filter(
      (name) =>
        sets.filter(([, set]) => set.includes(name)).length * 2 > sets.length
    )
    baseline.dom = {
      common,
      sets: Object.fromEntries(
        sets.map(([key, set]) => {
          const add = set.filter((name) => !common.includes(name))
          const drop = common.filter((name) => !set.includes(name))
          return [
            key,
            {
              ...(add.length > 0 && { add }),
              ...(drop.length > 0 && { drop }),
            },
          ]
        })
      ),
    }
    writeFileSync(
      resolve(ROOT, BASELINE_FILE),
      JSON.stringify(baseline, null, 2) + "\n"
    )
    console.log(
      `✅ ${BASELINE_FILE}: ${found.length} items from ${source}, ${absent.length} absent upstream (${absent.join(", ")}), ${upstream.length} registry:ui items upstream.`
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// ── The check ────────────────────────────────────────────────────────

/** One way the code departs from the baseline. */
interface Finding {
  export?: string
  prop?: string
  value?: string
  type: "added" | "removed" | "changed"
  upstream?: string
  /** What the code has, for the report. */
  ours?: string
}

const LITERAL = /^(?:"[^"]*"|-?\d+(?:\.\d+)?)$/
/** `"sm" | "md"` → ["sm", "md"]; undefined when a member is not a literal. */
function literals(type: string): string[] | undefined {
  const members = type.split(" | ")
  return members.length > 1 && members.every((m) => LITERAL.test(m))
    ? members.map((m) => m.replace(/^"|"$/g, ""))
    : undefined
}

function compare(
  ours: BaselineExport[],
  theirs: BaselineExport[],
  baseline: Baseline,
  domSets: Map<string, string[]>
): Finding[] {
  const findings: Finding[] = []
  const mine = new Map(ours.map((e) => [e.name, e]))
  const upstream = new Map(theirs.map((e) => [e.name, e]))
  for (const name of upstream.keys())
    if (!mine.has(name)) findings.push({ export: name, type: "removed" })
  for (const name of mine.keys())
    if (!upstream.has(name)) findings.push({ export: name, type: "added" })

  for (const [name, t] of upstream) {
    const o = mine.get(name)
    if (!o) continue
    if (o.kind !== t.kind) {
      findings.push({
        export: name,
        type: "changed",
        upstream: t.kind,
        ours: o.kind,
      })
      continue
    }
    if (o.kind === "hook" && t.kind === "hook" && o.signature !== t.signature)
      findings.push({
        export: name,
        type: "changed",
        upstream: t.signature,
        ours: o.signature,
      })
    if (o.kind === "other" && t.kind === "other" && o.type !== t.type)
      findings.push({
        export: name,
        type: "changed",
        upstream: t.type,
        ours: o.type,
      })
    if (o.kind !== "component" || t.kind !== "component") continue

    // The registry's icons are a placeholder the CLI swaps for the chosen kit.
    if (o.element !== t.element && t.element !== "IconPlaceholder")
      findings.push({
        export: name,
        type: "changed",
        upstream: t.element,
        ours: o.element,
      })
    // The element the props are typed for; a local alias's name
    // (`CarouselProps`) is not API, the props it holds are compared below.
    const [ob, tb] = [elementTypes(o.base), elementTypes(t.base)]
    if (ob !== tb)
      findings.push({ export: name, type: "changed", upstream: tb, ours: ob })

    const set = baseline.dom.sets[t.dom] ?? {}
    const theirDom = new Set(
      [...baseline.dom.common, ...(set.add ?? [])].filter(
        (name) => !set.drop?.includes(name)
      )
    )
    const ourDom = new Set(domSets.get(o.dom) ?? [])
    for (const prop of theirDom)
      if (!ourDom.has(prop) && !(prop in o.props))
        findings.push({ export: name, prop, type: "removed" })
    for (const prop of ourDom)
      if (!theirDom.has(prop) && !(prop in t.props))
        findings.push({ export: name, prop, type: "added" })

    for (const [prop, tp] of Object.entries(t.props)) {
      const op = o.props[prop]
      if (!op) {
        if (!ourDom.has(prop))
          findings.push({ export: name, prop, type: "removed" })
        continue
      }
      const [ov, tv] = [literals(op.type ?? ""), literals(tp.type ?? "")]
      if (op.type === undefined || tp.type === undefined) {
        // An inherited prop on one side: nothing to compare but its presence.
      } else if (ov && tv) {
        for (const value of tv)
          if (!ov.includes(value))
            findings.push({ export: name, prop, value, type: "removed" })
        for (const value of ov)
          if (!tv.includes(value))
            findings.push({ export: name, prop, value, type: "added" })
      } else if (op.type !== tp.type)
        findings.push({
          export: name,
          prop,
          type: "changed",
          upstream: tp.type,
          ours: op.type,
        })
      if (op.default !== tp.default)
        findings.push({
          export: name,
          prop,
          type: "changed",
          upstream: `= ${tp.default ?? "(none)"}`,
          ours: `= ${op.default ?? "(none)"}`,
        })
    }
    for (const prop of Object.keys(o.props))
      if (!(prop in t.props) && !theirDom.has(prop))
        findings.push({ export: name, prop, type: "added" })
  }
  return findings
}

/** `React.ComponentProps<"div"> & CarouselProps` → `React.ComponentProps<"div">`. */
const elementTypes = (base: string | undefined) =>
  (base?.match(/\b(?:React\.)?ComponentProps\w*<[^>]+>/g) ?? []).join(" & ") ||
  "(none)"

const where = (d: { export?: string; prop?: string; value?: string }) =>
  [d.export, d.prop].filter(Boolean).join(".") +
  (d.value !== undefined ? `="${d.value}"` : "")

/** Whether a declaration and a finding point at the same place. */
const samePlace = (
  d: { export?: string; prop?: string; value?: string },
  f: { export?: string; prop?: string; value?: string }
) => d.export === f.export && d.prop === f.prop && d.value === f.value

/**
 * The findings a declaration accounts for. `renamed` names the new place and,
 * in `upstream`, the old name at the same level: it stands for one addition
 * and one removal.
 */
function covers(d: Divergence, findings: Finding[]): Finding[] {
  if (d.type === "renamed") {
    if (d.upstream === undefined) return []
    const old =
      d.value !== undefined
        ? { ...d, value: d.upstream }
        : d.prop !== undefined
          ? { ...d, prop: d.upstream }
          : { ...d, export: d.upstream }
    const added = findings.find((f) => f.type === "added" && samePlace(d, f))
    const removed = findings.find(
      (f) => f.type === "removed" && samePlace(old, f)
    )
    if (!added || !removed) return []
    // A renamed value that was the default is still the default.
    const defaulted = findings.find(
      (f) =>
        d.value !== undefined &&
        f.type === "changed" &&
        f.export === d.export &&
        f.prop === d.prop &&
        f.upstream === `= ${JSON.stringify(d.upstream)}` &&
        f.ours === `= ${JSON.stringify(d.value)}`
    )
    return defaulted ? [added, removed, defaulted] : [added, removed]
  }
  return findings.filter(
    (f) =>
      f.type === d.type &&
      samePlace(d, f) &&
      (d.type !== "changed" || f.upstream === d.upstream)
  )
}

function check() {
  const baseline = readJson<Baseline>(BASELINE_FILE)
  const program = loadProgram(
    ROOT,
    inventory.map((e) => e.code_path)
  )
  const problems: string[] = []
  let declared = 0

  for (const entry of inventory) {
    const { shadcn } = entry
    if (!shadcn) {
      problems.push(`${entry.name}: no "shadcn" field in the index`)
      continue
    }
    const divergences = shadcn.divergences ?? []
    declared += divergences.length

    if (shadcn.item === null) {
      if (baseline.items[itemOf(entry)])
        problems.push(
          `${entry.name}: declared outside shadcn/ui ("item": null), but the registry has a "${itemOf(entry)}" item — compare it and declare its divergences`
        )
      const whole = divergences.filter(
        (d) => d.type === "added" && !d.export && !d.prop
      )
      if (whole.length !== 1 || divergences.length !== 1)
        problems.push(
          `${entry.name}: a component outside shadcn/ui declares exactly one divergence, { "type": "added", "note": "why the design system adds it" }`
        )
      continue
    }

    const theirs = baseline.items[shadcn.item]
    if (!theirs) {
      problems.push(
        `${entry.name}: "item": "${shadcn.item}" is not in ${BASELINE_FILE} (absent upstream, or run --update)`
      )
      continue
    }

    const domSets = new Map<string, string[]>()
    const ours = snapshot(
      apiOf(program, resolve(ROOT, entry.code_path)),
      domSets
    )
    const findings = compare(ours, theirs, baseline, domSets)
    const accounted = new Set<Finding>()
    for (const d of divergences) {
      const covered = covers(d, findings)
      if (covered.length === 0)
        problems.push(
          `${entry.name}: declared divergence ${d.type} ${where(d) || "(component)"}${d.upstream !== undefined ? ` (upstream: ${d.upstream})` : ""} matches nothing in the code — remove it or fix it`
        )
      covered.forEach((f) => accounted.add(f))
    }
    for (const f of findings) {
      if (accounted.has(f)) continue
      const suggestion: Divergence = {
        ...(f.export !== undefined && { export: f.export }),
        ...(f.prop !== undefined && { prop: f.prop }),
        ...(f.value !== undefined && { value: f.value }),
        type: f.type,
        ...(f.upstream !== undefined && { upstream: f.upstream }),
        note: "…",
      }
      problems.push(
        `${entry.name}: undeclared divergence from shadcn/ui — ${f.type} ${where(f)}${f.upstream !== undefined ? `: upstream ${f.upstream}, here ${f.ours}` : ""}\n    resorb it, or declare it in design-system.index.json: ${JSON.stringify(suggestion)}`
      )
    }
  }

  // Coverage: every upstream component is shipped or excluded, once.
  const adopted = new Set(
    inventory.flatMap((e) => (e.shadcn?.item ? [e.shadcn.item] : []))
  )
  for (const item of baseline.upstream)
    if (!adopted.has(item) && !excluded.some((x) => x.item === item))
      problems.push(
        `shadcn/ui item "${item}" is neither in the inventory nor excluded — adopt it (a component whose "shadcn.item" is "${item}") or declare it in "shadcn.excluded" with its reason`
      )
  for (const x of excluded) {
    if (!baseline.upstream.includes(x.item))
      problems.push(
        `"shadcn.excluded" lists "${x.item}", which is not a registry:ui item of ${baseline.source} — remove it`
      )
    if (adopted.has(x.item))
      problems.push(
        `"shadcn.excluded" lists "${x.item}", which a component of the inventory derives from — remove one of the two`
      )
    if (x.instead && !inventory.some((e) => e.name === x.instead))
      problems.push(
        `"shadcn.excluded" sends "${x.item}" to "${x.instead}", which is not a component of the inventory`
      )
  }

  if (problems.length > 0) {
    console.error(
      `❌ shadcn/ui API compatibility: ${problems.length} problem(s) (baseline ${baseline.source}, ${baseline.fetched}).\n`
    )
    for (const p of problems) console.error(`  ${p}`)
    console.error(
      "\n  Policy: AGENTS.md § 1 — the shadcn/ui API is the contract; a divergence is additive, justified and declared."
    )
    process.exit(1)
  }
  const outside = inventory.filter((e) => e.shadcn.item === null).length
  console.log(
    `✅ shadcn/ui API compatibility: ${inventory.length - outside} components match ${baseline.source} (${baseline.fetched}) up to their ${declared - outside} declared divergence(s); ${outside} components are outside shadcn/ui. Upstream coverage: ${baseline.upstream.length}/${baseline.upstream.length} registry:ui items, ${adopted.size} shipped and ${excluded.length} excluded.`
  )
}

if (UPDATE) await update()
else check()
