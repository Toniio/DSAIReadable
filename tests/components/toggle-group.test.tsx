import { GridFourIcon, ListIcon, TableIcon } from "@phosphor-icons/react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { userEvent as pointer } from "vitest/browser"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { borderPaint } from "../focus"

function Example() {
  return (
    <>
      <ToggleGroup
        type="single"
        defaultValue="list"
        variant="outline"
        size="default"
        aria-label="View"
      >
        <ToggleGroupItem value="list" aria-label="List view">
          <ListIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <GridFourIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Table view">
          <TableIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <button type="button">After</button>
    </>
  )
}

function MultipleExample() {
  return (
    <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Format">
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
    </ToggleGroup>
  )
}

function Joined({
  variant,
  spacing,
}: {
  variant: "default" | "outline"
  spacing: number
}) {
  return (
    <ToggleGroup
      type="single"
      defaultValue="grid"
      variant={variant}
      spacing={spacing}
      aria-label="View"
    >
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="table">Table</ToggleGroupItem>
    </ToggleGroup>
  )
}

function item(name: string) {
  return screen.getByRole("radio", { name })
}

describe("ToggleGroup", () => {
  it("role: a radiogroup of radios with aria-checked in single mode, a toolbar of buttons with aria-pressed in multiple mode", () => {
    const { unmount } = render(<Example />)
    const group = screen.getByRole("radiogroup", { name: "View" })
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(3)
    for (const radio of radios) expect(group.contains(radio)).toBe(true)
    expect(radios.map((radio) => radio.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ])
    unmount()

    render(<MultipleExample />)
    expect(screen.getByRole("toolbar", { name: "Format" })).toBeTruthy()
    expect(screen.queryByRole("radio")).toBeNull()
    expect(
      screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed")
    ).toBe("true")
    expect(
      screen
        .getByRole("button", { name: "Italic" })
        .getAttribute("aria-pressed")
    ).toBe("false")
  })

  it("accessible name: the group by its aria-label, each icon-only item by its own", () => {
    render(<Example />)
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy()
    for (const name of ["List view", "Grid view", "Table view"]) {
      expect(item(name).textContent).toBe("")
    }
  })

  it("Tab: enters the group (a single tab stop)", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(item("List view"))
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" })
    )
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(item("List view"))
  })

  it("ArrowRight / ArrowLeft (or ArrowDown / ArrowUp): next / previous item", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(item("Grid view"))
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(item("List view"))
    await user.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(item("Grid view"))
    await user.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(item("List view"))
  })

  it("Home / End: first / last item", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{End}")
    expect(document.activeElement).toBe(item("Table view"))
    await user.keyboard("{Home}")
    expect(document.activeElement).toBe(item("List view"))
  })

  it("Enter / Space: turns the item on or off", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{ArrowRight}")
    await user.keyboard("{Enter}")
    expect(item("Grid view").getAttribute("aria-checked")).toBe("true")
    expect(item("List view").getAttribute("aria-checked")).toBe("false")
    await user.keyboard(" ")
    expect(item("Grid view").getAttribute("aria-checked")).toBe("false")
  })

  it("pressed: the on item draws a solid frame at 3:1 or more on the page, which hover does not draw, light and dark", async () => {
    const root = document.documentElement
    for (const variant of ["default", "outline"] as const)
      for (const spacing of [0, 2]) {
        const { unmount } = render(
          <Joined variant={variant} spacing={spacing} />
        )
        await pointer.hover(item("Table"))
        try {
          for (const theme of ["light", "dark"] as const) {
            root.classList.toggle("dark", theme === "dark")
            const where = `${variant}, spacing ${spacing}, ${theme}`
            const frame = borderPaint(item("Grid"))
            expect(frame.contrast, where).toBeGreaterThanOrEqual(3)
            expect(frame.key, where).not.toBe(borderPaint(item("Table")).key)
          }
        } finally {
          root.classList.remove("dark")
          unmount()
        }
      }
  })
})
