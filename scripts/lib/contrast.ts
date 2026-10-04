import { PAIRS, type Pair } from "./contrast-pairs.js"
import { apcaContrast, blend, luminance } from "../wcag.js"
import {
  MODES,
  srgbCss,
  type Mode,
  type Tokens,
} from "../../mcp-server/src/lib/dtcg.js"

/**
 * The contrast of every pair of scripts/lib/contrast-pairs.ts, in each of its
 * modes, measured on a set of tokens as it renders: a `bg-<role>/<n>` tint
 * composited onto the surface under it, a `text-<role>/<n>` label onto that.
 * scripts/lint-contrast.ts reports it on the committed tokens;
 * scripts/test-rebrand.ts replays it on a palette regenerated in memory. No
 * side effect: importing it measures nothing.
 */

type Json = Record<string, unknown>

export interface Measure {
  pair: Pair
  mode: Mode
  /** The foreground and background as painted. */
  fg: string
  bg: string
  /** How `bg` was painted: the surface, or the tint over it. */
  under: string
  ratio: number
  pass: boolean
  /** APCA lightness contrast, unsigned. */
  lc: number
}

const REF = /^\{(.+)\}$/

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * A `bg-<role>/<n>` tint over `surface`. A role that is itself translucent
 * (`color.border.input` is white at 15% in dark) multiplies the two alphas.
 */
function tint(color: string, alpha: number, surface: string): string {
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(color)
  if (!rgba) return blend(color, alpha, surface)
  const hex = `#${rgba
    .slice(1, 4)
    .map((v) => Number(v).toString(16).padStart(2, "0"))
    .join("")}`
  return blend(hex, alpha * Number(rgba[4]), surface)
}

export function measureContrast(tokens: Tokens): Measure[] {
  // The three tiers form one DTCG document: `{primitive.color.mist.500}`
  // lives in primitive.json, `{color.text.default}` in semantic.json.
  const tiers = Object.values(tokens.tiers).map((t) => t.tree)

  function lookup(path: string): Json | undefined {
    for (const tier of tiers) {
      let node: unknown = tier
      let found = true
      for (const key of path.split(".")) {
        if (typeof node === "object" && node !== null && key in (node as Json))
          node = (node as Json)[key]
        else {
          found = false
          break
        }
      }
      if (found && typeof node === "object" && node !== null)
        return node as Json
    }
    return undefined
  }

  /**
   * Resolves a token path down to its sRGB value (the `hex` fallback, or
   * rgba() when translucent), following mode overrides.
   */
  function resolveColor(
    path: string,
    mode: Mode,
    seen = new Set<string>()
  ): string {
    if (seen.has(`${path}:${mode}`))
      throw new Error(`Reference cycle on ${path} (${mode})`)
    seen.add(`${path}:${mode}`)
    const node = lookup(path)
    if (!node) throw new Error(`Unknown token: ${path}`)
    const value = tokens.override(path, mode) ?? node.$value
    if (value === undefined) throw new Error(`Token ${path} has no $value`)
    const ref = typeof value === "string" ? REF.exec(value) : null
    return ref ? resolveColor(ref[1], mode, seen) : srgbCss(value)
  }

  const measures: Measure[] = []
  for (const pair of PAIRS)
    for (const mode of pair.modes ?? MODES) {
      const surface = resolveColor(pair.bg, mode)
      const bg = pair.tint
        ? tint(resolveColor(pair.tint.color, mode), pair.tint.alpha, surface)
        : surface
      const fg = tint(resolveColor(pair.fg, mode), pair.fgAlpha ?? 1, bg)
      const value = ratio(fg, bg)
      measures.push({
        pair,
        mode,
        fg,
        bg,
        under: pair.tint
          ? `${pair.tint.color} at ${pair.tint.alpha} over ${pair.bg} = ${bg}`
          : `${pair.bg} = ${bg}`,
        ratio: value,
        pass: value >= pair.threshold,
        lc: Math.abs(apcaContrast(fg, bg)),
      })
    }
  return measures
}
