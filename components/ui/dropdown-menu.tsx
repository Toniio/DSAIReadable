"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"
import { CheckIcon, CaretRightIcon } from "@phosphor-icons/react"

/**
 * The root of a menu that opens from a button and lists actions or choices; use `ContextMenu` for right-click menus.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="outline">Options</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Rename</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

/**
 * Mounts its children outside the current DOM tree for a custom layer; `DropdownMenuContent` already wraps itself in one.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Options</DropdownMenuTrigger>
 *   <DropdownMenuPortal>
 *     <DropdownMenuContent>
 *       <DropdownMenuItem>Rename</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenuPortal>
 * </DropdownMenu>
 */
function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

/**
 * The element that opens the `DropdownMenu`; set `asChild` to make your own `Button` the trigger.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="outline">Options</Button>
 *   </DropdownMenuTrigger>
 * </DropdownMenu>
 */
function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

/**
 * The floating panel that holds the menu's items, aligned to its trigger and matching the trigger's width by default.
 *
 * @example
 * <DropdownMenuContent align="end">
 *   <DropdownMenuItem>Rename</DropdownMenuItem>
 *   <DropdownMenuItem>Duplicate</DropdownMenuItem>
 * </DropdownMenuContent>
 */
function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          `z-popover max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

/**
 * Groups related items inside `DropdownMenuContent` so assistive technology announces them as one set.
 *
 * @example
 * <DropdownMenuGroup>
 *   <DropdownMenuItem>Profile</DropdownMenuItem>
 *   <DropdownMenuItem>Settings</DropdownMenuItem>
 * </DropdownMenuGroup>
 */
function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

/**
 * One action in the menu; set `variant` to `destructive` for an action that removes something, and `inset` to align it with checkable items.
 *
 * @example
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Rename</DropdownMenuItem>
 *   <DropdownMenuItem variant="destructive">Delete project</DropdownMenuItem>
 * </DropdownMenuContent>
 */
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across the items of the menu
        // and marks the focused one with data-highlighted, which the background
        // color below renders. A ring here would double an indicator that already
        // exists.
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive-hover data-[variant=destructive]:focus:text-destructive data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

/**
 * A menu item that toggles one option on or off through `checked`, for choices that can combine.
 *
 * @example
 * <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
 *   Show grid
 * </DropdownMenuCheckboxItem>
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

/**
 * Holds `DropdownMenuRadioItem`s so exactly one is selected; bind it with `value` and `onValueChange`.
 *
 * @example
 * <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
 *   <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
 *   <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
 * </DropdownMenuRadioGroup>
 */
function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

/**
 * A menu item for one exclusive choice inside a `DropdownMenuRadioGroup`, marked with a check when selected.
 *
 * @example
 * <DropdownMenuRadioGroup value="newest">
 *   <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
 * </DropdownMenuRadioGroup>
 */
function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

/**
 * A non-interactive heading that names the group of items below it.
 *
 * @example
 * <DropdownMenuContent>
 *   <DropdownMenuLabel>My account</DropdownMenuLabel>
 *   <DropdownMenuItem>Profile</DropdownMenuItem>
 * </DropdownMenuContent>
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
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
 * A thin line that splits the menu into sets of related items.
 *
 * @example
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Profile</DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem>Sign out</DropdownMenuItem>
 * </DropdownMenuContent>
 */
function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * Shows the keyboard shortcut of an item at its end; it is a hint only and does not bind the keys.
 *
 * @example
 * <DropdownMenuItem>
 *   New project
 *   <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
 * </DropdownMenuItem>
 */
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * The root of a nested menu that opens from an item; pair it with `DropdownMenuSubTrigger` and `DropdownMenuSubContent`.
 *
 * @example
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>Copy link</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 */
function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

/**
 * The item that opens a nested `DropdownMenuSub`; a caret at its end tells the user more choices follow.
 *
 * @example
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>Email</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <CaretRightIcon className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

/**
 * The floating panel of a nested menu, holding the items a `DropdownMenuSubTrigger` opens.
 *
 * @example
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>Copy link</DropdownMenuItem>
 *     <DropdownMenuItem>Email</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 */
function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        `z-popover min-w-24 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-none bg-popover text-popover-foreground shadow-lg ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenu>
export type DropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof DropdownMenuCheckboxItem
>
export type DropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuContent
>
export type DropdownMenuGroupProps = React.ComponentProps<
  typeof DropdownMenuGroup
>
export type DropdownMenuItemProps = React.ComponentProps<
  typeof DropdownMenuItem
>
export type DropdownMenuLabelProps = React.ComponentProps<
  typeof DropdownMenuLabel
>
export type DropdownMenuPortalProps = React.ComponentProps<
  typeof DropdownMenuPortal
>
export type DropdownMenuRadioGroupProps = React.ComponentProps<
  typeof DropdownMenuRadioGroup
>
export type DropdownMenuRadioItemProps = React.ComponentProps<
  typeof DropdownMenuRadioItem
>
export type DropdownMenuSeparatorProps = React.ComponentProps<
  typeof DropdownMenuSeparator
>
export type DropdownMenuShortcutProps = React.ComponentProps<
  typeof DropdownMenuShortcut
>
export type DropdownMenuSubProps = React.ComponentProps<typeof DropdownMenuSub>
export type DropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuSubContent
>
export type DropdownMenuSubTriggerProps = React.ComponentProps<
  typeof DropdownMenuSubTrigger
>
export type DropdownMenuTriggerProps = React.ComponentProps<
  typeof DropdownMenuTrigger
>
