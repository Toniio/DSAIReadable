<!-- GENERATED — DO NOT EDIT.
     Produced by scripts/build-token-docs.ts from tokens/*.json.
     Run `npm run docs:tokens` after any token change; `npm run docs:tokens:check` guards it in CI.
     Edit the JSON (including $extensions.docs) instead of this file. -->

# Token Reference

> 483 tokens · source `tokens/tokens.resolver.json`: `primitive.json` · `semantic.json` · `semantic.dark.json` · `component.json`
> Machine-readable counterpart: `tokens.manifest.json`

The public tokens are the Semantic and Component tiers. The Primitive tier is private:
it is listed at the end of this document only to trace where the values come from.

**Status** column: `active` — consumed by a component, the `@theme` bridge or another token;
`reserved` — a valid decision nothing consumes yet, usable when its role matches the need
exactly; `deprecated` — do not use any more, with the token that replaces it after the
arrow when there is one. `npm run tokens:lint-lifecycle` makes sure
the status says what the code does.

---

## Color

| Token                                | CSS variable                           | Type  | Status   | Light                         | Dark                          | Tailwind                          |
| ------------------------------------ | -------------------------------------- | ----- | -------- | ----------------------------- | ----------------------------- | --------------------------------- |
| `color.background.default`           | `--color-background-default`           | color | active   | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —                                 |
| `color.background.subtle`            | `--color-background-subtle`            | color | active   | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —                                 |
| `color.background.elevated`          | `--color-background-elevated`          | color | active   | `oklch(100% 0 0)`             | `oklch(21.69% 0.0098 219.96)` | —                                 |
| `color.background.inverse`           | `--color-background-inverse`           | color | reserved | `oklch(14.65% 0.0056 219)`    | `oklch(100% 0 0)`             | —                                 |
| `color.text.default`                 | `--color-text-default`                 | color | active   | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —                                 |
| `color.text.subtle`                  | `--color-text-subtle`                  | color | active   | `oklch(50.11% 0.0215 213.54)` | `oklch(71.56% 0.021 212.57)`  | —                                 |
| `color.text.bold`                    | `--color-text-bold`                    | color | reserved | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —                                 |
| `color.text.inverse`                 | `--color-text-inverse`                 | color | reserved | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —                                 |
| `color.text.action.default`          | `--color-text-action-default`          | color | active   | `oklch(49.97% 0.2389 276.79)` | `oklch(83.05% 0.085 277.04)`  | —                                 |
| `color.text.action.on`               | `--color-text-action-on`               | color | reserved | `oklch(98.58% 0.0067 277.17)` | —                             | —                                 |
| `color.text.destructive.default`     | `--color-text-destructive-default`     | color | active   | `oklch(40.01% 0.1637 28.38)`  | `oklch(82.99% 0.0946 28.05)`  | —                                 |
| `color.text.success.default`         | `--color-text-success-default`         | color | active   | `oklch(40.06% 0.0877 162.11)` | `oklch(82.88% 0.1347 162.03)` | —                                 |
| `color.text.warning.default`         | `--color-text-warning-default`         | color | active   | `oklch(49.96% 0.117 60.18)`   | `oklch(83.07% 0.1381 75.64)`  | —                                 |
| `color.border.default`               | `--color-border-default`               | color | active   | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.1)`       | —                                 |
| `color.border.subtle`                | `--color-border-subtle`                | color | reserved | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.1)`       | —                                 |
| `color.border.input`                 | `--color-border-input`                 | color | active   | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.15)`      | —                                 |
| `color.border.focus`                 | `--color-border-focus`                 | color | active   | `oklch(59.08% 0.0208 213.49)` | `oklch(71.56% 0.021 212.57)`  | —                                 |
| `color.icon.default`                 | `--color-icon-default`                 | color | reserved | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —                                 |
| `color.icon.subtle`                  | `--color-icon-subtle`                  | color | reserved | `oklch(59.08% 0.0208 213.49)` | `oklch(71.56% 0.021 212.57)`  | —                                 |
| `color.icon.action`                  | `--color-icon-action`                  | color | reserved | `oklch(98.58% 0.0067 277.17)` | —                             | —                                 |
| `color.action.background.default`    | `--color-action-background-default`    | color | active   | `oklch(49.97% 0.2389 276.79)` | `oklch(39.99% 0.2156 276.99)` | —                                 |
| `color.action.background.foreground` | `--color-action-background-foreground` | color | active   | `oklch(98.58% 0.0067 277.17)` | —                             | —                                 |
| `color.feedback.error.default`       | `--color-feedback-error-default`       | color | active   | `oklch(59.09% 0.2389 28.47)`  | `oklch(71.49% 0.1787 28.33)`  | —                                 |
| `color.feedback.error.foreground`    | `--color-feedback-error-foreground`    | color | active   | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —                                 |
| `color.feedback.success.default`     | `--color-feedback-success-default`     | color | active   | `oklch(50% 0.1102 161.68)`    | `oklch(71.4% 0.1566 162.01)`  | —                                 |
| `color.feedback.success.foreground`  | `--color-feedback-success-foreground`  | color | active   | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —                                 |
| `color.feedback.warning.default`     | `--color-feedback-warning-default`     | color | active   | `oklch(71.5% 0.1547 70.26)`   | `oklch(83.07% 0.1381 75.64)`  | —                                 |
| `color.feedback.warning.foreground`  | `--color-feedback-warning-foreground`  | color | active   | `oklch(14.65% 0.0056 219)`    | —                             | —                                 |
| `color.chart.1`                      | `--color-chart-1`                      | color | active   | `oklch(39.99% 0.2156 276.99)` | `oklch(58.95% 0.2266 277.16)` | —                                 |
| `color.chart.2`                      | `--color-chart-2`                      | color | active   | `oklch(58.95% 0.1025 238.59)` | `oklch(71.5% 0.1026 238.54)`  | —                                 |
| `color.chart.3`                      | `--color-chart-3`                      | color | active   | `oklch(58.96% 0.1317 65.56)`  | `oklch(83.02% 0.1386 109.98)` | —                                 |
| `color.chart.4`                      | `--color-chart-4`                      | color | active   | `oklch(27.46% 0.097 310.17)`  | `oklch(92.5% 0.0481 309.77)`  | —                                 |
| `color.chart.5`                      | `--color-chart-5`                      | color | active   | `oklch(40.01% 0.0992 54.84)`  | `oklch(58.96% 0.1317 65.56)`  | —                                 |
| `color.chart.sequential.1`           | `--color-chart-sequential-1`           | color | reserved | `oklch(92.58% 0.0749 133.27)` | —                             | —                                 |
| `color.chart.sequential.2`           | `--color-chart-sequential-2`           | color | reserved | `oklch(83.04% 0.1477 133.49)` | —                             | —                                 |
| `color.chart.sequential.3`           | `--color-chart-sequential-3`           | color | reserved | `oklch(71.48% 0.184 133.22)`  | —                             | —                                 |
| `color.chart.sequential.4`           | `--color-chart-sequential-4`           | color | reserved | `oklch(59.06% 0.1674 133.26)` | —                             | —                                 |
| `color.chart.sequential.5`           | `--color-chart-sequential-5`           | color | reserved | `oklch(49.97% 0.1416 133.23)` | —                             | —                                 |
| `color.sidebar.background`           | `--color-sidebar-background`           | color | active   | `oklch(98.46% 0.0017 247.84)` | `oklch(21.69% 0.0098 219.96)` | `bg-sidebar`                      |
| `color.sidebar.foreground`           | `--color-sidebar-foreground`           | color | active   | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | `text-sidebar-foreground`         |
| `color.sidebar.border`               | `--color-sidebar-border`               | color | active   | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.1)`       | `border-sidebar-border`           |
| `color.sidebar.ring`                 | `--color-sidebar-ring`                 | color | active   | `oklch(59.08% 0.0208 213.49)` | —                             | `ring-sidebar-ring`               |
| `color.sidebar.primary.default`      | `--color-sidebar-primary-default`      | color | active   | `oklch(49.97% 0.2389 276.79)` | —                             | `bg-sidebar-primary`              |
| `color.sidebar.primary.on`           | `--color-sidebar-primary-on`           | color | active   | `oklch(98.58% 0.0067 277.17)` | `oklch(100% 0 0)`             | `text-sidebar-primary-foreground` |
| `color.sidebar.accent.default`       | `--color-sidebar-accent-default`       | color | active   | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | `bg-sidebar-accent`               |
| `color.sidebar.accent.foreground`    | `--color-sidebar-accent-foreground`    | color | active   | `oklch(21.69% 0.0098 219.96)` | `oklch(98.46% 0.0017 247.84)` | `text-sidebar-accent-foreground`  |
| `color.static.white`                 | `--color-static-white`                 | color | active   | `oklch(100% 0 0)`             | —                             | `bg-white, text-white`            |
| `color.static.black`                 | `--color-static-black`                 | color | active   | `oklch(0% 0 0)`               | —                             | `bg-black/10`                     |

**Usage rules**

| Scope                                | ✅ Do                                                                                                        | ❌ Don't                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `color.background.default`           | Use as the background of the root page and the main containers (`<body>`, `<main>`).                         | Do not use for cards, popovers or raised surfaces — use `color.background.subtle` or `color.background.elevated`.                                                                                                  |
| `color.background.subtle`            | Use for cards, muted areas, secondary sidebars, inner panels.                                                | Do not use for the page's main background.                                                                                                                                                                         |
| `color.background.elevated`          | Use for popovers, dropdowns, dialogs, light tooltips.                                                        | Do not use for inline cards — they are not "raised" on the Z axis.                                                                                                                                                 |
| `color.background.inverse`           | Use for dark tooltips, inverted badges, alert banners.                                                       | Do not use as a general page background — it is reserved for occasional inverted surfaces.                                                                                                                         |
| `color.text.default`                 | Use for all main content text, titles and important labels.                                                  | Do not lower the opacity to fake secondary text — use `color.text.subtle`.                                                                                                                                         |
| `color.text.subtle`                  | Use for field labels, form descriptions, timestamps.                                                         | Do not use for main body content — its contrast is too low for long reading.                                                                                                                                       |
| `color.text.bold`                    | Use for emphasis in areas with a busy visual context.                                                        | Do not use as a substitute for `text.default` in standard body text.                                                                                                                                               |
| `color.text.inverse`                 | Use only on `color.background.inverse`.                                                                      | Do not use on standard surfaces — the contrast would be too low.                                                                                                                                                   |
| `color.text.action.default`          | Use for text links and labels that express a clickable action.                                               | Do not use for generic body text — it is reserved for actionable elements.                                                                                                                                         |
| `color.text.action.on`               | Use for the label of a primary button.                                                                       | Do not use on neutral surfaces — the contrast is too low on a light background.                                                                                                                                    |
| `color.text.destructive.default`     | Use for error validation messages, destructive button and badge labels, and destructive menu items.          | Do not use for warnings or information — it is reserved for critical errors. Do not use `color.feedback.error.default` for text: on a card or a destructive tint it falls below 4.5:1.                             |
| `color.text.success.default`         | Use for the success Alert and Badge, and for a confirmation message next to its field.                       | Do not carry the meaning by color alone: a success and an error are hard to tell apart for a red-green color-blind reader, so an icon or a word says it too. Do not use `color.feedback.success.default` for text. |
| `color.text.warning.default`         | Use for the warning Alert and Badge, and for the icon of any warning: the fill is too light to stand alone.  | Do not use for errors — a blocking problem is destructive. Do not use `color.feedback.warning.default` for text, borders or icons.                                                                                 |
| `color.border.default`               | Use for dividers between sections and card outlines.                                                         | Do not use for form fields — use `color.border.input`.                                                                                                                                                             |
| `color.border.subtle`                | Use for inner list separators and light divisions.                                                           | Do not use on interactive components that need a visible border.                                                                                                                                                   |
| `color.border.input`                 | Use for every `<input>`, `<select>`, `<textarea>` and `<checkbox>` border.                                   | Do not use for decorative separators — it is reserved for form controls.                                                                                                                                           |
| `color.border.focus`                 | Use only for the `:focus-visible` state of interactive elements.                                             | Never remove the focus ring — it is a WCAG 2.4.7 accessibility requirement.                                                                                                                                        |
| `color.icon.default`                 | Use for navigation, standard action and content icons.                                                       | Do not use for icons inside primary buttons — use `color.icon.action`.                                                                                                                                             |
| `color.icon.subtle`                  | Use for status icons, loading indicators and metadata icons.                                                 | Do not use for main action icons.                                                                                                                                                                                  |
| `color.icon.action`                  | Use for icons inside primary buttons or action badges.                                                       | Do not use on a neutral or light background.                                                                                                                                                                       |
| `color.action.background.default`    | Use for the background of primary buttons and CTA elements.                                                  | Do not use for the secondary, ghost or outline variants — those variants have no colored background.                                                                                                               |
| `color.action.background.foreground` | Always pair with `color.action.background.default` for the text of a primary button.                         | Do not use on a neutral or light background.                                                                                                                                                                       |
| `color.feedback.error.default`       | Use for the borders and rings of invalid fields and for the `bg-destructive/10`–`/30` tints.                 | Do not use for text or icons — use `color.text.destructive.default` (`text-destructive`). Do not use for warnings or success states.                                                                               |
| `color.feedback.error.foreground`    | Use whenever a solid `bg-destructive` background carries text or an icon.                                    | Never put `color.text.default` or `text-white` on an error surface — in dark mode, white on red.400 drops to 2.73:1.                                                                                               |
| `color.feedback.success.default`     | Use for the `bg-success/10`–`/30` tints and for a solid `bg-success` surface with `text-success-foreground`. | Do not use for text or icons — use `color.text.success.default` (`text-success`). Do not use for warnings or errors.                                                                                               |
| `color.feedback.success.foreground`  | Use whenever a solid `bg-success` background carries text or an icon.                                        | Never put `text-white` on a success surface — in dark mode the fill is light and needs dark text.                                                                                                                  |
| `color.feedback.warning.default`     | Use for the `bg-warning/10`–`/30` tints and for a solid `bg-warning` surface with `text-warning-foreground`. | Do not use for text, icons or a lone border — use `color.text.warning.default` (`text-warning`). Do not use for errors.                                                                                            |
| `color.feedback.warning.foreground`  | Use whenever a solid `bg-warning` background carries text or an icon.                                        | Never put `text-white` on a warning surface: white on the light-mode fill is below 2:1.                                                                                                                            |
| `color.chart.*`                      | Use in order (1 → 5) for chart series.                                                                       | Do not reuse these tokens for general UI colors — they are reserved for data visualization.                                                                                                                        |
| `color.sidebar.*`                    | Use only in side navigation components.                                                                      | Do not reuse these tokens in the main content — they belong to the sidebar's context.                                                                                                                              |

---

## Space

| Token                          | CSS variable                     | Type      | Status   | Value       | Tailwind                                 |
| ------------------------------ | -------------------------------- | --------- | -------- | ----------- | ---------------------------------------- |
| `space.component.xs`           | `--space-component-xs`           | dimension | reserved | `0.25rem`   | —                                        |
| `space.component.sm`           | `--space-component-sm`           | dimension | reserved | `0.5rem`    | —                                        |
| `space.component.md`           | `--space-component-md`           | dimension | reserved | `1rem`      | —                                        |
| `space.component.lg`           | `--space-component-lg`           | dimension | reserved | `1.5rem`    | —                                        |
| `space.component.xl`           | `--space-component-xl`           | dimension | reserved | `2rem`      | —                                        |
| `space.scale.0`                | `--space-scale-0`                | dimension | active   | `0rem`      | `p-0 · m-0 · gap-0 · size-0`             |
| `space.scale.1`                | `--space-scale-1`                | dimension | active   | `0.25rem`   | `p-1 · m-1 · gap-1 · size-1`             |
| `space.scale.2`                | `--space-scale-2`                | dimension | active   | `0.5rem`    | `p-2 · m-2 · gap-2 · size-2`             |
| `space.scale.3`                | `--space-scale-3`                | dimension | active   | `0.75rem`   | `p-3 · m-3 · gap-3 · size-3`             |
| `space.scale.4`                | `--space-scale-4`                | dimension | active   | `1rem`      | `p-4 · m-4 · gap-4 · size-4`             |
| `space.scale.5`                | `--space-scale-5`                | dimension | active   | `1.25rem`   | `p-5 · m-5 · gap-5 · size-5`             |
| `space.scale.6`                | `--space-scale-6`                | dimension | active   | `1.5rem`    | `p-6 · m-6 · gap-6 · size-6`             |
| `space.scale.7`                | `--space-scale-7`                | dimension | active   | `1.75rem`   | `p-7 · m-7 · gap-7 · size-7`             |
| `space.scale.8`                | `--space-scale-8`                | dimension | active   | `2rem`      | `p-8 · m-8 · gap-8 · size-8`             |
| `space.scale.9`                | `--space-scale-9`                | dimension | active   | `2.25rem`   | `p-9 · m-9 · gap-9 · size-9`             |
| `space.scale.10`               | `--space-scale-10`               | dimension | active   | `2.5rem`    | `p-10 · m-10 · gap-10 · size-10`         |
| `space.scale.11`               | `--space-scale-11`               | dimension | active   | `2.75rem`   | `p-11 · m-11 · gap-11 · size-11`         |
| `space.scale.12`               | `--space-scale-12`               | dimension | active   | `3rem`      | `p-12 · m-12 · gap-12 · size-12`         |
| `space.scale.14`               | `--space-scale-14`               | dimension | active   | `3.5rem`    | `p-14 · m-14 · gap-14 · size-14`         |
| `space.scale.16`               | `--space-scale-16`               | dimension | active   | `4rem`      | `p-16 · m-16 · gap-16 · size-16`         |
| `space.scale.18`               | `--space-scale-18`               | dimension | active   | `4.5rem`    | `p-18 · m-18 · gap-18 · size-18`         |
| `space.scale.20`               | `--space-scale-20`               | dimension | active   | `5rem`      | `p-20 · m-20 · gap-20 · size-20`         |
| `space.scale.24`               | `--space-scale-24`               | dimension | active   | `6rem`      | `p-24 · m-24 · gap-24 · size-24`         |
| `space.scale.28`               | `--space-scale-28`               | dimension | active   | `7rem`      | `p-28 · m-28 · gap-28 · size-28`         |
| `space.scale.32`               | `--space-scale-32`               | dimension | active   | `8rem`      | `p-32 · m-32 · gap-32 · size-32`         |
| `space.scale.36`               | `--space-scale-36`               | dimension | active   | `9rem`      | `p-36 · m-36 · gap-36 · size-36`         |
| `space.scale.40`               | `--space-scale-40`               | dimension | active   | `10rem`     | `p-40 · m-40 · gap-40 · size-40`         |
| `space.scale.44`               | `--space-scale-44`               | dimension | active   | `11rem`     | `p-44 · m-44 · gap-44 · size-44`         |
| `space.scale.48`               | `--space-scale-48`               | dimension | active   | `12rem`     | `p-48 · m-48 · gap-48 · size-48`         |
| `space.scale.52`               | `--space-scale-52`               | dimension | active   | `13rem`     | `p-52 · m-52 · gap-52 · size-52`         |
| `space.scale.56`               | `--space-scale-56`               | dimension | active   | `14rem`     | `p-56 · m-56 · gap-56 · size-56`         |
| `space.scale.60`               | `--space-scale-60`               | dimension | active   | `15rem`     | `p-60 · m-60 · gap-60 · size-60`         |
| `space.scale.64`               | `--space-scale-64`               | dimension | active   | `16rem`     | `p-64 · m-64 · gap-64 · size-64`         |
| `space.scale.72`               | `--space-scale-72`               | dimension | active   | `18rem`     | `p-72 · m-72 · gap-72 · size-72`         |
| `space.scale.80`               | `--space-scale-80`               | dimension | active   | `20rem`     | `p-80 · m-80 · gap-80 · size-80`         |
| `space.scale.96`               | `--space-scale-96`               | dimension | active   | `24rem`     | `p-96 · m-96 · gap-96 · size-96`         |
| `space.scale.0-5`              | `--space-scale-0-5`              | dimension | active   | `0.125rem`  | `p-0.5 · m-0.5 · gap-0.5 · size-0.5`     |
| `space.scale.1-25`             | `--space-scale-1-25`             | dimension | active   | `0.3125rem` | `p-1.25 · m-1.25 · gap-1.25 · size-1.25` |
| `space.scale.1-5`              | `--space-scale-1-5`              | dimension | active   | `0.375rem`  | `p-1.5 · m-1.5 · gap-1.5 · size-1.5`     |
| `space.scale.2-5`              | `--space-scale-2-5`              | dimension | active   | `0.625rem`  | `p-2.5 · m-2.5 · gap-2.5 · size-2.5`     |
| `space.scale.3-5`              | `--space-scale-3-5`              | dimension | active   | `0.875rem`  | `p-3.5 · m-3.5 · gap-3.5 · size-3.5`     |
| `space.scale.5-25`             | `--space-scale-5-25`             | dimension | active   | `1.3125rem` | `p-5.25 · m-5.25 · gap-5.25 · size-5.25` |
| `space.container.3xs`          | `--space-container-3xs`          | dimension | reserved | `16rem`     | `max-w-3xs · w-3xs`                      |
| `space.container.2xs`          | `--space-container-2xs`          | dimension | reserved | `18rem`     | `max-w-2xs · w-2xs`                      |
| `space.container.xs`           | `--space-container-xs`           | dimension | active   | `20rem`     | `max-w-xs · w-xs`                        |
| `space.container.sm`           | `--space-container-sm`           | dimension | active   | `24rem`     | `max-w-sm · w-sm`                        |
| `space.container.md`           | `--space-container-md`           | dimension | active   | `28rem`     | `max-w-md · w-md`                        |
| `space.container.lg`           | `--space-container-lg`           | dimension | reserved | `32rem`     | `max-w-lg · w-lg`                        |
| `space.container.xl`           | `--space-container-xl`           | dimension | reserved | `36rem`     | `max-w-xl · w-xl`                        |
| `space.container.2xl`          | `--space-container-2xl`          | dimension | reserved | `42rem`     | `max-w-2xl · w-2xl`                      |
| `space.container.3xl`          | `--space-container-3xl`          | dimension | reserved | `48rem`     | `max-w-3xl · w-3xl`                      |
| `space.container.4xl`          | `--space-container-4xl`          | dimension | reserved | `56rem`     | `max-w-4xl · w-4xl`                      |
| `space.container.5xl`          | `--space-container-5xl`          | dimension | reserved | `64rem`     | `max-w-5xl · w-5xl`                      |
| `space.container.6xl`          | `--space-container-6xl`          | dimension | reserved | `72rem`     | `max-w-6xl · w-6xl`                      |
| `space.container.7xl`          | `--space-container-7xl`          | dimension | reserved | `80rem`     | `max-w-7xl · w-7xl`                      |
| `space.focus-ring-width`       | `--space-focus-ring-width`       | dimension | active   | `2px`       | —                                        |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | dimension | active   | `1.5rem`    | —                                        |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | dimension | active   | `4rem`      | —                                        |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | dimension | reserved | `42rem`     | —                                        |
| `space.layout.content-default` | `--space-layout-content-default` | dimension | reserved | `64rem`     | —                                        |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | dimension | reserved | `80rem`     | —                                        |
| `space.layout.sidebar`         | `--space-layout-sidebar`         | dimension | active   | `16rem`     | —                                        |
| `space.layout.sidebar-mobile`  | `--space-layout-sidebar-mobile`  | dimension | active   | `18rem`     | —                                        |
| `space.layout.sidebar-icon`    | `--space-layout-sidebar-icon`    | dimension | active   | `3rem`      | —                                        |

**Usage rules**

| Scope                          | ✅ Do                                                                                                      | ❌ Don't                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `space.component.xs`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`gap-1`, 4px). | Do not use for layout spacing.                                                   |
| `space.component.sm`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`gap-2`, 8px). | Do not use to space out page sections.                                           |
| `space.component.md`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`p-4`, 16px).  | Do not use for the gap between page sections.                                    |
| `space.component.lg`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`p-6`, 24px).  | Do not confuse with `space.layout.page-padding` (same value, different context). |
| `space.component.xl`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`p-8`, 32px).  | Do not use between nearby inline elements.                                       |
| `space.layout.page-padding`    | Horizontal padding of the root page container.                                                             | Do not apply to inner components.                                                |
| `space.layout.section-gap`     | Vertical space between the major sections of a page.                                                       | Do not use between components of the same section.                               |
| `space.layout.content-sm`      | `max-w-2xl` (it equals this token) for editorial pages.                                                    | Do not use as a padding value.                                                   |
| `space.layout.content-default` | The main content container of most pages.                                                                  | Do not exceed it for standard content layouts.                                   |
| `space.layout.content-lg`      | Dashboards, data tables, multi-column layouts.                                                             | Do not use for editorial content pages.                                          |

---

## Typography

| Token                              | CSS variable                         | Type       | Status | Value                       | Tailwind          |
| ---------------------------------- | ------------------------------------ | ---------- | ------ | --------------------------- | ----------------- |
| `typography.size.xs`               | `--typography-size-xs`               | dimension  | active | `0.75rem`                   | `text-xs`         |
| `typography.size.sm`               | `--typography-size-sm`               | dimension  | active | `0.875rem`                  | `text-sm`         |
| `typography.size.base`             | `--typography-size-base`             | dimension  | active | `1rem`                      | `text-base`       |
| `typography.size.lg`               | `--typography-size-lg`               | dimension  | active | `1.125rem`                  | `text-lg`         |
| `typography.size.xl`               | `--typography-size-xl`               | dimension  | active | `1.25rem`                   | `text-xl`         |
| `typography.size.2xl`              | `--typography-size-2xl`              | dimension  | active | `1.5rem`                    | `text-2xl`        |
| `typography.size.3xl`              | `--typography-size-3xl`              | dimension  | active | `1.875rem`                  | `text-3xl`        |
| `typography.size.4xl`              | `--typography-size-4xl`              | dimension  | active | `2.25rem`                   | `text-4xl`        |
| `typography.size-line-height.xs`   | `--typography-size-line-height-xs`   | number     | active | `1.33334`                   | `text-xs`         |
| `typography.size-line-height.sm`   | `--typography-size-line-height-sm`   | number     | active | `1.42858`                   | `text-sm`         |
| `typography.size-line-height.base` | `--typography-size-line-height-base` | number     | active | `1.5`                       | `text-base`       |
| `typography.size-line-height.lg`   | `--typography-size-line-height-lg`   | number     | active | `1.55556`                   | `text-lg`         |
| `typography.size-line-height.xl`   | `--typography-size-line-height-xl`   | number     | active | `1.4`                       | `text-xl`         |
| `typography.size-line-height.2xl`  | `--typography-size-line-height-2xl`  | number     | active | `1.33334`                   | `text-2xl`        |
| `typography.size-line-height.3xl`  | `--typography-size-line-height-3xl`  | number     | active | `1.2`                       | `text-3xl`        |
| `typography.size-line-height.4xl`  | `--typography-size-line-height-4xl`  | number     | active | `1.11112`                   | `text-4xl`        |
| `typography.line-height.tight`     | `--typography-line-height-tight`     | number     | active | `1.25`                      | `leading-tight`   |
| `typography.line-height.snug`      | `--typography-line-height-snug`      | number     | active | `1.375`                     | `leading-snug`    |
| `typography.line-height.normal`    | `--typography-line-height-normal`    | number     | active | `1.5`                       | `leading-normal`  |
| `typography.line-height.relaxed`   | `--typography-line-height-relaxed`   | number     | active | `1.625`                     | `leading-relaxed` |
| `typography.line-height.loose`     | `--typography-line-height-loose`     | number     | active | `2`                         | `leading-loose`   |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | dimension  | active | `-0.025em`                  | `tracking-tight`  |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | dimension  | active | `0em`                       | `tracking-normal` |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | dimension  | active | `0.025em`                   | `tracking-wide`   |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | dimension  | active | `0.05em`                    | `tracking-wider`  |
| `typography.letter-spacing.widest` | `--typography-letter-spacing-widest` | dimension  | active | `0.1em`                     | `tracking-widest` |
| `typography.font-weight.normal`    | `--typography-font-weight-normal`    | fontWeight | active | `400`                       | `font-normal`     |
| `typography.font-weight.medium`    | `--typography-font-weight-medium`    | fontWeight | active | `500`                       | `font-medium`     |
| `typography.font-weight.semibold`  | `--typography-font-weight-semibold`  | fontWeight | active | `600`                       | `font-semibold`   |
| `typography.font-weight.bold`      | `--typography-font-weight-bold`      | fontWeight | active | `700`                       | `font-bold`       |
| `typography.font-family.sans`      | `--typography-font-family-sans`      | fontFamily | active | `Geist, sans-serif`         | —                 |
| `typography.font-family.mono`      | `--typography-font-family-mono`      | fontFamily | active | `JetBrains Mono, monospace` | —                 |

**Usage rules**

| Scope                         | ✅ Do                                                            | ❌ Don't                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `typography.font-family.sans` | Keep it for `Kbd` keys and long editorial content (`font-sans`). | Do not use it for the interface: all UI text is set in `font-mono`.                                                                        |
| `typography.font-family.mono` | The default typeface of every UI component, set on `<html>`.     | Do not change the typeface here alone: it is loaded by `next/font` in `lib/fonts.ts`, which `tokens:lint-fonts` checks against this token. |

---

## Radius

| Token         | CSS variable    | Type      | Status   | Value      | Tailwind       |
| ------------- | --------------- | --------- | -------- | ---------- | -------------- |
| `radius.none` | `--radius-none` | dimension | active   | `0rem`     | `rounded-none` |
| `radius.xs`   | `--radius-xs`   | dimension | active   | `0.25rem`  | `rounded-xs`   |
| `radius.sm`   | `--radius-sm`   | dimension | active   | `0.375rem` | `rounded-sm`   |
| `radius.md`   | `--radius-md`   | dimension | active   | `0.5rem`   | `rounded-md`   |
| `radius.lg`   | `--radius-lg`   | dimension | active   | `0.625rem` | `rounded-lg`   |
| `radius.xl`   | `--radius-xl`   | dimension | active   | `0.875rem` | `rounded-xl`   |
| `radius.2xl`  | `--radius-2xl`  | dimension | active   | `1.125rem` | `rounded-2xl`  |
| `radius.3xl`  | `--radius-3xl`  | dimension | active   | `1.375rem` | `rounded-3xl`  |
| `radius.4xl`  | `--radius-4xl`  | dimension | active   | `1.625rem` | `rounded-4xl`  |
| `radius.full` | `--radius-full` | dimension | reserved | `9999px`   | `rounded-full` |

**Usage rules**

| Scope      | ✅ Do                                                                                                                                                   | ❌ Don't                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `radius.*` | Square (`rounded-none`) for every surface; `rounded-full` for a round shape; `radius.sm` to `radius.4xl` for content a screen draws (an image, a hero). | No arbitrary values, always a token from the system; no `rounded-*` class on a component. |

---

## Elevation

| Token             | CSS variable        | Type   | Status | Light                                                                | Dark                                                                | Tailwind       |
| ----------------- | ------------------- | ------ | ------ | -------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| `elevation.xs`    | `--elevation-xs`    | shadow | active | `0 1px 2px oklch(0% 0 0 / 0.04)`                                     | `0 1px 2px oklch(0% 0 0 / 0.2)`                                     | `shadow-xs`    |
| `elevation.sm`    | `--elevation-sm`    | shadow | active | `0 1px 3px oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.04)`     | `0 1px 3px oklch(0% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.2)`      | `shadow-sm`    |
| `elevation.md`    | `--elevation-md`    | shadow | active | `0 4px 6px oklch(0% 0 0 / 0.07), 0 2px 4px oklch(0% 0 0 / 0.04)`     | `0 4px 6px oklch(0% 0 0 / 0.25), 0 2px 4px oklch(0% 0 0 / 0.18)`    | `shadow-md`    |
| `elevation.lg`    | `--elevation-lg`    | shadow | active | `0 10px 15px oklch(0% 0 0 / 0.08), 0 4px 6px oklch(0% 0 0 / 0.04)`   | `0 10px 15px oklch(0% 0 0 / 0.3), 0 4px 6px oklch(0% 0 0 / 0.2)`    | `shadow-lg`    |
| `elevation.xl`    | `--elevation-xl`    | shadow | active | `0 20px 25px oklch(0% 0 0 / 0.08), 0 10px 10px oklch(0% 0 0 / 0.03)` | `0 20px 25px oklch(0% 0 0 / 0.35), 0 10px 10px oklch(0% 0 0 / 0.2)` | `shadow-xl`    |
| `elevation.2xl`   | `--elevation-2xl`   | shadow | active | `0 25px 50px oklch(0% 0 0 / 0.12)`                                   | `0 25px 50px oklch(0% 0 0 / 0.5)`                                   | `shadow-2xl`   |
| `elevation.inner` | `--elevation-inner` | shadow | active | `inset 0 2px 4px oklch(0% 0 0 / 0.05)`                               | `inset 0 2px 4px oklch(0% 0 0 / 0.3)`                               | `shadow-inner` |

**Usage rules**

| Scope         | ✅ Do                                                                     | ❌ Don't                                                                |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `elevation.*` | `shadow-sm` for cards, `shadow-md` for dropdowns, `shadow-lg` for modals. | Do not combine `shadow-inner` with an outer shadow on the same element. |

---

## Motion

| Token                        | CSS variable                   | Type        | Status   | Value                                     | Tailwind              |
| ---------------------------- | ------------------------------ | ----------- | -------- | ----------------------------------------- | --------------------- |
| `motion.duration.instant`    | `--motion-duration-instant`    | duration    | reserved | `0ms`                                     | —                     |
| `motion.duration.fast`       | `--motion-duration-fast`       | duration    | active   | `100ms`                                   | `duration-fast`       |
| `motion.duration.normal`     | `--motion-duration-normal`     | duration    | active   | `200ms`                                   | `duration-normal`     |
| `motion.duration.slow`       | `--motion-duration-slow`       | duration    | active   | `300ms`                                   | `duration-slow`       |
| `motion.duration.slower`     | `--motion-duration-slower`     | duration    | active   | `500ms`                                   | `duration-slower`     |
| `motion.duration.extra-slow` | `--motion-duration-extra-slow` | duration    | active   | `1000ms`                                  | `duration-extra-slow` |
| `motion.easing.default`      | `--motion-easing-default`      | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`            | `ease-default`        |
| `motion.easing.in`           | `--motion-easing-in`           | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`              | `ease-in`             |
| `motion.easing.out`          | `--motion-easing-out`          | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`              | `ease-out`            |
| `motion.easing.spring`       | `--motion-easing-spring`       | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `ease-spring`         |

**Usage rules**

| Scope      | ✅ Do                                                                                                                                                  | ❌ Don't                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `motion.*` | A transition with no duration class runs at `duration-fast` with `ease-default`; add `duration-normal` only to a fade or a move a screen draws itself. | Never hard-code durations or easings — always use the CSS tokens. |

---

## Opacity

| Token                 | CSS variable            | Type   | Status                           | Value | Tailwind |
| --------------------- | ----------------------- | ------ | -------------------------------- | ----- | -------- |
| `opacity.disabled`    | `--opacity-disabled`    | number | active                           | `0.5` | —        |
| `opacity.placeholder` | `--opacity-placeholder` | number | deprecated → `color.text.subtle` | `0.5` | —        |
| `opacity.overlay`     | `--opacity-overlay`     | number | deprecated                       | `0.8` | —        |

**Usage rules**

| Scope                 | ✅ Do                                                                                                                                                                                                                                        | ❌ Don't                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `opacity.disabled`    | Use `opacity-disabled` under the disabled-state variant: `disabled:opacity-disabled`, `data-disabled:opacity-disabled`, `aria-disabled:opacity-disabled`…                                                                                    | Do not write `disabled:opacity-50` (ESLint rejects it), and do not use it for secondary text — use `color.text.subtle`.                     |
| `opacity.placeholder` | Color the placeholder with `text-muted-foreground`, through the class its element answers to: `placeholder:text-muted-foreground` on an input or textarea, `data-placeholder:` on Select, `has-[option[value='']:checked]:` on NativeSelect. | Do not fade the placeholder with an opacity: default text at 0.5 is 3.70:1 on white, below 4.5:1.                                           |
| `opacity.overlay`     | Build a modal backdrop on `OVERLAY_BASE` (lib/overlay.ts): `bg-black/10` with `backdrop-blur-xs`, as Dialog, AlertDialog, Sheet and Drawer do.                                                                                               | Do not darken the backdrop to `bg-black/80`: the page behind disappears, and the result drifts from the shadcn/ui v4 look agents reproduce. |

---

## Z-Index

| Token             | CSS variable        | Type   | Status | Value  | Tailwind     |
| ----------------- | ------------------- | ------ | ------ | ------ | ------------ |
| `zindex.dropdown` | `--zindex-dropdown` | number | active | `1000` | `z-dropdown` |
| `zindex.sticky`   | `--zindex-sticky`   | number | active | `1100` | `z-sticky`   |
| `zindex.fixed`    | `--zindex-fixed`    | number | active | `1200` | `z-fixed`    |
| `zindex.overlay`  | `--zindex-overlay`  | number | active | `1300` | `z-overlay`  |
| `zindex.modal`    | `--zindex-modal`    | number | active | `1400` | `z-modal`    |
| `zindex.popover`  | `--zindex-popover`  | number | active | `1500` | `z-popover`  |
| `zindex.toast`    | `--zindex-toast`    | number | active | `1600` | `z-toast`    |
| `zindex.tooltip`  | `--zindex-tooltip`  | number | active | `1700` | `z-tooltip`  |

**Usage rules**

| Scope      | ✅ Do                                                            | ❌ Don't                                                              |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `zindex.*` | Always use the z-index tokens — never hard-coded numeric values. | Do not create new z-index levels outside this scale without approval. |

---

## breakpoint

| Token            | CSS variable       | Type      | Status   | Value   | Tailwind |
| ---------------- | ------------------ | --------- | -------- | ------- | -------- |
| `breakpoint.sm`  | `--breakpoint-sm`  | dimension | active   | `40rem` | `sm:`    |
| `breakpoint.md`  | `--breakpoint-md`  | dimension | active   | `48rem` | `md:`    |
| `breakpoint.lg`  | `--breakpoint-lg`  | dimension | active   | `64rem` | `lg:`    |
| `breakpoint.xl`  | `--breakpoint-xl`  | dimension | reserved | `80rem` | `xl:`    |
| `breakpoint.2xl` | `--breakpoint-2xl` | dimension | reserved | `96rem` | `2xl:`   |

---

## border-width

| Token                          | CSS variable                     | Type      | Status | Value   | Tailwind                                  |
| ------------------------------ | -------------------------------- | --------- | ------ | ------- | ----------------------------------------- |
| `border-width.default`         | `--border-width-default`         | dimension | active | `1px`   | `border`                                  |
| `border-width.chart-indicator` | `--border-width-chart-indicator` | dimension | active | `1.5px` | `border-chart-indicator`                  |
| `border-width.separation`      | `--border-width-separation`      | dimension | active | `2px`   | `ring-(length:--border-width-separation)` |

---

## Size

| Token             | CSS variable        | Type      | Status | Value    | Tailwind                    |
| ----------------- | ------------------- | --------- | ------ | -------- | --------------------------- |
| `size.target.min` | `--size-target-min` | dimension | active | `1.5rem` | `min-h-target min-w-target` |

**Usage rules**

| Scope             | ✅ Do                                                                                                                                                                                  | ❌ Don't                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `size.target.min` | Give a control drawn smaller than 24px a hit area of this size: `after:absolute after:inset-0 after:m-auto after:size-target` on a `relative` control, or `min-h-target min-w-target`. | Do not use it as a spacing value or to size an icon. |

---

## shadcn aliases

| Token                               | CSS variable                   | Type      | Status | Light                         | Dark                          | Tailwind |
| ----------------------------------- | ------------------------------ | --------- | ------ | ----------------------------- | ----------------------------- | -------- |
| `shadcn.background`                 | `--background`                 | color     | active | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —        |
| `shadcn.foreground`                 | `--foreground`                 | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.card`                       | `--card`                       | color     | active | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —        |
| `shadcn.card-foreground`            | `--card-foreground`            | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.popover`                    | `--popover`                    | color     | active | `oklch(100% 0 0)`             | `oklch(21.69% 0.0098 219.96)` | —        |
| `shadcn.popover-foreground`         | `--popover-foreground`         | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.primary`                    | `--primary`                    | color     | active | `oklch(49.97% 0.2389 276.79)` | `oklch(39.99% 0.2156 276.99)` | —        |
| `shadcn.primary-foreground`         | `--primary-foreground`         | color     | active | `oklch(98.58% 0.0067 277.17)` | —                             | —        |
| `shadcn.secondary`                  | `--secondary`                  | color     | active | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —        |
| `shadcn.secondary-foreground`       | `--secondary-foreground`       | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.muted`                      | `--muted`                      | color     | active | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —        |
| `shadcn.muted-foreground`           | `--muted-foreground`           | color     | active | `oklch(50.11% 0.0215 213.54)` | `oklch(71.56% 0.021 212.57)`  | —        |
| `shadcn.accent`                     | `--accent`                     | color     | active | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —        |
| `shadcn.accent-foreground`          | `--accent-foreground`          | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.destructive`                | `--destructive`                | color     | active | `oklch(59.09% 0.2389 28.47)`  | `oklch(71.49% 0.1787 28.33)`  | —        |
| `shadcn.destructive-foreground`     | `--destructive-foreground`     | color     | active | `oklch(100% 0 0)`             | `oklch(14.65% 0.0056 219)`    | —        |
| `shadcn.border`                     | `--border`                     | color     | active | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.1)`       | —        |
| `shadcn.input`                      | `--input`                      | color     | active | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.15)`      | —        |
| `shadcn.ring`                       | `--ring`                       | color     | active | `oklch(59.08% 0.0208 213.49)` | `oklch(71.56% 0.021 212.57)`  | —        |
| `shadcn.radius`                     | `--radius`                     | dimension | active | `0.625rem`                    | —                             | —        |
| `shadcn.chart-1`                    | `--chart-1`                    | color     | active | `oklch(39.99% 0.2156 276.99)` | `oklch(58.95% 0.2266 277.16)` | —        |
| `shadcn.chart-2`                    | `--chart-2`                    | color     | active | `oklch(58.95% 0.1025 238.59)` | `oklch(71.5% 0.1026 238.54)`  | —        |
| `shadcn.chart-3`                    | `--chart-3`                    | color     | active | `oklch(58.96% 0.1317 65.56)`  | `oklch(83.02% 0.1386 109.98)` | —        |
| `shadcn.chart-4`                    | `--chart-4`                    | color     | active | `oklch(27.46% 0.097 310.17)`  | `oklch(92.5% 0.0481 309.77)`  | —        |
| `shadcn.chart-5`                    | `--chart-5`                    | color     | active | `oklch(40.01% 0.0992 54.84)`  | `oklch(58.96% 0.1317 65.56)`  | —        |
| `shadcn.sidebar`                    | `--sidebar`                    | color     | active | `oklch(98.46% 0.0017 247.84)` | `oklch(21.69% 0.0098 219.96)` | —        |
| `shadcn.sidebar-foreground`         | `--sidebar-foreground`         | color     | active | `oklch(14.65% 0.0056 219)`    | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.sidebar-primary`            | `--sidebar-primary`            | color     | active | `oklch(49.97% 0.2389 276.79)` | —                             | —        |
| `shadcn.sidebar-primary-foreground` | `--sidebar-primary-foreground` | color     | active | `oklch(98.58% 0.0067 277.17)` | `oklch(100% 0 0)`             | —        |
| `shadcn.sidebar-accent`             | `--sidebar-accent`             | color     | active | `oklch(96.52% 0.0035 219.53)` | `oklch(27.4% 0.0119 214.54)`  | —        |
| `shadcn.sidebar-accent-foreground`  | `--sidebar-accent-foreground`  | color     | active | `oklch(21.69% 0.0098 219.96)` | `oklch(98.46% 0.0017 247.84)` | —        |
| `shadcn.sidebar-border`             | `--sidebar-border`             | color     | active | `oklch(92.55% 0.009 214.34)`  | `oklch(100% 0 0 / 0.1)`       | —        |
| `shadcn.sidebar-ring`               | `--sidebar-ring`               | color     | active | `oklch(59.08% 0.0208 213.49)` | —                             | —        |

---

## Primitives — private, do not use

These variables are tier 1. Referencing them from a component, a spec or
`globals.css` bypasses the design system's decisions and breaks dark mode:
`npm run tokens-validate` fails if any of them appears outside `tokens.css`.

| Token                                        | CSS variable                                 | Type        | Status   | Value                                                                | Tailwind |
| -------------------------------------------- | -------------------------------------------- | ----------- | -------- | -------------------------------------------------------------------- | -------- |
| `primitive.color.mist.50`                    | `--ds-prim-color-mist-50`                    | color       | active   | `oklch(98.46% 0.0017 247.84)`                                        | —        |
| `primitive.color.mist.100`                   | `--ds-prim-color-mist-100`                   | color       | active   | `oklch(96.52% 0.0035 219.53)`                                        | —        |
| `primitive.color.mist.200`                   | `--ds-prim-color-mist-200`                   | color       | active   | `oklch(92.55% 0.009 214.34)`                                         | —        |
| `primitive.color.mist.300`                   | `--ds-prim-color-mist-300`                   | color       | reserved | `oklch(82.95% 0.0163 216.69)`                                        | —        |
| `primitive.color.mist.400`                   | `--ds-prim-color-mist-400`                   | color       | active   | `oklch(71.56% 0.021 212.57)`                                         | —        |
| `primitive.color.mist.500`                   | `--ds-prim-color-mist-500`                   | color       | active   | `oklch(59.08% 0.0208 213.49)`                                        | —        |
| `primitive.color.mist.600`                   | `--ds-prim-color-mist-600`                   | color       | active   | `oklch(50.11% 0.0215 213.54)`                                        | —        |
| `primitive.color.mist.700`                   | `--ds-prim-color-mist-700`                   | color       | reserved | `oklch(40.1% 0.0197 211.14)`                                         | —        |
| `primitive.color.mist.800`                   | `--ds-prim-color-mist-800`                   | color       | active   | `oklch(27.4% 0.0119 214.54)`                                         | —        |
| `primitive.color.mist.900`                   | `--ds-prim-color-mist-900`                   | color       | active   | `oklch(21.69% 0.0098 219.96)`                                        | —        |
| `primitive.color.mist.950`                   | `--ds-prim-color-mist-950`                   | color       | active   | `oklch(14.65% 0.0056 219)`                                           | —        |
| `primitive.color.violet.50`                  | `--ds-prim-color-violet-50`                  | color       | active   | `oklch(98.58% 0.0067 277.17)`                                        | —        |
| `primitive.color.violet.100`                 | `--ds-prim-color-violet-100`                 | color       | reserved | `oklch(96.54% 0.0164 274.82)`                                        | —        |
| `primitive.color.violet.200`                 | `--ds-prim-color-violet-200`                 | color       | reserved | `oklch(92.6% 0.0357 277.03)`                                         | —        |
| `primitive.color.violet.300`                 | `--ds-prim-color-violet-300`                 | color       | active   | `oklch(83.05% 0.085 277.04)`                                         | —        |
| `primitive.color.violet.400`                 | `--ds-prim-color-violet-400`                 | color       | reserved | `oklch(71.46% 0.1499 276.88)`                                        | —        |
| `primitive.color.violet.500`                 | `--ds-prim-color-violet-500`                 | color       | active   | `oklch(58.95% 0.2266 277.16)`                                        | —        |
| `primitive.color.violet.600`                 | `--ds-prim-color-violet-600`                 | color       | active   | `oklch(49.97% 0.2389 276.79)`                                        | —        |
| `primitive.color.violet.700`                 | `--ds-prim-color-violet-700`                 | color       | active   | `oklch(39.99% 0.2156 276.99)`                                        | —        |
| `primitive.color.violet.800`                 | `--ds-prim-color-violet-800`                 | color       | reserved | `oklch(27.51% 0.143 276.93)`                                         | —        |
| `primitive.color.violet.900`                 | `--ds-prim-color-violet-900`                 | color       | reserved | `oklch(21.79% 0.1078 276.9)`                                         | —        |
| `primitive.color.violet.950`                 | `--ds-prim-color-violet-950`                 | color       | reserved | `oklch(14.8% 0.0725 276.39)`                                         | —        |
| `primitive.color.red.50`                     | `--ds-prim-color-red-50`                     | color       | reserved | `oklch(98.42% 0.0076 27.23)`                                         | —        |
| `primitive.color.red.100`                    | `--ds-prim-color-red-100`                    | color       | reserved | `oklch(96.42% 0.0176 26.09)`                                         | —        |
| `primitive.color.red.200`                    | `--ds-prim-color-red-200`                    | color       | reserved | `oklch(92.44% 0.0385 27.76)`                                         | —        |
| `primitive.color.red.300`                    | `--ds-prim-color-red-300`                    | color       | active   | `oklch(82.99% 0.0946 28.05)`                                         | —        |
| `primitive.color.red.400`                    | `--ds-prim-color-red-400`                    | color       | active   | `oklch(71.49% 0.1787 28.33)`                                         | —        |
| `primitive.color.red.500`                    | `--ds-prim-color-red-500`                    | color       | active   | `oklch(59.09% 0.2389 28.47)`                                         | —        |
| `primitive.color.red.600`                    | `--ds-prim-color-red-600`                    | color       | reserved | `oklch(49.96% 0.2045 28.47)`                                         | —        |
| `primitive.color.red.700`                    | `--ds-prim-color-red-700`                    | color       | active   | `oklch(40.01% 0.1637 28.38)`                                         | —        |
| `primitive.color.red.800`                    | `--ds-prim-color-red-800`                    | color       | reserved | `oklch(27.56% 0.1128 28.58)`                                         | —        |
| `primitive.color.red.900`                    | `--ds-prim-color-red-900`                    | color       | reserved | `oklch(21.9% 0.0895 27.95)`                                          | —        |
| `primitive.color.red.950`                    | `--ds-prim-color-red-950`                    | color       | reserved | `oklch(14.76% 0.0606 29.23)`                                         | —        |
| `primitive.color.green.50`                   | `--ds-prim-color-green-50`                   | color       | reserved | `oklch(98.48% 0.0179 134.92)`                                        | —        |
| `primitive.color.green.100`                  | `--ds-prim-color-green-100`                  | color       | reserved | `oklch(96.56% 0.0337 132.94)`                                        | —        |
| `primitive.color.green.200`                  | `--ds-prim-color-green-200`                  | color       | active   | `oklch(92.58% 0.0749 133.27)`                                        | —        |
| `primitive.color.green.300`                  | `--ds-prim-color-green-300`                  | color       | active   | `oklch(83.04% 0.1477 133.49)`                                        | —        |
| `primitive.color.green.400`                  | `--ds-prim-color-green-400`                  | color       | active   | `oklch(71.48% 0.184 133.22)`                                         | —        |
| `primitive.color.green.500`                  | `--ds-prim-color-green-500`                  | color       | active   | `oklch(59.06% 0.1674 133.26)`                                        | —        |
| `primitive.color.green.600`                  | `--ds-prim-color-green-600`                  | color       | active   | `oklch(49.97% 0.1416 133.23)`                                        | —        |
| `primitive.color.green.700`                  | `--ds-prim-color-green-700`                  | color       | reserved | `oklch(40.1% 0.1138 133.33)`                                         | —        |
| `primitive.color.green.800`                  | `--ds-prim-color-green-800`                  | color       | reserved | `oklch(27.46% 0.0777 133.15)`                                        | —        |
| `primitive.color.green.900`                  | `--ds-prim-color-green-900`                  | color       | reserved | `oklch(21.92% 0.0619 133.07)`                                        | —        |
| `primitive.color.green.950`                  | `--ds-prim-color-green-950`                  | color       | reserved | `oklch(14.69% 0.0421 133.96)`                                        | —        |
| `primitive.color.emerald.50`                 | `--ds-prim-color-emerald-50`                 | color       | reserved | `oklch(98.55% 0.0164 162.76)`                                        | —        |
| `primitive.color.emerald.100`                | `--ds-prim-color-emerald-100`                | color       | reserved | `oklch(96.4% 0.0304 162.22)`                                         | —        |
| `primitive.color.emerald.200`                | `--ds-prim-color-emerald-200`                | color       | reserved | `oklch(92.54% 0.0669 162.17)`                                        | —        |
| `primitive.color.emerald.300`                | `--ds-prim-color-emerald-300`                | color       | active   | `oklch(82.88% 0.1347 162.03)`                                        | —        |
| `primitive.color.emerald.400`                | `--ds-prim-color-emerald-400`                | color       | active   | `oklch(71.4% 0.1566 162.01)`                                         | —        |
| `primitive.color.emerald.500`                | `--ds-prim-color-emerald-500`                | color       | reserved | `oklch(58.92% 0.129 162.1)`                                          | —        |
| `primitive.color.emerald.600`                | `--ds-prim-color-emerald-600`                | color       | active   | `oklch(50% 0.1102 161.68)`                                           | —        |
| `primitive.color.emerald.700`                | `--ds-prim-color-emerald-700`                | color       | active   | `oklch(40.06% 0.0877 162.11)`                                        | —        |
| `primitive.color.emerald.800`                | `--ds-prim-color-emerald-800`                | color       | reserved | `oklch(27.33% 0.0599 162.09)`                                        | —        |
| `primitive.color.emerald.900`                | `--ds-prim-color-emerald-900`                | color       | reserved | `oklch(21.89% 0.0484 161.5)`                                         | —        |
| `primitive.color.emerald.950`                | `--ds-prim-color-emerald-950`                | color       | reserved | `oklch(14.89% 0.0325 162.38)`                                        | —        |
| `primitive.color.blue.50`                    | `--ds-prim-color-blue-50`                    | color       | reserved | `oklch(98.47% 0.0083 236.56)`                                        | —        |
| `primitive.color.blue.100`                   | `--ds-prim-color-blue-100`                   | color       | reserved | `oklch(96.61% 0.0183 237.76)`                                        | —        |
| `primitive.color.blue.200`                   | `--ds-prim-color-blue-200`                   | color       | reserved | `oklch(92.52% 0.041 238.05)`                                         | —        |
| `primitive.color.blue.300`                   | `--ds-prim-color-blue-300`                   | color       | reserved | `oklch(83.11% 0.0817 237.99)`                                        | —        |
| `primitive.color.blue.400`                   | `--ds-prim-color-blue-400`                   | color       | active   | `oklch(71.5% 0.1026 238.54)`                                         | —        |
| `primitive.color.blue.500`                   | `--ds-prim-color-blue-500`                   | color       | active   | `oklch(58.95% 0.1025 238.59)`                                        | —        |
| `primitive.color.blue.600`                   | `--ds-prim-color-blue-600`                   | color       | reserved | `oklch(49.88% 0.1022 238.19)`                                        | —        |
| `primitive.color.blue.700`                   | `--ds-prim-color-blue-700`                   | color       | reserved | `oklch(39.95% 0.0896 238.69)`                                        | —        |
| `primitive.color.blue.800`                   | `--ds-prim-color-blue-800`                   | color       | reserved | `oklch(27.47% 0.0614 238.49)`                                        | —        |
| `primitive.color.blue.900`                   | `--ds-prim-color-blue-900`                   | color       | reserved | `oklch(21.89% 0.0464 237.25)`                                        | —        |
| `primitive.color.blue.950`                   | `--ds-prim-color-blue-950`                   | color       | reserved | `oklch(14.75% 0.0303 240.35)`                                        | —        |
| `primitive.color.yellow.50`                  | `--ds-prim-color-yellow-50`                  | color       | reserved | `oklch(98.38% 0.0171 110.27)`                                        | —        |
| `primitive.color.yellow.100`                 | `--ds-prim-color-yellow-100`                 | color       | reserved | `oklch(96.53% 0.0316 110.85)`                                        | —        |
| `primitive.color.yellow.200`                 | `--ds-prim-color-yellow-200`                 | color       | reserved | `oklch(92.48% 0.0689 110.36)`                                        | —        |
| `primitive.color.yellow.300`                 | `--ds-prim-color-yellow-300`                 | color       | active   | `oklch(83.02% 0.1386 109.98)`                                        | —        |
| `primitive.color.yellow.400`                 | `--ds-prim-color-yellow-400`                 | color       | reserved | `oklch(71.44% 0.1557 109.77)`                                        | —        |
| `primitive.color.yellow.500`                 | `--ds-prim-color-yellow-500`                 | color       | reserved | `oklch(58.95% 0.129 110.31)`                                         | —        |
| `primitive.color.yellow.600`                 | `--ds-prim-color-yellow-600`                 | color       | reserved | `oklch(49.98% 0.1094 110.43)`                                        | —        |
| `primitive.color.yellow.700`                 | `--ds-prim-color-yellow-700`                 | color       | reserved | `oklch(39.96% 0.0871 109.77)`                                        | —        |
| `primitive.color.yellow.800`                 | `--ds-prim-color-yellow-800`                 | color       | reserved | `oklch(27.59% 0.0601 109.77)`                                        | —        |
| `primitive.color.yellow.900`                 | `--ds-prim-color-yellow-900`                 | color       | reserved | `oklch(21.92% 0.0478 109.77)`                                        | —        |
| `primitive.color.yellow.950`                 | `--ds-prim-color-yellow-950`                 | color       | reserved | `oklch(14.94% 0.0326 109.77)`                                        | —        |
| `primitive.color.amber.50`                   | `--ds-prim-color-amber-50`                   | color       | reserved | `oklch(98.47% 0.0176 92.68)`                                         | —        |
| `primitive.color.amber.100`                  | `--ds-prim-color-amber-100`                  | color       | reserved | `oklch(96.4% 0.0312 84.59)`                                          | —        |
| `primitive.color.amber.200`                  | `--ds-prim-color-amber-200`                  | color       | reserved | `oklch(92.51% 0.0697 80.17)`                                         | —        |
| `primitive.color.amber.300`                  | `--ds-prim-color-amber-300`                  | color       | active   | `oklch(83.07% 0.1381 75.64)`                                         | —        |
| `primitive.color.amber.400`                  | `--ds-prim-color-amber-400`                  | color       | active   | `oklch(71.5% 0.1547 70.26)`                                          | —        |
| `primitive.color.amber.500`                  | `--ds-prim-color-amber-500`                  | color       | active   | `oklch(58.96% 0.1317 65.56)`                                         | —        |
| `primitive.color.amber.600`                  | `--ds-prim-color-amber-600`                  | color       | active   | `oklch(49.96% 0.117 60.18)`                                          | —        |
| `primitive.color.amber.700`                  | `--ds-prim-color-amber-700`                  | color       | active   | `oklch(40.01% 0.0992 54.84)`                                         | —        |
| `primitive.color.amber.800`                  | `--ds-prim-color-amber-800`                  | color       | reserved | `oklch(27.51% 0.0714 51.3)`                                          | —        |
| `primitive.color.amber.900`                  | `--ds-prim-color-amber-900`                  | color       | reserved | `oklch(21.73% 0.0618 45.27)`                                         | —        |
| `primitive.color.amber.950`                  | `--ds-prim-color-amber-950`                  | color       | reserved | `oklch(15% 0.0455 41.77)`                                            | —        |
| `primitive.color.plum.50`                    | `--ds-prim-color-plum-50`                    | color       | reserved | `oklch(98.42% 0.0101 311.18)`                                        | —        |
| `primitive.color.plum.100`                   | `--ds-prim-color-plum-100`                   | color       | reserved | `oklch(96.57% 0.0216 309.56)`                                        | —        |
| `primitive.color.plum.200`                   | `--ds-prim-color-plum-200`                   | color       | active   | `oklch(92.5% 0.0481 309.77)`                                         | —        |
| `primitive.color.plum.300`                   | `--ds-prim-color-plum-300`                   | color       | reserved | `oklch(82.9% 0.1149 310.07)`                                         | —        |
| `primitive.color.plum.400`                   | `--ds-prim-color-plum-400`                   | color       | reserved | `oklch(71.6% 0.1598 310.13)`                                         | —        |
| `primitive.color.plum.500`                   | `--ds-prim-color-plum-500`                   | color       | reserved | `oklch(58.94% 0.1602 309.97)`                                        | —        |
| `primitive.color.plum.600`                   | `--ds-prim-color-plum-600`                   | color       | reserved | `oklch(50.04% 0.1603 309.98)`                                        | —        |
| `primitive.color.plum.700`                   | `--ds-prim-color-plum-700`                   | color       | reserved | `oklch(39.96% 0.1442 309.95)`                                        | —        |
| `primitive.color.plum.800`                   | `--ds-prim-color-plum-800`                   | color       | active   | `oklch(27.46% 0.097 310.17)`                                         | —        |
| `primitive.color.plum.900`                   | `--ds-prim-color-plum-900`                   | color       | reserved | `oklch(21.79% 0.0708 309.97)`                                        | —        |
| `primitive.color.plum.950`                   | `--ds-prim-color-plum-950`                   | color       | reserved | `oklch(14.93% 0.046 310.61)`                                         | —        |
| `primitive.color.white`                      | `--ds-prim-color-white`                      | color       | active   | `oklch(100% 0 0)`                                                    | —        |
| `primitive.color.black`                      | `--ds-prim-color-black`                      | color       | active   | `oklch(0% 0 0)`                                                      | —        |
| `primitive.color.white-alpha.10`             | `--ds-prim-color-white-alpha-10`             | color       | active   | `oklch(100% 0 0 / 0.1)`                                              | —        |
| `primitive.color.white-alpha.15`             | `--ds-prim-color-white-alpha-15`             | color       | active   | `oklch(100% 0 0 / 0.15)`                                             | —        |
| `primitive.space.0`                          | `--ds-prim-space-0`                          | dimension   | active   | `0rem`                                                               | —        |
| `primitive.space.1`                          | `--ds-prim-space-1`                          | dimension   | active   | `0.25rem`                                                            | —        |
| `primitive.space.2`                          | `--ds-prim-space-2`                          | dimension   | active   | `0.5rem`                                                             | —        |
| `primitive.space.3`                          | `--ds-prim-space-3`                          | dimension   | active   | `0.75rem`                                                            | —        |
| `primitive.space.4`                          | `--ds-prim-space-4`                          | dimension   | active   | `1rem`                                                               | —        |
| `primitive.space.5`                          | `--ds-prim-space-5`                          | dimension   | active   | `1.25rem`                                                            | —        |
| `primitive.space.6`                          | `--ds-prim-space-6`                          | dimension   | active   | `1.5rem`                                                             | —        |
| `primitive.space.7`                          | `--ds-prim-space-7`                          | dimension   | active   | `1.75rem`                                                            | —        |
| `primitive.space.8`                          | `--ds-prim-space-8`                          | dimension   | active   | `2rem`                                                               | —        |
| `primitive.space.9`                          | `--ds-prim-space-9`                          | dimension   | active   | `2.25rem`                                                            | —        |
| `primitive.space.10`                         | `--ds-prim-space-10`                         | dimension   | active   | `2.5rem`                                                             | —        |
| `primitive.space.11`                         | `--ds-prim-space-11`                         | dimension   | active   | `2.75rem`                                                            | —        |
| `primitive.space.12`                         | `--ds-prim-space-12`                         | dimension   | active   | `3rem`                                                               | —        |
| `primitive.space.14`                         | `--ds-prim-space-14`                         | dimension   | active   | `3.5rem`                                                             | —        |
| `primitive.space.16`                         | `--ds-prim-space-16`                         | dimension   | active   | `4rem`                                                               | —        |
| `primitive.space.18`                         | `--ds-prim-space-18`                         | dimension   | active   | `4.5rem`                                                             | —        |
| `primitive.space.20`                         | `--ds-prim-space-20`                         | dimension   | active   | `5rem`                                                               | —        |
| `primitive.space.24`                         | `--ds-prim-space-24`                         | dimension   | active   | `6rem`                                                               | —        |
| `primitive.space.28`                         | `--ds-prim-space-28`                         | dimension   | active   | `7rem`                                                               | —        |
| `primitive.space.32`                         | `--ds-prim-space-32`                         | dimension   | active   | `8rem`                                                               | —        |
| `primitive.space.36`                         | `--ds-prim-space-36`                         | dimension   | active   | `9rem`                                                               | —        |
| `primitive.space.40`                         | `--ds-prim-space-40`                         | dimension   | active   | `10rem`                                                              | —        |
| `primitive.space.44`                         | `--ds-prim-space-44`                         | dimension   | active   | `11rem`                                                              | —        |
| `primitive.space.48`                         | `--ds-prim-space-48`                         | dimension   | active   | `12rem`                                                              | —        |
| `primitive.space.52`                         | `--ds-prim-space-52`                         | dimension   | active   | `13rem`                                                              | —        |
| `primitive.space.56`                         | `--ds-prim-space-56`                         | dimension   | active   | `14rem`                                                              | —        |
| `primitive.space.60`                         | `--ds-prim-space-60`                         | dimension   | active   | `15rem`                                                              | —        |
| `primitive.space.64`                         | `--ds-prim-space-64`                         | dimension   | active   | `16rem`                                                              | —        |
| `primitive.space.72`                         | `--ds-prim-space-72`                         | dimension   | active   | `18rem`                                                              | —        |
| `primitive.space.80`                         | `--ds-prim-space-80`                         | dimension   | active   | `20rem`                                                              | —        |
| `primitive.space.96`                         | `--ds-prim-space-96`                         | dimension   | active   | `24rem`                                                              | —        |
| `primitive.space.0-5`                        | `--ds-prim-space-0-5`                        | dimension   | active   | `0.125rem`                                                           | —        |
| `primitive.space.1-25`                       | `--ds-prim-space-1-25`                       | dimension   | active   | `0.3125rem`                                                          | —        |
| `primitive.space.1-5`                        | `--ds-prim-space-1-5`                        | dimension   | active   | `0.375rem`                                                           | —        |
| `primitive.space.2-5`                        | `--ds-prim-space-2-5`                        | dimension   | active   | `0.625rem`                                                           | —        |
| `primitive.space.3-5`                        | `--ds-prim-space-3-5`                        | dimension   | active   | `0.875rem`                                                           | —        |
| `primitive.space.5-25`                       | `--ds-prim-space-5-25`                       | dimension   | active   | `1.3125rem`                                                          | —        |
| `primitive.space.page`                       | `--ds-prim-space-page`                       | dimension   | active   | `1.5rem`                                                             | —        |
| `primitive.space.section`                    | `--ds-prim-space-section`                    | dimension   | active   | `4rem`                                                               | —        |
| `primitive.space.content-sm`                 | `--ds-prim-space-content-sm`                 | dimension   | active   | `42rem`                                                              | —        |
| `primitive.space.content`                    | `--ds-prim-space-content`                    | dimension   | active   | `64rem`                                                              | —        |
| `primitive.space.content-lg`                 | `--ds-prim-space-content-lg`                 | dimension   | active   | `80rem`                                                              | —        |
| `primitive.space.sidebar`                    | `--ds-prim-space-sidebar`                    | dimension   | active   | `16rem`                                                              | —        |
| `primitive.space.sidebar-mobile`             | `--ds-prim-space-sidebar-mobile`             | dimension   | active   | `18rem`                                                              | —        |
| `primitive.space.focus-ring-width`           | `--ds-prim-space-focus-ring-width`           | dimension   | active   | `2px`                                                                | —        |
| `primitive.space.container.3xs`              | `--ds-prim-space-container-3xs`              | dimension   | active   | `16rem`                                                              | —        |
| `primitive.space.container.2xs`              | `--ds-prim-space-container-2xs`              | dimension   | active   | `18rem`                                                              | —        |
| `primitive.space.container.xs`               | `--ds-prim-space-container-xs`               | dimension   | active   | `20rem`                                                              | —        |
| `primitive.space.container.sm`               | `--ds-prim-space-container-sm`               | dimension   | active   | `24rem`                                                              | —        |
| `primitive.space.container.md`               | `--ds-prim-space-container-md`               | dimension   | active   | `28rem`                                                              | —        |
| `primitive.space.container.lg`               | `--ds-prim-space-container-lg`               | dimension   | active   | `32rem`                                                              | —        |
| `primitive.space.container.xl`               | `--ds-prim-space-container-xl`               | dimension   | active   | `36rem`                                                              | —        |
| `primitive.space.container.2xl`              | `--ds-prim-space-container-2xl`              | dimension   | active   | `42rem`                                                              | —        |
| `primitive.space.container.3xl`              | `--ds-prim-space-container-3xl`              | dimension   | active   | `48rem`                                                              | —        |
| `primitive.space.container.4xl`              | `--ds-prim-space-container-4xl`              | dimension   | active   | `56rem`                                                              | —        |
| `primitive.space.container.5xl`              | `--ds-prim-space-container-5xl`              | dimension   | active   | `64rem`                                                              | —        |
| `primitive.space.container.6xl`              | `--ds-prim-space-container-6xl`              | dimension   | active   | `72rem`                                                              | —        |
| `primitive.space.container.7xl`              | `--ds-prim-space-container-7xl`              | dimension   | active   | `80rem`                                                              | —        |
| `primitive.radius.none`                      | `--ds-prim-radius-none`                      | dimension   | active   | `0rem`                                                               | —        |
| `primitive.radius.base`                      | `--ds-prim-radius-base`                      | dimension   | reserved | `0.625rem`                                                           | —        |
| `primitive.radius.xs`                        | `--ds-prim-radius-xs`                        | dimension   | active   | `0.25rem`                                                            | —        |
| `primitive.radius.sm`                        | `--ds-prim-radius-sm`                        | dimension   | active   | `0.375rem`                                                           | —        |
| `primitive.radius.md`                        | `--ds-prim-radius-md`                        | dimension   | active   | `0.5rem`                                                             | —        |
| `primitive.radius.lg`                        | `--ds-prim-radius-lg`                        | dimension   | active   | `0.625rem`                                                           | —        |
| `primitive.radius.xl`                        | `--ds-prim-radius-xl`                        | dimension   | active   | `0.875rem`                                                           | —        |
| `primitive.radius.2xl`                       | `--ds-prim-radius-2xl`                       | dimension   | active   | `1.125rem`                                                           | —        |
| `primitive.radius.3xl`                       | `--ds-prim-radius-3xl`                       | dimension   | active   | `1.375rem`                                                           | —        |
| `primitive.radius.4xl`                       | `--ds-prim-radius-4xl`                       | dimension   | active   | `1.625rem`                                                           | —        |
| `primitive.radius.full`                      | `--ds-prim-radius-full`                      | dimension   | active   | `9999px`                                                             | —        |
| `primitive.typography.size.xs`               | `--ds-prim-typography-size-xs`               | dimension   | active   | `0.75rem`                                                            | —        |
| `primitive.typography.size.sm`               | `--ds-prim-typography-size-sm`               | dimension   | active   | `0.875rem`                                                           | —        |
| `primitive.typography.size.base`             | `--ds-prim-typography-size-base`             | dimension   | active   | `1rem`                                                               | —        |
| `primitive.typography.size.lg`               | `--ds-prim-typography-size-lg`               | dimension   | active   | `1.125rem`                                                           | —        |
| `primitive.typography.size.xl`               | `--ds-prim-typography-size-xl`               | dimension   | active   | `1.25rem`                                                            | —        |
| `primitive.typography.size.2xl`              | `--ds-prim-typography-size-2xl`              | dimension   | active   | `1.5rem`                                                             | —        |
| `primitive.typography.size.3xl`              | `--ds-prim-typography-size-3xl`              | dimension   | active   | `1.875rem`                                                           | —        |
| `primitive.typography.size.4xl`              | `--ds-prim-typography-size-4xl`              | dimension   | active   | `2.25rem`                                                            | —        |
| `primitive.typography.line-height.tight`     | `--ds-prim-typography-line-height-tight`     | number      | active   | `1.25`                                                               | —        |
| `primitive.typography.line-height.snug`      | `--ds-prim-typography-line-height-snug`      | number      | active   | `1.375`                                                              | —        |
| `primitive.typography.line-height.normal`    | `--ds-prim-typography-line-height-normal`    | number      | active   | `1.5`                                                                | —        |
| `primitive.typography.line-height.relaxed`   | `--ds-prim-typography-line-height-relaxed`   | number      | active   | `1.625`                                                              | —        |
| `primitive.typography.line-height.loose`     | `--ds-prim-typography-line-height-loose`     | number      | active   | `2`                                                                  | —        |
| `primitive.typography.letter-spacing.tight`  | `--ds-prim-typography-letter-spacing-tight`  | dimension   | active   | `-0.025em`                                                           | —        |
| `primitive.typography.letter-spacing.normal` | `--ds-prim-typography-letter-spacing-normal` | dimension   | active   | `0em`                                                                | —        |
| `primitive.typography.letter-spacing.wide`   | `--ds-prim-typography-letter-spacing-wide`   | dimension   | active   | `0.025em`                                                            | —        |
| `primitive.typography.letter-spacing.wider`  | `--ds-prim-typography-letter-spacing-wider`  | dimension   | active   | `0.05em`                                                             | —        |
| `primitive.typography.letter-spacing.widest` | `--ds-prim-typography-letter-spacing-widest` | dimension   | active   | `0.1em`                                                              | —        |
| `primitive.typography.font-weight.normal`    | `--ds-prim-typography-font-weight-normal`    | fontWeight  | active   | `400`                                                                | —        |
| `primitive.typography.font-weight.medium`    | `--ds-prim-typography-font-weight-medium`    | fontWeight  | active   | `500`                                                                | —        |
| `primitive.typography.font-weight.semibold`  | `--ds-prim-typography-font-weight-semibold`  | fontWeight  | active   | `600`                                                                | —        |
| `primitive.typography.font-weight.bold`      | `--ds-prim-typography-font-weight-bold`      | fontWeight  | active   | `700`                                                                | —        |
| `primitive.typography.font-family.sans`      | `--ds-prim-typography-font-family-sans`      | fontFamily  | active   | `Geist, sans-serif`                                                  | —        |
| `primitive.typography.font-family.mono`      | `--ds-prim-typography-font-family-mono`      | fontFamily  | active   | `JetBrains Mono, monospace`                                          | —        |
| `primitive.typography.size-line-height.xs`   | `--ds-prim-typography-size-line-height-xs`   | number      | active   | `1.33334`                                                            | —        |
| `primitive.typography.size-line-height.sm`   | `--ds-prim-typography-size-line-height-sm`   | number      | active   | `1.42858`                                                            | —        |
| `primitive.typography.size-line-height.base` | `--ds-prim-typography-size-line-height-base` | number      | active   | `1.5`                                                                | —        |
| `primitive.typography.size-line-height.lg`   | `--ds-prim-typography-size-line-height-lg`   | number      | active   | `1.55556`                                                            | —        |
| `primitive.typography.size-line-height.xl`   | `--ds-prim-typography-size-line-height-xl`   | number      | active   | `1.4`                                                                | —        |
| `primitive.typography.size-line-height.2xl`  | `--ds-prim-typography-size-line-height-2xl`  | number      | active   | `1.33334`                                                            | —        |
| `primitive.typography.size-line-height.3xl`  | `--ds-prim-typography-size-line-height-3xl`  | number      | active   | `1.2`                                                                | —        |
| `primitive.typography.size-line-height.4xl`  | `--ds-prim-typography-size-line-height-4xl`  | number      | active   | `1.11112`                                                            | —        |
| `primitive.elevation.light.xs`               | `--ds-prim-elevation-light-xs`               | shadow      | active   | `0 1px 2px oklch(0% 0 0 / 0.04)`                                     | —        |
| `primitive.elevation.light.sm`               | `--ds-prim-elevation-light-sm`               | shadow      | active   | `0 1px 3px oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.04)`     | —        |
| `primitive.elevation.light.md`               | `--ds-prim-elevation-light-md`               | shadow      | active   | `0 4px 6px oklch(0% 0 0 / 0.07), 0 2px 4px oklch(0% 0 0 / 0.04)`     | —        |
| `primitive.elevation.light.lg`               | `--ds-prim-elevation-light-lg`               | shadow      | active   | `0 10px 15px oklch(0% 0 0 / 0.08), 0 4px 6px oklch(0% 0 0 / 0.04)`   | —        |
| `primitive.elevation.light.xl`               | `--ds-prim-elevation-light-xl`               | shadow      | active   | `0 20px 25px oklch(0% 0 0 / 0.08), 0 10px 10px oklch(0% 0 0 / 0.03)` | —        |
| `primitive.elevation.light.2xl`              | `--ds-prim-elevation-light-2xl`              | shadow      | active   | `0 25px 50px oklch(0% 0 0 / 0.12)`                                   | —        |
| `primitive.elevation.light.inner`            | `--ds-prim-elevation-light-inner`            | shadow      | active   | `inset 0 2px 4px oklch(0% 0 0 / 0.05)`                               | —        |
| `primitive.elevation.dark.xs`                | `--ds-prim-elevation-dark-xs`                | shadow      | active   | `0 1px 2px oklch(0% 0 0 / 0.2)`                                      | —        |
| `primitive.elevation.dark.sm`                | `--ds-prim-elevation-dark-sm`                | shadow      | active   | `0 1px 3px oklch(0% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.2)`       | —        |
| `primitive.elevation.dark.md`                | `--ds-prim-elevation-dark-md`                | shadow      | active   | `0 4px 6px oklch(0% 0 0 / 0.25), 0 2px 4px oklch(0% 0 0 / 0.18)`     | —        |
| `primitive.elevation.dark.lg`                | `--ds-prim-elevation-dark-lg`                | shadow      | active   | `0 10px 15px oklch(0% 0 0 / 0.3), 0 4px 6px oklch(0% 0 0 / 0.2)`     | —        |
| `primitive.elevation.dark.xl`                | `--ds-prim-elevation-dark-xl`                | shadow      | active   | `0 20px 25px oklch(0% 0 0 / 0.35), 0 10px 10px oklch(0% 0 0 / 0.2)`  | —        |
| `primitive.elevation.dark.2xl`               | `--ds-prim-elevation-dark-2xl`               | shadow      | active   | `0 25px 50px oklch(0% 0 0 / 0.5)`                                    | —        |
| `primitive.elevation.dark.inner`             | `--ds-prim-elevation-dark-inner`             | shadow      | active   | `inset 0 2px 4px oklch(0% 0 0 / 0.3)`                                | —        |
| `primitive.motion.duration.instant`          | `--ds-prim-motion-duration-instant`          | duration    | active   | `0ms`                                                                | —        |
| `primitive.motion.duration.fast`             | `--ds-prim-motion-duration-fast`             | duration    | active   | `100ms`                                                              | —        |
| `primitive.motion.duration.normal`           | `--ds-prim-motion-duration-normal`           | duration    | active   | `200ms`                                                              | —        |
| `primitive.motion.duration.slow`             | `--ds-prim-motion-duration-slow`             | duration    | active   | `300ms`                                                              | —        |
| `primitive.motion.duration.slower`           | `--ds-prim-motion-duration-slower`           | duration    | active   | `500ms`                                                              | —        |
| `primitive.motion.duration.extra-slow`       | `--ds-prim-motion-duration-extra-slow`       | duration    | active   | `1000ms`                                                             | —        |
| `primitive.motion.easing.default`            | `--ds-prim-motion-easing-default`            | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`                                       | —        |
| `primitive.motion.easing.in`                 | `--ds-prim-motion-easing-in`                 | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`                                         | —        |
| `primitive.motion.easing.out`                | `--ds-prim-motion-easing-out`                | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`                                         | —        |
| `primitive.motion.easing.spring`             | `--ds-prim-motion-easing-spring`             | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)`                            | —        |
| `primitive.opacity.0-03`                     | `--ds-prim-opacity-0-03`                     | number      | reserved | `0.03`                                                               | —        |
| `primitive.opacity.0-04`                     | `--ds-prim-opacity-0-04`                     | number      | reserved | `0.04`                                                               | —        |
| `primitive.opacity.0-05`                     | `--ds-prim-opacity-0-05`                     | number      | reserved | `0.05`                                                               | —        |
| `primitive.opacity.0-07`                     | `--ds-prim-opacity-0-07`                     | number      | reserved | `0.07`                                                               | —        |
| `primitive.opacity.0-08`                     | `--ds-prim-opacity-0-08`                     | number      | reserved | `0.08`                                                               | —        |
| `primitive.opacity.0-10`                     | `--ds-prim-opacity-0-10`                     | number      | reserved | `0.1`                                                                | —        |
| `primitive.opacity.0-12`                     | `--ds-prim-opacity-0-12`                     | number      | reserved | `0.12`                                                               | —        |
| `primitive.opacity.0-15`                     | `--ds-prim-opacity-0-15`                     | number      | reserved | `0.15`                                                               | —        |
| `primitive.opacity.0-18`                     | `--ds-prim-opacity-0-18`                     | number      | reserved | `0.18`                                                               | —        |
| `primitive.opacity.0-20`                     | `--ds-prim-opacity-0-20`                     | number      | reserved | `0.2`                                                                | —        |
| `primitive.opacity.0-25`                     | `--ds-prim-opacity-0-25`                     | number      | reserved | `0.25`                                                               | —        |
| `primitive.opacity.0-30`                     | `--ds-prim-opacity-0-30`                     | number      | reserved | `0.3`                                                                | —        |
| `primitive.opacity.0-35`                     | `--ds-prim-opacity-0-35`                     | number      | reserved | `0.35`                                                               | —        |
| `primitive.opacity.0-50`                     | `--ds-prim-opacity-0-50`                     | number      | active   | `0.5`                                                                | —        |
| `primitive.opacity.0-80`                     | `--ds-prim-opacity-0-80`                     | number      | active   | `0.8`                                                                | —        |
| `primitive.zindex.dropdown`                  | `--ds-prim-zindex-dropdown`                  | number      | active   | `1000`                                                               | —        |
| `primitive.zindex.sticky`                    | `--ds-prim-zindex-sticky`                    | number      | active   | `1100`                                                               | —        |
| `primitive.zindex.fixed`                     | `--ds-prim-zindex-fixed`                     | number      | active   | `1200`                                                               | —        |
| `primitive.zindex.overlay`                   | `--ds-prim-zindex-overlay`                   | number      | active   | `1300`                                                               | —        |
| `primitive.zindex.modal`                     | `--ds-prim-zindex-modal`                     | number      | active   | `1400`                                                               | —        |
| `primitive.zindex.popover`                   | `--ds-prim-zindex-popover`                   | number      | active   | `1500`                                                               | —        |
| `primitive.zindex.toast`                     | `--ds-prim-zindex-toast`                     | number      | active   | `1600`                                                               | —        |
| `primitive.zindex.tooltip`                   | `--ds-prim-zindex-tooltip`                   | number      | active   | `1700`                                                               | —        |
| `primitive.breakpoint.sm`                    | `--ds-prim-breakpoint-sm`                    | dimension   | active   | `40rem`                                                              | —        |
| `primitive.breakpoint.md`                    | `--ds-prim-breakpoint-md`                    | dimension   | active   | `48rem`                                                              | —        |
| `primitive.breakpoint.lg`                    | `--ds-prim-breakpoint-lg`                    | dimension   | active   | `64rem`                                                              | —        |
| `primitive.breakpoint.xl`                    | `--ds-prim-breakpoint-xl`                    | dimension   | active   | `80rem`                                                              | —        |
| `primitive.breakpoint.2xl`                   | `--ds-prim-breakpoint-2xl`                   | dimension   | active   | `96rem`                                                              | —        |
| `primitive.border-width.1`                   | `--ds-prim-border-width-1`                   | dimension   | active   | `1px`                                                                | —        |
| `primitive.border-width.2`                   | `--ds-prim-border-width-2`                   | dimension   | active   | `2px`                                                                | —        |
| `primitive.border-width.1-5`                 | `--ds-prim-border-width-1-5`                 | dimension   | active   | `1.5px`                                                              | —        |
