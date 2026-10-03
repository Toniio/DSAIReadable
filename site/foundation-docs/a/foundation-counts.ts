import { tokens } from "@/site/lib/tokens"

/** The semantic token group each foundation page documents. */
const PREFIX: Record<string, string> = {
  color: "color",
  typography: "typography",
  spacing: "space",
  radius: "radius",
  elevation: "elevation",
  "border-width": "border-width",
  opacity: "opacity",
  motion: "motion",
  size: "size",
  breakpoints: "breakpoint",
  layers: "zindex",
}

/**
 * What a foundation's card counts: its semantic tokens, the aliases for
 * Color, every token for the reference. Guidelines count nothing.
 */
export function foundationCount(slug: string): string | undefined {
  const all = tokens()
  if (slug === "tokens") return `${all.length} tokens`
  const prefix = PREFIX[slug]
  if (!prefix) return undefined
  const own = all.filter(
    (entry) =>
      entry.tier === "semantic" &&
      (entry.token === prefix || entry.token.startsWith(`${prefix}.`))
  ).length
  if (own === 0) return undefined
  const label = `${own} ${own === 1 ? "token" : "tokens"}`
  if (slug !== "color") return label
  const aliases = all.filter(
    (entry) => entry.tier === "component" && entry.type === "color"
  ).length
  return `${label} · ${aliases} aliases`
}

/** How many tokens each tier holds. */
export function tierCounts(): Record<
  "primitive" | "semantic" | "component",
  number
> {
  const all = tokens()
  return {
    primitive: all.filter((entry) => entry.tier === "primitive").length,
    semantic: all.filter((entry) => entry.tier === "semantic").length,
    component: all.filter((entry) => entry.tier === "component").length,
  }
}
