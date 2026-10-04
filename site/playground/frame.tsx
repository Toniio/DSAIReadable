"use client"

import {
  type ComponentType,
  Fragment,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { PlusIcon } from "@phosphor-icons/react"

import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import * as examples from "@/site/generated/examples"
import { defaultArgs, resolveArgs } from "@/site/playground/args"
import { AUTO, autoComponent, isIconOnly, isLink } from "@/site/playground/auto"
import {
  decodeState,
  type FrameState,
  fromFrame,
  isMessage,
  isOwnOrigin,
  parseState,
  type PreviewKind,
  type ToFrame,
} from "@/site/playground/protocol"
import { SCENARIOS } from "@/site/playground/scenarios"
import type { Args, Story, StoryLayout } from "@/site/playground/types"
import { useModule } from "@/site/playground/use-module"
import { useMounted } from "@/site/ui/use-mounted"

/**
 * How the frame lays out what it draws: a story's layout, or `stage`, the
 * spec example of a component whose story covers the page (a Dialog's
 * trigger, a Select): centered in the whole frame, the room its overlay opens
 * in, instead of in its top corner.
 */
type FrameLayout = StoryLayout | "stage"

const LAYOUT: Record<FrameLayout, string> = {
  // A component wider than the frame starts at its left edge rather than
  // overflowing both sides (justify-center-safe).
  centered: "flex min-h-48 items-center justify-center-safe p-8",
  padded: "p-6",
  fullscreen: "min-h-svh",
  stage: "flex min-h-svh items-center justify-center-safe p-8",
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

/**
 * Keeps keyboard focus on the page until the reader enters the preview. An
 * overlay open by default (a Dialog, a Sheet, a menu) moves focus into itself
 * on mount, and Radix then traps it: from an iframe, that pulls focus off the
 * page as it loads, or as a control of the page mounts the overlay again. In
 * a preview, focus() does nothing while the frame's document does not have
 * focus; once the reader clicks or tabs into the frame, it works as usual.
 *
 * The focus held back is kept for when the reader enters. A modal traps the
 * keyboard by sending focus that leaves it back to the last element focused
 * inside it, and one that opened while the frame had no focus has none: Tab
 * into the frame would stop on its focus guard and on its trigger, which the
 * modal hides from assistive technology (aria-hidden). Focus that enters on
 * a hidden element goes where the modal asked for instead, as if it had
 * opened with the frame focused.
 */
function containFocus() {
  if (typeof window === "undefined" || window.parent === window) return
  let held: {
    element: HTMLElement
    options?: FocusOptions
    select?: () => void
  } | null = null
  const focus = HTMLElement.prototype.focus
  HTMLElement.prototype.focus = function contained(
    this: HTMLElement,
    options?: FocusOptions
  ) {
    if (document.hasFocus()) focus.call(this, options)
    // The first one, while it is there: Radix tries each field of a dialog
    // in turn, then the dialog itself.
    else if (!held?.element.isConnected) held = { element: this, options }
  }
  // Selecting a field's text focuses it too: Radix selects the first field
  // of a dialog after focusing it.
  for (const field of [HTMLInputElement, HTMLTextAreaElement]) {
    const select = field.prototype.select
    field.prototype.select = function contained(this: HTMLInputElement) {
      if (document.hasFocus()) select.call(this)
      else if (held?.element === this) held.select = () => select.call(this)
    }
  }
  // Before the modal's own listener, which then finds focus inside it.
  document.addEventListener(
    "focusin",
    (event) => {
      const wanted = held
      held = null
      if (
        wanted?.element.isConnected &&
        event.target instanceof Element &&
        event.target.closest('[aria-hidden="true"]')
      ) {
        focus.call(wanted.element, wanted.options)
        wanted.select?.()
      }
    },
    { capture: true }
  )
}
containFocus()

/**
 * Keeps a preview on its example. The examples link to the pages of the
 * product they show (`/settings/`): followed, a link would load the site's
 * 404 page inside the canvas. A link to an anchor of the preview still works.
 */
function useInertLinks() {
  useEffect(() => {
    const stay = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const link = target?.closest("a[href]")
      if (link && !link.getAttribute("href")?.startsWith("#"))
        event.preventDefault()
    }
    document.addEventListener("click", stay, true)
    return () => document.removeEventListener("click", stay, true)
  }, [])
}

/**
 * What the keyboard reaches with Tab. A hidden one counts too: enough to
 * tell a frame with controls from a picture.
 */
const TABBABLE = [
  "a[href]",
  "button:not(:disabled)",
  'input:not(:disabled):not([type="hidden"])',
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "summary",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable=""]',
  '[contenteditable="true"]',
].join(", ")

/**
 * Tells the page whether the keyboard can reach anything in the frame, each
 * time that changes: the page takes a frame with nothing to reach out of the
 * tab order (see Canvas). A picture, which an anatomy drawn open is (a
 * modal's focus trap would keep the keyboard inside it), reaches nothing,
 * and neither does what is inert.
 */
function useReportFocusable(picture: boolean) {
  useEffect(() => {
    if (window.parent === window) return
    let last: boolean | undefined
    const report = () => {
      const focusable =
        !picture &&
        Array.from(document.body.querySelectorAll(TABBABLE)).some(
          (element) => !element.closest("[inert]")
        )
      if (focusable === last) return
      last = focusable
      window.parent.postMessage(
        fromFrame({ type: "focusable", focusable }),
        window.location.origin
      )
    }
    report()
    const observer = new MutationObserver(report)
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["tabindex", "disabled", "href", "contenteditable"],
    })
    return () => observer.disconnect()
  }, [picture])
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
      render: ({ children, ...props }: Args) => {
        // Radix reads a default* prop (defaultChecked, defaultPressed) on
        // mount only: a new default mounts the component again.
        const remount = Object.entries(props)
          .filter(([key]) => /^default[A-Z]/.test(key))
          .map(([key, value]) => `${key}=${String(value)}`)
          .join(" ")
        if (auto.iconOnly && isIconOnly(auto, props))
          return (
            <Component
              key={remount}
              {...auto.fixed}
              {...props}
              aria-label={auto.iconOnly.label}
            >
              <PlusIcon />
            </Component>
          )
        if (auto.link && isLink(auto, props))
          return (
            <Component key={remount} {...auto.fixed} {...props} asChild>
              <a href={auto.link}>{String(children ?? auto.children)}</a>
            </Component>
          )
        return (
          <Component key={remount} {...auto.fixed} {...props}>
            {auto.children === undefined
              ? undefined
              : String(children ?? auto.children)}
          </Component>
        )
      },
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

interface Part {
  /** The part's box, relative to the root. */
  box: DOMRect
  /** Where its number sits: the box's top left, moved clear of the others. */
  x: number
  y: number
}

/**
 * The parts of the example the root renders, with a place for each number.
 * A part the example does not draw (absent, or `display: none`) has none.
 * Nested parts share a top-left corner: a number that would cover an earlier
 * one moves right, one marker's width at a time, and every number stays
 * inside the root, so a part at the frame's edge is not cut.
 */
function placeParts(
  root: HTMLElement,
  slots: string[],
  size: number
): (Part | null)[] {
  const origin = root.getBoundingClientRect()
  const half = size / 2
  const placed: Part[] = []
  return slots.map((slot) => {
    // The document, not the root: an overlay's parts are portaled to <body>.
    const element = document.querySelector(`[data-slot="${slot}"]`)
    if (!element) return null
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return null
    const box = new DOMRect(
      rect.x - origin.x,
      rect.y - origin.y,
      rect.width,
      rect.height
    )
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, half), Math.max(half, max - half))
    let x = clamp(box.x, origin.width)
    const y = clamp(box.y, origin.height)
    while (
      placed.some(
        (other) => Math.abs(other.x - x) < size && Math.abs(other.y - y) < size
      )
    )
      x += size
    const part = { box, x, y }
    placed.push(part)
    return part
  })
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
  const [parts, setParts] = useState<(Part | null)[]>([])
  // A hidden marker gives the size the numbers are spaced by: the class, not a number here.
  const probe = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!root) return
    const measure = () =>
      setParts(placeParts(root, slots, probe.current?.offsetWidth ?? 0))
    let frame = requestAnimationFrame(measure)
    const again = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(again)
    observer.observe(root)
    // An overlay mounts its portal after the root: measure again when it does.
    const mutations = new MutationObserver(again)
    mutations.observe(document.body, { childList: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      mutations.disconnect()
    }
  }, [root, slots])

  // Above everything the example stacks (a Sidebar is fixed): the top layer.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-tooltip"
    >
      <span ref={probe} className="invisible absolute size-5" />
      {parts.map((part, index) =>
        part ? (
          <div key={slots[index]}>
            {highlight === index + 1 ? (
              <div
                className="absolute border border-primary bg-primary/10"
                style={{
                  left: part.box.x,
                  top: part.box.y,
                  width: part.box.width,
                  height: part.box.height,
                }}
              />
            ) : null}
            <span
              className={cn(
                "absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-background text-xs font-medium text-primary",
                highlight === index + 1 && "bg-primary text-primary-foreground"
              )}
              style={{ left: part.x, top: part.y }}
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

/**
 * Whether what the root draws fills the screen: its first element is at
 * least as tall as the frame (`min-h-screen`, a SidebarProvider's
 * `min-h-svh`). Such an example takes the whole frame, without the padding
 * that would make it taller than the frame and scroll it.
 */
function fillsFrame(root: HTMLElement): boolean {
  const first = root.firstElementChild
  if (!(first instanceof HTMLElement)) return false
  const minimum = Number.parseFloat(getComputedStyle(first).minHeight)
  return Number.isFinite(minimum) && minimum >= window.innerHeight - 1
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
  const [fills, setFills] = useState(false)
  const measured = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()
  const Example = useModule(EXAMPLES[kind][name])?.default as
    ComponentType | undefined
  const story = useStory(kind === "component" ? name : "")
  const drawsExample = state.view === "example" || state.view === "anatomy"

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

  // Checked whenever the example's box changes: when it loads, and when the
  // frame is resized. The observer runs before paint.
  useEffect(() => {
    if (!root || !drawsExample) return
    const observer = new ResizeObserver(() => setFills(fillsFrame(root)))
    observer.observe(root)
    return () => observer.disconnect()
  }, [root, drawsExample])

  // The page sizes the iframe to the content. Content that fills the frame
  // (min-h-svh) plus padding grows with the frame: when the page resizes the
  // frame, the same overflow again is that loop, and is not reported. Growth
  // of the content itself, by the same amount twice, still is.
  useEffect(() => {
    const element = measured.current
    if (!element || window.parent === window) return
    let overflow = -1
    let resized = false
    let timer = 0
    const onResize = () => {
      resized = true
      window.clearTimeout(timer)
      // The observer runs in the same rendering step as the resize event.
      timer = window.setTimeout(() => {
        resized = false
      }, 0)
    }
    const observer = new ResizeObserver(() => {
      const height = Math.ceil(element.getBoundingClientRect().height)
      const extra = height - window.innerHeight
      if (resized && extra > 0 && extra === overflow) return
      overflow = extra
      window.parent.postMessage(
        fromFrame({ type: "height", height }),
        window.location.origin
      )
    })
    window.addEventListener("resize", onResize)
    observer.observe(element)
    return () => {
      window.removeEventListener("resize", onResize)
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  let content: ReactNode = null
  let layout: FrameLayout = kind === "component" ? "centered" : "padded"
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
              {/* A cell is a picture of a state, not a control: inert, so the
                  keyboard never stops in a cell drawn as focused. */}
              <div
                inert
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
  } else if (state.view === "anatomy" && story?.anatomy) {
    // An overlay's example is its trigger: the anatomy draws the story open,
    // so its parts are there to be marked.
    content = story.render(story.anatomy)
    layout =
      story.layout === "fullscreen" ? "stage" : (story.layout ?? "centered")
  } else if (Example) {
    content = <Example />
    // The spec's example is what a reader writes, not the story: a Dialog's
    // is its trigger, centered on the stage its story opens on.
    if (kind === "component")
      layout =
        story?.layout === "fullscreen" ? "stage" : (story?.layout ?? "centered")
  }
  if (drawsExample && fills) layout = "fullscreen"

  return (
    <div ref={measured} className={cn("relative", LAYOUT[layout])}>
      <div
        ref={setRoot}
        className={cn(
          "relative",
          (layout === "centered" || layout === "stage") &&
            "flex w-full items-center justify-center-safe",
          layout === "fullscreen" && "min-h-svh"
        )}
      >
        {/* A reset mounts the story again, from its defaults. */}
        <Fragment key={state.nonce ?? 0}>{content}</Fragment>
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

  useInertLinks()
  useReportFocusable(state.view === "anatomy")

  // The page drives the frame. The frame keeps saying it is ready until the
  // page answers: the page may still be hydrating when it first says so. Only
  // the site's own page drives it: another site may frame a preview too.
  useEffect(() => {
    if (window.parent === window) return
    let heard = false
    const listen = (event: MessageEvent) => {
      if (event.source !== window.parent || !isOwnOrigin(event)) return
      if (!isMessage<ToFrame>(event.data) || event.data.type !== "state") return
      const next = parseState(event.data.state)
      if (!next) return
      heard = true
      setState(next)
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
