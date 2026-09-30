type Snapshot = { rings: Map<Element, string>; elements: number }

/**
 * The visible layers of a computed `box-shadow`: Tailwind always composes five
 * (inset shadow, inset ring, ring offset, ring, shadow), unused ones as
 * transparent zero-size layers.
 */
function visibleShadow(boxShadow: string): string {
  if (boxShadow === "none") return ""
  return boxShadow
    .split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter(
      (layer) =>
        !/^rgba\(0, 0, 0, 0\)|\/ 0\)/.test(layer) &&
        !/ 0px 0px 0px 0px$/.test(layer)
    )
    .join(", ")
}

function ringOf(element: Element): string {
  const style = getComputedStyle(element)
  const outline =
    style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0
      ? `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`
      : ""
  const shadow = visibleShadow(style.boxShadow)
  return outline || shadow ? `${outline}|${shadow}` : ""
}

/**
 * The rings painted in the document — each element drawing an outline or a
 * visible box-shadow (the `ring-*` utilities) — and the number of elements.
 */
export function snapshot(): Snapshot {
  const rings = new Map<Element, string>()
  const elements = document.body.querySelectorAll("*")
  for (const element of elements) {
    const ring = ringOf(element)
    if (ring) rings.set(element, ring)
  }
  return { rings, elements: elements.length }
}

/**
 * Whether moving focus to `focused` showed it, comparing the document before
 * and after the move:
 * - a ring appeared or changed — on the focused element, on the group that
 *   wraps it (`FOCUS_RING_WITHIN`, InputGroup) or on the part standing for it
 *   (the active InputOTP slot);
 * - or the previous ring went away while the focused element sits in a ring,
 *   when focus moves between two controls of one ringed group (Attachment);
 * - or new content appeared: a `focus-managed` component like Chart shows its
 *   tooltip on focus.
 */
export function focusShown(
  focused: Element,
  before: Snapshot,
  after: Snapshot
): boolean {
  for (const [element, ring] of after.rings) {
    if (before.rings.get(element) !== ring) return true
  }
  if (after.elements > before.elements) return true
  const ringGone = [...before.rings.keys()].some((e) => !after.rings.has(e))
  for (let e: Element | null = focused; e; e = e.parentElement) {
    if (ringGone && after.rings.has(e)) return true
  }
  return false
}
