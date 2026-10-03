"use client"

import { useMemo } from "react"

import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import type { FrameState } from "@/site/playground/protocol"

/**
 * A complete module of a foundation spec, rendered live in its own preview
 * document: a heading it renders stays out of the page's outline, and its
 * theme follows the site's.
 */
export function FoundationExample({
  exampleKey,
  title,
}: {
  /** `<file>-<rank>`: `radius-1`. */
  exampleKey: string
  /** The iframe's accessible name. */
  title: string
}) {
  const theme = useSiteTheme()
  const state = useMemo<FrameState>(
    () => ({ view: "example", args: {}, state: "rest", theme }),
    [theme]
  )
  return (
    <Canvas
      kind="foundation"
      slug={exampleKey}
      state={state}
      title={title}
      className="bg-background"
    />
  )
}
