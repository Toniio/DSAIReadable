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
import {
  cssValue,
  fontVariableOf,
  loadTokens,
  PRIMITIVE_ROOT,
  primitiveGroups,
  type Theme,
} from "../mcp-server/src/lib/dtcg.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "tokens.css")

type Leaf = {
  path: string[]
  value: string
  /** Its value in an override file, when that file sets it. */
  override: (file: string) => string | undefined
}

type Group = { label: string | null; leaves: Leaf[] }

// The tiers and the theme contexts, as tokens/tokens.resolver.json declares them.
const tokens = loadTokens(ROOT)
// Walked without its `primitive` root group: --ds-prim-color-mist-50, not
// --ds-prim-primitive-color-mist-50.
const primitive = primitiveGroups(tokens.tiers.primitive.tree)
const semantic = tokens.tiers.semantic.tree
const component = tokens.tiers.component.tree

/** The sources of a theme's context, and the file that brings it. */
const layersOf = (theme: Theme) => tokens.layers[theme]
const lastFile = (theme: Theme) => layersOf(theme).at(-1)!.file

/** The delta one source file makes, by dotted path. */
const deltaOf = (file: string) =>
  Object.values(tokens.layers)
    .flat()
    .find((layer) => layer.file === file)?.map

/**
 * Depth-first walk yielding every DTCG leaf (a node carrying $value), with
 * its value in each override file. A font-family primitive loaded by next/font
 * reads the self-hosted face first, and names the family without it.
 */
function* walk(
  node: Record<string, unknown>,
  path: string[] = []
): Generator<Leaf> {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") || typeof child !== "object" || child === null)
      continue
    const obj = child as Record<string, unknown>
    if ("$value" in obj) {
      const type = obj.$type as string | undefined
      const dotted = [...path, key].join(".")
      const printed = cssValue(obj.$value, type)
      const variable = fontVariableOf(obj)
      yield {
        path: [...path, key],
        value: variable ? `var(${variable}, ${printed})` : printed,
        override: (file) => {
          const value = deltaOf(file)?.get(dotted)?.$value
          return value === undefined ? undefined : cssValue(value, type)
        },
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
 * Turn a DTCG value into CSS. A reference becomes a var() pointing at the tier
 * below: `{primitive.color.mist.50}` in the semantic tier, `{color.text.default}`
 * in the component tier.
 */
function toCss(
  value: string,
  tier: "primitive" | "semantic" | "component"
): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => {
    const name = ref.replace(/\./g, "-")
    if (tier === "semantic") {
      const [root, ...rest] = ref.split(".")
      if (root !== PRIMITIVE_ROOT || !hasPath(primitive, rest.join(".")))
        throw new Error(
          `Semantic token references "{${ref}}": Tier 2 may only reference a primitive, as {${PRIMITIVE_ROOT}.…}.`
        )
      return `var(--ds-prim-${rest.join("-")})`
    }
    if (tier === "component") {
      // Tier 3 aliases Tier 2 only (AGENTS.md § 2). A primitive reached from
      // here would skip the semantic decision, and its light/dark mode.
      if (hasPath(semantic, ref)) return `var(--${name})`
      if (ref.startsWith(`${PRIMITIVE_ROOT}.`))
        throw new Error(
          `Component token references the primitive "{${ref}}": Tier 3 may only reference Tier 2 (tokens/semantic.json).`
        )
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
  const dark = lastFile("dark")
  const darkGroups = groupLeaves(
    leaves.filter((l) => l.override(dark) !== undefined)
  )
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
            value: toCss(l.override(dark)!, "semantic"),
          }))
        )
      )
    })
    lines.push("}")
  }

  return lines
}

/** The Layer 3 declaration of an alias. */
const aliasName = (l: Leaf) => `--${l.path.slice(1).join("-")}`

/**
 * A nova block, in the order the cascade needs: the semantic tokens its source
 * file overrides, then the Layer 3 aliases of every token its theme changes,
 * so that a `.nova` element inside the page resolves them there and not at
 * `:root`. `.nova` beats `.dark` by source order on `<html class="nova dark">`;
 * the last selector list, of specificity (0,2,0), beats them both.
 */
function buildNovaBlock(
  theme: Theme,
  title: string,
  selector: string
): string[] {
  const file = lastFile(theme)
  const semanticGroups = groupLeaves(
    [...walk(semantic)].filter((l) => l.override(file) !== undefined)
  )
  const changed = tokens.overrides[theme]
  const aliases = [...walk(component)].filter((l) =>
    changed.has(l.value.replace(/^\{|\}$/g, ""))
  )
  const lines = [
    `/* ── ${title} ${"─".repeat(Math.max(0, 54 - title.length))} */`,
    `${selector} {`,
  ]
  semanticGroups.forEach((group, i) => {
    if (i > 0) lines.push("")
    lines.push(
      ...renderGroup(
        group.leaves.map((l) => ({
          name: varName(l),
          value: toCss(l.override(file)!, "semantic"),
        }))
      )
    )
  })
  if (aliases.length > 0) {
    lines.push("", "  /* shadcn aliases */")
    lines.push(
      ...renderGroup(
        aliases.map((l) => ({
          name: aliasName(l),
          value: toCss(l.value, "component"),
        }))
      )
    )
  }
  lines.push("}")
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
        name: aliasName(l),
        value: toCss(l.value, "component"),
      }))
    ),
    "}",
  ]
  return lines
}

const header = `/* ============================================================
   DS Tokens — 3-Tier CSS Output
   Generated from tokens/tokens.resolver.json: primitive.json + semantic.json
   (+ semantic.dark.json under .dark) + component.json, then the nova brand
   (semantic.nova.json under .nova, semantic.nova.dark.json under both)
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
    "",
    ...buildNovaBlock("nova-light", "Nova brand · light", ".nova"),
    "",
    ...buildNovaBlock(
      "nova-dark",
      "Nova brand · dark",
      ".nova.dark, .nova .dark, .dark .nova"
    ),
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
