"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
          // focus to a control inside it, so a ring on the surface itself would mark
          // something the user cannot act on.
          `z-popover w-64 origin-(--radix-hover-card-content-transform-origin) rounded-none bg-popover p-2.5 text-xs/relaxed text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 outline-hidden duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

export type HoverCardProps = React.ComponentProps<typeof HoverCard>
export type HoverCardContentProps = React.ComponentProps<
  typeof HoverCardContent
>
export type HoverCardTriggerProps = React.ComponentProps<
  typeof HoverCardTrigger
>
