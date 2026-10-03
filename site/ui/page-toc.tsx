"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  label: string
}

/**
 * The section being read: the last one whose top has passed under the
 * header, or the last of the page once the bottom is reached.
 */
function current(items: TocItem[]): string | undefined {
  const line = window.innerHeight * 0.25
  let found = items[0]?.id
  for (const item of items) {
    const element = document.getElementById(item.id)
    if (element && element.getBoundingClientRect().top <= line) found = item.id
  }
  const bottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2
  return bottom ? items.at(-1)?.id : found
}

/** "On this page": the sections of the page, the one being read marked. */
export function PageToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setActive(current(items)))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
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
