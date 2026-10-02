/**
 * Which state a Tailwind variant names — `hover:`, `focus-visible:`,
 * `data-open:`, `aria-invalid:`… — for the spec generators.
 * build-spec-states.ts groups a component's classes by these states, and
 * spec-classes.ts drops the classes of a state a spec declares its component
 * never enters through a composed `cva` call. A variant in neither STATES nor
 * LAYOUT is added to `unclassified`, and build-spec-states.ts fails the run on
 * it, so a new one is classified, never dropped.
 */

/**
 * The states, in the order their rows are written, and the variants that
 * name each one. A variant is matched once `group-` or `peer-` (and its
 * `/name`) and `has-` are taken off: `group-data-[disabled=true]/field` and
 * `has-disabled` name `disabled`, like `disabled` itself.
 */
const STATES: [string, RegExp][] = [
  ["hover", /^hover$/],
  ["focus", /^(?:focus|focus-visible|focus-within)$|^data-\[focused=true\]$/],
  ["active", /^(?:active|data-active)$|^data-\[active=true\]$/],
  ["pressed", /^(?:aria-pressed|data-pressed)$|^data-\[state=on\]$/],
  [
    "selected",
    /^(?:aria-selected|data-selected)$|^data-\[(?:selected|selected-single|range-start|range-middle|range-end)=true\]$|^data-\[state=selected\]$/,
  ],
  [
    "checked",
    /^(?:checked|aria-checked|data-checked)$|^data-\[checked=true\]$|^data-\[state=checked\]$/,
  ],
  ["unchecked", /^data-unchecked$|^data-\[state=unchecked\]$/],
  ["highlighted", /^data-highlighted$/],
  [
    "open",
    /^(?:open|aria-expanded|data-open|data-popup-open)$|^data-\[state=(?:open|delayed-open|instant-open|visible|expanded)\]$/,
  ],
  ["closing", /^data-closed$|^data-\[state=(?:closed|hidden)\]$/],
  [
    "collapsed",
    /^data-\[state=collapsed\]$|^data-\[collapsible=(?:icon|offcanvas)\]$/,
  ],
  [
    "disabled",
    /^(?:disabled|aria-disabled|data-disabled)$|^data-\[disabled=true\]$/,
  ],
  [
    "error",
    /^(?:invalid|aria-invalid|data-invalid)$|^data-\[invalid=true\]$|^data-\[state=error\]$/,
  ],
  ["placeholder", /^(?:placeholder|placeholder-shown|data-placeholder)$/],
  ["empty", /^data-empty$/],
  ["pending", /^data-pending-scroll$/],
]
export const ORDER = ["default", ...STATES.map(([state]) => state)]

/** What an arbitrary selector (`[&:hover]`, `has-[:focus-visible]`) tests, by state. */
const SELECTOR_STATES: [string, RegExp][] = [
  // A <select>'s placeholder is its selected empty-value option: not `checked`.
  ["placeholder", /\[value=(?:''|"")\]:checked\b/],
  ["hover", /:hover\b/],
  ["focus", /:focus(?:-visible|-within)?\b|\[data-focused=true\]/],
  ["active", /:active\b|\[data-active(?:=true)?\]/],
  ["selected", /\[data-selected=true\]|\[aria-selected=true\]/],
  [
    "checked",
    /:checked\b(?<!\[value=(?:''|"")\]:checked)|\[data-checked\]|\[data-state=checked\]/,
  ],
  ["open", /\[aria-expanded=true\]|\[data-state=open\]|\[data-open\]/],
  [
    "collapsed",
    /\[data-state=collapsed\]|\[data-collapsible=(?:icon|offcanvas)\]/,
  ],
  [
    "disabled",
    /:disabled\b|\[data-disabled(?:=true)?\]|\[aria-disabled=true\]/,
  ],
  ["error", /\[aria-invalid(?:=true)?\]/],
]

/** Variants that name no state: themes, breakpoints, pseudo-elements, structure, a component's variant or slot. */
const LAYOUT: RegExp[] = [
  /^(?:dark|light|rtl|ltr|print|forced-colors|motion-safe|motion-reduce|portrait|landscape|contrast-more|contrast-less)$/,
  /^(?:sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl|max-2xl|min-\[[^\]]+\]|max-\[[^\]]+\])$/,
  /^@[\w-]*(?:\/[\w-]+)?$|^@\[[^\]]+\](?:\/[\w-]+)?$/,
  /^supports-[\w-]+$|^supports-\[[^\]]+\]$/,
  /^(?:after|before|file|selection|marker|backdrop|first-letter|first-line)$/,
  /^(?:\*|\*\*|first|last|only|odd|even|first-of-type|last-of-type|only-of-type|nth-[\w-]+|nth-\[[^\]]+\]|nth-last-[\w-]+|nth-last-\[[^\]]+\])$/,
  /^(?:data|aria)-\[(?:slot|size|side|variant|orientation|align|align-trigger|spacing|direction|position|vaul-drawer-direction|motion|chips|viewport|type|shortcut|icon|sidebar|inset|level|sizing|haspopup|panel-group-direction|swipe|swipe-direction|starting-style|ending-style|separator|sorted|layout|mobile|nav|disabled=false|active=false|selected=false|state=inactive)(?:\^?=[^\]]*)?\]$/,
  /^data-(?:slot|vertical|horizontal|inset|side|align|orientation|starting-style|ending-style)$/,
  /^aria-(?:haspopup|orientation)$/,
]

/** Any `data-[state=…]` value the tables above do not name is a state of its own (Attachment's `uploading`, `done`). */
const DATA_STATE = /^data-\[state=([\w-]+)\]$/

export const unclassified = new Set<string>()

/** The states a variant names; none for a layout variant, a negation or a context. */
export function statesOf(variant: string, file: string): string[] {
  let v = variant.replace(/^(?:group|peer)-/, "").replace(/\/[\w-]+$/, "")
  if (/^(?:not|in)-/.test(v)) return []
  if (v.startsWith("has-")) v = v.slice("has-".length)
  if (v.startsWith("[") || v.startsWith("&")) {
    return SELECTOR_STATES.filter(([, re]) => re.test(v)).map(([s]) => s)
  }
  const states = STATES.filter(([, re]) => re.test(v)).map(([s]) => s)
  if (states.length > 0) return states
  const dataState = DATA_STATE.exec(v)?.[1]
  if (dataState) return [dataState]
  if (LAYOUT.some((re) => re.test(v))) return []
  unclassified.add(`${variant} (${file})`)
  return []
}
