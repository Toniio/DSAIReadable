# Content — default strings and localization

## Principle

A component does not decide which words it displays. The only strings it
produces without being asked are the **accessible names** of controls that have
no visible label — a `Dialog`'s close cross, a `Carousel`'s arrows, a
`PasswordInput`'s toggle — plus the names of the two landmarks (`Breadcrumb`,
`Pagination`).

They all live in `lib/ui-strings.ts`, in a frozen `UI_STRINGS` object.

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
component.

| Component                               | Prop                               | Default                                    |
| --------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `BreadcrumbEllipsis`                    | `srLabel`                          | `More`                                     |
| `CarouselPrevious` / `CarouselNext`     | `srLabel`                          | `Previous slide` / `Next slide`            |
| `DialogContent` / `DialogFooter`        | `closeLabel`                       | `Close`                                    |
| `SheetContent`                          | `closeLabel`                       | `Close`                                    |
| `Illustration`                          | `alt`                              | `Illustration`                             |
| `PaginationPrevious` / `PaginationNext` | `text`, `label`                    | `Previous` / `Go to previous page`         |
| `PaginationEllipsis`                    | `srLabel`                          | `More pages`                               |
| `Spinner`                               | `aria-label`                       | `Loading`                                  |
| `ComboboxTrigger` / `ComboboxClear`     | `triggerLabel` / `clearLabel`      | `Open list` / `Clear selection`            |
| `ComboboxChip`                          | `removeLabel`                      | `Remove <item>`                            |
| `Sidebar` (mobile Sheet)                | `mobileTitle`, `mobileDescription` | `Sidebar` / `Displays the mobile sidebar.` |
| `SidebarTrigger` / `SidebarRail`        | `toggleLabel`                      | `Toggle Sidebar`                           |
| `PasswordInput`                         | `showLabel` / `hideLabel`          | `Show password` / `Hide password`          |

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
