"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * A bordered field that joins an input or textarea with add-ons (icons, text, buttons) so they read as one control.
 *
 * @example
 * <InputGroup>
 *   <InputGroupAddon>
 *     <InputGroupText>https://</InputGroupText>
 *   </InputGroupAddon>
 *   <InputGroupInput placeholder="example.com" />
 * </InputGroup>
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        `group/input-group relative flex h-8 w-full min-w-0 items-center rounded-none border border-input transition-colors ${FOCUS_OUTLINE_RESET} has-[[data-slot=input-group-control]:disabled]:bg-input-fill/50 has-[[data-slot=input-group-control]:disabled]:opacity-disabled has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-(length:--space-focus-ring-width) has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-(length:--border-width-default) has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-destructive has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-solid has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-(length:--space-focus-ring-width) has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input-fill/30 dark:has-[[data-slot=input-group-control]:disabled]:bg-input-fill/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5`,
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-xs font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-disabled [&>kbd]:rounded-none [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:-ml-1 has-[>kbd]:-ml-0.5",
        "inline-end": "order-last pr-2 has-[>button]:-mr-1 has-[>kbd]:-mr-0.5",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

/**
 * Places an icon, text or button beside or above the field of an `InputGroup`; use `align` to choose the side.
 *
 * @example
 * <InputGroup>
 *   <InputGroupInput placeholder="Search projects" />
 *   <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
 * </InputGroup>
 */
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-xs shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 min-w-target gap-1 rounded-none px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "gap-1",
        "icon-xs": "size-6 rounded-none p-0 has-[>svg]:p-0",
        "icon-sm": "size-7 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

/**
 * A compact button for an action inside an `InputGroupAddon`, such as clearing the field or showing a password.
 *
 * @example
 * <InputGroup>
 *   <InputGroupInput type="password" aria-label="Password" />
 *   <InputGroupAddon align="inline-end">
 *     <InputGroupButton>Show</InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 */
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      data-slot="input-group-button"
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

/**
 * Static text inside an `InputGroupAddon`, such as a prefix, a unit or a character count.
 *
 * @example
 * <InputGroupAddon align="inline-end">
 *   <InputGroupText>USD</InputGroupText>
 * </InputGroupAddon>
 */
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * The single-line field of an `InputGroup`; the group draws its focus and invalid state.
 *
 * @example
 * <InputGroup>
 *   <InputGroupInput type="email" placeholder="you@example.com" aria-label="Email address" />
 * </InputGroup>
 */
function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        // focus-managed: InputGroup draws the ring on the group, through has-[[data-slot=input-group-control]:focus-visible]
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

/**
 * The multi-line field of an `InputGroup`, for add-ons placed above or below a longer message.
 *
 * @example
 * <InputGroup>
 *   <InputGroupTextarea placeholder="Write a reply" aria-label="Reply" />
 *   <InputGroupAddon align="block-end">
 *     <InputGroupButton>Send reply</InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 */
function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        // focus-managed: InputGroup draws the ring on the group, through has-[[data-slot=input-group-control]:focus-visible]
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}

export type InputGroupProps = React.ComponentProps<typeof InputGroup>
export type InputGroupAddonProps = React.ComponentProps<typeof InputGroupAddon>
export type InputGroupButtonProps = React.ComponentProps<
  typeof InputGroupButton
>
export type InputGroupInputProps = React.ComponentProps<typeof InputGroupInput>
export type InputGroupTextProps = React.ComponentProps<typeof InputGroupText>
export type InputGroupTextareaProps = React.ComponentProps<
  typeof InputGroupTextarea
>
