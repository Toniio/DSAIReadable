import axe from "axe-core"

/**
 * Runs axe-core on the document and returns one line per violation, so a
 * failing assertion names the rule and the offending element.
 *
 * Scope: the WCAG 2.x A and AA rules. Page-level best practices (landmarks, a
 * single `h1`) do not apply to a component rendered on its own. Color contrast
 * is off: jsdom computes no colors, and `npm run tokens:lint-contrast` already
 * checks every foreground/background token pair.
 *
 * The whole document is scanned, not the render container: dialogs, selects and
 * comboboxes portal their popups to `document.body`.
 */
export async function axeViolations(): Promise<string[]> {
  const { violations } = await axe.run(document.body, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
    },
    rules: { "color-contrast": { enabled: false } },
  })
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => `${violation.id}: ${node.target.join(" ")}`)
  )
}
