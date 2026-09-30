import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { DotsThreeIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Example({ onSelect }: { onSelect?: (item: string) => void }) {
  const [statusBar, setStatusBar] = useState(true)
  const [position, setPosition] = useState("top")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSelect?.("Profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.("Settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={statusBar}
          onCheckedChange={setStatusBar}
        >
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function trigger() {
  return screen.getByRole("button", { name: "Options" })
}

function item(name: string) {
  return screen.getByRole("menuitem", { name })
}

// Radix DropdownMenu is modal: while it is open, everything outside it is
// aria-hidden, the trigger included. Tests take the trigger before opening.
async function openWithKeyboard(onSelect?: (item: string) => void) {
  render(<Example onSelect={onSelect} />)
  const button = trigger()
  button.focus()
  await userEvent.keyboard("{Enter}")
  await expect.poll(() => document.activeElement).toBe(item("Profile"))
  return button
}

describe("DropdownMenu", () => {
  it("role: a trigger with aria-haspopup menu and aria-expanded opens a menu of menuitem, menuitemcheckbox and menuitemradio items", async () => {
    render(<Example />)
    const button = trigger()
    expect(button.getAttribute("aria-haspopup")).toBe("menu")
    expect(button.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("menu")).toBeNull()

    await userEvent.click(button)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    const menu = screen.getByRole("menu")
    expect(button.getAttribute("aria-controls")).toBe(menu.id)
    expect(
      screen.getAllByRole("menuitem").map((menuitem) => menuitem.textContent)
    ).toEqual(["Profile", "Settings", "Invite users", "Sign out"])
    const checkbox = screen.getByRole("menuitemcheckbox", {
      name: "Status bar",
    })
    expect(checkbox.getAttribute("aria-checked")).toBe("true")
    expect(
      screen
        .getAllByRole("menuitemradio")
        .map((radio) => [radio.textContent, radio.getAttribute("aria-checked")])
    ).toEqual([
      ["Top", "true"],
      ["Bottom", "false"],
    ])
  })

  it("accessible name: the trigger is named by its text, an icon-only trigger by its aria-label", () => {
    render(
      <>
        <Example />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <DotsThreeIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu")
    expect(
      screen
        .getByRole("button", { name: "Row actions" })
        .getAttribute("aria-haspopup")
    ).toBe("menu")
  })

  it("Enter / Space / ArrowDown: opens the menu (focus on the first item)", async () => {
    render(<Example />)
    const button = trigger()
    for (const key of ["{Enter}", "{ }", "{ArrowDown}"]) {
      button.focus()
      await userEvent.keyboard(key)
      await expect.poll(() => document.activeElement).toBe(item("Profile"))
      expect(button.getAttribute("aria-expanded")).toBe("true")
      await userEvent.keyboard("{Escape}")
      await expect.poll(() => screen.queryByRole("menu")).toBeNull()
    }
  })

  it("ArrowDown / ArrowUp: moves to the next / previous item", async () => {
    await openWithKeyboard()
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Settings"))
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Invite users"))
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(item("Settings"))
  })

  it("Home / End: moves to the first / last item", async () => {
    await openWithKeyboard()
    await userEvent.keyboard("{End}")
    expect(document.activeElement).toBe(item("Sign out"))
    await userEvent.keyboard("{Home}")
    expect(document.activeElement).toBe(item("Profile"))
  })

  it("ArrowRight / ArrowLeft: opens / closes a submenu", async () => {
    await openWithKeyboard()
    // Radix moves focus in a timeout: one key at a time, as a person types.
    await userEvent.keyboard("{ArrowDown}")
    await expect.poll(() => document.activeElement).toBe(item("Settings"))
    await userEvent.keyboard("{ArrowDown}")
    const subTrigger = item("Invite users")
    await expect.poll(() => document.activeElement).toBe(subTrigger)

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
    const button = await openWithKeyboard(onSelect)
    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenLastCalledWith("Profile")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()

    button.focus()
    await userEvent.keyboard("{Enter}")
    await expect.poll(() => document.activeElement).toBe(item("Profile"))
    await userEvent.keyboard("{ArrowDown}")
    await expect.poll(() => document.activeElement).toBe(item("Settings"))
    await userEvent.keyboard(" ")
    expect(onSelect).toHaveBeenLastCalledWith("Settings")
    expect(onSelect).toHaveBeenCalledTimes(2)
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()
  })

  it("Escape: closes the menu and returns focus to the trigger", async () => {
    const button = await openWithKeyboard()
    await userEvent.keyboard("{ArrowDown}{Escape}")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()
    expect(button.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(button)
  })

  it("Typing: moves to the item that starts with the typed letter", async () => {
    await openWithKeyboard()
    await userEvent.keyboard("i")
    expect(document.activeElement).toBe(item("Invite users"))
  })
})
