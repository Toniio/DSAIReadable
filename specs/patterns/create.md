# Create

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | create |
| Kind  | Task   |

## Role

Adds one new object — a project, an invoice, a member — to a collection, and shows it there once it exists.

## Usage

- **MUST** — open a `Dialog` when the object takes at most 6 fields and no inner scrolling; beyond that, or with a field that needs room (rich text, a file list), use a full page at `/<collection>/new`
- **MUST** — start from a `Button` `variant="default"` in the header of the collection it adds to, labeled with the verb and the object: `Create project`
- **MUST** — ask only for what creation needs; every other field waits for the [edit](./edit.md) page
- **MUST** — on success, close the surface, show the new object in its collection and confirm with one `toast.success`
- **MUST NOT** — clear what the person typed when creation fails: keep every value and show the error as [saving](./saving.md) describes
- **Note** — an empty collection offers the same action from its [empty state](./empty-state.md)

## Structure

| Region       | Content                                                     | Components                                                    |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Trigger      | The create action, in the header of the collection          | `Button`                                                      |
| Surface      | A dialog, or a page for a long form                         | `Dialog`, or the page layout of [navigation](./navigation.md) |
| Header       | What is being created, and one sentence on what comes next  | `DialogTitle`, `DialogDescription`                            |
| Fields       | The required fields, in the order the person thinks of them | `FieldGroup`, `Field`, `Input`, `Textarea`, `Select`          |
| Actions      | Cancel, then the create action                              | `DialogFooter`, `DialogClose`, `Button`                       |
| Confirmation | One line that names the new object                          | `toast.success` from `sonner`                                 |

## Components

| Component    | Variant / props                          | Job                                          |
| ------------ | ---------------------------------------- | -------------------------------------------- |
| `Button`     | `variant="default"` with a `PlusIcon`    | The trigger, and the submit button           |
| `Button`     | `variant="outline"`, `type="button"`     | Cancel, inside `DialogClose asChild`         |
| `Dialog`     | controlled through `open`/`onOpenChange` | Closes itself once the object is created     |
| `FieldGroup` | —                                        | Spaces the fields and ties labels to inputs  |
| `Toaster`    | once, at the layout root                 | Shows the confirmation (`toast` of `sonner`) |

## Spacing

- **MUST** — let `FieldGroup` space the fields (`gap-5`, `space.scale.5`); a `Field` takes no margin
- **MUST** — put the `form` inside `DialogContent` with `flex flex-col gap-4`, so header, fields and footer keep the dialog's rhythm (`DialogContent` spaces its parts with `gap-4`)
- **MUST** — on a full page, set the form column to `max-w-2xl` (`space.layout.content-sm`) inside the page container of [navigation](./navigation.md)

## Content

| Element | Write                                                                  | Not                                      |
| ------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Trigger | `Create project`                                                       | `New`, `Add +`, `Create`                 |
| Title   | `Create a project`                                                     | `New project form`                       |
| Submit  | `Create project`                                                       | `Submit`, `OK`                           |
| Success | `Your project "Q3 launch" is ready.`                                   | `Success! Project created successfully!` |
| Error   | `We couldn't create the project. Check your connection and try again.` | `Error 500`                              |

## Code example

```tsx
"use client"

import * as React from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CreateProject() {
  const [open, setOpen] = React.useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get("name")
    setOpen(false)
    toast.success(`Your project "${name}" is ready.`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Create project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>
              Give it a name now. You can add the details later.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input id="project-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-summary">
                Summary (optional)
              </FieldLabel>
              <Textarea id="project-summary" name="summary" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Cross-references

- [edit](./edit.md) — changes the object once it exists, with the fields creation leaves out
- [form](./form.md) — the layout, labels and validation of the fields
- [saving](./saving.md) — the pending state of the submit button and the error when creation fails
- [empty-state](./empty-state.md) — the same action, offered by an empty collection
- [`Dialog`](../components/Dialog.md), [`Field`](../components/Field.md), [`Sonner`](../components/Sonner.md) — the component specs
