"use client"

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { ThemeProvider, useTheme } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import * as examples from "@/site/generated/examples"
import { defaultArgs, resolveArgs } from "@/site/playground/args"
import { AUTO, autoComponent } from "@/site/playground/auto"
import {
  decodeState,
  type FrameState,
  fromFrame,
  isMessage,
  type PreviewKind,
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

/** How often a frame says it is ready, until the page answers. */
const ANNOUNCE_EVERY = 250

/**
 * Keeps scrolling inside the preview. `scrollIntoView` in an iframe also
 * scrolls the page around it: a command list that brings its first item into
 * view would jump the documentation page. In a preview, it scrolls the
 * nearest scrolling container instead, and never the window.
 */
function containScrolling() {
  if (typeof window === "undefined" || window.parent === window) return
  Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
    let parent = this.parentElement
    while (parent && parent !== document.body) {
      const overflow = getComputedStyle(parent).overflowY
      if (
        (overflow === "auto" || overflow === "scroll") &&
        parent.scrollHeight > parent.clientHeight
      ) {
        const outer = parent.getBoundingClientRect()
        const inner = this.getBoundingClientRect()
        if (inner.top < outer.top) parent.scrollTop -= outer.top - inner.top
        else if (inner.bottom > outer.bottom)
          parent.scrollTop += inner.bottom - outer.bottom
        return
      }
      parent = parent.parentElement
    }
  }
}
containScrolling()

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
  const story = scenario?.default
  if (!story) return undefined
  // A scenario renders with its controls' defaults under what the page sends,
  // so a preview opened on its own, with no args, still renders.
  return {
    ...story,
    render: (args: Args) =>
      story.render(
        resolveArgs(story.controls, { ...defaultArgs(story.controls), ...args })
      ),
  }
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

/** The loaders of a kind of preview's examples. */
const EXAMPLES: Record<PreviewKind, examples.Loaders> = {
  component: examples.components,
  pattern: examples.patterns,
  foundation: examples.foundations,
}

function Body({
  kind,
  name,
  state,
}: {
  kind: PreviewKind
  name: string
  state: FrameState
}) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const measured = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()
  const Example = useModule(EXAMPLES[kind][name])?.default as
    ComponentType | undefined
  const story = useStory(kind === "component" ? name : "")

  // `useTheme` answers what the page asked for, so a Toaster follows it.
  useEffect(() => {
    setTheme(state.theme)
  }, [setTheme, state.theme])

  // A forced state goes on <body>, so it reaches overlays portaled there too.
  useEffect(() => {
    const forced = state.view === "story" && state.state !== "rest"
    if (forced) document.body.dataset.forceState = state.state
    else delete document.body.dataset.forceState
  }, [state.view, state.state])

  // The page sizes the iframe to the content. Content that fills the frame
  // (min-h-svh) plus padding would grow it by the same amount at every report:
  // the second report of the same overflow is dropped.
  useEffect(() => {
    const element = measured.current
    if (!element || window.parent === window) return
    let overflow = -1
    const observer = new ResizeObserver(() => {
      const height = Math.ceil(element.getBoundingClientRect().height)
      const extra = height - window.innerHeight
      if (extra > 0 && extra === overflow) return
      overflow = extra
      window.parent.postMessage(
        fromFrame({ type: "height", height }),
        window.location.origin
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  let content: ReactNode = null
  let layout: StoryLayout = kind === "component" ? "centered" : "padded"
  if (state.view === "story" || state.view === "grid") {
    // Nothing until the story is there: the example would flash in its place.
    if (story && state.view === "story") {
      content = story.render(state.args)
      layout = story.layout ?? layout
    } else if (story) {
      content = (
        <div className="flex flex-wrap items-start justify-center gap-8">
          {(state.cells ?? []).map((cell) => (
            <figure
              key={cell.label}
              className="flex flex-col items-center gap-3"
            >
              <div
                data-force-state={
                  cell.state === "rest" ? undefined : cell.state
                }
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
    }
  } else if (Example) {
    content = <Example />
    if (kind === "component") layout = story?.layout ?? "centered"
  }

  return (
    <div ref={measured} className={cn("relative", LAYOUT[layout])}>
      <div
        ref={setRoot}
        className={cn(
          "relative",
          layout === "centered" && "flex w-full items-center justify-center",
          layout === "fullscreen" && "min-h-svh"
        )}
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
      {kind === "pattern" ? <Toaster theme={state.theme} /> : null}
    </div>
  )
}

/** The frame's state: the first from the URL, then each one the page sends. */
function Frame({
  kind,
  name,
  initial,
}: {
  kind: PreviewKind
  name: string
  initial: FrameState
}) {
  const [state, setState] = useState(initial)

  // The page drives the frame. The frame keeps saying it is ready until the
  // page answers: the page may still be hydrating when it first says so.
  useEffect(() => {
    if (window.parent === window) return
    let heard = false
    const listen = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      if (!isMessage<ToFrame>(event.data) || event.data.type !== "state") return
      heard = true
      setState(event.data.state)
    }
    const announce = () => {
      if (heard) window.clearInterval(timer)
      else
        window.parent.postMessage(
          fromFrame({ type: "ready" }),
          window.location.origin
        )
    }
    window.addEventListener("message", listen)
    const timer = window.setInterval(announce, ANNOUNCE_EVERY)
    announce()
    return () => {
      window.removeEventListener("message", listen)
      window.clearInterval(timer)
    }
  }, [])

  // Each preview keeps its theme under a key of its own (the iframe's name):
  // previews on one page never change each other's theme through storage.
  return (
    <ThemeProvider
      attribute="class"
      storageKey={`dsaireadable-preview-${window.name || "alone"}`}
      defaultTheme={initial.theme}
      forcedTheme={state.theme}
      enableSystem={false}
      disableTransitionOnChange
      // Rendered in the browser only: a data block, so React does not warn
      // about a script it would not run (the effect sets the class).
      scriptProps={{ type: "application/json" }}
    >
      <Body kind={kind} name={name} state={state} />
    </ThemeProvider>
  )
}

/**
 * The inside of a preview iframe: renders what the page asks for, in the
 * theme it asks for, and reports its height. Opened on its own, it reads its
 * state from the URL hash.
 */
export function PreviewFrame({
  kind,
  name,
}: {
  kind: PreviewKind
  name: string
}) {
  const mounted = useMounted()
  if (!mounted) return null
  const initial: FrameState = decodeState(window.location.hash) ?? {
    view: "example",
    args: {},
    state: "rest",
    theme: "light",
  }
  return <Frame kind={kind} name={name} initial={initial} />
}
