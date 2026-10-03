"use client"

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { useTheme } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import * as examples from "@/site/generated/examples"
import { AUTO, autoComponent } from "@/site/playground/auto"
import {
  decodeState,
  type FrameState,
  fromFrame,
  isMessage,
  type ToFrame,
} from "@/site/playground/protocol"
import { SCENARIOS } from "@/site/playground/scenarios"
import type { Args, Story, StoryLayout } from "@/site/playground/types"
import { useModule } from "@/site/playground/use-module"
import { useMounted } from "@/site/ui/use-mounted"

const LAYOUT: Record<StoryLayout, string> = {
  centered: "flex min-h-48 items-center justify-center p-8",
  padded: "p-6",
  fullscreen: "min-h-svh",
}

/** The story of a component: the generic one, or its hand-written scenario. */
function useStory(name: string): Story | undefined {
  const auto = AUTO[name]
  const loaded = useModule(auto?.load)
  const scenario = useModule(auto ? undefined : SCENARIOS[name])
  if (auto) {
    if (!loaded) return undefined
    const Component = autoComponent(loaded, auto)
    return {
      controls: [],
      render: ({ children, ...props }: Args) => (
        <Component {...auto.fixed} {...props}>
          {auto.children === undefined ? undefined : String(children ?? "")}
        </Component>
      ),
    }
  }
  return scenario?.default
}

/** Numbered markers on the parts of the example the spec's Anatomy names. */
function AnatomyMarkers({
  root,
  slots,
  highlight,
}: {
  root: HTMLElement | null
  slots: string[]
  highlight: number
}) {
  const [boxes, setBoxes] = useState<(DOMRect | null)[]>([])

  useEffect(() => {
    if (!root) return
    const measure = () => {
      const origin = root.getBoundingClientRect()
      setBoxes(
        slots.map((slot) => {
          const element = root.querySelector(`[data-slot="${slot}"]`)
          if (!element) return null
          const box = element.getBoundingClientRect()
          return new DOMRect(
            box.x - origin.x,
            box.y - origin.y,
            box.width,
            box.height
          )
        })
      )
    }
    const frame = requestAnimationFrame(measure)
    const observer = new ResizeObserver(() => requestAnimationFrame(measure))
    observer.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [root, slots])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {boxes.map((box, index) =>
        box ? (
          <div key={slots[index]}>
            {highlight === index + 1 ? (
              <div
                className="absolute border border-primary bg-primary/10"
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                }}
              />
            ) : null}
            <span
              className={cn(
                "absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-background text-xs font-medium text-primary",
                highlight === index + 1 && "bg-primary text-primary-foreground"
              )}
              style={{ left: box.x, top: box.y }}
            >
              {index + 1}
            </span>
          </div>
        ) : null
      )}
    </div>
  )
}

function Body({
  kind,
  name,
  initial,
}: {
  kind: "component" | "pattern"
  name: string
  initial: FrameState
}) {
  const [state, setState] = useState(initial)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const measured = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()
  const loaders = kind === "pattern" ? examples.patterns : examples.components
  const Example = useModule(loaders[name])?.default as ComponentType | undefined
  const story = useStory(kind === "component" ? name : "")

  // The page drives the frame: each change of its controls arrives here.
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.source !== window.parent || !isMessage<ToFrame>(event.data))
        return
      setState(event.data.state)
    }
    window.addEventListener("message", listen)
    window.parent.postMessage(
      fromFrame({ type: "ready" }),
      window.location.origin
    )
    return () => window.removeEventListener("message", listen)
  }, [])

  useEffect(() => {
    setTheme(state.theme)
  }, [setTheme, state.theme])

  // A forced state goes on <body>, so it reaches overlays portaled there too.
  useEffect(() => {
    const forced = state.view === "story" && state.state !== "rest"
    if (forced) document.body.dataset.forceState = state.state
    else delete document.body.dataset.forceState
  }, [state.view, state.state])

  // The page sizes the iframe to the content.
  useEffect(() => {
    const element = measured.current
    if (!element || window.parent === window) return
    const observer = new ResizeObserver(() => {
      window.parent.postMessage(
        fromFrame({
          type: "height",
          height: Math.ceil(element.getBoundingClientRect().height),
        }),
        window.location.origin
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  let content: ReactNode = null
  let layout: StoryLayout = kind === "pattern" ? "padded" : "centered"
  if (state.view === "story" && story) {
    content = story.render(state.args)
    layout = story.layout ?? layout
  } else if (state.view === "grid" && story) {
    content = (
      <div className="flex flex-wrap items-start justify-center gap-8">
        {(state.cells ?? []).map((cell) => (
          <figure key={cell.label} className="flex flex-col items-center gap-3">
            <div
              data-force-state={cell.state === "rest" ? undefined : cell.state}
              className="flex min-h-12 items-center justify-center"
            >
              {story.render(cell.args)}
            </div>
            <figcaption className="text-xs text-muted-foreground">
              {cell.label}
            </figcaption>
          </figure>
        ))}
      </div>
    )
  } else if (Example) {
    content = <Example />
    layout = kind === "pattern" ? "padded" : (story?.layout ?? "centered")
  }

  return (
    <div ref={measured} className={cn("relative", LAYOUT[layout])}>
      <div
        ref={setRoot}
        className={cn("relative", layout === "fullscreen" && "min-h-svh")}
      >
        {content}
        {state.view === "anatomy" && state.slots ? (
          <AnatomyMarkers
            root={root}
            slots={state.slots}
            highlight={state.highlight ?? 0}
          />
        ) : null}
      </div>
      {kind === "pattern" ? <Toaster /> : null}
    </div>
  )
}

/**
 * The inside of a preview iframe: renders what the page asks for, in the
 * theme it asks for, and reports its height. Opened on its own, it reads the
 * first state from the URL hash.
 */
export function PreviewFrame({
  kind,
  name,
}: {
  kind: "component" | "pattern"
  name: string
}) {
  const mounted = useMounted()
  if (!mounted) return null
  const initial: FrameState = decodeState(window.location.hash) ?? {
    view: "example",
    args: {},
    state: "rest",
    theme: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  }
  return <Body kind={kind} name={name} initial={initial} />
}
