import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

function Example() {
  return (
    <ButtonGroup orientation="horizontal" aria-label="Pagination">
      <Button variant="outline">Previous</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  )
}

describe("ButtonGroup", () => {
  it("role: a group on the root, each button keeps its own semantics", () => {
    render(<Example />)
    const group = screen.getByRole("group")
    expect(group.dataset.slot).toBe("button-group")
    const buttons = within(group).getAllByRole("button")
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous",
      "Next",
    ])
    for (const button of buttons) expect(button.tagName).toBe("BUTTON")
  })

  it("accessible name: the group takes its aria-label", () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
      </ButtonGroup>
    )
    expect(screen.getByRole("group", { name: "Text formatting" })).toBeTruthy()
  })

  it("Tab / Shift+Tab: moves from one button to the next (no arrow-key navigation)", async () => {
    render(<Example />)
    const previous = screen.getByRole("button", { name: "Previous" })
    const next = screen.getByRole("button", { name: "Next" })
    previous.focus()

    await userEvent.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(previous)
    await userEvent.tab()
    expect(document.activeElement).toBe(next)
    await userEvent.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(next)
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(previous)
  })
})
