import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { PasswordInput } from "@/components/ui/password-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { unmarkedTabStops } from "./focus"

/**
 * The focus indicator of the states the spec examples do not render, held to
 * the same rule as `tests/examples.test.tsx`: on every tab stop, light and
 * dark, a part that reaches 3:1 against what it is drawn on. Each case drew a
 * `ring-ring/50` or `ring-destructive/20` halo alone (about 1.4 to 2.1:1), or
 * nothing at all (an invalid InputGroup, whose ring is on at rest).
 */
const states: Record<string, ReactNode> = {
  "Toggle, default variant": <Toggle aria-label="Bold">B</Toggle>,
  "Toggle, default variant, pressed": (
    <Toggle aria-label="Bold" defaultPressed>
      B
    </Toggle>
  ),
  "Toggle, invalid": (
    <Toggle aria-label="Bold" aria-invalid>
      B
    </Toggle>
  ),
  "ToggleGroupItem, default variant": (
    <ToggleGroup type="single" aria-label="View">
      <ToggleGroupItem value="list" aria-label="List">
        L
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  "Button, destructive variant": <Button variant="destructive">Delete</Button>,
  "Button, invalid": <Button aria-invalid>Send</Button>,
  "Badge, destructive link": (
    <Badge variant="destructive" asChild>
      <a href="#overdue">Overdue</a>
    </Badge>
  ),
  "Input, invalid": <Input aria-label="Email" aria-invalid />,
  "Textarea, invalid": <Textarea aria-label="Comment" aria-invalid />,
  "NativeSelect, invalid": (
    <NativeSelect aria-label="City" aria-invalid>
      <NativeSelectOption value="boston">Boston</NativeSelectOption>
    </NativeSelect>
  ),
  "Select, invalid": (
    <Select>
      <SelectTrigger aria-label="Fruit" aria-invalid>
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
    </Select>
  ),
  "Checkbox, invalid": <Checkbox aria-label="Accept" aria-invalid />,
  "Checkbox, checked and invalid": (
    <Checkbox aria-label="Accept" aria-invalid defaultChecked />
  ),
  "RadioGroupItem, invalid": (
    <RadioGroup aria-label="Plan">
      <RadioGroupItem value="pro" aria-label="Pro" aria-invalid />
    </RadioGroup>
  ),
  "Switch, invalid": <Switch aria-label="Notifications" aria-invalid />,
  "InputGroup, invalid": (
    <InputGroup>
      <InputGroupInput aria-label="Search" aria-invalid />
    </InputGroup>
  ),
  "PasswordInput, invalid": (
    <PasswordInput aria-label="Password" aria-invalid />
  ),
  "InputOTP, invalid": (
    <InputOTP maxLength={2} aria-label="Code" aria-invalid>
      <InputOTPGroup>
        <InputOTPSlot index={0} aria-invalid />
        <InputOTPSlot index={1} aria-invalid />
      </InputOTPGroup>
    </InputOTP>
  ),
  "ComboboxChips, invalid": (
    <Combobox multiple items={["design"]}>
      <ComboboxChips>
        <ComboboxChipsInput aria-label="Tags" aria-invalid />
      </ComboboxChips>
    </Combobox>
  ),
}

describe.each(Object.keys(states))("%s", (name) => {
  it("shows a focus indicator with a solid 3:1 part, light and dark", async () => {
    render(<div className="p-4">{states[name]}</div>)
    expect(await unmarkedTabStops(5)).toEqual([])
  })
})
