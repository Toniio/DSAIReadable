"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import type { FrameState } from "@/site/playground/protocol"
import { useSiteBrand } from "@/site/ui/use-site-brand"

/**
 * A complete module of a foundation spec, rendered live in its own preview
 * document: a heading it renders stays out of the page's outline, and its
 * theme follows the site's.
 */
export function FoundationExample({
  exampleKey,
  title,
  className,
}: {
  /** `<file>-<rank>`: `radius-1`. */
  exampleKey: string
  /** The iframe's accessible name. */
  title: string
  /** Classes for the canvas: the corners it shares with a framing panel. */
  className?: string
}) {
  const theme = useSiteTheme()
  const brand = useSiteBrand()
  const state = useMemo<FrameState>(
    () => ({ view: "example", args: {}, state: "rest", theme, brand }),
    [theme, brand]
  )
  return (
    <Canvas
      kind="foundation"
      slug={exampleKey}
      state={state}
      title={title}
      className={cn("bg-background", className)}
    />
  )
}
