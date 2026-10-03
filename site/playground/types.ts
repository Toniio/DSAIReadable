import type { ReactNode } from "react"

/** The value a control sets: the props a story renders with. */
export type Args = Record<string, string | number | boolean>

/** A control of the playground, and the prop it drives. */
export type Control =
  | {
      kind: "select"
      name: string
      options: string[]
      default: string
      /** The options are numbers written as text (`level` 1 to 4): the prop gets the number. */
      numeric?: boolean
    }
  | { kind: "boolean"; name: string; default: boolean }
  | { kind: "text"; name: string; default: string }
  | {
      kind: "number"
      name: string
      default: number
      min: number
      max: number
      step?: number
    }

/**
 * How the canvas frames a story: centered on a dotted stage, laid out with
 * padding from the top left, or given the whole frame (a sidebar, an overlay
 * that covers the page).
 */
export type StoryLayout = "centered" | "padded" | "fullscreen"

/**
 * A hand-written playground for a component the generic one cannot render
 * alone: a Dialog needs a trigger and content, a Select its items. Lives in
 * site/playground/scenarios/<Name>.tsx.
 */
export interface Story {
  controls: Control[]
  render: (args: Args) => ReactNode
  /** The code of what `render` draws for these args; the spec's example when absent. */
  code?: (args: Args) => string
  layout?: StoryLayout
  /**
   * Whether the component page may draw the story once per state and per
   * variant value. False for what covers the page or portals out of a cell:
   * a dialog, a menu, a toast. A `fullscreen` story never is.
   */
  grid?: boolean
}

/** The interaction states a canvas can force: Rest is none. */
export type ForcedState = "rest" | "hover" | "focus" | "active"

export const FORCED_STATE_LABELS: Record<ForcedState, string> = {
  rest: "Rest",
  hover: "Hover",
  focus: "Focus",
  active: "Press",
}
