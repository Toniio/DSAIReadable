"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import {
  encodeState,
  type FrameState,
  type FromFrame,
  isMessage,
  isOwnOrigin,
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

/**
 * The path of a preview: its route, and its first state in the hash. Without
 * the base path, for a next/link `href`, which adds it.
 */
export function previewPath(
  kind: PreviewKind,
  slug: string,
  state: FrameState
): string {
  return `/preview/${FOLDER[kind]}/${slug}/#${encodeState(state)}`
}

/** The address of a preview, under the base path: an iframe's `src`. */
function previewUrl(kind: PreviewKind, slug: string, state: FrameState) {
  return withBasePath(previewPath(kind, slug, state))
}

/** The site's own theme, once the browser knows it. */
export function useSiteTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  return mounted && resolvedTheme === "dark" ? "dark" : "light"
}

/**
 * The smallest a canvas is before its frame reports a height. A foundation's
 * example takes the height of its content alone: a small card leaves no empty
 * stage under it.
 */
function minHeight(kind: PreviewKind, tall: boolean): string | undefined {
  if (tall) return "min-h-96"
  return kind === "foundation" ? undefined : "min-h-48"
}

function Frame({
  kind,
  slug,
  state,
  title,
  viewport,
  tall,
}: {
  kind: PreviewKind
  slug: string
  state: FrameState
  title: string
  viewport: Viewport
  tall: boolean
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const latest = useRef(state)
  const [height, setHeight] = useState<{ height: number; viewport: Viewport }>()
  // An iframe is a tab stop. One the keyboard can reach nothing in (a static
  // example, a Skeleton) would focus its own document, which draws no
  // indicator: it leaves the tab order, and the mouse still reaches it.
  const [focusable, setFocusable] = useState(true)
  // Created after hydration (see Canvas): the first URL carries the site's
  // resolved theme, so the frame never paints light on a dark page.
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
        !isOwnOrigin(event) ||
        !isMessage<FromFrame>(event.data)
      )
        return
      if (event.data.type === "ready")
        target.postMessage(toFrame(latest.current), window.location.origin)
      else if (event.data.type === "focusable")
        setFocusable(event.data.focusable === true)
      else if (typeof event.data.height === "number")
        setHeight({ height: event.data.height, viewport })
    }
    window.addEventListener("message", listen)
    return () => window.removeEventListener("message", listen)
  }, [viewport])

  // A height reported at another width is dropped: content that fills the
  // frame (min-h-svh) would otherwise keep the taller height of a phone's
  // width once back on a desktop's. The frame reports again at the new width.
  const current = height?.viewport === viewport ? height.height : undefined

  return (
    <iframe
      ref={frame}
      name={name}
      title={title}
      src={src}
      tabIndex={focusable ? undefined : -1}
      loading="lazy"
      className={cn(
        "block border-0 bg-background",
        VIEWPORT[viewport],
        minHeight(kind, tall)
      )}
      style={current ? { height: current } : undefined}
    />
  )
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
  // The frame is created after hydration, so the page listens before the
  // frame says it is ready, and its first URL carries the site's theme.
  const mounted = useMounted()

  return (
    <div className={cn("flex justify-center overflow-hidden", className)}>
      {mounted ? (
        <Frame
          kind={kind}
          slug={slug}
          state={state}
          title={title}
          viewport={viewport}
          tall={tall}
        />
      ) : (
        <div
          className={cn(
            "bg-background",
            VIEWPORT[viewport],
            minHeight(kind, tall)
          )}
        />
      )}
    </div>
  )
}
