import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { page, userEvent } from "vitest/browser"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

function Example({ onDelete }: { onDelete?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. The data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function trigger() {
  return screen.getByRole("button", { name: "Delete" })
}

async function open(onDelete?: () => void) {
  render(<Example onDelete={onDelete} />)
  await userEvent.click(trigger())
  return screen.getByRole("alertdialog")
}

describe("AlertDialog", () => {
  it("role: an alertdialog, modal — the rest of the page is aria-hidden while it is open", async () => {
    const dialog = await open()
    expect(dialog.dataset.slot).toBe("alert-dialog-content")
    // The trigger shares the Action's name: only the one inside the dialog is left.
    const buttons = screen.getAllByRole("button", { name: "Delete" })
    expect(buttons).toHaveLength(1)
    expect(dialog.contains(buttons[0])).toBe(true)
  })

  it("accessible name: named by its title and described by its description", async () => {
    await open()
    expect(
      screen.getByRole("alertdialog", {
        name: "Delete this item?",
        description:
          "This cannot be undone. The data will be permanently deleted.",
      })
    ).toBeTruthy()
  })

  it("focuses Cancel on open and does not close on an outside click", async () => {
    await open()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" })
    )
    await userEvent.click(document.body, { position: { x: 5, y: 5 } })
    expect(screen.getByRole("alertdialog")).toBeTruthy()
  })

  it("Tab / Shift+Tab: moves through the focusable elements, trapped in the dialog", async () => {
    const dialog = await open()
    const cancel = screen.getByRole("button", { name: "Cancel" })
    const action = screen.getByRole("button", { name: "Delete" })

    await userEvent.tab()
    expect(document.activeElement).toBe(action)
    await userEvent.tab()
    expect(document.activeElement).toBe(cancel)
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(action)
    for (let i = 0; i < 4; i++) {
      await userEvent.tab({ shift: true })
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it("Escape: closes the dialog (same as Cancel)", async () => {
    const onDelete = vi.fn()
    await open(onDelete)
    await userEvent.keyboard("{Escape}")
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull()
    expect(onDelete).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger())
  })

  it("Enter / Space: activates the focused button", async () => {
    const onDelete = vi.fn()
    await open(onDelete)
    // Focus starts on Cancel: Enter cancels.
    await userEvent.keyboard("{Enter}")
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull()
    expect(onDelete).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger())

    await userEvent.click(trigger())
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete" })
    )
    await userEvent.keyboard(" ")
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull()
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

describe("AlertDialog, viewport gutter", () => {
  // The viewport goes back to the desktop size of vitest.config.ts whatever
  // the outcome.
  async function openAt(width: number, check: () => void) {
    await page.viewport(width, 812)
    try {
      render(<Example />)
      await userEvent.click(screen.getByRole("button", { name: "Delete" }))
      check()
    } finally {
      await page.viewport(1280, 800)
    }
  }

  it("stays 16px from each edge of a 320px viewport", async () => {
    await openAt(320, () => {
      const { left, right } = screen
        .getByRole("alertdialog")
        .getBoundingClientRect()
      expect(left).toBeCloseTo(16, 1)
      expect(document.documentElement.clientWidth - right).toBeCloseTo(16, 1)
    })
  })

  it("keeps its own width, 320px, where the gutter leaves room for it", async () => {
    await openAt(375, () => {
      const { width } = screen.getByRole("alertdialog").getBoundingClientRect()
      expect(width).toBeCloseTo(320, 1)
    })
  })
})
