import { componentsByCategory } from "@/site/lib/components"
import { readJson } from "@/site/lib/repo"

export interface NavItem {
  label: string
  href: string
  /** A short status shown next to the label: `beta`. */
  badge?: string
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

/** The tabs of the header, in order. */
export const SECTIONS: NavItem[] = [
  { label: "Overview", href: "/" },
  { label: "Foundations", href: "/foundations/" },
  { label: "Components", href: "/components/" },
  { label: "Patterns", href: "/patterns/" },
  { label: "Changes", href: "/changes/" },
  { label: "Audits", href: "/audits/" },
]

export interface Foundation {
  slug: string
  label: string
  /** The spec under specs/foundations/, when one documents it. */
  spec?: string
  /** One line for the Foundations index. */
  summary: string
}

/** The Foundations pages, grouped as the navigation shows them. */
export const FOUNDATION_GROUPS: { label: string; items: Foundation[] }[] = [
  {
    label: "Tokens",
    items: [
      {
        slug: "color",
        label: "Color",
        spec: "color.md",
        summary:
          "The palette, the semantic colors and the shadcn/ui aliases, in light and dark.",
      },
      {
        slug: "typography",
        label: "Typography",
        spec: "typography.md",
        summary:
          "The two typefaces, the type scale, weights, line heights and letter spacing.",
      },
      {
        slug: "spacing",
        label: "Spacing",
        spec: "spacing.md",
        summary:
          "The spacing scale, the layout spacing and the container widths.",
      },
      {
        slug: "radius",
        label: "Radius",
        spec: "radius.md",
        summary: "The corner radius scale: square surfaces, round shapes.",
      },
      {
        slug: "elevation",
        label: "Elevation",
        spec: "elevation.md",
        summary: "The shadows that lift a surface, in light and dark.",
      },
      {
        slug: "border-width",
        label: "Border width",
        spec: "border-width.md",
        summary: "The strokes of borders, separators and chart indicators.",
      },
      {
        slug: "opacity",
        label: "Opacity",
        spec: "opacity.md",
        summary: "Opacity for binary states only: shown, hidden, disabled.",
      },
      {
        slug: "motion",
        label: "Motion",
        spec: "motion.md",
        summary: "Durations and easings, and what reduced motion keeps.",
      },
      {
        slug: "size",
        label: "Size",
        spec: "size.md",
        summary: "The minimum pointer target and the sizes that meet it.",
      },
      {
        slug: "breakpoints",
        label: "Breakpoints",
        spec: "breakpoints.md",
        summary: "The viewport widths the layout adapts at.",
      },
      {
        slug: "layers",
        label: "Layers",
        summary:
          "The z-index scale that stacks sticky bars, overlays and toasts.",
      },
    ],
  },
  {
    label: "Guidelines",
    items: [
      {
        slug: "focus",
        label: "Focus",
        spec: "focus.md",
        summary: "The single focus indicator every control draws.",
      },
      {
        slug: "icons",
        label: "Icons",
        summary:
          "Phosphor icons only: the ones the components use, and the full catalog.",
      },
      {
        slug: "content",
        label: "Content",
        spec: "content.md",
        summary: "How labels, messages and errors are written.",
      },
      {
        slug: "voice-and-tone",
        label: "Voice and tone",
        spec: "voice-and-tone.md",
        summary: "How the product sounds, and how that shifts with the moment.",
      },
    ],
  },
  {
    label: "Reference",
    items: [
      {
        slug: "tokens",
        label: "All tokens",
        summary:
          "Every token of the three tiers, with its value, status and Tailwind class.",
      },
    ],
  },
]

export function foundation(slug: string): Foundation {
  const found = FOUNDATION_GROUPS.flatMap((group) => group.items).find(
    (item) => item.slug === slug
  )
  if (!found) throw new Error(`No foundation ${slug}`)
  return found
}

export function foundationsNav(): NavGroup[] {
  return FOUNDATION_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      label: item.label,
      href: `/foundations/${item.slug}/`,
    })),
  }))
}

export function componentsNav(): NavGroup[] {
  return [
    { items: [{ label: "All components", href: "/components/" }] },
    ...componentsByCategory().map(({ category, items }) => ({
      label: category,
      items: items.map((entry) => ({
        label: entry.name,
        href: `/components/${entry.slug}/`,
        badge: entry.status === "stable" ? undefined : entry.status,
      })),
    })),
  ]
}

interface PatternRow {
  name: string
  title: string
  kind: "task" | "ui"
}

export function patternsNav(): NavGroup[] {
  const patterns = Object.values(
    readJson<Record<string, PatternRow>>("mcp-server/context/patterns.json")
  )
  return [
    { items: [{ label: "All patterns", href: "/patterns/" }] },
    ...(["task", "ui"] as const).map((kind) => ({
      label: kind === "task" ? "Tasks" : "Interface",
      items: patterns
        .filter((pattern) => pattern.kind === kind)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((pattern) => ({
          label: pattern.title,
          href: `/patterns/${pattern.name}/`,
        })),
    })),
  ]
}

/**
 * The Audits section: one page, and where the rest of its story is told. Its
 * own sections are anchors, listed once, in "On this page": the navigation
 * marks the page the reader is on.
 */
export function auditsNav(): NavGroup[] {
  return [
    { items: [{ label: "Audits", href: "/audits/" }] },
    {
      label: "Related",
      items: [
        { label: "Change log", href: "/changes/" },
        { label: "All tokens", href: "/foundations/tokens/" },
      ],
    },
  ]
}
