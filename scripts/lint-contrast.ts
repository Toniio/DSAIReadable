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
import { FOCUS_RING, FOCUS_RING_DESTRUCTIVE } from "../lib/focus.js"
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
  /** Measured and printed, never blocking: a part that is not the indicator. */
  informative?: boolean
  /** Which printed list an informative pair belongs to; the halo by default. */
  section?: "halo" | "border"
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

/**
 * The ring color class of a focus preset in a mode, and its alpha:
 * `focus-visible:ring-ring/50` paints the ring color at 0.5. A `dark:` class
 * of the preset wins in dark.
 */
function halo(preset: string, role: string, mode: Mode) {
  const ring = new RegExp(`^(dark:)?focus-visible:ring-${role}(?:/(\\d+))?$`)
  const classes = preset.split(/\s+/).flatMap((c) => {
    const m = ring.exec(c)
    return m
      ? [
          {
            dark: !!m[1],
            class: `ring-${role}${m[2] ? `/${m[2]}` : ""}`,
            alpha: m[2] ? Number(m[2]) / 100 : 1,
          },
        ]
      : []
  })
  const found =
    (mode === "dark" && classes.find((c) => c.dark)) ||
    classes.find((c) => !c.dark)
  if (!found)
    throw new Error(`No focus-visible:ring-${role} class in "${preset}"`)
  return found
}

const PAIRS: Pair[] = [
  // Focus indicators — non-text contrast against the surface they sit on.
  // The solid part, at full alpha: `border-ring` or `outline-ring`, and
  // `border-destructive` or `outline-destructive` on an invalid control or a
  // destructive variant.
  ...SURFACES.map(([bg, surface]) => ({
    label: `focus indicator (border-ring, outline-ring) on the ${surface}`,
    fg: "color.border.focus",
    bg,
    threshold: 3 as const,
  })),
  ...SURFACES.map(([bg, surface]) => ({
    label: `invalid or destructive focus indicator (border-destructive, outline-destructive) on the ${surface}`,
    fg: "color.feedback.error.default",
    bg,
    threshold: 3 as const,
  })),
  // A control inside a field (an InputGroupButton) draws its indicator on the
  // field's fill, `dark:bg-input/30`.
  ...SURFACES.map(([bg, surface]) => ({
    label: `focus indicator on a field's dark:bg-input/30 fill over the ${surface}`,
    fg: "color.border.focus",
    bg,
    tint: { color: "color.border.input", alpha: 0.3 },
    threshold: 3 as const,
    modes: ["dark" as Mode],
  })),
  // The resting border of a form control against what it sits on.
  ...SURFACES.map(([bg, surface]) => ({
    label: `resting border of a field, checkbox or radio (border-input) on the ${surface}`,
    fg: "color.border.input",
    bg,
    threshold: 3 as const,
    informative: true,
    section: "border" as const,
  })),
  {
    label: "sidebar focus ring on sidebar surface",
    fg: "color.sidebar.ring",
    bg: "color.sidebar.background",
    threshold: 3,
  },
  // The halo around the solid part, painted at the alpha of lib/focus.ts.
  ...SURFACES.flatMap(([bg, surface]) =>
    MODES.flatMap((mode) => [
      {
        label: `focus halo (${halo(FOCUS_RING, "ring", mode).class}) on the ${surface}`,
        fg: "color.border.focus",
        fgAlpha: halo(FOCUS_RING, "ring", mode).alpha,
        bg,
        threshold: 3 as const,
        modes: [mode],
        informative: true,
      },
      {
        label: `destructive focus halo (${halo(FOCUS_RING_DESTRUCTIVE, "destructive", mode).class}) on the ${surface}`,
        fg: "color.feedback.error.default",
        fgAlpha: halo(FOCUS_RING_DESTRUCTIVE, "destructive", mode).alpha,
        bg,
        threshold: 3 as const,
        modes: [mode],
        informative: true,
      },
    ])
  ),

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
  ...(["success", "warning"] as const).map((role) => ({
    label: `${role} foreground on ${role} surface`,
    fg: `color.feedback.${role}.foreground`,
    bg: `color.feedback.${role}.default`,
    threshold: 4.5 as const,
  })),
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

  // Action text (`text-primary`) on neutral surfaces: the link variants of
  // Button and Badge, a link hovered in EmptyDescription or FieldDescription.
  ...SURFACES.map(([bg, surface]) => ({
    label: `action text on the ${surface}`,
    fg: "color.text.action.default",
    bg,
    threshold: 4.5 as const,
  })),

  // Success and warning text (`text-success`, `text-warning`) on neutral
  // surfaces: the success and warning Alerts, a status line next to a field.
  ...(["success", "warning"] as const).flatMap((role) => [
    ...SURFACES.map(([bg, surface]) => ({
      label: `${role} text on the ${surface}`,
      fg: `color.text.${role}.default`,
      bg,
      threshold: 4.5 as const,
    })),
    {
      label: `${role} Alert description (text-${role}/90) on the card`,
      fg: `color.text.${role}.default`,
      fgAlpha: 0.9,
      bg: "color.background.subtle",
      threshold: 4.5 as const,
    },
  ]),

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
  //   Badge    success, warning  /10 → /20 as a hovered link, dark /20
  ...(["success", "warning"] as const).flatMap((role) =>
    tinted(
      `${role} Badge label`,
      `color.text.${role}.default`,
      `color.feedback.${role}.default`,
      { light: [0.1, 0.2], dark: [0.2] }
    )
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
