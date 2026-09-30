# Edit

## Metadata

| Field | Value |
| ----- | ----- |
| Name  | edit  |
| Kind  | Task  |

## Role

Changes the details of an object that already exists, and saves them only when the person asks to.

## Usage

- **MUST** — edit on the object's own page, one `Card` per group of related fields, each with its own `Save changes`; an object of at most 6 fields edits in the same `Dialog` as [create](./create.md)
- **MUST** — fill every field with its current value (`defaultValue`), so the person changes only what they came for
- **MUST** — save through an explicit `Save changes` button; a `Switch` that takes effect at once is the only exception, as [settings](./settings.md) describes
- **MUST** — offer `Discard changes` (`type="reset"`) next to the save button, which puts the saved values back
- **MUST** — warn before the person leaves with unsaved changes, as [saving](./saving.md) describes
- **MUST NOT** — reuse the create wording: the object exists, so the button says `Save changes`, never `Create`

## Structure

| Region  | Content                                               | Components                                           |
| ------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Header  | The object's name, as the page title                  | `Heading` `level={1}`                                |
| Section | One group of related fields, with a title and a line  | `Card`, `CardHeader`, `CardTitle`, `CardDescription` |
| Fields  | The fields of the group, filled with the saved values | `FieldGroup`, `Field`, `Input`, `Textarea`, `Select` |
| Actions | Save, then discard, at the bottom of the section      | `CardFooter`, `Button`                               |

## Components

| Component    | Variant / props                      | Job                                    |
| ------------ | ------------------------------------ | -------------------------------------- |
| `Card`       | one per group of fields              | Holds one form and its own save action |
| `FieldGroup` | —                                    | Spaces the fields                      |
| `Button`     | `type="submit"`, `variant="default"` | Saves the section                      |
| `Button`     | `type="reset"`, `variant="ghost"`    | Puts the saved values back             |
| `Heading`    | `level={1}`                          | The name of the object, once per page  |

## Spacing

- **MUST** — stack the section cards in a `flex flex-col gap-6` column of `max-w-2xl` (`space.layout.content-sm`)
- **MUST** — let `CardContent` and `CardFooter` pad the form; a `Field` takes no margin
- **MUST** — keep the page title and the first card `gap-section` apart, inside the page container of [navigation](./navigation.md)

## Content

| Element       | Write                                                                 | Not                      |
| ------------- | --------------------------------------------------------------------- | ------------------------ |
| Section title | `Project details`                                                     | `Edit form`, `Details`   |
| Save          | `Save changes`                                                        | `Submit`, `Update`, `OK` |
| Discard       | `Discard changes`                                                     | `Reset`, `Cancel`        |
| Success       | `All set! Your changes are saved.`                                    | `Update successful!!`    |
| Error         | `We couldn't save your changes. Check your connection and try again.` | `Something went wrong.`  |

## Code example

```tsx
"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProjectDetails() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("All set! Your changes are saved.")
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Everyone on the project sees these details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input id="project-name" name="name" defaultValue="Q3 launch" />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-summary">Summary</FieldLabel>
              <Textarea
                id="project-summary"
                name="summary"
                defaultValue="The campaign for the new pricing."
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit">Save changes</Button>
          <Button type="reset" variant="ghost">
            Discard changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

## Cross-references

- [create](./create.md) — the same fields, before the object exists
- [saving](./saving.md) — the pending state, the error and the unsaved-changes warning
- [settings](./settings.md) — the settings that take effect at once, without a save button
- [form](./form.md) — the layout, labels and validation of the fields
- [`Card`](../components/Card.md), [`Field`](../components/Field.md) — the component specs
