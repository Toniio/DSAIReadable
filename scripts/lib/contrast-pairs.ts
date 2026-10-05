import { FOCUS_RING, FOCUS_RING_DESTRUCTIVE } from "../../lib/focus"

/**
 * The foreground and background pairs the design system ships, in each mode:
 * what scripts/lint-contrast.ts holds to its WCAG 2.2 thresholds and what the
 * documentation site's Audits page measures and shows. They are declared once,
 * here, so the page cannot drift from the check. Contrast is a property of a
 * pair, so a pair cannot be derived from the token files: a pair added to the
 * design system is added to this list. No side effect: importing it reads
 * lib/focus.ts and builds the list, nothing else.
 */

export type Mode = "light" | "dark"

export const MODES: readonly Mode[] = ["light", "dark"]

/** How the Audits table groups the pairs. */
export type ContrastGroup =
  "focus" | "border" | "text" | "filled" | "tint" | "state" | "info"

export interface Pair {
  label: string
  /** The token of the foreground. */
  fg: string
  /** The token of the surface under it. */
  bg: string
  /** 4.5 for body text, 3 for UI components and graphical objects (WCAG 1.4.11). */
  threshold: 3 | 4.5
  group: ContrastGroup
  modes?: Mode[]
  /** A translucent layer painted over `bg`, as Tailwind's `bg-<role>/<n>`. */
  tint?: { color: string; alpha: number }
  /** The opacity of the foreground itself, as Tailwind's `text-<role>/<n>`. */
  fgAlpha?: number
  /** Measured and shown, never blocking: a part that is not the indicator. */
  informative?: boolean
}

/** The tinted feedback roles beyond destructive, and how a label names them. */
const ROLES = [
  ["success", "Success"],
  ["warning", "Warning"],
  ["info", "Info"],
] as const

/** The surfaces a component may be placed on: the page, a card, a popover. */
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

export const PAIRS: Pair[] = [
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
    label: `Focus indicator on a field's dark:bg-input-fill/30 fill over the ${surface}`,
    fg: "color.border.focus",
    bg,
    tint: { color: "color.background.input", alpha: 0.3 },
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

  // The on state of Toggle and ToggleGroupItem: a solid border-foreground
  // frame over the muted fill, which hover shares, against the surface the
  // control sits on.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Toggle and ToggleGroupItem on-state frame (border-foreground) on the ${surface}`,
    fg: "color.text.default",
    bg,
    threshold: 3 as const,
    group: "focus" as const,
  })),

  // The boundary of a control at rest (WCAG 1.4.11): the border of a field,
  // checkbox or radio, and the solid track of an unchecked Switch, against
  // the surface around it and, in dark, against the field's own fill.
  ...SURFACES.map(([bg, surface]) => ({
    label: `Resting border of a field, checkbox or radio and unchecked Switch track (border-input, bg-input) on the ${surface}`,
    fg: "color.border.input",
    bg,
    threshold: 3 as const,
    group: "border" as const,
  })),
  ...SURFACES.map(([bg, surface]) => ({
    label: `Resting border of a field against its dark:bg-input-fill/30 fill over the ${surface}`,
    fg: "color.border.input",
    bg,
    tint: { color: "color.background.input", alpha: 0.3 },
    threshold: 3 as const,
    group: "border" as const,
    modes: ["dark" as Mode],
  })),

  // Information: the focus halo.
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
  ...ROLES.map(([role, name]) => ({
    label: `${name} foreground on the ${role} surface`,
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
  ...ROLES.flatMap(([role, name]) => [
    ...SURFACES.map(([bg, surface]) => ({
      label: `${name} text on the ${surface}`,
      fg: `color.text.${role}.default`,
      bg,
      threshold: 4.5 as const,
      group: "text" as const,
    })),
    {
      label: `${name} Alert description (text-${role}/90) on the card`,
      fg: `color.text.${role}.default`,
      fgAlpha: 0.9,
      bg: "color.background.subtle",
      threshold: 4.5 as const,
      group: "text" as const,
    },
  ]),

  // Text on a resting tint of its own role. A hovered or highlighted tint is
  // a named step, measured with the states below.
  ...tinted(
    "Destructive Button, Badge and Bubble label",
    "color.text.destructive.default",
    "color.feedback.error.default",
    { light: [0.1], dark: [0.2] }
  ),
  ...ROLES.flatMap(([role, name]) =>
    tinted(
      `${name} Badge label`,
      `color.text.${role}.default`,
      `color.feedback.${role}.default`,
      { light: [0.1], dark: [0.2] }
    )
  ),
  ...tinted(
    "Tinted Bubble text",
    "color.text.default",
    "color.action.background.default",
    { light: [0.1], dark: [0.2] }
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

  // Named states: the label of a role fill on its hovered (and, reserved,
  // pressed) step. A hover never takes a text under 4.5:1; a step is solid,
  // so one pair holds on every surface.
  ...(
    [
      [
        "Primary label",
        "color.action.background.foreground",
        "color.action.background.hover",
        "hovered primary fill (bg-primary-hover)",
      ],
      [
        "Primary label",
        "color.action.background.foreground",
        "color.action.background.active",
        "pressed primary fill (reserved)",
      ],
      [
        "Secondary label",
        "color.text.default",
        "color.action.secondary.hover",
        "hovered secondary or muted fill (bg-secondary-hover)",
      ],
      [
        "Secondary label",
        "color.text.default",
        "color.action.secondary.active",
        "pressed secondary fill (reserved)",
      ],
      [
        "Tinted Bubble text",
        "color.text.default",
        "color.action.tint.hover",
        "hovered primary tint (bg-primary-tint-hover)",
      ],
      [
        "Destructive label",
        "color.text.destructive.default",
        "color.feedback.error.hover",
        "hovered or highlighted destructive tint (bg-destructive-hover)",
      ],
      [
        "Destructive label",
        "color.text.destructive.default",
        "color.feedback.error.active",
        "pressed destructive tint (reserved)",
      ],
      [
        "Success label",
        "color.text.success.default",
        "color.feedback.success.hover",
        "hovered success tint (bg-success-hover)",
      ],
      [
        "Warning label",
        "color.text.warning.default",
        "color.feedback.warning.hover",
        "hovered warning tint (bg-warning-hover)",
      ],
      [
        "Info label",
        "color.text.info.default",
        "color.feedback.info.hover",
        "hovered info tint (bg-info-hover)",
      ],
      [
        "Choice card text",
        "color.text.default",
        "color.action.background.selected",
        "selected choice card (bg-primary-selected)",
      ],
      [
        "Choice card description",
        "color.text.subtle",
        "color.action.background.selected",
        "selected choice card (bg-primary-selected)",
      ],
    ] as const
  ).map(([label, fg, bg, on]) => ({
    label: `${label} on the ${on}`,
    fg,
    bg,
    threshold: 4.5 as const,
    group: "state" as const,
  })),
  // A neutral element's veil, painted over each surface: the text and the
  // subtle text it carries (a table row, a menu trigger, a choice card).
  ...(
    [
      ["hovered", "color.overlay.hover", "bg-overlay-hover"],
      ["selected", "color.overlay.selected", "bg-overlay-selected"],
    ] as const
  ).flatMap(([state, veil, utility]) =>
    SURFACES.flatMap(([bg, surface]) =>
      (
        [
          ["Text", "color.text.default"],
          ["Subtle text", "color.text.subtle"],
        ] as const
      ).map(([name, fg]) => ({
        label: `${name} on the ${state} veil (${utility}) over the ${surface}`,
        fg,
        bg,
        tint: { color: veil, alpha: 1 },
        threshold: 4.5 as const,
        group: "state" as const,
      }))
    )
  ),
]
