import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

import { axeViolations } from "../axe"

const fruits = ["Apple", "Banana", "Cherry"]

function Example({
  showClear,
  onValueChange,
}: {
  showClear?: boolean
  onValueChange?: (value: string | null) => void
}) {
  return (
    <>
      <Label htmlFor="fruit">Fruit</Label>
      <Combobox items={fruits} onValueChange={onValueChange}>
        <ComboboxInput
          id="fruit"
          placeholder="Search for a fruit"
          showClear={showClear}
        />
        <ComboboxContent>
          <ComboboxEmpty>No results</ComboboxEmpty>
          <ComboboxList>
            {(fruit: string) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  )
}

function MultipleExample({ chip }: { chip: (fruit: string) => ReactNode }) {
  return (
    <Combobox items={fruits} multiple defaultValue={["Apple", "Cherry"]}>
      <ComboboxChips>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map(chip)}
              <ComboboxChipsInput aria-label="Fruits" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList>
          {(fruit: string) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// Once the list is open, Base UI sets aria-hidden on everything outside the
// input and the popup, the label included. Browsers still name the input from
// it (accname 1.2 keeps a hidden label that roots a native label traversal);
// Testing Library's name computation does not, so the name is asserted while
// the list is closed and the lone combobox is queried without it.
function input() {
  return screen.getByRole("combobox")
}

function options() {
  return screen.getAllByRole("option").map((option) => option.textContent)
}

describe("Combobox", () => {
  // Regression guard for P0-07: the input and its icon buttons had no
  // accessible name.
  it("names the input by its label and the trigger by its label", () => {
    render(<Example />)
    const named = screen.getByRole("combobox", { name: "Fruit" })
    expect(named.tagName).toBe("INPUT")
    expect(named.getAttribute("aria-expanded")).toBe("false")
    expect(screen.getByRole("button", { name: "Open list" })).toBeTruthy()
  })

  it("shows a named clear button once a value is chosen, and clears it", async () => {
    const user = userEvent.setup()
    render(<Example showClear />)
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull()

    await user.click(input())
    await user.click(screen.getByRole("option", { name: "Cherry" }))
    expect(input()).toHaveProperty("value", "Cherry")

    await user.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(input()).toHaveProperty("value", "")
  })

  it("opens a listbox with ArrowDown", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(input())
    await user.keyboard("{ArrowDown}")

    expect(input().getAttribute("aria-expanded")).toBe("true")
    const listbox = screen.getByRole("listbox")
    expect(input().getAttribute("aria-controls")).toBe(listbox.id)
    expect(options()).toEqual(fruits)
  })

  it("filters the options as the user types", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.type(input(), "an")
    expect(options()).toEqual(["Banana"])

    await user.clear(input())
    await user.type(input(), "kiwi")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("No results")).toBeTruthy()
  })

  it("selects the highlighted option with Enter", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Example onValueChange={onValueChange} />)
    await user.click(input())
    await user.keyboard("{ArrowDown}{ArrowDown}")

    const highlighted = screen.getByRole("option", { name: "Banana" })
    expect(input().getAttribute("aria-activedescendant")).toBe(highlighted.id)
    await user.keyboard("{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("Banana", expect.anything())
    expect(input()).toHaveProperty("value", "Banana")
    expect(input().getAttribute("aria-expanded")).toBe("false")
  })

  it("closes with Escape", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Escape}")
    expect(input().getAttribute("aria-expanded")).toBe("false")
  })

  // Regression guard for P3-19: every chip's remove button was named
  // "Remove", so a screen reader could not tell them apart.
  it("names each chip's remove button after its item, and removes it", async () => {
    const user = userEvent.setup()
    render(
      <MultipleExample
        chip={(fruit) => <ComboboxChip key={fruit}>{fruit}</ComboboxChip>}
      />
    )
    expect(
      screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))
    ).toEqual(["Remove Apple", "Remove Cherry"])

    await user.click(screen.getByRole("button", { name: "Remove Apple" }))
    expect(screen.queryByRole("button", { name: "Remove Apple" })).toBeNull()
    expect(screen.getByRole("button", { name: "Remove Cherry" })).toBeTruthy()
  })

  it("names the remove button from rendered children, or from removeLabel", async () => {
    render(
      <MultipleExample
        chip={(fruit) => (
          <ComboboxChip
            key={fruit}
            removeLabel={fruit === "Cherry" ? "Take Cherry off" : undefined}
          >
            <strong>{fruit}</strong>
          </ComboboxChip>
        )}
      />
    )
    expect(
      await screen.findByRole("button", { name: "Remove Apple" })
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Take Cherry off" })).toBeTruthy()
  })

  it("has no axe violations, closed and open", async () => {
    const user = userEvent.setup()
    render(<Example showClear />)
    expect(await axeViolations()).toEqual([])
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    expect(await axeViolations()).toEqual([])
  })
})
