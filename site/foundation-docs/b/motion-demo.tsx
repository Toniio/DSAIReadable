"use client"

import { useState, type CSSProperties } from "react"
import { ArrowCounterClockwiseIcon, PlayIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MotionRow {
  token: string
  /** The token's resolved value: a duration, or an easing curve. */
  value: string
  /** The class that reads it, when one does. */
  className?: string
  status: "active" | "reserved" | "deprecated"
  /** The CSS variables the move runs on. */
  duration: string
  easing: string
}

/**
 * A square that crosses its track when Play is pressed, timed by the
 * row's tokens. It moves with the tw-animate-css entrance, whose movement the
 * base styles drop when the reader asks for less motion: only then does it
 * fade, so that with motion the square stays opaque and the curve shows.
 * The chart color keeps 3:1 on the track in both modes.
 */
export function MotionDemo({
  rows,
  label,
}: {
  rows: MotionRow[]
  /** What the button plays: "the durations". */
  label: string
}) {
  const [run, setRun] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRun((count) => count + 1)}
          aria-label={`${run ? "Replay" : "Play"} ${label}`}
        >
          {run ? <ArrowCounterClockwiseIcon /> : <PlayIcon />}
          {run ? "Replay" : "Play"}
        </Button>
      </div>
      <ul className="flex flex-col border-t">
        {rows.map((row) => (
          <li
            key={row.token}
            className="grid gap-2 border-b py-3 md:grid-cols-12 md:items-center md:gap-4"
          >
            <div className="flex flex-col gap-1 md:col-span-5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {row.token}
                </span>
                {row.status === "active" ? null : (
                  <Badge variant="warning">{row.status}</Badge>
                )}
              </span>
              <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                {row.className ? (
                  <code className="bg-muted px-1 py-0.5 text-foreground">
                    {row.className}
                  </code>
                ) : null}
                {row.value}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="overflow-hidden border bg-muted py-1 pl-6 md:col-span-7"
            >
              <div
                key={run}
                className={cn(
                  "flex w-full justify-end",
                  run
                    ? "animate-in slide-in-from-left-full motion-reduce:fade-in"
                    : "-translate-x-full"
                )}
                style={
                  {
                    "--tw-duration": `var(${row.duration})`,
                    "--tw-ease": `var(${row.easing})`,
                  } as CSSProperties
                }
              >
                <div className="size-6 bg-chart-1" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
