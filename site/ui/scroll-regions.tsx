"use client"

import { type ReactNode, useEffect, useRef } from "react"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/** What a scrolling table draws on focus: the ring, and a solid outline (focus.md). */
const FOCUS_CLASSES = [
  FOCUS_OUTLINE_RESET,
  FOCUS_RING,
  "focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid",
]
  .join(" ")
  .split(" ")

/** The name a scrolling table takes: its section's heading. */
function nameOf(element: HTMLElement): string {
  const heading = element
    .closest("section")
    ?.querySelector("h2")
    ?.textContent?.trim()
  return heading ? `${heading} table` : "Table"
}

/**
 * Makes every table under it that scrolls sideways reachable from the
 * keyboard: a table wider than a narrow screen scrolls in its container, and
 * a region that scrolls has to take focus to be scrolled without a pointer
 * (axe scrollable-region-focusable). The container becomes a named region
 * only while it overflows; a table that fits takes no tab stop. Renders no
 * box of its own, so the page's spacing stays.
 */
export function ScrollRegions({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = root.current
    if (!element) return
    const update = () => {
      for (const container of element.querySelectorAll<HTMLElement>(
        '[data-slot="table-container"]'
      )) {
        if (container.scrollWidth > container.clientWidth + 1) {
          container.tabIndex = 0
          container.setAttribute("role", "region")
          container.setAttribute("aria-label", nameOf(container))
          container.classList.add(...FOCUS_CLASSES)
        } else {
          container.removeAttribute("tabindex")
          container.removeAttribute("role")
          container.removeAttribute("aria-label")
        }
      }
    }
    update()
    const resize = new ResizeObserver(update)
    resize.observe(element)
    // Filters and loaded content add tables after the first pass.
    const mutation = new MutationObserver(update)
    mutation.observe(element, { childList: true, subtree: true })
    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [])

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  )
}
