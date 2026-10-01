# Form

## Metadata

| Field | Value |
| ----- | ----- |
| Name  | form  |
| Kind  | UI    |

## Role

Lays out the fields a person fills in, tells them what each one expects, and points to what to fix when a value is wrong.

## Usage

- **MUST** — lay the fields out in one column, each control under its visible `FieldLabel` (rule-09); a placeholder never stands in for the label
- **MUST** — group related fields in a `FieldSet` with a `FieldLegend`, at most 2 levels deep
- **MUST** — pick each selection control from its number of options (rule-20): `RadioGroup` for 2 to 5, `Select` for 6 to 15, `Combobox` beyond, `Checkbox` for several values
- **MUST** — mark the optional fields with `(optional)` in their label, and leave the required ones unmarked
- **MUST** — validate on submit, then check a field again on each change once it shows an error; move the focus to the first field in error
- **MUST** — show an error in a `FieldError` under its field, with `data-invalid` on the `Field` and `aria-invalid` on the control
- **MUST NOT** — disable the submit button to signal a missing value: let the person submit, then say what is missing
- **MUST NOT** — pre-check a consent, a subscription or a paid option: the person opts in themselves
- **MUST** — place the actions after the last field: the submit button, then `Cancel` when the form can be left

## Structure

| Region   | Content                                                       | Components                                              |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| Group    | Related fields under a legend                                 | `FieldSet`, `FieldLegend`                               |
| Field    | A label, the control, a help line, an error when there is one | `Field`, `FieldLabel`, `FieldDescription`, `FieldError` |
| Controls | Text, choice and toggle controls                              | `Input`, `Textarea`, `RadioGroup`, `Select`, `Checkbox` |
| Actions  | Submit, then cancel                                           | `Button`                                                |

## Components

| Component    | Variant / props                             | Job                                            |
| ------------ | ------------------------------------------- | ---------------------------------------------- |
| `FieldGroup` | —                                           | Spaces the fields and groups (`gap-6`)         |
| `FieldSet`   | with a `FieldLegend` `variant="legend"`     | A named group of fields                        |
| `Field`      | `data-invalid` when its value is wrong      | One label, one control, its help and its error |
| `FieldError` | —                                           | What is wrong and how to fix it                |
| `RadioGroup` | inside a `FieldSet`, one `Field` per option | One value out of 2 to 5                        |
| `Button`     | `type="submit"`                             | Sends the form                                 |

## Spacing

- **MUST** — cap the form at `max-w-2xl` (`space.layout.content-sm`); a field takes the width of the column
- **MUST** — let `FieldGroup` space the fields and groups (`gap-6`, `space.component.lg`); a `Field` takes no margin
- **MUST** — lay the actions out as `flex gap-2`, after the last group

## Content

| Element | Write                                                  | Not                                    |
| ------- | ------------------------------------------------------ | -------------------------------------- |
| Label   | `Email` · `Company (optional)`                         | `Email:`, `Enter your email`, `Email*` |
| Help    | `We only use it to send receipts.`                     | `Required field`                       |
| Error   | `Enter an email address, like name@example.com.`       | `Invalid input`, `Error`               |
| Submit  | The verb of the task: `Create account`, `Send invoice` | `Submit`, `OK`                         |

## Code example

```tsx
"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function AccountForm() {
  const [emailError, setEmailError] = React.useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email"))
    setEmailError(
      email.includes("@")
        ? ""
        : "Enter an email address, like name@example.com."
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldGroup>
            <Field data-invalid={emailError ? "true" : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={emailError ? true : undefined}
              />
              <FieldError>{emailError}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="company">Company (optional)</FieldLabel>
              <Input id="company" name="company" autoComplete="organization" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Plan</FieldLegend>
          <RadioGroup name="plan" defaultValue="starter">
            <Field orientation="horizontal">
              <RadioGroupItem value="starter" id="plan-starter" />
              <FieldLabel htmlFor="plan-starter">Starter</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="team" id="plan-team" />
              <FieldLabel htmlFor="plan-team">Team</FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
        <div className="flex gap-2">
          <Button type="submit">Create account</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
```

## Cross-references

- [create](./create.md), [edit](./edit.md), [sign-in](./sign-in.md) — the tasks a form serves
- [saving](./saving.md) — what the submit button shows while the form is sent
- [`Field`](../components/Field.md), [`RadioGroup`](../components/RadioGroup.md), [`Select`](../components/Select.md), [`Combobox`](../components/Combobox.md) — the component specs; rule-09 and rule-20 of `design-system.index.json`
