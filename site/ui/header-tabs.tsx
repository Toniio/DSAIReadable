"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/site/lib/nav"

/** Whether a section holds the current page. */
export function sectionHolds(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

/**
 * The site's sections, as tabs of the header, from the lg breakpoint; below
 * it, the header's sections menu lists them (SectionsMenu). The current tab
 * is marked with the foreground color: the primary color is under 3:1 on the
 * dark page.
 */
export function HeaderTabs({
  sections,
  className,
}: {
  sections: NavItem[]
  className?: string
}) {
  const pathname = usePathname()
  const nav = useRef<HTMLElement>(null)

  // Text zoomed in can still make the tabs scroll: the current one is kept
  // in view, inside the bar only (scrollIntoView would scroll the page too).
  useEffect(() => {
    const element = nav.current
    const link = element?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!element || !link) return
    const start = link.offsetLeft - element.offsetLeft
    if (
      start < element.scrollLeft ||
      start + link.offsetWidth > element.scrollLeft + element.clientWidth
    )
      element.scrollLeft = start - (element.clientWidth - link.offsetWidth) / 2
  }, [pathname])

  return (
    <nav
      ref={nav}
      aria-label="Sections"
      className={cn("-mb-px min-w-0 overflow-x-auto", className)}
    >
      <ul className="flex items-stretch gap-1">
        {sections.map((section) => {
          const current = sectionHolds(section.href, pathname)
          return (
            <li key={section.href} className="flex">
              <Link
                href={section.href}
                aria-current={current ? "page" : undefined}
                data-active={current || undefined}
                className={cn(
                  "relative inline-flex h-14 items-center border-b border-transparent px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                  "data-active:border-foreground data-active:font-medium data-active:text-foreground",
                  FOCUS_OUTLINE_RESET,
                  FOCUS_RING
                )}
              >
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
