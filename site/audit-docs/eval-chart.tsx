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
  /** The run, as the axis names it: `MCP · 0.1.1`. */
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
 * The scores of every recorded run, one group of bars per run: the
 * conformance and the share of tasks that pass each stage, in percent.
 */
export function EvalChart({ data }: { data: EvalBar[] }) {
  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-96 w-full">
      <BarChart
        accessibilityLayer
        aria-label="Eval scores by recorded run, in percent"
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 8 }}
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
        <YAxis
          type="category"
          dataKey="run"
          width={120}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {SERIES.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
