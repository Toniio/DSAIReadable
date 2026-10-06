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

/** One version, both conditions: a value of one figure each. */
export interface VersionBar {
  version: string
  none: number | null
  mcp: number | null
  /** The values are estimated, not recorded. */
  estimated?: boolean
}

const CONFIG = {
  none: { label: "No context", color: "var(--color-chart-2)" },
  mcp: { label: "MCP", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const SERIES = Object.keys(CONFIG) as (keyof typeof CONFIG)[]

/** How an axis tick reads the figure. */
const TICKS = {
  percent: (value: number) => `${value}%`,
  tokens: (value: number) => (value ? `${Math.round(value / 1000)}k` : "0"),
  usd: (value: number) => `$${value.toFixed(2)}`,
}

/**
 * Round ticks from 0 past the largest value, five steps or fewer: 1, 2, 3 or
 * 5 times a power of ten apart, so `$0.05` and `30k` label them whole.
 */
function ticks(data: VersionBar[], unit: keyof typeof TICKS): number[] {
  if (unit === "percent") return [0, 25, 50, 75, 100]
  const max = Math.max(
    ...data.flatMap((bar) => [bar.none ?? 0, bar.mcp ?? 0]),
    Number.MIN_VALUE
  )
  const power = 10 ** Math.floor(Math.log10(max / 5))
  const step =
    [1, 2, 3, 5]
      .map((factor) => factor * power)
      .find((candidate) => max / candidate <= 5) ?? 10 * power
  const count = Math.ceil(max / step)
  // Rounded to the step's precision: 3 × 0.05 is 0.15000000000000002.
  return Array.from(
    { length: count + 1 },
    (_, index) => Math.round(index * step * 1e6) / 1e6
  )
}

/**
 * One figure version by version, a bar per condition. The table under the
 * charts gives every value; the tooltip names a version whose values are
 * estimated.
 */
export function VersionChart({
  data,
  unit,
  label,
}: {
  data: VersionBar[]
  unit: keyof typeof TICKS
  /** The chart's accessible name. */
  label: string
}) {
  const scale = ticks(data, unit)
  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-64 w-full">
      <BarChart accessibilityLayer aria-label={label} data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="version"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          width="auto"
          domain={[0, scale.at(-1) ?? 0]}
          ticks={scale}
          tickFormatter={TICKS[unit]}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(version, payload) =>
                payload[0]?.payload?.estimated
                  ? `${version}, estimated`
                  : version
              }
            />
          }
        />
        {/* In the order of the bars: Recharts sorts the legend by label. */}
        <ChartLegend
          itemSorter={(item) =>
            SERIES.indexOf(item.dataKey as keyof typeof CONFIG)
          }
          content={<ChartLegendContent className="flex-wrap" />}
        />
        {SERIES.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
