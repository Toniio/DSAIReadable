"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { SEPARATION_RING } from "@/lib/surface"

/**
 * The stand-in for a person or an entity; use `size` to fit the context, small in lists and large on profiles.
 *
 * @example
 * <Avatar size="lg">
 *   <AvatarImage src="/team/maria.jpg" alt="Maria Lopez" />
 *   <AvatarFallback>ML</AvatarFallback>
 * </Avatar>
 */
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}

/**
 * The photo inside an `Avatar`; always give it an `alt` that names the person.
 *
 * @example
 * <Avatar>
 *   <AvatarImage src="/team/maria.jpg" alt="Maria Lopez" />
 *   <AvatarFallback>ML</AvatarFallback>
 * </Avatar>
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

/**
 * The initials or icon an `Avatar` shows while the image loads or when it is missing.
 *
 * @example
 * <Avatar>
 *   <AvatarFallback>ML</AvatarFallback>
 * </Avatar>
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}

/**
 * A small status dot on an `Avatar`, such as online or new activity; label it with `aria-label`.
 *
 * @example
 * <Avatar>
 *   <AvatarFallback>ML</AvatarFallback>
 *   <AvatarBadge aria-label="Online" />
 * </Avatar>
 */
function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        `absolute right-0 bottom-0 z-dropdown inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ${SEPARATION_RING} ring-background select-none`,
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * Stacks overlapping `Avatar`s to list the participants of a conversation or a project.
 *
 * @example
 * <AvatarGroup>
 *   <Avatar>
 *     <AvatarFallback>ML</AvatarFallback>
 *   </Avatar>
 *   <Avatar>
 *     <AvatarFallback>JK</AvatarFallback>
 *   </Avatar>
 *   <AvatarGroupCount>+3</AvatarGroupCount>
 * </AvatarGroup>
 */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-(length:--border-width-separation) *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

/**
 * The overflow bubble at the end of an `AvatarGroup` that counts the people who are not shown.
 *
 * @example
 * <AvatarGroup>
 *   <Avatar>
 *     <AvatarFallback>ML</AvatarFallback>
 *   </Avatar>
 *   <AvatarGroupCount>+3</AvatarGroupCount>
 * </AvatarGroup>
 */
function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        `relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ${SEPARATION_RING} ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3`,
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

export type AvatarProps = React.ComponentProps<typeof Avatar>
export type AvatarBadgeProps = React.ComponentProps<typeof AvatarBadge>
export type AvatarFallbackProps = React.ComponentProps<typeof AvatarFallback>
export type AvatarGroupProps = React.ComponentProps<typeof AvatarGroup>
export type AvatarGroupCountProps = React.ComponentProps<
  typeof AvatarGroupCount
>
export type AvatarImageProps = React.ComponentProps<typeof AvatarImage>
