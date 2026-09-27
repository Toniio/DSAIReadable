/**
 * Token documentation generator.
 *
 * `specs/tokens/token-reference.md` used to be written by hand. It drifted:
 * 105 variables documented for 276 real ones, ellipsis headings like
 * "color.chart.1 → color.chart.5" that no tool can resolve, and entries for
 * tokens that no longer existed. A reference nobody can trust is worse than
 * none, because agents read it as fact.
 *
 * Both artefacts are now derived from tokens/*.json:
 *   · tokens.manifest.json      — one entry per CSS variable, machine-readable
 *   · specs/tokens/token-reference.md — regular tables, one token per row
 *
 * The prose that only lived in the markdown (French descriptions, Do/Don't,
 * Tailwind utilities) was migrated into `$extensions.docs`, so the JSON stays
 * the single source and nothing is lost on regeneration.
 *
 *   npx tsx scripts/build-token-docs.ts [--check]
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")

const MANIFEST_PATH = resolve(ROOT, "tokens.manifest.json")
const MARKDOWN_PATH = resolve(ROOT, "specs/tokens/token-reference.md")

type Tier = "primitive" | "semantic" | "component"

interface Docs {
  description?: string
  do?: string
  dont?: string
  tailwind?: string
}

interface RawNode {
  $value?: string
  $type?: string
  $description?: string
  $deprecated?: boolean | string
  $extensions?: {
    modes?: Record<string, { $value?: string }>
    docs?: Docs
    status?: "active" | "reserved"
  }
}

interface Entry {
  token: string
  tier: Tier
  cssVar: string
  type: string
  /**
   * Lifecycle, from `$extensions.status` or `$deprecated` (checked by
   * lint-token-lifecycle). A token that declares none is "active": the
   * component tier, and primitives some token references.
   */
  status: "active" | "reserved" | "deprecated"
  source: string
  reference: { light: string; dark?: string }
  value: { light: string; dark?: string }
  description?: string
  docs?: Docs
  private?: true
}

// ---------------------------------------------------------------------------
// Load the three tiers
// ---------------------------------------------------------------------------
const read = (file: string) =>
  JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as Record<
    string,
    unknown
  >

const TIERS: Array<{
  tier: Tier
  file: string
  tree: Record<string, unknown>
}> = [
  { tier: "primitive", file: "tokens/primitive.json", tree: {} },
  { tier: "semantic", file: "tokens/semantic.json", tree: {} },
  { tier: "component", file: "tokens/component.json", tree: {} },
].map((t) => ({ ...t, tree: read(t.file) })) as never

const trees = Object.fromEntries(TIERS.map((t) => [t.tier, t.tree])) as Record<
  Tier,
  Record<string, unknown>
>

function nodeAt(
  tree: Record<string, unknown>,
  dotted: string
): RawNode | undefined {
  let cur: unknown = tree
  for (const seg of dotted.split(".")) {
    if (typeof cur !== "object" || cur === null) return undefined
    cur = (cur as Record<string, unknown>)[seg]
  }
  return typeof cur === "object" && cur !== null && "$value" in cur
    ? (cur as RawNode)
    : undefined
}

/** Leaves in file order, so the output mirrors the JSON. */
function* leaves(
  tree: Record<string, unknown>,
  prefix: string[] = []
): Generator<{ path: string[]; node: RawNode }> {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue
    if (!value || typeof value !== "object" || Array.isArray(value)) continue
    const child = value as Record<string, unknown>
    if ("$value" in child)
      yield { path: [...prefix, key], node: child as RawNode }
    else yield* leaves(child, [...prefix, key])
  }
}

/** Guidance attached to a group node covers every token beneath it. */
function inheritedDocs(tree: Record<string, unknown>, path: string[]): Docs {
  const merged: Docs = {}
  let cur: unknown = tree
  for (const seg of path) {
    if (typeof cur !== "object" || cur === null) break
    cur = (cur as Record<string, unknown>)[seg]
    const docs = (cur as RawNode | undefined)?.$extensions?.docs
    if (docs) Object.assign(merged, docs)
  }
  return merged
}

/**
 * Nodes that actually declare guidance, group nodes included. The markdown
 * prints each rule once, at the level it was written; the manifest carries the
 * effective, inherited guidance on every token.
 */
function* declaredDocs(
  tree: Record<string, unknown>,
  prefix: string[] = []
): Generator<{ path: string[]; docs: Docs; group: boolean }> {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue
    if (!value || typeof value !== "object" || Array.isArray(value)) continue
    const child = value as Record<string, unknown>
    const path = [...prefix, key]
    const docs = (child as RawNode).$extensions?.docs
    const isLeaf = "$value" in child
    if (docs && (docs.do || docs.dont)) yield { path, docs, group: !isLeaf }
    if (!isLeaf) yield* declaredDocs(child, path)
  }
}

// ---------------------------------------------------------------------------
// Resolve a value down to a literal
// ---------------------------------------------------------------------------
const BELOW: Record<Tier, Tier[]> = {
  primitive: [],
  semantic: ["primitive"],
  component: ["semantic", "primitive"],
}

function resolveValue(raw: string, tier: Tier, mode: "light" | "dark"): string {
  return raw.replace(/\{([^}]+)\}/g, (whole, ref: string) => {
    for (const below of BELOW[tier]) {
      const node = nodeAt(trees[below], ref)
      if (!node) continue
      const override = node.$extensions?.modes?.[mode]?.$value
      const next = mode === "dark" && override ? override : node.$value
      return next ? resolveValue(next, below, mode) : whole
    }
    return whole
  })
}

function cssVarFor(tier: Tier, path: string[]): string {
  if (tier === "primitive") return `--ds-prim-${path.join("-")}`
  // Tier 3 drops the "shadcn" namespace: the name is what shadcn expects.
  if (tier === "component") return `--${path.slice(1).join("-")}`
  return `--${path.join("-")}`
}

/** A dark value exists as soon as any token on the resolution chain has one. */
function hasDark(raw: string, tier: Tier): boolean {
  const refs = [...raw.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
  return refs.some((ref) =>
    BELOW[tier].some((below) => {
      const node = nodeAt(trees[below], ref)
      if (!node) return false
      if (node.$extensions?.modes?.dark) return true
      return node.$value ? hasDark(node.$value, below) : false
    })
  )
}

const entries: Entry[] = []
for (const { tier, file } of TIERS) {
  for (const { path, node } of leaves(trees[tier])) {
    const token = path.join(".")
    const lightRef = node.$value ?? ""
    const darkRef = node.$extensions?.modes?.dark?.$value
    const dark = darkRef || hasDark(lightRef, tier) ? lightRef : undefined
    const docs = { ...inheritedDocs(trees[tier], path) }

    entries.push({
      token,
      tier,
      cssVar: cssVarFor(tier, path),
      type: node.$type ?? "unknown",
      status:
        node.$deprecated !== undefined
          ? "deprecated"
          : (node.$extensions?.status ?? "active"),
      source: file,
      reference: { light: lightRef, ...(darkRef ? { dark: darkRef } : {}) },
      value: {
        light: resolveValue(lightRef, tier, "light"),
        ...(darkRef || dark
          ? { dark: resolveValue(darkRef ?? lightRef, tier, "dark") }
          : {}),
      },
      ...(node.$description ? { description: node.$description } : {}),
      ...(Object.keys(docs).length > 0 ? { docs } : {}),
      ...(tier === "primitive" ? { private: true as const } : {}),
    })
  }
}

// ---------------------------------------------------------------------------
// Coverage — the manifest must match tokens.css exactly, both ways
// ---------------------------------------------------------------------------
const cssVars = new Set(
  [
    ...readFileSync(resolve(ROOT, "tokens.css"), "utf-8").matchAll(
      /^\s*(--[\w-]+)\s*:/gm
    ),
  ].map((m) => m[1])
)
const manifestVars = new Set(entries.map((e) => e.cssVar))
const missing = [...cssVars].filter((v) => !manifestVars.has(v))
const phantom = [...manifestVars].filter((v) => !cssVars.has(v))

if (missing.length > 0 || phantom.length > 0) {
  console.error("❌ build-token-docs: manifest does not match tokens.css.")
  if (missing.length > 0)
    console.error(`   ${missing.length} undocumented: ${missing.join(", ")}`)
  if (phantom.length > 0)
    console.error(`   ${phantom.length} phantom: ${phantom.join(", ")}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const manifest =
  JSON.stringify({ tokenCount: entries.length, tokens: entries }, null, 2) +
  "\n"

const esc = (s: string) => s.replace(/\|/g, "\\|")
const code = (s?: string) => (s ? `\`${esc(s)}\`` : "—")

const FOUNDATION_TITLES: Record<string, string> = {
  color: "Color",
  space: "Space",
  typography: "Typography",
  radius: "Radius",
  elevation: "Elevation",
  motion: "Motion",
  opacity: "Opacity",
  zindex: "Z-Index",
  shadcn: "Aliases shadcn",
}

function foundationTable(rows: Entry[], showDark: boolean): string[] {
  const head = showDark
    ? "| Token | Variable CSS | Type | Statut | Light | Dark | Tailwind |"
    : "| Token | Variable CSS | Type | Statut | Valeur | Tailwind |"
  const sep = showDark
    ? "|---|---|---|---|---|---|---|"
    : "|---|---|---|---|---|---|"
  const lines = [head, sep]
  for (const e of rows) {
    const cells = showDark
      ? [
          code(e.token),
          code(e.cssVar),
          e.type,
          e.status,
          code(e.value.light),
          code(e.value.dark),
          code(e.docs?.tailwind),
        ]
      : [
          code(e.token),
          code(e.cssVar),
          e.type,
          e.status,
          code(e.value.light),
          code(e.docs?.tailwind),
        ]
    lines.push(`| ${cells.join(" | ")} |`)
  }
  return lines
}

function guidanceTable(foundation: string): string[] {
  const rows = [
    ...declaredDocs(trees.semantic),
    ...declaredDocs(trees.component),
  ].filter((d) => d.path[0] === foundation)
  if (rows.length === 0) return []
  const lines = [
    "",
    "**Règles d'usage**",
    "",
    "| Portée | ✅ Do | ❌ Don't |",
    "|---|---|---|",
  ]
  for (const r of rows) {
    const scope = r.group ? `${r.path.join(".")}.*` : r.path.join(".")
    lines.push(
      `| ${code(scope)} | ${esc(r.docs.do ?? "—")} | ${esc(r.docs.dont ?? "—")} |`
    )
  }
  return lines
}

const md: string[] = [
  "<!-- GENERATED — DO NOT EDIT.",
  "     Produced by scripts/build-token-docs.ts from tokens/*.json.",
  "     Run `npm run docs:tokens` after any token change; `npm run docs:tokens:check` guards it in CI.",
  "     Edit the JSON (including $extensions.docs) instead of this file. -->",
  "",
  "# Token Reference",
  "",
  `> ${entries.length} tokens · source \`tokens/primitive.json\` · \`tokens/semantic.json\` · \`tokens/component.json\``,
  "> Machine-readable counterpart: `tokens.manifest.json`",
  "",
  "Les tokens publics sont les tiers Semantic et Component. Le tier Primitive est privé :",
  "il est listé en fin de document uniquement pour tracer l'origine des valeurs.",
  "",
  "Colonne **Statut** : `active` — consommé par un composant, le pont `@theme` ou un autre token ;",
  "`reserved` — décision valide que rien ne consomme encore, utilisable si son rôle correspond",
  "exactement au besoin ; `deprecated` — ne plus utiliser. `npm run tokens:lint-lifecycle` garantit",
  "que le statut dit ce que fait le code.",
  "",
  "---",
]

const publicEntries = entries.filter((e) => e.tier !== "primitive")
const foundations = [
  ...new Set(publicEntries.map((e) => e.token.split(".")[0])),
]

for (const foundation of foundations) {
  const rows = publicEntries.filter((e) => e.token.split(".")[0] === foundation)
  const showDark = rows.some((e) => e.value.dark !== undefined)
  md.push(
    "",
    `## ${FOUNDATION_TITLES[foundation] ?? foundation}`,
    "",
    ...foundationTable(rows, showDark),
    ...guidanceTable(foundation),
    "",
    "---"
  )
}

const primitives = entries.filter((e) => e.tier === "primitive")
md.push(
  "",
  "## Primitives — privé, ne pas utiliser",
  "",
  "Ces variables sont le tier 1. Les référencer depuis un composant, une spec ou",
  "`globals.css` contourne les décisions du design system et casse le mode dark :",
  "`npm run tokens-validate` échoue si l'une d'elles apparaît hors de `tokens.css`.",
  "",
  ...foundationTable(primitives, false),
  ""
)

// Emitted through Prettier so the generated file passes `prettier --check`
// like every other Markdown file, instead of needing an ignore entry.
const markdown = await format(md.join("\n"), {
  ...(await resolveConfig(MARKDOWN_PATH)),
  filepath: MARKDOWN_PATH,
})

// ---------------------------------------------------------------------------
// Emit or check
// ---------------------------------------------------------------------------
const targets = [
  { path: MANIFEST_PATH, content: manifest, label: "tokens.manifest.json" },
  {
    path: MARKDOWN_PATH,
    content: markdown,
    label: "specs/tokens/token-reference.md",
  },
]

if (CHECK) {
  const stale = targets.filter((t) => {
    try {
      return readFileSync(t.path, "utf-8") !== t.content
    } catch {
      return true
    }
  })
  if (stale.length > 0) {
    console.error(
      `❌ build-token-docs: ${stale.map((s) => s.label).join(", ")} out of date.\n` +
        `   Run \`npm run docs:tokens\` and commit the result.`
    )
    process.exit(1)
  }
  console.log(
    `✅ build-token-docs: ${entries.length} tokens, documentation up to date.`
  )
  process.exit(0)
}

for (const t of targets) writeFileSync(t.path, t.content)
console.log(
  `✅ build-token-docs: ${entries.length} tokens → tokens.manifest.json + specs/tokens/token-reference.md`
)
