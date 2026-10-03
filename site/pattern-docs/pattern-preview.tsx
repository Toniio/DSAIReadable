"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowSquareOutIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Canvas, useSiteTheme, type Viewport } from "@/site/playground/canvas"
import { encodeState, type FrameState } from "@/site/playground/protocol"
import { useMounted } from "@/site/ui/use-mounted"

const VIEWPORTS: {
  value: Viewport
  label: string
  icon: typeof DesktopIcon
}[] = [
  { value: "desktop", label: "Desktop", icon: DesktopIcon },
  { value: "tablet", label: "Tablet", icon: DeviceTabletIcon },
  { value: "mobile", label: "Mobile", icon: DeviceMobileIcon },
]

function isViewport(value: string): value is Viewport {
  return VIEWPORTS.some((viewport) => viewport.value === value)
}

/**
 * The pattern's code example, live, at the width of a desktop, a tablet or a
 * phone, in the site's theme.
 */
export function PatternPreview({
  slug,
  title,
  fill = false,
}: {
  slug: string
  title: string
  /**
   * The example fills the screen (`min-h-screen`, a sidebar shell): the frame
   * is as tall as the window, instead of the height of its content.
   */
  fill?: boolean
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const theme = useSiteTheme()
  // The frame is created after hydration, so the page listens before the
  // frame says it is ready, and its first URL carries the site's theme.
  const mounted = useMounted()
  const state = useMemo<FrameState>(
    () => ({ view: "example", args: {}, state: "rest", theme }),
    [theme]
  )

  return (
    <div className="flex flex-col border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {fill
            ? "The code example below, live, as tall as your window: it fills the screen"
            : "The code example below, live"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="Preview width"
            value={viewport}
            onValueChange={(value) => {
              if (isViewport(value)) setViewport(value)
            }}
          >
            {VIEWPORTS.map(({ value, label, icon: Icon }) => (
              <ToggleGroupItem key={value} value={value} aria-label={label}>
                <Icon />
                <span className="hidden sm:inline">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/preview/patterns/${slug}/#${encodeState(state)}`}
              target="_blank"
            >
              Open alone
              <span className="sr-only">(opens in a new tab)</span>
              <ArrowSquareOutIcon />
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-muted p-4">
        {mounted ? (
          <Canvas
            kind="pattern"
            slug={slug}
            state={state}
            viewport={viewport}
            title={`${title} pattern preview`}
            tall
            className={fill ? "*:h-svh!" : undefined}
          />
        ) : (
          <div className="min-h-96 bg-background" />
        )}
      </div>
    </div>
  )
}
