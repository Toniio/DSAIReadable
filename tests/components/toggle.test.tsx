import { TextBolderIcon } from "@phosphor-icons/react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { userEvent as pointer } from "vitest/browser"

import { Toggle } from "@/components/ui/toggle"

import { borderPaint } from "../focus"

function Example() {
  return (
    <Toggle variant="outline" size="default" aria-label="Bold">
      <TextBolderIcon data-icon="inline-start" />
      Bold
    </Toggle>
  )
}

function IconOnly() {
  return (
    <Toggle aria-label="Bold">
      <TextBolderIcon />
    </Toggle>
  )
}

function OnAndHovered({ variant }: { variant: "default" | "outline" }) {
  return (
    <>
      <Toggle variant={variant} aria-label="Bold" defaultPressed>
        B
      </Toggle>
      <Toggle variant={variant} aria-label="Italic">
        I
      </Toggle>
    </>
  )
}

describe("Toggle", () => {
  it("role: a button with aria-pressed", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const toggle = screen.getByRole("button", { name: "Bold" })
    expect(toggle.tagName).toBe("BUTTON")
    expect(toggle.getAttribute("aria-pressed")).toBe("false")
    await user.click(toggle)
    expect(toggle.getAttribute("aria-pressed")).toBe("true")
  })

  it("accessible name: the action it names, not its state, for an icon-only toggle too", async () => {
    const user = userEvent.setup()
    render(<IconOnly />)
    const toggle = screen.getByRole("button", { name: "Bold" })
    expect(toggle.textContent).toBe("")
    await user.click(toggle)
    expect(toggle.getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: "Bold" })).toBe(toggle)
  })

  it("Enter / Space: toggles the state", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const toggle = screen.getByRole("button", { name: "Bold" })
    await user.tab()
    expect(document.activeElement).toBe(toggle)
    await user.keyboard("{Enter}")
    expect(toggle.getAttribute("aria-pressed")).toBe("true")
    await user.keyboard(" ")
    expect(toggle.getAttribute("aria-pressed")).toBe("false")
  })

  it("pressed: a solid frame at 3:1 or more on the page, which hover does not draw, light and dark", async () => {
    const root = document.documentElement
    for (const variant of ["default", "outline"] as const) {
      const { unmount } = render(<OnAndHovered variant={variant} />)
      const on = screen.getByRole("button", { name: "Bold" })
      const hovered = screen.getByRole("button", { name: "Italic" })
      await pointer.hover(hovered)
      try {
        for (const theme of ["light", "dark"] as const) {
          root.classList.toggle("dark", theme === "dark")
          const frame = borderPaint(on)
          expect(frame.contrast, `${variant}, ${theme}`).toBeGreaterThanOrEqual(
            3
          )
          expect(frame.key, `${variant}, ${theme}`).not.toBe(
            borderPaint(hovered).key
          )
        }
      } finally {
        root.classList.remove("dark")
        unmount()
      }
    }
  })
})
