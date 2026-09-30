import { TextBolderIcon } from "@phosphor-icons/react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Toggle } from "@/components/ui/toggle"

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
})
