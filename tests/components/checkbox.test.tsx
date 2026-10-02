import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

function Example() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" name="remember" />
        <Label htmlFor="remember">Remember me</Label>
      </div>
      <button type="button">Sign in</button>
    </>
  )
}

function checkbox() {
  return screen.getByRole("checkbox", { name: "Remember me" })
}

describe("Checkbox", () => {
  it("role: a checkbox on a button, aria-checked true, false or mixed", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Example />)
    expect(checkbox().tagName).toBe("BUTTON")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    await user.click(checkbox())
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    unmount()

    render(<Checkbox checked="indeterminate" aria-label="Select all" />)
    expect(
      screen
        .getByRole("checkbox", { name: "Select all" })
        .getAttribute("aria-checked")
    ).toBe("mixed")
  })

  it("accessible name: a tied Label, which toggles the box on click, or an aria-label", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Example />)
    await user.click(screen.getByText("Remember me"))
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    unmount()

    render(<Checkbox aria-label="Remember me" />)
    expect(checkbox()).toBeTruthy()
  })

  it("Space: checks / unchecks the box", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(checkbox())
    await user.keyboard(" ")
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    await user.keyboard(" ")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
  })

  it("Tab: moves focus to the next element", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(document.activeElement).toBe(checkbox())
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Sign in" })
    )
  })

  it("does not toggle with Enter", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
  })
})

function setTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

/** The icons of a checkbox that are drawn, as the path each one shows. */
function shownIcons(box: HTMLElement) {
  return [...box.querySelectorAll("svg")]
    .filter((svg) => getComputedStyle(svg).display !== "none")
    .map((svg) => svg.querySelector("path")?.getAttribute("d"))
}

describe("Checkbox, checked and invalid", () => {
  afterEach(() => setTheme("light"))

  it.each(["light", "dark"] as const)(
    "keeps the border of a checked box in %s",
    (theme) => {
      setTheme(theme)
      render(
        <>
          <Checkbox aria-label="Plain" defaultChecked />
          <Checkbox aria-label="Invalid" defaultChecked aria-invalid />
        </>
      )
      expect(
        getComputedStyle(screen.getByRole("checkbox", { name: "Invalid" }))
          .borderTopColor
      ).toBe(
        getComputedStyle(screen.getByRole("checkbox", { name: "Plain" }))
          .borderTopColor
      )
    }
  )
})

describe("Checkbox, indeterminate", () => {
  afterEach(() => setTheme("light"))

  it.each(["light", "dark"] as const)(
    "is filled like a checked box, with a border to match, in %s",
    (theme) => {
      setTheme(theme)
      render(
        <>
          <Checkbox aria-label="All" checked />
          <Checkbox aria-label="Some" checked="indeterminate" />
          <Checkbox
            aria-label="Some, invalid"
            checked="indeterminate"
            aria-invalid
          />
        </>
      )
      const all = getComputedStyle(
        screen.getByRole("checkbox", { name: "All" })
      )
      for (const name of ["Some", "Some, invalid"]) {
        const some = getComputedStyle(screen.getByRole("checkbox", { name }))
        expect(some.backgroundColor, `${name} fill`).toBe(all.backgroundColor)
        expect(some.borderTopColor, `${name} border`).toBe(all.borderTopColor)
      }
    }
  )

  it("shows a minus where a checked box shows a check", () => {
    render(
      <>
        <Checkbox aria-label="All" checked />
        <Checkbox aria-label="Some" checked="indeterminate" />
      </>
    )
    const all = shownIcons(screen.getByRole("checkbox", { name: "All" }))
    const some = shownIcons(screen.getByRole("checkbox", { name: "Some" }))
    expect(all).toHaveLength(1)
    expect(some).toHaveLength(1)
    expect(some[0]).not.toBe(all[0])
  })

  it("shows the check again once an uncontrolled box is clicked", async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Some" defaultChecked="indeterminate" />)
    const box = screen.getByRole("checkbox", { name: "Some" })
    const minus = shownIcons(box)
    await user.click(box)
    expect(box.getAttribute("aria-checked")).toBe("true")
    const check = shownIcons(box)
    expect(check).toHaveLength(1)
    expect(check[0]).not.toBe(minus[0])
  })
})
