import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Args, Story } from "@/site/playground/types"

type Kind = "bar" | "line" | "area"
type Indicator = "dot" | "line" | "dashed"

/** The series, in the order the `series` control adds them. */
const SERIES = [
  { key: "online", label: "Online", color: "var(--color-chart-1)" },
  { key: "retail", label: "Retail", color: "var(--color-chart-2)" },
  { key: "wholesale", label: "Wholesale", color: "var(--color-chart-3)" },
] as const

type Series = (typeof SERIES)[number]
type SeriesKey = Series["key"]
type Row = { month: string } & Record<SeriesKey, number>

const MONTH_NAMES: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
}

/** Sample revenue by channel; January to March repeat the spec's example. */
const DATA: Row[] = [
  { month: "Jan", online: 186, retail: 80, wholesale: 45 },
  { month: "Feb", online: 305, retail: 200, wholesale: 90 },
  { month: "Mar", online: 237, retail: 120, wholesale: 60 },
  { month: "Apr", online: 73, retail: 190, wholesale: 110 },
  { month: "May", online: 209, retail: 130, wholesale: 75 },
  { month: "Jun", online: 214, retail: 140, wholesale: 95 },
  { month: "Jul", online: 251, retail: 160, wholesale: 82 },
  { month: "Aug", online: 268, retail: 145, wholesale: 101 },
  { month: "Sep", online: 194, retail: 175, wholesale: 88 },
  { month: "Oct", online: 226, retail: 152, wholesale: 97 },
  { month: "Nov", online: 289, retail: 210, wholesale: 120 },
  { month: "Dec", online: 342, retail: 248, wholesale: 134 },
]

const LABEL = "Revenue by month and channel"

interface ChartArgs {
  kind: Kind
  series: number
  months: number
  indicator: Indicator
  hideLabel: boolean
  hideIndicator: boolean
  legend: boolean
  grid: boolean
}

function read(args: Args): ChartArgs {
  return {
    kind: String(args.kind) as Kind,
    series: Math.min(Math.max(Number(args.series) || 1, 1), SERIES.length),
    months: Math.min(Math.max(Number(args.months) || 3, 3), DATA.length),
    indicator: String(args.indicator) as Indicator,
    hideLabel: Boolean(args.hideLabel),
    hideIndicator: Boolean(args.hideIndicator),
    legend: Boolean(args.legend),
    grid: Boolean(args.grid),
  }
}

/** The text summary the spec asks for: each series' peak, from the data shown. */
function summary(series: readonly Series[], rows: Row[]): string {
  const peaks = series.map(({ key, label }) => {
    const top = rows.reduce((best, row) => (row[key] > best[key] ? row : best))
    return { label, month: MONTH_NAMES[top.month], value: top[key] }
  })
  const [first, ...rest] = peaks
  const head = `${first.label} revenue peaked in ${first.month} at ${first.value}`
  const tail = rest.map(
    ({ label, month, value }) =>
      `${label.toLowerCase()} in ${month} at ${value}`
  )
  return `${[head, ...tail].join(", ")}.`
}

function config(series: readonly Series[]): ChartConfig {
  return Object.fromEntries(
    series.map(({ key, label, color }) => [key, { label, color }])
  )
}

function render(args: Args) {
  const a = read(args)
  const series = SERIES.slice(0, a.series)
  const rows = DATA.slice(0, a.months)
  const shared = [
    a.grid ? <CartesianGrid key="grid" vertical={false} /> : null,
    <XAxis key="x" dataKey="month" tickLine={false} axisLine={false} />,
    <ChartTooltip
      key="tooltip"
      defaultIndex={1}
      content={
        <ChartTooltipContent
          indicator={a.indicator}
          hideLabel={a.hideLabel}
          hideIndicator={a.hideIndicator}
        />
      }
    />,
    a.legend ? (
      <ChartLegend key="legend" content={<ChartLegendContent />} />
    ) : null,
  ]
  const chart =
    a.kind === "line" ? (
      <LineChart accessibilityLayer aria-label={LABEL} data={rows}>
        {shared}
        {series.map(({ key }) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    ) : a.kind === "area" ? (
      <AreaChart accessibilityLayer aria-label={LABEL} data={rows}>
        {shared}
        {series.map(({ key }) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            fill={`var(--color-${key})`}
            fillOpacity={0.4}
            stroke={`var(--color-${key})`}
            stackId="revenue"
          />
        ))}
      </AreaChart>
    ) : (
      <BarChart accessibilityLayer aria-label={LABEL} data={rows}>
        {shared}
        {series.map(({ key }) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} />
        ))}
      </BarChart>
    )
  return (
    <div className="flex w-xl max-w-full flex-col gap-2">
      <ChartContainer config={config(series)} className="min-h-52 w-full">
        {chart}
      </ChartContainer>
      <p className="text-xs text-muted-foreground">{summary(series, rows)}</p>
    </div>
  )
}

const TAGS: Record<Kind, [string, string]> = {
  bar: ["BarChart", "Bar"],
  line: ["LineChart", "Line"],
  area: ["AreaChart", "Area"],
}

/** The column Prettier wraps at: the code panel shows formatted code. */
const COLUMNS = 80

/** Text filled to the column, the way Prettier wraps JSX text. */
function fill(indent: number, text: string): string[] {
  const pad = " ".repeat(indent)
  const lines: string[] = []
  let current = ""
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word
    if (current && pad.length + next.length > COLUMNS) {
      lines.push(pad + current)
      current = word
    } else current = next
  }
  return [...lines, pad + current]
}

/** `<Name props>` opening a block of children, at `indent`. */
function opening(indent: number, name: string, props: string[]): string[] {
  const pad = " ".repeat(indent)
  const line = `${pad}<${[name, ...props].join(" ")}>`
  if (line.length <= COLUMNS) return [line]
  return [
    `${pad}<${name}`,
    ...props.map((prop) => `${pad}  ${prop}`),
    `${pad}>`,
  ]
}

/** An element with a text child, or none, as Prettier prints it at `indent`. */
function element(
  indent: number,
  name: string,
  props: string[],
  text?: string
): string[] {
  const pad = " ".repeat(indent)
  const open = [name, ...props].join(" ")
  const line =
    text === undefined
      ? `${pad}<${open} />`
      : `${pad}<${open}>${text}</${name}>`
  // Prettier breaks an element with children and several props, even short.
  const fits = text === undefined || props.length < 2
  if (fits && line.length <= COLUMNS) return [line]
  if (text === undefined)
    return [
      `${pad}<${name}`,
      ...props.map((prop) => `${pad}  ${prop}`),
      `${pad}/>`,
    ]
  return [
    ...opening(indent, name, props),
    ...fill(indent + 2, text),
    `${pad}</${name}>`,
  ]
}

function seriesProps(kind: Kind, key: string): string[] {
  const color = `"var(--color-${key})"`
  if (kind === "line")
    return [
      `dataKey="${key}"`,
      'type="monotone"',
      `stroke=${color}`,
      "strokeWidth={2}",
      "dot={false}",
    ]
  if (kind === "area")
    return [
      `dataKey="${key}"`,
      'type="monotone"',
      `fill=${color}`,
      "fillOpacity={0.4}",
      `stroke=${color}`,
      'stackId="revenue"',
    ]
  return [`dataKey="${key}"`, `fill=${color}`]
}

/** The tooltip, its content element nested in a prop. */
function tooltip(indent: number, a: ChartArgs): string[] {
  const pad = " ".repeat(indent)
  const props = [
    a.indicator === "dot" ? "" : `indicator="${a.indicator}"`,
    a.hideLabel ? "hideLabel" : "",
    a.hideIndicator ? "hideIndicator" : "",
  ].filter(Boolean)
  const content = `content={<${["ChartTooltipContent", ...props].join(" ")} />}`
  const line = `${pad}<ChartTooltip defaultIndex={1} ${content} />`
  if (line.length <= COLUMNS) return [line]
  const inline = `${pad}  ${content}`
  return [
    `${pad}<ChartTooltip`,
    `${pad}  defaultIndex={1}`,
    ...(inline.length <= COLUMNS
      ? [inline]
      : [
          `${pad}  content={`,
          ...element(indent + 4, "ChartTooltipContent", props),
          `${pad}  }`,
        ]),
    `${pad}/>`,
  ]
}

function code(args: Args): string {
  const a = read(args)
  const series = SERIES.slice(0, a.series)
  const rows = DATA.slice(0, a.months)
  const [root, part] = TAGS[a.kind]
  const imports = [root, part, ...(a.grid ? ["CartesianGrid"] : []), "XAxis"]
  const chartImports = [
    "type ChartConfig",
    "ChartContainer",
    ...(a.legend ? ["ChartLegend", "ChartLegendContent"] : []),
    "ChartTooltip",
    "ChartTooltipContent",
  ]
  const body = [
    ...(a.grid ? ["          <CartesianGrid vertical={false} />"] : []),
    '          <XAxis dataKey="month" tickLine={false} axisLine={false} />',
    ...tooltip(10, a),
    ...(a.legend
      ? ["          <ChartLegend content={<ChartLegendContent />} />"]
      : []),
    ...series.flatMap(({ key }) => element(10, part, seriesProps(a.kind, key))),
  ]
  return `import { ${imports.sort().join(", ")} } from "recharts"

import {
${chartImports.map((name) => `  ${name},`).join("\n")}
} from "@/components/ui/chart"

const config = {
${series
  .map(
    ({ key, label, color }) =>
      `  ${key}: { label: "${label}", color: "${color}" },`
  )
  .join("\n")}
} satisfies ChartConfig

const data = [
${rows
  .map(
    (row) =>
      `  { month: "${row.month}", ${series
        .map(({ key }) => `${key}: ${row[key]}`)
        .join(", ")} },`
  )
  .join("\n")}
]

export function Example() {
  return (
    <div className="flex w-xl max-w-full flex-col gap-2">
      <ChartContainer config={config} className="min-h-52 w-full">
        <${root}
          accessibilityLayer
          aria-label="${LABEL}"
          data={data}
        >
${body.join("\n")}
        </${root}>
      </ChartContainer>
      <p className="text-xs text-muted-foreground">
${fill(8, summary(series, rows)).join("\n")}
      </p>
    </div>
  )
}
`
}

/** Chart: the chart type, its series and months, the tooltip and the legend. */
const story: Story = {
  controls: [
    {
      kind: "select",
      name: "kind",
      options: ["bar", "line", "area"],
      default: "bar",
    },
    { kind: "number", name: "series", default: 2, min: 1, max: 3 },
    { kind: "number", name: "months", default: 6, min: 3, max: 12 },
    {
      kind: "select",
      name: "indicator",
      options: ["dot", "line", "dashed"],
      default: "dot",
    },
    { kind: "boolean", name: "hideLabel", default: false },
    { kind: "boolean", name: "hideIndicator", default: false },
    { kind: "boolean", name: "legend", default: true },
    { kind: "boolean", name: "grid", default: true },
  ],
  render,
  code,
  layout: "padded",
}

export default story
