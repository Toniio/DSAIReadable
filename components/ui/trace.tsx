import * as React from "react"

import { cn } from "@/lib/cn"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CaretRightIcon } from "@phosphor-icons/react"

/**
 * The list of every step an assistant takes, one line each, a finished step with nothing to open included; it also styles a link or a dialog trigger that wraps a `TraceLine`.
 *
 * @example
 * <Trace>
 *   <TraceLine>
 *     <TraceIcon>
 *       <MagnifyingGlassIcon />
 *     </TraceIcon>
 *     <TraceTitle>Searched the docs for cache keys</TraceTitle>
 *   </TraceLine>
 * </Trace>
 */
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-item *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-hidden *:has-[>[data-slot=trace-line]]:focus-visible:ring-(length:--space-focus-ring-width) *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50 *:has-[>[data-slot=trace-line]]:focus-visible:outline-(length:--border-width-default) *:has-[>[data-slot=trace-line]]:focus-visible:outline-ring *:has-[>[data-slot=trace-line]]:focus-visible:outline-solid",
        className
      )}
      {...props}
    />
  )
}

/**
 * One step: an icon and a one-line title that says what happened; `status` marks it `running`, `error` or `pending`, and the title says so too.
 *
 * @example
 * <Trace>
 *   <TraceLine status="running">
 *     <TraceIcon>
 *       <TerminalIcon />
 *     </TraceIcon>
 *     <TraceTitle>Running npm test</TraceTitle>
 *   </TraceLine>
 * </Trace>
 */
function TraceLine({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> & {
  status?: "running" | "error" | "pending"
}) {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-ui text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=running]:*:data-[slot=trace-title]:shimmer",
        className
      )}
      {...props}
    />
  )
}

/**
 * A Phosphor icon, hidden from screen readers: before the title it names the action, after it it points to more.
 *
 * @example
 * <TraceLine>
 *   <TraceIcon>
 *     <FileTsIcon />
 *   </TraceIcon>
 *   <TraceTitle>Edited trace.tsx</TraceTitle>
 * </TraceLine>
 */
function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [[data-slot=trace-title]~&]:-ml-1",
        className
      )}
      {...props}
    />
  )
}

/**
 * The sentence that names the step and its status ("Running npm test", "Failed to run npm test"), on one line; it shimmers while the step runs.
 *
 * @example
 * <TraceLine>
 *   <TraceTitle>Read package.json</TraceTitle>
 * </TraceLine>
 */
function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-title"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  )
}

/**
 * Secondary text after the title, such as a duration, a count or a diff stat; it does not truncate.
 *
 * @example
 * <TraceLine>
 *   <TraceTitle>Edited trace.tsx</TraceTitle>
 *   <TraceDescription>+12 −3</TraceDescription>
 * </TraceLine>
 */
function TraceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-description"
      className={cn("shrink-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

/**
 * A step whose details open under it: a `TraceCollapsibleTrigger` holding the `TraceLine`, then a `TraceCollapsibleContent`; `defaultOpen`, or `open` with `onOpenChange`.
 *
 * @example
 * <Trace>
 *   <TraceCollapsible>
 *     <TraceCollapsibleTrigger>
 *       <TraceLine>
 *         <TraceTitle>Ran node --version</TraceTitle>
 *       </TraceLine>
 *     </TraceCollapsibleTrigger>
 *     <TraceCollapsibleContent>v24.15.0</TraceCollapsibleContent>
 *   </TraceCollapsible>
 * </Trace>
 */
function TraceCollapsible({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, "asChild" | "open"> &
  (
    | { open?: undefined }
    | {
        open: boolean
        onOpenChange: NonNullable<
          React.ComponentProps<typeof Collapsible>["onOpenChange"]
        >
      }
  )) {
  return (
    <Collapsible
      data-slot="trace-collapsible"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  )
}

/**
 * The button that opens and closes a step's details: put the `TraceLine` in it, and it adds a caret that turns when the step is open.
 *
 * @example
 * <TraceCollapsible>
 *   <TraceCollapsibleTrigger>
 *     <TraceLine>
 *       <TraceTitle>Searched 4 sources</TraceTitle>
 *     </TraceLine>
 *   </TraceCollapsibleTrigger>
 *   <TraceCollapsibleContent>docs.example.com, and 3 more</TraceCollapsibleContent>
 * </TraceCollapsible>
 */
function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleTrigger>, "asChild">) {
  return (
    <CollapsibleTrigger
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-item text-left text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:ring-(length:--space-focus-ring-width) focus-visible:ring-ring/50 focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid has-[[data-status=error]]:text-destructive",
        className
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <CaretRightIcon />
      </TraceIcon>
    </CollapsibleTrigger>
  )
}

/**
 * The details of a step, under a rule aligned with its icon: a reasoning text, a list of sources, or the step's output in a `size="sm"` `CodeBlock`.
 *
 * @example
 * <TraceCollapsible defaultOpen>
 *   <TraceCollapsibleTrigger>
 *     <TraceLine>
 *       <TraceTitle>Thought for 4 seconds</TraceTitle>
 *     </TraceLine>
 *   </TraceCollapsibleTrigger>
 *   <TraceCollapsibleContent>The user wants the totals by month.</TraceCollapsibleContent>
 * </TraceCollapsible>
 */
function TraceCollapsibleContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleContent>, "asChild">) {
  return (
    <CollapsibleContent
      data-slot="trace-collapsible-content"
      className="min-w-0 overflow-hidden duration-normal [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        className={cn(
          "mt-2 mb-1 ml-1.5 min-w-0 border-l pr-1 pl-3.5 leading-relaxed wrap-break-word text-muted-foreground",
          className
        )}
      >
        {children}
      </div>
    </CollapsibleContent>
  )
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
}

export type TraceProps = React.ComponentProps<typeof Trace>
export type TraceCollapsibleProps = React.ComponentProps<
  typeof TraceCollapsible
>
export type TraceCollapsibleContentProps = React.ComponentProps<
  typeof TraceCollapsibleContent
>
export type TraceCollapsibleTriggerProps = React.ComponentProps<
  typeof TraceCollapsibleTrigger
>
export type TraceDescriptionProps = React.ComponentProps<
  typeof TraceDescription
>
export type TraceIconProps = React.ComponentProps<typeof TraceIcon>
export type TraceLineProps = React.ComponentProps<typeof TraceLine>
export type TraceTitleProps = React.ComponentProps<typeof TraceTitle>
