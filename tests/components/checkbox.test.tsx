import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

function Example() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" name="remember" />
        <Label htmlFor="remember">Remember me</Label>
      </div>
      <button type="button">Sign in</button>
    </>
  )
}

function checkbox() {
  return screen.getByRole("checkbox", { name: "Remember me" })
}

describe("Checkbox", () => {
  it("role: a checkbox on a button, aria-checked true, false or mixed", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Example />)
    expect(checkbox().tagName).toBe("BUTTON")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    await user.click(checkbox())
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    unmount()

    render(<Checkbox checked="indeterminate" aria-label="Select all" />)
    expect(
      screen
        .getByRole("checkbox", { name: "Select all" })
        .getAttribute("aria-checked")
    ).toBe("mixed")
  })

  it("accessible name: a tied Label, which toggles the box on click, or an aria-label", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Example />)
    await user.click(screen.getByText("Remember me"))
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    unmount()

    render(<Checkbox aria-label="Remember me" />)
    expect(checkbox()).toBeTruthy()
  })

  it("Space: checks / unchecks the box", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(checkbox())
    await user.keyboard(" ")
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    await user.keyboard(" ")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
  })

  it("Tab: moves focus to the next element", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(checkbox())
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Sign in" })
    )
  })

  it("does not toggle with Enter", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
  })
})
