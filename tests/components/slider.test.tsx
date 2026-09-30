import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Slider } from "@/components/ui/slider"

function Range() {
  return (
    <Slider
      defaultValue={[25, 75]}
      min={0}
      max={100}
      step={1}
      aria-label="Price range"
      thumbLabels={["Minimum price", "Maximum price"]}
    />
  )
}

function focusVolume() {
  render(
    <Slider
      defaultValue={[50]}
      min={0}
      max={100}
      step={1}
      aria-label="Volume"
    />
  )
  const thumb = screen.getByRole("slider", { name: "Volume" })
  thumb.focus()
  return thumb
}

function valueOf(thumb: HTMLElement) {
  return Number(thumb.getAttribute("aria-valuenow"))
}

describe("Slider", () => {
  it("role: each thumb is a slider with aria-valuenow, aria-valuemin and aria-valuemax", () => {
    render(<Range />)
    const thumbs = screen.getAllByRole("slider")
    expect(thumbs).toHaveLength(2)
    expect(thumbs.map(valueOf)).toEqual([25, 75])
    for (const thumb of thumbs) {
      expect(thumb.getAttribute("aria-valuemin")).toBe("0")
      expect(thumb.getAttribute("aria-valuemax")).toBe("100")
    }
  })

  it("accessible name: one thumb takes the Slider's name; several take thumbLabels, the name going to the group", () => {
    const { unmount } = render(
      <>
        <span id="volume-label">Volume</span>
        <Slider defaultValue={[50]} aria-labelledby="volume-label" />
      </>
    )
    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy()
    unmount()

    render(<Range />)
    expect(screen.getByRole("group", { name: "Price range" })).toBeTruthy()
    expect(screen.getByRole("slider", { name: "Minimum price" })).toBeTruthy()
    expect(screen.getByRole("slider", { name: "Maximum price" })).toBeTruthy()
  })

  it("ArrowRight / ArrowUp: increases by one step", async () => {
    const thumb = focusVolume()
    await userEvent.keyboard("{ArrowRight}")
    expect(valueOf(thumb)).toBe(51)
    await userEvent.keyboard("{ArrowUp}")
    expect(valueOf(thumb)).toBe(52)
  })

  it("ArrowLeft / ArrowDown: decreases by one step", async () => {
    const thumb = focusVolume()
    await userEvent.keyboard("{ArrowLeft}")
    expect(valueOf(thumb)).toBe(49)
    await userEvent.keyboard("{ArrowDown}")
    expect(valueOf(thumb)).toBe(48)
  })

  it("PageUp / PageDown: increases / decreases by a large step", async () => {
    const thumb = focusVolume()
    await userEvent.keyboard("{PageUp}")
    const up = valueOf(thumb)
    expect(up).toBeGreaterThan(51)
    await userEvent.keyboard("{PageDown}")
    expect(valueOf(thumb)).toBe(50)
    await userEvent.keyboard("{PageDown}")
    expect(valueOf(thumb)).toBe(50 - (up - 50))
  })

  it("Home / End: minimum / maximum value", async () => {
    const thumb = focusVolume()
    await userEvent.keyboard("{Home}")
    expect(valueOf(thumb)).toBe(0)
    await userEvent.keyboard("{End}")
    expect(valueOf(thumb)).toBe(100)
  })
})
