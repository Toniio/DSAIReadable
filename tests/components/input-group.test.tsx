import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"

const THEMES = ["light", "dark"] as const

function useTheme(theme: (typeof THEMES)[number]) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function group(container: HTMLElement) {
  const el = container.querySelector<HTMLElement>("[data-slot=input-group]")
  if (!el) throw new Error("no input group rendered")
  return el
}

/** The opacity a class draws, read off a reference element in the same theme. */
function opacityOf(className: string) {
  const ref = document.createElement("div")
  ref.className = className
  document.body.append(ref)
  const { opacity } = getComputedStyle(ref)
  ref.remove()
  return opacity
}

function Composer({
  disabledField = false,
  disabledSend = false,
}: {
  disabledField?: boolean
  disabledSend?: boolean
}) {
  return (
    <InputGroup>
      <InputGroupTextarea aria-label="Reply" disabled={disabledField} />
      <InputGroupAddon align="block-end">
        <InputGroupButton disabled={disabledSend}>Send reply</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

describe("InputGroup", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  describe.each(THEMES)("disabled, %s", (theme) => {
    it("a disabled InputGroupButton leaves the group, and the enabled field in it, undimmed", () => {
      useTheme(theme)
      const enabled = render(<Composer />)
      const reference = getComputedStyle(group(enabled.container))
      const { opacity, backgroundColor } = reference
      const snapshot = { opacity, backgroundColor }
      enabled.unmount()

      const { container } = render(<Composer disabledSend />)
      expect(screen.getByRole("button", { name: "Send reply" })).toHaveProperty(
        "disabled",
        true
      )
      const style = getComputedStyle(group(container))
      expect(style.opacity).toBe("1")
      expect(style.backgroundColor).toBe(snapshot.backgroundColor)
      expect(getComputedStyle(screen.getByLabelText("Reply")).opacity).toBe("1")
    })

    it("a disabled field dims the group with opacity-disabled and the disabled background", () => {
      useTheme(theme)
      const enabled = render(<Composer />)
      const enabledBackground = getComputedStyle(
        group(enabled.container)
      ).backgroundColor
      enabled.unmount()

      const { container } = render(<Composer disabledField />)
      const style = getComputedStyle(group(container))
      expect(style.opacity).toBe(opacityOf("opacity-disabled"))
      expect(style.opacity).not.toBe("1")
      expect(style.backgroundColor).not.toBe(enabledBackground)
    })

    it("a field inside a disabled fieldset dims its group", () => {
      useTheme(theme)
      const { container } = render(
        <fieldset disabled>
          <InputGroup>
            <InputGroupInput aria-label="Search" />
          </InputGroup>
        </fieldset>
      )
      expect(getComputedStyle(group(container)).opacity).toBe(
        opacityOf("opacity-disabled")
      )
    })
  })

  describe.each(THEMES)("focus inside a combobox popup, %s", (theme) => {
    it("keeps the standard ring: the field of a popup is focus-managed like any other", async () => {
      useTheme(theme)
      const user = userEvent.setup()
      const { container } = render(
        <div data-slot="combobox-content">
          <InputGroup>
            <InputGroupInput aria-label="Search" />
          </InputGroup>
        </div>
      )
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText("Search"))
      const style = getComputedStyle(group(container))
      expect(style.boxShadow).not.toBe("none")
      expect(style.boxShadow).toMatch(/\b2px\b/)
    })
  })
})
