import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { page } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UI_STRINGS } from "@/lib/ui-strings"

import { axeViolations } from "../axe"

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" />
        <DialogFooter showCloseButton>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function open() {
  const user = userEvent.setup()
  render(<Example />)
  await user.click(screen.getByRole("button", { name: "Edit profile" }))
  return user
}

describe("Dialog", () => {
  it("is closed until its trigger is activated", () => {
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Edit profile" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog")
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("accessible name: the dialog is named by its title and described by its description", async () => {
    await open()
    const dialog = screen.getByRole("dialog", {
      name: "Edit profile",
      description: "Changes apply immediately.",
    })
    expect(dialog.dataset.slot).toBe("dialog-content")
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it("role: a dialog, modal — the rest of the page is aria-hidden while it is open", async () => {
    const user = await open()
    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull()
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeTruthy()
  })

  it("names its close buttons from UI_STRINGS", async () => {
    await open()
    // The corner icon button and the footer button share the label.
    expect(
      screen.getAllByRole("button", { name: UI_STRINGS.dialog.close })
    ).toHaveLength(2)
  })

  it("Tab / Shift+Tab: moves through the focusable elements, trapped in the dialog", async () => {
    const user = await open()
    const dialog = screen.getByRole("dialog")
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    for (let i = 0; i < 6; i++) {
      await user.tab({ shift: true })
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it("Escape: closes the dialog and returns focus to the trigger", async () => {
    const user = await open()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit profile" })
    )
  })

  it("closes from the close button", async () => {
    const user = await open()
    const [corner] = screen.getAllByRole("button", {
      name: UI_STRINGS.dialog.close,
    })
    await user.click(corner)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("has no axe violations when open", async () => {
    await open()
    expect(await axeViolations()).toEqual([])
  })
})

describe("Dialog, viewport gutter", () => {
  // Below `sm` the dialog is as wide as the viewport minus one gutter on each
  // side. The viewport goes back to the desktop size of vitest.config.ts
  // whatever the outcome.
  it.each([320, 375])(
    "stays 16px from each edge of a %ipx viewport",
    async (width) => {
      await page.viewport(width, 812)
      try {
        await open()
        const { left, right } = screen
          .getByRole("dialog")
          .getBoundingClientRect()
        expect(left).toBeCloseTo(16, 1)
        expect(document.documentElement.clientWidth - right).toBeCloseTo(16, 1)
      } finally {
        await page.viewport(1280, 800)
      }
    }
  )
})
