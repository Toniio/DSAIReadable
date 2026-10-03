import { componentSpec, stateRows, variantAxes } from "@/site/lib/components"
import { AUTO, type AutoStory } from "@/site/playground/auto"
import type { Control, ForcedState } from "@/site/playground/types"

/** A cell of the Props / API table, without its backticks: `"default"` → `"default"`. */
function unquote(cell: string): string {
  return cell.replace(/^`+\s?|\s?`+$/g, "").trim()
}

/** The control of one prop, read from the cva axes, then from the spec's Props / API. */
function deriveControl(name: string, story: AutoStory, prop: string): Control {
  const axis = variantAxes(name).find(
    (entry) => entry.component === story.export && entry.axis === prop
  )
  if (axis)
    return {
      kind: "select",
      name: prop,
      options: axis.values,
      default: axis.default ?? axis.values[0],
      // A cva axis keyed by numbers (Heading's `level`) takes a number prop:
      // the code writes `level={2}`, which compiles, not `level="2"`.
      numeric: axis.values.every((value) => /^\d+$/.test(value)) || undefined,
    }

  const row = componentSpec(name).props.find(
    (entry) => entry.component === story.export && unquote(entry.prop) === prop
  )
  const type = row ? unquote(row.type) : "string"
  const fallback = row ? unquote(row.default) : ""
  if (type === "boolean")
    return { kind: "boolean", name: prop, default: fallback === "true" }
  if (/^"[^"]*"(\s*\|\s*"[^"]*")*$/.test(type)) {
    const options = [...type.matchAll(/"([^"]*)"/g)].map((match) => match[1])
    const value = /^"([^"]*)"$/.exec(fallback)?.[1]
    return {
      kind: "select",
      name: prop,
      options,
      default: value && options.includes(value) ? value : options[0],
    }
  }
  if (/^\d+(\s*\|\s*\d+)*$/.test(type)) {
    const options = type.split("|").map((value) => value.trim())
    return {
      kind: "select",
      name: prop,
      options,
      default: options.includes(fallback) ? fallback : options[0],
      numeric: true,
    }
  }
  if (type === "number")
    return {
      kind: "number",
      name: prop,
      default: Number(fallback) || 0,
      min: 0,
      max: 100,
    }
  const text = /^"([^"]*)"$/.exec(fallback)?.[1] ?? ""
  return { kind: "text", name: prop, default: text }
}

/** The controls of a generic playground: derived props, declared ones, then the text child. */
export function autoControls(name: string): Control[] {
  const story = AUTO[name]
  if (!story) return []
  return [
    ...(story.props ?? []).map((prop) => deriveControl(name, story, prop)),
    ...(story.controls ?? []),
    ...(story.children !== undefined
      ? [{ kind: "text" as const, name: "children", default: story.children }]
      : []),
  ]
}

/**
 * The interaction states a component draws, from its spec's States table:
 * the canvas offers to force those only. Rest is always there.
 */
export function forcedStates(name: string): ForcedState[] {
  const rows = stateRows(name)
  return [
    "rest",
    ...(["hover", "focus", "active"] as const).filter((state) =>
      rows.some(
        (row) =>
          row.state === state &&
          // A row whose classes never use the pseudo-class names something
          // else: Tabs' `active` is the selected tab (data-active), not a
          // press. A row with no class of its own draws the state through a
          // component it composes (Pagination's links are buttonVariants).
          (row.classes.length === 0 ||
            row.classes.some((value) => PSEUDO[state].test(value)))
      )
    ),
  ]
}

/** The variants each forced state stands for: `focus` is focus and focus-visible. */
// `group-hover/item:` and `has-[…:focus-visible]:` count; `data-active:`
// (an attribute the component sets) does not.
const PSEUDO: Record<"hover" | "focus" | "active", RegExp> = {
  hover: /(^|[:[]|group-|peer-)hover[\]:/]/,
  focus: /(^|[:[]|group-|peer-|has-)focus(-visible|-within)?[\]:/]/,
  active: /(^|[:[]|group-|peer-)active[\]:/]/,
}
