import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
/**
 * The navigation landmark for the path to the current page; use one per page, at the top of the main content.
 *
 * @example
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Products</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */
function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label={UI_STRINGS.breadcrumb.landmark}
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

/**
 * The ordered list inside a `Breadcrumb` that lays out its items and separators in a wrapping row.
 *
 * @example
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Products</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs wrap-break-word text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * One step of the trail, wrapping a `BreadcrumbLink`, a `BreadcrumbPage` or a `BreadcrumbEllipsis`.
 *
 * @example
 * <BreadcrumbList>
 *   <BreadcrumbItem>
 *     <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *   </BreadcrumbItem>
 * </BreadcrumbList>
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

/**
 * A link to a parent page in the trail; set `asChild` to render your router's link component instead of an anchor.
 *
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbLink href="/products">Products</BreadcrumbLink>
 * </BreadcrumbItem>
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}

/**
 * The current page, the last step of the trail: it marks the location and is never clickable.
 *
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbPage>Product details</BreadcrumbPage>
 * </BreadcrumbItem>
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

/**
 * The divider between two steps of the trail; pass `children` to replace the default chevron, and it stays hidden from screen readers.
 *
 * @example
 * <BreadcrumbList>
 *   <BreadcrumbItem>
 *     <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *   </BreadcrumbItem>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbItem>
 *     <BreadcrumbPage>Products</BreadcrumbPage>
 *   </BreadcrumbItem>
 * </BreadcrumbList>
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <CaretRightIcon />}
    </li>
  )
}

/**
 * Stands in for the middle steps of a long trail; `srLabel` sets the text a screen reader announces for it.
 *
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbEllipsis />
 * </BreadcrumbItem>
 */
function BreadcrumbEllipsis({
  className,
  srLabel = UI_STRINGS.breadcrumb.ellipsis,
  ...props
}: React.ComponentProps<"span"> & { srLabel?: string }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
    >
      <DotsThreeIcon aria-hidden="true" />
      <span className="sr-only">{srLabel}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

export type BreadcrumbProps = React.ComponentProps<typeof Breadcrumb>
export type BreadcrumbEllipsisProps = React.ComponentProps<
  typeof BreadcrumbEllipsis
>
export type BreadcrumbItemProps = React.ComponentProps<typeof BreadcrumbItem>
export type BreadcrumbLinkProps = React.ComponentProps<typeof BreadcrumbLink>
export type BreadcrumbListProps = React.ComponentProps<typeof BreadcrumbList>
export type BreadcrumbPageProps = React.ComponentProps<typeof BreadcrumbPage>
export type BreadcrumbSeparatorProps = React.ComponentProps<
  typeof BreadcrumbSeparator
>
