import { FOCUS_RING, FOCUS_RING_DESTRUCTIVE } from "@/lib/focus"
import { darkValue, tokenByName } from "@/site/lib/tokens"

/**
 * The contrast audit, measured at build time from the resolved values of
 * tokens.manifest.json. The pairs, thresholds, tint opacities and the
 * compositing repeat scripts/lint-contrast.ts, which cannot be imported: it
 * runs its checks when loaded. A pair added there is added here too.
 */

type Mode = "light" | "dark"

const MODES: Mode[] = ["light", "dark"]

/** How the table groups the pairs. */
export type ContrastGroup = "focus" | "text" | "filled" | "tint" | "info"

/** The order of the groups: the blocking ones first, information last. */
const GROUP_ORDER: ContrastGroup[] = ["focus", "text", "filled", "tint", "info"]

interface Pair {
  label: string
  fg: string
  bg: string
  /** 4.5 for text, 3 for a focus indicator or a boundary (WCAG 1.4.11). */
  threshold: 3 | 4.5
  group: ContrastGroup
  modes?: Mode[]
  /** A translucent layer over `bg`, as Tailwind's `bg-<role>/<n>`. */
  tint?: { color: string; alpha: number }
  /** The opacity of the foreground itself, as Tailwind's `text-<role>/<n>`. */
  fgAlpha?: number
  /** Measured and shown, never blocking. */
  informative?: boolean
}

/** The surfaces a component may be placed on. */
const SURFACES = [
  ["color.background.default", "page"],
  ["color.background.subtle", "card"],
  ["color.background.elevated", "popover"],
] as const

type Surface = (typeof SURFACES)[number][0]

/** A label on a tint of its own role, one pair per surface and opacity. */
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
          group: "tint" as const,
          modes: [mode],
        }))
      )
  )
}

/**
 * The halo class of a focus preset in a mode (`utility` is its color
 * utility, without the opacity), and its alpha, as
 * scripts/lint-contrast.ts reads it from lib/focus.ts: a `dark:` class of the
 * preset wins in dark.
 */
function halo(preset: string, utility: string, mode: Mode) {
  const pattern = new RegExp(`^(dark:)?focus-visible:${utility}(?:/(\\d+))?$`)
  const found = preset.split(/\s+/).flatMap((name) => {
    const match = pattern.exec(name)
    return match
      ? [
          {
            dark: Boolean(match[1]),
            name: `${utility}${match[2] ? `/${match[2]}` : ""}`,
            alpha: match[2] ? Number(match[2]) / 100 : 1,
          },
        ]
      : []
  })
  const pick =
    (mode === "dark" && found.find((entry) => entry.dark)) ||
    found.find((entry) => !entry.dark)
  if (!pick) throw new Error(`No ${utility} class in the focus preset`)
  return pick
}

const PAIRS: Pair[] = [
  // Focus indicators: the solid part, against the surface under it.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Focus indicator (border-ring, outline-ring) on the ${surface}`,
    fg: "color.border.focus",
    bg,
    threshold: 3 as const,
    group: "focus" as const,
  })),
  ...SURFACES.map(([bg, surface]) => ({
    label: `Invalid or destructive focus indicator on the ${surface}`,
    fg: "color.feedback.error.default",
    bg,
    threshold: 3 as const,
    group: "focus" as const,
  })),
  ...SURFACES.map(([bg, surface]) => ({
    label: `Focus indicator on a field's dark:bg-input/30 fill over the ${surface}`,
    fg: "color.border.focus",
    bg,
    tint: { color: "color.border.input", alpha: 0.3 },
    threshold: 3 as const,
    group: "focus" as const,
    modes: ["dark" as Mode],
  })),
  {
    label: "Sidebar focus indicator on the sidebar surface",
    fg: "color.sidebar.ring",
    bg: "color.sidebar.background",
    threshold: 3,
    group: "focus",
  },

  // Information: the resting border of a control and the focus halo.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Resting border of a field, checkbox or radio (border-input) on the ${surface}`,
    fg: "color.border.input",
    bg,
    threshold: 3 as const,
    group: "info" as const,
    informative: true,
  })),
  ...SURFACES.flatMap(([bg, surface]) =>
    MODES.flatMap((mode) => [
      {
        label: `Focus halo (${halo(FOCUS_RING, "ring-ring", mode).name}) on the ${surface}`,
        fg: "color.border.focus",
        fgAlpha: halo(FOCUS_RING, "ring-ring", mode).alpha,
        bg,
        threshold: 3 as const,
        group: "info" as const,
        modes: [mode],
        informative: true,
      },
      {
        label: `Destructive focus halo (${halo(FOCUS_RING_DESTRUCTIVE, "ring-destructive", mode).name}) on the ${surface}`,
        fg: "color.feedback.error.default",
        fgAlpha: halo(FOCUS_RING_DESTRUCTIVE, "ring-destructive", mode).alpha,
        bg,
        threshold: 3 as const,
        group: "info" as const,
        modes: [mode],
        informative: true,
      },
    ])
  ),

  // Body text on every surface it may sit on.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Default text on the ${surface}`,
    fg: "color.text.default",
    bg,
    threshold: 4.5 as const,
    group: "text" as const,
  })),
  {
    label: "Subtle text on the page",
    fg: "color.text.subtle",
    bg: "color.background.default",
    threshold: 4.5,
    group: "text",
  },
  {
    label: "Subtle text on the card (muted-foreground on muted)",
    fg: "color.text.subtle",
    bg: "color.background.subtle",
    threshold: 4.5,
    group: "text",
  },
  {
    label: "Inverse text on the inverse surface",
    fg: "color.text.inverse",
    bg: "color.background.inverse",
    threshold: 4.5,
    group: "text",
  },

  // Filled surfaces and their own foreground.
  {
    label: "Primary foreground on the primary surface",
    fg: "color.action.background.foreground",
    bg: "color.action.background.default",
    threshold: 4.5,
    group: "filled",
  },
  {
    label: "Destructive foreground on the destructive surface",
    fg: "color.feedback.error.foreground",
    bg: "color.feedback.error.default",
    threshold: 4.5,
    group: "filled",
  },
  ...(["success", "warning"] as const).map((role) => ({
    label: `${role === "success" ? "Success" : "Warning"} foreground on the ${role} surface`,
    fg: `color.feedback.${role}.foreground`,
    bg: `color.feedback.${role}.default`,
    threshold: 4.5 as const,
    group: "filled" as const,
  })),
  {
    label: "Sidebar active item text on the active item",
    fg: "color.sidebar.primary.on",
    bg: "color.sidebar.primary.default",
    threshold: 4.5,
    group: "filled",
  },
  {
    label: "Sidebar text on the sidebar surface",
    fg: "color.sidebar.foreground",
    bg: "color.sidebar.background",
    threshold: 4.5,
    group: "filled",
  },

  // Role text on neutral surfaces.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Destructive text on the ${surface}`,
    fg: "color.text.destructive.default",
    bg,
    threshold: 4.5 as const,
    group: "text" as const,
  })),
  {
    label: "Destructive Alert description (text-destructive/90) on the card",
    fg: "color.text.destructive.default",
    fgAlpha: 0.9,
    bg: "color.background.subtle",
    threshold: 4.5,
    group: "text",
  },
  ...SURFACES.map(([bg, surface]) => ({
    label: `Action text (text-primary) on the ${surface}`,
    fg: "color.text.action.default",
    bg,
    threshold: 4.5 as const,
    group: "text" as const,
  })),
  ...(["success", "warning"] as const).flatMap((role) => [
    ...SURFACES.map(([bg, surface]) => ({
      label: `${role === "success" ? "Success" : "Warning"} text on the ${surface}`,
      fg: `color.text.${role}.default`,
      bg,
      threshold: 4.5 as const,
      group: "text" as const,
    })),
    {
      label: `${role === "success" ? "Success" : "Warning"} Alert description (text-${role}/90) on the card`,
      fg: `color.text.${role}.default`,
      fgAlpha: 0.9,
      bg: "color.background.subtle",
      threshold: 4.5 as const,
      group: "text" as const,
    },
  ]),

  // Text on a tint of its own role.
  ...tinted(
    "Destructive Button label",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1, 0.2], dark: [0.2, 0.3] }
  ),
  ...tinted(
    "Destructive Badge label",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1, 0.2], dark: [0.2] }
  ),
  ...(["success", "warning"] as const).flatMap((role) =>
    tinted(
      `${role === "success" ? "Success" : "Warning"} Badge label`,
      `color.text.${role}.default`,
      `color.feedback.${role}.default`,
      { light: [0.1, 0.2], dark: [0.2] }
    )
  ),
  ...tinted(
    "Focused destructive menu item",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1], dark: [0.2] },
    ["color.background.elevated"]
  ),
  ...MODES.map((mode) => ({
    label: "Kbd inside a Tooltip (text-background on a background tint)",
    fg: "color.background.default",
    bg: "color.text.default",
    tint: {
      color: "color.background.default",
      alpha: mode === "light" ? 0.2 : 0.1,
    },
    threshold: 4.5 as const,
    group: "tint" as const,
    modes: [mode],
  })),
]

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
