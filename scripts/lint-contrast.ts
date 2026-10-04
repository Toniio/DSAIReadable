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
 * The resting border of a field, checkbox or radio (`border-input`), and the
 * solid `bg-input` track of an unchecked Switch, are the boundary of the
 * control, which WCAG 1.4.11 asks 3:1 for: they are checked like any other
 * pair, on the surface around them and, in dark, against the field's
 * translucent fill (`bg-input-fill`, its own token since 0.2.0).
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
import { measureContrast } from "./lib/contrast.js"
import { loadTokens } from "../mcp-server/src/lib/dtcg.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * APCA Bronze Simple Mode levels matched to each WCAG 2 threshold: Lc 60 is
 * the minimum for content text, Lc 45 for large text and the solid
 * non-text elements 1.4.11 covers (a focus ring, an icon).
 */
const APCA_LEVEL = { 4.5: 60, 3: 45 } as const

let failures = 0
let checked = 0
const advisories: string[] = []
const informative: string[] = []

// The dark context comes from tokens/tokens.resolver.json.
for (const m of measureContrast(loadTokens(ROOT))) {
  const { pair, mode } = m
  if (pair.informative) {
    informative.push(
      `ℹ️  ${mode.padEnd(5)} ${m.ratio.toFixed(2).padStart(5)}      ${pair.label}`
    )
    continue
  }
  checked++
  if (!m.pass) failures++
  const line = `${m.pass ? "✅" : "❌"} ${mode.padEnd(5)} ${m.ratio.toFixed(2).padStart(5)} / ${pair.threshold}  ${pair.label}`
  if (m.pass) console.log(line)
  else console.error(`${line}\n     ${pair.fg} = ${m.fg} on ${m.under}`)

  const level = APCA_LEVEL[pair.threshold]
  if (m.lc < level)
    advisories.push(
      `⚠️  ${mode.padEnd(5)} Lc ${m.lc.toFixed(1).padStart(5)} / ${level}  ${pair.label}`
    )
}

console.log(`\n📊 ${checked} pair(s) checked, ${failures} failure(s).`)

console.log(
  "\n── The focus halo as painted (information, non-blocking) ──\n" +
    "   The 2px ring around a focus indicator's solid part, at its alpha.\n" +
    "   It never marks focus alone: tests/focus.ts requires the solid part."
)
for (const line of informative) console.log(line)

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
