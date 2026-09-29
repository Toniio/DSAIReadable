import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { UI_STRINGS } from "@/lib/ui-strings"

import { axeViolations } from "../axe"

describe("PasswordInput", () => {
  it("names its toggle from UI_STRINGS and swaps the name with the state", async () => {
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
