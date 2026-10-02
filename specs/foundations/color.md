# Color Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

---

## Semantic Tokens

### Background

| Token                       | CSS Variable                  | Light                | Dark                 | Usage                                                   |
| --------------------------- | ----------------------------- | -------------------- | -------------------- | ------------------------------------------------------- |
| `color.background.default`  | `--color-background-default`  | `#ffffff` (mist.0)   | `#090b0c` (mist.950) | Main surface — the root page, the body                  |
| `color.background.subtle`   | `--color-background-subtle`   | `#f1f3f3` (mist.100) | `#22292b` (mist.800) | Secondary surfaces — cards, muted areas                 |
| `color.background.elevated` | `--color-background-elevated` | `#ffffff` (mist.0)   | `#161b1d` (mist.900) | Floating surfaces — popovers, drop-downs, dialogs       |
| `color.background.inverse`  | `--color-background-inverse`  | `#090b0c` (mist.950) | `#ffffff` (mist.0)   | Inverted surfaces — dark tooltips, high-contrast badges |

**Do / Don't:**

- ✅ `background.default` — the background of `<html>` and of root containers.
- ❌ Do not use `background.default` for cards — use `background.subtle`.
- ✅ `background.elevated` for anything that floats above the content (a menu, a dialog).
- ❌ Do not use `background.elevated` for an inline card — it is not a floating surface.

---

### Text

| Token                            | CSS Variable                       | Light       | Dark        | Usage                                                                  |
| -------------------------------- | ---------------------------------- | ----------- | ----------- | ---------------------------------------------------------------------- |
| `color.text.default`             | `--color-text-default`             | mist.950    | mist.50     | Main body text, headings                                               |
| `color.text.subtle`              | `--color-text-subtle`              | mist.600    | mist.400    | Secondary text — captions, helper text, metadata                       |
| `color.text.bold`                | `--color-text-bold`                | mist.950    | mist.50     | High-contrast emphasized text                                          |
| `color.text.inverse`             | `--color-text-inverse`             | mist.0      | mist.950    | Text on an inverse surface (a dark background in light mode)           |
| `color.text.action.default`      | `--color-text-action-default`      | violet.600  | violet.400  | Links, primary action labels                                           |
| `color.text.action.on`           | `--color-text-action-on`           | violet.50   | violet.50   | Text on an `action.background.default` background                      |
| `color.text.destructive.default` | `--color-text-destructive-default` | red.800     | red.300     | Error messages, destructive labels, on a surface or a tint             |
| `color.text.success.default`     | `--color-text-success-default`     | emerald.800 | emerald.300 | Success messages and labels, on a surface or a tint                    |
| `color.text.warning.default`     | `--color-text-warning-default`     | amber.700   | amber.300   | Warning messages and labels, and warning icons, on a surface or a tint |

**Do / Don't:**

- ✅ `text.subtle` for field labels, visible placeholders, metadata.
- ❌ Do not dim `text.default` with opacity to fake `text.subtle` — use the dedicated token.
- ✅ `text.action.on` only on a `color.action.background.default` background.
- ❌ Do not use `text.destructive.default` for warnings — it is reserved for errors. A warning is `text.warning.default` (`text-warning`), a success `text.success.default` (`text-success`).
- ✅ `text.destructive.default` for every destructive label, including on a `bg-destructive/10`–`/30` tint: it is darker than the error fill in light mode and lighter in dark mode, so it stays at 4.5:1 or more on the page, a card and a popover.

---

### Border

| Token                  | CSS Variable             | Light    | Dark           | Usage                                      |
| ---------------------- | ------------------------ | -------- | -------------- | ------------------------------------------ |
| `color.border.default` | `--color-border-default` | mist.200 | white-alpha.10 | Standard separators, component outlines    |
| `color.border.subtle`  | `--color-border-subtle`  | mist.200 | white-alpha.10 | Discreet separators, minimal visual weight |
| `color.border.input`   | `--color-border-input`   | mist.200 | white-alpha.15 | The border of form fields                  |
| `color.border.focus`   | `--color-border-focus`   | mist.500 | mist.500       | Focus ring for keyboard accessibility      |

**Do / Don't:**

- ✅ `border.input` for every `<input>`, `<select>` and `<textarea>` border.
- ❌ Do not use `border.focus` at rest or on hover — only for the `:focus-visible` state.
- ✅ `border.subtle` for dividers between the sections of a page.
- ❌ Do not mix `border.default` and `border.subtle` in the same component.

---

### Icon

| Token                | CSS Variable           | Light     | Dark      | Usage                                             |
| -------------------- | ---------------------- | --------- | --------- | ------------------------------------------------- |
| `color.icon.default` | `--color-icon-default` | mist.950  | mist.50   | Main icon in a neutral context                    |
| `color.icon.subtle`  | `--color-icon-subtle`  | mist.500  | mist.400  | Secondary, disabled or decorative icon            |
| `color.icon.action`  | `--color-icon-action`  | violet.50 | violet.50 | Icon on an `action.background.default` background |

**Do / Don't:**

- ✅ `icon.action` only inside a primary button or an action badge.
- ❌ Do not use `icon.default` for an icon inside a primary button — use `icon.action`.

---

### Action

| Token                                | CSS Variable                           | Light      | Dark       | Usage                                             |
| ------------------------------------ | -------------------------------------- | ---------- | ---------- | ------------------------------------------------- |
| `color.action.background.default`    | `--color-action-background-default`    | violet.600 | violet.700 | Background of the primary CTA button or component |
| `color.action.background.foreground` | `--color-action-background-foreground` | violet.50  | violet.50  | Text or icon on the primary action background     |

**Do / Don't:**

- ✅ Always pair `action.background.default` with `action.background.foreground` for the text.
- ❌ Do not use these tokens for the `secondary`, `ghost` or `outline` variants.

---

### Feedback

| Token                               | CSS Variable                          | Light       | Dark        | Usage                                                                  |
| ----------------------------------- | ------------------------------------- | ----------- | ----------- | ---------------------------------------------------------------------- |
| `color.feedback.error.default`      | `--color-feedback-error-default`      | red.600     | red.500     | Fill, tint, border or ring of an error state                           |
| `color.feedback.error.foreground`   | `--color-feedback-error-foreground`   | mist.0      | mist.950    | Text or icon placed **on** a solid error surface                       |
| `color.feedback.success.default`    | `--color-feedback-success-default`    | emerald.700 | emerald.400 | Fill, tint or border of a success state                                |
| `color.feedback.success.foreground` | `--color-feedback-success-foreground` | mist.0      | mist.950    | Text or icon placed **on** a solid success surface                     |
| `color.feedback.warning.default`    | `--color-feedback-warning-default`    | amber.450   | amber.400   | Fill or tint of a warning state — never a border or an icon on its own |
| `color.feedback.warning.foreground` | `--color-feedback-warning-foreground` | mist.950    | mist.950    | Text or icon placed **on** a solid warning surface, dark in both modes |

**Do / Don't:**

- ✅ Use `feedback.error.default` for the borders and rings of invalid fields and for the `bg-destructive/10`–`/30` tints.
- ❌ Do not use `feedback.error.default` for text or icons: on a card it drops to 4.28:1, and to 3.00:1 on a card under a 20% tint. Text goes through `text.destructive.default` (`text-destructive`).
- ✅ On a solid error background, always use `color.feedback.error.foreground` (shadcn alias `--destructive-foreground`).
- ❌ Do not use the error tokens for warnings or successes: each state has its own fill, foreground and text token. The Alert and Badge `success` and `warning` variants use them.
- ✅ Success and warning follow the error's split: the fill (`bg-success`, `bg-warning`, their `/10`–`/30` tints) and a text token (`text-success`, `text-warning`) that stays at 4.5:1 on every surface and tint.
- ❌ Do not use `feedback.warning.default` as a border or an icon: in light mode it reaches 1.92:1 on white. The icon of a warning takes `text-warning`.
- ❌ Never carry a state by color alone: success green and error red look alike to a red-green color-blind reader. An icon or a word says it too.
- ✅ There is no `info` state: a neutral message is the `default` Alert. The naming grammar keeps the `info` role free for the day a component needs one.
- ❌ Never put hard-coded white on an error surface: in dark mode, white on red.500 drops to 2.89:1.

---

### Chart

Two palettes, for two kinds of data. Mixing them up is the mistake that
`npm run tokens:lint-chart` and this table exist to prevent.

**Categorical** — categories with **no order** (expense lines, products,
channels). Series are told apart by **hue**. Every series reaches 3:1 against
the `default`, `subtle` and `elevated` backgrounds of its mode (WCAG 1.4.11),
and every pair stays distinct under normal vision, protanopia and deuteranopia
(OKLab distance ≥ 0.15; the current palette's worst pair is at 0.19).

| Token           | CSS Variable      | Light                | Dark                 | Tailwind     |
| --------------- | ----------------- | -------------------- | -------------------- | ------------ |
| `color.chart.1` | `--color-chart-1` | violet.600 `#432dd7` | violet.400 `#6e6cff` | `bg-chart-1` |
| `color.chart.2` | `--color-chart-2` | blue.600 `#438fbd`   | blue.300 `#8fd6fa`   | `bg-chart-2` |
| `color.chart.3` | `--color-chart-3` | amber.600 `#af8526`  | yellow.200 `#e5e747` | `bg-chart-3` |
| `color.chart.4` | `--color-chart-4` | plum.800 `#4d2761`   | plum.500 `#9b5f7c`   | `bg-chart-4` |
| `color.chart.5` | `--color-chart-5` | amber.800 `#734e00`  | amber.500 `#c89005`  | `bg-chart-5` |

**Sequential** — **ordered** data (intensity, density, heatmaps). The steps
differ only in lightness, from lightest to darkest; they do not separate
categories. Status `reserved`: no component uses it yet, and it has no Tailwind
class — read it through `var(--color-chart-sequential-N)`.

| Token                      | CSS Variable                 | Value (both modes)  |
| -------------------------- | ---------------------------- | ------------------- |
| `color.chart.sequential.1` | `--color-chart-sequential-1` | green.200 `#bbf451` |
| `color.chart.sequential.2` | `--color-chart-sequential-2` | green.300 `#7ccf00` |
| `color.chart.sequential.3` | `--color-chart-sequential-3` | green.400 `#5ea500` |
| `color.chart.sequential.4` | `--color-chart-sequential-4` | green.500 `#497d00` |
| `color.chart.sequential.5` | `--color-chart-sequential-5` | green.600 `#3c6300` |

**Do / Don't:**

- ✅ Unordered categories: `chart-1` to `chart-5`, in order, skipping none.
- ✅ Back every color up with a label or a legend: color alone never carries meaning.
- ✅ Ordered data: `color.chart.sequential.*`, from lightest (low value) to darkest.
- ❌ Never use the sequential palette for categories: its steps blur together.
- ❌ Do not use a series color for text or for a state (positive, negative): these are not feedback colors.

---

### Static

Colors that **ignore the mode** — the only ones that do. Tailwind's default
palette is removed (`--color-*: initial` in `styles/globals.css`): `bg-white` and
`bg-black` only exist because these two tokens declare them.

| Token                | CSS Variable           | Light / Dark     | Tailwind      | Usage                                 |
| -------------------- | ---------------------- | ---------------- | ------------- | ------------------------------------- |
| `color.static.white` | `--color-static-white` | mist.0 `#ffffff` | `bg-white`    | Slider thumb, text on a photo         |
| `color.static.black` | `--color-static-black` | black `#000000`  | `bg-black/10` | Scrim behind a modal, with an opacity |

- ✅ `bg-black/10` for a modal's scrim: it darkens the same way in both modes.
- ❌ Do not use `static.*` for a regular surface or text: dark mode would not apply — use `background.*` / `text.*`.

---

### Sidebar

| Token                             | CSS Variable                        | Light      | Dark           | Usage                                        |
| --------------------------------- | ----------------------------------- | ---------- | -------------- | -------------------------------------------- |
| `color.sidebar.background`        | `--color-sidebar-background`        | mist.50    | mist.900       | Background of the side navigation panel      |
| `color.sidebar.foreground`        | `--color-sidebar-foreground`        | mist.950   | mist.50        | Default text or icon in the sidebar          |
| `color.sidebar.primary.default`   | `--color-sidebar-primary-default`   | violet.550 | violet.500     | Background of the active navigation item     |
| `color.sidebar.primary.on`        | `--color-sidebar-primary-on`        | violet.50  | mist.0         | Text on the sidebar's active item            |
| `color.sidebar.accent.default`    | `--color-sidebar-accent-default`    | mist.100   | mist.800       | Hover or accent background of a sidebar item |
| `color.sidebar.accent.foreground` | `--color-sidebar-accent-foreground` | mist.900   | mist.50        | Text on the sidebar's accent background      |
| `color.sidebar.border`            | `--color-sidebar-border`            | mist.200   | white-alpha.10 | The sidebar's inner separator                |
| `color.sidebar.ring`              | `--color-sidebar-ring`              | mist.500   | mist.500       | Focus ring of the sidebar's navigable items  |

---

## Modes

### Dark Mode

Turned on by the `.dark` class on `<html>`. Every override is defined in
`tokens.css` under the `.dark` selector. The color tokens switch automatically —
**never hard-code** primitive values in components.

```html
<!-- Automatic — nothing else to do -->
<html class="dark"></html>
```

---

## Tailwind Classes

The tokens are exposed through `@theme inline` in `globals.css`, which generates
these utility classes:

| Class                     | Token                                                    |
| ------------------------- | -------------------------------------------------------- |
| `bg-background`           | `color.background.default`                               |
| `bg-card`                 | `color.background.subtle`                                |
| `bg-popover`              | `color.background.elevated`                              |
| `text-foreground`         | `color.text.default`                                     |
| `text-muted-foreground`   | `color.text.subtle`                                      |
| `text-primary`            | `color.text.action.default` (through the shadcn mapping) |
| `text-destructive`        | `color.text.destructive.default`                         |
| `bg-destructive`          | `color.feedback.error.default`                           |
| `text-success`            | `color.text.success.default`                             |
| `bg-success`              | `color.feedback.success.default`                         |
| `text-success-foreground` | `color.feedback.success.foreground`                      |
| `text-warning`            | `color.text.warning.default`                             |
| `bg-warning`              | `color.feedback.warning.default`                         |
| `text-warning-foreground` | `color.feedback.warning.foreground`                      |
| `border-border`           | `color.border.default`                                   |
| `border-input`            | `color.border.input`                                     |
| `ring-ring`               | `color.border.focus`                                     |

---

## Usage Rules

1. **Always use the semantic tokens** — never the `mist.X` or `violet.X` primitive values directly in components. Primitives are private (`--ds-prim-*`).
2. **Never fake subtlety with opacity** — use `color.text.subtle`, not `color.text.default` with `opacity-50`.
3. **Follow the surface hierarchy**: `default` → `subtle` → `elevated`. A card is `subtle`, a popover is `elevated`.
4. **Always test both modes** — every component must be checked in light AND dark before it ships.
5. **Accessibility first** — the conformance target is WCAG 2.2 AA: the minimum contrast ratio is 4.5:1 for body text (SC 1.4.3), and 3:1 for large text and UI components (SC 1.4.11).
6. **Contrast is checked mechanically** — `npm run tokens:lint-contrast` (part of `npm run tokens-validate`) resolves every background / text pair the system actually ships, in both modes, and fails below the threshold. The pairs under watch are declared in `scripts/lint-contrast.ts`: **add a pair as soon as a new background / text combination appears in the system**, otherwise nothing covers it. A pair is checked as it renders: a `bg-<role>/<n>` tint is composited onto each surface it can sit on (page, card, popover), in each state (rest, hover, focus), before the ratio is measured. Fix the token, never the threshold.
7. **APCA is advisory, WCAG 2 decides** — the same lint prints a second level: the APCA lightness contrast (Lc) of every pair, against Lc 60 for text and Lc 45 for non-text (APCA Bronze Simple Mode), tagged as WCAG 3 preparation. WCAG 3 is a Working Draft and regulations cite WCAG 2.x, so an APCA warning never fails the build and never justifies a token change that lowers a WCAG 2 ratio below its threshold. Weigh the warnings when a palette step changes for another reason, and keep the change only if both levels hold or improve.

## Measured contrast

WCAG 2.x ratios of the pairs under watch, as of the fix of the 6 failures on 2026-09-17; the focus rows as of the dark `color.border.focus` of 0.1.2.

| Pair                                                          | Light | Dark  | Threshold |
| ------------------------------------------------------------- | ----- | ----- | --------- |
| focus indicator's solid part on the `default` surface         | 4.61  | 8.08  | 3.0       |
| focus indicator's solid part on the `subtle` surface          | 4.14  | 6.06  | 3.0       |
| sidebar focus ring on the sidebar surface                     | 4.44  | 3.77  | 3.0       |
| `text.default` on `background.default`                        | 19.72 | 18.99 | 4.5       |
| `text.subtle` on `background.default`                         | 5.10  | 8.08  | 4.5       |
| `text.subtle` on `background.subtle` (`muted-foreground`)     | 4.58  | 6.06  | 4.5       |
| `text.action.default` on `background.default`                 | 8.09  | 4.93  | 4.5       |
| `action.background.foreground` on `action.background.default` | 7.24  | 8.99  | 4.5       |
| `feedback.error.foreground` on `feedback.error.default`       | 4.77  | 6.83  | 4.5       |
| `sidebar.primary.on` on `sidebar.primary.default`             | 5.78  | 4.58  | 4.5       |
| `text.destructive.default` on the card                        | 7.50  | 7.71  | 4.5       |
| `text.destructive.default` on the weakest destructive tint    | 5.25  | 4.90  | 4.5       |
| `feedback.success.foreground` on `feedback.success.default`   | 5.36  | 10.17 | 4.5       |
| `text.success.default` on the card                            | 6.83  | 9.72  | 4.5       |
| `text.success.default` on the weakest success tint            | 5.20  | 6.49  | 4.5       |
| `feedback.warning.foreground` on `feedback.warning.default`   | 9.24  | 11.45 | 4.5       |
| `text.warning.default` on the card                            | 6.36  | 10.22 | 4.5       |
| `text.warning.default` on the weakest warning tint            | 5.53  | 6.53  | 4.5       |

Primitive steps added to get there: **`mist.600`** (`#607175`), **`mist.700`**
(`#424f52`, which fills the 500 → 800 gap and keeps the scale monotonic) and
**`violet.400`** (`#6e6cff`). The destructive rows date from 2026-09-29: the
labels had been measured only against the solid fill, and read at 3.00:1 on a
card under the hover tint. **`red.800`** (`#9f0712`) and **`red.300`**
(`#ffa2a2`) keep the hue and give the text its own token; the weakest tint is
the 20% hover tint over a card in light mode and the 30% one in dark mode.
The success and warning rows date from the same day (P4-19): new primitives
**`emerald.300`**, **`.400`**, **`.700`**, **`.800`** and **`amber.300`**,
**`.400`**, **`.450`**, **`.700`**, taken from Tailwind v4's palette like the
red steps; their weakest tint is the 20% one over a card in both modes.
