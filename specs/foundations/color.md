# Color Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

---

## Semantic Tokens

### Background

| Token                       | CSS Variable                  | Light                | Dark                          | Usage                                                                      |
| --------------------------- | ----------------------------- | -------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `color.background.default`  | `--color-background-default`  | `#ffffff` (white)    | `#080b0c` (mist.950)          | Main surface — the root page, the body                                     |
| `color.background.subtle`   | `--color-background-subtle`   | `#f1f4f5` (mist.100) | `#21292b` (mist.800)          | Secondary surfaces — cards, muted areas                                    |
| `color.background.elevated` | `--color-background-elevated` | `#ffffff` (white)    | `#151b1d` (mist.900)          | Floating surfaces — popovers, dropdowns, dialogs                           |
| `color.background.input`    | `--color-background-input`    | `#e0e8ea` (mist.200) | white at 15% (white-alpha.15) | The fill of form controls, at an opacity: `bg-input-fill/30`, `/50`, `/80` |
| `color.background.inverse`  | `--color-background-inverse`  | `#080b0c` (mist.950) | `#ffffff` (white)             | Inverted surfaces — dark tooltips, high-contrast badges                    |

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
| `color.text.inverse`             | `--color-text-inverse`             | white       | mist.950    | Text on an inverse surface (a dark background in light mode)           |
| `color.text.action.default`      | `--color-text-action-default`      | violet.600  | violet.300  | Links, primary action labels                                           |
| `color.text.action.on`           | `--color-text-action-on`           | violet.50   | violet.50   | Text on an `action.background.default` background                      |
| `color.text.destructive.default` | `--color-text-destructive-default` | red.700     | red.300     | Error messages, destructive labels, on a surface or a tint             |
| `color.text.success.default`     | `--color-text-success-default`     | emerald.700 | emerald.300 | Success messages and labels, on a surface or a tint                    |
| `color.text.warning.default`     | `--color-text-warning-default`     | amber.600   | amber.300   | Warning messages and labels, and warning icons, on a surface or a tint |

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
| `color.border.input`   | `--color-border-input`   | mist.500 | mist.500       | The boundary of form controls, at 3:1      |
| `color.border.focus`   | `--color-border-focus`   | mist.800 | mist.200       | Focus ring for keyboard accessibility      |

**Do / Don't:**

- ✅ `border.input` for every `<input>`, `<select>`, `<textarea>`, checkbox and radio border, and for the track of an unchecked Switch (`bg-input`): the boundary of a control, at 3:1 or more on the page, the card and the popover in both modes ([WCAG 2.2 SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)), blocking in `npm run tokens:lint-contrast`.
- ❌ Do not paint a field's fill with `border.input` (`bg-input/30`): the translucent fills take `background.input` (`bg-input-fill/30`, `/50`, `/80`), so a darker border never darkens a fill.
- ✅ `border.focus` sits 3:1 or more away from `border.input` (3.65:1 in light, 3.27:1 in dark): a focused field never reads as a resting one.
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
| `color.feedback.error.default`      | `--color-feedback-error-default`      | red.500     | red.400     | Fill, tint, border or ring of an error state                           |
| `color.feedback.error.foreground`   | `--color-feedback-error-foreground`   | white       | mist.950    | Text or icon placed **on** a solid error surface                       |
| `color.feedback.success.default`    | `--color-feedback-success-default`    | emerald.600 | emerald.400 | Fill, tint or border of a success state                                |
| `color.feedback.success.foreground` | `--color-feedback-success-foreground` | white       | mist.950    | Text or icon placed **on** a solid success surface                     |
| `color.feedback.warning.default`    | `--color-feedback-warning-default`    | amber.400   | amber.300   | Fill or tint of a warning state — never a border or an icon on its own |
| `color.feedback.warning.foreground` | `--color-feedback-warning-foreground` | mist.950    | mist.950    | Text or icon placed **on** a solid warning surface, dark in both modes |

**Do / Don't:**

- ✅ Use `feedback.error.default` for the borders and rings of invalid fields and for the `bg-destructive/10`–`/30` tints.
- ❌ Do not use `feedback.error.default` for text or icons: on a card it drops to 4.18:1, and to 2.97:1 on a card under a 20% tint. Text goes through `text.destructive.default` (`text-destructive`).
- ✅ On a solid error background, always use `color.feedback.error.foreground` (shadcn alias `--destructive-foreground`).
- ❌ Do not use the error tokens for warnings or successes: each state has its own fill, foreground and text token. The Alert and Badge `success` and `warning` variants use them.
- ✅ Success and warning follow the error's split: the fill (`bg-success`, `bg-warning`, their `/10`–`/30` tints) and a text token (`text-success`, `text-warning`) that stays at 4.5:1 on every surface and tint.
- ❌ Do not use `feedback.warning.default` as a border or an icon: in light mode it reaches 2.60:1 on white. The icon of a warning takes `text-warning`.
- ❌ Never carry a state by color alone: success green and error red look alike to a red-green color-blind reader. An icon or a word says it too.
- ✅ There is no `info` state: a neutral message is the `default` Alert. The naming grammar keeps the `info` role free for the day a component needs one.
- ❌ Never put hard-coded white on an error surface: in dark mode, white on red.400 drops to 2.73:1.

---

### Chart

Two palettes, for two kinds of data. Mixing them up is the mistake that
`npm run tokens:lint-chart` and this table exist to prevent.

**Categorical** — categories with **no order** (expense lines, products,
channels). Series are told apart by **hue**. Every series reaches 3:1 against
the `default`, `subtle` and `elevated` backgrounds of its mode (WCAG 1.4.11),
and every pair stays distinct under normal vision, protanopia and deuteranopia
(OKLab distance ≥ 0.15; the current palette's worst pair is at 0.18).

| Token           | CSS Variable      | Light                | Dark                 | Tailwind     |
| --------------- | ----------------- | -------------------- | -------------------- | ------------ |
| `color.chart.1` | `--color-chart-1` | violet.700 `#3721b7` | violet.500 `#6362ff` | `bg-chart-1` |
| `color.chart.2` | `--color-chart-2` | blue.500 `#3985b3`   | blue.400 `#61acdc`   | `bg-chart-2` |
| `color.chart.3` | `--color-chart-3` | amber.500 `#b16a00`  | yellow.300 `#cdcf5b` | `bg-chart-3` |
| `color.chart.4` | `--color-chart-4` | plum.800 `#36154a`   | plum.200 `#f0deff`   | `bg-chart-4` |
| `color.chart.5` | `--color-chart-5` | amber.700 `#6f3600`  | amber.500 `#b16a00`  | `bg-chart-5` |

**Sequential** — **ordered** data (intensity, density, heatmaps). The steps
differ only in lightness, from lightest to darkest; they do not separate
categories. Status `reserved`: no component uses it yet, and it has no Tailwind
class — read it through Tailwind's shorthand, `bg-(--color-chart-sequential-N)`
(`fill-(--color-chart-sequential-N)` in an SVG), never `bg-[var(--…)]`.

| Token                      | CSS Variable                 | Value (both modes)  |
| -------------------------- | ---------------------------- | ------------------- |
| `color.chart.sequential.1` | `--color-chart-sequential-1` | green.200 `#d3f2bf` |
| `color.chart.sequential.2` | `--color-chart-sequential-2` | green.300 `#a0dc75` |
| `color.chart.sequential.3` | `--color-chart-sequential-3` | green.400 `#72ba2c` |
| `color.chart.sequential.4` | `--color-chart-sequential-4` | green.500 `#529100` |
| `color.chart.sequential.5` | `--color-chart-sequential-5` | green.600 `#407300` |

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

| Token                | CSS Variable           | Light / Dark    | Tailwind      | Usage                                 |
| -------------------- | ---------------------- | --------------- | ------------- | ------------------------------------- |
| `color.static.white` | `--color-static-white` | white `#ffffff` | `bg-white`    | Slider thumb, text on a photo         |
| `color.static.black` | `--color-static-black` | black `#000000` | `bg-black/10` | Scrim behind a modal, with an opacity |

- ✅ `bg-black/10` for a modal's scrim: it darkens the same way in both modes.
- ❌ Do not use `static.*` for a regular surface or text: dark mode would not apply — use `background.*` / `text.*`.

---

### Sidebar

| Token                             | CSS Variable                        | Light      | Dark           | Usage                                        |
| --------------------------------- | ----------------------------------- | ---------- | -------------- | -------------------------------------------- |
| `color.sidebar.background`        | `--color-sidebar-background`        | mist.50    | mist.900       | Background of the side navigation panel      |
| `color.sidebar.foreground`        | `--color-sidebar-foreground`        | mist.950   | mist.50        | Default text or icon in the sidebar          |
| `color.sidebar.primary.default`   | `--color-sidebar-primary-default`   | violet.600 | violet.600     | Background of the active navigation item     |
| `color.sidebar.primary.on`        | `--color-sidebar-primary-on`        | violet.50  | white          | Text on the sidebar's active item            |
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

| Class                      | Token                                                    |
| -------------------------- | -------------------------------------------------------- |
| `bg-background`            | `color.background.default`                               |
| `bg-card`                  | `color.background.subtle`                                |
| `bg-popover`               | `color.background.elevated`                              |
| `text-foreground`          | `color.text.default`                                     |
| `text-muted-foreground`    | `color.text.subtle`                                      |
| `text-primary`             | `color.text.action.default` (through the shadcn mapping) |
| `text-destructive`         | `color.text.destructive.default`                         |
| `bg-destructive`           | `color.feedback.error.default`                           |
| `text-success`             | `color.text.success.default`                             |
| `bg-success`               | `color.feedback.success.default`                         |
| `text-success-foreground`  | `color.feedback.success.foreground`                      |
| `text-warning`             | `color.text.warning.default`                             |
| `bg-warning`               | `color.feedback.warning.default`                         |
| `text-warning-foreground`  | `color.feedback.warning.foreground`                      |
| `border-border`            | `color.border.default`                                   |
| `border-input`, `bg-input` | `color.border.input`                                     |
| `bg-input-fill`            | `color.background.input`                                 |
| `ring-ring`                | `color.border.focus`                                     |

---

## Usage Rules

1. **Always use the semantic tokens** — never the `mist.X` or `violet.X` primitive values directly in components. Primitives are private (`--ds-prim-*`).
2. **Never fake subtlety with opacity** — use `color.text.subtle`, not `color.text.default` with `opacity-50`.
3. **Follow the surface hierarchy**: `default` → `subtle` → `elevated`. A card is `subtle`, a popover is `elevated`.
4. **Always test both modes** — every component must be checked in light AND dark before it ships.
5. **Accessibility first** — the conformance target is WCAG 2.2 AA: the minimum contrast ratio is 4.5:1 for body text (SC 1.4.3), and 3:1 for large text and UI components (SC 1.4.11).
6. **Contrast is checked mechanically** — `npm run tokens:lint-contrast` (part of `npm run tokens-validate`) resolves every background / text pair the system actually ships, in both modes, and fails below the threshold. The pairs under watch are declared in `scripts/lib/contrast-pairs.ts`: **add a pair as soon as a new background / text combination appears in the system**, otherwise nothing covers it. A pair is checked as it renders: a `bg-<role>/<n>` tint is composited onto each surface it can sit on (page, card, popover), in each state (rest, hover, focus), before the ratio is measured. Fix the token, never the threshold.
7. **APCA is advisory, WCAG 2 decides** — the same lint prints a second level: the APCA lightness contrast (Lc) of every pair, against Lc 60 for text and Lc 45 for non-text (APCA Bronze Simple Mode), tagged as WCAG 3 preparation. WCAG 3 is a Working Draft and regulations cite WCAG 2.x, so an APCA warning never fails the build and never justifies a token change that lowers a WCAG 2 ratio below its threshold. Weigh the warnings when a palette step changes for another reason, and keep the change only if both levels hold or improve.

## Measured contrast

WCAG 2.x ratios of the pairs under watch, as `npm run tokens:lint-contrast` measures them on the OKLCH ramps of 0.2.0. The table was first drawn for the fix of the 6 failures on 2026-09-17.

| Pair                                                          | Light | Dark  | Threshold |
| ------------------------------------------------------------- | ----- | ----- | --------- |
| focus indicator's solid part on the `default` surface         | 14.82 | 15.89 | 3.0       |
| focus indicator's solid part on the `subtle` surface          | 13.41 | 11.93 | 3.0       |
| control border (`border.input`) on the `default` surface      | 4.06  | 4.86  | 3.0       |
| control border on the `subtle` surface                        | 3.68  | 3.65  | 3.0       |
| control border against a field's dark fill on the card        | —     | 3.17  | 3.0       |
| sidebar focus ring on the sidebar surface                     | 3.89  | 4.28  | 3.0       |
| `text.default` on `background.default`                        | 19.75 | 18.90 | 4.5       |
| `text.subtle` on `background.default`                         | 5.92  | 7.89  | 4.5       |
| `text.subtle` on `background.subtle` (`muted-foreground`)     | 5.35  | 5.92  | 4.5       |
| `text.action.default` on `background.default`                 | 6.64  | 11.58 | 4.5       |
| `action.background.foreground` on `action.background.default` | 6.37  | 9.76  | 4.5       |
| `feedback.error.foreground` on `feedback.error.default`       | 4.62  | 7.24  | 4.5       |
| `sidebar.primary.on` on `sidebar.primary.default`             | 6.37  | 6.64  | 4.5       |
| `text.destructive.default` on the card                        | 9.05  | 8.47  | 4.5       |
| `text.destructive.default` on the weakest destructive tint    | 6.44  | 5.23  | 4.5       |
| `feedback.success.foreground` on `feedback.success.default`   | 5.67  | 8.34  | 4.5       |
| `text.success.default` on the card                            | 7.95  | 9.23  | 4.5       |
| `text.success.default` on the weakest success tint            | 6.00  | 6.50  | 4.5       |
| `feedback.warning.foreground` on `feedback.warning.default`   | 7.58  | 11.52 | 4.5       |
| `text.warning.default` on the card                            | 5.64  | 8.65  | 4.5       |
| `text.warning.default` on the weakest warning tint            | 4.77  | 5.47  | 4.5       |

The weakest tint is the 20% one over a card in light mode, and the 30% hover
tint (destructive) or the 20% one (success, warning) in dark mode.

## Palette

The primitives behind these tokens are private, and generated: never edit a
step of `tokens/primitive.json` by hand. `scripts/build-palette.ts` turns one
source color per hue (`scripts/lib/palette.ts`) into an 11-step OKLCH ramp,
`50` to `950`, and writes each step with its OKLCH components and a `hex`
fallback, the two forms of the DTCG 2025.10 Color Module. `tokens.css` declares
the `oklch()`; the contrast checks read the `hex`; both are the same 8-bit
color, because every step is brought inside the sRGB gamut first.

- **A step number is a lightness, in every hue.** The steps share their OKLCH
  lightness targets (`0.985` at `50`, `0.5` at `600`, `0.148` at `950`), so
  `600` reads at about the same contrast in violet, red or emerald. The ends
  hold the neutral surfaces; from `200` to `800` the steps are evenly spaced.
- **Chroma is reduced at both ends**, where a saturated near-white or
  near-black reads as a stain. Amber turns its hue toward orange as it darkens,
  so its dark steps do not turn olive.
- **A step no semantic token reads is `reserved`.** The ramp keeps all 11, so a
  token can move one step without a new primitive.
- **A rebrand is a source color.** `npm run tokens:test-rebrand` regenerates the
  brand ramp (`violet`) from five other colors around the hue wheel and replays
  every pair above on each: they all hold, with no semantic token moved.
- `npm run tokens:palette` regenerates the ramps; `tokens:palette-check`, in
  `npm run tokens-validate`, fails when the committed palette is not the one
  the sources generate.
