"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"

/**
 * The root of a floating panel opened by a click, for rich content such as a form or a picker that keeps the user in context.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="outline">Rename</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverTitle>Rename project</PopoverTitle>
 *   </PopoverContent>
 * </Popover>
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

/**
 * The element that opens the `Popover` on click; pass `asChild` to use your own `Button`.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="outline">Add a note</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>Write a note for your team.</PopoverContent>
 * </Popover>
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/**
 * The floating surface of a `Popover`, placed beside its trigger with `align` and `sideOffset`.
 *
 * @example
 * <PopoverContent align="start">
 *   <PopoverHeader>
 *     <PopoverTitle>Add a note</PopoverTitle>
 *   </PopoverHeader>
 * </PopoverContent>
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
          // focus to a control inside it, so a ring on the surface itself would mark
          // something the user cannot act on.
          `z-popover flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-none bg-popover p-2.5 text-xs text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 outline-hidden duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/**
 * Anchors the `PopoverContent` to an element other than its trigger.
 *
 * @example
 * <Popover>
 *   <PopoverAnchor asChild>
 *     <div>Invoice 1042</div>
 *   </PopoverAnchor>
 *   <PopoverTrigger asChild>
 *     <Button size="sm">Details</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>Paid on March 3.</PopoverContent>
 * </Popover>
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

/**
 * Groups the `PopoverTitle` and `PopoverDescription` at the top of the panel.
 *
 * @example
 * <PopoverHeader>
 *   <PopoverTitle>Dimensions</PopoverTitle>
 *   <PopoverDescription>Set the size of the layer.</PopoverDescription>
 * </PopoverHeader>
 */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-xs", className)}
      {...props}
    />
  )
}

// A real heading, so screen readers list it; the level follows the page
// outline, the look does not.
/**
 * The heading of a `Popover`; set `as` from the real heading hierarchy, because it renders an `h2` by default.
 *
 * @example
 * <PopoverTitle as="h3">Share this file</PopoverTitle>
 */
function PopoverTitle({
  className,
  as: Comp = "h2",
  ...props
}: React.ComponentProps<"h2"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}) {
  return (
    <Comp
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

/**
 * A supporting sentence under the `PopoverTitle` that says what the panel is for.
 *
 * @example
 * <PopoverDescription>Anyone with the link can view this file.</PopoverDescription>
 */
function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}

export type PopoverProps = React.ComponentProps<typeof Popover>
export type PopoverAnchorProps = React.ComponentProps<typeof PopoverAnchor>
export type PopoverContentProps = React.ComponentProps<typeof PopoverContent>
export type PopoverDescriptionProps = React.ComponentProps<
  typeof PopoverDescription
>
export type PopoverHeaderProps = React.ComponentProps<typeof PopoverHeader>
export type PopoverTitleProps = React.ComponentProps<typeof PopoverTitle>
export type PopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>
