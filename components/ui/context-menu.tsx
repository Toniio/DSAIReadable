"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react"

/**
 * The root of a right-click menu: wraps a `ContextMenuTrigger` and a `ContextMenuContent` and holds their open state.
 *
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger>Right-click this card</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Copy link</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/**
 * The area that opens the `ContextMenu` on a right-click, which is the element the menu's actions apply to.
 *
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger>Project notes</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Rename</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
function ContextMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  )
}

/**
 * Groups related items of a `ContextMenu` so assistive technology announces them together.
 *
 * @example
 * <ContextMenuGroup>
 *   <ContextMenuItem>Cut</ContextMenuItem>
 *   <ContextMenuItem>Copy</ContextMenuItem>
 * </ContextMenuGroup>
 */
function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

/**
 * Renders its children outside the DOM hierarchy of the menu, for content that must escape a clipping ancestor.
 *
 * @example
 * <ContextMenuPortal>
 *   <ContextMenuSubContent>
 *     <ContextMenuItem>Share by email</ContextMenuItem>
 *   </ContextMenuSubContent>
 * </ContextMenuPortal>
 */
function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

/**
 * The root of a nested menu inside a `ContextMenu`: pairs a `ContextMenuSubTrigger` with a `ContextMenuSubContent`.
 *
 * @example
 * <ContextMenuSub>
 *   <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
 *   <ContextMenuSubContent>
 *     <ContextMenuItem>Copy link</ContextMenuItem>
 *   </ContextMenuSubContent>
 * </ContextMenuSub>
 */
function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

/**
 * Holds the `value` of a set of `ContextMenuRadioItem`s so that exactly one option is selected.
 *
 * @example
 * <ContextMenuRadioGroup value={view} onValueChange={setView}>
 *   <ContextMenuRadioItem value="list">List view</ContextMenuRadioItem>
 *   <ContextMenuRadioItem value="grid">Grid view</ContextMenuRadioItem>
 * </ContextMenuRadioGroup>
 */
function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

/**
 * The floating panel of a `ContextMenu` that lists the actions for the targeted element.
 *
 * @example
 * <ContextMenuContent>
 *   <ContextMenuItem>Copy</ContextMenuItem>
 *   <ContextMenuItem>Paste</ContextMenuItem>
 * </ContextMenuContent>
 */
function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          `z-popover max-h-(--radix-context-menu-content-available-height) min-w-36 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

/**
 * A plain action in a `ContextMenu`; use `variant="destructive"` for an action that removes something.
 *
 * @example
 * <ContextMenuItem variant="destructive">Delete file</ContextMenuItem>
 */
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across the items of the menu
        // and marks the focused one with data-highlighted, which the background
        // color below renders. A ring here would double an indicator that already
        // exists.
        "group/context-menu-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

/**
 * The item that opens a submenu, shown with an arrow at its end; use it to keep a long list of actions short.
 *
 * @example
 * <ContextMenuSub>
 *   <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
 *   <ContextMenuSubContent>
 *     <ContextMenuItem>Archive</ContextMenuItem>
 *   </ContextMenuSubContent>
 * </ContextMenuSub>
 */
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <CaretRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

/**
 * The panel of a submenu, opened by its `ContextMenuSubTrigger`, that lists the nested actions.
 *
 * @example
 * <ContextMenuSubContent>
 *   <ContextMenuItem>Export as PDF</ContextMenuItem>
 *   <ContextMenuItem>Export as CSV</ContextMenuItem>
 * </ContextMenuSubContent>
 */
function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "z-popover min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-none border bg-popover text-popover-foreground shadow-lg duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

/**
 * An item in a `ContextMenu` that turns one option on or off and shows a check while it is on.
 *
 * @example
 * <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
 *   Show grid
 * </ContextMenuCheckboxItem>
 */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

/**
 * One choice among several exclusive options in a `ContextMenuRadioGroup`, marked with a check when selected.
 *
 * @example
 * <ContextMenuRadioGroup value="name">
 *   <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
 *   <ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
 * </ContextMenuRadioGroup>
 */
function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

/**
 * A non-interactive heading that names the section of items below it in a `ContextMenu`.
 *
 * @example
 * <ContextMenuLabel>Arrange</ContextMenuLabel>
 */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2 py-2 text-xs text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

/**
 * A thin rule that splits a `ContextMenu` into groups of related actions.
 *
 * @example
 * <ContextMenuItem>Duplicate</ContextMenuItem>
 * <ContextMenuSeparator />
 * <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
 */
function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * The keyboard shortcut of an item, pushed to the end of its row so people learn the faster route.
 *
 * @example
 * <ContextMenuItem>
 *   Copy
 *   <ContextMenuShortcut>⌘C</ContextMenuShortcut>
 * </ContextMenuItem>
 */
function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}

export type ContextMenuProps = React.ComponentProps<typeof ContextMenu>
export type ContextMenuCheckboxItemProps = React.ComponentProps<
  typeof ContextMenuCheckboxItem
>
export type ContextMenuContentProps = React.ComponentProps<
  typeof ContextMenuContent
>
export type ContextMenuGroupProps = React.ComponentProps<
  typeof ContextMenuGroup
>
export type ContextMenuItemProps = React.ComponentProps<typeof ContextMenuItem>
export type ContextMenuLabelProps = React.ComponentProps<
  typeof ContextMenuLabel
>
export type ContextMenuPortalProps = React.ComponentProps<
  typeof ContextMenuPortal
>
export type ContextMenuRadioGroupProps = React.ComponentProps<
  typeof ContextMenuRadioGroup
>
export type ContextMenuRadioItemProps = React.ComponentProps<
  typeof ContextMenuRadioItem
>
export type ContextMenuSeparatorProps = React.ComponentProps<
  typeof ContextMenuSeparator
>
export type ContextMenuShortcutProps = React.ComponentProps<
  typeof ContextMenuShortcut
>
export type ContextMenuSubProps = React.ComponentProps<typeof ContextMenuSub>
export type ContextMenuSubContentProps = React.ComponentProps<
  typeof ContextMenuSubContent
>
export type ContextMenuSubTriggerProps = React.ComponentProps<
  typeof ContextMenuSubTrigger
>
export type ContextMenuTriggerProps = React.ComponentProps<
  typeof ContextMenuTrigger
>
