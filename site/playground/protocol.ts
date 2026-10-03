import type { Args, ForcedState } from "@/site/playground/types"

/**
 * The origin every message must come from: the site's own. A preview is a
 * page of the site, so another site may frame it and post to it; the frame
 * and the canvas listen to their own origin only.
 */
export function isOwnOrigin(event: MessageEvent): boolean {
  return event.origin === window.location.origin
}

/**
 * What a canvas draws. The playground and the documentation sections render
 * their previews in an iframe (site/app/preview/): each preview is its own
 * document, so an overlay portaled to its <body> takes the preview's theme,
 * a sidebar's fixed layout stays inside it, and its width can be a phone's.
 * The page sends this state to the frame with postMessage; the frame's URL
 * hash carries the first one, so a preview also opens on its own.
 */
type View =
  /** The spec's code example, as written. */
  | "example"
  /** The playground story, with the args of the controls. */
  | "story"
  /** The story repeated, one cell per state or per variant combination. */
  | "grid"
  /** The example, with a numbered marker on each part of the anatomy. */
  | "anatomy"

/** What a preview shows: a component, a pattern, or a foundation's example. */
export type PreviewKind = "component" | "pattern" | "foundation"

export interface GridCell {
  label: string
  args: Args
  state: ForcedState
}

export interface FrameState {
  view: View
  args: Args
  state: ForcedState
  theme: "light" | "dark"
  /** The cells of the grid view. */
  cells?: GridCell[]
  /** The `data-slot` of each anatomy part, numbered from 1. */
  slots?: string[]
  /** The anatomy part to outline, from 1; none when 0. */
  highlight?: number
  /** Changes when the playground is reset: the story mounts again, from its defaults. */
  nonce?: number
}

/** Every message carries this, so a frame ignores what is not meant for it. */
const SOURCE = "dsaireadable-preview"

export type ToFrame = {
  source: typeof SOURCE
  type: "state"
  state: FrameState
}

/**
 * What a frame tells the page: it is ready for a state, the height of its
 * content, and whether the keyboard can reach anything in it.
 */
type FrameMessage =
  | { type: "ready" }
  | { type: "height"; height: number }
  | { type: "focusable"; focusable: boolean }

export type FromFrame = { source: typeof SOURCE } & FrameMessage

export function toFrame(state: FrameState): ToFrame {
  return { source: SOURCE, type: "state", state }
}

export function fromFrame(message: FrameMessage): FromFrame {
  return { source: SOURCE, ...message }
}

export function isMessage<T extends ToFrame | FromFrame>(
  data: unknown
): data is T {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { source?: unknown }).source === SOURCE
  )
}

export function encodeState(state: FrameState): string {
  return encodeURIComponent(JSON.stringify(state))
}

const VIEWS: readonly View[] = ["example", "story", "grid", "anatomy"]
const FORCED: readonly ForcedState[] = ["rest", "hover", "focus", "active"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return allowed.find((entry) => entry === value)
}

/**
 * The args a story may receive: a string, a number or a boolean per prop.
 * The frame spreads them on a component, so an object (`dangerouslySetInnerHTML`)
 * or an event handler name never passes, whoever wrote the URL or the message.
 */
function parseArgs(value: unknown): Args {
  if (!isRecord(value)) return {}
  const out: Args = {}
  for (const [key, entry] of Object.entries(value)) {
    if (/^on[A-Z]/.test(key)) continue
    if (
      typeof entry === "string" ||
      typeof entry === "boolean" ||
      (typeof entry === "number" && Number.isFinite(entry))
    )
      out[key] = entry
  }
  return out
}

/**
 * A frame state from untrusted data: the URL hash anyone can write, or a
 * message. Every field is checked against what the page sends; anything else
 * is dropped, and a value that is not a state at all gives `undefined`.
 */
export function parseState(value: unknown): FrameState | undefined {
  if (!isRecord(value)) return undefined
  const view = oneOf(value.view, VIEWS)
  if (!view) return undefined
  const state: FrameState = {
    view,
    args: parseArgs(value.args),
    state: oneOf(value.state, FORCED) ?? "rest",
    theme: value.theme === "dark" ? "dark" : "light",
  }
  if (Array.isArray(value.cells))
    state.cells = value.cells.filter(isRecord).map((cell) => ({
      label: typeof cell.label === "string" ? cell.label : "",
      args: parseArgs(cell.args),
      state: oneOf(cell.state, FORCED) ?? "rest",
    }))
  if (Array.isArray(value.slots))
    state.slots = value.slots.filter(
      (slot): slot is string => typeof slot === "string"
    )
  if (typeof value.highlight === "number" && Number.isInteger(value.highlight))
    state.highlight = value.highlight
  if (typeof value.nonce === "number" && Number.isInteger(value.nonce))
    state.nonce = value.nonce
  return state
}

export function decodeState(hash: string): FrameState | undefined {
  try {
    return parseState(JSON.parse(decodeURIComponent(hash.replace(/^#/, ""))))
  } catch {
    return undefined
  }
}

/** A path of the site, under the base path GitHub Pages serves it at. */
export function withBasePath(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? ""}${path}`
}
