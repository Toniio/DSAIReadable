import { render } from "@testing-library/react"
import { examples } from "virtual:spec-examples"
import { userEvent } from "vitest/browser"
import { describe, expect, it } from "vitest"

import index from "@/design-system.index.json"

import { axeViolations } from "./axe"
import { focusShown, snapshot } from "./focus"

// Enough to cross the largest example, Sidebar, and come back to <body>.
const MAX_TAB_STOPS = 40

/**
 * Every component of the inventory, rendered from the `## Code example` of its
 * spec, as agents copy it. An example that fails here is fixed in the spec.
 */
describe.each(index.inventory.map((component) => component.name))(
  "%s",
  (name) => {
    async function renderExample() {
      const load = examples[name]
      expect(load, `specs/components/${name}.md`).toBeDefined()
      const { default: Example } = await load()
      const { container } = render(<Example />)
      expect(container.firstElementChild).not.toBeNull()
    }

    it("renders its spec example with no axe violation, light and dark", async () => {
      await renderExample()
      expect(await axeViolations()).toEqual([])
    })

    it("shows a focus indicator on every tab stop of its spec example", async () => {
      await renderExample()
      // The tests run in an iframe: past the last tab stop, focus leaves it
      // for the runner's page. An anchor out of the tab order, focused first,
      // brings it back and starts the sequence before the example.
      const anchor = document.createElement("span")
      anchor.tabIndex = -1
      document.body.prepend(anchor)
      anchor.focus()
      const unmarked: string[] = []
      const seen = new Set<Element>()
      try {
        for (let i = 0; i < MAX_TAB_STOPS; i++) {
          const before = snapshot()
          // A real Tab key press from Playwright, so :focus-visible matches.
          await userEvent.keyboard("{Tab}")
          await new Promise(requestAnimationFrame)
          const focused = document.activeElement
          if (!focused || focused === document.body || seen.has(focused)) break
          seen.add(focused)
          if (!focusShown(focused, before, snapshot())) {
            unmarked.push(describeElement(focused))
          }
        }
      } finally {
        anchor.remove()
      }
      expect(unmarked).toEqual([])
    })
  }
)

function describeElement(element: Element): string {
  const slot = element.getAttribute("data-slot")
  const role = element.getAttribute("role")
  return [
    element.tagName.toLowerCase(),
    slot && `[data-slot=${slot}]`,
    role && `[role=${role}]`,
  ]
    .filter(Boolean)
    .join("")
}
