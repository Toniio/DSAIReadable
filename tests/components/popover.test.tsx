import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

function Example() {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Settings</Button>
        </PopoverTrigger>
        <PopoverContent aria-labelledby="dimensions-title">
          <PopoverHeader>
            <PopoverTitle id="dimensions-title">Dimensions</PopoverTitle>
            <PopoverDescription>
              Set the dimensions of the component.
            </PopoverDescription>
          </PopoverHeader>
          <Label htmlFor="width">Width</Label>
          <Input id="width" />
          <Label htmlFor="height">Height</Label>
          <Input id="height" />
        </PopoverContent>
      </Popover>
      <Button>Save</Button>
    </>
  )
}

function trigger() {
  return screen.getByRole("button", { name: "Settings" })
}

async function openWithKeyboard(key = "{Enter}") {
  render(<Example />)
  trigger().focus()
  await userEvent.keyboard(key)
  return screen.getByRole("dialog")
}

describe("Popover", () => {
  it("role: the content is a dialog; the trigger has aria-haspopup=dialog and aria-expanded", async () => {
    render(<Example />)
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog")
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("dialog")).toBeNull()

    await userEvent.click(trigger())
    const dialog = screen.getByRole("dialog")
    expect(trigger().getAttribute("aria-expanded")).toBe("true")
    expect(trigger().getAttribute("aria-controls")).toBe(dialog.id)
    expect(dialog.dataset.slot).toBe("popover-content")
  })

  it("accessible name: the trigger by its text, the content by its title", async () => {
    await openWithKeyboard()
    // Non-modal: the trigger stays in the accessibility tree while open.
    expect(trigger()).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "Dimensions" })).toBeTruthy()
  })

  it("Enter / Space: opens the popover", async () => {
    const dialog = await openWithKeyboard("{Enter}")
    expect(dialog).toBeTruthy()
    expect(trigger().getAttribute("aria-expanded")).toBe("true")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()

    trigger().focus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(trigger().getAttribute("aria-expanded")).toBe("true")
  })

  it("Tab: moves through the content, from the last element back to the first", async () => {
    const dialog = await openWithKeyboard()
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole("textbox", { name: "Width" }))
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Height" })
    )
    // Radix Popover loops its focus scope even when it is not modal.
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Width" })
    )
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it("Escape: closes it and returns focus to the trigger", async () => {
    await openWithKeyboard()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(trigger())
  })
})
