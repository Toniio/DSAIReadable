import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UI_STRINGS } from "@/lib/ui-strings"

function Example({ closeLabel }: { closeLabel?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open panel</Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={closeLabel}>
        <SheetHeader>
          <SheetTitle>Account details</SheetTitle>
          <SheetDescription>
            Review and update your account information.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

async function open(closeLabel?: string) {
  render(<Example closeLabel={closeLabel} />)
  await userEvent.click(screen.getByRole("button", { name: "Open panel" }))
  return screen.getByRole("dialog")
}

describe("Sheet", () => {
  it("role: a dialog, modal — the rest of the page is aria-hidden while it is open", async () => {
    const dialog = await open()
    expect(dialog.dataset.slot).toBe("sheet-content")
    expect(screen.queryByRole("button", { name: "Open panel" })).toBeNull()
  })

  it("accessible name: labeled by SheetTitle, its close button named by closeLabel", async () => {
    await open()
    expect(
      screen.getByRole("dialog", {
        name: "Account details",
        description: "Review and update your account information.",
      })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: UI_STRINGS.sheet.close })
    ).toBeTruthy()
  })

  it("names its close button from a custom closeLabel", async () => {
    await open("Close account details")
    expect(
      screen.getByRole("button", { name: "Close account details" })
    ).toBeTruthy()
  })

  it("Tab / Shift+Tab: moves through the focusable elements, trapped in the panel", async () => {
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

  it("Escape: closes the panel", async () => {
    await open()
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open panel" })
    )
  })
})
