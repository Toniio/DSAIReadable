import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { axeViolations } from "../axe"

function Example({
  size,
  onValueChange,
}: {
  size?: "sm" | "default"
  onValueChange?: (value: string) => void
}) {
  return (
    <>
      <Label htmlFor="fruit">Fruit</Label>
      <Select onValueChange={onValueChange}>
        <SelectTrigger id="fruit" size={size}>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}

function trigger() {
  return screen.getByRole("combobox", { name: "Fruit" })
}

// Radix Select moves DOM focus onto the highlighted option.
function active() {
  return document.activeElement?.textContent
}

// Radix Select is modal: while the list is open, everything outside it is
// aria-hidden, the trigger included. Tests take the trigger before opening.
async function openWithKeyboard(props: Parameters<typeof Example>[0] = {}) {
  const user = userEvent.setup()
  render(<Example {...props} />)
  const button = trigger()
  await user.tab()
  await user.keyboard("{Enter}")
  return { user, button }
}

describe("Select", () => {
  it("accessible name: a combobox named by its Label, collapsed, showing the placeholder", () => {
    render(<Example />)
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
    expect(trigger().textContent).toBe("Pick a fruit")
    expect(trigger().dataset.placeholder).toBe("")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("applies the size variant", () => {
    const { unmount } = render(<Example />)
    expect(trigger().dataset.size).toBe("default")
    unmount()
    render(<Example size="sm" />)
    expect(trigger().dataset.size).toBe("sm")
  })

  it("role: a combobox trigger with aria-expanded, controlling a listbox of options", async () => {
    const { button } = await openWithKeyboard()
    expect(button.getAttribute("aria-expanded")).toBe("true")
    const listbox = screen.getByRole("listbox")
    expect(button.getAttribute("aria-controls")).toBe(listbox.id)
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["Apple", "Banana", "Cherry"])
  })

  it("Enter / Space / ArrowDown / ArrowUp: opens the list", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const button = trigger()
    for (const key of ["{Enter}", " ", "{ArrowDown}", "{ArrowUp}"]) {
      button.focus()
      await user.keyboard(key)
      expect(screen.getByRole("listbox")).toBeTruthy()
      expect(button.getAttribute("aria-expanded")).toBe("true")
      await user.keyboard("{Escape}")
      expect(screen.queryByRole("listbox")).toBeNull()
    }
  })

  it("ArrowDown / ArrowUp: next / previous option", async () => {
    const { user } = await openWithKeyboard()
    expect(active()).toBe("Apple")
    await user.keyboard("{ArrowDown}")
    expect(active()).toBe("Banana")
    await user.keyboard("{ArrowDown}")
    expect(active()).toBe("Cherry")
    await user.keyboard("{ArrowUp}")
    expect(active()).toBe("Banana")
  })

  it("Home / End: first / last option", async () => {
    const { user } = await openWithKeyboard()
    await user.keyboard("{End}")
    expect(active()).toBe("Cherry")
    await user.keyboard("{Home}")
    expect(active()).toBe("Apple")
  })

  it("Enter / Space: selects the option", async () => {
    const onValueChange = vi.fn()
    const { user, button } = await openWithKeyboard({ onValueChange })
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("banana")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger().textContent).toBe("Banana")
    expect(document.activeElement).toBe(trigger())

    await user.keyboard("{Enter}")
    expect(active()).toBe("Banana")
    await user.keyboard("{ArrowDown}")
    await user.keyboard(" ")
    expect(onValueChange).toHaveBeenLastCalledWith("cherry")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(button.textContent).toBe("Cherry")
  })

  it("Escape: closes without changing anything", async () => {
    const onValueChange = vi.fn()
    const { user } = await openWithKeyboard({ onValueChange })
    await user.keyboard("{ArrowDown}{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger().textContent).toBe("Pick a fruit")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger())
  })

  it("Typing: moves to the option that starts with the typed letter", async () => {
    const { user } = await openWithKeyboard()
    await user.keyboard("c")
    expect(active()).toBe("Cherry")
  })

  it("has no axe violations, closed and open", async () => {
    const user = userEvent.setup()
    render(<Example />)
    expect(await axeViolations()).toEqual([])
    await user.click(trigger())
    expect(screen.getByRole("listbox")).toBeTruthy()
    expect(await axeViolations()).toEqual([])
  })
})
