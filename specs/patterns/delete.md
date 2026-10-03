# Delete

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | delete |
| Kind  | Task   |

## Role

Destroys an object for good, once the person has confirmed they mean it.

## Usage

- **MUST** — confirm a permanent deletion in an `AlertDialog` whose title asks the question with the object's name or count, and whose description says what is lost
- **MUST** — label the confirm button with the verb of the question and the object, `variant="destructive"`: `Delete project`, never `Yes` or `OK`
- **MUST NOT** — ask for confirmation when the action can be undone: remove the object at once and offer `Undo` in the toast — the word is then `remove`, not `delete` ([voice and tone](../foundations/voice-and-tone.md))
- **MUST** — keep the delete action away from the primary action: in the object's row menu (`DropdownMenuItem` `variant="destructive"`) or in a last `Card` of its [settings](./settings.md)
- **MUST** — once the object is deleted, return to its collection and confirm with one `toast.success`
- **MUST** — ask the person to type the object's name in the dialog when the deletion takes other objects with it (a workspace and its projects)

## Structure

| Region       | Content                                             | Components                                                    |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------- |
| Trigger      | The delete action, away from the primary action     | `Button` `variant="destructive"`, or `DropdownMenuItem`       |
| Question     | What will be deleted, by name or count              | `AlertDialogTitle`                                            |
| Consequence  | What the person loses, and that it cannot come back | `AlertDialogDescription`                                      |
| Actions      | Cancel, then the destructive action                 | `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` |
| Confirmation | One line that names what was deleted                | `toast.success` from `sonner`                                 |

## Components

| Component           | Variant / props         | Job                                                |
| ------------------- | ----------------------- | -------------------------------------------------- |
| `AlertDialog`       | —                       | Blocks the page until the person decides (rule-21) |
| `AlertDialogAction` | `variant="destructive"` | Deletes; repeats the verb of the question          |
| `AlertDialogCancel` | —                       | Takes the focus when the dialog opens              |
| `Button`            | `variant="destructive"` | The trigger, in a danger zone                      |
| `DropdownMenuItem`  | `variant="destructive"` | The trigger, in a row menu                         |

## Spacing

- **MUST** — keep the `AlertDialog`'s own layout: no class on its header, description or footer
- **MUST** — put a danger-zone `Card` last on the page, `gap-6` below the card before it

## Content

| Element     | Write                                                                 | Not                            |
| ----------- | --------------------------------------------------------------------- | ------------------------------ |
| Title       | `Delete "Q3 launch"?` · `Delete 3 projects?`                          | `Are you sure?`                |
| Description | `Its tasks and files go with it. You won't be able to get them back.` | `This action is irreversible.` |
| Action      | `Delete project`                                                      | `Yes`, `OK`, `Confirm`         |
| Cancel      | `Cancel`                                                              | `No`, `Go back`                |
| Success     | `"Q3 launch" is deleted.`                                             | `Deletion successful!`         |

## Code example

```tsx
"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function DeleteProject({ name }: { name: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Its tasks and files go with it. You won&apos;t be able to get them
            back.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => toast.success(`"${name}" is deleted.`)}
          >
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Cross-references

- [settings](./settings.md) — the danger zone that holds the delete action of an object
- [saving](./saving.md) — the error when the deletion fails
- [voice and tone](../foundations/voice-and-tone.md) — `delete` destroys, `remove` can be undone
- [`AlertDialog`](../components/AlertDialog.md), [`DropdownMenu`](../components/DropdownMenu.md), [`Sonner`](../components/Sonner.md) — the component specs
