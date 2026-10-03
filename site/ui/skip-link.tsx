"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { FOCUS_BORDERLESS } from "@/site/ui/link"

/**
 * "Skip to content", the first tab stop of every page. next/link handles a
 * hash on the client and leaves focus on the link: the click moves focus to
 * <main id="main"> (tabIndex -1) itself, so the next Tab starts in the content.
 */
export function SkipLink() {
  return (
    <Link
      href="#main"
      onClick={(event) => {
        const main = document.getElementById("main")
        if (!main) return
        event.preventDefault()
        main.focus()
      }}
      className={cn(
        "sr-only bg-background text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:px-3 focus:py-2",
        FOCUS_BORDERLESS
      )}
    >
      Skip to content
    </Link>
  )
}
