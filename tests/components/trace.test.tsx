import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { MagnifyingGlassIcon, TerminalIcon } from "@phosphor-icons/react"

import { unmarkedTabStops } from "../focus"

function Steps() {
  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <TerminalIcon />
            </TraceIcon>
            <TraceTitle>Ran npm install</TraceTitle>
            <TraceDescription>4 s</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>added 214 packages</TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon>
          <MagnifyingGlassIcon />
        </TraceIcon>
        <TraceTitle>Searching the docs</TraceTitle>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceTitle>Failed to run npm test</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Expected 3 items</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

/** A line wrapped in a link, then a step whose line is in its trigger. */
function Linked() {
  return (
    <Trace>
      <a href="#docs">
        <TraceLine>
          <TraceTitle>Read the cache docs</TraceTitle>
        </TraceLine>
      </a>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Ran npm install</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>added 214 packages</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

describe("Trace", () => {
  it("role: a div and spans with no role, and a trigger that is a button with aria-expanded and aria-controls", async () => {
    render(<Steps />)
    const trace = document.querySelector<HTMLElement>('[data-slot="trace"]')!
    expect(trace.tagName).toBe("DIV")
    expect(trace.getAttribute("role")).toBeNull()
    const line = screen.getByText("Searching the docs").parentElement!
    expect(line.dataset.slot).toBe("trace-line")
    expect(line.tagName).toBe("SPAN")
    expect(line.getAttribute("role")).toBeNull()
    expect(line.dataset.status).toBe("running")

    const trigger = screen.getByRole("button", { name: /Ran npm install/ })
    expect(trigger.dataset.slot).toBe("trace-collapsible-trigger")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("added 214 packages")).toBeNull()

    await userEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    const controlled = trigger.getAttribute("aria-controls")
    expect(controlled).toBeTruthy()
    expect(
      screen.getByText("added 214 packages").closest(`[id="${controlled}"]`)
    ).not.toBeNull()
  })

  it("accessible name: the trigger is named by its title, then its description; the icons are hidden", () => {
    render(<Steps />)
    expect(
      screen.getByRole("button", { name: "Ran npm install 4 s" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Failed to run npm test" })
    ).toBeTruthy()
    for (const icon of document.querySelectorAll('[data-slot="trace-icon"]'))
      expect(icon.getAttribute("aria-hidden")).toBe("true")
  })

  it("Tab: moves to the trigger of each step with details; a line alone is skipped", async () => {
    render(<Steps />)
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Ran npm install 4 s" })
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Failed to run npm test" })
    )
  })

  it("Enter / Space: opens or closes the details of a step", async () => {
    render(<Steps />)
    const trigger = screen.getByRole("button", { name: "Ran npm install 4 s" })
    trigger.focus()

    await userEvent.keyboard("{Enter}")
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("added 214 packages")).toBeTruthy()

    await userEvent.keyboard(" ")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("added 214 packages")).toBeNull()
  })

  it("a trigger, and a link that wraps a line in Trace, show a focus indicator on a card, in the four themes", async () => {
    // On a card the ring-ring/50 halo alone measures 2.98:1 in light: the
    // solid outline-ring is what reaches 3:1.
    render(
      <div className="bg-card">
        <Linked />
      </div>
    )
    expect(await unmarkedTabStops()).toEqual([])
  })

  it("a trigger, and a link that wraps a line in Trace, draw a solid outline-ring while focused, light and dark", async () => {
    render(<Linked />)
    const stops = [
      screen.getByRole("link", { name: "Read the cache docs" }),
      screen.getByRole("button", { name: "Ran npm install" }),
    ]
    const root = document.documentElement
    const anchor = document.createElement("span")
    anchor.tabIndex = -1
    document.body.prepend(anchor)
    try {
      for (const theme of ["light", "dark"] as const) {
        root.classList.toggle("dark", theme === "dark")
        anchor.focus()
        for (const stop of stops) {
          await userEvent.tab()
          expect(document.activeElement).toBe(stop)
          const style = getComputedStyle(stop)
          expect(style.outlineStyle, `${theme} ${stop.tagName}`).toBe("solid")
          expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0)
        }
      }
    } finally {
      root.classList.remove("dark")
      anchor.remove()
    }
  })

  it("a step's status is drawn: error in the destructive color, running with a shimmer, pending with no style of its own", () => {
    render(
      <Trace>
        <TraceLine status="error">
          <TraceTitle>Failed to run npm test</TraceTitle>
        </TraceLine>
        <TraceLine status="running">
          <TraceTitle>Running npm test</TraceTitle>
        </TraceLine>
        <TraceLine status="pending">
          <TraceTitle>Run npm test</TraceTitle>
        </TraceLine>
        <TraceLine>
          <TraceTitle>Ran npm test</TraceTitle>
        </TraceLine>
      </Trace>
    )
    const line = (title: string) => screen.getByText(title).parentElement!
    const done = getComputedStyle(line("Ran npm test"))
    const pending = getComputedStyle(line("Run npm test"))
    expect(getComputedStyle(line("Failed to run npm test")).color).not.toBe(
      done.color
    )
    expect(
      getComputedStyle(screen.getByText("Running npm test")).backgroundImage
    ).toContain("linear-gradient")
    expect(pending.color).toBe(done.color)
    expect(pending.opacity).toBe("1")
  })
})
