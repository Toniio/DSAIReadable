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
