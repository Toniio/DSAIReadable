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
import type { NavGroup } from "@/site/lib/nav"
import { SectionNav } from "@/site/ui/section-nav"

/** Below the lg breakpoint, the section's pages open in a sheet. */
export function MobileNav({
  groups,
  label,
}: {
  groups: NavGroup[]
  label: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ListIcon />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>The pages of this section.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <SectionNav
            groups={groups}
            label={label}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
