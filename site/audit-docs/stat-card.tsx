import type { ReactNode } from "react"
import Link from "next/link"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

/** One figure of the summary, a link to the section that details it. */
export function StatCard({
  href,
  label,
  value,
  children,
}: {
  href: string
  label: string
  value: string
  /** What the figure is made of: the split, the date, the run. */
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-full flex-col gap-1 border border-transparent bg-background p-4 transition-colors hover:bg-muted focus-visible:z-dropdown",
        FOCUS_OUTLINE_RESET,
        FOCUS_RING
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading text-3xl font-semibold tabular-nums">
        {value}
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">
        {children}
      </span>
    </Link>
  )
}
