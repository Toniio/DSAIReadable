"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { MinusIcon } from "@phosphor-icons/react"

/**
 * A segmented field for a one-time passcode of a fixed length; set `maxLength` to the number of characters.
 *
 * @example
 * <InputOTP maxLength={6} aria-label="Verification code">
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *   </InputOTPGroup>
 * </InputOTP>
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-disabled",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

/**
 * Joins adjacent `InputOTPSlot`s into one visual block, so a long code reads as short runs of characters.
 *
 * @example
 * <InputOTP maxLength={4} aria-label="PIN">
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *     <InputOTPSlot index={3} />
 *   </InputOTPGroup>
 * </InputOTP>
 */
function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-none has-aria-invalid:border-destructive has-aria-invalid:ring-(length:--space-focus-ring-width) has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

/**
 * Shows one character of the code at the position given by `index`, with the caret and the active highlight.
 *
 * @example
 * <InputOTPGroup>
 *   <InputOTPSlot index={0} />
 *   <InputOTPSlot index={1} />
 * </InputOTPGroup>
 */
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        `relative flex size-8 items-center justify-center border-y border-r border-input text-xs transition-all data-[active=true]:z-dropdown ${FOCUS_OUTLINE_RESET} first:rounded-none first:border-l last:rounded-none aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-(length:--space-focus-ring-width) data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 data-[active=true]:aria-invalid:outline-(length:--border-width-default) data-[active=true]:aria-invalid:outline-destructive data-[active=true]:aria-invalid:outline-solid dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-extra-slow" />
        </div>
      )}
    </div>
  )
}

/**
 * A dash between two `InputOTPGroup`s that splits a code into runs, like 3 + 3.
 *
 * @example
 * <InputOTP maxLength={6} aria-label="Verification code">
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *   </InputOTPGroup>
 *   <InputOTPSeparator />
 *   <InputOTPGroup>
 *     <InputOTPSlot index={3} />
 *     <InputOTPSlot index={4} />
 *     <InputOTPSlot index={5} />
 *   </InputOTPGroup>
 * </InputOTP>
 */
function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

export type InputOTPProps = React.ComponentProps<typeof InputOTP>
export type InputOTPGroupProps = React.ComponentProps<typeof InputOTPGroup>
export type InputOTPSeparatorProps = React.ComponentProps<
  typeof InputOTPSeparator
>
export type InputOTPSlotProps = React.ComponentProps<typeof InputOTPSlot>
