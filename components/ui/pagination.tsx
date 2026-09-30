import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
/**
 * The navigation landmark for a paged result set; it holds no state, so you manage the current page and its URLs.
 *
 * @example
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationLink href="?page=1" isActive>1</PaginationLink>
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label={UI_STRINGS.pagination.landmark}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

/**
 * The list inside a `Pagination` that lines up its items in a row.
 *
 * @example
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationPrevious href="?page=1" />
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

/**
 * One entry of the `PaginationContent` list, which wraps a link, a previous or next link, or an ellipsis.
 *
 * @example
 * <PaginationContent>
 *   <PaginationItem>
 *     <PaginationLink href="?page=2">2</PaginationLink>
 *   </PaginationItem>
 * </PaginationContent>
 */
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

export type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

/**
 * A link to one numbered page; set `isActive` on the current page to mark it with `aria-current`.
 *
 * @example
 * <PaginationItem>
 *   <PaginationLink href="?page=3" isActive>3</PaginationLink>
 * </PaginationItem>
 */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

/**
 * The link to the page before the current one; `text` and `label` translate its visible text and its accessible name.
 *
 * @example
 * <PaginationItem>
 *   <PaginationPrevious href="?page=2" />
 * </PaginationItem>
 */
function PaginationPrevious({
  className,
  text = UI_STRINGS.pagination.previousText,
  label = UI_STRINGS.pagination.previousLabel,
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string
  label?: string
}) {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      aria-label={label}
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <CaretLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

/**
 * The link to the page after the current one; `text` and `label` translate its visible text and its accessible name.
 *
 * @example
 * <PaginationItem>
 *   <PaginationNext href="?page=4" />
 * </PaginationItem>
 */
function PaginationNext({
  className,
  text = UI_STRINGS.pagination.nextText,
  label = UI_STRINGS.pagination.nextLabel,
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string
  label?: string
}) {
  return (
    <PaginationLink
      data-slot="pagination-next"
      aria-label={label}
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <CaretRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

/**
 * A marker for the page numbers left out of a long range; `srLabel` translates its hidden text.
 *
 * @example
 * <PaginationItem>
 *   <PaginationEllipsis />
 * </PaginationItem>
 */
function PaginationEllipsis({
  className,
  srLabel = UI_STRINGS.pagination.ellipsis,
  ...props
}: React.ComponentProps<"span"> & { srLabel?: string }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <DotsThreeIcon />
      <span className="sr-only">{srLabel}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

export type PaginationProps = React.ComponentProps<typeof Pagination>
export type PaginationContentProps = React.ComponentProps<
  typeof PaginationContent
>
export type PaginationEllipsisProps = React.ComponentProps<
  typeof PaginationEllipsis
>
export type PaginationItemProps = React.ComponentProps<typeof PaginationItem>
export type PaginationNextProps = React.ComponentProps<typeof PaginationNext>
export type PaginationPreviousProps = React.ComponentProps<
  typeof PaginationPrevious
>
