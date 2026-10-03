"use client"

import { type ReactNode, useEffect, useRef } from "react"

import { FOCUS_BORDERLESS } from "@/site/ui/link"

/** What a scrolling table draws on focus: the ring, and a solid outline (focus.md). */
const FOCUS_CLASSES = FOCUS_BORDERLESS.split(" ")

/**
 * The heading a table sits under: the last h2, h3 or h4 of its section
 * before it. A section with several tables (the color page's palettes)
 * names each by its own subheading, not all by the section's title.
 */
function headingOf(element: HTMLElement): string | undefined {
  const section = element.closest("section") ?? document.body
  let found: string | undefined
  for (const heading of section.querySelectorAll("h2, h3, h4")) {
    if (
      !(
        heading.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    )
      break
    found = heading.textContent?.trim() || found
  }
  return found
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
    // The wrapper has no box (display: contents), so each container is
    // observed itself: a table starts to overflow when the window narrows.
    const observed = new Set<Element>()
    const update = () => {
      const names = new Map<string, number>()
      for (const container of element.querySelectorAll<HTMLElement>(
        '[data-slot="table-container"]'
      )) {
        if (!observed.has(container)) {
          observed.add(container)
          resize.observe(container)
        }
        if (container.scrollWidth > container.clientWidth + 1) {
          // Landmark names are unique: a second table under one heading is "… table 2".
          const base = `${headingOf(container) ?? "Data"} table`
          const count = (names.get(base) ?? 0) + 1
          names.set(base, count)
          container.tabIndex = 0
          container.setAttribute("role", "region")
          container.setAttribute(
            "aria-label",
            count === 1 ? base : `${base} ${count}`
          )
          container.classList.add(...FOCUS_CLASSES)
        } else {
          container.removeAttribute("tabindex")
          container.removeAttribute("role")
          container.removeAttribute("aria-label")
        }
      }
    }
    const resize = new ResizeObserver(update)
    update()
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
