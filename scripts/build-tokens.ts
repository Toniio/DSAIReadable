/**
 * Token build — generates tokens.css from the DTCG sources in tokens/.
 *
 * tokens.css carries a "DO NOT EDIT" header but had no generator behind it,
 * so the CSS and the JSON could drift apart silently. This script makes the
 * JSON the single source of truth.
 *
 *   npx tsx scripts/build-tokens.ts           # write tokens.css
 *   npx tsx scripts/build-tokens.ts --check   # fail if tokens.css is stale (CI)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "tokens.css")

type Leaf = {
  path: string[]
  value: string
  dark?: string
}

type Group = { label: string | null; leaves: Leaf[] }

const readTokens = (name: string) =>
  JSON.parse(readFileSync(resolve(ROOT, "tokens", name), "utf-8")) as Record<
    string,
    unknown
  >

const primitive = readTokens("primitive.json")
const semantic = readTokens("semantic.json")
const component = readTokens("component.json")

/** Depth-first walk yielding every DTCG leaf (a node carrying $value). */
function* walk(
  node: Record<string, unknown>,
  path: string[] = []
): Generator<Leaf> {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") || typeof child !== "object" || child === null)
      continue
    const obj = child as Record<string, unknown>
    if ("$value" in obj) {
      const modes = (
        obj.$extensions as
          | { modes?: Record<string, { $value?: string }> }
          | undefined
      )?.modes
      yield {
        path: [...path, key],
        value: String(obj.$value),
        dark:
          modes?.dark?.$value !== undefined
            ? String(modes.dark.$value)
            : undefined,
      }
    } else {
      yield* walk(obj, [...path, key])
    }
  }
}

/** True when a dotted DTCG path exists in the given token tree. */
function hasPath(tree: Record<string, unknown>, dotted: string): boolean {
  let cur: unknown = tree
  for (const seg of dotted.split(".")) {
    if (typeof cur !== "object" || cur === null) return false
    cur = (cur as Record<string, unknown>)[seg]
  }
  return (
    typeof cur === "object" &&
    cur !== null &&
    "$value" in (cur as Record<string, unknown>)
  )
}

/**
 * Turn a DTCG value into CSS. `{color.mist.0}` becomes a var() pointing at the
 * tier below: semantic resolves against primitives, component against semantics.
 */
function toCss(
  value: string,
  tier: "primitive" | "semantic" | "component"
): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => {
    const name = ref.replace(/\./g, "-")
    if (tier === "semantic") return `var(--ds-prim-${name})`
    if (tier === "component") {
      // Prefer the semantic tier; fall back to a primitive reference.
      if (hasPath(semantic, ref)) return `var(--${name})`
      if (hasPath(primitive, ref)) return `var(--ds-prim-${name})`
      throw new Error(`Unresolved token reference "{${ref}}" in component tier`)
    }
    return `var(--${name})`
  })
}

/** Categories whose second level is meaningful enough to get its own comment. */
const SUBGROUPED = new Set(["color", "typography", "elevation"])

/** Split leaves into commented groups mirroring the DS categories. */
function groupLeaves(leaves: Leaf[]): Group[] {
  const groups: Group[] = []
  const indexByLabel = new Map<string, Group>()

  for (const leaf of leaves) {
    const [category, second] = leaf.path
    const label =
      SUBGROUPED.has(category) && leaf.path.length > 2
        ? `${category} · ${second}`
        : category
    let group = indexByLabel.get(label)
    if (!group) {
      group = { label, leaves: [] }
      indexByLabel.set(label, group)
      groups.push(group)
    }
    group.leaves.push(leaf)
  }
  return groups
}

/** Render declarations with values aligned on the longest name in the group. */
function renderGroup(
  entries: Array<{ name: string; value: string }>,
  indent = "  "
): string[] {
  const width = Math.max(...entries.map((e) => e.name.length)) + 1 // + ":"
  return entries.map(
    (e) => `${indent}${(e.name + ":").padEnd(width)} ${e.value};`
  )
}

const varName = (leaf: Leaf, prefix = "") => `--${prefix}${leaf.path.join("-")}`

function buildPrimitives(): string[] {
  const lines = [
    "/* ── Layer 1 · Primitives (private) ──────────────────────── */",
    ":root {",
  ]
  const groups = groupLeaves([...walk(primitive)])

  groups.forEach((group, i) => {
    if (i > 0) lines.push("")
    lines.push(`  /* ${group.label} */`)
    lines.push(
      ...renderGroup(
        group.leaves.map((l) => ({
          name: varName(l, "ds-prim-"),
          value: toCss(l.value, "primitive"),
        }))
      )
    )
  })

  lines.push("}")
  return lines
}

function buildSemantic(): string[] {
  const leaves = [...walk(semantic)]
  const lines = [
    "/* ── Layer 2 · Semantic (light defaults) ─────────────────── */",
    ":root {",
  ]
  const groups = groupLeaves(leaves)

  groups.forEach((group, i) => {
    if (i > 0) lines.push("")
    lines.push(`  /* ${group.label === "zindex" ? "z-index" : group.label} */`)
    lines.push(
      ...renderGroup(
        group.leaves.map((l) => ({
          name: varName(l),
          value: toCss(l.value, "semantic"),
        }))
      )
    )
  })
  lines.push("}")

  // Dark overrides, grouped the same way but without comments.
  const darkGroups = groupLeaves(leaves.filter((l) => l.dark !== undefined))
  if (darkGroups.length > 0) {
    lines.push(
      "",
      "/* ── Layer 2 · Semantic — dark mode overrides ─────────────── */",
      ".dark {"
    )
    darkGroups.forEach((group, i) => {
      if (i > 0) lines.push("")
      lines.push(
        ...renderGroup(
          group.leaves.map((l) => ({
            name: varName(l),
            value: toCss(l.dark!, "semantic"),
          }))
        )
      )
    })
    lines.push("}")
  }

  return lines
}

function buildComponent(): string[] {
  const leaves = [...walk(component)]
  const lines = [
    "/* ── Layer 3 · Component (shadcn compatibility) ───────────── */",
    ":root {",
    ...renderGroup(
      leaves.map((l) => ({
        // Drop the "shadcn" namespace: the variable name is what shadcn expects.
        name: `--${l.path.slice(1).join("-")}`,
        value: toCss(l.value, "component"),
      }))
    ),
    "}",
  ]
  return lines
}

const header = `/* ============================================================
   DS Tokens — 3-Tier CSS Output
   Generated from tokens/primitive.json + tokens/semantic.json + tokens/component.json
   DO NOT EDIT DIRECTLY — edit the source JSON files instead.
   Regenerate with: npm run tokens:build
   ============================================================ */`

const css =
  [
    header,
    "",
    ...buildPrimitives(),
    "",
    ...buildSemantic(),
    "",
    ...buildComponent(),
  ].join("\n") + "\n"

const check = process.argv.includes("--check")
const current = (() => {
  try {
    return readFileSync(OUT, "utf-8")
  } catch {
    return null
  }
})()

if (check) {
  if (current !== css) {
    console.error(
      "❌ tokens.css is out of date with tokens/*.json.\n" +
        "   Run `npm run tokens:build` and commit the result."
    )
    process.exit(1)
  }
  console.log("✅ tokens.css is up to date.")
} else {
  writeFileSync(OUT, css)
  const count =
    [...walk(primitive)].length +
    [...walk(semantic)].length +
    [...walk(component)].length
  console.log(`✅ tokens.css generated — ${count} tokens across 3 tiers.`)
}
