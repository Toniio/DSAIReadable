"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/site/lib/nav"

/** Whether a tab's section holds the current page. */
function isCurrent(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

/** The site's sections, as tabs of the header. */
export function HeaderTabs({ sections }: { sections: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Sections" className="-mb-px flex min-w-0 overflow-x-auto">
      <ul className="flex items-stretch gap-1">
        {sections.map((section) => {
          const current = isCurrent(section.href, pathname)
          return (
            <li key={section.href} className="flex">
              <Link
                href={section.href}
                aria-current={current ? "page" : undefined}
                data-active={current || undefined}
                className={cn(
                  "relative inline-flex h-14 items-center border-b border-transparent px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                  "data-active:border-primary data-active:font-medium data-active:text-foreground",
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
