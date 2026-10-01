import { render } from "@testing-library/react"
import { screens } from "virtual:eval-screens"
import { beforeEach, describe, expect, it } from "vitest"

import { axeViolations } from "../../tests/axe"
import { unmarkedTabStops } from "../../tests/focus"

/**
 * One block per generated screen; the harness reads the outcome of each test
 * by its title (`renders`, `axe`, `focus`) from Vitest's JSON report.
 */
// A screen that fails to import fails its own tests; the error overlay Vite
// adds to the page would fail every screen after it.
beforeEach(() => {
  for (const overlay of document.querySelectorAll("vite-error-overlay"))
    overlay.remove()
})

describe.each(Object.keys(screens))("%s", (id) => {
  async function renderScreen() {
    const { default: Screen } = await screens[id]()
    const { container } = render(<Screen />)
    expect(container.firstElementChild).not.toBeNull()
  }

  it("renders", async () => {
    await renderScreen()
  })

  it("axe", async () => {
    await renderScreen()
    const violations = await axeViolations()
    expect(violations, violations.join("\n")).toEqual([])
  })

  it("focus", async () => {
    await renderScreen()
    const unmarked = await unmarkedTabStops()
    expect(unmarked, `no focus indicator: ${unmarked.join(", ")}`).toEqual([])
  })
})
