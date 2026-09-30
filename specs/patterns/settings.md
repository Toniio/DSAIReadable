# Settings

## Metadata

| Field | Value    |
| ----- | -------- |
| Name  | settings |
| Kind  | Task     |

## Role

Gathers the preferences of a person, a workspace or an object on one page, in sections the person can scan, and saves each change the way it is made.

## Usage

- **MUST** — give each group of settings its own `Card`, with a title and one line that says what the group controls
- **MUST** — split more than 4 cards into sections: `Tabs` for up to 7 sections, a `Sidebar` group beyond that
- **MUST** — apply an on/off setting at once with a `Switch`: no save button, no toast; if saving it fails, switch it back and show a `toast.error`
- **MUST** — save a group of text fields through its own `Save changes` in the `CardFooter`, as [edit](./edit.md) does
- **MUST** — put the actions that destroy or reset in a last card, titled `Danger zone`, each confirmed as [delete](./delete.md) describes
- **MUST NOT** — mix a `Switch` and text fields that need saving in the same card: the person cannot tell which changes are already saved

## Structure

| Region      | Content                                                        | Components                                              |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Header      | The page title                                                 | `Heading` `level={1}`                                   |
| Sections    | Up to 7 sections of settings, when there are more than 4 cards | `Tabs`, or a `Sidebar` group                            |
| Group       | One group of settings, with a title and a line                 | `Card`, `CardHeader`, `CardTitle`, `CardDescription`    |
| Toggles     | On/off settings, applied at once                               | `FieldGroup`, `Field`, `Switch`                         |
| Fields      | Text settings and their save action                            | `Field`, `Input`, `CardFooter`, `Button`                |
| Danger zone | Delete or reset, last on the page                              | `Card`, `Button` `variant="destructive"`, `AlertDialog` |

## Components

| Component | Variant / props                                                       | Job                                         |
| --------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `Card`    | one per group                                                         | Groups related settings                     |
| `Field`   | `orientation="responsive"`, label and description in a `FieldContent` | A toggle row that stacks on a narrow screen |
| `Switch`  | `id` tied to the `FieldLabel`                                         | An on/off setting, applied at once          |
| `Tabs`    | at most 7 `TabsTrigger`s                                              | The sections of a long settings page        |
| `Button`  | `variant="destructive"`                                               | The danger zone's actions                   |

## Spacing

- **MUST** — stack the cards in a `flex flex-col gap-6` column of `max-w-2xl` (`space.layout.content-sm`), below the title
- **MUST** — keep the title and the first card `gap-section` apart, inside the page container of [navigation](./navigation.md)
- **MUST** — let `FieldGroup` space the toggle rows; a `Field` takes no margin

## Content

| Element           | Write                                                | Not                        |
| ----------------- | ---------------------------------------------------- | -------------------------- |
| Group title       | `Notifications`                                      | `Notification settings`    |
| Toggle label      | `Weekly summary` (the thing it turns on)             | `Enable weekly summary`    |
| Toggle help       | `A digest of your projects, every Monday.`           | `Check to receive emails.` |
| Toggle error      | `We couldn't turn on the weekly summary. Try again.` | `Update failed.`           |
| Danger zone title | `Danger zone`                                        | `Advanced`                 |

## Code example

```tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-section bg-background px-page py-section text-foreground">
      <Heading level={1}>Settings</Heading>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Changes here apply right away.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="weekly-summary">
                    Weekly summary
                  </FieldLabel>
                  <FieldDescription>
                    A digest of your projects, every Monday.
                  </FieldDescription>
                </FieldContent>
                <Switch id="weekly-summary" defaultChecked />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="mentions">Mentions</FieldLabel>
                  <FieldDescription>
                    An email when someone mentions you.
                  </FieldDescription>
                </FieldContent>
                <Switch id="mentions" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <form>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>How your teammates see you.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                  <Input
                    id="display-name"
                    name="displayName"
                    defaultValue="Ana"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
```

## Cross-references

- [edit](./edit.md) — the save action of a group of fields
- [delete](./delete.md) — the confirmation of a danger-zone action
- [navigation](./navigation.md) — the page container, and a `Sidebar` for many sections
- [`Switch`](../components/Switch.md), [`Field`](../components/Field.md), [`Tabs`](../components/Tabs.md), [`Card`](../components/Card.md) — the component specs; rule-20 of `design-system.index.json` picks the `Switch`
