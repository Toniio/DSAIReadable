import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

function Example() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Switch id="notifications" defaultChecked />
        <Label htmlFor="notifications">Notifications</Label>
      </div>
      <button type="button">Save</button>
    </>
  )
}

function control() {
  return screen.getByRole("switch", { name: "Notifications" })
}

describe("Switch", () => {
  it("role: a switch on a button, with aria-checked", async () => {
    const user = userEvent.setup()
    render(<Example />)
    expect(control().tagName).toBe("BUTTON")
    expect(control().getAttribute("aria-checked")).toBe("true")
    await user.click(control())
    expect(control().getAttribute("aria-checked")).toBe("false")
  })

  it("accessible name: a tied Label that names the setting, whatever its state, or an aria-label", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Example />)
    await user.click(screen.getByText("Notifications"))
    expect(control().getAttribute("aria-checked")).toBe("false")
    unmount()

    render(<Switch aria-label="Notifications" />)
    expect(control().getAttribute("aria-checked")).toBe("false")
  })

  it("Space / Enter: toggles the state", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(control())
    await user.keyboard(" ")
    expect(control().getAttribute("aria-checked")).toBe("false")
    await user.keyboard("{Enter}")
    expect(control().getAttribute("aria-checked")).toBe("true")
  })

  it("Tab: moves focus to the next element", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(control())
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Save" })
    )
  })
})
