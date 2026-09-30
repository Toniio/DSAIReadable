import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { Calendar } from "@/components/ui/calendar"

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
