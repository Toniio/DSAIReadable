import { userEvent } from "vitest/browser"

/**
 * WCAG 2.2 SC 1.4.11 (Non-text Contrast) read for focus indicators: the
 * indicator needs a part that reaches 3:1 against what it is drawn on. A
 * `ring-ring/50` halo alone paints about 1.9:1.
 */
const MIN_CONTRAST = 3

type Rgba = [number, number, number, number]

/**
 * A part of an element's box that can mark focus: a border side, the outline,
 * or a ring — a `box-shadow` layer with no offset and no blur, which is what
 * the `ring-*` utilities paint.
 */
type Part = {
  kind: string
  color: string
  width: number
  /** Painted over the element's own background rather than around it. */
  inside: boolean
}

type Paint = { key: string; parts: Part[] }

const SIDES = ["Top", "Right", "Bottom", "Left"] as const

const canvas = document.createElement("canvas")
canvas.width = canvas.height = 1
const context = canvas.getContext("2d", { willReadFrequently: true })!
const parsed = new Map<string, Rgba>()

/** Any CSS color (`oklab()` included) in sRGB, as the browser paints it. */
function rgba(color: string): Rgba {
  let value = parsed.get(color)
  if (!value) {
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    value = [r, g, b, a / 255]
    parsed.set(color, value)
  }
  return value
}

/** `color` painted with its alpha over the opaque `under`. */
function over(color: string, under: Rgba): Rgba {
  const [r, g, b, a] = rgba(color)
  const mix = (c: number, u: number) => c * a + u * (1 - a)
  return [mix(r, under[0]), mix(g, under[1]), mix(b, under[2]), 1]
}

function luminance([r, g, b]: Rgba): number {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** What paints under an element: its ancestors' backgrounds, on a white canvas. */
function backdrop(element: Element): Rgba {
  const chain: Element[] = []
  for (let e = element.parentElement; e; e = e.parentElement) chain.unshift(e)
  return chain.reduce<Rgba>(
    (under, e) => over(getComputedStyle(e).backgroundColor, under),
    [255, 255, 255, 1]
  )
}

/**
 * The painted color of a part against the color it is drawn on: the
 * backdrop for a part around the element, the element's own background (over
 * the backdrop) for an inset ring or outline.
 */
function partContrast(element: Element, part: Part): number {
  const around = backdrop(element)
  const style = getComputedStyle(element)
  const own = over(style.backgroundColor, around)
  if (part.inside) return contrast(over(part.color, own), own)
  // A border paints over the element's background unless it is clipped to
  // the padding box (`bg-clip-padding`).
  const under =
    part.kind.startsWith("border") && style.backgroundClip === "border-box"
      ? own
      : around
  return contrast(over(part.color, under), around)
}

const SHADOW =
  /^(.*?) (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px( inset)?$/

function paintOf(element: Element): Paint | undefined {
  const style = getComputedStyle(element)
  const parts: Part[] = []
  const other: string[] = []
  for (const side of SIDES) {
    const width = Number.parseFloat(style[`border${side}Width`])
    const color = style[`border${side}Color`]
    if (
      width > 0 &&
      !/none|hidden/.test(style[`border${side}Style`]) &&
      rgba(color)[3] > 0
    )
      parts.push({ kind: `border-${side}`, color, width, inside: false })
  }
  const outlineWidth = Number.parseFloat(style.outlineWidth)
  if (
    style.outlineStyle !== "none" &&
    outlineWidth > 0 &&
    rgba(style.outlineColor)[3] > 0
  )
    parts.push({
      kind: `outline ${style.outlineStyle}`,
      color: style.outlineColor,
      width: outlineWidth,
      inside: Number.parseFloat(style.outlineOffset) < 0,
    })
  // Tailwind always composes five shadow layers (inset shadow, inset ring,
  // ring offset, ring, shadow), unused ones transparent and zero-size.
  if (style.boxShadow !== "none")
    for (const layer of style.boxShadow.split(/,(?![^(]*\))/)) {
      const m = SHADOW.exec(layer.trim())
      if (!m || rgba(m[1])[3] === 0) continue
      const [x, y, blur, spread] = m.slice(2, 6).map(Number)
      if (x === 0 && y === 0 && blur === 0 && spread > 0)
        parts.push({
          kind: m[6] ? "inset ring" : "ring",
          color: m[1],
          width: spread,
          inside: !!m[6],
        })
      else if (spread > 0 || blur > 0) other.push(layer.trim())
    }
  if (parts.length === 0 && other.length === 0) return undefined
  const key = JSON.stringify([parts, other])
  return { key, parts }
}

/** What each visible element of the document paints on its edges. */
function snapshot(): Map<Element, Paint> {
  const paints = new Map<Element, Paint>()
  for (const element of document.body.querySelectorAll("*")) {
    // A part on an element that paints nothing (an invisible control laid
    // over its own visible stand-in, like Calendar's dropdown) marks nothing.
    if (!element.checkVisibility({ opacityProperty: true })) continue
    const paint = paintOf(element)
    if (paint) paints.set(element, paint)
  }
  return paints
}

const same = (a: Part, b: Part) =>
  a.kind === b.kind && a.color === b.color && a.width === b.width

const isRing = (part: Part) => part.kind.endsWith("ring")

/**
 * The width, in px, of the widest ring (a `box-shadow` layer with no offset
 * and no blur) the element paints on its own; 0 when it paints none.
 */
export function ringOf(element: Element): number {
  const rings = paintOf(element)?.parts.filter(isRing) ?? []
  return Math.max(0, ...rings.map((ring) => ring.width))
}

/**
 * The borders an element paints, as a key two states can be compared by, and
 * the contrast of the weakest one against what it is drawn on (1 when it
 * paints none): a state drawn by a border, such as the on state of a Toggle,
 * needs 3:1 (WCAG 1.4.11) and a paint of its own.
 */
export function borderPaint(element: Element): {
  key: string
  contrast: number
} {
  const borders =
    paintOf(element)?.parts.filter((part) => part.kind.startsWith("border")) ??
    []
  return {
    key: JSON.stringify(borders),
    contrast: Math.min(
      ...borders.map((part) => partContrast(element, part)),
      borders.length ? Infinity : 1
    ),
  }
}

/**
 * The contrast of the indicator that moving focus to `focused` showed,
 * comparing the document before and after the move: the best part that
 * appeared or changed — on the focused element, on the group that wraps it
 * (`FOCUS_RING_WITHIN`, InputGroup) or on the part standing for it (the active
 * InputOTP slot). When focus moves between two controls of one ringed group
 * (Attachment), the group's indicator stays and is what marks focus.
 * 0 when nothing changed.
 */
function indicatorContrast(
  focused: Element,
  before: Map<Element, Paint>,
  after: Map<Element, Paint>
): number {
  let best = 0
  for (const [element, paint] of after) {
    const previous = before.get(element)
    if (previous?.key === paint.key) continue
    for (const part of paint.parts)
      if (!previous?.parts.some((p) => same(p, part)))
        best = Math.max(best, partContrast(element, part))
  }
  const ringGone = [...before].some(
    ([element, paint]) =>
      paint.parts.some(isRing) && !after.get(element)?.parts.some(isRing)
  )
  if (best < MIN_CONTRAST && ringGone)
    for (let e: Element | null = focused; e; e = e.parentElement) {
      const paint = after.get(e)
      if (paint?.parts.some(isRing))
        for (const part of paint.parts)
          best = Math.max(best, partContrast(e, part))
    }
  return best
}

function describeElement(element: Element): string {
  const slot = element.getAttribute("data-slot")
  const role = element.getAttribute("role")
  return [
    element.tagName.toLowerCase(),
    slot && `[data-slot=${slot}]`,
    role && `[role=${role}]`,
  ]
    .filter(Boolean)
    .join("")
}

/**
 * Walks the tab order of what is rendered with real Tab key presses, in the
 * light theme and then in the dark one (the `.dark` class on `<html>`), and
 * returns each tab stop whose focus indicator has no part reaching 3:1 against
 * what it is drawn on, prefixed with its theme and followed by the best
 * contrast it reached. `max` bounds each walk: enough to cross the largest
 * example and come back to `<body>`.
 */
export async function unmarkedTabStops(max = 40): Promise<string[]> {
  const root = document.documentElement
  const initiallyDark = root.classList.contains("dark")
  const unmarked: string[] = []
  try {
    for (const theme of ["light", "dark"] as const) {
      root.classList.toggle("dark", theme === "dark")
      for (const stop of await walkTabStops(max)) {
        unmarked.push(`${theme} ${stop}`)
      }
    }
  } finally {
    root.classList.toggle("dark", initiallyDark)
  }
  return unmarked
}

async function walkTabStops(max: number): Promise<string[]> {
  // The tests run in an iframe: past the last tab stop, focus leaves it for
  // the runner's page. An anchor out of the tab order, focused first, brings
  // it back and starts the sequence before what is rendered.
  const anchor = document.createElement("span")
  anchor.tabIndex = -1
  document.body.prepend(anchor)
  anchor.focus()
  const unmarked: string[] = []
  const seen = new Set<Element>()
  try {
    for (let i = 0; i < max; i++) {
      const before = snapshot()
      // A real Tab key press from Playwright, so :focus-visible matches.
      await userEvent.keyboard("{Tab}")
      await new Promise(requestAnimationFrame)
      const focused = document.activeElement
      if (!focused || focused === document.body || seen.has(focused)) break
      seen.add(focused)
      const shown = indicatorContrast(focused, before, snapshot())
      if (shown < MIN_CONTRAST) {
        unmarked.push(`${describeElement(focused)} ${shown.toFixed(2)}:1`)
      }
    }
  } finally {
    anchor.remove()
  }
  return unmarked
}
