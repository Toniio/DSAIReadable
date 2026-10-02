<!-- GENERATED — DO NOT EDIT.
     Produced by scripts/build-token-docs.ts from tokens/*.json.
     Run `npm run docs:tokens` after any token change; `npm run docs:tokens:check` guards it in CI.
     Edit the JSON (including $extensions.docs) instead of this file. -->

# Token Reference

> 426 tokens · source `tokens/tokens.resolver.json`: `primitive.json` · `semantic.json` · `semantic.dark.json` · `component.json`
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

| Token                                | CSS variable                           | Type  | Status   | Light     | Dark                        | Tailwind               |
| ------------------------------------ | -------------------------------------- | ----- | -------- | --------- | --------------------------- | ---------------------- |
| `color.background.default`           | `--color-background-default`           | color | active   | `#ffffff` | `#090b0c`                   | —                      |
| `color.background.subtle`            | `--color-background-subtle`            | color | active   | `#f1f3f3` | `#22292b`                   | —                      |
| `color.background.elevated`          | `--color-background-elevated`          | color | active   | `#ffffff` | `#161b1d`                   | —                      |
| `color.background.inverse`           | `--color-background-inverse`           | color | reserved | `#090b0c` | `#ffffff`                   | —                      |
| `color.text.default`                 | `--color-text-default`                 | color | active   | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.text.subtle`                  | `--color-text-subtle`                  | color | active   | `#607175` | `#9ca8ab`                   | —                      |
| `color.text.bold`                    | `--color-text-bold`                    | color | reserved | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.text.inverse`                 | `--color-text-inverse`                 | color | reserved | `#ffffff` | `#090b0c`                   | —                      |
| `color.text.action.default`          | `--color-text-action-default`          | color | active   | `#432dd7` | `#a3b3ff`                   | —                      |
| `color.text.action.on`               | `--color-text-action-on`               | color | reserved | `#eef2ff` | —                           | —                      |
| `color.text.destructive.default`     | `--color-text-destructive-default`     | color | active   | `#9f0712` | `#ffa2a2`                   | —                      |
| `color.text.success.default`         | `--color-text-success-default`         | color | active   | `#006045` | `#5ee9b5`                   | —                      |
| `color.text.warning.default`         | `--color-text-warning-default`         | color | active   | `#973c08` | `#ffd230`                   | —                      |
| `color.border.default`               | `--color-border-default`               | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.subtle`                | `--color-border-subtle`                | color | reserved | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.input`                 | `--color-border-input`                 | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.15)` | —                      |
| `color.border.focus`                 | `--color-border-focus`                 | color | active   | `#67787c` | —                           | —                      |
| `color.icon.default`                 | `--color-icon-default`                 | color | reserved | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.icon.subtle`                  | `--color-icon-subtle`                  | color | reserved | `#67787c` | `#9ca8ab`                   | —                      |
| `color.icon.action`                  | `--color-icon-action`                  | color | reserved | `#eef2ff` | —                           | —                      |
| `color.action.background.default`    | `--color-action-background-default`    | color | active   | `#432dd7` | `#372aac`                   | —                      |
| `color.action.background.foreground` | `--color-action-background-foreground` | color | active   | `#eef2ff` | —                           | —                      |
| `color.feedback.error.default`       | `--color-feedback-error-default`       | color | active   | `#e7000b` | `#ff6467`                   | —                      |
| `color.feedback.error.foreground`    | `--color-feedback-error-foreground`    | color | active   | `#ffffff` | `#090b0c`                   | —                      |
| `color.feedback.success.default`     | `--color-feedback-success-default`     | color | active   | `#007a55` | `#00d492`                   | —                      |
| `color.feedback.success.foreground`  | `--color-feedback-success-foreground`  | color | active   | `#ffffff` | `#090b0c`                   | —                      |
| `color.feedback.warning.default`     | `--color-feedback-warning-default`     | color | active   | `#fe9a00` | `#ffb900`                   | —                      |
| `color.feedback.warning.foreground`  | `--color-feedback-warning-foreground`  | color | active   | `#090b0c` | —                           | —                      |
| `color.chart.1`                      | `--color-chart-1`                      | color | active   | `#432dd7` | `#6e6cff`                   | —                      |
| `color.chart.2`                      | `--color-chart-2`                      | color | active   | `#438fbd` | `#8fd6fa`                   | —                      |
| `color.chart.3`                      | `--color-chart-3`                      | color | active   | `#af8526` | `#e5e747`                   | —                      |
| `color.chart.4`                      | `--color-chart-4`                      | color | active   | `#4d2761` | `#9b5f7c`                   | —                      |
| `color.chart.5`                      | `--color-chart-5`                      | color | active   | `#734e00` | `#c89005`                   | —                      |
| `color.chart.sequential.1`           | `--color-chart-sequential-1`           | color | reserved | `#bbf451` | —                           | —                      |
| `color.chart.sequential.2`           | `--color-chart-sequential-2`           | color | reserved | `#7ccf00` | —                           | —                      |
| `color.chart.sequential.3`           | `--color-chart-sequential-3`           | color | reserved | `#5ea500` | —                           | —                      |
| `color.chart.sequential.4`           | `--color-chart-sequential-4`           | color | reserved | `#497d00` | —                           | —                      |
| `color.chart.sequential.5`           | `--color-chart-sequential-5`           | color | reserved | `#3c6300` | —                           | —                      |
| `color.sidebar.background`           | `--color-sidebar-background`           | color | active   | `#f9fbfb` | `#161b1d`                   | `mist.900`             |
| `color.sidebar.foreground`           | `--color-sidebar-foreground`           | color | active   | `#090b0c` | `#f9fbfb`                   | `mist.50`              |
| `color.sidebar.border`               | `--color-sidebar-border`               | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | `white-alpha.10`       |
| `color.sidebar.ring`                 | `--color-sidebar-ring`                 | color | active   | `#67787c` | —                           | `mist.500`             |
| `color.sidebar.primary.default`      | `--color-sidebar-primary-default`      | color | active   | `#4f39f6` | `#615fff`                   | `violet.500`           |
| `color.sidebar.primary.on`           | `--color-sidebar-primary-on`           | color | active   | `#eef2ff` | `#ffffff`                   | `mist.0`               |
| `color.sidebar.accent.default`       | `--color-sidebar-accent-default`       | color | active   | `#f1f3f3` | `#22292b`                   | `mist.800`             |
| `color.sidebar.accent.foreground`    | `--color-sidebar-accent-foreground`    | color | active   | `#161b1d` | `#f9fbfb`                   | `mist.50`              |
| `color.static.white`                 | `--color-static-white`                 | color | active   | `#ffffff` | —                           | `bg-white, text-white` |
| `color.static.black`                 | `--color-static-black`                 | color | active   | `#000000` | —                           | `bg-black/10`          |

**Usage rules**

| Scope                                | ✅ Do                                                                                                        | ❌ Don't                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `color.background.default`           | Use as the background of the root page and the main containers (`<body>`, `<main>`).                         | Do not use for cards, popovers or raised surfaces — use `color.background.subtle` or `color.background.elevated`.                                                                                                  |
| `color.background.subtle`            | Use for cards, muted areas, secondary sidebars, inner panels.                                                | Do not use for the page's main background.                                                                                                                                                                         |
| `color.background.elevated`          | Use for popovers, drop-downs, dialogs, light tooltips.                                                       | Do not use for inline cards — they are not "raised" on the Z axis.                                                                                                                                                 |
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
| `color.feedback.error.foreground`    | Use whenever a solid `bg-destructive` background carries text or an icon.                                    | Never put `color.text.default` or `text-white` on an error surface — in dark mode, white on red.500 drops to 2.89:1.                                                                                               |
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
| `space.component.lg`           | `--space-component-lg`           | dimension | active   | `1.5rem`    | —                                        |
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

| Scope                          | ✅ Do                                                                                                                   | ❌ Don't                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `space.component.xs`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`gap-1`, 4px).              | Do not use for layout spacing.                                                   |
| `space.component.sm`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`gap-2`, 8px).              | Do not use to space out page sections.                                           |
| `space.component.md`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`p-4`, 16px).               | Do not use for the gap between page sections.                                    |
| `space.component.lg`           | The room DialogContent keeps from the viewport edges (`max-w-[calc(100%-var(--space-component-lg))]`); it has no class. | Do not confuse with `space.layout.page-padding` (same value, different context). |
| `space.component.xl`           | Reserved: nothing reads it, and it has no class. Inside a component, use the spacing scale (`p-8`, 32px).               | Do not use between nearby inline elements.                                       |
| `space.layout.page-padding`    | Horizontal padding of the root page container.                                                                          | Do not apply to inner components.                                                |
| `space.layout.section-gap`     | Vertical space between the major sections of a page.                                                                    | Do not use between components of the same section.                               |
| `space.layout.content-sm`      | `max-w-[var(--space-layout-content-sm)]` for editorial pages.                                                           | Do not use as a padding value.                                                   |
| `space.layout.content-default` | The main content container of most pages.                                                                               | Do not exceed it for standard content layouts.                                   |
| `space.layout.content-lg`      | Dashboards, data tables, multi-column layouts.                                                                          | Do not use for editorial content pages.                                          |

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
| `radius.none` | `--radius-none` | dimension | reserved | `0rem`     | `rounded-none` |
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

| Scope      | ✅ Do                                                                                      | ❌ Don't                                              |
| ---------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `radius.*` | `radius.lg` for cards; `radius.md` for buttons; `radius.full` for avatars and pill badges. | No arbitrary values — always a token from the system. |

---

## Elevation

| Token             | CSS variable        | Type   | Status | Light                                                              | Dark                                                              | Tailwind       |
| ----------------- | ------------------- | ------ | ------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------- |
| `elevation.xs`    | `--elevation-xs`    | shadow | active | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    | `0 1px 2px rgba(0, 0, 0, 0.2)`                                    | `shadow-xs`    |
| `elevation.sm`    | `--elevation-sm`    | shadow | active | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`      | `shadow-sm`    |
| `elevation.md`    | `--elevation-md`    | shadow | active | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`    | `shadow-md`    |
| `elevation.lg`    | `--elevation-lg`    | shadow | active | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`    | `shadow-lg`    |
| `elevation.xl`    | `--elevation-xl`    | shadow | active | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)` | `shadow-xl`    |
| `elevation.2xl`   | `--elevation-2xl`   | shadow | active | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  | `0 25px 50px rgba(0, 0, 0, 0.5)`                                  | `shadow-2xl`   |
| `elevation.inner` | `--elevation-inner` | shadow | active | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                              | `shadow-inner` |

**Usage rules**

| Scope         | ✅ Do                                                                      | ❌ Don't                                                                |
| ------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `elevation.*` | `shadow-sm` for cards, `shadow-md` for drop-downs, `shadow-lg` for modals. | Do not combine `shadow-inner` with an outer shadow on the same element. |

---

## Motion

| Token                        | CSS variable                   | Type        | Status   | Value                                     | Tailwind          |
| ---------------------------- | ------------------------------ | ----------- | -------- | ----------------------------------------- | ----------------- |
| `motion.duration.instant`    | `--motion-duration-instant`    | duration    | reserved | `0ms`                                     | —                 |
| `motion.duration.fast`       | `--motion-duration-fast`       | duration    | active   | `100ms`                                   | `duration-fast`   |
| `motion.duration.normal`     | `--motion-duration-normal`     | duration    | active   | `200ms`                                   | `duration-normal` |
| `motion.duration.slow`       | `--motion-duration-slow`       | duration    | active   | `300ms`                                   | `duration-slow`   |
| `motion.duration.slower`     | `--motion-duration-slower`     | duration    | active   | `500ms`                                   | `duration-slower` |
| `motion.duration.extra-slow` | `--motion-duration-extra-slow` | duration    | active   | `1000ms`                                  | —                 |
| `motion.easing.default`      | `--motion-easing-default`      | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`            | `ease-default`    |
| `motion.easing.in`           | `--motion-easing-in`           | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`              | `ease-in`         |
| `motion.easing.out`          | `--motion-easing-out`          | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`              | `ease-out`        |
| `motion.easing.spring`       | `--motion-easing-spring`       | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `ease-spring`     |

**Usage rules**

| Scope      | ✅ Do                                                                  | ❌ Don't                                                          |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `motion.*` | `duration-normal` with `ease-default` as the universal starting point. | Never hard-code durations or easings — always use the CSS tokens. |

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

| Token                               | CSS variable                   | Type      | Status | Light      | Dark                        | Tailwind |
| ----------------------------------- | ------------------------------ | --------- | ------ | ---------- | --------------------------- | -------- |
| `shadcn.background`                 | `--background`                 | color     | active | `#ffffff`  | `#090b0c`                   | —        |
| `shadcn.foreground`                 | `--foreground`                 | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.card`                       | `--card`                       | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.card-foreground`            | `--card-foreground`            | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.popover`                    | `--popover`                    | color     | active | `#ffffff`  | `#161b1d`                   | —        |
| `shadcn.popover-foreground`         | `--popover-foreground`         | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.primary`                    | `--primary`                    | color     | active | `#432dd7`  | `#372aac`                   | —        |
| `shadcn.primary-foreground`         | `--primary-foreground`         | color     | active | `#eef2ff`  | —                           | —        |
| `shadcn.secondary`                  | `--secondary`                  | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.secondary-foreground`       | `--secondary-foreground`       | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.muted`                      | `--muted`                      | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.muted-foreground`           | `--muted-foreground`           | color     | active | `#607175`  | `#9ca8ab`                   | —        |
| `shadcn.accent`                     | `--accent`                     | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.accent-foreground`          | `--accent-foreground`          | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.destructive`                | `--destructive`                | color     | active | `#e7000b`  | `#ff6467`                   | —        |
| `shadcn.destructive-foreground`     | `--destructive-foreground`     | color     | active | `#ffffff`  | `#090b0c`                   | —        |
| `shadcn.border`                     | `--border`                     | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.1)`  | —        |
| `shadcn.input`                      | `--input`                      | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.15)` | —        |
| `shadcn.ring`                       | `--ring`                       | color     | active | `#67787c`  | —                           | —        |
| `shadcn.radius`                     | `--radius`                     | dimension | active | `0.625rem` | —                           | —        |
| `shadcn.chart-1`                    | `--chart-1`                    | color     | active | `#432dd7`  | `#6e6cff`                   | —        |
| `shadcn.chart-2`                    | `--chart-2`                    | color     | active | `#438fbd`  | `#8fd6fa`                   | —        |
| `shadcn.chart-3`                    | `--chart-3`                    | color     | active | `#af8526`  | `#e5e747`                   | —        |
| `shadcn.chart-4`                    | `--chart-4`                    | color     | active | `#4d2761`  | `#9b5f7c`                   | —        |
| `shadcn.chart-5`                    | `--chart-5`                    | color     | active | `#734e00`  | `#c89005`                   | —        |
| `shadcn.sidebar`                    | `--sidebar`                    | color     | active | `#f9fbfb`  | `#161b1d`                   | —        |
| `shadcn.sidebar-foreground`         | `--sidebar-foreground`         | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.sidebar-primary`            | `--sidebar-primary`            | color     | active | `#4f39f6`  | `#615fff`                   | —        |
| `shadcn.sidebar-primary-foreground` | `--sidebar-primary-foreground` | color     | active | `#eef2ff`  | `#ffffff`                   | —        |
| `shadcn.sidebar-accent`             | `--sidebar-accent`             | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.sidebar-accent-foreground`  | `--sidebar-accent-foreground`  | color     | active | `#161b1d`  | `#f9fbfb`                   | —        |
| `shadcn.sidebar-border`             | `--sidebar-border`             | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.1)`  | —        |
| `shadcn.sidebar-ring`               | `--sidebar-ring`               | color     | active | `#67787c`  | —                           | —        |

---

## Primitives — private, do not use

These variables are tier 1. Referencing them from a component, a spec or
`globals.css` bypasses the design system's decisions and breaks dark mode:
`npm run tokens-validate` fails if any of them appears outside `tokens.css`.

| Token                                        | CSS variable                                 | Type        | Status   | Value                                                              | Tailwind |
| -------------------------------------------- | -------------------------------------------- | ----------- | -------- | ------------------------------------------------------------------ | -------- |
| `primitive.color.mist.0`                     | `--ds-prim-color-mist-0`                     | color       | active   | `#ffffff`                                                          | —        |
| `primitive.color.mist.50`                    | `--ds-prim-color-mist-50`                    | color       | active   | `#f9fbfb`                                                          | —        |
| `primitive.color.mist.100`                   | `--ds-prim-color-mist-100`                   | color       | active   | `#f1f3f3`                                                          | —        |
| `primitive.color.mist.200`                   | `--ds-prim-color-mist-200`                   | color       | active   | `#e3e7e8`                                                          | —        |
| `primitive.color.mist.400`                   | `--ds-prim-color-mist-400`                   | color       | active   | `#9ca8ab`                                                          | —        |
| `primitive.color.mist.500`                   | `--ds-prim-color-mist-500`                   | color       | active   | `#67787c`                                                          | —        |
| `primitive.color.mist.600`                   | `--ds-prim-color-mist-600`                   | color       | active   | `#607175`                                                          | —        |
| `primitive.color.mist.700`                   | `--ds-prim-color-mist-700`                   | color       | reserved | `#424f52`                                                          | —        |
| `primitive.color.mist.800`                   | `--ds-prim-color-mist-800`                   | color       | active   | `#22292b`                                                          | —        |
| `primitive.color.mist.900`                   | `--ds-prim-color-mist-900`                   | color       | active   | `#161b1d`                                                          | —        |
| `primitive.color.mist.950`                   | `--ds-prim-color-mist-950`                   | color       | active   | `#090b0c`                                                          | —        |
| `primitive.color.violet.50`                  | `--ds-prim-color-violet-50`                  | color       | active   | `#eef2ff`                                                          | —        |
| `primitive.color.violet.300`                 | `--ds-prim-color-violet-300`                 | color       | active   | `#a3b3ff`                                                          | —        |
| `primitive.color.violet.400`                 | `--ds-prim-color-violet-400`                 | color       | active   | `#6e6cff`                                                          | —        |
| `primitive.color.violet.500`                 | `--ds-prim-color-violet-500`                 | color       | active   | `#615fff`                                                          | —        |
| `primitive.color.violet.550`                 | `--ds-prim-color-violet-550`                 | color       | active   | `#4f39f6`                                                          | —        |
| `primitive.color.violet.600`                 | `--ds-prim-color-violet-600`                 | color       | active   | `#432dd7`                                                          | —        |
| `primitive.color.violet.700`                 | `--ds-prim-color-violet-700`                 | color       | active   | `#372aac`                                                          | —        |
| `primitive.color.red.300`                    | `--ds-prim-color-red-300`                    | color       | active   | `#ffa2a2`                                                          | —        |
| `primitive.color.red.500`                    | `--ds-prim-color-red-500`                    | color       | active   | `#ff6467`                                                          | —        |
| `primitive.color.red.600`                    | `--ds-prim-color-red-600`                    | color       | active   | `#e7000b`                                                          | —        |
| `primitive.color.red.800`                    | `--ds-prim-color-red-800`                    | color       | active   | `#9f0712`                                                          | —        |
| `primitive.color.green.200`                  | `--ds-prim-color-green-200`                  | color       | active   | `#bbf451`                                                          | —        |
| `primitive.color.green.300`                  | `--ds-prim-color-green-300`                  | color       | active   | `#7ccf00`                                                          | —        |
| `primitive.color.green.400`                  | `--ds-prim-color-green-400`                  | color       | active   | `#5ea500`                                                          | —        |
| `primitive.color.green.500`                  | `--ds-prim-color-green-500`                  | color       | active   | `#497d00`                                                          | —        |
| `primitive.color.green.600`                  | `--ds-prim-color-green-600`                  | color       | active   | `#3c6300`                                                          | —        |
| `primitive.color.emerald.300`                | `--ds-prim-color-emerald-300`                | color       | active   | `#5ee9b5`                                                          | —        |
| `primitive.color.emerald.400`                | `--ds-prim-color-emerald-400`                | color       | active   | `#00d492`                                                          | —        |
| `primitive.color.emerald.700`                | `--ds-prim-color-emerald-700`                | color       | active   | `#007a55`                                                          | —        |
| `primitive.color.emerald.800`                | `--ds-prim-color-emerald-800`                | color       | active   | `#006045`                                                          | —        |
| `primitive.color.blue.300`                   | `--ds-prim-color-blue-300`                   | color       | active   | `#8fd6fa`                                                          | —        |
| `primitive.color.blue.600`                   | `--ds-prim-color-blue-600`                   | color       | active   | `#438fbd`                                                          | —        |
| `primitive.color.yellow.200`                 | `--ds-prim-color-yellow-200`                 | color       | active   | `#e5e747`                                                          | —        |
| `primitive.color.amber.300`                  | `--ds-prim-color-amber-300`                  | color       | active   | `#ffd230`                                                          | —        |
| `primitive.color.amber.400`                  | `--ds-prim-color-amber-400`                  | color       | active   | `#ffb900`                                                          | —        |
| `primitive.color.amber.450`                  | `--ds-prim-color-amber-450`                  | color       | active   | `#fe9a00`                                                          | —        |
| `primitive.color.amber.500`                  | `--ds-prim-color-amber-500`                  | color       | active   | `#c89005`                                                          | —        |
| `primitive.color.amber.600`                  | `--ds-prim-color-amber-600`                  | color       | active   | `#af8526`                                                          | —        |
| `primitive.color.amber.700`                  | `--ds-prim-color-amber-700`                  | color       | active   | `#973c08`                                                          | —        |
| `primitive.color.amber.800`                  | `--ds-prim-color-amber-800`                  | color       | active   | `#734e00`                                                          | —        |
| `primitive.color.plum.500`                   | `--ds-prim-color-plum-500`                   | color       | active   | `#9b5f7c`                                                          | —        |
| `primitive.color.plum.800`                   | `--ds-prim-color-plum-800`                   | color       | active   | `#4d2761`                                                          | —        |
| `primitive.color.black`                      | `--ds-prim-color-black`                      | color       | active   | `#000000`                                                          | —        |
| `primitive.color.white-alpha.10`             | `--ds-prim-color-white-alpha-10`             | color       | active   | `rgba(255, 255, 255, 0.1)`                                         | —        |
| `primitive.color.white-alpha.15`             | `--ds-prim-color-white-alpha-15`             | color       | active   | `rgba(255, 255, 255, 0.15)`                                        | —        |
| `primitive.space.0`                          | `--ds-prim-space-0`                          | dimension   | active   | `0rem`                                                             | —        |
| `primitive.space.1`                          | `--ds-prim-space-1`                          | dimension   | active   | `0.25rem`                                                          | —        |
| `primitive.space.2`                          | `--ds-prim-space-2`                          | dimension   | active   | `0.5rem`                                                           | —        |
| `primitive.space.3`                          | `--ds-prim-space-3`                          | dimension   | active   | `0.75rem`                                                          | —        |
| `primitive.space.4`                          | `--ds-prim-space-4`                          | dimension   | active   | `1rem`                                                             | —        |
| `primitive.space.5`                          | `--ds-prim-space-5`                          | dimension   | active   | `1.25rem`                                                          | —        |
| `primitive.space.6`                          | `--ds-prim-space-6`                          | dimension   | active   | `1.5rem`                                                           | —        |
| `primitive.space.7`                          | `--ds-prim-space-7`                          | dimension   | active   | `1.75rem`                                                          | —        |
| `primitive.space.8`                          | `--ds-prim-space-8`                          | dimension   | active   | `2rem`                                                             | —        |
| `primitive.space.9`                          | `--ds-prim-space-9`                          | dimension   | active   | `2.25rem`                                                          | —        |
| `primitive.space.10`                         | `--ds-prim-space-10`                         | dimension   | active   | `2.5rem`                                                           | —        |
| `primitive.space.11`                         | `--ds-prim-space-11`                         | dimension   | active   | `2.75rem`                                                          | —        |
| `primitive.space.12`                         | `--ds-prim-space-12`                         | dimension   | active   | `3rem`                                                             | —        |
| `primitive.space.14`                         | `--ds-prim-space-14`                         | dimension   | active   | `3.5rem`                                                           | —        |
| `primitive.space.16`                         | `--ds-prim-space-16`                         | dimension   | active   | `4rem`                                                             | —        |
| `primitive.space.18`                         | `--ds-prim-space-18`                         | dimension   | active   | `4.5rem`                                                           | —        |
| `primitive.space.20`                         | `--ds-prim-space-20`                         | dimension   | active   | `5rem`                                                             | —        |
| `primitive.space.24`                         | `--ds-prim-space-24`                         | dimension   | active   | `6rem`                                                             | —        |
| `primitive.space.28`                         | `--ds-prim-space-28`                         | dimension   | active   | `7rem`                                                             | —        |
| `primitive.space.32`                         | `--ds-prim-space-32`                         | dimension   | active   | `8rem`                                                             | —        |
| `primitive.space.36`                         | `--ds-prim-space-36`                         | dimension   | active   | `9rem`                                                             | —        |
| `primitive.space.40`                         | `--ds-prim-space-40`                         | dimension   | active   | `10rem`                                                            | —        |
| `primitive.space.44`                         | `--ds-prim-space-44`                         | dimension   | active   | `11rem`                                                            | —        |
| `primitive.space.48`                         | `--ds-prim-space-48`                         | dimension   | active   | `12rem`                                                            | —        |
| `primitive.space.52`                         | `--ds-prim-space-52`                         | dimension   | active   | `13rem`                                                            | —        |
| `primitive.space.56`                         | `--ds-prim-space-56`                         | dimension   | active   | `14rem`                                                            | —        |
| `primitive.space.60`                         | `--ds-prim-space-60`                         | dimension   | active   | `15rem`                                                            | —        |
| `primitive.space.64`                         | `--ds-prim-space-64`                         | dimension   | active   | `16rem`                                                            | —        |
| `primitive.space.72`                         | `--ds-prim-space-72`                         | dimension   | active   | `18rem`                                                            | —        |
| `primitive.space.80`                         | `--ds-prim-space-80`                         | dimension   | active   | `20rem`                                                            | —        |
| `primitive.space.96`                         | `--ds-prim-space-96`                         | dimension   | active   | `24rem`                                                            | —        |
| `primitive.space.0-5`                        | `--ds-prim-space-0-5`                        | dimension   | active   | `0.125rem`                                                         | —        |
| `primitive.space.1-25`                       | `--ds-prim-space-1-25`                       | dimension   | active   | `0.3125rem`                                                        | —        |
| `primitive.space.1-5`                        | `--ds-prim-space-1-5`                        | dimension   | active   | `0.375rem`                                                         | —        |
| `primitive.space.2-5`                        | `--ds-prim-space-2-5`                        | dimension   | active   | `0.625rem`                                                         | —        |
| `primitive.space.3-5`                        | `--ds-prim-space-3-5`                        | dimension   | active   | `0.875rem`                                                         | —        |
| `primitive.space.5-25`                       | `--ds-prim-space-5-25`                       | dimension   | active   | `1.3125rem`                                                        | —        |
| `primitive.space.page`                       | `--ds-prim-space-page`                       | dimension   | active   | `1.5rem`                                                           | —        |
| `primitive.space.section`                    | `--ds-prim-space-section`                    | dimension   | active   | `4rem`                                                             | —        |
| `primitive.space.content-sm`                 | `--ds-prim-space-content-sm`                 | dimension   | active   | `42rem`                                                            | —        |
| `primitive.space.content`                    | `--ds-prim-space-content`                    | dimension   | active   | `64rem`                                                            | —        |
| `primitive.space.content-lg`                 | `--ds-prim-space-content-lg`                 | dimension   | active   | `80rem`                                                            | —        |
| `primitive.space.sidebar`                    | `--ds-prim-space-sidebar`                    | dimension   | active   | `16rem`                                                            | —        |
| `primitive.space.sidebar-mobile`             | `--ds-prim-space-sidebar-mobile`             | dimension   | active   | `18rem`                                                            | —        |
| `primitive.space.focus-ring-width`           | `--ds-prim-space-focus-ring-width`           | dimension   | active   | `2px`                                                              | —        |
| `primitive.space.container.3xs`              | `--ds-prim-space-container-3xs`              | dimension   | active   | `16rem`                                                            | —        |
| `primitive.space.container.2xs`              | `--ds-prim-space-container-2xs`              | dimension   | active   | `18rem`                                                            | —        |
| `primitive.space.container.xs`               | `--ds-prim-space-container-xs`               | dimension   | active   | `20rem`                                                            | —        |
| `primitive.space.container.sm`               | `--ds-prim-space-container-sm`               | dimension   | active   | `24rem`                                                            | —        |
| `primitive.space.container.md`               | `--ds-prim-space-container-md`               | dimension   | active   | `28rem`                                                            | —        |
| `primitive.space.container.lg`               | `--ds-prim-space-container-lg`               | dimension   | active   | `32rem`                                                            | —        |
| `primitive.space.container.xl`               | `--ds-prim-space-container-xl`               | dimension   | active   | `36rem`                                                            | —        |
| `primitive.space.container.2xl`              | `--ds-prim-space-container-2xl`              | dimension   | active   | `42rem`                                                            | —        |
| `primitive.space.container.3xl`              | `--ds-prim-space-container-3xl`              | dimension   | active   | `48rem`                                                            | —        |
| `primitive.space.container.4xl`              | `--ds-prim-space-container-4xl`              | dimension   | active   | `56rem`                                                            | —        |
| `primitive.space.container.5xl`              | `--ds-prim-space-container-5xl`              | dimension   | active   | `64rem`                                                            | —        |
| `primitive.space.container.6xl`              | `--ds-prim-space-container-6xl`              | dimension   | active   | `72rem`                                                            | —        |
| `primitive.space.container.7xl`              | `--ds-prim-space-container-7xl`              | dimension   | active   | `80rem`                                                            | —        |
| `primitive.radius.none`                      | `--ds-prim-radius-none`                      | dimension   | active   | `0rem`                                                             | —        |
| `primitive.radius.base`                      | `--ds-prim-radius-base`                      | dimension   | reserved | `0.625rem`                                                         | —        |
| `primitive.radius.xs`                        | `--ds-prim-radius-xs`                        | dimension   | active   | `0.25rem`                                                          | —        |
| `primitive.radius.sm`                        | `--ds-prim-radius-sm`                        | dimension   | active   | `0.375rem`                                                         | —        |
| `primitive.radius.md`                        | `--ds-prim-radius-md`                        | dimension   | active   | `0.5rem`                                                           | —        |
| `primitive.radius.lg`                        | `--ds-prim-radius-lg`                        | dimension   | active   | `0.625rem`                                                         | —        |
| `primitive.radius.xl`                        | `--ds-prim-radius-xl`                        | dimension   | active   | `0.875rem`                                                         | —        |
| `primitive.radius.2xl`                       | `--ds-prim-radius-2xl`                       | dimension   | active   | `1.125rem`                                                         | —        |
| `primitive.radius.3xl`                       | `--ds-prim-radius-3xl`                       | dimension   | active   | `1.375rem`                                                         | —        |
| `primitive.radius.4xl`                       | `--ds-prim-radius-4xl`                       | dimension   | active   | `1.625rem`                                                         | —        |
| `primitive.radius.full`                      | `--ds-prim-radius-full`                      | dimension   | active   | `9999px`                                                           | —        |
| `primitive.typography.size.xs`               | `--ds-prim-typography-size-xs`               | dimension   | active   | `0.75rem`                                                          | —        |
| `primitive.typography.size.sm`               | `--ds-prim-typography-size-sm`               | dimension   | active   | `0.875rem`                                                         | —        |
| `primitive.typography.size.base`             | `--ds-prim-typography-size-base`             | dimension   | active   | `1rem`                                                             | —        |
| `primitive.typography.size.lg`               | `--ds-prim-typography-size-lg`               | dimension   | active   | `1.125rem`                                                         | —        |
| `primitive.typography.size.xl`               | `--ds-prim-typography-size-xl`               | dimension   | active   | `1.25rem`                                                          | —        |
| `primitive.typography.size.2xl`              | `--ds-prim-typography-size-2xl`              | dimension   | active   | `1.5rem`                                                           | —        |
| `primitive.typography.size.3xl`              | `--ds-prim-typography-size-3xl`              | dimension   | active   | `1.875rem`                                                         | —        |
| `primitive.typography.size.4xl`              | `--ds-prim-typography-size-4xl`              | dimension   | active   | `2.25rem`                                                          | —        |
| `primitive.typography.line-height.tight`     | `--ds-prim-typography-line-height-tight`     | number      | active   | `1.25`                                                             | —        |
| `primitive.typography.line-height.snug`      | `--ds-prim-typography-line-height-snug`      | number      | active   | `1.375`                                                            | —        |
| `primitive.typography.line-height.normal`    | `--ds-prim-typography-line-height-normal`    | number      | active   | `1.5`                                                              | —        |
| `primitive.typography.line-height.relaxed`   | `--ds-prim-typography-line-height-relaxed`   | number      | active   | `1.625`                                                            | —        |
| `primitive.typography.line-height.loose`     | `--ds-prim-typography-line-height-loose`     | number      | active   | `2`                                                                | —        |
| `primitive.typography.letter-spacing.tight`  | `--ds-prim-typography-letter-spacing-tight`  | dimension   | active   | `-0.025em`                                                         | —        |
| `primitive.typography.letter-spacing.normal` | `--ds-prim-typography-letter-spacing-normal` | dimension   | active   | `0em`                                                              | —        |
| `primitive.typography.letter-spacing.wide`   | `--ds-prim-typography-letter-spacing-wide`   | dimension   | active   | `0.025em`                                                          | —        |
| `primitive.typography.letter-spacing.wider`  | `--ds-prim-typography-letter-spacing-wider`  | dimension   | active   | `0.05em`                                                           | —        |
| `primitive.typography.letter-spacing.widest` | `--ds-prim-typography-letter-spacing-widest` | dimension   | active   | `0.1em`                                                            | —        |
| `primitive.typography.font-weight.normal`    | `--ds-prim-typography-font-weight-normal`    | fontWeight  | active   | `400`                                                              | —        |
| `primitive.typography.font-weight.medium`    | `--ds-prim-typography-font-weight-medium`    | fontWeight  | active   | `500`                                                              | —        |
| `primitive.typography.font-weight.semibold`  | `--ds-prim-typography-font-weight-semibold`  | fontWeight  | active   | `600`                                                              | —        |
| `primitive.typography.font-weight.bold`      | `--ds-prim-typography-font-weight-bold`      | fontWeight  | active   | `700`                                                              | —        |
| `primitive.typography.font-family.sans`      | `--ds-prim-typography-font-family-sans`      | fontFamily  | active   | `Geist, sans-serif`                                                | —        |
| `primitive.typography.font-family.mono`      | `--ds-prim-typography-font-family-mono`      | fontFamily  | active   | `JetBrains Mono, monospace`                                        | —        |
| `primitive.typography.size-line-height.xs`   | `--ds-prim-typography-size-line-height-xs`   | number      | active   | `1.33334`                                                          | —        |
| `primitive.typography.size-line-height.sm`   | `--ds-prim-typography-size-line-height-sm`   | number      | active   | `1.42858`                                                          | —        |
| `primitive.typography.size-line-height.base` | `--ds-prim-typography-size-line-height-base` | number      | active   | `1.5`                                                              | —        |
| `primitive.typography.size-line-height.lg`   | `--ds-prim-typography-size-line-height-lg`   | number      | active   | `1.55556`                                                          | —        |
| `primitive.typography.size-line-height.xl`   | `--ds-prim-typography-size-line-height-xl`   | number      | active   | `1.4`                                                              | —        |
| `primitive.typography.size-line-height.2xl`  | `--ds-prim-typography-size-line-height-2xl`  | number      | active   | `1.33334`                                                          | —        |
| `primitive.typography.size-line-height.3xl`  | `--ds-prim-typography-size-line-height-3xl`  | number      | active   | `1.2`                                                              | —        |
| `primitive.typography.size-line-height.4xl`  | `--ds-prim-typography-size-line-height-4xl`  | number      | active   | `1.11112`                                                          | —        |
| `primitive.elevation.light.xs`               | `--ds-prim-elevation-light-xs`               | shadow      | active   | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    | —        |
| `primitive.elevation.light.sm`               | `--ds-prim-elevation-light-sm`               | shadow      | active   | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     | —        |
| `primitive.elevation.light.md`               | `--ds-prim-elevation-light-md`               | shadow      | active   | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     | —        |
| `primitive.elevation.light.lg`               | `--ds-prim-elevation-light-lg`               | shadow      | active   | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   | —        |
| `primitive.elevation.light.xl`               | `--ds-prim-elevation-light-xl`               | shadow      | active   | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` | —        |
| `primitive.elevation.light.2xl`              | `--ds-prim-elevation-light-2xl`              | shadow      | active   | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  | —        |
| `primitive.elevation.light.inner`            | `--ds-prim-elevation-light-inner`            | shadow      | active   | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              | —        |
| `primitive.elevation.dark.xs`                | `--ds-prim-elevation-dark-xs`                | shadow      | active   | `0 1px 2px rgba(0, 0, 0, 0.2)`                                     | —        |
| `primitive.elevation.dark.sm`                | `--ds-prim-elevation-dark-sm`                | shadow      | active   | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`       | —        |
| `primitive.elevation.dark.md`                | `--ds-prim-elevation-dark-md`                | shadow      | active   | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`     | —        |
| `primitive.elevation.dark.lg`                | `--ds-prim-elevation-dark-lg`                | shadow      | active   | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`     | —        |
| `primitive.elevation.dark.xl`                | `--ds-prim-elevation-dark-xl`                | shadow      | active   | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)`  | —        |
| `primitive.elevation.dark.2xl`               | `--ds-prim-elevation-dark-2xl`               | shadow      | active   | `0 25px 50px rgba(0, 0, 0, 0.5)`                                   | —        |
| `primitive.elevation.dark.inner`             | `--ds-prim-elevation-dark-inner`             | shadow      | active   | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                               | —        |
| `primitive.motion.duration.instant`          | `--ds-prim-motion-duration-instant`          | duration    | active   | `0ms`                                                              | —        |
| `primitive.motion.duration.fast`             | `--ds-prim-motion-duration-fast`             | duration    | active   | `100ms`                                                            | —        |
| `primitive.motion.duration.normal`           | `--ds-prim-motion-duration-normal`           | duration    | active   | `200ms`                                                            | —        |
| `primitive.motion.duration.slow`             | `--ds-prim-motion-duration-slow`             | duration    | active   | `300ms`                                                            | —        |
| `primitive.motion.duration.slower`           | `--ds-prim-motion-duration-slower`           | duration    | active   | `500ms`                                                            | —        |
| `primitive.motion.duration.extra-slow`       | `--ds-prim-motion-duration-extra-slow`       | duration    | active   | `1000ms`                                                           | —        |
| `primitive.motion.easing.default`            | `--ds-prim-motion-easing-default`            | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`                                     | —        |
| `primitive.motion.easing.in`                 | `--ds-prim-motion-easing-in`                 | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`                                       | —        |
| `primitive.motion.easing.out`                | `--ds-prim-motion-easing-out`                | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`                                       | —        |
| `primitive.motion.easing.spring`             | `--ds-prim-motion-easing-spring`             | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)`                          | —        |
| `primitive.opacity.0-03`                     | `--ds-prim-opacity-0-03`                     | number      | reserved | `0.03`                                                             | —        |
| `primitive.opacity.0-04`                     | `--ds-prim-opacity-0-04`                     | number      | reserved | `0.04`                                                             | —        |
| `primitive.opacity.0-05`                     | `--ds-prim-opacity-0-05`                     | number      | reserved | `0.05`                                                             | —        |
| `primitive.opacity.0-07`                     | `--ds-prim-opacity-0-07`                     | number      | reserved | `0.07`                                                             | —        |
| `primitive.opacity.0-08`                     | `--ds-prim-opacity-0-08`                     | number      | reserved | `0.08`                                                             | —        |
| `primitive.opacity.0-10`                     | `--ds-prim-opacity-0-10`                     | number      | reserved | `0.1`                                                              | —        |
| `primitive.opacity.0-12`                     | `--ds-prim-opacity-0-12`                     | number      | reserved | `0.12`                                                             | —        |
| `primitive.opacity.0-15`                     | `--ds-prim-opacity-0-15`                     | number      | reserved | `0.15`                                                             | —        |
| `primitive.opacity.0-18`                     | `--ds-prim-opacity-0-18`                     | number      | reserved | `0.18`                                                             | —        |
| `primitive.opacity.0-20`                     | `--ds-prim-opacity-0-20`                     | number      | reserved | `0.2`                                                              | —        |
| `primitive.opacity.0-25`                     | `--ds-prim-opacity-0-25`                     | number      | reserved | `0.25`                                                             | —        |
| `primitive.opacity.0-30`                     | `--ds-prim-opacity-0-30`                     | number      | reserved | `0.3`                                                              | —        |
| `primitive.opacity.0-35`                     | `--ds-prim-opacity-0-35`                     | number      | reserved | `0.35`                                                             | —        |
| `primitive.opacity.0-50`                     | `--ds-prim-opacity-0-50`                     | number      | active   | `0.5`                                                              | —        |
| `primitive.opacity.0-80`                     | `--ds-prim-opacity-0-80`                     | number      | active   | `0.8`                                                              | —        |
| `primitive.zindex.dropdown`                  | `--ds-prim-zindex-dropdown`                  | number      | active   | `1000`                                                             | —        |
| `primitive.zindex.sticky`                    | `--ds-prim-zindex-sticky`                    | number      | active   | `1100`                                                             | —        |
| `primitive.zindex.fixed`                     | `--ds-prim-zindex-fixed`                     | number      | active   | `1200`                                                             | —        |
| `primitive.zindex.overlay`                   | `--ds-prim-zindex-overlay`                   | number      | active   | `1300`                                                             | —        |
| `primitive.zindex.modal`                     | `--ds-prim-zindex-modal`                     | number      | active   | `1400`                                                             | —        |
| `primitive.zindex.popover`                   | `--ds-prim-zindex-popover`                   | number      | active   | `1500`                                                             | —        |
| `primitive.zindex.toast`                     | `--ds-prim-zindex-toast`                     | number      | active   | `1600`                                                             | —        |
| `primitive.zindex.tooltip`                   | `--ds-prim-zindex-tooltip`                   | number      | active   | `1700`                                                             | —        |
| `primitive.breakpoint.sm`                    | `--ds-prim-breakpoint-sm`                    | dimension   | active   | `40rem`                                                            | —        |
| `primitive.breakpoint.md`                    | `--ds-prim-breakpoint-md`                    | dimension   | active   | `48rem`                                                            | —        |
| `primitive.breakpoint.lg`                    | `--ds-prim-breakpoint-lg`                    | dimension   | active   | `64rem`                                                            | —        |
| `primitive.breakpoint.xl`                    | `--ds-prim-breakpoint-xl`                    | dimension   | active   | `80rem`                                                            | —        |
| `primitive.breakpoint.2xl`                   | `--ds-prim-breakpoint-2xl`                   | dimension   | active   | `96rem`                                                            | —        |
| `primitive.border-width.1`                   | `--ds-prim-border-width-1`                   | dimension   | active   | `1px`                                                              | —        |
| `primitive.border-width.2`                   | `--ds-prim-border-width-2`                   | dimension   | active   | `2px`                                                              | —        |
| `primitive.border-width.1-5`                 | `--ds-prim-border-width-1-5`                 | dimension   | active   | `1.5px`                                                            | —        |
