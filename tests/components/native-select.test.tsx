import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

import { axeViolations } from "../axe"

const THEMES = ["light", "dark"] as const

/** The text color a class draws, read off a reference element in the same theme. */
function colorOf(className: string) {
  const ref = document.createElement("span")
  ref.className = className
  document.body.append(ref)
  const { color } = getComputedStyle(ref)
  ref.remove()
  return color
}

function City({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <NativeSelect aria-label="City" defaultValue={defaultValue}>
      <NativeSelectOption value="">Choose a city</NativeSelectOption>
      <NativeSelectOption value="boston">Boston</NativeSelectOption>
      <NativeSelectOption value="paris">Paris</NativeSelectOption>
    </NativeSelect>
  )
}

describe("NativeSelect", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it("role: a native select named by its label", () => {
    render(<City />)
    const select = screen.getByRole("combobox", { name: "City" })
    expect(select.tagName).toBe("SELECT")
  })

  describe.each(THEMES)("placeholder, %s", (theme) => {
    it("draws the selected empty-value option in text-muted-foreground, and a real choice in text-foreground", async () => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      const user = userEvent.setup()
      render(<City />)
      const select = screen.getByRole("combobox", { name: "City" })
      expect(getComputedStyle(select).color).toBe(
        colorOf("text-muted-foreground")
      )

      await user.selectOptions(select, "boston")
      expect(getComputedStyle(select).color).toBe(colorOf("text-foreground"))

      await user.selectOptions(select, "")
      expect(getComputedStyle(select).color).toBe(
        colorOf("text-muted-foreground")
      )
    })

    it("a select with no empty-value option keeps text-foreground", () => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <NativeSelect aria-label="Role" defaultValue="editor">
          <NativeSelectOption value="editor">Editor</NativeSelectOption>
        </NativeSelect>
      )
      expect(
        getComputedStyle(screen.getByRole("combobox", { name: "Role" })).color
      ).toBe(colorOf("text-foreground"))
    })
  })

  it("has no axe violation with the placeholder selected", async () => {
    render(<City />)
    expect(await axeViolations()).toEqual([])
  })
})
