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
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import { useStoryControls } from "@/site/playground/playground"
import type { FrameState } from "@/site/playground/protocol"

export interface AnatomyPart {
  /**
   * The `data-slot` value: `button`, `tabs-trigger`. Absent when the spec
   * names the part another way ("toggle button", "(no data-slot)").
   */
  slot?: string
  /** The Slot cell, as the spec writes it (rendered by the page). */
  label: ReactNode
  /** The role, as the spec writes it (rendered by the page). */
  role: ReactNode
}

/** The number of a part, drawn as its marker on the canvas is. */
function PartNumber({ number, on }: { number: number; on: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded-full border border-primary text-xs font-medium text-primary",
        on && "bg-primary text-primary-foreground"
      )}
    >
      {number}
    </span>
  )
}

/**
 * The spec's example with a numbered marker on each part the Anatomy table
 * names. Pointing at a row outlines its part; the number of a part with a
 * slot is a toggle that keeps the outline, for the keyboard and for touch.
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
  // An overlay drawn open needs the tall stage its playground has.
  const { tall } = useStoryControls(name, slug, [])
  const [pinned, setPinned] = useState(0)
  const [hovered, setHovered] = useState(0)
  const highlight = hovered || pinned
  // A part with no slot keeps its place in the numbering: an empty slot
  // matches no element, so it gets no marker.
  const slots = useMemo(() => parts.map((part) => part.slot ?? ""), [parts])
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
          tall={tall}
          className="bg-muted"
        />
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          The spec&apos;s example, or an overlay drawn open; each number marks a
          part the table names. A part with no data-slot, or one the drawing
          does not render, has no marker.
        </p>
      </div>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part, index) => {
              const number = index + 1
              return (
                <TableRow
                  key={index}
                  onMouseEnter={() => setHovered(part.slot ? number : 0)}
                  onMouseLeave={() => setHovered(0)}
                >
                  <TableCell className="align-top">
                    {part.slot ? (
                      <Toggle
                        size="sm"
                        aria-label={`Outline part ${number} on the preview`}
                        pressed={pinned === number}
                        onPressedChange={(on) => setPinned(on ? number : 0)}
                      >
                        <PartNumber number={number} on={highlight === number} />
                      </Toggle>
                    ) : (
                      <span className="flex h-7 items-center px-2.5">
                        <PartNumber number={number} on={false} />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {part.slot ? (
                      <code className="bg-muted px-1 py-0.5 font-mono text-xs">
                        data-slot=&quot;{part.slot}&quot;
                      </code>
                    ) : (
                      <span className="text-xs">{part.label}</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
                    {part.role}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
