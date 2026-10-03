/**
 * Contrast lint — every foreground/background pair the design system actually
 * ships must meet its WCAG 2.2 threshold, in both modes.
 *
 * The other token linters check structure (naming, references, freshness);
 * none of them can see that a perfectly well-formed token pair is unreadable.
 * Six such pairs shipped at once. Contrast is a property of a *pair*, so it
 * has to be declared explicitly — it cannot be derived from the token files
 * alone. The pairs are in scripts/lib/contrast-pairs.ts, which the Audits page
 * of the documentation site reads too.
 *
 * A pair is checked as it renders, not as two tokens: a `bg-<role>/<n>` tint
 * is composited onto the surface under it, and a `text-<role>/<n>` label onto
 * that result. Checking only the solid pair let `text-destructive` on
 * `bg-destructive/10` ship at 3.99:1 while this lint was green (P3-17).
 *
 * A focus indicator is checked as it is painted, too. Its solid part (the
 * `border-ring` border of FOCUS_RING, or the `outline-ring` outline of an
 * element without a border) carries the 3:1; the 2px `ring-ring/50` halo
 * around it is painted at its alpha and reported for information only: at
 * about 1.9:1 it is never an indicator on its own, and `tests/focus.ts` fails
 * any tab stop whose indicator has no solid part.
 *
 * The resting border of a field, checkbox or radio (`border-input`) is the
 * boundary of the control, which WCAG 1.4.11 asks 3:1 for. It sits at about
 * 1.25:1 in light and 1.5:1 in dark, so it is reported for information, not
 * blocking: raising it is a change of token value, a decision of the
 * maintainer (the 0.2.0 backlog), not of a patch.
 *
 * Two levels, in a strict hierarchy:
 *   1. WCAG 2.2 AA ratios — blocking. The design system's conformance target,
 *      and the only contrast measure regulations cite today.
 *   2. APCA lightness contrast (Lc) — advisory, never blocking. WCAG 3 is a
 *      Working Draft; APCA is reported to prepare for it, not to replace
 *      WCAG 2. A pair below its Lc level is a warning to weigh the next time
 *      the tokens change, never a reason to move a token that would break a
 *      level 1 ratio.
 *
 *   npx tsx scripts/lint-contrast.ts
 */

import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { PAIRS } from "./lib/contrast-pairs.js"
import { apcaContrast, blend, luminance } from "./wcag.js"
import {
  cssValue,
  loadTokens,
  MODES,
  type Mode,
} from "../mcp-server/src/lib/dtcg.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

type Json = Record<string, unknown>

// The three tiers form one DTCG document: `{primitive.color.mist.500}` lives in
// primitive.json, `{color.text.default}` in semantic.json. The dark context
// comes from tokens/tokens.resolver.json.
const tokens = loadTokens(ROOT)
const TIERS = Object.values(tokens.tiers).map((t) => t.tree)

function lookup(path: string): Json | undefined {
  for (const tier of TIERS) {
    let node: unknown = tier
    let found = true
    for (const key of path.split(".")) {
      if (typeof node === "object" && node !== null && key in (node as Json)) {
        node = (node as Json)[key]
      } else {
        found = false
        break
      }
    }
    if (found && typeof node === "object" && node !== null) return node as Json
  }
  return undefined
}

const REF = /^\{(.+)\}$/

/** Resolves a token path down to a literal hex value, following mode overrides. */
function resolveColor(
  path: string,
  mode: Mode,
  seen = new Set<string>()
): string {
  if (seen.has(`${path}:${mode}`)) {
    throw new Error(`Reference cycle on ${path} (${mode})`)
  }
  seen.add(`${path}:${mode}`)

  const node = lookup(path)
  if (!node) throw new Error(`Unknown token: ${path}`)

  const value = tokens.override(path, mode) ?? node.$value
  if (value === undefined) throw new Error(`Token ${path} has no $value`)

  const ref = typeof value === "string" ? REF.exec(value) : null
  return ref
    ? resolveColor(ref[1], mode, seen)
    : cssValue(value, node.$type as string)
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * APCA Bronze Simple Mode levels matched to each WCAG 2 threshold: Lc 60 is
 * the minimum for content text, Lc 45 for large text and the solid
 * non-text elements 1.4.11 covers (a focus ring, an icon).
 */
const APCA_LEVEL = { 4.5: 60, 3: 45 } as const

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

let failures = 0
let checked = 0
const advisories: string[] = []
const informative: string[] = []
const restingBorders: string[] = []

for (const pair of PAIRS) {
  for (const mode of pair.modes ?? MODES) {
    if (pair.informative) {
      const bg = resolveColor(pair.bg, mode)
      const fg = tint(resolveColor(pair.fg, mode), pair.fgAlpha ?? 1, bg)
      ;(pair.section === "border" ? restingBorders : informative).push(
        `ℹ️  ${mode.padEnd(5)} ${ratio(fg, bg).toFixed(2).padStart(5)}      ${pair.label}`
      )
      continue
    }
    checked++
    const surface = resolveColor(pair.bg, mode)
    const bg = pair.tint
      ? tint(resolveColor(pair.tint.color, mode), pair.tint.alpha, surface)
      : surface
    const solid = resolveColor(pair.fg, mode)
    const fg = pair.fgAlpha ? blend(solid, pair.fgAlpha, bg) : solid
    const value = ratio(fg, bg)
    const pass = value >= pair.threshold
    if (!pass) failures++
    const mark = pass ? "✅" : "❌"
    const line = `${mark} ${mode.padEnd(5)} ${value.toFixed(2).padStart(5)} / ${pair.threshold}  ${pair.label}`
    const under = pair.tint
      ? `${pair.tint.color} at ${pair.tint.alpha} over ${pair.bg} = ${bg}`
      : `${pair.bg} = ${bg}`
    if (pass) console.log(line)
    else console.error(`${line}\n     ${pair.fg} = ${fg} on ${under}`)

    const lc = Math.abs(apcaContrast(fg, bg))
    const level = APCA_LEVEL[pair.threshold]
    if (lc < level) {
      advisories.push(
        `⚠️  ${mode.padEnd(5)} Lc ${lc.toFixed(1).padStart(5)} / ${level}  ${pair.label}`
      )
    }
  }
}

console.log(`\n📊 ${checked} pair(s) checked, ${failures} failure(s).`)

console.log(
  "\n── The focus halo as painted (information, non-blocking) ──\n" +
    "   The 2px ring around a focus indicator's solid part, at its alpha.\n" +
    "   It never marks focus alone: tests/focus.ts requires the solid part."
)
for (const line of informative) console.log(line)

console.log(
  "\n── The resting border of a control (information, non-blocking) ──\n" +
    "   `border-input` against the surface under it: the boundary WCAG 1.4.11\n" +
    "   asks 3:1 for. Below it, and a token value to decide, not to patch."
)
for (const line of restingBorders) console.log(line)

console.log(
  "\n── Level 2 — APCA advisory (WCAG 3 preparation, non-blocking) ──\n" +
    "   WCAG 2.2 AA above stays the blocking level: never move a token to\n" +
    "   clear an APCA warning if it lowers a WCAG 2 ratio below its threshold."
)
for (const advisory of advisories) console.log(advisory)
console.log(
  `📊 ${checked - advisories.length}/${checked} pair(s) at or above their APCA level (Lc 60 text, Lc 45 non-text), ${advisories.length} advisory warning(s).`
)

if (failures > 0) {
  console.error(
    "\n❌ lint-contrast: at least one pair is below its WCAG 2.2 threshold.\n" +
      "   Fix the token, do not lower the threshold."
  )
  process.exit(1)
}

console.log("\n✅ lint-contrast: all pairs meet their WCAG 2.2 AA threshold.")
