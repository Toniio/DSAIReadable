"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  label: string
}

/** "On this page": the sections of the page, the one in view marked. */
export function PageToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id)

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // A section is current once its heading passes under the header.
      { rootMargin: "0px 0px -70% 0px" }
    )
    for (const element of sections) observer.observe(element)
    return () => observer.disconnect()
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
