import Link from "next/link"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

export interface GraphNode {
  name: string
  href: string
}

const NODE = cn(
  "inline-flex min-h-target items-center justify-center border bg-background px-3 py-1.5 text-sm transition-colors hover:border-foreground hover:bg-muted",
  FOCUS_OUTLINE_RESET,
  FOCUS_RING
)

/**
 * The part of the trunk a node's row draws: from its middle down for the
 * first, from the top to its middle for the last, the whole row in between.
 */
function trunk(index: number, count: number): string | null {
  if (count < 2) return null
  if (index === 0) return "top-1/2 bottom-0"
  if (index === count - 1) return "top-0 bottom-1/2"
  return "inset-y-0"
}

/** One side of the graph: the components on the left or on the right. */
function Side({
  label,
  side,
  nodes,
  empty,
}: {
  label: string
  side: "start" | "end"
  nodes: GraphNode[]
  empty: string
}) {
  const start = side === "start"
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 basis-0 flex-col gap-2",
        start ? "sm:items-end" : "sm:items-start"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium tracking-wide text-muted-foreground uppercase sm:absolute sm:bottom-full sm:pb-2",
          start ? "sm:right-0 sm:pr-8" : "sm:left-0 sm:pl-8"
        )}
      >
        {label}
      </p>
      {nodes.length ? (
        <ul className="flex flex-col">
          {nodes.map((node, index) => {
            const span = trunk(index, nodes.length)
            return (
              <li
                key={node.href}
                className={cn(
                  "relative flex items-center py-1",
                  start ? "sm:pr-8" : "sm:pl-8"
                )}
              >
                {span ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute hidden border-l sm:block",
                      start ? "right-0" : "left-0",
                      span
                    )}
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1/2 hidden w-8 border-t sm:block",
                    start ? "right-0" : "left-0"
                  )}
                />
                <Link href={node.href} className={cn(NODE, "flex-1")}>
                  {node.name}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            start ? "sm:pr-8 sm:text-right" : "sm:pl-8"
          )}
        >
          {empty}
        </p>
      )}
    </div>
  )
}

/**
 * The components a component is built on, on the left, and those built on
 * it, on the right, joined to it by lines.
 */
export function DependencyGraph({
  name,
  uses,
  usedBy,
}: {
  name: string
  uses: GraphNode[]
  usedBy: GraphNode[]
}) {
  return (
    <div className="flex flex-col gap-6 border bg-background p-6 sm:flex-row sm:items-center sm:gap-0 sm:pt-14">
      <Side
        label="Built on"
        side="start"
        nodes={uses}
        empty="No other component of the design system."
      />
      <div className="flex items-center justify-center">
        <span
          aria-hidden="true"
          className={cn(
            "hidden w-8 border-t",
            uses.length ? "sm:block" : "sm:invisible sm:block"
          )}
        />
        <p className="border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold">
          {name}
        </p>
        <span
          aria-hidden="true"
          className={cn(
            "hidden w-8 border-t",
            usedBy.length ? "sm:block" : "sm:invisible sm:block"
          )}
        />
      </div>
      <Side
        label="Used by"
        side="end"
        nodes={usedBy}
        empty="No other component builds on it."
      />
    </div>
  )
}
