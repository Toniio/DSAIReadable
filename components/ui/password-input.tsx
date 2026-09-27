"use client"

import * as React from "react"
import { Eye, EyeSlash } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { UI_STRINGS } from "@/lib/ui-strings"
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroup data-slot="password-input" className={cn(className)}>
      <InputGroupInput type={visible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          variant="ghost"
          aria-label={
            visible
              ? UI_STRINGS.passwordInput.hide
              : UI_STRINGS.passwordInput.show
          }
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeSlash /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }

export type PasswordInputProps = React.ComponentProps<typeof PasswordInput>
