import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
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

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

export type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

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
