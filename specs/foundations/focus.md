# Focus Foundation

> Source: `lib/focus.ts` · Token: `space.focus-ring-width` · CSS variable: `--space-focus-ring-width` · Linter: `npm run tokens:lint-focus`

One focus ring, one width, one source. Every focusable element in the system
shows the same indicator: a **solid 1px part** in the ring color, at 3:1 or
more against what it is drawn on, and a **2px** halo in `ring/50` around it.
The solid part is the border, turned `border-ring`; an element without a
border draws a 1px `outline-ring` outline instead. No component describes its
own focus.

---

## The problem this foundation solves

Before it existed, the repository held **16 different focus patterns across 30
sites**, spread over 21 components — three different widths (`ring-1`,
`ring-2`, `ring-3`), two reset mechanisms (`outline-none`, `outline-hidden`)
and several color combinations.

Worse: the `ring-focus` class, used by **Toggle, ScrollArea and Calendar**,
never existed. `--ring-*` is not a Tailwind v4 theme namespace: declaring
`--ring-focus` in `@theme inline` created a custom property and nothing else.
No CSS rule was emitted. Those three components shipped **with no visible focus
indicator at all** — a failure of
[WCAG 2.2 SC 2.4.7 (Focus Visible), level A](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible).

Nothing failed: not the build, not the typecheck, not the bridge lint, which
accepted `--ring-focus` because its _reference_ resolved. A reference that
resolves is not a utility that exists.

---

## The token

| Token                    | CSS Variable               | Value | Why                                                                                                                                              |
| ------------------------ | -------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `space.focus-ring-width` | `--space-focus-ring-width` | `2px` | A middle ground between the original `3px`, unusually thick, and the `1px` used most in the code, too thin to stay visible on a light background |

The Tailwind v4 syntax that reads a token as a ring length is
`ring-(length:--token-name)`. It compiles as expected:

```css
.focus-visible\:ring-\(length\:--space-focus-ring-width\):focus-visible {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
    calc(var(--space-focus-ring-width) + var(--tw-ring-offset-width))
    var(--tw-ring-color, currentcolor);
  box-shadow: …;
}
```

---

## The presets

All exported by `lib/focus.ts`. A component imports them; it does not rebuild
them.

| Constant                 | When                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `FOCUS_RING`             | The general case. Border, ring and color. **The default for every focusable element.** Without a border, add the solid outline of rule 6 |
| `FOCUS_RING_WIDTH`       | The width alone, when the element supplies its own ring color — as Sidebar does with `ring-sidebar-ring`                                 |
| `FOCUS_RING_DESTRUCTIVE` | A color override for a destructive or invalid state. Composed **after** `FOCUS_RING`                                                     |
| `FOCUS_RING_WITHIN`      | The same ring, triggered by the focus of a descendant — InputGroup, Combobox                                                             |
| `FOCUS_OUTLINE_RESET`    | Neutralizes the native outline. **Always instead of `outline-none`**                                                                     |

```ts
import { FOCUS_RING, FOCUS_OUTLINE_RESET } from "@/lib/focus"

const buttonVariants = cva(
  `inline-flex items-center ${FOCUS_OUTLINE_RESET} ${FOCUS_RING}`,
  {
    variants: {
      // …
    },
  }
)
```

---

## Usage Rules

1. **Never hard-code a ring width on a focus state** — `ring-1`, `ring-2` and
   `ring-3` are pixels, forbidden by the repository's first rule. The linter
   rejects them under any `focus`, `focus-visible`, `focus-within`,
   `data-[active=true]`, `data-[focused=true]` or `aria-invalid` prefix.
2. **Never `outline-none`** — use `FOCUS_OUTLINE_RESET` (`outline-hidden`). In
   forced-colors mode, `box-shadow`s are not painted: `outline-none` leaves the
   element with no indicator at all, whereas `outline-hidden` keeps a
   transparent outline that the mode makes visible. Both set
   `--tw-outline-style` to none, which silently disabled the `outline-1` of
   ScrollArea and NavigationMenu: an outline drawn at focus after a reset
   takes `outline-solid` (rule 6).
3. **The invalid state colors the ring, never sizes it** — a control's
   `aria-invalid:` utilities set the border and the ring color; the width
   comes from the focus state only. A ring always on for an invalid field
   looks the same with and without focus, and keyboard focus disappears on it
   (WCAG 2.4.7) — caught by `tests/examples.test.tsx`. A group that wraps
   several controls (InputOTP, the Combobox chips) may keep a ring on
   `has-aria-invalid:`: focus shows on the control inside it.
4. **A bare `ring-0` is a legitimate removal** — it is how a wrapper such as
   InputGroup takes over the indicator of its inner control, and how a choice
   card (a `FieldLabel` that wraps a `Field`) takes over the ring of the
   Checkbox, RadioGroupItem or Switch inside it: one ring, the card's, and the
   control keeps its resting border. Under a focus state
   (`focus-visible:ring-0`) it removes the indicator, and counts as a reset
   under rule 5. Scope it to the wrapper that draws the ring
   (`group-has-[>[data-slot=field]]/field-label:`): a control in a plain
   `FieldLabel` keeps its own.
5. **Hiding the outline requires drawing a ring — checked occurrence by
   occurrence, and target by target.** The ring must appear in the _same_ class
   string, on the _same_ target: a reset written under `**:`, `*:`,
   `[&_x]:` or `before:` hides the indicator of other nodes, and only a ring
   under the same variant answers it. A component that neutralizes the outline
   in ten places and draws a ring in one does not meet the rule, and neither
   did NavigationMenu, whose `**:data-[slot=navigation-menu-link]:focus:outline-none`
   hid every link's ring while the menu drew its own.

   Six replacement mechanisms are allowed, each declared by a
   `// focus-managed: <mechanism>` comment, which the linter requires to be
   non-empty:

   | Mechanism                                                                                                                                                                                                                                                              | Components                                                                |
   | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
   | Roving focus: Radix menus move a roving tabindex across their items, and Select moves focus onto the highlighted option; the current one is marked with `focus:bg-accent` or `data-highlighted:bg-accent`                                                              | DropdownMenu, ContextMenu, Menubar, Select                                |
   | Active descendant: focus stays in the input, which points at the current item with `aria-activedescendant`; the item is marked with `data-highlighted:bg-accent` (Base UI) or `data-selected:bg-muted` (cmdk)                                                          | Command, Combobox                                                         |
   | Ring drawn by the wrapper: the control sits in an InputGroup that carries `has-[[data-slot=input-group-control]:focus-visible]` (CommandInput's group carries the same rule for its own `command-input` slot)                                                          | CommandInput, ComboboxInput, InputGroupInput, InputGroupTextarea          |
   | Programmatically focused surface: Radix mounts the overlay with `tabIndex={-1}`, then moves focus to a control inside it                                                                                                                                               | Dialog, AlertDialog, Popover, DropdownMenu, ContextMenu, Menubar, Command |
   | A surface that takes no focus: Radix HoverCard mounts no focus scope, so the card opens from its trigger and is never the focused element; a control inside it is reached with Tab and draws its own ring                                                              | HoverCard                                                                 |
   | Ring drawn by the container: ChartContainer draws the ring and a 1px outline while anything inside it is `:focus-visible` (`has-focus-visible`). The tooltip Recharts shows on focus is no indicator: it shows on the first focus only, and never without ChartTooltip | Chart                                                                     |

   These mechanisms signal focus **through color alone**. They remain
   acceptable because focus always comes with visible movement through a list,
   but they are not suitable for a standalone control.

6. **Every indicator has a solid part at 3:1.** The 2px halo is painted at
   50% (`ring-ring/50`, `ring-destructive/20`): about 1.9:1, and 1.4:1 for the
   destructive one, never enough on its own
   ([WCAG 2.2 SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
   read for focus indicators). The solid part is the element's border when it
   has one (`focus-visible:border-ring`). Without a border, `focus-visible:border-ring`
   paints nothing: the element adds a 1px outline,
   `focus-visible:outline-solid focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring`
   (Toggle's default variant, MenubarTrigger, NavigationMenu's trigger and
   link, TabsContent, the ScrollArea viewport, the Resizable handle, the
   Slider thumb, a focused Calendar day). `outline-solid` is required:
   `outline-hidden` sets the outline style to none, and a width alone would
   draw nothing. A state that keeps its border at focus draws the outline in
   its own color: an invalid control (`aria-invalid:focus-visible:outline-destructive`)
   and the destructive variants of Button and Badge (`outline-destructive`).
   An element that draws no focus style at all, a link or an unstyled trigger,
   keeps the browser's own outline, colored `outline-ring` at full alpha by the
   base layer of `styles/globals.css`. `tests/focus.ts` walks every tab stop of
   every spec example, light and dark, and fails one whose indicator has no
   part at 3:1, the color composited over what is under it.

---

## Contrast

`npm run tokens:lint-contrast` checks the solid part of the indicator against
the WCAG 2.2 SC 1.4.11 threshold of **3:1** for a user-interface component, in
both modes, and reports the halo as it is painted, at the alpha `lib/focus.ts`
gives it:

| Pair                                                                   | Light | Dark |
| ---------------------------------------------------------------------- | ----- | ---- |
| solid part (`border-ring`, `outline-ring`) on the page                 | 4.61  | 8.08 |
| solid part on the card                                                 | 4.14  | 6.06 |
| solid part on the popover                                              | 4.61  | 7.12 |
| solid part on a field's `dark:bg-input/30` fill over the card          | —     | 5.27 |
| invalid or destructive solid part on the page                          | 4.77  | 6.83 |
| invalid or destructive solid part on the card                          | 4.28  | 5.12 |
| invalid or destructive solid part on the popover                       | 4.77  | 6.02 |
| sidebar focus ring on the sidebar surface                              | 4.44  | 3.77 |
| halo (`ring-ring/50`) on the page, information only                    | 1.93  | 2.80 |
| destructive halo (`ring-destructive/20`, dark `/40`), information only | 1.44  | 1.95 |

`color.border.focus` is lighter in dark mode (`mist.400`, `mist.500` in light):
at the light value, an InputGroupButton on a field's dark fill over a card
measured 2.80:1.

---

## Guard

`scripts/lint-focus-ring.ts`, wired into `npm run tokens-validate` and CI. Four
rules, each matching a bug that actually shipped (the solid part of rule 6 is
measured on the rendered page, by `tests/focus.ts`):

| Rule           | What it blocks                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `dead-class`   | `ring-focus`, the class that never existed                                                                                                     |
| `raw-width`    | a focus ring width in pixels                                                                                                                   |
| `outline-none` | the reset that erases the indicator in forced-colors mode                                                                                      |
| `no-indicator` | a class string that hides the outline, or removes a focus ring, on a target without drawing a ring on that same target, or declaring what does |
