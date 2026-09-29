/**
 * Token lifecycle lint — every token says whether it is meant to be used.
 *
 * Before this script, nothing told an agent which tokens were live: 27
 * primitives no token referenced (the `mauve` palette, shadow alphas whose
 * values the elevation tokens embed literally instead of referencing, spacing
 * steps components reach through Tailwind's own scale) sat next
 * to 20 semantic tokens nothing consumed. An agent reading the files could not
 * tell a valid-but-unused decision from dead weight.
 *
 * Statuses live in `$extensions.status`; deprecation uses the standard DTCG
 * `$deprecated` property instead.
 *
 *   active     consumed — aliased by the component tier, bridged by
 *              styles/globals.css, read with var() in components/, lib/ or
 *              hooks/, for a breakpoint used as its `sm:` variant, for a
 *              container width used as its class (`max-w-sm`) or its `@sm:`
 *              container-query variant, or,
 *              for a font family, loaded by next/font under its variable
 *              (lint-font-tokens checks it names that font)
 *   reserved   a deliberate decision nothing consumes yet; its $description
 *              states the intent
 *   $deprecated  still resolvable, must not be used anywhere
 *
 * Rules:
 *   ① every semantic token declares a status (or `$deprecated`);
 *   ② a status says what the code does: `active` must be consumed, `reserved`
 *      must not be — a reserved token that gains a consumer is promoted;
 *   ③ a `$deprecated` token has no consumer left;
 *   ④ every primitive is referenced by the tiers above, or declared
 *      `reserved` — so a dead primitive cannot come back unnoticed.
 *
 * The component tier is left out: its aliases exist to be bridged, and the
 * bridge lint already checks each one.
 *
 *   npx tsx scripts/lint-token-lifecycle.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { fontVariableOf, nextFontsOf } from "./lib/next-fonts.js"
import { loadTokens, PRIMITIVE_ROOT } from "../mcp-server/src/lib/dtcg.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const STATUSES = ["active", "reserved"] as const

interface Node {
  $value?: unknown
  $description?: string
  $deprecated?: boolean | string
  $extensions?: { status?: string } & Record<string, unknown>
}

const read = (rel: string) => readFileSync(resolve(ROOT, rel), "utf-8")

function leaves(
  tree: Record<string, unknown>,
  path: string[] = []
): Array<{ path: string; node: Node }> {
  return Object.entries(tree).flatMap(([key, child]) => {
    if (key.startsWith("$") || !child || typeof child !== "object") return []
    const p = [...path, key]
    return "$value" in child
      ? [{ path: p.join("."), node: child as Node }]
      : leaves(child as Record<string, unknown>, p)
  })
}

/** `{a.b.c}` references in a token's value. */
const referencesOf = (node: Node) =>
  [...JSON.stringify(node.$value).matchAll(/\{([A-Za-z0-9.-]+)\}/g)].map(
    (m) => m[1]
  )

// The tiers, and the dark context whose overrides reference primitives too
// (tokens/tokens.resolver.json).
const tokens = loadTokens(ROOT)
const primitives = leaves(tokens.tiers.primitive.tree)
const semantic = leaves(tokens.tiers.semantic.tree)
const component = leaves(tokens.tiers.component.tree)
const darkOverrides = [...tokens.overrides.dark.values()]

// The three tiers form one DTCG document, so a reference names its full path:
// `{primitive.radius.sm}` is the primitive, `{radius.sm}` the semantic token.
const semanticPaths = new Set(semantic.map((t) => t.path))
const componentRefs = component.flatMap((t) => referencesOf(t.node))

/** Primitives some token resolves to. */
const referencedPrimitives = new Set(
  [...semantic, ...component, ...darkOverrides.map((node) => ({ node }))]
    .flatMap((t) => referencesOf(t.node))
    .filter((ref) => ref.startsWith(`${PRIMITIVE_ROOT}.`))
)
/** Semantic tokens the component tier resolves to. */
const referencedByComponent = new Set(
  componentRefs.filter((ref) => semanticPaths.has(ref))
)

// Code that can read a token: the components, the shared helpers — and
// styles/globals.css, whose @theme bridge is what turns a token into a
// Tailwind utility for every consumer of the registry. app/ is left out: its
// pages are a test area, never part of the design system, so a token only
// they use is not consumed.
const walk = (dir: string): string[] =>
  readdirSync(resolve(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`
    if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(p)
    return /\.(tsx?|css)$/.test(e.name) ? [p] : []
  })
// Block comments are dropped: a comment that names a token is not a use.
const corpus = ["components", "lib", "hooks", "styles"]
  .flatMap(walk)
  .map((file) => read(file).replace(/\/\*[\s\S]*?\*\//g, ""))
  .join("\n")

const cssVar = (path: string) => `--${path.replace(/\./g, "-")}`
/** `var(--x)`, or Tailwind v4's shorthand `(--x)` / `(length:--x)`, as in
 * `ring-(length:--space-focus-ring-width)`. */
const readByCode = (path: string) =>
  new RegExp(`(?:var\\(|\\((?:[a-z-]+:)?)${cssVar(path)}[,)]`).test(corpus)

// A breakpoint is consumed by its responsive variant: Tailwind compiles `md:`
// into a media query at build time, which never reads the variable
// (lint-theme-bridge checks the two values agree).
const usesVariant = (path: string) => {
  const variant = path.match(/^breakpoint\.([\w-]+)$/)?.[1]
  return (
    variant !== undefined &&
    new RegExp(`(?<![\\w-])(?:max-)?${variant}:`).test(corpus)
  )
}

// A font family is consumed by next/font, which loads it under
// `--font-<key>`: the token describes the font rather than driving it.
const fontVariables = new Set(nextFontsOf(ROOT).loaded.map((f) => f.variable))
const loadedFont = (path: string) => {
  const variable = fontVariableOf(path)
  return variable !== undefined && fontVariables.has(variable)
}

// A container width is consumed the same way: Tailwind compiles its own value
// into `max-w-sm` and `@sm:` (lint-theme-bridge checks it equals the token).
const usesContainer = (path: string) => {
  const size = path.match(/^space\.container\.([\w-]+)$/)?.[1]
  return (
    size !== undefined &&
    new RegExp(
      `(?<![\\w-])(?:(?:max-w|min-w|w|basis)-${size}(?![\\w-])|@${size}[:/])`
    ).test(corpus)
  )
}

const consumed = (path: string) =>
  referencedByComponent.has(path) ||
  readByCode(path) ||
  usesVariant(path) ||
  usesContainer(path) ||
  loadedFont(path)

const findings: string[] = []
const count = { active: 0, reserved: 0, deprecated: 0 }

for (const { path, node } of semantic) {
  const status = node.$extensions?.status
  const used = consumed(path)
  if (node.$deprecated !== undefined) {
    count.deprecated++
    if (used)
      findings.push(
        `③ ${path} is $deprecated but still consumed — remove its uses first`
      )
    continue
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    findings.push(
      `① ${path} has no lifecycle status — add $extensions.status: "active" | "reserved", or $deprecated`
    )
    continue
  }
  count[status as "active" | "reserved"]++
  if (status === "active" && !used)
    findings.push(
      `② ${path} is "active" but nothing consumes it — mark it "reserved" with its intent, deprecate it, or delete it`
    )
  if (status === "reserved" && used)
    findings.push(
      `② ${path} is "reserved" but is consumed — promote it to "active"`
    )
}

let reservedPrimitives = 0
for (const { path, node } of primitives) {
  if (node.$extensions?.status === "reserved") {
    reservedPrimitives++
    continue
  }
  if (!referencedPrimitives.has(path))
    findings.push(
      `④ primitive ${path} is referenced by no token — delete it, or declare it "reserved" and say why in its $description`
    )
}

if (findings.length > 0) {
  console.error(`❌ lint-token-lifecycle: ${findings.length} finding(s)`)
  for (const f of findings) console.error(`   ${f}`)
  process.exit(1)
}

console.log(
  `✅ lint-token-lifecycle: ${semantic.length} semantic tokens — ${count.active} active, ` +
    `${count.reserved} reserved, ${count.deprecated} deprecated; ${primitives.length} primitives, ` +
    `every one referenced or reserved (${reservedPrimitives}).`
)
