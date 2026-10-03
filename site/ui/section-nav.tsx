"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type { NavGroup } from "@/site/lib/nav"

/** The page a link marks as current: its own path, exactly. */
function isPage(href: string, pathname: string): boolean {
  return pathname === href
}

/** The closest ancestor that scrolls vertically: the aside, or a sheet. */
function scroller(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement
  while (parent) {
    const overflow = getComputedStyle(parent).overflowY
    if (overflow === "auto" || overflow === "scroll") return parent
    parent = parent.parentElement
  }
  return null
}

/** The pages of a section, in groups: the left column of every page. */
export function SectionNav({
  groups,
  label,
  onNavigate,
  isCurrent = isPage,
}: {
  groups: NavGroup[]
  label: string
  /** Called when a link is followed: the mobile sheet closes itself. */
  onNavigate?: () => void
  /** Whether a link's page is the current one; its own path by default. */
  isCurrent?: (href: string, pathname: string) => boolean
}) {
  const pathname = usePathname()
  const nav = useRef<HTMLElement>(null)

  // Each page renders its own navigation, which starts at the top: the
  // current page, low in a long list, is scrolled into view, inside the
  // list only (scrollIntoView would scroll the window too).
  useEffect(() => {
    const active = nav.current?.querySelector<HTMLElement>(
      '[aria-current="page"]'
    )
    const box = active ? scroller(active) : null
    if (!active || !box) return
    const item = active.getBoundingClientRect()
    const frame = box.getBoundingClientRect()
    const bottom = Math.min(frame.bottom, window.innerHeight)
    if (item.top < frame.top || item.bottom > bottom)
      box.scrollTop += item.top - frame.top - (bottom - frame.top) / 3
  }, [pathname])

  return (
    <nav ref={nav} aria-label={label} className="flex flex-col gap-6">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label ? (
            <p className="px-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
          ) : null}
          <ul className="flex flex-col">
            {group.items.map((item) => {
              // An anchor of the page is not a page: "On this page" marks the
              // section in view, the navigation marks pages only.
              const current =
                !item.href.includes("#") && isCurrent(item.href, pathname)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    data-active={current || undefined}
                    className={cn(
                      "flex min-h-target items-center justify-between gap-2 border-l border-transparent px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      // The foreground marks the current page: the primary
                      // color is under 3:1 on the dark sidebar accent.
                      "data-active:border-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground",
                      FOCUS_OUTLINE_RESET,
                      FOCUS_RING
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="text-xs text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
