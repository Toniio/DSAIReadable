# Saving

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | saving |
| Kind  | UI     |

## Role

Tells the person that their changes are on their way, that they are saved, or that they are not and what to do — and keeps them from losing unsaved work.

## Usage

- **MUST** — while a save runs, keep the button in place with a `Spinner` and a present-tense label (`Saving…`), `disabled` and `aria-busy`, so it cannot send twice
- **MUST** — confirm a save the person asked for with one `toast.success`; a `Switch` that applies at once confirms nothing, its new position is the confirmation
- **MUST** — report a failed save where it happened: a `FieldError` for a value the server refused, an `Alert` `variant="destructive"` above the form for anything else — and keep every value the person typed
- **MUST** — say what happened, then how to fix it, in every error ([voice and tone](../foundations/voice-and-tone.md))
- **MUST** — ask before the person leaves a form with unsaved changes, in an `AlertDialog`: `Leave without saving?`, with `Keep editing` and `Leave page`
- **MUST** — show the state of an autosaved document in a `aria-live="polite"` line next to its title: `Saving…`, then `Saved`
- **MUST NOT** — use a toast for an error that needs an action: the toast disappears before the person can act on it

## Structure

| Region       | Content                                       | Components                                    |
| ------------ | --------------------------------------------- | --------------------------------------------- |
| Save action  | The button, then its pending state            | `Button`, `Spinner`                           |
| Confirmation | One line once the save succeeded              | `toast.success` from `sonner`                 |
| Failure      | What failed and how to fix it, above the form | `Alert` `variant="destructive"`, `FieldError` |
| Leave guard  | The question before unsaved changes are lost  | `AlertDialog`                                 |
| Autosave     | The state of the last save, next to the title | a `<p>` with `aria-live="polite"`             |

## Components

| Component     | Variant / props                                           | Job                                  |
| ------------- | --------------------------------------------------------- | ------------------------------------ |
| `Button`      | `type="submit"`, `disabled` and `aria-busy` while pending | The save action                      |
| `Spinner`     | `aria-label="Saving changes"`                             | The pending state, inside the button |
| `Alert`       | `variant="destructive"`                                   | A failed save                        |
| `AlertDialog` | —                                                         | The unsaved-changes question         |
| `Toaster`     | once, at the layout root                                  | Shows the confirmation               |

## Spacing

- **MUST** — keep the save button in the same place in every state: the `Spinner` goes inside it, before the label, with the button's own gap
- **MUST** — place the failure `Alert` first in the form's `FieldGroup`, so it takes the group's spacing

## Content

| Element     | Write                                                                 | Not                                           |
| ----------- | --------------------------------------------------------------------- | --------------------------------------------- |
| Pending     | `Saving…`                                                             | `Please wait...`, `Processing`                |
| Success     | `All set! Your changes are saved.`                                    | `Success! Operation completed successfully!!` |
| Failure     | `We couldn't save your changes. Check your connection and try again.` | `Oops! Save failed!`                          |
| Leave guard | `Leave without saving?` · `Keep editing` · `Leave page`               | `Are you sure?` · `Yes` · `No`                |
| Autosave    | `Saving…` · `Saved`                                                   | `Autosave in progress`                        |

## Code example

```tsx
"use client"

import * as React from "react"
import { WarningCircleIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function ProfileForm({
  save,
}: {
  save: (data: FormData) => Promise<void>
}) {
  const [pending, setPending] = React.useState(false)
  const [failed, setFailed] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFailed(false)
    try {
      await save(new FormData(event.currentTarget))
      toast.success("All set! Your changes are saved.")
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <FieldGroup>
        {failed && (
          <Alert variant="destructive">
            <WarningCircleIcon />
            <AlertTitle>We couldn&apos;t save your changes</AlertTitle>
            <AlertDescription>
              Check your connection and try again.
            </AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="display-name">Display name</FieldLabel>
          <Input id="display-name" name="displayName" defaultValue="Ana" />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? (
              <>
                <Spinner aria-label="Saving changes" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
```

## Cross-references

- [edit](./edit.md), [settings](./settings.md) — the pages whose changes are saved
- [loading](./loading.md) — the other waits, and when a `Progress` replaces the `Spinner`
- [form](./form.md) — the `FieldError` of a value the server refused
- [`Button`](../components/Button.md), [`Spinner`](../components/Spinner.md), [`Alert`](../components/Alert.md), [`AlertDialog`](../components/AlertDialog.md), [`Sonner`](../components/Sonner.md) — the component specs
