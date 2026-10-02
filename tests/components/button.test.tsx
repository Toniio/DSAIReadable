import { render, screen } from "@testing-library/react"
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent as browserUser } from "vitest/browser"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "@phosphor-icons/react"

import { axeViolations } from "../axe"

describe("Button", () => {
  it("role: a native button element", () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole("button", { name: "Save" })
    expect(button.tagName).toBe("BUTTON")
    expect(button.dataset.slot).toBe("button")
  })

  it("applies the default variant and size", () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole("button")
    expect(button.dataset.variant).toBe("default")
    expect(button.dataset.size).toBe("default")
    expect(button.classList).toContain("bg-primary")
    expect(button.classList).toContain("h-8")
  })

  it.each([
    ["outline", "border-border"],
    ["secondary", "bg-secondary"],
    ["ghost", "hover:bg-muted"],
    ["destructive", "bg-destructive/10"],
    ["link", "underline-offset-4"],
  ] as const)("applies the %s variant classes", (variant, expected) => {
    render(<Button variant={variant}>Save</Button>)
    const button = screen.getByRole("button")
    expect(button.dataset.variant).toBe(variant)
    expect(button.classList).toContain(expected)
    expect(button.classList).not.toContain("bg-primary")
  })

  it.each([
    ["xs", "h-6"],
    ["sm", "h-7"],
    ["lg", "h-9"],
    ["icon", "size-8"],
    ["icon-xs", "size-6"],
    ["icon-sm", "size-7"],
    ["icon-lg", "size-9"],
  ] as const)("applies the %s size classes", (size, expected) => {
    render(
      <Button size={size} aria-label="Add">
        <PlusIcon />
      </Button>
    )
    const button = screen.getByRole("button", { name: "Add" })
    expect(button.dataset.size).toBe(size)
    expect(button.classList).toContain(expected)
  })

  it("Enter / Space: activates the button", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(2)
    await user.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it("Tab: moves focus to the next element", async () => {
    const user = userEvent.setup()
    render(
      <>
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </>
    )
    const save = screen.getByRole("button", { name: "Save" })
    save.focus()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" })
    )
  })

  it("accessible name: the button text, or aria-label on the icon sizes", () => {
    render(
      <>
        <Button>Sign in</Button>
        <Button size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </>
    )
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy()
    const icon = screen.getByRole("button", { name: "Add" })
    expect(icon.textContent).toBe("")
  })

  it("leaves the tab order and ignores clicks when disabled", async () => {
    // The disabled style sets pointer-events: none, which user-event refuses
    // to click through; the click is still sent, to prove nothing handles it.
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    })
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    )

    const button = screen.getByRole("button")
    expect(button).toHaveProperty("disabled", true)
    await user.click(button)
    await user.tab()
    expect(onClick).not.toHaveBeenCalled()
    expect(document.activeElement).not.toBe(button)
  })

  it("renders its child element with asChild", () => {
    render(
      <Button asChild variant="link">
        <a href="/docs">Documentation</a>
      </Button>
    )
    const link = screen.getByRole("link", { name: "Documentation" })
    expect(link.dataset.slot).toBe("button")
    expect(link.classList).toContain("underline-offset-4")
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("has no axe violations, icon-only size included", async () => {
    render(
      <>
        <Button>Save</Button>
        <Button variant="destructive">Delete project</Button>
        <Button size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </>
    )
    expect(await axeViolations()).toEqual([])
  })

  it("is flagged by axe when an icon-only button has no name", async () => {
    render(
      <Button size="icon">
        <PlusIcon />
      </Button>
    )
    expect(await axeViolations()).toEqual([
      expect.stringMatching(/^light button-name: /),
      expect.stringMatching(/^dark button-name: /),
    ])
  })
})

/** What a class paints, read off a reference element in the current theme. */
function paint(
  className: string,
  property: "backgroundColor" | "borderTopColor"
) {
  const ref = document.createElement("span")
  ref.className = className
  document.body.append(ref)
  const value = getComputedStyle(ref)[property]
  ref.remove()
  return value
}

describe("Button outline, dark states", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it.each(["light", "dark"] as const)(
    "outline: the open state takes bg-muted in %s too",
    (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <Button variant="outline">Rest</Button>
          <Button variant="outline" aria-expanded="true">
            Open
          </Button>
        </>
      )
      const rest = getComputedStyle(
        screen.getByRole("button", { name: "Rest" })
      )
      const open = getComputedStyle(
        screen.getByRole("button", { name: "Open" })
      )
      expect(open.backgroundColor).toBe(paint("bg-muted", "backgroundColor"))
      expect(open.backgroundColor).not.toBe(rest.backgroundColor)
    }
  )

  it.each(["light", "dark"] as const)(
    "outline: keyboard focus draws border-ring in %s",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <a href="#top">before</a>
          <Button variant="outline">Save</Button>
        </>
      )
      screen.getByRole("link", { name: "before" }).focus()
      await browserUser.keyboard("{Tab}")
      const button = screen.getByRole("button", { name: "Save" })
      expect(document.activeElement).toBe(button)
      expect(getComputedStyle(button).borderTopColor).toBe(
        paint("border-ring", "borderTopColor")
      )
    }
  )
})
