import * as React from "react"
import { cva } from "class-variance-authority"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { SURFACE_OUTLINE } from "@/lib/surface"
import { CaretDownIcon } from "@phosphor-icons/react"

/**
 * The primary navigation of a site or app: links grouped by category with drop-down panels, inline when `viewport` is false.
 *
 * @example
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

/**
 * Lays the top-level items of a `NavigationMenu` out in a horizontal row.
 *
 * @example
 * <NavigationMenuList>
 *   <NavigationMenuItem>
 *     <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
 *   </NavigationMenuItem>
 *   <NavigationMenuItem>
 *     <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
 *   </NavigationMenuItem>
 * </NavigationMenuList>
 */
function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Wraps one top-level entry of the menu: a `NavigationMenuTrigger` with its `NavigationMenuContent`, or a single `NavigationMenuLink`.
 *
 * @example
 * <NavigationMenuItem>
 *   <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *   <NavigationMenuContent>
 *     <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
 *   </NavigationMenuContent>
 * </NavigationMenuItem>
 */
function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

/**
 * Gives a direct link the look of a `NavigationMenuTrigger`, so it lines up with the triggers around it.
 *
 * @example
 * <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
 *   <a href="/pricing">Pricing</a>
 * </NavigationMenuLink>
 */
const navigationMenuTriggerStyle = cva(
  `group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-none px-2.5 py-1.5 text-xs font-medium transition-all ${FOCUS_OUTLINE_RESET} hover:bg-muted focus:bg-muted ${FOCUS_RING} focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-disabled data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted`
)

/**
 * Opens the content panel of its item and shows a caret that turns while the panel is open.
 *
 * @example
 * <NavigationMenuItem>
 *   <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
 *   <NavigationMenuContent>
 *     <NavigationMenuLink href="/guides">Guides</NavigationMenuLink>
 *   </NavigationMenuContent>
 * </NavigationMenuItem>
 */
function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <CaretDownIcon
        className="relative top-px ml-1 size-3 transition duration-slow group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

/**
 * The panel of links that a `NavigationMenuTrigger` opens, animated by the direction of the move between items.
 *
 * @example
 * <NavigationMenuItem>
 *   <NavigationMenuTrigger>Company</NavigationMenuTrigger>
 *   <NavigationMenuContent>
 *     <NavigationMenuLink href="/about">About us</NavigationMenuLink>
 *     <NavigationMenuLink href="/careers">Careers</NavigationMenuLink>
 *   </NavigationMenuContent>
 * </NavigationMenuItem>
 */
function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1 ease-out group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-sm group-data-[viewport=false]/navigation-menu:ring-(length:--border-width-default) group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-slow data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

/**
 * The shared area that renders the active `NavigationMenuContent`; `NavigationMenu` adds it unless `viewport` is false.
 *
 * @example
 * <NavigationMenu viewport={false}>
 *   <NavigationMenuList />
 * </NavigationMenu>
 */
function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-popover flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          `relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full origin-top overflow-hidden rounded-none bg-popover text-popover-foreground shadow-sm ${SURFACE_OUTLINE} ring-foreground/10 duration-fast md:w-(--radix-navigation-menu-viewport-width) data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90`,
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * One navigation link; set `active` on the link to the current page so it shows the active state.
 *
 * @example
 * <NavigationMenuLink href="/pricing" active>
 *   Pricing
 * </NavigationMenuLink>
 */
function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        `flex items-center gap-2 rounded-none p-2 text-xs transition-all ${FOCUS_OUTLINE_RESET} hover:bg-muted focus:bg-muted ${FOCUS_RING} focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid in-data-[slot=navigation-menu-content]:rounded-none data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4`,
        className
      )}
      {...props}
    />
  )
}

/**
 * Marks the active trigger with an arrow below it, placed after the items inside a `NavigationMenuList`.
 *
 * @example
 * <NavigationMenuList>
 *   <NavigationMenuItem>
 *     <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *   </NavigationMenuItem>
 *   <NavigationMenuIndicator />
 * </NavigationMenuList>
 */
function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        /* allow-raw: local-stacking — z-1 positions the indicator above the menu bar border */
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      {/* allow-raw: arbitrary-position — top-[60%] aligns the arrow diamond below the indicator bar */}
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-none bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}

export type NavigationMenuProps = React.ComponentProps<typeof NavigationMenu>
export type NavigationMenuContentProps = React.ComponentProps<
  typeof NavigationMenuContent
>
export type NavigationMenuIndicatorProps = React.ComponentProps<
  typeof NavigationMenuIndicator
>
export type NavigationMenuItemProps = React.ComponentProps<
  typeof NavigationMenuItem
>
export type NavigationMenuLinkProps = React.ComponentProps<
  typeof NavigationMenuLink
>
export type NavigationMenuListProps = React.ComponentProps<
  typeof NavigationMenuList
>
export type NavigationMenuTriggerProps = React.ComponentProps<
  typeof NavigationMenuTrigger
>
export type NavigationMenuViewportProps = React.ComponentProps<
  typeof NavigationMenuViewport
>
