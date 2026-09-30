import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

function Example() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Print</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

function menu(name: string) {
  return screen.getByRole("menuitem", { name })
}

async function openFile() {
  render(<Example />)
  const file = menu("File")
  file.focus()
  await userEvent.keyboard("{ArrowDown}")
  await expect.poll(() => screen.queryByRole("menu")).not.toBeNull()
  await expect.poll(() => document.activeElement).toBe(menu("New ⌘N"))
  return file
}

describe("Menubar", () => {
  it("role: a menubar whose menus are menus of menuitems", async () => {
    render(<Example />)
    const bar = screen.getByRole("menubar")
    const file = menu("File")
    expect(bar.contains(file)).toBe(true)
    expect(file.getAttribute("aria-haspopup")).toBe("menu")
    expect(file.getAttribute("aria-expanded")).toBe("false")

    await userEvent.click(file)
    const open = screen.getByRole("menu")
    expect(file.getAttribute("aria-expanded")).toBe("true")
    expect(file.getAttribute("aria-controls")).toBe(open.id)
    expect(
      within(open)
        .getAllByRole("menuitem")
        .map((item) => item.textContent)
    ).toEqual(["New ⌘N", "Open ⌘O", "Print", "Delete"])
  })

  it("accessible name: each menu and item is named by its text", async () => {
    render(<Example />)
    expect(menu("File")).toBeTruthy()
    expect(menu("Edit")).toBeTruthy()
    await userEvent.click(menu("File"))
    expect(menu("New ⌘N")).toBeTruthy()
    expect(menu("Delete")).toBeTruthy()
  })

  it("ArrowRight / ArrowLeft: moves to the next / previous menu in the bar", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(menu("File"))
    await userEvent.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(menu("Edit"))
    await userEvent.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(menu("File"))
  })

  it("Enter / Space / ArrowDown: opens the focused menu", async () => {
    render(<Example />)
    const file = menu("File")
    for (const key of ["{Enter}", "{ }", "{ArrowDown}"]) {
      file.focus()
      await userEvent.keyboard(key)
      await expect.poll(() => file.getAttribute("aria-expanded")).toBe("true")
      expect(screen.getByRole("menu").id).toBe(
        file.getAttribute("aria-controls")
      )
      await userEvent.keyboard("{Escape}")
      await expect.poll(() => screen.queryByRole("menu")).toBeNull()
    }
  })

  it("ArrowDown / ArrowUp: moves to the next / previous item in an open menu", async () => {
    await openFile()
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(menu("Open ⌘O"))
    await userEvent.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(menu("Print"))
    await userEvent.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(menu("Open ⌘O"))
  })

  it("Escape: closes the menu", async () => {
    const file = await openFile()
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("menu")).toBeNull()
    expect(file.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(file)
  })

  it("Typing: moves to the item that starts with the typed letter", async () => {
    await openFile()
    await userEvent.keyboard("p")
    expect(document.activeElement).toBe(menu("Print"))
  })
})
