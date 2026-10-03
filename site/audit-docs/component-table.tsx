"use client"

import { useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
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
import type { ComponentAudit } from "@/site/audit-docs/data"
import { LINK } from "@/site/ui/link"

function TestBadge({ test }: { test: ComponentAudit["test"] }) {
  if (test === "tested") return <Badge variant="success">Tested</Badge>
  if (test === "missing") return <Badge variant="destructive">Missing</Badge>
  return <Badge variant="outline">No keys</Badge>
}

/**
 * One row per component, filtered by category and status: how complete its
 * spec is, what its keyboard tests cover, and what it declares.
 */
export function ComponentTable({
  rows,
  categories,
  sections,
}: {
  rows: ComponentAudit[]
  categories: string[]
  /** The number of canonical spec sections: 13. */
  sections: number
}) {
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const statuses = [...new Set(rows.map((row) => row.status))]
  const shown = rows.filter(
    (row) =>
      (!category || row.category === category) &&
      (!status || row.status === status)
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="audit-category">Category</Label>
          <NativeSelect
            id="audit-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <NativeSelectOption value="">All categories</NativeSelectOption>
            {categories.map((name) => (
              <NativeSelectOption key={name} value={name}>
                {name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="audit-status">Status</Label>
          <NativeSelect
            id="audit-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            {statuses.map((name) => (
              <NativeSelectOption key={name} value={name}>
                {name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <p role="status" className="pb-2 text-xs text-muted-foreground">
          {shown.length} of {rows.length} components
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Spec sections</TableHead>
            <TableHead>Keyboard rows</TableHead>
            <TableHead>Keyboard test</TableHead>
            <TableHead>Token rows</TableHead>
            <TableHead>States</TableHead>
            <TableHead>Divergences</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-6 text-center text-muted-foreground"
              >
                No component matches these filters.
              </TableCell>
            </TableRow>
          ) : null}
          {shown.map((row) => (
            <TableRow key={row.slug}>
              <TableCell>
                <Link href={`/components/${row.slug}/`} className={LINK}>
                  {row.name}
                </Link>
              </TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    row.status === "stable"
                      ? "success"
                      : row.status === "beta"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="flex flex-col gap-1">
                  <span className="font-mono tabular-nums">
                    {row.sections} / {sections}
                  </span>
                  {row.missing.length ? (
                    <span className="text-destructive">
                      Missing: {row.missing.join(", ")}
                    </span>
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.keyboard}
              </TableCell>
              <TableCell>
                <TestBadge test={row.test} />
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.tokens}
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.states}
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.divergences}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
