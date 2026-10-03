"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  label: string
}

/**
 * The section being read: the last one whose top has reached the place a
 * jump to it lands (its scroll margin, under the header), or the last of the
 * page once the bottom is reached. A short section a link jumps to is
 * marked, not the one after it.
 */
function current(items: TocItem[]): string | undefined {
  let found = items[0]?.id
  for (const item of items) {
    const element = document.getElementById(item.id)
    if (!element) continue
    const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop)
    // One pixel of slack: a jump lands exactly on the margin, give or take rounding.
    if (element.getBoundingClientRect().top <= (margin || 0) + 1)
      found = item.id
  }
  const bottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2
  return bottom ? items.at(-1)?.id : found
}

/** "On this page": the sections of the page, the one being read marked. */
export function PageToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id)
  // The entry just followed stays marked while its jump scrolls the page: a
  // short last section, at the bottom, would otherwise give way to the last.
  const chosen = useRef<string | undefined>(undefined)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (chosen.current === undefined) setActive(current(items))
      })
    }
    // The reader scrolls again: the page decides the entry from then on.
    const release = () => {
      chosen.current = undefined
    }
    // The jump has ended: the entry stays, and the next scroll, whatever
    // moves it (the scrollbar dragged too), decides again. The update the
    // jump's last scroll queued is dropped: it runs after this event.
    const settle = () => {
      if (chosen.current === undefined) return
      cancelAnimationFrame(frame)
      chosen.current = undefined
    }
    const RELEASES = ["wheel", "touchstart", "keydown"] as const
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("scrollend", settle)
    window.addEventListener("resize", update)
    for (const name of RELEASES)
      window.addEventListener(name, release, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("scrollend", settle)
      window.removeEventListener("resize", update)
      for (const name of RELEASES) window.removeEventListener(name, release)
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">On this page</p>
      <ul className="flex flex-col border-l">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              onClick={() => {
                chosen.current = item.id
                setActive(item.id)
              }}
              aria-current={active === item.id ? "location" : undefined}
              data-active={active === item.id || undefined}
              className={cn(
                "-ml-px flex min-h-target items-center border-l border-transparent py-1 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                "data-active:border-foreground data-active:text-foreground",
                FOCUS_OUTLINE_RESET,
                FOCUS_RING
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
