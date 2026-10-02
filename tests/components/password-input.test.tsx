import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { UI_STRINGS } from "@/lib/ui-strings"

import { axeViolations } from "../axe"

function Example() {
  return (
    <Field>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <PasswordInput id="password" autoComplete="current-password" />
    </Field>
  )
}

describe("PasswordInput", () => {
  it("accessible name: the field is labeled, the toggle is named from UI_STRINGS by state", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText("Password")
    expect(input.getAttribute("type")).toBe("password")

    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.passwordInput.show })
    )
    expect(input.getAttribute("type")).toBe("text")
    expect(
      screen.getByRole("button", { name: UI_STRINGS.passwordInput.hide })
    ).toBeTruthy()
  })

  it("role: a native password input and a visibility button", () => {
    render(<Example />)
    const input = screen.getByLabelText("Password")
    expect(input.tagName).toBe("INPUT")
    expect(input.getAttribute("type")).toBe("password")
    const toggle = screen.getByRole("button", {
      name: UI_STRINGS.passwordInput.show,
    })
    expect(toggle.tagName).toBe("BUTTON")
  })

  it("Tab: from the field to the visibility button", async () => {
    const user = userEvent.setup()
    render(<Example />)
    screen.getByLabelText("Password").focus()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: UI_STRINGS.passwordInput.show })
    )
  })

  it("Enter / Space: shows / hides the password", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const input = screen.getByLabelText("Password")
    screen.getByRole("button", { name: UI_STRINGS.passwordInput.show }).focus()

    await user.keyboard("{Enter}")
    expect(input.getAttribute("type")).toBe("text")
    await user.keyboard("{Enter}")
    expect(input.getAttribute("type")).toBe("password")
    await user.keyboard(" ")
    expect(input.getAttribute("type")).toBe("text")
    await user.keyboard(" ")
    expect(input.getAttribute("type")).toBe("password")
  })

  it("takes its toggle labels from showLabel and hideLabel", async () => {
    const user = userEvent.setup()
    render(
      <PasswordInput
        aria-label="Passphrase"
        showLabel="Reveal passphrase"
        hideLabel="Conceal passphrase"
      />
    )
    await user.click(screen.getByRole("button", { name: "Reveal passphrase" }))
    expect(
      screen.getByRole("button", { name: "Conceal passphrase" })
    ).toBeTruthy()
  })

  it("disabled: the toggle is disabled with the field, leaves the tab order and masks the value again", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <>
        <button>before</button>
        <PasswordInput aria-label="Password" />
        <button>after</button>
      </>
    )
    const input = screen.getByLabelText("Password")
    await user.click(
      screen.getByRole("button", { name: UI_STRINGS.passwordInput.show })
    )
    expect(input.getAttribute("type")).toBe("text")

    rerender(
      <>
        <button>before</button>
        <PasswordInput aria-label="Password" disabled />
        <button>after</button>
      </>
    )
    expect(input.getAttribute("type")).toBe("password")
    const toggle = screen.getByRole("button", {
      name: UI_STRINGS.passwordInput.show,
    })
    expect(toggle).toHaveProperty("disabled", true)

    // A native click, not user.click: user-event refuses to click an element
    // with pointer-events: none, which is what a disabled Button has.
    toggle.click()
    expect(input.getAttribute("type")).toBe("password")

    screen.getByRole("button", { name: "before" }).focus()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "after" })
    )
  })

  it("readOnly: the toggle still reveals the value", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" readOnly defaultValue="x" />)
    const toggle = screen.getByRole("button", {
      name: UI_STRINGS.passwordInput.show,
    })
    expect(toggle).toHaveProperty("disabled", false)
    await user.click(toggle)
    expect(screen.getByLabelText("Password").getAttribute("type")).toBe("text")
  })

  it("anatomy: the root carries data-slot=password-input", () => {
    const { container } = render(<PasswordInput aria-label="Password" />)
    expect(container.firstElementChild?.getAttribute("data-slot")).toBe(
      "password-input"
    )
  })

  it("has no axe violation inside a labeled Field", async () => {
    render(
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <PasswordInput id="password" />
      </Field>
    )
    expect(await axeViolations()).toEqual([])
  })
})
