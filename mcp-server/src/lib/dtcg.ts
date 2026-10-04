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

// ---------------------------------------------------------------------------
// OKLCH ↔ sRGB — Björn Ottosson's OKLab (2020), the space CSS `oklch()` uses
// ---------------------------------------------------------------------------

/** OKLCH lightness (0–1), chroma and hue (degrees). */
export type Oklch = [number, number, number]
/** Gamma-encoded sRGB channels, 0–1 when in gamut. */
export type Rgb = [number, number, number]

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
const toGamma = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055

/** sRGB → OKLCH. A gray gets hue 0. */
export function srgbToOklch(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  const H = C < 1e-4 ? 0 : (Math.atan2(B, A) * 180) / Math.PI
  return [L, C, H < 0 ? H + 360 : H]
}

/** OKLCH → sRGB, unclamped: a channel outside 0–1 is out of gamut. */
export function oklchToSrgb([L, C, H]: Oklch): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toGamma) as Rgb
}

/** `#rrggbb` of sRGB channels, each rounded to 8 bits as a screen shows it. */
export function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb
}

/** The `#rrggbb` a color's components render as. */
function hexOfComponents(color: Color): string {
  if (color.colorSpace === "srgb") return rgbToHex(color.components as Rgb)
  if (color.colorSpace === "oklch")
    return rgbToHex(oklchToSrgb(color.components as Oklch))
  throw new Error(`Unsupported color space "${color.colorSpace}"`)
}

/**
 * A color's `hex` fallback, checked against its components: the color the
 * contrast checks compute on is the one the browser renders.
 */
function checkedHex(color: Color): string {
  const hex = hexOfComponents(color)
  if (color.hex !== undefined && color.hex.toLowerCase() !== hex)
    throw new Error(
      `Color ${JSON.stringify(color)}: hex ${color.hex} disagrees with its components (${hex})`
    )
  return hex
}

const opaque = (color: Color) => color.alpha === undefined || color.alpha === 1

/** `oklch(49.2% 0.24 276.9)`, the form of Tailwind v4's own palette. */
function oklchCss(color: Color): string {
  const [L, C, H] = color.components
  const body = `${Number((L * 100).toFixed(2))}% ${C} ${H}`
  return opaque(color) ? `oklch(${body})` : `oklch(${body} / ${color.alpha})`
}

function colorCss(color: Color): string {
  if (color.colorSpace !== "oklch") return srgbCss(color)
  checkedHex(color)
  return oklchCss(color)
}

/**
 * The sRGB form of a DTCG color — its `hex`, or `rgba()` when translucent —
 * which the contrast math (scripts/wcag.ts) reads. CSS gets `cssValue`.
 */
export function srgbCss(value: unknown): string {
  const color = value as Color
  const hex = checkedHex(color)
  return opaque(color)
    ? hex
    : `rgba(${hexToRgb(hex)
        .map((c) => Math.round(c * 255))
        .join(", ")}, ${color.alpha})`
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
