import {
  hexToRgb,
  oklchToSrgb,
  rgbToHex,
  srgbToOklch,
  type Oklch,
} from "../../mcp-server/src/lib/dtcg.js"

/**
 * The color primitives, generated: one source color per hue becomes an
 * 11-step OKLCH ramp on lightness targets every hue shares. A step number
 * means the same lightness in every hue, so `600` on a white surface reads
 * about the same in violet, red or emerald, and a rebrand changes a source
 * color, not the semantic tier. scripts/build-palette.ts writes the result
 * into tokens/primitive.json; scripts/test-rebrand.ts regenerates it in
 * memory from another source. No side effect: importing it computes nothing.
 */

const STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const
type Step = (typeof STEPS)[number]

/**
 * OKLCH lightness of each step, shared by every hue. The ends hold the
 * neutral surfaces: 50 to 200 the light ones and the border, 800 to 950 the
 * dark ones. From 200 to 800, the steps are evenly spaced.
 */
const LIGHTNESS: Record<Step, number> = {
  "50": 0.985,
  "100": 0.965,
  "200": 0.925,
  "300": 0.83,
  "400": 0.715,
  "500": 0.59,
  "600": 0.5,
  "700": 0.4,
  "800": 0.275,
  "900": 0.218,
  "950": 0.148,
}

/**
 * The share of the source's chroma each step takes: reduced at both ends,
 * where a saturated near-white or near-black reads as a stain. A step that
 * would still fall outside the sRGB gamut loses chroma until it fits.
 */
const CHROMA: Record<Step, number> = {
  "50": 0.1,
  "100": 0.18,
  "200": 0.4,
  "300": 0.8,
  "400": 1,
  "500": 1,
  "600": 1,
  "700": 0.9,
  "800": 0.6,
  "900": 0.45,
  "950": 0.3,
}

export interface Source {
  /** The source color: its hue and chroma make the ramp. */
  hex: string
  /** What the hue is for, opening each step's description. */
  role: string
  /**
   * Degrees the hue turns from step 50 to step 950, centered on the source's
   * hue at step 500. Yellows need it: at a constant hue their dark steps turn
   * olive.
   */
  hueShift?: number
}

/** The hues, in the order tokens/primitive.json lists them. */
export const SOURCES: Record<string, Source> = {
  mist: { hex: "#67787c", role: "Cool neutral: surfaces, text and borders" },
  violet: { hex: "#432dd7", role: "Brand: actions and links" },
  red: { hex: "#e7000b", role: "Error and destructive" },
  green: { hex: "#5ea500", role: "Sequential chart scale" },
  emerald: { hex: "#00d492", role: "Success" },
  blue: { hex: "#438fbd", role: "Chart series" },
  yellow: { hex: "#e5e747", role: "Chart series" },
  amber: { hex: "#fe9a00", role: "Warning and chart series", hueShift: -50 },
  plum: { hex: "#8e51b6", role: "Chart series" },
}

/** Rounding of the stored components: enough to render back to the same hex. */
const DIGITS: Oklch = [4, 4, 2]

const inGamut = (rgb: number[]) => rgb.every((c) => c >= -1e-6 && c <= 1 + 1e-6)

/** The color at (L, C, H), with chroma reduced until it fits in sRGB. */
function fit([L, C, H]: Oklch): Oklch {
  if (inGamut(oklchToSrgb([L, C, H]))) return [L, C, H]
  let [low, high] = [0, C]
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2
    if (inGamut(oklchToSrgb([L, mid, H]))) low = mid
    else high = mid
  }
  return [L, low, H]
}

const round = (value: number, digits: number) => Number(value.toFixed(digits))

/**
 * The 8-bit color a target renders as, and its OKLCH components: those of the
 * hex itself, rounded no further than it takes to render back to that hex.
 * So the `oklch()` of tokens.css and the `hex` the contrast checks read are
 * the same color.
 */
function settle(target: Oklch): { components: Oklch; hex: string } {
  const hex = rgbToHex(oklchToSrgb(fit(target)))
  const exact = srgbToOklch(hexToRgb(hex))
  for (let extra = 0; extra < 4; extra++) {
    const components = exact.map((value, i) =>
      round(value, DIGITS[i] + extra)
    ) as Oklch
    if (components[1] === 0) components[2] = 0
    if (rgbToHex(oklchToSrgb(components)) === hex) return { components, hex }
  }
  throw new Error(`No rounding of ${JSON.stringify(exact)} renders ${hex}`)
}

/** The 11 steps of one hue. */
function ramp(
  source: Source
): Record<Step, { components: Oklch; hex: string }> {
  const [, C, H] = srgbToOklch(hexToRgb(source.hex))
  return Object.fromEntries(
    STEPS.map((step, index) => {
      const turn = (source.hueShift ?? 0) * (index / (STEPS.length - 1) - 0.5)
      const hue = (((H + turn) % 360) + 360) % 360
      return [step, settle([LIGHTNESS[step], C * CHROMA[step], hue])]
    })
  ) as Record<Step, { components: Oklch; hex: string }>
}

type Tree = Record<string, unknown>

const color = (components: Oklch, hex: string, alpha?: number) => ({
  colorSpace: "oklch",
  components,
  ...(alpha === undefined ? {} : { alpha }),
  hex,
})

/**
 * The `color` group of tokens/primitive.json: the ramps, then white, black,
 * the translucent whites of dark-mode borders and veils, and the translucent
 * inks of light-mode veils. A step no semantic token
 * reads (`referenced` holds the dotted paths under `color`) is `reserved`, as
 * the lifecycle check asks: the ramp keeps every step, so a token can move one
 * step without a new primitive.
 */
export function colorGroup(
  sources: Record<string, Source>,
  referenced: ReadonlySet<string>
): Tree {
  const group: Tree = {}
  const status = (path: string) =>
    referenced.has(path) ? {} : { $extensions: { status: "reserved" } }
  for (const [hue, source] of Object.entries(sources)) {
    const steps = ramp(source)
    group[hue] = Object.fromEntries(
      STEPS.map((step) => [
        step,
        {
          $value: color(steps[step].components, steps[step].hex),
          $type: "color",
          $description:
            `${source.role}. Step ${step}, OKLCH lightness ${LIGHTNESS[step]}, generated from ${source.hex} by scripts/build-palette.ts.` +
            (referenced.has(`${hue}.${step}`)
              ? ""
              : " No semantic token reads it yet."),
          ...status(`${hue}.${step}`),
        },
      ])
    )
  }
  group.white = {
    $value: color([1, 0, 0], "#ffffff"),
    $type: "color",
    $description:
      "Pure white: the light page and popover, and color.static.white.",
    ...status("white"),
  }
  group.black = {
    $value: color([0, 0, 0], "#000000"),
    $type: "color",
    $description:
      "Pure black: the base of color.static.black (modal scrims) and of the elevation shadows.",
    ...status("black"),
  }
  group["white-alpha"] = Object.fromEntries(
    [8, 10, 15].map((percent) => [
      String(percent),
      {
        $value: color([1, 0, 0], "#ffffff", percent / 100),
        $type: "color",
        $description: `White at ${percent}%: dark-mode borders, fills and state veils, which take the hue of the surface under them.`,
        ...status(`white-alpha.${percent}`),
      },
    ])
  )
  // The darkest neutral step, translucent: a light-mode state veil darkens
  // the page, a card or a popover alike, where one solid step would vanish
  // on the surface it equals.
  const ink = ramp(sources.mist)["950"]
  group["ink-alpha"] = Object.fromEntries(
    [5, 7].map((percent) => [
      String(percent),
      {
        $value: color(ink.components, ink.hex, percent / 100),
        $type: "color",
        $description: `The neutral ink (mist.950) at ${percent}%: light-mode state veils, which take the hue of the surface under them.`,
        ...status(`ink-alpha.${percent}`),
      },
    ])
  )
  return group
}
