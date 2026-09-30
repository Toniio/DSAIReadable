import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { page, userEvent } from "vitest/browser"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { UI_STRINGS } from "@/lib/ui-strings"

const commands = ["New file", "Search", "Home", "Settings"]

function Items({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Actions">
        <CommandItem onSelect={onSelect}>
          New file
          <CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={onSelect}>
          Search
          <CommandShortcut>⌘F</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Navigation">
        <CommandItem onSelect={onSelect}>Home</CommandItem>
        <CommandItem onSelect={onSelect}>Settings</CommandItem>
      </CommandGroup>
    </CommandList>
  )
}

function Example({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <Command>
      <CommandInput
        placeholder="Search for a command…"
        aria-label="Search for a command"
      />
      <Items onSelect={onSelect} />
    </Command>
  )
}

// cmdk points the input's aria-labelledby at its own label, empty unless
// Command gets a `label`. Accname 1.2 skips an empty aria-labelledby and falls
// back to aria-label, as browsers do; Testing Library's name computation does
// not, so the input is queried through the browser locator.
function input() {
  return page
    .getByRole("combobox", { name: "Search for a command", exact: true })
    .element() as HTMLInputElement
}

// cmdk marks the active option with aria-selected and keeps DOM focus in the
// input.
function active() {
  return screen
    .getAllByRole("option")
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.textContent)
}

function options() {
  return screen.getAllByRole("option").map((option) => option.textContent)
}

describe("Command", () => {
  it("role: the input is a combobox controlling a listbox of options, aria-selected on the active one", () => {
    render(<Example />)
    const listbox = screen.getByRole("listbox")
    expect(input().getAttribute("aria-controls")).toBe(listbox.id)
    expect(screen.getAllByRole("option")).toHaveLength(4)
    expect(active()).toEqual(["New file⌘N"])
    const [first] = screen.getAllByRole("option")
    expect(first.getAttribute("aria-selected")).toBe("true")
  })

  it("accessible name: the input by its aria-label and placeholder, CommandDialog by its hidden title", () => {
    const { unmount } = render(<Example />)
    expect(input().getAttribute("placeholder")).toBe("Search for a command…")
    unmount()

    render(
      <CommandDialog open>
        <Command>
          <CommandInput
            placeholder="Search for a command…"
            aria-label="Search for a command"
          />
          <Items />
        </Command>
      </CommandDialog>
    )
    expect(
      screen.getByRole("dialog", {
        name: UI_STRINGS.command.dialogTitle,
        description: UI_STRINGS.command.dialogDescription,
      })
    ).toBeTruthy()
    expect(input()).toBeTruthy()
  })

  it("ArrowDown / ArrowUp: next / previous option", async () => {
    render(<Example />)
    input().focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(active()).toEqual(["Search⌘F"])
    await userEvent.keyboard("{ArrowDown}")
    expect(active()).toEqual(["Home"])
    await userEvent.keyboard("{ArrowUp}")
    expect(active()).toEqual(["Search⌘F"])
    expect(document.activeElement).toBe(input())
  })

  it("Home / End: first / last option", async () => {
    render(<Example />)
    input().focus()
    await userEvent.keyboard("{End}")
    expect(active()).toEqual(["Settings"])
    await userEvent.keyboard("{Home}")
    expect(active()).toEqual(["New file⌘N"])
  })

  it("Enter: runs the active option", async () => {
    const onSelect = vi.fn()
    render(<Example onSelect={onSelect} />)
    input().focus()
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith("Search⌘F")
  })

  it("Typing: filters", async () => {
    render(<Example />)
    await userEvent.type(input(), "set")
    expect(options()).toEqual(["Settings"])
    expect(active()).toEqual(["Settings"])

    await userEvent.clear(input())
    expect(options()).toEqual(commands.map((c) => expect.stringContaining(c)))
    await userEvent.type(input(), "zzz")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("No results found.")).toBeTruthy()
  })
})
