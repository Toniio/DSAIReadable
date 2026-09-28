import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "@phosphor-icons/react"

import { axeViolations } from "../axe"

describe("Button", () => {
  it("renders a native button named by its text", () => {
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

  it("activates with a click, Enter and Space", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole("button"))
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it("leaves the tab order and ignores clicks when disabled", async () => {
    const user = userEvent.setup()
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
      expect.stringMatching(/^button-name: /),
    ])
  })
})
