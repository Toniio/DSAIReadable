"use client"

import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { SURFACE_OUTLINE } from "@/lib/surface"
import { CheckIcon, CaretRightIcon } from "@phosphor-icons/react"

/**
 * A horizontal bar of drop-down menus for the commands of a desktop-style application, such as File, Edit and View.
 *
 * @example
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New file</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 */
function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-none border p-1",
        className
      )}
      {...props}
    />
  )
}

/**
 * One menu of the bar: it pairs a `MenubarTrigger` with the `MenubarContent` that the trigger opens.
 *
 * @example
 * <MenubarMenu>
 *   <MenubarTrigger>Edit</MenubarTrigger>
 *   <MenubarContent>
 *     <MenubarItem>Undo</MenubarItem>
 *   </MenubarContent>
 * </MenubarMenu>
 */
function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

/**
 * Groups related `MenubarItem`s inside a menu so that assistive technology reads them together.
 *
 * @example
 * <MenubarGroup>
 *   <MenubarItem>Cut</MenubarItem>
 *   <MenubarItem>Copy</MenubarItem>
 *   <MenubarItem>Paste</MenubarItem>
 * </MenubarGroup>
 */
function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

/**
 * Renders menu content in a portal outside its parent, which `MenubarContent` already does for you.
 *
 * @example
 * <MenubarPortal>
 *   <MenubarContent>
 *     <MenubarItem>Open recent</MenubarItem>
 *   </MenubarContent>
 * </MenubarPortal>
 */
function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

/**
 * Groups `MenubarRadioItem`s into one exclusive choice, controlled through `value` and `onValueChange`.
 *
 * @example
 * <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
 *   <MenubarRadioItem value="fit">Fit to window</MenubarRadioItem>
 *   <MenubarRadioItem value="full">Actual size</MenubarRadioItem>
 * </MenubarRadioGroup>
 */
function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

/**
 * The button in the bar that opens its menu; its label names the set of commands, such as File.
 *
 * @example
 * <MenubarMenu>
 *   <MenubarTrigger>View</MenubarTrigger>
 *   <MenubarContent>
 *     <MenubarItem>Zoom in</MenubarItem>
 *   </MenubarContent>
 * </MenubarMenu>
 */
function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        `flex items-center rounded-none px-1.5 py-1 text-xs font-medium ${FOCUS_OUTLINE_RESET} ${FOCUS_RING} select-none hover:bg-muted aria-expanded:bg-muted`,
        className
      )}
      {...props}
    />
  )
}

/**
 * The floating list of a menu, which holds its items, groups, labels and separators.
 *
 * @example
 * <MenubarContent>
 *   <MenubarItem>Save</MenubarItem>
 *   <MenubarItem>Save as</MenubarItem>
 * </MenubarContent>
 */
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          `z-popover min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-none bg-popover text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95`,
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

/**
 * A command in a menu; set `variant="destructive"` for an irreversible action.
 *
 * @example
 * <MenubarItem variant="destructive">Delete project</MenubarItem>
 */
function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "group/menubar-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

/**
 * A menu item that turns an option on or off and shows a check mark while it is on.
 *
 * @example
 * <MenubarCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
 *   Show grid
 * </MenubarCheckboxItem>
 */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-2 pl-8 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

/**
 * One option of a `MenubarRadioGroup`, marked with a check when it is the selected one.
 *
 * @example
 * <MenubarRadioGroup value="fit">
 *   <MenubarRadioItem value="fit">Fit to window</MenubarRadioItem>
 * </MenubarRadioGroup>
 */
function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-2 pl-8 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

/**
 * A non-interactive caption that names the section of items below it.
 *
 * @example
 * <MenubarContent>
 *   <MenubarLabel>Recent files</MenubarLabel>
 *   <MenubarItem>Quarterly report</MenubarItem>
 * </MenubarContent>
 */
function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-2 text-xs data-inset:pl-8", className)}
      {...props}
    />
  )
}

/**
 * A thin line that divides sets of unrelated commands inside a menu.
 *
 * @example
 * <MenubarContent>
 *   <MenubarItem>Save</MenubarItem>
 *   <MenubarSeparator />
 *   <MenubarItem>Close window</MenubarItem>
 * </MenubarContent>
 */
function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * Shows the keyboard shortcut of a `MenubarItem`; wire a real handler for every shortcut it displays.
 *
 * @example
 * <MenubarItem>
 *   New window
 *   <MenubarShortcut>⌘N</MenubarShortcut>
 * </MenubarItem>
 */
function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * Wraps a nested submenu: it pairs a `MenubarSubTrigger` with the `MenubarSubContent` it opens.
 *
 * @example
 * <MenubarSub>
 *   <MenubarSubTrigger>Share</MenubarSubTrigger>
 *   <MenubarSubContent>
 *     <MenubarItem>Email link</MenubarItem>
 *   </MenubarSubContent>
 * </MenubarSub>
 */
function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

/**
 * The menu item that opens a submenu and shows a caret; keep nesting to two levels at most.
 *
 * @example
 * <MenubarSub>
 *   <MenubarSubTrigger>Export</MenubarSubTrigger>
 *   <MenubarSubContent>
 *     <MenubarItem>As PDF</MenubarItem>
 *   </MenubarSubContent>
 * </MenubarSub>
 */
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
        // focus to a control inside it, so a ring on the surface itself would mark
        // something the user cannot act on.
        `flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs ${FOCUS_OUTLINE_RESET} select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4`,
        className
      )}
      {...props}
    >
      {children}
      <CaretRightIcon className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

/**
 * The floating list of a submenu, opened by its `MenubarSubTrigger`.
 *
 * @example
 * <MenubarSubContent>
 *   <MenubarItem>As PDF</MenubarItem>
 *   <MenubarItem>As image</MenubarItem>
 * </MenubarSubContent>
 */
function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        `z-popover min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-none bg-popover text-popover-foreground shadow-lg ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}

export type MenubarProps = React.ComponentProps<typeof Menubar>
export type MenubarCheckboxItemProps = React.ComponentProps<
  typeof MenubarCheckboxItem
>
export type MenubarContentProps = React.ComponentProps<typeof MenubarContent>
export type MenubarGroupProps = React.ComponentProps<typeof MenubarGroup>
export type MenubarItemProps = React.ComponentProps<typeof MenubarItem>
export type MenubarLabelProps = React.ComponentProps<typeof MenubarLabel>
export type MenubarMenuProps = React.ComponentProps<typeof MenubarMenu>
export type MenubarPortalProps = React.ComponentProps<typeof MenubarPortal>
export type MenubarRadioGroupProps = React.ComponentProps<
  typeof MenubarRadioGroup
>
export type MenubarRadioItemProps = React.ComponentProps<
  typeof MenubarRadioItem
>
export type MenubarSeparatorProps = React.ComponentProps<
  typeof MenubarSeparator
>
export type MenubarShortcutProps = React.ComponentProps<typeof MenubarShortcut>
export type MenubarSubProps = React.ComponentProps<typeof MenubarSub>
export type MenubarSubContentProps = React.ComponentProps<
  typeof MenubarSubContent
>
export type MenubarSubTriggerProps = React.ComponentProps<
  typeof MenubarSubTrigger
>
export type MenubarTriggerProps = React.ComponentProps<typeof MenubarTrigger>
