import { render } from "@testing-library/react"
import { jsdocExamples } from "virtual:jsdoc-examples"
import { describe, expect, it } from "vitest"

/**
 * The `@example` of every export of `components/ui/*.tsx`, the one the MCP
 * server serves next to it and agents copy, rendered as written. Before this
 * test, FieldTitle's example put a RadioGroupItem outside any RadioGroup and
 * threw at render.
 *
 * Two kinds of example do not render alone, and the test says so by name:
 * - one that stands for part of a screen names data or handlers it does not
 *   define (`{countries}`, `{retry}`): a ReferenceError, skipped in every file;
 * - in a compound component, the example of a part (`TabsTrigger`,
 *   `DialogClose`) takes the compound's context from the screen around it, and
 *   throws without it. Those files are listed below; an error there is skipped.
 *
 * Any other error fails, and so does any error in a file not listed: an
 * example that composes components must carry the context of each.
 */
const COMPOUNDS = new Set([
  "alert-dialog",
  "carousel",
  "combobox",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "hover-card",
  "input-otp",
  "menubar",
  "message-scroller",
  "navigation-menu",
  "popover",
  "questionnaire",
  "resizable",
  "select",
  "sheet",
  "sidebar",
  "tabs",
  "tooltip",
])

describe.each(Object.keys(jsdocExamples))("components/ui/%s", (file) => {
  const { names, load } = jsdocExamples[file]

  it.for(names)("%s: its @example renders", async (name, { skip }) => {
    const { examples } = await load()
    const Example = examples[name]
    try {
      const { container } = render(<Example />)
      expect(container).toBeTruthy()
    } catch (error) {
      if (error instanceof ReferenceError)
        skip(`the example names data it does not define: ${error.message}`)
      if (COMPOUNDS.has(file))
        skip(`the example shows a part: ${(error as Error).message}`)
      throw error
    }
  })
})
