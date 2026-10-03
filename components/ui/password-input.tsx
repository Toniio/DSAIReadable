"use client"

import * as React from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { UI_STRINGS } from "@/lib/ui-strings"

/**
 * A password field with a button that shows or hides the text; translate its labels with `showLabel` and `hideLabel`.
 *
 * @example
 * <Field>
 *   <FieldLabel htmlFor="password">Password</FieldLabel>
 *   <PasswordInput id="password" autoComplete="current-password" />
 * </Field>
 */
function PasswordInput({
  className,
  showLabel = UI_STRINGS.passwordInput.show,
  hideLabel = UI_STRINGS.passwordInput.hide,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  showLabel?: string
  hideLabel?: string
}) {
  const [visible, setVisible] = React.useState(false)
  // A disabled field masks its value and takes its toggle with it; readOnly
  // keeps the toggle, since showing a value is a read.
  const shown = visible && !disabled

  return (
    <InputGroup data-slot="password-input" className={cn(className)}>
      <InputGroupInput
        type={shown ? "text" : "password"}
        disabled={disabled}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          variant="ghost"
          aria-label={shown ? hideLabel : showLabel}
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {shown ? <EyeSlashIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }

export type PasswordInputProps = React.ComponentProps<typeof PasswordInput>
