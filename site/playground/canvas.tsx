"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import {
  encodeState,
  type FrameState,
  type FromFrame,
  isMessage,
  type PreviewKind,
  toFrame,
  withBasePath,
} from "@/site/playground/protocol"
import { useMounted } from "@/site/ui/use-mounted"

export type Viewport = "desktop" | "tablet" | "mobile"

const VIEWPORT: Record<Viewport, string> = {
  desktop: "w-full",
  tablet: "w-3xl max-w-full",
  mobile: "w-sm max-w-full",
}

const FOLDER: Record<PreviewKind, string> = {
  component: "components",
  pattern: "patterns",
  foundation: "foundations",
}

/** The address of a preview: its route, and its first state in the hash. */
export function previewUrl(
  kind: PreviewKind,
  slug: string,
  state: FrameState
): string {
  return withBasePath(`/preview/${FOLDER[kind]}/${slug}/#${encodeState(state)}`)
}

/** The site's own theme, once the browser knows it. */
export function useSiteTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  return mounted && resolvedTheme === "dark" ? "dark" : "light"
}

/**
 * A preview iframe that follows a state: the first one is in its URL, every
 * change after is posted to it. The frame reports its height, and the canvas
 * takes it.
 */
export function Canvas({
  kind = "component",
  slug,
  state,
  title,
  viewport = "desktop",
  tall = false,
  className,
}: {
  kind?: PreviewKind
  slug: string
  state: FrameState
  /** The iframe's accessible name: "Button preview". */
  title: string
  viewport?: Viewport
  /** A stage for what covers the page: an overlay, a sidebar, a full screen. */
  tall?: boolean
  className?: string
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const latest = useRef(state)
  const [height, setHeight] = useState<number>()
  const [src] = useState(() => previewUrl(kind, slug, state))
  // The frame keeps its theme under this name, apart from the other frames.
  const name = useId()

  // Every state goes to the frame. One sent before the frame listens is lost:
  // the frame then says "ready" again, and gets the latest.
  useEffect(() => {
    latest.current = state
    frame.current?.contentWindow?.postMessage(
      toFrame(state),
      window.location.origin
    )
  }, [state])

  useEffect(() => {
    const listen = (event: MessageEvent) => {
      const target = frame.current?.contentWindow
      if (
        !target ||
        event.source !== target ||
        !isMessage<FromFrame>(event.data)
      )
        return
      if (event.data.type === "ready")
        target.postMessage(toFrame(latest.current), window.location.origin)
      else setHeight(event.data.height)
    }
    window.addEventListener("message", listen)
    return () => window.removeEventListener("message", listen)
  }, [])

  return (
    <div className={cn("flex justify-center overflow-hidden", className)}>
      <iframe
        ref={frame}
        name={name}
        title={title}
        src={src}
        loading="lazy"
        className={cn(
          "block border-0 bg-background",
          VIEWPORT[viewport],
          tall ? "min-h-96" : "min-h-48"
        )}
        style={height ? { height } : undefined}
      />
    </div>
  )
}
