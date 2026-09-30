import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { TrashIcon } from "@phosphor-icons/react"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

function Example({ onSelect }: { onSelect?: (item: string) => void }) {
  const [grid, setGrid] = useState(true)
  const [sort, setSort] = useState("name")
  return (
    <ContextMenu>
      {/* Focusable so the Menu key can reach it (spec Pitfalls). */}
      <ContextMenuTrigger
        tabIndex={0}
        className="flex h-36 w-64 items-center justify-center rounded-xs border border-dashed"
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onSelect?.("Copy")}>
          Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onSelect?.("Paste")}>
          Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Message</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          Show grid
        </ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
          <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" aria-label="Delete">
          <TrashIcon />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function area() {
  return screen.getByText("Right-click here")
}

function item(name: string) {
  return screen.getByRole("menuitem", { name })
}

async function open(onSelect?: (item: string) => void) {
  render(<Example onSelect={onSelect} />)
  await userEvent.click(area(), { button: "right" })
  await expect.poll(() => screen.queryByRole("menu")).not.toBeNull()
}

// Radix moves focus in a timeout: one key at a time, as a person types.
async function press(key: string, focusLandsOn: string) {
  await userEvent.keyboard(key)
  await expect.poll(() => document.activeElement).toBe(item(focusLandsOn))
}

describe("ContextMenu", () => {
  it("role: a menu of menuitem, menuitemcheckbox and menuitemradio items", async () => {
    await open()
    expect(screen.getByRole("menu")).toBeTruthy()
    expect(screen.getAllByRole("menuitem")).toHaveLength(4)
    expect(
      screen
        .getByRole("menuitemcheckbox", { name: "Show grid" })
        .getAttribute("aria-checked")
    ).toBe("true")
    expect(
      screen
        .getAllByRole("menuitemradio")
        .map((radio) => [radio.textContent, radio.getAttribute("aria-checked")])
    ).toEqual([
      ["Sort by name", "true"],
      ["Sort by date", "false"],
    ])
  })

  it("accessible name: each item is named by its text, an icon-only item by its aria-label", async () => {
    await open()
    expect(item("Copy ⌘C")).toBeTruthy()
    expect(item("Paste ⌘V")).toBeTruthy()
    expect(item("Share")).toBeTruthy()
    expect(item("Delete").textContent).toBe("")
  })

  // Shift+F10 is left out: whether it fires contextmenu depends on the OS
  // (not on macOS), as the spec says.
  it("Right-click, Menu key: opens the menu on the area", async () => {
    render(<Example />)
    const trigger = area()

    await userEvent.click(trigger, { button: "right" })
    await expect.poll(() => screen.queryByRole("menu")).not.toBeNull()
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()

    trigger.focus()
    await userEvent.keyboard("{ContextMenu}")
    await expect.poll(() => screen.queryByRole("menu")).not.toBeNull()
  })

  it("ArrowDown / ArrowUp: moves to the next / previous item", async () => {
    await open()
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Copy ⌘C"))
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Paste ⌘V"))
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(item("Copy ⌘C"))
  })

  it("ArrowRight / ArrowLeft: opens / closes a submenu", async () => {
    await open()
    await press("{ArrowDown}", "Copy ⌘C")
    await press("{ArrowDown}", "Paste ⌘V")
    await press("{ArrowDown}", "Share")
    const subTrigger = item("Share")

    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(() => document.activeElement).toBe(item("Email"))
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getAllByRole("menu")).toHaveLength(2)

    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(() => screen.getAllByRole("menu")).toHaveLength(1)
    expect(subTrigger.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(subTrigger)
  })

  it("Enter / Space: activates the item", async () => {
    const onSelect = vi.fn()
    await open(onSelect)
    await press("{ArrowDown}", "Copy ⌘C")
    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenLastCalledWith("Copy")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()

    await userEvent.click(area(), { button: "right" })
    await expect.poll(() => screen.queryByRole("menu")).not.toBeNull()
    await press("{ArrowDown}", "Copy ⌘C")
    await press("{ArrowDown}", "Paste ⌘V")
    await userEvent.keyboard(" ")
    expect(onSelect).toHaveBeenLastCalledWith("Paste")
    expect(onSelect).toHaveBeenCalledTimes(2)
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()
  })

  it("Escape: closes the menu", async () => {
    await open()
    await userEvent.keyboard("{ArrowDown}{Escape}")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()
  })

  it("Typing: moves to the item that starts with the typed letter", async () => {
    await open()
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Copy ⌘C"))
    await userEvent.keyboard("s")
    expect(document.activeElement).toBe(item("Share"))
  })
})
