"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Args, Control } from "@/site/playground/types"

/** A select with this many options or fewer shows them all as toggles. */
const INLINE_OPTIONS = 4

function ControlInput({
  id,
  control,
  value,
  onChange,
}: {
  id: string
  control: Control
  value: Args[string] | undefined
  onChange: (value: Args[string]) => void
}) {
  switch (control.kind) {
    case "boolean":
      return (
        <Switch
          id={id}
          checked={Boolean(value ?? control.default)}
          onCheckedChange={(checked) => onChange(checked)}
        />
      )
    case "select":
      return control.options.length <= INLINE_OPTIONS ? (
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-labelledby={`${id}-label`}
          className="flex-wrap"
          value={String(value ?? control.default)}
          onValueChange={(next) => {
            if (next) onChange(next)
          }}
        >
          {control.options.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : (
        <NativeSelect
          id={id}
          size="sm"
          value={String(value ?? control.default)}
          onChange={(event) => onChange(event.target.value)}
        >
          {control.options.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )
    case "number":
      return (
        <Input
          id={id}
          type="number"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={Number(value ?? control.default)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      )
    case "text":
      return (
        <Input
          id={id}
          value={String(value ?? control.default)}
          onChange={(event) => onChange(event.target.value)}
        />
      )
  }
}

/** One field per control: what the playground lets a reader change. */
export function ControlPanel({
  idPrefix,
  controls,
  args,
  onChange,
}: {
  idPrefix: string
  controls: Control[]
  args: Args
  onChange: (name: string, value: Args[string]) => void
}) {
  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {controls.map((control) => {
        const id = `${idPrefix}-${control.name}`
        return (
          <div
            key={control.name}
            className={
              control.kind === "boolean"
                ? "flex items-center justify-between gap-4"
                : "flex flex-col gap-2"
            }
          >
            <Label
              id={`${id}-label`}
              htmlFor={
                control.kind === "select" &&
                control.options.length <= INLINE_OPTIONS
                  ? undefined
                  : id
              }
            >
              <code className="font-mono text-xs">{control.name}</code>
            </Label>
            <ControlInput
              id={id}
              control={control}
              value={args[control.name]}
              onChange={(value) => onChange(control.name, value)}
            />
          </div>
        )
      })}
    </div>
  )
}
