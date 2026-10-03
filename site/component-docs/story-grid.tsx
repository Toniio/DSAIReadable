"use client"

import { useMemo } from "react"

import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import { defaultArgs, resolveArgs } from "@/site/playground/args"
import { useStoryControls } from "@/site/playground/playground"
import type { FrameState, GridCell } from "@/site/playground/protocol"
import {
  type Args,
  type Control,
  FORCED_STATE_LABELS,
  type ForcedState,
} from "@/site/playground/types"

/** The props that put a component in a state of its own: disabled, invalid, checked. */
const PROP_STATES: { prop: string; label: string; value: Args[string] }[] = [
  { prop: "disabled", label: "Disabled", value: true },
  { prop: "aria-invalid", label: "Invalid", value: true },
  { prop: "defaultChecked", label: "Checked", value: true },
  { prop: "defaultPressed", label: "Pressed", value: true },
]

/**
 * The args a grid starts from, where the defaults would hide what it shows.
 * A Field draws its hover and its focus on a choice card, not on an input
 * (a card is a row: a vertical Field stretches its checkbox); a default
 * Toggle has neither border nor fill, so its three sizes would draw the
 * same. An axis named here still takes each of its own values.
 */
const GRID_BASE: Record<"states" | "axes", Record<string, Args>> = {
  states: { Field: { control: "choice-card", orientation: "horizontal" } },
  axes: { Toggle: { variant: "outline" } },
}

function stateCells(
  name: string,
  controls: Control[],
  states: ForcedState[]
): GridCell[] {
  const base = resolveArgs(controls, {
    ...defaultArgs(controls),
    ...GRID_BASE.states[name],
  })
  return [
    ...states.map((state) => ({
      label: FORCED_STATE_LABELS[state],
      args: base,
      state,
    })),
    ...PROP_STATES.filter(({ prop }) =>
      controls.some(
        (control) => control.name === prop && control.kind === "boolean"
      )
    ).map(({ prop, label, value }) => ({
      label,
      args: { ...base, [prop]: value },
      state: "rest" as const,
    })),
  ]
}

function axisCells(
  name: string,
  controls: Control[],
  axis: Control
): GridCell[] {
  if (axis.kind !== "select") return []
  const base = { ...defaultArgs(controls), ...GRID_BASE.axes[name] }
  return axis.options.map((option) => ({
    label: option,
    args: resolveArgs(controls, { ...base, [axis.name]: option }),
    state: "rest" as const,
  }))
}

/**
 * The story drawn once per state (Rest, Hover, Focus, Press, then the
 * states a prop sets), or once per value of each variant axis.
 */
export function StoryGrid({
  name,
  slug,
  autoControls,
  states,
  mode,
  axes = [],
}: {
  name: string
  slug: string
  autoControls: Control[]
  states: ForcedState[]
  mode: "states" | "axes"
  /** For `axes`: the props that are variant axes (`variant`, `size`). */
  axes?: string[]
}) {
  const { controls, loaded, gridable } = useStoryControls(
    name,
    slug,
    autoControls
  )
  const theme = useSiteTheme()

  const grids = useMemo(() => {
    if (mode === "states") {
      const cells = stateCells(name, controls, states)
      // Rest alone is the playground's own canvas: no grid for it.
      return cells.length > 1 ? [{ title: "States", cells }] : []
    }
    return controls
      .filter((control) => axes.includes(control.name))
      .map((control) => ({
        title: control.name,
        cells: axisCells(name, controls, control),
      }))
  }, [mode, name, controls, states, axes])

  if (!loaded || !gridable || controls.length === 0 || grids.length === 0)
    return null

  return (
    <div className="flex flex-col gap-6">
      {grids.map((grid) => {
        const state: FrameState = {
          view: "grid",
          args: {},
          state: "rest",
          theme,
          cells: grid.cells,
        }
        return (
          <div key={grid.title} className="flex flex-col gap-2">
            {mode === "axes" ? (
              <p className="text-sm">
                <code className="bg-muted px-1 py-0.5 font-mono text-xs">
                  {grid.title}
                </code>
              </p>
            ) : null}
            <Canvas
              slug={slug}
              state={state}
              title={`${name} ${grid.title}`}
              className="border bg-muted"
            />
          </div>
        )
      })}
    </div>
  )
}
