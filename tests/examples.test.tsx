import { render } from "@testing-library/react"
import { examples } from "virtual:spec-examples"
import { describe, expect, it } from "vitest"

import index from "@/design-system.index.json"

import { axeViolations } from "./axe"
import { unmarkedTabStops } from "./focus"

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
      expect(await unmarkedTabStops(MAX_TAB_STOPS)).toEqual([])
    })
  }
)
