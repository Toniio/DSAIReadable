import { render, screen } from "@testing-library/react"
import { CopyIcon } from "@phosphor-icons/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copy">
            <CopyIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Copy <Kbd>⌘C</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function trigger() {
  return screen.getByRole("button", { name: "Copy" })
}

describe("Tooltip", () => {
  it("role: a tooltip that describes its trigger through aria-describedby", async () => {
    render(<Example />)
    expect(screen.queryByRole("tooltip")).toBeNull()
    await userEvent.tab()
    const tooltip = await screen.findByRole("tooltip")
    expect(tooltip.textContent).toBe("Copy ⌘C")
    expect(trigger().getAttribute("aria-describedby")).toBe(tooltip.id)
  })

  it("accessible name: the icon button keeps its aria-label; the tooltip only describes it", async () => {
    render(<Example />)
    await userEvent.tab()
    await screen.findByRole("tooltip")
    expect(
      screen.getByRole("button", { name: "Copy", description: "Copy ⌘C" })
    ).toBe(document.activeElement)
  })

  it("Focus on the trigger: shows the tooltip", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger())
    expect(await screen.findByRole("tooltip")).toBeTruthy()
  })

  it("Escape: hides it", async () => {
    render(<Example />)
    await userEvent.tab()
    await screen.findByRole("tooltip")
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("tooltip")).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })
})

describe("Tooltip, opened by keyboard focus", () => {
  // Radix writes `instant-open` when focus (or a hover soon after another
  // tooltip closed) opens it, and `delayed-open` after the hover delay. The
  // tests project turns animations off, so the test reads what the classes
  // set: the variables tw-animate-css's `enter` keyframes start from.
  function enter(content: Element) {
    const style = getComputedStyle(content)
    return {
      opacity: style.getPropertyValue("--tw-enter-opacity").trim(),
      scale: Number.parseFloat(style.getPropertyValue("--tw-enter-scale")),
    }
  }

  it("enters like a hover open: it fades and zooms in", async () => {
    render(<Example />)
    await userEvent.tab()
    const tooltip = await screen.findByRole("tooltip")
    const content = tooltip.closest("[data-slot=tooltip-content]")!
    expect(content.getAttribute("data-state")).toBe("instant-open")
    expect(enter(content)).toEqual({ opacity: "0", scale: 0.95 })
  })

  it("enters the same after the hover delay", async () => {
    render(<Example />)
    await userEvent.hover(trigger())
    const tooltip = await screen.findByRole("tooltip")
    const content = tooltip.closest("[data-slot=tooltip-content]")!
    expect(content.getAttribute("data-state")).toBe("delayed-open")
    expect(enter(content)).toEqual({ opacity: "0", scale: 0.95 })
  })
})
