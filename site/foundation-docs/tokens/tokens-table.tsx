"use client"

import { useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { FilterInput } from "@/site/foundation-docs/tokens/filter-input"
import {
  Code,
  CopyCode,
  DottedName,
  Fill,
  StatusBadge,
} from "@/site/foundation-docs/tokens/token-ui"
import type {
  TokenRow,
  TokensData,
} from "@/site/foundation-docs/tokens/tokens-data"

/** How many rows a page shows, and how many more each "Show more" adds. */
const PAGE = 100

const TIERS: { value: TokenRow["tier"]; label: string }[] = [
  { value: "semantic", label: "Semantic" },
  { value: "component", label: "Component" },
  { value: "primitive", label: "Primitive" },
]

const STATUSES: TokenRow["status"][] = ["active", "reserved", "deprecated"]

function count<T>(rows: TokenRow[], pick: (row: TokenRow) => T, value: T) {
  return rows.filter((row) => pick(row) === value).length
}

function haystack(row: TokenRow): string {
  return [
    row.token,
    row.cssVar,
    row.type,
    row.light,
    row.dark,
    ...(row.classes ?? []),
    ...(row.chain ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function Value({
  row,
  value,
  surface,
}: {
  row: TokenRow
  value: string
  surface: string
}) {
  return (
    <div className="flex items-start gap-2">
      {row.type === "color" ? (
        <Fill
          value={value}
          surface={surface}
          className="size-4 shrink-0 border"
        />
      ) : null}
      <span className="min-w-0 font-mono text-xs break-words">{value}</span>
    </div>
  )
}

/**
 * Every token of the three tiers in one table, filtered on the client: the
 * rows are prepared on the server and only what the table shows travels.
 */
export function TokensTable({ data }: { data: TokensData }) {
  const [tier, setTier] = useState<string>("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE)
  /**
   * The rank of the first row the last "Show" press revealed. The button that
   * had focus unmounts with the last page, which drops focus to the top of
   * the document: focus moves to that row instead, so the reader carries on
   * where the new rows start. The row keeps its tabIndex until a filter
   * changes: taking it off the focused row would drop focus again.
   */
  const [anchor, setAnchor] = useState<number | null>(null)
  const anchorRow = useRef<HTMLTableRowElement>(null)
  const pendingFocus = useRef(false)

  useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    anchorRow.current?.focus()
  }, [anchor, limit])

  const types = [...new Set(data.rows.map((row) => row.type))].sort()
  const needle = query.trim().toLowerCase()
  const rows = data.rows.filter(
    (row) =>
      (tier === "all" || row.tier === tier) &&
      (type === "all" || row.type === type) &&
      (status === "all" || row.status === status) &&
      (needle === "" || haystack(row).includes(needle))
  )
  const visible = rows.slice(0, limit)

  /** A filter changed: start again from the first page. */
  const reset = () => {
    setLimit(PAGE)
    setAnchor(null)
  }

  const reveal = (next: number) => {
    pendingFocus.current = true
    setAnchor(visible.length)
    setLimit(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label id="tokens-tier-label">Tier</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            aria-labelledby="tokens-tier-label"
            value={tier}
            onValueChange={(next) => {
              if (!next) return
              setTier(next)
              reset()
            }}
            className="flex-wrap"
          >
            <ToggleGroupItem value="all">
              All {data.rows.length}
            </ToggleGroupItem>
            {TIERS.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value}>
                {item.label} {count(data.rows, (row) => row.tier, item.value)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tokens-type">Type</Label>
          <NativeSelect
            id="tokens-type"
            size="sm"
            className="w-full"
            value={type}
            onChange={(event) => {
              setType(event.target.value)
              reset()
            }}
          >
            <NativeSelectOption value="all">All types</NativeSelectOption>
            {types.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {value} ({count(data.rows, (row) => row.type, value)})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tokens-status">Status</Label>
          <NativeSelect
            id="tokens-status"
            size="sm"
            className="w-full"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              reset()
            }}
          >
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            {STATUSES.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {value} ({count(data.rows, (row) => row.status, value)})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <FilterInput
          id="tokens-filter"
          label="Filter tokens"
          placeholder="Name, variable, class or value"
          value={query}
          onChange={(next) => {
            setQuery(next)
            reset()
          }}
          className="md:col-span-2 xl:col-span-4"
        />
      </div>

      <p role="status" className="text-xs text-muted-foreground">
        {rows.length === data.rows.length
          ? `${rows.length} tokens`
          : `${rows.length} of ${data.rows.length} tokens match`}
        {visible.length < rows.length
          ? `, the first ${visible.length} shown.`
          : "."}
      </p>

      {/* Fixed columns: in an automatic layout, the longest status badge
          widened its column and the class names broke a letter at a time.
          A long name wraps after a hyphen. */}
      <Table className="min-w-4xl table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead className="w-56">CSS variable</TableHead>
            <TableHead className="w-48">Tailwind</TableHead>
            <TableHead className="w-32">Light</TableHead>
            <TableHead className="w-32">Dark</TableHead>
            <TableHead className="w-28">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No token matches these filters.
              </TableCell>
            </TableRow>
          ) : null}
          {visible.map((row, index) => (
            <TableRow
              key={row.token}
              ref={index === anchor ? anchorRow : undefined}
              tabIndex={index === anchor ? -1 : undefined}
              // Inset: the table's scroll box clips a ring drawn outside the
              // row, which would leave only its top and bottom edges.
              className={cn(
                FOCUS_OUTLINE_RESET,
                FOCUS_RING,
                "focus-visible:ring-inset"
              )}
            >
              <TableCell className="align-top whitespace-normal">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-mono text-xs font-medium break-words">
                    <DottedName name={row.token} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.tier} · {row.type}
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {row.tier === "primitive" ? (
                  <Code className="text-muted-foreground">{row.cssVar}</Code>
                ) : (
                  <CopyCode value={row.cssVar} wrap className="max-w-full" />
                )}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {row.classes ? (
                  <ul className="flex flex-wrap gap-x-2 gap-y-1">
                    {row.classes.map((value) => (
                      <li key={value} className="flex max-w-full min-w-0">
                        <CopyCode value={value} wrap />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <Value
                  row={row}
                  value={row.light}
                  surface={data.surfaces.light}
                />
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {row.dark !== undefined ? (
                  <Value
                    row={row}
                    value={row.dark}
                    surface={data.surfaces.dark}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Same as light
                  </span>
                )}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {row.tier === "primitive" ? (
                  <span className="flex flex-col items-start gap-1">
                    <Badge variant="secondary">private</Badge>
                    <StatusBadge status={row.status} />
                  </span>
                ) : row.status === "active" ? (
                  <span className="text-xs text-muted-foreground">active</span>
                ) : (
                  // The replacement goes under the badge, which never wraps.
                  <span className="flex flex-col items-start gap-1">
                    <StatusBadge status={row.status} />
                    {row.replacement ? (
                      <span className="text-xs text-muted-foreground">
                        Use <Code>{row.replacement}</Code>
                      </span>
                    ) : null}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {visible.length < rows.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => reveal(limit + PAGE)}
          >
            Show {Math.min(PAGE, rows.length - visible.length)} more
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => reveal(rows.length)}
          >
            Show all {rows.length}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
