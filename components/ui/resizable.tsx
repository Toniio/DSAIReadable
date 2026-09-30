"use client"

import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focus"

import type { ComponentProps } from "react"
/**
 * The container that lays out `ResizablePanel`s in a row or a column; set `orientation` to choose the direction.
 *
 * @example
 * <ResizablePanelGroup orientation="horizontal">
 *   <ResizablePanel defaultSize="30%" minSize="20%">Files</ResizablePanel>
 *   <ResizableHandle />
 *   <ResizablePanel minSize="30%">Editor</ResizablePanel>
 * </ResizablePanelGroup>
 */
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      // allow-raw: resize-hit-target — the library sizes the handle's hit area in px, not CSS: 24 is size.target.min
      resizeTargetMinimumSize={{ coarse: 24, fine: 24 }}
      {...props}
    />
  )
}

/**
 * One section of a `ResizablePanelGroup` that the user grows or shrinks; give it a `minSize` so its content is never crushed.
 *
 * @example
 * <ResizablePanel defaultSize="25%" minSize="15%">
 *   Sidebar
 * </ResizablePanel>
 */
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

/**
 * The draggable divider between two `ResizablePanel`s, reachable by keyboard; set `withHandle` to show a grip.
 *
 * @example
 * <ResizablePanelGroup orientation="horizontal">
 *   <ResizablePanel minSize="20%">Navigation</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel minSize="20%">Content</ResizablePanel>
 * </ResizablePanelGroup>
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        `relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 ${FOCUS_RING} focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90`,
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-dropdown flex h-6 w-1 shrink-0 rounded-none bg-border" />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }

export type ResizableHandleProps = ComponentProps<typeof ResizableHandle>
export type ResizablePanelProps = ComponentProps<typeof ResizablePanel>
export type ResizablePanelGroupProps = ComponentProps<
  typeof ResizablePanelGroup
>
