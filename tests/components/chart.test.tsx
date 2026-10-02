import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { Bar, BarChart, Pie, PieChart, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { axeViolations } from "../axe"
import { unmarkedTabStops } from "../focus"

const config: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
}

const data = [
  { month: "Jan", revenue: 186 },
  { month: "Feb", revenue: 305 },
  { month: "Mar", revenue: 237 },
]

function Bars({ label, tooltip = true }: { label: string; tooltip?: boolean }) {
  return (
    <ChartContainer config={config} className="h-52 w-80">
      <BarChart accessibilityLayer aria-label={label} data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="revenue" fill="var(--color-revenue)" />
        {tooltip && <ChartTooltip content={<ChartTooltipContent />} />}
      </BarChart>
    </ChartContainer>
  )
}

function Slices() {
  return (
    <ChartContainer config={config} className="h-52 w-80">
      <PieChart accessibilityLayer aria-label="Revenue share by month">
        <Pie data={data} dataKey="revenue" nameKey="month" rootTabIndex={-1} />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

function surface(name: string) {
  return screen.getByRole("application", { name })
}

function chartOf(el: Element) {
  const chart = el.closest<HTMLElement>("[data-slot=chart]")
  if (!chart) throw new Error("not inside a chart")
  return chart
}

/** The 2px ring and the 1px solid outline that mark a focused chart. */
function ringOf(chart: HTMLElement) {
  const style = getComputedStyle(chart)
  return {
    outline: style.outlineStyle !== "none" ? style.outlineWidth : "none",
    ring: /\b2px\b/.test(style.boxShadow),
  }
}

async function tab(times = 1, shift = false) {
  for (let i = 0; i < times; i++) {
    await userEvent.keyboard(shift ? "{Shift>}{Tab}{/Shift}" : "{Tab}")
  }
  await new Promise(requestAnimationFrame)
}

function tooltipText() {
  return document.querySelector("[data-slot=chart-tooltip-content]")
    ?.textContent
}

async function focusFirstStop() {
  // A tab stop before the chart, so that Tab and Shift+Tab have somewhere to go.
  const before = screen.getByRole("button", { name: "before" })
  before.focus()
  await tab()
}

describe("Chart", () => {
  afterEach(() => document.documentElement.classList.remove("dark"))

  it("role: the chart surface is a focusable application", () => {
    render(<Bars label="Revenue by month" />)
    const svg = surface("Revenue by month")
    expect(svg.tagName.toLowerCase()).toBe("svg")
    expect(svg.getAttribute("tabindex")).toBe("0")
    expect(svg.closest("[data-slot=chart]")?.getAttribute("role")).toBeNull()
  })

  it("accessible name: aria-label on the Recharts element names the application", () => {
    render(<Bars label="Revenue by month" />)
    expect(surface("Revenue by month")).toBeTruthy()
  })

  describe.each(["light", "dark"] as const)("focus, %s", (theme) => {
    it("Tab / Shift+Tab: the chart shows its focus ring on every focus, with or without a tooltip", async () => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <button>before</button>
          <Bars label="With tooltip" />
          <button>between</button>
          <Bars label="Without tooltip" tooltip={false} />
          <button>after</button>
        </>
      )
      await focusFirstStop()
      const withTooltip = surface("With tooltip")
      expect(document.activeElement).toBe(withTooltip)
      expect(ringOf(chartOf(withTooltip))).toEqual({
        outline: "1px",
        ring: true,
      })

      // Away and back: Recharts shows its tooltip on the first focus only.
      await tab()
      expect(ringOf(chartOf(withTooltip))).toEqual({
        outline: "none",
        ring: false,
      })
      await tab(1, true)
      expect(document.activeElement).toBe(withTooltip)
      expect(ringOf(chartOf(withTooltip))).toEqual({
        outline: "1px",
        ring: true,
      })

      // A chart with no ChartTooltip changes nothing else on focus.
      const without = surface("Without tooltip")
      without.focus()
      await tab(1, true)
      await tab()
      expect(document.activeElement).toBe(without)
      expect(ringOf(chartOf(without))).toEqual({ outline: "1px", ring: true })
    })

    it("every tab stop of a chart shows its focus, a PieChart included", async () => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      render(
        <>
          <Bars label="Bars" tooltip={false} />
          <Slices />
        </>
      )
      expect(await unmarkedTabStops()).toEqual([])
    })
  })

  it("Pie: rootTabIndex={-1} leaves the chart surface as its only tab stop", async () => {
    render(
      <>
        <button>before</button>
        <Slices />
        <button>after</button>
      </>
    )
    await focusFirstStop()
    expect(document.activeElement).toBe(surface("Revenue share by month"))
    await tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "after" })
    )
  })

  it("ArrowLeft / ArrowRight: moves the tooltip and its cursor between data points", async () => {
    render(
      <>
        <button>before</button>
        <Bars label="Revenue by month" />
      </>
    )
    await focusFirstStop()
    await expect.poll(tooltipText).toContain("Jan")
    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(tooltipText).toContain("Feb")
    await userEvent.keyboard("{ArrowRight}")
    await expect.poll(tooltipText).toContain("Mar")
    await userEvent.keyboard("{ArrowLeft}")
    await expect.poll(tooltipText).toContain("Feb")
  })

  it("Enter: hides and shows the tooltip of the current data point", async () => {
    render(
      <>
        <button>before</button>
        <Bars label="Revenue by month" />
      </>
    )
    await focusFirstStop()
    await expect.poll(tooltipText).toContain("Jan")
    await userEvent.keyboard("{Enter}")
    await expect.poll(() => tooltipText() ?? "").not.toContain("Jan")
    await userEvent.keyboard("{Enter}")
    await expect.poll(tooltipText).toContain("Jan")
  })

  it("has no axe violation with a named chart", async () => {
    render(<Bars label="Revenue by month" />)
    expect(await axeViolations()).toEqual([])
  })
})
