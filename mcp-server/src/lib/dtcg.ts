/**
 * DTCG 2025.10 values → CSS.
 *
 * tokens/*.json hold values in the Format Module 2025.10 object shapes
 * (`{ colorSpace, components }`, `{ value, unit }`, `[x1, y1, x2, y2]`…),
 * checked by Terrazzo (scripts/lint-dtcg.ts). Everything that prints a token
 * value — tokens.css, the token reference, the MCP context — goes through
 * `cssValue`, so the JSON and its CSS cannot disagree.
 *
 * The three tiers form one DTCG document: the primitives live under the
 * `primitive` group, and a semantic token names one in full,
 * `{primitive.radius.md}`.
 *
 * The light and dark modes come from the DTCG Resolver Module 2025.10:
 * tokens/tokens.resolver.json merges the three tiers, then the `color-scheme`
 * modifier. `loadTokens` is the only reader of that file; every script and
 * the MCP generator get a token's value in a mode from it.
 */

import { readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"

/** Root group of tokens/primitive.json, the private Tier 1. */
export const PRIMITIVE_ROOT = "primitive"

/** The `$type` values of the DTCG Format Module 2025.10. */
export const DTCG_TYPES = new Set([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "strokeStyle",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography",
])

type Dimension = { value: number; unit: string }
type Color = {
  colorSpace: string
  components: number[]
  alpha?: number
  hex?: string
}
type ShadowLayer = {
  color: Color
  offsetX: Dimension
  offsetY: Dimension
  blur: Dimension
  spread: Dimension
  inset?: boolean
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)

function colorCss(color: Color): string {
  if (color.colorSpace !== "srgb")
    throw new Error(`Unsupported color space "${color.colorSpace}"`)
  const bytes = color.components.map((c) => Math.round(c * 255))
  const hex = `#${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}`
  if (color.hex !== undefined && color.hex.toLowerCase() !== hex)
    throw new Error(
      `Color ${JSON.stringify(color)}: hex ${color.hex} disagrees with its components (${hex})`
    )
  return color.alpha === undefined || color.alpha === 1
    ? hex
    : `rgba(${bytes.join(", ")}, ${color.alpha})`
}

const dimensionCss = (d: Dimension) => `${d.value}${d.unit}`

/** A shadow length: a zero stays unitless, as CSS writes it. */
const lengthCss = (d: Dimension) => (d.value === 0 ? "0" : dimensionCss(d))

function shadowCss(layer: ShadowLayer): string {
  const lengths = [layer.offsetX, layer.offsetY, layer.blur]
  if (layer.spread.value !== 0) lengths.push(layer.spread)
  return [
    ...(layer.inset ? ["inset"] : []),
    ...lengths.map(lengthCss),
    colorCss(layer.color),
  ].join(" ")
}

/**
 * Print a DTCG value as CSS. A `{…}` reference comes back unchanged: the
 * caller decides which custom property it points at.
 */
export function cssValue(value: unknown, type: string | undefined): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  switch (type) {
    case "color":
      return colorCss(value as Color)
    case "dimension":
    case "duration":
      return dimensionCss(value as Dimension)
    case "cubicBezier":
      return `cubic-bezier(${(value as number[]).join(", ")})`
    case "fontFamily":
      return (value as string[]).join(", ")
    case "shadow":
      return (Array.isArray(value) ? value : [value])
        .map((layer) => shadowCss(layer as ShadowLayer))
        .join(", ")
  }
  throw new Error(
    `No CSS form for a ${type ?? "untyped"} value ${JSON.stringify(value)}`
  )
}

/** The primitive tree without its `primitive` root group. */
export function primitiveGroups(
  file: Record<string, unknown>
): Record<string, unknown> {
  const root = file[PRIMITIVE_ROOT]
  if (!isObject(root))
    throw new Error(
      `tokens/primitive.json must hold a single "${PRIMITIVE_ROOT}" group`
    )
  return root
}

// ---------------------------------------------------------------------------
// Resolver — the tiers and the color-scheme contexts
// ---------------------------------------------------------------------------

/** The resolver document, relative to the repository root. */
const RESOLVER_PATH = "tokens/tokens.resolver.json"

type Tier = "primitive" | "semantic" | "component"
export type Mode = "light" | "dark"
export const MODES: readonly Mode[] = ["light", "dark"]

/** The modifier that carries the modes, and its default context. */
const COLOR_SCHEME = "color-scheme"
const DEFAULT_MODE: Mode = "light"
const TIERS: readonly Tier[] = ["primitive", "semantic", "component"]

type Tree = Record<string, unknown>
type Ref = { $ref: string }

/** A token a context overrides: the file that does it, and its new value. */
interface Override {
  file: string
  $type?: string
  $value: unknown
}

export interface Tokens {
  /** Each tier as authored — its values are the default (light) context. */
  tiers: Record<Tier, { file: string; tree: Tree }>
  /** Per mode, the tokens its context overrides, by dotted path. */
  overrides: Record<Mode, Map<string, Override>>
  /** The value a context gives a token, or undefined when it keeps its own. */
  override(path: string, mode: Mode): unknown
}

const readJson = (file: string) =>
  JSON.parse(readFileSync(file, "utf-8")) as Tree

/** Every leaf (a node carrying `$value`) of a tree, by dotted path. */
function* leavesOf(tree: Tree, path: string[] = []): Generator<[string, Tree]> {
  for (const [key, child] of Object.entries(tree)) {
    if (key.startsWith("$") || !isObject(child)) continue
    if ("$value" in child) yield [[...path, key].join("."), child]
    else yield* leavesOf(child, [...path, key])
  }
}

/**
 * Read tokens/tokens.resolver.json: its three sets are the tiers, in that
 * order, and its `color-scheme` modifier maps `light` (the default) and
 * `dark` to the files that override them.
 */
export function loadTokens(root: string): Tokens {
  const resolverFile = resolve(root, RESOLVER_PATH)
  const doc = readJson(resolverFile)
  const fail = (message: string): never => {
    throw new Error(`${RESOLVER_PATH}: ${message}`)
  }
  const fileOf = (ref: Ref) =>
    relative(root, resolve(dirname(resolverFile), ref.$ref))

  const order = (doc.resolutionOrder as Ref[]).map((r) => r.$ref)
  const expected = [
    ...TIERS.map((t) => `#/sets/${t}`),
    `#/modifiers/${COLOR_SCHEME}`,
  ]
  if (order.join() !== expected.join())
    fail(`resolutionOrder must be ${expected.join(", ")}`)

  const sets = doc.sets as Record<string, { sources: Ref[] }>
  const tiers = Object.fromEntries(
    TIERS.map((tier) => {
      const sources = sets[tier]?.sources ?? []
      if (sources.length !== 1) fail(`set "${tier}" must have one source`)
      const file = fileOf(sources[0])
      return [tier, { file, tree: readJson(resolve(root, file)) }]
    })
  ) as Tokens["tiers"]

  const modifier = (doc.modifiers as Tree)[COLOR_SCHEME] as {
    contexts: Record<string, Ref[]>
    default?: string
  }
  if (Object.keys(modifier.contexts).sort().join() !== [...MODES].sort().join())
    fail(`"${COLOR_SCHEME}" must have the contexts ${MODES.join(", ")}`)
  if (modifier.default !== DEFAULT_MODE)
    fail(`"${COLOR_SCHEME}" must default to "${DEFAULT_MODE}"`)

  const overrides = Object.fromEntries(
    MODES.map((mode) => {
      const map = new Map<string, Override>()
      for (const ref of modifier.contexts[mode]) {
        const file = fileOf(ref)
        for (const [path, node] of leavesOf(readJson(resolve(root, file))))
          map.set(path, {
            file,
            $type: node.$type as string | undefined,
            $value: node.$value,
          })
      }
      return [mode, map]
    })
  ) as Tokens["overrides"]

  return {
    tiers,
    overrides,
    override: (path, mode) => overrides[mode].get(path)?.$value,
  }
}
