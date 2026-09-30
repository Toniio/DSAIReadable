import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

function Example() {
  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="/profile" className="underline">
            @jcarter
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">James Carter</p>
            <p className="text-xs text-muted-foreground">
              Front-end developer · Joined March 2024
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      <Button>Follow</Button>
    </>
  )
}

function link() {
  return screen.getByRole("link", { name: "@jcarter" })
}

function preview() {
  return screen.queryByText("James Carter")
}

// Radix opens the card after 700 ms and closes it after 300 ms.
const DELAY = { timeout: 2000 }

describe("HoverCard", () => {
  it("role: floating content opened on hover or on focus of the trigger", async () => {
    render(<Example />)
    expect(preview()).toBeNull()

    await userEvent.hover(link())
    await expect.poll(preview, DELAY).not.toBeNull()
    expect(
      preview()
        ?.closest("[data-slot=hover-card-content]")
        ?.getAttribute("data-state")
    ).toBe("open")
    await userEvent.unhover(link())
    await expect.poll(preview, DELAY).toBeNull()

    link().focus()
    await expect.poll(preview, DELAY).not.toBeNull()
  })

  it("accessible name: the trigger's, a link named by its text", () => {
    render(<Example />)
    expect(link().getAttribute("href")).toBe("/profile")
    expect(link().dataset.slot).toBe("hover-card-trigger")
  })

  it("Tab (focus on the trigger): opens the preview", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(link())
    await expect.poll(preview, DELAY).not.toBeNull()
  })

  it("Focus leaves: closes the preview", async () => {
    render(<Example />)
    await userEvent.tab()
    await expect.poll(preview, DELAY).not.toBeNull()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Follow" })
    )
    await expect.poll(preview, DELAY).toBeNull()
  })
})
