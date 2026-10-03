import {
  type ContrastGroup,
  MODES,
  type Mode,
  PAIRS,
  type Pair,
} from "@/scripts/lib/contrast-pairs"
import { darkValue, tokenByName } from "@/site/lib/tokens"

/**
 * The contrast audit, measured at build time from the resolved values of
 * tokens.manifest.json. The pairs, their thresholds and tint opacities are
 * scripts/lib/contrast-pairs.ts's, the list scripts/lint-contrast.ts holds
 * to WCAG 2.2: the page cannot show a pair the check does not run.
 */

export type { ContrastGroup }

/** The order of the groups: the blocking ones first, information last. */
const GROUP_ORDER: ContrastGroup[] = ["focus", "text", "filled", "tint", "info"]

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/** A resolved manifest color, a hex value or an rgba() one, as channels. */
function parse(value: string): Rgba {
  const text = value.trim()
  if (text.startsWith("#")) {
    const digits = text.slice(1)
    const hex =
      digits.length <= 4
        ? [...digits].map((digit) => digit + digit).join("")
        : digits
    const channel = (index: number) =>
      parseInt(hex.slice(index * 2, index * 2 + 2), 16)
    return {
      r: channel(0),
      g: channel(1),
      b: channel(2),
      a: hex.length === 8 ? channel(3) / 255 : 1,
    }
  }
  const inner = /\(([^)]*)\)/.exec(text)?.[1]
  if (text.startsWith("rgb") && inner) {
    const [r, g, b, a] = inner
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map((part) =>
        part.endsWith("%") ? Number(part.slice(0, -1)) / 100 : Number(part)
      )
    return { r, g, b, a: a ?? 1 }
  }
  throw new Error(`Unsupported color value: ${value}`)
}

/**
 * Paints `top` at `alpha` (times its own alpha) over the opaque `bottom`, as
 * the browser composites a `bg-<role>/<n>` tint: a linear mix of the
 * gamma-encoded sRGB channels, rounded to 8 bits.
 */
function over(top: Rgba, alpha: number, bottom: Rgba): Rgba {
  const weight = alpha * top.a
  const mix = (a: number, b: number) =>
    Math.round(weight * a + (1 - weight) * b)
  return {
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
    a: 1,
  }
}

/** The WCAG 2 relative luminance of an opaque sRGB color. */
function luminance({ r, g, b }: Rgba): number {
  const linear = (channel: number) => {
    const value = channel / 255
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** The WCAG 2 contrast ratio of two opaque colors, from 1 to 21. */
function ratio(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** A color as the six hex digits a `style` takes. */
function hex({ r, g, b }: Rgba): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`
}

function resolved(token: string, mode: Mode): Rgba {
  const entry = tokenByName(token)
  if (!entry) throw new Error(`Unknown token: ${token}`)
  const value = mode === "dark" ? darkValue(entry) : entry.value.light
  const color = parse(value)
  if (color.a === 1) return color
  // A translucent surface sits on the page.
  return over(color, 1, resolved("color.background.default", mode))
}

/** One mode of a pair, as painted. */
export interface Measure {
  ratio: number
  pass: boolean
  /** The foreground and background as painted, composited: data for a swatch. */
  fg: string
  bg: string
}

export interface ContrastRow {
  label: string
  group: ContrastGroup
  fg: string
  bg: string
  /** The token of the tint painted over `bg`, when there is one. */
  tint?: string
  threshold: 3 | 4.5
  informative: boolean
  light?: Measure
  dark?: Measure
}

function measure(pair: Pair, mode: Mode): Measure {
  const surface = resolved(pair.bg, mode)
  const bg = pair.tint
    ? over(parse(valueOf(pair.tint.color, mode)), pair.tint.alpha, surface)
    : surface
  const fg = over(parse(valueOf(pair.fg, mode)), pair.fgAlpha ?? 1, bg)
  const value = ratio(fg, bg)
  return {
    ratio: value,
    pass: value >= pair.threshold,
    fg: hex(fg),
    bg: hex(bg),
  }
}

function valueOf(token: string, mode: Mode): string {
  const entry = tokenByName(token)
  if (!entry) throw new Error(`Unknown token: ${token}`)
  return mode === "dark" ? darkValue(entry) : entry.value.light
}

/**
 * Every pair, one row per label: a pair measured in both modes shares a row,
 * a tint measured at another opacity in each mode takes one row per opacity.
 */
export function contrastRows(): ContrastRow[] {
  const rows = new Map<string, ContrastRow>()
  for (const pair of PAIRS) {
    const row = rows.get(pair.label) ?? {
      label: pair.label,
      group: pair.group,
      fg: pair.fg,
      bg: pair.bg,
      tint: pair.tint?.color,
      threshold: pair.threshold,
      informative: Boolean(pair.informative),
    }
    for (const mode of pair.modes ?? MODES) row[mode] = measure(pair, mode)
    rows.set(pair.label, row)
  }
  return [...rows.values()].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
  )
}

/** The blocking measurements, as the script counts them: one per pair and mode. */
export function contrastTotals(rows: ContrastRow[]) {
  const measures = rows
    .filter((row) => !row.informative)
    .flatMap((row) => [row.light, row.dark])
    .filter((entry): entry is Measure => Boolean(entry))
  return {
    checked: measures.length,
    failures: measures.filter((entry) => !entry.pass).length,
    informative: rows.filter((row) => row.informative).length,
  }
}
