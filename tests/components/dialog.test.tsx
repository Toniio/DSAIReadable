import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

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

  it("opens a modal dialog named by its title and described by its description", async () => {
    await open()
    const dialog = screen.getByRole("dialog", {
      name: "Edit profile",
      description: "Changes apply immediately.",
    })
    expect(dialog.dataset.slot).toBe("dialog-content")
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it("hides the rest of the page from assistive technology while open", async () => {
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

  it("traps focus inside the dialog", async () => {
    const user = await open()
    const dialog = screen.getByRole("dialog")
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it("closes with Escape and returns focus to the trigger", async () => {
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
