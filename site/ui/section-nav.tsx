"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type { NavGroup } from "@/site/lib/nav"

/** The pages of a section, in groups: the left column of every page. */
export function SectionNav({
  groups,
  label,
  onNavigate,
}: {
  groups: NavGroup[]
  label: string
  /** Called when a link is followed: the mobile sheet closes itself. */
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label={label} className="flex flex-col gap-6">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label ? (
            <p className="px-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
          ) : null}
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const current = pathname === item.href.split("#")[0]
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    data-active={current || undefined}
                    className={cn(
                      "flex min-h-target items-center justify-between gap-2 border-l border-transparent px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "data-active:border-primary data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground",
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
