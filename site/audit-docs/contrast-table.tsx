"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  ContrastGroup,
  ContrastRow,
  Measure,
} from "@/site/audit-docs/contrast"

const GROUPS: { id: ContrastGroup; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "text", label: "Text" },
  { id: "filled", label: "Filled" },
  { id: "tint", label: "Tints" },
  { id: "info", label: "Information" },
]

type Filter = ContrastGroup | "all"

/**
 * The pair as painted in one mode: its background, and its foreground as
 * text (a text pair) or as a block (a focus indicator, a border).
 */
function Swatch({ measure, text }: { measure: Measure; text: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center border text-xs font-semibold"
      style={{ backgroundColor: measure.bg, color: measure.fg }}
    >
      {text ? (
        "Aa"
      ) : (
        <span className="size-3" style={{ backgroundColor: measure.fg }} />
      )}
    </span>
  )
}

function Ratio({
  measure,
  mode,
  text,
}: {
  measure?: Measure
  mode: string
  text: boolean
}) {
  if (!measure)
    return (
      <span className="text-muted-foreground">
        —<span className="sr-only">Not measured in {mode}</span>
      </span>
    )
  return (
    <span className="flex items-center gap-2">
      <Swatch measure={measure} text={text} />
      <span className="font-mono tabular-nums">{measure.ratio.toFixed(2)}</span>
    </span>
  )
}

function Result({ row }: { row: ContrastRow }) {
  if (row.informative) return <Badge variant="secondary">Info</Badge>
  const pass = [row.light, row.dark].every((entry) => !entry || entry.pass)
  return pass ? (
    <Badge variant="success">Pass</Badge>
  ) : (
    <Badge variant="destructive">Fail</Badge>
  )
}

/**
 * Every pair the contrast lint measures, filtered by kind: the ratio in
 * light and in dark next to a swatch of the colors as painted, the threshold
 * and the result.
 */
export function ContrastTable({ rows }: { rows: ContrastRow[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const shown =
    filter === "all" ? rows : rows.filter((row) => row.group === filter)

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as Filter)
        }}
        aria-label="Show the pairs of one kind"
        className="flex-wrap"
      >
        <ToggleGroupItem value="all">
          All <span className="text-muted-foreground">{rows.length}</span>
        </ToggleGroupItem>
        {GROUPS.map((group) => (
          <ToggleGroupItem key={group.id} value={group.id}>
            {group.label}{" "}
            <span className="text-muted-foreground">
              {rows.filter((row) => row.group === group.id).length}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Light</TableHead>
            <TableHead>Dark</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="min-w-64 whitespace-normal">
                <span className="flex flex-col gap-1">
                  <span className="text-sm">{row.label}</span>
                  <span className="font-mono text-xs break-words text-muted-foreground">
                    {row.fg} on {row.bg}
                    {row.tint ? ` under a tint of ${row.tint}` : ""}
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <Ratio
                  measure={row.light}
                  mode="light"
                  text={row.threshold === 4.5}
                />
              </TableCell>
              <TableCell>
                <Ratio
                  measure={row.dark}
                  mode="dark"
                  text={row.threshold === 4.5}
                />
              </TableCell>
              <TableCell className="font-mono">{row.threshold}:1</TableCell>
              <TableCell>
                <Result row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
