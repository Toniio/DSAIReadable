"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

/**
 * The root of a stack of collapsible sections; set `type` to `single` or `multiple` to decide how many stay open.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="shipping">
 *     <AccordionTrigger>Shipping</AccordionTrigger>
 *     <AccordionContent>Orders leave our warehouse within two days.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

/**
 * One section of an `Accordion`, pairing a trigger with its content through a unique `value`.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="returns">
 *     <AccordionTrigger>Returns</AccordionTrigger>
 *     <AccordionContent>You can return any item within 30 days.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

/**
 * The text button that expands or collapses its `AccordionItem`; always give it a visible label, never an icon alone.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="billing">
 *     <AccordionTrigger>How does billing work?</AccordionTrigger>
 *     <AccordionContent>You are billed on the first of each month.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          `group/accordion-trigger relative flex flex-1 items-start justify-between rounded-none border border-transparent py-2.5 text-left text-xs font-medium transition-all ${FOCUS_OUTLINE_RESET} hover:underline ${FOCUS_RING} focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-disabled **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground`,
          className
        )}
        {...props}
      >
        {children}
        <CaretDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <CaretUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * The panel an `AccordionTrigger` reveals, holding the detail a reader opens on demand.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="privacy">
 *     <AccordionTrigger>Who can see my data?</AccordionTrigger>
 *     <AccordionContent>Only the people you invite to your workspace.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-xs data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--radix-accordion-content-height) pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

export type AccordionProps = React.ComponentProps<typeof Accordion>
export type AccordionContentProps = React.ComponentProps<
  typeof AccordionContent
>
export type AccordionItemProps = React.ComponentProps<typeof AccordionItem>
export type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionTrigger
>
