"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { UI_STRINGS } from "@/lib/ui-strings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { MagnifyingGlassIcon, CheckIcon } from "@phosphor-icons/react"

/**
 * A searchable list that filters as the user types, for picking an action or an item from structured options.
 *
 * @example
 * <Command>
 *   <CommandInput placeholder="Search actions" />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *   </CommandList>
 * </Command>
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-none bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

// no-data-slot: CommandDialog renders a Dialog, whose surface keeps its own
// dialog-content slot: CommandItem styles itself in-data-[slot=dialog-content].
/**
 * A `Command` inside a modal, for a command palette opened with a keyboard shortcut; set `title` and `description` to name it.
 *
 * @example
 * <CommandDialog open={open} onOpenChange={setOpen} title="Command palette">
 *   <CommandInput placeholder="Search actions" />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *   </CommandList>
 * </CommandDialog>
 */
function CommandDialog({
  title = UI_STRINGS.command.dialogTitle,
  description = UI_STRINGS.command.dialogDescription,
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-none p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

/**
 * The search field of a `Command`; its text filters the items below it.
 *
 * @example
 * <CommandInput placeholder="Search actions" />
 */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="border-b pb-0">
      <InputGroup className="h-8 border-none border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            // focus-managed: this control sits inside an InputGroup, whose
            // has-[[data-slot=input-group-control]:focus-visible] rule draws the ring
            // around the whole group. A second ring would nest inside the first.
            "w-full text-xs outline-hidden disabled:cursor-not-allowed disabled:opacity-disabled",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

/**
 * The scrollable region of a `Command` that holds the groups, the items and the empty state.
 *
 * @example
 * <CommandList>
 *   <CommandEmpty>No results found.</CommandEmpty>
 *   <CommandGroup heading="Actions">
 *     <CommandItem>New project</CommandItem>
 *   </CommandGroup>
 * </CommandList>
 */
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
        // focus to a control inside it, so a ring on the surface itself would mark
        // something the user cannot act on.
        `no-scrollbar max-h-72 scroll-py-0 overflow-x-hidden overflow-y-auto ${FOCUS_OUTLINE_RESET}`,
        className
      )}
      {...props}
    />
  )
}

/**
 * The message a `Command` shows when no item matches the search; every `Command` renders one.
 *
 * @example
 * <CommandEmpty>No results found.</CommandEmpty>
 */
function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-xs", className)}
      {...props}
    />
  )
}

/**
 * Gathers related `CommandItem`s under a `heading` so the user can scan the results by category.
 *
 * @example
 * <CommandGroup heading="Actions">
 *   <CommandItem>New project</CommandItem>
 *   <CommandItem>Invite a teammate</CommandItem>
 * </CommandGroup>
 */
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * A divider between two `CommandGroup`s that marks a change of category.
 *
 * @example
 * <CommandList>
 *   <CommandGroup heading="Actions">…</CommandGroup>
 *   <CommandSeparator />
 *   <CommandGroup heading="Settings">…</CommandGroup>
 * </CommandList>
 */
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * One selectable result of a `Command`; `onSelect` runs when the user picks it by keyboard or pointer.
 *
 * @example
 * <CommandItem onSelect={() => setOpen(false)}>
 *   New project
 *   <CommandShortcut>⌘N</CommandShortcut>
 * </CommandItem>
 */
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "group/command-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none in-data-[slot=dialog-content]:rounded-none! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

/**
 * A label that shows the keyboard shortcut of a `CommandItem`; it displays the keys and does not bind them.
 *
 * @example
 * <CommandItem>
 *   Invite a teammate
 *   <CommandShortcut>⌘I</CommandShortcut>
 * </CommandItem>
 */
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

export type CommandProps = React.ComponentProps<typeof Command>
export type CommandDialogProps = React.ComponentProps<typeof CommandDialog>
export type CommandEmptyProps = React.ComponentProps<typeof CommandEmpty>
export type CommandGroupProps = React.ComponentProps<typeof CommandGroup>
export type CommandInputProps = React.ComponentProps<typeof CommandInput>
export type CommandItemProps = React.ComponentProps<typeof CommandItem>
export type CommandListProps = React.ComponentProps<typeof CommandList>
export type CommandSeparatorProps = React.ComponentProps<
  typeof CommandSeparator
>
export type CommandShortcutProps = React.ComponentProps<typeof CommandShortcut>
