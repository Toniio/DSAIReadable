import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Calendar } from "@/components/ui/calendar"

import { unmarkedTabStops } from "../focus"

// Wednesday, September 16, 2026: a fixed day, so the week and month edges are known.
const START = new Date(2026, 8, 16)

function Example({
  disabled,
  labels,
}: {
  disabled?: Date
  labels?: { labelPrevious: () => string; labelNext: () => string }
}) {
  const [date, setDate] = useState<Date | undefined>(START)

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={START}
      disabled={disabled}
      labels={labels}
      showOutsideDays
    />
  )
}

function dayButton(isoDate: string) {
  const button = document.querySelector<HTMLButtonElement>(
    `[data-day="${isoDate}"] button`
  )
  if (!button) throw new Error(`No day ${isoDate} displayed`)
  return button
}

function focusedDay() {
  return document.activeElement
    ?.closest('[role="gridcell"]')
    ?.getAttribute("data-day")
}

function focusStart() {
  render(<Example />)
  dayButton("2026-09-16").focus()
  expect(focusedDay()).toBe("2026-09-16")
}

describe("Calendar", () => {
  it("role: a grid of dates; the selected day carries aria-selected, an unavailable day is a disabled button", () => {
    render(<Example disabled={new Date(2026, 8, 18)} />)
    const grid = screen.getByRole("grid")
    const selected = grid.querySelectorAll('[aria-selected="true"]')
    expect(selected).toHaveLength(1)
    expect(selected[0].getAttribute("data-day")).toBe("2026-09-16")

    expect(dayButton("2026-09-18")).toHaveProperty("disabled", true)
  })

  it("accessible name: the month navigation buttons are named in English by default, localized through labels", () => {
    const { unmount } = render(<Example />)
    expect(
      screen.getByRole("button", { name: "Go to the Previous Month" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Go to the Next Month" })
    ).toBeTruthy()
    unmount()

    render(
      <Example
        labels={{
          labelPrevious: () => "Previous month",
          labelNext: () => "Next month",
        }}
      />
    )
    expect(screen.getByRole("button", { name: "Previous month" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Next month" })).toBeTruthy()
  })

  it("ArrowLeft / ArrowRight: previous / next day", async () => {
    focusStart()
    await userEvent.keyboard("{ArrowLeft}")
    expect(focusedDay()).toBe("2026-09-15")
    await userEvent.keyboard("{ArrowRight}")
    await userEvent.keyboard("{ArrowRight}")
    expect(focusedDay()).toBe("2026-09-17")
  })

  it("ArrowUp / ArrowDown: same day the previous / next week", async () => {
    focusStart()
    await userEvent.keyboard("{ArrowUp}")
    expect(focusedDay()).toBe("2026-09-09")
    await userEvent.keyboard("{ArrowDown}")
    await userEvent.keyboard("{ArrowDown}")
    expect(focusedDay()).toBe("2026-09-23")
  })

  it("Home / End: start / end of the week", async () => {
    focusStart()
    await userEvent.keyboard("{Home}")
    expect(focusedDay()).toBe("2026-09-13")
    await userEvent.keyboard("{End}")
    expect(focusedDay()).toBe("2026-09-19")
  })

  it("PageUp / PageDown: previous / next month", async () => {
    focusStart()
    await userEvent.keyboard("{PageUp}")
    await expect.poll(focusedDay).toBe("2026-08-16")
    await userEvent.keyboard("{PageDown}")
    await userEvent.keyboard("{PageDown}")
    await expect.poll(focusedDay).toBe("2026-10-16")
  })

  it("Shift+PageUp / Shift+PageDown: previous / next year", async () => {
    focusStart()
    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}")
    await expect.poll(focusedDay).toBe("2025-09-16")
    await userEvent.keyboard("{Shift>}{PageDown}{PageDown}{/Shift}")
    await expect.poll(focusedDay).toBe("2027-09-16")
  })

  it("Enter / Space: selects the focused day", async () => {
    focusStart()
    await userEvent.keyboard("{ArrowRight}")
    await userEvent.keyboard("{Enter}")
    await expect
      .poll(() =>
        document
          .querySelector('[aria-selected="true"]')
          ?.getAttribute("data-day")
      )
      .toBe("2026-09-17")

    await userEvent.keyboard("{ArrowRight}")
    await userEvent.keyboard(" ")
    await expect
      .poll(() =>
        document
          .querySelector('[aria-selected="true"]')
          ?.getAttribute("data-day")
      )
      .toBe("2026-09-18")
  })
})

/** What a class paints, read off a reference element in the current theme. */
function paint(
  className: string,
  property: "backgroundColor" | "color" | "borderTopColor"
) {
  const ref = document.createElement("span")
  ref.className = className
  document.body.append(ref)
  const value = getComputedStyle(ref)[property]
  ref.remove()
  return value
}

/** The opacity a day really shows: its own times each ancestor's, up to the calendar. */
function effectiveOpacity(element: Element) {
  const root = element.closest("[data-slot=calendar]")
  let opacity = 1
  for (let e: Element | null = element; e; e = e.parentElement) {
    opacity *= Number(getComputedStyle(e).opacity)
    if (e === root) break
  }
  return opacity
}

describe("Calendar, dark and disabled states", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it.each(["light", "dark"] as const)(
    "a hovered selected day keeps bg-primary, and a hovered range middle bg-muted, in %s",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <Calendar
          mode="range"
          defaultMonth={START}
          selected={{ from: new Date(2026, 8, 14), to: new Date(2026, 8, 18) }}
        />
      )
      const primary = paint("bg-primary", "backgroundColor")
      const onPrimary = paint("text-primary-foreground", "color")
      const muted = paint("bg-muted", "backgroundColor")
      for (const [day, background, color] of [
        ["2026-09-14", primary, onPrimary],
        ["2026-09-18", primary, onPrimary],
        ["2026-09-16", muted, paint("text-foreground", "color")],
      ] as const) {
        const button = dayButton(day)
        await userEvent.hover(button)
        try {
          expect(button.matches(":hover")).toBe(true)
          const style = getComputedStyle(button)
          expect(style.backgroundColor, `${day} background`).toBe(background)
          expect(style.color, `${day} text`).toBe(color)
        } finally {
          await userEvent.unhover(button)
        }
      }
    }
  )

  it.each(["light", "dark"] as const)(
    "a hovered selected single day keeps bg-primary in %s",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(<Example />)
      const button = dayButton("2026-09-16")
      await userEvent.hover(button)
      try {
        const style = getComputedStyle(button)
        expect(style.backgroundColor).toBe(
          paint("bg-primary", "backgroundColor")
        )
        expect(style.color).toBe(paint("text-primary-foreground", "color"))
      } finally {
        await userEvent.unhover(button)
      }
    }
  )

  it.each(["light", "dark"] as const)(
    "a disabled day is dimmed by opacity-disabled once, with or without a mode, in %s",
    (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      const disabled = new Date(2026, 8, 18)
      const reference = Number(
        getComputedStyle(
          Object.assign(
            document.body.appendChild(document.createElement("i")),
            {
              className: "opacity-disabled",
            }
          )
        ).opacity
      )
      document.body.querySelector("i")?.remove()

      const single = render(
        <Calendar mode="single" defaultMonth={START} disabled={disabled} />
      )
      expect(dayButton("2026-09-18")).toHaveProperty("disabled", true)
      expect(effectiveOpacity(dayButton("2026-09-18"))).toBeCloseTo(reference)
      single.unmount()

      render(<Calendar defaultMonth={START} disabled={disabled} />)
      const cell = document.querySelector('[data-day="2026-09-18"]')
      expect(cell).not.toBeNull()
      expect(effectiveOpacity(cell as Element)).toBeCloseTo(reference)
    }
  )

  it("captionLayout dropdown: every tab stop shows a focus indicator, light and dark", async () => {
    render(
      <Calendar mode="single" captionLayout="dropdown" defaultMonth={START} />
    )
    expect(await unmarkedTabStops()).toEqual([])
  })

  it.each(["light", "dark"] as const)(
    "captionLayout dropdown: focusing a dropdown draws border-ring and a ring on its root in %s",
    async (theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <a href="#top">before</a>
          <Calendar
            mode="single"
            captionLayout="dropdown"
            defaultMonth={START}
          />
        </>
      )
      screen.getByRole("link", { name: "before" }).focus()
      for (
        let i = 0;
        i < 4 && document.activeElement?.tagName !== "SELECT";
        i++
      )
        await userEvent.keyboard("{Tab}")
      const select = document.activeElement as HTMLElement
      expect(select.tagName).toBe("SELECT")
      const root = select.closest<HTMLElement>(".rdp-dropdown_root")
      expect(root).not.toBeNull()
      const style = getComputedStyle(root as HTMLElement)
      expect(style.borderTopColor).toBe(paint("border-ring", "borderTopColor"))
      expect(style.boxShadow).toMatch(/\b2px\b/)
    }
  )
})
