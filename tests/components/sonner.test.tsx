import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

function Example({ onUndo }: { onUndo?: () => void }) {
  return (
    <>
      <Button
        onClick={() =>
          toast.success("All set! Your changes are saved.", {
            duration: Infinity,
            action: { label: "Undo", onClick: () => onUndo?.() },
            cancel: { label: "Keep", onClick: () => {} },
          })
        }
      >
        Save changes
      </Button>
      <Toaster />
    </>
  )
}

async function showToast(onUndo?: () => void) {
  render(<Example onUndo={onUndo} />)
  await userEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await expect
    .poll(() => screen.queryByText("All set! Your changes are saved."))
    .not.toBeNull()
}

// Toasts live in a module-level store that outlives each render.
afterEach(() => {
  toast.dismiss()
})

function region() {
  return screen.getByRole("region", { name: /^Notifications/ })
}

describe("Sonner", () => {
  it("role: a region named Notifications, with a polite live list of toasts", async () => {
    await showToast()
    const section = region()
    expect(section.tagName).toBe("SECTION")
    expect(section.getAttribute("aria-live")).toBe("polite")
    expect(within(section).getAllByRole("listitem")).toHaveLength(1)
  })

  it("accessible name: the toast text is announced politely, inside the live region", async () => {
    await showToast()
    const section = region()
    expect(section.getAttribute("aria-live")).toBe("polite")
    expect(
      within(section).getByText("All set! Your changes are saved.")
    ).toBeTruthy()
  })

  it.each(["light", "dark"])(
    "a toast is square, like every surface of the system (%s)",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      await showToast()
      // Sonner's own unlayered rule reads --border-radius: the Toaster sets it
      // to radius.none, where it set radius.md (8px) before.
      const toastElement = document.querySelector<HTMLElement>(
        "[data-sonner-toast]"
      )!
      expect(toastElement.dataset.styled).toBe("true")
      expect(getComputedStyle(toastElement).borderRadius).toBe("0px")
    }
  )

  it("Alt+T: moves focus to the notifications area", async () => {
    await showToast()
    screen.getByRole("button", { name: "Save changes" }).focus()
    await userEvent.keyboard("{Alt>}t{/Alt}")
    await expect
      .poll(() => region().contains(document.activeElement))
      .toBe(true)
  })

  it("Tab: moves through the toasts' actions", async () => {
    const onUndo = vi.fn()
    await showToast(onUndo)
    await userEvent.keyboard("{Alt>}t{/Alt}")
    await expect
      .poll(() => region().contains(document.activeElement))
      .toBe(true)

    const section = region()
    const keep = within(section).getByRole("button", { name: "Keep" })
    const undo = within(section).getByRole("button", { name: "Undo" })
    const reached: Element[] = []
    for (let i = 0; i < 4 && !reached.includes(undo); i++) {
      await userEvent.tab()
      if (document.activeElement) reached.push(document.activeElement)
    }
    expect(reached).toContain(keep)
    expect(reached).toContain(undo)
    expect(reached.indexOf(keep)).toBeLessThan(reached.indexOf(undo))
    await userEvent.keyboard("{Enter}")
    expect(onUndo).toHaveBeenCalledTimes(1)
  })
})
