import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
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

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

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

function BreadcrumbEllipsis({
  className,
  srLabel = UI_STRINGS.breadcrumb.ellipsis,
  ...props
}: React.ComponentProps<"span"> & { srLabel?: string }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
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
