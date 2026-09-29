/**
 * Contrast lint — every foreground/background pair the design system actually
 * ships must meet its WCAG 2.2 threshold, in both modes.
 *
 * The other token linters check structure (naming, references, freshness);
 * none of them can see that a perfectly well-formed token pair is unreadable.
 * Six such pairs shipped at once. Contrast is a property of a *pair*, so it
 * has to be declared here explicitly — it cannot be derived from the token
 * files alone.
 *
 * A pair is checked as it renders, not as two tokens: a `bg-<role>/<n>` tint
 * is composited onto the surface under it, and a `text-<role>/<n>` label onto
 * that result. Checking only the solid pair let `text-destructive` on
 * `bg-destructive/10` ship at 3.99:1 while this lint was green (P3-17).
 *
 *   npx tsx scripts/lint-contrast.ts
 */

import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { blend, luminance } from "./wcag.js"
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

type Pair = {
  label: string
  fg: string
  bg: string
  /** 4.5 for body text, 3.0 for UI components and graphical objects (WCAG 1.4.11). */
  threshold: 3 | 4.5
  modes?: Mode[]
  /** A translucent layer painted over `bg`, as Tailwind's `bg-<role>/<n>`. */
  tint?: { color: string; alpha: number }
  /** The opacity of the foreground itself, as Tailwind's `text-<role>/<n>`. */
  fgAlpha?: number
}

/** The surfaces a component may be placed on: page, card, popover. */
const SURFACES = [
  ["color.background.default", "default surface"],
  ["color.background.subtle", "card"],
  ["color.background.elevated", "popover"],
] as const

type Surface = (typeof SURFACES)[number][0]

/**
 * One pair per surface and per tint opacity, for a label painted on a tint of
 * its own role. `alphas` lists the opacities each mode renders — rest, then
 * hover or focus — because the `dark:` classes use heavier tints.
 */
function tinted(
  label: string,
  fg: string,
  tint: string,
  alphas: Record<Mode, number[]>,
  surfaces: readonly Surface[] = SURFACES.map(([path]) => path)
): Pair[] {
  return SURFACES.filter(([path]) => surfaces.includes(path)).flatMap(
    ([bg, surface]) =>
      MODES.flatMap((mode) =>
        alphas[mode].map((alpha) => ({
          label: `${label} on a ${Math.round(alpha * 100)}% tint over the ${surface}`,
          fg,
          bg,
          tint: { color: tint, alpha },
          threshold: 4.5 as const,
          modes: [mode],
        }))
      )
  )
}

const PAIRS: Pair[] = [
  // Focus indicators — non-text contrast against the surface they sit on.
  {
    label: "focus ring on default surface",
    fg: "color.border.focus",
    bg: "color.background.default",
    threshold: 3,
  },
  {
    label: "focus ring on subtle surface",
    fg: "color.border.focus",
    bg: "color.background.subtle",
    threshold: 3,
  },
  {
    label: "sidebar focus ring on sidebar surface",
    fg: "color.sidebar.ring",
    bg: "color.sidebar.background",
    threshold: 3,
  },

  // Body text on every surface it is allowed to sit on.
  {
    label: "default text on default surface",
    fg: "color.text.default",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "default text on subtle surface",
    fg: "color.text.default",
    bg: "color.background.subtle",
    threshold: 4.5,
  },
  {
    label: "default text on elevated surface",
    fg: "color.text.default",
    bg: "color.background.elevated",
    threshold: 4.5,
  },
  {
    label: "subtle text on default surface",
    fg: "color.text.subtle",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "subtle text on subtle surface (shadcn muted-foreground on muted)",
    fg: "color.text.subtle",
    bg: "color.background.subtle",
    threshold: 4.5,
  },
  {
    label: "action text on default surface",
    fg: "color.text.action.default",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "inverse text on inverse surface",
    fg: "color.text.inverse",
    bg: "color.background.inverse",
    threshold: 4.5,
  },

  // Filled surfaces and their own foreground.
  {
    label: "primary foreground on primary surface",
    fg: "color.action.background.foreground",
    bg: "color.action.background.default",
    threshold: 4.5,
  },
  {
    label: "destructive foreground on destructive surface",
    fg: "color.feedback.error.foreground",
    bg: "color.feedback.error.default",
    threshold: 4.5,
  },
  {
    label: "sidebar active item text on sidebar active item",
    fg: "color.sidebar.primary.on",
    bg: "color.sidebar.primary.default",
    threshold: 4.5,
  },
  {
    label: "sidebar text on sidebar surface",
    fg: "color.sidebar.foreground",
    bg: "color.sidebar.background",
    threshold: 4.5,
  },

  // Destructive text (`text-destructive`) on neutral surfaces: FieldError, an
  // invalid field label, the destructive Alert, a menu item at rest.
  ...SURFACES.map(([bg, surface]) => ({
    label: `destructive text on the ${surface}`,
    fg: "color.text.destructive.default",
    bg,
    threshold: 4.5 as const,
  })),
  {
    label: "destructive Alert description (text-destructive/90) on the card",
    fg: "color.text.destructive.default",
    fgAlpha: 0.9,
    bg: "color.background.subtle",
    threshold: 4.5,
  },

  // Text on a tint of its own role — the inventory of every `text-<role>` set
  // on a `bg-<role>/<n>` across components/ui. Tints of another role (a
  // neutral label on `bg-muted/50` or `bg-input/30`) are not listed: those
  // only move a neutral surface one step, never toward the label's color.
  //   Button   destructive  /10 → /20 on hover, dark /20 → /30
  ...tinted(
    "destructive Button label",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1, 0.2], dark: [0.2, 0.3] }
  ),
  //   Badge    destructive  /10 → /20 as a hovered link, dark /20
  ...tinted(
    "destructive Badge label",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1, 0.2], dark: [0.2] }
  ),
  //   DropdownMenuItem, ContextMenuItem, MenubarItem  destructive, focused:
  //   /10, dark /20, inside a popover
  ...tinted(
    "focused destructive menu item",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1], dark: [0.2] },
    ["color.background.elevated"]
  ),
  //   Kbd inside a Tooltip  `text-background` on `bg-background/20`, dark /10,
  //   over the tooltip's `bg-foreground`
  ...MODES.map((mode) => ({
    label: "Kbd inside a Tooltip",
    fg: "color.background.default",
    bg: "color.text.default",
    tint: {
      color: "color.background.default",
      alpha: mode === "light" ? 0.2 : 0.1,
    },
    threshold: 4.5 as const,
    modes: [mode],
  })),
]

let failures = 0
let checked = 0

for (const pair of PAIRS) {
  for (const mode of pair.modes ?? MODES) {
    checked++
    const surface = resolveColor(pair.bg, mode)
    const bg = pair.tint
      ? blend(resolveColor(pair.tint.color, mode), pair.tint.alpha, surface)
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
  }
}

console.log(`\n📊 ${checked} pair(s) checked, ${failures} failure(s).`)

if (failures > 0) {
  console.error(
    "\n❌ lint-contrast: at least one pair is below its WCAG 2.2 threshold.\n" +
      "   Fix the token, do not lower the threshold."
  )
  process.exit(1)
}

console.log("✅ lint-contrast: all pairs meet their WCAG 2.2 threshold.")
