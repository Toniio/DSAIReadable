/**
 * DTCG 2025.10 values → CSS.
 *
 * tokens/*.json hold values in the Format Module 2025.10 object shapes
 * (`{ colorSpace, components }`, `{ value, unit }`, `[x1, y1, x2, y2]`…),
 * checked by `tz check` (terrazzo.config.ts). Everything that prints a token
 * value — tokens.css, the token reference, the MCP context — goes through
 * `cssValue`, so the JSON and its CSS cannot disagree.
 *
 * The three tiers form one DTCG document: the primitives live under the
 * `primitive` group, and a semantic token names one in full,
 * `{primitive.radius.md}`.
 */

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
