import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

// react-resizable-panels 4 reads a number as pixels: the sizes are percentages.
function Example({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <ResizablePanelGroup orientation={orientation} className="min-h-52">
      <ResizablePanel defaultSize="50%" minSize="20%">
        <div className="p-4">First panel</div>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="First panel size" />
      <ResizablePanel defaultSize="50%" minSize="20%">
        <div className="p-4">Second panel</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

async function focusHandle(orientation?: "horizontal" | "vertical") {
  const { unmount } = render(<Example orientation={orientation} />)
  const handle = screen.getByRole("separator", { name: "First panel size" })
  await expect.poll(() => valueOf(handle)).toBe(50)
  handle.focus()
  return { handle, unmount }
}

function valueOf(handle: HTMLElement) {
  return Math.round(Number(handle.getAttribute("aria-valuenow")))
}

describe("Resizable", () => {
  it("role: each handle is a focusable separator exposing its current value", async () => {
    const { handle } = await focusHandle()
    expect(document.activeElement).toBe(handle)
    expect(handle.tabIndex).toBe(0)
    expect(valueOf(handle)).toBe(50)
    expect(handle.getAttribute("aria-valuemin")).not.toBeNull()
    expect(handle.getAttribute("aria-valuemax")).not.toBeNull()
  })

  it("accessible name: the handle is named by its aria-label", () => {
    render(<Example />)
    expect(
      screen.getByRole("separator", { name: "First panel size" })
    ).toBeTruthy()
  })

  it("ArrowLeft / ArrowRight (or ArrowUp / ArrowDown): resizes along the orientation", async () => {
    const { handle, unmount } = await focusHandle("horizontal")
    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(() => valueOf(handle)).toBeGreaterThan(50)
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => valueOf(handle)).toBe(50)
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => valueOf(handle)).toBeLessThan(50)
    unmount()

    const { handle: vertical } = await focusHandle("vertical")
    await userEvent.keyboard("{ArrowDown}")
    await expect.poll(() => valueOf(vertical)).toBeGreaterThan(50)
    await userEvent.keyboard("{ArrowUp}")
    await expect.poll(() => valueOf(vertical)).toBe(50)
    await userEvent.keyboard("{ArrowUp}")
    await expect.poll(() => valueOf(vertical)).toBeLessThan(50)
  })

  it("Home / End: minimum / maximum size of the panel", async () => {
    const { handle } = await focusHandle()
    await userEvent.keyboard("{Home}")
    await expect.poll(() => valueOf(handle)).toBe(20)
    // The second panel's minSize of 20 caps the first at 80.
    await userEvent.keyboard("{End}")
    await expect.poll(() => valueOf(handle)).toBe(80)
  })
})

describe("ResizablePanelGroup, vertical", () => {
  it("stacks its panels from the library's inline flex-direction, not from aria-orientation", () => {
    render(<Example orientation="vertical" />)
    const group = document.querySelector<HTMLElement>(
      "[data-slot=resizable-panel-group]"
    )!
    expect(group.hasAttribute("aria-orientation")).toBe(false)
    expect(group.className).not.toContain("aria-[orientation=vertical]")
    expect(getComputedStyle(group).flexDirection).toBe("column")
  })
})
