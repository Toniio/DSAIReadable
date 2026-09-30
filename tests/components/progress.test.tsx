import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "@/components/ui/progress"

import { axeViolations } from "../axe"

function indicator() {
  const element = document.querySelector<HTMLElement>(
    '[data-slot="progress-indicator"]'
  )
  if (!element) throw new Error("No progress indicator rendered")
  return element
}

describe("Progress", () => {
  // Regression guard for P0-04: `value` was consumed by the wrapper and never
  // reached the Radix root, so the bar was always announced as indeterminate.
  it("exposes its value to assistive technology", () => {
    render(<Progress value={45} aria-label="File upload" />)
    const bar = screen.getByRole("progressbar", { name: "File upload" })
    expect(bar.getAttribute("aria-valuenow")).toBe("45")
    expect(bar.getAttribute("aria-valuemin")).toBe("0")
    expect(bar.getAttribute("aria-valuemax")).toBe("100")
    expect(bar.dataset.state).toBe("loading")
    expect(bar.dataset.slot).toBe("progress")
  })

  it("moves the indicator to match the value", () => {
    render(<Progress value={45} aria-label="File upload" />)
    expect(indicator().style.transform).toBe("translateX(-55%)")
  })

  it("marks a full bar as complete", () => {
    render(<Progress value={100} aria-label="File upload" />)
    const bar = screen.getByRole("progressbar")
    expect(bar.getAttribute("aria-valuenow")).toBe("100")
    expect(bar.dataset.state).toBe("complete")
    expect(indicator().style.transform).toBe("translateX(0%)")
  })

  it("is indeterminate without a value", () => {
    render(<Progress aria-label="File upload" />)
    const bar = screen.getByRole("progressbar")
    expect(bar.hasAttribute("aria-valuenow")).toBe(false)
    expect(bar.dataset.state).toBe("indeterminate")
  })

  it("has no axe violations", async () => {
    render(<Progress value={45} aria-label="File upload" />)
    expect(await axeViolations()).toEqual([])
  })

  it("is flagged by axe without an accessible name", async () => {
    render(<Progress value={45} />)
    expect(await axeViolations()).toEqual([
      expect.stringMatching(/^light aria-progressbar-name: /),
      expect.stringMatching(/^dark aria-progressbar-name: /),
    ])
  })
})
