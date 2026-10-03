"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import type { FrameState } from "@/site/playground/protocol"
import { useMounted } from "@/site/ui/use-mounted"

/**
 * A pattern's example drawn at two thirds of its size, cropped to the top: a
 * picture of the pattern, not a control. It is inert, so neither the keyboard
 * nor a screen reader enters it; the card's link names it.
 */
export function PatternThumbnail({
  slug,
  title,
  fill = false,
}: {
  slug: string
  title: string
  /** The example fills the screen: its frame takes the crop's height, not the content's. */
  fill?: boolean
}) {
  const theme = useSiteTheme()
  // The frame is created after hydration, so the page listens before the
  // frame says it is ready, and its first URL carries the site's theme.
  const mounted = useMounted()
  const state = useMemo<FrameState>(
    () => ({ view: "example", args: {}, state: "rest", theme }),
    [theme]
  )

  return (
    <div
      inert
      aria-hidden="true"
      className="pointer-events-none relative h-48 overflow-hidden border-b bg-background"
    >
      {mounted ? (
        <Canvas
          kind="pattern"
          slug={slug}
          state={state}
          title={`${title} pattern thumbnail`}
          className={cn("w-3/2 origin-top-left scale-66", fill && "*:h-72!")}
        />
      ) : null}
    </div>
  )
}
