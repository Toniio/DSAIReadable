# Focus Foundation

> Source: `lib/focus.ts` · Token: `space.focus-ring-width` · CSS variable: `--space-focus-ring-width` · Linter: `npm run tokens:lint-focus`

One focus ring, one width, one source. Every focusable element in the system
shows the same indicator: a **2px** ring in `ring/50`, paired with a change of
border color. No component describes its own focus.

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

| Constant                 | When                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `FOCUS_RING`             | The general case. Border, ring and color. **The default for every focusable element.**                   |
| `FOCUS_RING_WIDTH`       | The width alone, when the element supplies its own ring color — as Sidebar does with `ring-sidebar-ring` |
| `FOCUS_RING_DESTRUCTIVE` | A color override for a destructive or invalid state. Composed **after** `FOCUS_RING`                     |
| `FOCUS_RING_WITHIN`      | The same ring, triggered by the focus of a descendant — InputGroup, Combobox                             |
| `FOCUS_OUTLINE_RESET`    | Neutralizes the native outline. **Always instead of `outline-none`**                                     |

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
   transparent outline that the mode makes visible. On top of that,
   `outline-none` poisons `--tw-outline-style`, which silently disabled the
   `outline-1` of ScrollArea and NavigationMenu.
3. **The invalid state colors the ring, never sizes it** — a control's
   `aria-invalid:` utilities set the border and the ring color; the width
   comes from the focus state only. A ring always on for an invalid field
   looks the same with and without focus, and keyboard focus disappears on it
   (WCAG 2.4.7) — caught by `tests/examples.test.tsx`. A group that wraps
   several controls (InputOTP, the Combobox chips) may keep a ring on
   `has-aria-invalid:`: focus shows on the control inside it.
4. **A bare `ring-0` is a legitimate removal** — it is how a wrapper such as
   InputGroup takes over the indicator of its inner control. Under a focus
   state (`focus-visible:ring-0`) it removes the indicator, and counts as a
   reset under rule 5.
5. **Hiding the outline requires drawing a ring — checked occurrence by
   occurrence, and target by target.** The ring must appear in the _same_ class
   string, on the _same_ target: a reset written under `**:`, `*:`,
   `[&_x]:` or `before:` hides the indicator of other nodes, and only a ring
   under the same variant answers it. A component that neutralizes the outline
   in ten places and draws a ring in one does not meet the rule, and neither
   did NavigationMenu, whose `**:data-[slot=navigation-menu-link]:focus:outline-none`
   hid every link's ring while the menu drew its own.

   Four replacement mechanisms are allowed, each declared by a
   `// focus-managed: <mechanism>` comment, which the linter requires to be
   non-empty:

   | Mechanism                                                                                                                       | Components                                                                           |
   | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
   | Roving focus: Radix moves the tabindex and marks the current item with `focus:bg-accent` or `data-highlighted:bg-accent`        | DropdownMenu, ContextMenu, Menubar, Select, Command, Combobox                        |
   | Ring drawn by the wrapper: the control sits in an InputGroup that carries `has-[[data-slot=input-group-control]:focus-visible]` | CommandInput, ComboboxInput, InputGroupInput, InputGroupTextarea                     |
   | Programmatically focused surface: Radix mounts the overlay with `tabIndex={-1}`, then moves focus to a control inside it        | Dialog, AlertDialog, Popover, HoverCard, DropdownMenu, ContextMenu, Menubar, Command |
   | Chart accessibility layer: Recharts answers focus on the chart surface by showing the tooltip and its cursor on a data point    | Chart                                                                                |

   These mechanisms signal focus **through color alone**. They remain
   acceptable because focus always comes with visible movement through a list,
   but they are not suitable for a standalone control.

---

## Contrast

`npm run tokens:lint-contrast` checks the ring against the WCAG 2.2 SC 1.4.11
threshold of **3:1** for a user-interface component, in both modes:

| Pair                                      | Light | Dark |
| ----------------------------------------- | ----- | ---- |
| focus ring on the default surface         | 4.61  | 4.28 |
| focus ring on the subtle surface          | 4.14  | 3.21 |
| sidebar focus ring on the sidebar surface | 4.44  | 3.77 |

---

## Guard

`scripts/lint-focus-ring.ts`, wired into `npm run tokens-validate` and CI. Four
rules, each matching a bug that actually shipped:

| Rule           | What it blocks                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `dead-class`   | `ring-focus`, the class that never existed                                                                                                     |
| `raw-width`    | a focus ring width in pixels                                                                                                                   |
| `outline-none` | the reset that erases the indicator in forced-colors mode                                                                                      |
| `no-indicator` | a class string that hides the outline, or removes a focus ring, on a target without drawing a ring on that same target, or declaring what does |
