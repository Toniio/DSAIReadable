"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * A set of radio buttons for picking exactly one of two to five options, all visible at once; use `Select` beyond that.
 *
 * @example
 * <RadioGroup defaultValue="standard">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="standard" id="standard" />
 *     <Label htmlFor="standard">Standard delivery</Label>
 *   </div>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="express" id="express" />
 *     <Label htmlFor="express">Express delivery</Label>
 *   </div>
 * </RadioGroup>
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

/**
 * One option of a `RadioGroup`, identified by its `value`; tie it to a `Label` so its name is announced.
 *
 * @example
 * <RadioGroup defaultValue="monthly">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="monthly" id="monthly" />
 *     <Label htmlFor="monthly">Billed monthly</Label>
 *   </div>
 * </RadioGroup>
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input ${FOCUS_OUTLINE_RESET} group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 group-has-[:focus-visible]/field-label:data-checked:border-primary ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary`,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }

export type RadioGroupProps = React.ComponentProps<typeof RadioGroup>
export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupItem>
