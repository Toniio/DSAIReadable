import type { Args, ForcedState } from "@/site/playground/types"

/**
 * What a canvas draws. The playground and the documentation sections render
 * their previews in an iframe (site/app/preview/): each preview is its own
 * document, so an overlay portaled to its <body> takes the preview's theme,
 * a sidebar's fixed layout stays inside it, and its width can be a phone's.
 * The page sends this state to the frame with postMessage; the frame's URL
 * hash carries the first one, so a preview also opens on its own.
 */
export type View =
  /** The spec's code example, as written. */
  | "example"
  /** The playground story, with the args of the controls. */
  | "story"
  /** The story repeated, one cell per state or per variant combination. */
  | "grid"
  /** The example, with a numbered marker on each part of the anatomy. */
  | "anatomy"

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
}

/** Every message carries this, so a frame ignores what is not meant for it. */
const SOURCE = "dsaireadable-preview"

export type ToFrame = {
  source: typeof SOURCE
  type: "state"
  state: FrameState
}

export type FromFrame =
  | { source: typeof SOURCE; type: "ready" }
  | { source: typeof SOURCE; type: "height"; height: number }

export function toFrame(state: FrameState): ToFrame {
  return { source: SOURCE, type: "state", state }
}

export function fromFrame(
  message: { type: "ready" } | { type: "height"; height: number }
): FromFrame {
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

export function decodeState(hash: string): FrameState | undefined {
  try {
    const value = JSON.parse(
      decodeURIComponent(hash.replace(/^#/, ""))
    ) as FrameState
    return typeof value === "object" && value !== null && "view" in value
      ? value
      : undefined
  } catch {
    return undefined
  }
}

/** A path of the site, under the base path GitHub Pages serves it at. */
export function withBasePath(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? ""}${path}`
}
