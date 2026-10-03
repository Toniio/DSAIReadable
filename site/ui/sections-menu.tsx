"use client"

import { useState } from "react"
import { ListIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavItem } from "@/site/lib/nav"
import { sectionHolds } from "@/site/ui/header-tabs"
import { SectionNav } from "@/site/ui/section-nav"

/**
 * Below the lg breakpoint, the header has no room for its tabs: this button
 * opens the site's sections in a sheet, on every page, the Overview and the
 * 404 page included. The pages of the current section stay in the page's own
 * menu (MobileNav).
 */
export function SectionsMenu({
  sections,
  className,
}: {
  sections: NavItem[]
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sections"
          className={className}
        >
          <ListIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sections</SheetTitle>
          <SheetDescription>
            The sections of the documentation.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <SectionNav
            groups={[{ items: sections }]}
            label="Sections"
            isCurrent={sectionHolds}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
