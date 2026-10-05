"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface EvalBar {
  /** The measurement, as the axis names it: `MCP · 0.1.1`, `MCP · 0.2.0 · 3 passes`. */
  run: string
  conformance: number
  stageA: number
  /** Null when stage B did not run. */
  stageB: number | null
}

const CONFIG = {
  conformance: { label: "Conformance (%)", color: "var(--color-chart-1)" },
  stageA: { label: "Stage A pass (%)", color: "var(--color-chart-2)" },
  stageB: { label: "Stage B pass (%)", color: "var(--color-chart-3)" },
} satisfies ChartConfig

const SERIES = Object.keys(CONFIG) as (keyof typeof CONFIG)[]

/**
 * The scores of every recorded measurement, one group of bars each: the
 * conformance and the share of tasks that pass each stage, in percent, the
 * mean of its passes when it has several.
 */
export function EvalChart({ data }: { data: EvalBar[] }) {
  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-96 w-full">
      <BarChart
        accessibilityLayer
        aria-label="Eval scores by recorded run, in percent"
        data={data}
        layout="vertical"
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(value: number) => `${value}%`}
          tickLine={false}
          axisLine={false}
        />
        {/* Sized to its longest label: a fixed width in pixels would wrap
            `MCP + skills · 0.1.1` mid-name at one font size and waste room at
            another. */}
        <YAxis
          type="category"
          dataKey="run"
          width="auto"
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* Wraps whole entries on a phone: without it each label breaks
            inside itself, `Conformance` over `(%)`. */}
        <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
        {SERIES.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
