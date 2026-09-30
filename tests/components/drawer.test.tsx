import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

function Example() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow down your search with the filters below.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function trigger() {
  return screen.getByRole("button", { name: "Open filters" })
}

async function open() {
  render(<Example />)
  await userEvent.click(trigger())
  return screen.getByRole("dialog")
}

describe("Drawer", () => {
  it("role: a dialog, modal — the rest of the page is aria-hidden while it is open", async () => {
    const dialog = await open()
    expect(dialog.dataset.slot).toBe("drawer-content")
    expect(screen.queryByRole("button", { name: "Open filters" })).toBeNull()
  })

  it("accessible name: labeled by DrawerTitle", async () => {
    await open()
    expect(
      screen.getByRole("dialog", {
        name: "Filters",
        description: "Narrow down your search with the filters below.",
      })
    ).toBeTruthy()
  })

  it("closes from its DrawerClose button and returns focus to the trigger", async () => {
    await open()
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull()
    await expect.poll(() => document.activeElement).toBe(trigger())
  })

  it("Tab / Shift+Tab: moves through the focusable elements, trapped in the drawer", async () => {
    const dialog = await open()
    for (let i = 0; i < 4; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    for (let i = 0; i < 4; i++) {
      await userEvent.tab({ shift: true })
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it("Escape: closes the drawer", async () => {
    await open()
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull()
    await expect.poll(() => document.activeElement).toBe(trigger())
  })
})
