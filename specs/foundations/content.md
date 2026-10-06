# Content — default strings and localization

## Principle

A component does not decide which words it displays. The only strings it
produces without being asked are the **accessible names** of controls that have
no visible label — a `Dialog`'s close cross, a `Carousel`'s arrows, a
`PasswordInput`'s toggle — plus the names of the two landmarks (`Breadcrumb`,
`Pagination`).

They all live in `lib/ui-strings.ts`, in a frozen `UI_STRINGS` object, and
follow the voice of [voice-and-tone.md](./voice-and-tone.md).

```ts
import { UI_STRINGS } from "@/lib/ui-strings"

UI_STRINGS.dialog.close // "Close"
UI_STRINGS.pagination.nextLabel // "Go to next page"
```

## Language

**The defaults are in English.** This is not an editorial preference: it is the
language the components are distributed in, just like their prop names. Any
other locale is supplied by the caller.

A string that names something only the caller knows is a function of it:
`UI_STRINGS.combobox.remove("Apple")` returns `"Remove Apple"`. A translation
supplies the whole sentence, so each language puts the name where its grammar
wants it.

## Overriding

Every string can be reached through a prop, never through a fork of the
component. The table lists every key of `UI_STRINGS`, the prop that replaces it
and its default; `npm run index:strings` fails when a key is missing, unknown
or its default differs from the code.

| Key                             | Component                        | Prop                | Default                        |
| ------------------------------- | -------------------------------- | ------------------- | ------------------------------ |
| `breadcrumb.landmark`           | `Breadcrumb`                     | `aria-label`        | `Breadcrumb`                   |
| `breadcrumb.ellipsis`           | `BreadcrumbEllipsis`             | `srLabel`           | `More`                         |
| `carousel.previous`             | `CarouselPrevious`               | `srLabel`           | `Previous slide`               |
| `carousel.next`                 | `CarouselNext`                   | `srLabel`           | `Next slide`                   |
| `combobox.trigger`              | `ComboboxTrigger`                | `triggerLabel`      | `Open list`                    |
| `combobox.clear`                | `ComboboxClear`                  | `clearLabel`        | `Clear selection`              |
| `combobox.remove(item)`         | `ComboboxChip`                   | `removeLabel`       | `Remove {item}`                |
| `command.dialogTitle`           | `CommandDialog`                  | `title`             | `Command palette`              |
| `command.dialogDescription`     | `CommandDialog`                  | `description`       | `Search for a command to run…` |
| `dialog.close`                  | `DialogContent` / `DialogFooter` | `closeLabel`        | `Close`                        |
| `illustration.alt`              | `Illustration`                   | `alt`               | `Illustration`                 |
| `messageScroller.viewport`      | `MessageScrollerViewport`        | `aria-label`        | `Messages`                     |
| `messageScroller.scrollToEnd`   | `MessageScrollerButton`          | `children`          | `Scroll to end`                |
| `messageScroller.scrollToStart` | `MessageScrollerButton`          | `children`          | `Scroll to start`              |
| `pagination.landmark`           | `Pagination`                     | `aria-label`        | `Pagination`                   |
| `pagination.previousText`       | `PaginationPrevious`             | `text`              | `Previous`                     |
| `pagination.previousLabel`      | `PaginationPrevious`             | `label`             | `Go to previous page`          |
| `pagination.nextText`           | `PaginationNext`                 | `text`              | `Next`                         |
| `pagination.nextLabel`          | `PaginationNext`                 | `label`             | `Go to next page`              |
| `pagination.ellipsis`           | `PaginationEllipsis`             | `srLabel`           | `More pages`                   |
| `passwordInput.show`            | `PasswordInput`                  | `showLabel`         | `Show password`                |
| `passwordInput.hide`            | `PasswordInput`                  | `hideLabel`         | `Hide password`                |
| `questionnaire.progress`        | `QuestionnaireProgress`          | `aria-label`        | `Questionnaire progress`       |
| `questionnaire.previous`        | `QuestionnairePrevious`          | `children`          | `Previous`                     |
| `questionnaire.skip`            | `QuestionnaireSkip`              | `children`          | `Skip`                         |
| `questionnaire.next`            | `QuestionnaireNext`              | `children`          | `Next`                         |
| `questionnaire.submit`          | `QuestionnaireSubmit`            | `children`          | `Submit`                       |
| `sheet.close`                   | `SheetContent`                   | `closeLabel`        | `Close`                        |
| `sidebar.toggle`                | `SidebarTrigger` / `SidebarRail` | `toggleLabel`       | `Show or hide the sidebar`     |
| `sidebar.mobileTitle`           | `Sidebar` (mobile Sheet)         | `mobileTitle`       | `Sidebar`                      |
| `sidebar.mobileDescription`     | `Sidebar` (mobile Sheet)         | `mobileDescription` | `Displays the mobile sidebar.` |
| `spinner.label`                 | `Spinner`                        | `aria-label`        | `Loading`                      |

To translate a whole application, pass the props from the application's own
i18n layer. `UI_STRINGS` reads no locale and is not reactive: it is a set of
defaults, not a translation system.

## Usage Rules

- ✅ Read every default string from `UI_STRINGS`, never as a literal in the JSX
- ✅ Expose an override prop for every string a component renders
- ✅ Write the defaults in English; supply the other locales through props
- ❌ Never hard-code an `aria-label`, a `title` or `sr-only` text in a component
- ❌ Never mix two languages in the defaults — `npm run index:strings` fails on any literal

## Guard

`scripts/lint-ui-strings.ts` (`npm run index:strings`) fails on any
`aria-label`, `title`, `alt` or `sr-only` text written as a literal in
`components/ui/`, and on any literal text inside a `*Title` or `*Description`
element there. Values that belong to the ARIA grammar
(`aria-label="true"`, `aria-live="polite"`…) are not text and are not flagged.
It also fails when the Overriding table above misses a key of `UI_STRINGS`,
names one the code does not have, or gives a default the code does not.
