import axe from "axe-core"

import { inEveryTheme } from "./themes"

/**
 * Runs axe-core on the document, in each of the four themes (`tests/themes.ts`),
 * and returns one line per violation, so a failing assertion names the theme,
 * the rule and the offending element.
 *
 * Scope: the WCAG 2.x A and AA rules, 2.2 AA included — so color contrast and
 * target size, which the real browser computes. Page-level best practices
 * (landmarks, a single `h1`) do not apply to a component rendered on its own.
 *
 * The whole document is scanned, not the render container: dialogs, selects and
 * comboboxes portal their popups to `document.body`. What a modal layer hides
 * behind it (`data-aria-hidden`, set by Radix while it is open) is left out: it
 * is unreachable until the layer closes — focus is trapped, pointer events are
 * off — and it is audited in its own closed state.
 */
export async function axeViolations(): Promise<string[]> {
  const lines: string[] = []
  await inEveryTheme(async (theme) => {
    const { violations } = await axe.run(
      { include: [document.body], exclude: ['[data-aria-hidden="true"]'] },
      {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      }
    )
    for (const violation of violations) {
      for (const node of violation.nodes) {
        lines.push(`${theme} ${violation.id}: ${node.target.join(" ")}`)
      }
    }
  })
  return lines
}
