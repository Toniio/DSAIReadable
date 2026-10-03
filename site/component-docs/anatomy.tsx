"use client"

import { type ReactNode, useMemo, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import type { FrameState } from "@/site/playground/protocol"

export interface AnatomyPart {
  /** The `data-slot` value: `button`, `tabs-trigger`. */
  slot: string
  /** The role, as the spec writes it (rendered by the page). */
  role: ReactNode
}

/**
 * The spec's example with a numbered marker on each part the Anatomy table
 * names; pointing at a row outlines its part.
 */
export function Anatomy({
  name,
  slug,
  parts,
}: {
  name: string
  slug: string
  parts: AnatomyPart[]
}) {
  const theme = useSiteTheme()
  const [highlight, setHighlight] = useState(0)
  const slots = useMemo(() => parts.map((part) => part.slot), [parts])
  const state = useMemo<FrameState>(
    () => ({
      view: "anatomy",
      args: {},
      state: "rest",
      theme,
      slots,
      highlight,
    }),
    [theme, slots, highlight]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col border">
        <Canvas
          slug={slug}
          state={state}
          title={`${name} anatomy`}
          className="bg-muted"
        />
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          The spec&apos;s example; each number marks a part the table names. A
          part the example does not render has no marker.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Slot</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part, index) => (
            <TableRow
              key={part.slot}
              onMouseEnter={() => setHighlight(index + 1)}
              onMouseLeave={() => setHighlight(0)}
            >
              <TableCell className="align-top">
                <span className="flex size-5 items-center justify-center rounded-full border border-primary text-xs font-medium text-primary">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="align-top">
                <code className="bg-muted px-1 py-0.5 font-mono text-xs">
                  data-slot=&quot;{part.slot}&quot;
                </code>
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {part.role}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
