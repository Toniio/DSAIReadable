"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * A container with styled scrollbars for content that outgrows a parent of defined height, such as a menu or a side panel.
 *
 * @example
 * <ScrollArea className="h-72">
 *   <p>Release notes go here.</p>
 * </ScrollArea>
 */
function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      {/* The viewport is what scrolls: in the tab order, the keyboard reaches
          it even when it holds nothing focusable (WCAG 2.1.1). Chromium and
          Firefox do this on their own; Safari does not. */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        tabIndex={0}
        className={`size-full rounded-[inherit] transition-[color,box-shadow] ${FOCUS_OUTLINE_RESET} ${FOCUS_RING} focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid`}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

/**
 * The scrollbar of a `ScrollArea`; add one with `orientation="horizontal"` to let wide content scroll sideways.
 *
 * @example
 * <ScrollArea className="w-96">
 *   <div>Wide content</div>
 *   <ScrollBar orientation="horizontal" />
 * </ScrollArea>
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-none bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }

export type ScrollAreaProps = React.ComponentProps<typeof ScrollArea>
export type ScrollBarProps = React.ComponentProps<typeof ScrollBar>
