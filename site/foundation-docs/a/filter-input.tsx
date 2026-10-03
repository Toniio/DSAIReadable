"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** A search field with its label, for the filters of a token list. */
export function FilterInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
}: {
  id: string
  /** The field's name, read by a screen reader: "Filter colors". */
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <InputGroup>
        <InputGroupAddon>
          <MagnifyingGlassIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </div>
  )
}
