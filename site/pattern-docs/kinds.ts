import type { Pattern } from "@/site/lib/patterns"

/** The two kinds of pattern, as the navigation names them. */
export const KIND_LABEL: Record<Pattern["kind"], string> = {
  task: "Task",
  ui: "Interface",
}

/**
 * Whether the pattern's example fills the screen: a root at the viewport's
 * height (`min-h-screen`) or a `SidebarProvider` shell. Its preview gets a
 * stage of a fixed height: a frame sized to its content would grow with it.
 */
export function fillsViewport(pattern: Pattern): boolean {
  return /\bmin-h-(?:screen|svh|dvh|lvh)\b|\bh-(?:screen|svh|dvh)\b|\bSidebarProvider\b/.test(
    pattern.code_example
  )
}
