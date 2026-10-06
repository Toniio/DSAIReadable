import type { ReactNode } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { percent } from "@/site/audit-docs/data"
import {
  type cheapestRescue,
  type Condition,
  conformantShare,
  latest,
  type Measurement,
  type nextLever,
  returns,
} from "@/site/mcp-skills-docs/optimization-data"
import {
  type VersionBar,
  VersionChart,
} from "@/site/mcp-skills-docs/version-chart"

const CONDITION: Record<Condition, string> = { none: "No context", mcp: "MCP" }

const number = (value: number) => Math.round(value).toLocaleString("en-US")

/** Dollars; `≈` marks a value estimated from the tokens. */
const usd = (value: number, estimated: boolean, digits = 3) =>
  `${estimated ? "≈" : ""}$${value.toFixed(digits)}`

/** `−16%`, `+26%`, `±0%`: the change from one value to another. */
function change(from: number, to: number): string {
  const delta = Math.round((to / from - 1) * 100)
  return `${delta < 0 ? "−" : delta > 0 ? "+" : "±"}${Math.abs(delta)}%`
}

/** `17.9`: the gap between two shares, in percentage points. */
const points = (gap: number) => Math.round(gap * 1000) / 10

interface Figure {
  label: string
  value: string
  detail: ReactNode
}

/** Figures in a joined grid: what each is, its value, what it is made of. */
function Figures({
  figures,
  className,
}: {
  figures: Figure[]
  /** The grid's columns. */
  className: string
}) {
  return (
    <dl className={cn("grid gap-px border bg-border", className)}>
      {figures.map((figure) => (
        <div
          key={figure.label}
          className="flex min-w-0 flex-col gap-1 bg-background p-4"
        >
          <dt className="text-xs text-muted-foreground">{figure.label}</dt>
          <dd className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
            {figure.value}
          </dd>
          <dd className="text-xs leading-relaxed break-words text-muted-foreground">
            {figure.detail}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** A value with a muted line under it: a count, a change. */
function Value({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-mono tabular-nums">{children}</span>
      {note ? <span className="text-muted-foreground">{note}</span> : null}
    </span>
  )
}

// ── The header ─────────────────────────────────────────────────────────────

/** The latest version, with and without the server. */
export function Headline() {
  const { none, mcp } = latest()
  const at = `at ${mcp.version}`
  const figures: Figure[] = [
    {
      label: "Conformance with the server",
      value: percent(mcp.conformance),
      detail: `${percent(none.conformance)} with no context, ${at}`,
    },
    {
      label: "Median input tokens per screen",
      value: number(mcp.medianInputTokens),
      detail: `${number(none.medianInputTokens)} with no context`,
    },
    {
      label: "Cost per screen",
      value:
        mcp.costPerScreen === null
          ? "—"
          : usd(mcp.costPerScreen, mcp.estimated),
      detail:
        none.costPerScreen === null
          ? "Not recorded with no context"
          : `${usd(none.costPerScreen, none.estimated)} with no context`,
    },
  ]
  return <Figures figures={figures} className="sm:grid-cols-3" />
}

// ── No context against the server ──────────────────────────────────────────

/** A figure of every version, a bar per condition, for one chart. */
function bars(
  rows: Measurement[],
  pick: (row: Measurement) => number | null
): VersionBar[] {
  const versions = [...new Set(rows.map((row) => row.version))]
  return versions.flatMap((version) => {
    const at = (condition: Condition) => {
      const row = rows.find(
        (entry) => entry.version === version && entry.condition === condition
      )
      return row ? pick(row) : null
    }
    const [none, mcp] = [at("none"), at("mcp")]
    if (none === null && mcp === null) return []
    return [
      {
        version,
        none,
        mcp,
        estimated: rows.some((row) => row.version === version && row.estimated),
      },
    ]
  })
}

/** Conformance, input tokens and cost per screen, version by version, then every value. */
export function Versions({ rows }: { rows: Measurement[] }) {
  const charts = [
    {
      title: "Conformance",
      unit: "percent" as const,
      data: bars(rows, (row) => Math.round(row.conformance * 1000) / 10).map(
        (bar) => ({ ...bar, estimated: false })
      ),
    },
    {
      title: "Median input tokens per screen",
      unit: "tokens" as const,
      data: bars(rows, (row) => Math.round(row.medianInputTokens)).map(
        (bar) => ({ ...bar, estimated: false })
      ),
    },
    {
      title: "Cost per screen, in dollars",
      unit: "usd" as const,
      data: bars(rows, (row) =>
        row.costPerScreen === null
          ? null
          : Math.round(row.costPerScreen * 1000) / 1000
      ),
    },
  ]
  /** The same condition at the version before. */
  const previous = (row: Measurement) => {
    const same = rows.filter((entry) => entry.condition === row.condition)
    return same[same.indexOf(row) - 1]
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid gap-px border bg-border lg:grid-cols-3">
        {charts.map((chart) => (
          <figure
            key={chart.title}
            className="flex min-w-0 flex-col gap-2 bg-background p-4"
          >
            <figcaption className="text-sm font-medium">
              {chart.title}
            </figcaption>
            <VersionChart
              data={chart.data}
              unit={chart.unit}
              label={`${chart.title} by version, with no context and with the MCP server`}
            />
          </figure>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Conformance</TableHead>
            <TableHead>Fully conformant screens</TableHead>
            <TableHead>Median input tokens</TableHead>
            <TableHead>Cost per screen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const before = previous(row)
            const since = (from: number | null | undefined, to: number) =>
              before && from
                ? `${change(from, to)} from ${before.version}`
                : null
            return (
              <TableRow key={`${row.version}:${row.condition}`}>
                <TableCell className="whitespace-normal">
                  <Value note={row.passes > 1 ? `${row.passes} passes` : null}>
                    {row.version}
                  </Value>
                </TableCell>
                <TableCell>{CONDITION[row.condition]}</TableCell>
                <TableCell>
                  <Value>{percent(row.conformance)}</Value>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Value note={`${row.fullyConformant} of ${row.screens}`}>
                    {percent(conformantShare(row))}
                  </Value>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Value
                    note={since(
                      before?.medianInputTokens,
                      row.medianInputTokens
                    )}
                  >
                    {number(row.medianInputTokens)}
                  </Value>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {row.costPerScreen === null ? (
                    <Value>—</Value>
                  ) : (
                    <Value
                      note={since(before?.costPerScreen, row.costPerScreen)}
                    >
                      {usd(row.costPerScreen, row.estimated)}
                    </Value>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// ── What the tokens buy ────────────────────────────────────────────────────

/** The extra cost per screen, what it buys, and a run in each condition. */
export function Returns() {
  const gain = returns()
  const { none, mcp } = latest()
  if (!gain)
    return (
      <p className="text-sm text-muted-foreground">
        No cost is recorded at the latest version.
      </p>
    )
  return (
    <Figures
      className="grid-cols-2 lg:grid-cols-4"
      figures={[
        {
          label: "Extra cost per screen",
          value: usd(gain.extraCost, gain.estimated),
          detail: `With the server, at ${gain.version}`,
        },
        {
          label: "Points of fully conformant screens",
          value: `+${points(gain.gained)}`,
          detail: `${percent(conformantShare(mcp))} with the server, ${percent(conformantShare(none))} with no context`,
        },
        {
          label: `${gain.tasks} screens with the server`,
          value: usd(gain.run.mcp, gain.estimated, 2),
          detail: `${gain.tasks} default tasks, built once`,
        },
        {
          label: `${gain.tasks} screens with no context`,
          value: usd(gain.run.none, gain.estimated, 2),
          detail: "The same tasks",
        },
      ]}
    />
  )
}

/** One fact of the rescue, in a joined grid. */
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-background p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

/** The task the server rescues for the least, and its request. */
export function Rescue({
  data,
}: {
  data: NonNullable<ReturnType<typeof cheapestRescue>>
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-sm leading-relaxed">
        At {data.version},{" "}
        {data.rescued === 1
          ? "one task qualifies:"
          : `${data.rescued} tasks qualify; the cheapest:`}
      </p>
      <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-4">
        <Fact term="Task">
          <code className="font-mono">{data.task}</code>
        </Fact>
        <Fact term="No context">
          0 of {data.noneRuns} {data.noneRuns === 1 ? "pass" : "passes"}
        </Fact>
        <Fact term="MCP">
          {data.passes} of {data.passes} {data.passes === 1 ? "pass" : "passes"}
        </Fact>
        <Fact term="Median cost per screen, MCP">
          {usd(data.medianCost, data.estimated, 2)}
        </Fact>
      </dl>
      <blockquote className="border-l border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
        {data.prompt}
      </blockquote>
    </div>
  )
}

// ── What's next ────────────────────────────────────────────────────────────

/** The largest answer agents read, and the median against the budget. */
export function Next({
  data,
}: {
  data: NonNullable<ReturnType<typeof nextLever>>
}) {
  const figures: Figure[] = [
    {
      label: "Share of the characters agents read",
      value: percent(data.share),
      detail: (
        <>
          <code className="font-mono">{data.tool}</code>
          {data.format ? `, ${data.format}` : ""}
        </>
      ),
    },
    {
      label: "Sessions that ask for it",
      value: `${data.sessions} of ${data.screens}`,
      detail: "Once or more while building the screen",
    },
  ]
  if (data.budget !== null)
    figures.push({
      label: "Median input tokens per screen",
      value: number(data.median),
      detail:
        data.median > data.budget
          ? `${change(data.budget, data.median).slice(1)} over the budget of ${number(data.budget)}`
          : `Within the budget of ${number(data.budget)}`,
    })
  return <Figures figures={figures} className="grid-cols-1 sm:grid-cols-3" />
}
