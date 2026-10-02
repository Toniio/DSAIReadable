"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING_WITHIN } from "@/lib/focus"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { CaretDownIcon, XIcon, CheckIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
import { SURFACE_OUTLINE } from "@/lib/surface"

// no-data-slot: Combobox is the Root, which renders no element of its own - it
// is a context provider, like DirectionProvider. Its parts carry theirs.
/**
 * The root that holds the state of a searchable list, for more than 15 options or when the user needs to search.
 *
 * @example
 * <Combobox items={countries}>
 *   <ComboboxInput placeholder="Select a country" />
 *   <ComboboxContent>
 *     <ComboboxEmpty>No countries found.</ComboboxEmpty>
 *     <ComboboxList>
 *       {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 */
const Combobox = ComboboxPrimitive.Root

/**
 * Shows the selected value inside a custom trigger, when the list opens from a button instead of the input.
 *
 * @example
 * <Combobox items={countries}>
 *   <ComboboxTrigger>
 *     <ComboboxValue />
 *   </ComboboxTrigger>
 * </Combobox>
 */
function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

/**
 * The button that opens the list when the input is not the way in; it names itself through `triggerLabel` when it has no text.
 *
 * @example
 * <Combobox items={countries}>
 *   <ComboboxTrigger triggerLabel="Show countries" />
 * </Combobox>
 */
function ComboboxTrigger({
  className,
  children,
  triggerLabel = UI_STRINGS.combobox.trigger,
  ...props
}: ComboboxPrimitive.Trigger.Props & { triggerLabel?: string }) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label={children ? undefined : triggerLabel}
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <CaretDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({
  className,
  clearLabel = UI_STRINGS.combobox.clear,
  ...props
}: ComboboxPrimitive.Clear.Props & { clearLabel?: string }) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      aria-label={clearLabel}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

/**
 * The text field that filters the list as the user types; set `showClear` when a single value may be emptied.
 *
 * @example
 * <Combobox items={countries}>
 *   <ComboboxInput placeholder="Select a country" showClear />
 * </Combobox>
 */
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  triggerLabel,
  clearLabel,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
  triggerLabel?: string
  clearLabel?: string
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger triggerLabel={triggerLabel} />
          </InputGroupButton>
        )}
        {showClear && (
          <ComboboxClear disabled={disabled} clearLabel={clearLabel} />
        )}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

/**
 * The popup that holds the list, placed against its anchor; pass `anchor` from `useComboboxAnchor` when chips are the input.
 *
 * @example
 * <Combobox multiple items={countries}>
 *   <ComboboxContent anchor={anchor}>
 *     <ComboboxList>
 *       {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-popover"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            // allow-raw: anchor-relative-width — --anchor-width is measured by Base UI at open
            // time; the popup must clear the trigger plus room for the clear and chevron
            // buttons. Only the buttons' width is a token.
            `group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+var(--space-scale-7))] origin-(--transform-origin) overflow-hidden rounded-none bg-popover text-popover-foreground shadow-md ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/**
 * The scrolling list of options inside the popup, which takes a render function that maps the items of the `Combobox`.
 *
 * @example
 * <ComboboxContent>
 *   <ComboboxList>
 *     {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
 *   </ComboboxList>
 * </ComboboxContent>
 */
function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        // allow-raw: anchor-relative-height — the list stops at the shorter of a fixed
        // ceiling and the space Base UI measured below the trigger, both less the sticky
        // input. The comparison is the behavior; a token cannot express it.
        "no-scrollbar max-h-[min(calc(var(--space-scale-72)-var(--space-scale-9)),calc(var(--available-height)-var(--space-scale-9)))] scroll-py-1 overflow-y-auto overscroll-contain data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * One selectable option in the list, with a check mark when it is selected; give each a unique `value`.
 *
 * @example
 * <ComboboxList>
 *   {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
 * </ComboboxList>
 */
function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        // focus-managed: Radix moves a roving tabindex across these items and marks
        // the current one with focus/data-highlighted, which the background color
        // below renders. A ring here would double an indicator that already exists.
        "relative flex w-full cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

/**
 * Gathers related options of the list under one `ComboboxLabel`, so a long list reads in sections.
 *
 * @example
 * <ComboboxList>
 *   {(group) => (
 *     <ComboboxGroup key={group.label} items={group.items}>
 *       <ComboboxLabel>{group.label}</ComboboxLabel>
 *     </ComboboxGroup>
 *   )}
 * </ComboboxList>
 */
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

/**
 * The heading that names the `ComboboxGroup` of options below it.
 *
 * @example
 * <ComboboxGroup items={group.items}>
 *   <ComboboxLabel>Europe</ComboboxLabel>
 * </ComboboxGroup>
 */
function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Renders the options of one `ComboboxGroup` from its own items, when the list is grouped.
 *
 * @example
 * <ComboboxGroup items={group.items}>
 *   <ComboboxLabel>{group.label}</ComboboxLabel>
 *   <ComboboxCollection>
 *     {(item) => <ComboboxItem value={item}>{item}</ComboboxItem>}
 *   </ComboboxCollection>
 * </ComboboxGroup>
 */
function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

/**
 * The message shown when the filter matches no option; render one in every `Combobox`.
 *
 * @example
 * <ComboboxContent>
 *   <ComboboxEmpty>No countries found.</ComboboxEmpty>
 * </ComboboxContent>
 */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-xs text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}

/**
 * A rule between two groups of options in the list.
 *
 * @example
 * <ComboboxList>
 *   <ComboboxGroup items={first}>{renderFirst}</ComboboxGroup>
 *   <ComboboxSeparator />
 *   <ComboboxGroup items={second}>{renderSecond}</ComboboxGroup>
 * </ComboboxList>
 */
function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * The field that holds the chips of a multiple selection and their input; give its ref to `useComboboxAnchor`.
 *
 * @example
 * <Combobox multiple items={countries}>
 *   <ComboboxChips ref={anchor}>
 *     <ComboboxChipsInput placeholder="Add a country" />
 *   </ComboboxChips>
 * </Combobox>
 */
function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        `flex min-h-8 flex-wrap items-center gap-1 rounded-none border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-xs transition-colors ${FOCUS_RING_WITHIN} has-aria-invalid:border-destructive has-aria-invalid:ring-(length:--space-focus-ring-width) has-aria-invalid:ring-destructive/20 has-aria-invalid:focus-within:outline-(length:--border-width-default) has-aria-invalid:focus-within:outline-destructive has-aria-invalid:focus-within:outline-solid has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  )
}

/**
 * One selected value of a multiple selection, with a button that removes it; pass `removeLabel` when its children are not the item's text.
 *
 * @example
 * <ComboboxChips ref={anchor}>
 *   <ComboboxChip>Canada</ComboboxChip>
 *   <ComboboxChipsInput />
 * </ComboboxChips>
 */
function ComboboxChip({
  className,
  children,
  showRemove = true,
  removeLabel,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
  removeLabel?: string
}) {
  // Every chip's button has to say which item it removes, or a screen reader
  // hears a row of identical "Remove" buttons. Text children name it from the
  // first render; any other children are read from the rendered chip.
  const removeRef = React.useRef<HTMLButtonElement>(null)
  const [renderedText, setRenderedText] = React.useState<string>()
  const text =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined
  React.useEffect(() => {
    if (text !== undefined) return
    setRenderedText(
      removeRef.current?.parentElement?.textContent?.trim() || undefined
    )
  }, [text, children])
  const item = text ?? renderedText
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-5.25 w-fit items-center justify-center gap-1 rounded-none bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-disabled has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          ref={removeRef}
          render={<Button variant="ghost" size="icon-xs" />}
          aria-label={
            removeLabel ??
            (item === undefined ? undefined : UI_STRINGS.combobox.remove(item))
          }
          className="-ml-1 text-muted-foreground"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

/**
 * The text field inside `ComboboxChips` that filters the list while chips are shown.
 *
 * @example
 * <ComboboxChips ref={anchor}>
 *   <ComboboxChipsInput placeholder="Add a country" />
 * </ComboboxChips>
 */
function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn(
        // focus-managed: this control sits inside an InputGroup, whose
        // has-[[data-slot=input-group-control]:focus-visible] rule draws the
        // ring around the whole group. A second ring would nest inside the first.
        `min-w-16 flex-1 ${FOCUS_OUTLINE_RESET} placeholder:text-muted-foreground`,
        className
      )}
      {...props}
    />
  )
}

/**
 * Returns the ref that ties the popup of a multiple selection to its chips, so the list opens below them.
 *
 * @example
 * const anchor = useComboboxAnchor()
 */
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}

export type ComboboxProps = React.ComponentProps<typeof Combobox>
export type ComboboxChipProps = React.ComponentProps<typeof ComboboxChip>
export type ComboboxChipsProps = React.ComponentProps<typeof ComboboxChips>
export type ComboboxChipsInputProps = React.ComponentProps<
  typeof ComboboxChipsInput
>
export type ComboboxCollectionProps = React.ComponentProps<
  typeof ComboboxCollection
>
export type ComboboxContentProps = React.ComponentProps<typeof ComboboxContent>
export type ComboboxEmptyProps = React.ComponentProps<typeof ComboboxEmpty>
export type ComboboxGroupProps = React.ComponentProps<typeof ComboboxGroup>
export type ComboboxInputProps = React.ComponentProps<typeof ComboboxInput>
export type ComboboxItemProps = React.ComponentProps<typeof ComboboxItem>
export type ComboboxLabelProps = React.ComponentProps<typeof ComboboxLabel>
export type ComboboxListProps = React.ComponentProps<typeof ComboboxList>
export type ComboboxSeparatorProps = React.ComponentProps<
  typeof ComboboxSeparator
>
export type ComboboxTriggerProps = React.ComponentProps<typeof ComboboxTrigger>
export type ComboboxValueProps = React.ComponentProps<typeof ComboboxValue>
