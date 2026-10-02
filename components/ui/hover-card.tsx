"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"

/**
 * The root of a preview that appears when the pointer rests on a trigger, for extra information the user can do without.
 *
 * @example
 * <HoverCard>
 *   <HoverCardTrigger asChild>
 *     <a href="/team/maria">Maria Lopez</a>
 *   </HoverCardTrigger>
 *   <HoverCardContent>…</HoverCardContent>
 * </HoverCard>
 */
function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

/**
 * The element whose hover or focus opens the `HoverCard`; pass `asChild` to keep your own link.
 *
 * @example
 * <HoverCardTrigger asChild>
 *   <a href="/team/maria">Maria Lopez</a>
 * </HoverCardTrigger>
 */
function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

/**
 * The floating preview of a `HoverCard`; it holds read-only supplementary content, and `align` and `sideOffset` place it.
 *
 * @example
 * <HoverCardContent align="start">
 *   <p>Maria leads the design team and joined in 2021.</p>
 * </HoverCardContent>
 */
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
          // focus-managed: Radix HoverCard mounts no focus scope: the card opens from
          // its trigger (hover or focus) and takes no focus itself, so there is no
          // focused surface to mark. A control inside it is reached with Tab and
          // draws its own ring.
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
