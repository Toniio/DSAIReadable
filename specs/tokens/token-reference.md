<!-- GENERATED — DO NOT EDIT.
     Produced by scripts/build-token-docs.ts from tokens/*.json.
     Run `npm run docs:tokens` after any token change; `npm run docs:tokens:check` guards it in CI.
     Edit the JSON (including $extensions.docs) instead of this file. -->

# Token Reference

> 305 tokens · source `tokens/primitive.json` · `tokens/semantic.json` · `tokens/component.json`
> Machine-readable counterpart: `tokens.manifest.json`

The public tokens are the Semantic and Component tiers. The Primitive tier is private:
it is listed at the end of this document only to trace where the values come from.

**Status** column: `active` — consumed by a component, the `@theme` bridge or another token;
`reserved` — a valid decision nothing consumes yet, usable when its role matches the need
exactly; `deprecated` — do not use any more. `npm run tokens:lint-lifecycle` makes sure
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
| `color.text.action.default`          | `--color-text-action-default`          | color | reserved | `#432dd7` | `#6e6cff`                   | —                      |
| `color.text.action.on`               | `--color-text-action-on`               | color | reserved | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.text.destructive.default`     | `--color-text-destructive-default`     | color | active   | `#9f0712` | `#ffa2a2`                   | —                      |
| `color.border.default`               | `--color-border-default`               | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.subtle`                | `--color-border-subtle`                | color | reserved | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.input`                 | `--color-border-input`                 | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.15)` | —                      |
| `color.border.focus`                 | `--color-border-focus`                 | color | active   | `#67787c` | `#67787c`                   | —                      |
| `color.icon.default`                 | `--color-icon-default`                 | color | reserved | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.icon.subtle`                  | `--color-icon-subtle`                  | color | reserved | `#67787c` | `#9ca8ab`                   | —                      |
| `color.icon.action`                  | `--color-icon-action`                  | color | reserved | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.action.background.default`    | `--color-action-background-default`    | color | active   | `#432dd7` | `#372aac`                   | —                      |
| `color.action.background.foreground` | `--color-action-background-foreground` | color | active   | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.feedback.error.default`       | `--color-feedback-error-default`       | color | active   | `#e7000b` | `#ff6467`                   | —                      |
| `color.feedback.error.foreground`    | `--color-feedback-error-foreground`    | color | active   | `#ffffff` | `#090b0c`                   | —                      |
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
| `color.sidebar.ring`                 | `--color-sidebar-ring`                 | color | active   | `#67787c` | `#67787c`                   | `mist.500`             |
| `color.sidebar.primary.default`      | `--color-sidebar-primary-default`      | color | active   | `#4f39f6` | `#615fff`                   | `violet.500`           |
| `color.sidebar.primary.on`           | `--color-sidebar-primary-on`           | color | active   | `#eef2ff` | `#ffffff`                   | `mist.0`               |
| `color.sidebar.accent.default`       | `--color-sidebar-accent-default`       | color | active   | `#f1f3f3` | `#22292b`                   | `mist.800`             |
| `color.sidebar.accent.foreground`    | `--color-sidebar-accent-foreground`    | color | active   | `#161b1d` | `#f9fbfb`                   | `mist.50`              |
| `color.static.white`                 | `--color-static-white`                 | color | active   | `#ffffff` | `#ffffff`                   | `bg-white, text-white` |
| `color.static.black`                 | `--color-static-black`                 | color | active   | `#000000` | `#000000`                   | `bg-black/10`          |

**Usage rules**

| Scope                                | ✅ Do                                                                                               | ❌ Don't                                                                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.background.default`           | Use as the background of the root page and the main containers (`<body>`, `<main>`).                | Do not use for cards, popovers or raised surfaces — use `color.background.subtle` or `color.background.elevated`.                                                                      |
| `color.background.subtle`            | Use for cards, muted areas, secondary sidebars, inner panels.                                       | Do not use for the page's main background.                                                                                                                                             |
| `color.background.elevated`          | Use for popovers, drop-downs, dialogs, light tooltips.                                              | Do not use for inline cards — they are not "raised" on the Z axis.                                                                                                                     |
| `color.background.inverse`           | Use for dark tooltips, inverted badges, alert banners.                                              | Do not use as a general page background — it is reserved for occasional inverted surfaces.                                                                                             |
| `color.text.default`                 | Use for all main content text, titles and important labels.                                         | Do not lower the opacity to fake secondary text — use `color.text.subtle`.                                                                                                             |
| `color.text.subtle`                  | Use for field labels, form descriptions, timestamps.                                                | Do not use for main body content — its contrast is too low for long reading.                                                                                                           |
| `color.text.bold`                    | Use for emphasis in areas with a busy visual context.                                               | Do not use as a substitute for `text.default` in standard body text.                                                                                                                   |
| `color.text.inverse`                 | Use only on `color.background.inverse`.                                                             | Do not use on standard surfaces — the contrast would be too low.                                                                                                                       |
| `color.text.action.default`          | Use for text links and labels that express a clickable action.                                      | Do not use for generic body text — it is reserved for actionable elements.                                                                                                             |
| `color.text.action.on`               | Use for the label of a primary button.                                                              | Do not use on neutral surfaces — the contrast is too low on a light background.                                                                                                        |
| `color.text.destructive.default`     | Use for error validation messages, destructive button and badge labels, and destructive menu items. | Do not use for warnings or information — it is reserved for critical errors. Do not use `color.feedback.error.default` for text: on a card or a destructive tint it falls below 4.5:1. |
| `color.border.default`               | Use for dividers between sections and card outlines.                                                | Do not use for form fields — use `color.border.input`.                                                                                                                                 |
| `color.border.subtle`                | Use for inner list separators and light divisions.                                                  | Do not use on interactive components that need a visible border.                                                                                                                       |
| `color.border.input`                 | Use for every `<input>`, `<select>`, `<textarea>` and `<checkbox>` border.                          | Do not use for decorative separators — it is reserved for form controls.                                                                                                               |
| `color.border.focus`                 | Use only for the `:focus-visible` state of interactive elements.                                    | Never remove the focus ring — it is a WCAG 2.4.7 accessibility requirement.                                                                                                            |
| `color.icon.default`                 | Use for navigation, standard action and content icons.                                              | Do not use for icons inside primary buttons — use `color.icon.action`.                                                                                                                 |
| `color.icon.subtle`                  | Use for status icons, loading indicators and metadata icons.                                        | Do not use for main action icons.                                                                                                                                                      |
| `color.icon.action`                  | Use for icons inside primary buttons or action badges.                                              | Do not use on a neutral or light background.                                                                                                                                           |
| `color.action.background.default`    | Use for the background of primary buttons and CTA elements.                                         | Do not use for the secondary, ghost or outline variants — those variants have no colored background.                                                                                   |
| `color.action.background.foreground` | Always pair with `color.action.background.default` for the text of a primary button.                | Do not use on a neutral or light background.                                                                                                                                           |
| `color.feedback.error.default`       | Use for the borders and rings of invalid fields and for the `bg-destructive/10`–`/30` tints.        | Do not use for text or icons — use `color.text.destructive.default` (`text-destructive`). Do not use for warnings or success states.                                                   |
| `color.feedback.error.foreground`    | Use whenever a solid `bg-destructive` background carries text or an icon.                           | Never put `color.text.default` or `text-white` on an error surface — in dark mode, white on red.500 drops to 2.89:1.                                                                   |
| `color.chart.*`                      | Use in order (1 → 5) for chart series.                                                              | Do not reuse these tokens for general UI colors — they are reserved for data visualization.                                                                                            |
| `color.sidebar.*`                    | Use only in side navigation components.                                                             | Do not reuse these tokens in the main content — they belong to the sidebar's context.                                                                                                  |

---

## Space

| Token                          | CSS variable                     | Type      | Status   | Value     | Tailwind |
| ------------------------------ | -------------------------------- | --------- | -------- | --------- | -------- |
| `space.component.xs`           | `--space-component-xs`           | dimension | reserved | `0.25rem` | —        |
| `space.component.sm`           | `--space-component-sm`           | dimension | reserved | `0.5rem`  | —        |
| `space.component.md`           | `--space-component-md`           | dimension | reserved | `1rem`    | —        |
| `space.component.lg`           | `--space-component-lg`           | dimension | active   | `1.5rem`  | —        |
| `space.component.xl`           | `--space-component-xl`           | dimension | reserved | `2rem`    | —        |
| `space.focus-ring-width`       | `--space-focus-ring-width`       | dimension | active   | `2px`     | —        |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | dimension | active   | `1.5rem`  | —        |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | dimension | active   | `4rem`    | —        |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | dimension | reserved | `42rem`   | —        |
| `space.layout.content-default` | `--space-layout-content-default` | dimension | reserved | `64rem`   | —        |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | dimension | reserved | `80rem`   | —        |
| `space.layout.sidebar`         | `--space-layout-sidebar`         | dimension | active   | `16rem`   | —        |
| `space.layout.sidebar-mobile`  | `--space-layout-sidebar-mobile`  | dimension | active   | `18rem`   | —        |
| `space.layout.sidebar-icon`    | `--space-layout-sidebar-icon`    | dimension | active   | `3rem`    | —        |

**Usage rules**

| Scope                          | ✅ Do                                                                           | ❌ Don't                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `space.component.xs`           | Gap between an icon and its label in a compact button, a badge's inner padding. | Do not use for layout spacing.                                                   |
| `space.component.sm`           | Padding of a compact button, gap of a tight list.                               | Do not use to space out page sections.                                           |
| `space.component.md`           | Standard card padding, gap between the buttons of a group.                      | Do not use for the gap between page sections.                                    |
| `space.component.lg`           | A dialog's inner padding, gap between form fields.                              | Do not confuse with `space.layout.page-padding` (same value, different context). |
| `space.component.xl`           | Padding of a large card section, spacing between groups of form fields.         | Do not use between nearby inline elements.                                       |
| `space.layout.page-padding`    | Horizontal padding of the root page container.                                  | Do not apply to inner components.                                                |
| `space.layout.section-gap`     | Vertical space between the major sections of a page.                            | Do not use between components of the same section.                               |
| `space.layout.content-sm`      | `max-w-[var(--space-layout-content-sm)]` for editorial pages.                   | Do not use as a padding value.                                                   |
| `space.layout.content-default` | The main content container of most pages.                                       | Do not exceed it for standard content layouts.                                   |
| `space.layout.content-lg`      | Dashboards, data tables, multi-column layouts.                                  | Do not use for editorial content pages.                                          |

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
| `typography.line-height.tight`     | `--typography-line-height-tight`     | number     | active | `1.25`                      | `leading-tight`   |
| `typography.line-height.snug`      | `--typography-line-height-snug`      | number     | active | `1.375`                     | `leading-snug`    |
| `typography.line-height.normal`    | `--typography-line-height-normal`    | number     | active | `1.5`                       | `leading-normal`  |
| `typography.line-height.relaxed`   | `--typography-line-height-relaxed`   | number     | active | `1.625`                     | `leading-relaxed` |
| `typography.line-height.loose`     | `--typography-line-height-loose`     | number     | active | `2`                         | `leading-loose`   |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | dimension  | active | `-0.025em`                  | `tracking-tight`  |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | dimension  | active | `0em`                       | `tracking-normal` |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | dimension  | active | `0.025em`                   | `tracking-wide`   |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | dimension  | active | `0.05em`                    | `tracking-wider`  |
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

| Token                 | CSS variable            | Type   | Status   | Value | Tailwind |
| --------------------- | ----------------------- | ------ | -------- | ----- | -------- |
| `opacity.disabled`    | `--opacity-disabled`    | number | active   | `0.5` | —        |
| `opacity.placeholder` | `--opacity-placeholder` | number | reserved | `0.5` | —        |
| `opacity.overlay`     | `--opacity-overlay`     | number | reserved | `0.8` | —        |

**Usage rules**

| Scope                 | ✅ Do                                                                                                                                                     | ❌ Don't                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `opacity.disabled`    | Use `opacity-disabled` under the disabled-state variant: `disabled:opacity-disabled`, `data-disabled:opacity-disabled`, `aria-disabled:opacity-disabled`… | Do not write `disabled:opacity-50` (ESLint rejects it), and do not use it for secondary text — use `color.text.subtle`. |
| `opacity.placeholder` | Apply to the `::placeholder` of form fields.                                                                                                              | Do not confuse with `opacity.disabled` — they serve different purposes.                                                 |
| `opacity.overlay`     | Use for the backdrops of modals and dialogs.                                                                                                              | Do not go below `0.7` — the contrast becomes too low.                                                                   |

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
| `shadcn.primary-foreground`         | `--primary-foreground`         | color     | active | `#eef2ff`  | `#eef2ff`                   | —        |
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
| `shadcn.ring`                       | `--ring`                       | color     | active | `#67787c`  | `#67787c`                   | —        |
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
| `shadcn.sidebar-ring`               | `--sidebar-ring`               | color     | active | `#67787c`  | `#67787c`                   | —        |

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
| `primitive.color.blue.300`                   | `--ds-prim-color-blue-300`                   | color       | active   | `#8fd6fa`                                                          | —        |
| `primitive.color.blue.600`                   | `--ds-prim-color-blue-600`                   | color       | active   | `#438fbd`                                                          | —        |
| `primitive.color.yellow.200`                 | `--ds-prim-color-yellow-200`                 | color       | active   | `#e5e747`                                                          | —        |
| `primitive.color.amber.500`                  | `--ds-prim-color-amber-500`                  | color       | active   | `#c89005`                                                          | —        |
| `primitive.color.amber.600`                  | `--ds-prim-color-amber-600`                  | color       | active   | `#af8526`                                                          | —        |
| `primitive.color.amber.800`                  | `--ds-prim-color-amber-800`                  | color       | active   | `#734e00`                                                          | —        |
| `primitive.color.plum.500`                   | `--ds-prim-color-plum-500`                   | color       | active   | `#9b5f7c`                                                          | —        |
| `primitive.color.plum.800`                   | `--ds-prim-color-plum-800`                   | color       | active   | `#4d2761`                                                          | —        |
| `primitive.color.black`                      | `--ds-prim-color-black`                      | color       | active   | `#000000`                                                          | —        |
| `primitive.color.white-alpha.10`             | `--ds-prim-color-white-alpha-10`             | color       | active   | `rgba(255, 255, 255, 0.1)`                                         | —        |
| `primitive.color.white-alpha.15`             | `--ds-prim-color-white-alpha-15`             | color       | active   | `rgba(255, 255, 255, 0.15)`                                        | —        |
| `primitive.space.1`                          | `--ds-prim-space-1`                          | dimension   | active   | `0.25rem`                                                          | —        |
| `primitive.space.2`                          | `--ds-prim-space-2`                          | dimension   | active   | `0.5rem`                                                           | —        |
| `primitive.space.3`                          | `--ds-prim-space-3`                          | dimension   | reserved | `0.75rem`                                                          | —        |
| `primitive.space.4`                          | `--ds-prim-space-4`                          | dimension   | active   | `1rem`                                                             | —        |
| `primitive.space.5`                          | `--ds-prim-space-5`                          | dimension   | reserved | `1.25rem`                                                          | —        |
| `primitive.space.6`                          | `--ds-prim-space-6`                          | dimension   | active   | `1.5rem`                                                           | —        |
| `primitive.space.8`                          | `--ds-prim-space-8`                          | dimension   | active   | `2rem`                                                             | —        |
| `primitive.space.10`                         | `--ds-prim-space-10`                         | dimension   | reserved | `2.5rem`                                                           | —        |
| `primitive.space.12`                         | `--ds-prim-space-12`                         | dimension   | active   | `3rem`                                                             | —        |
| `primitive.space.16`                         | `--ds-prim-space-16`                         | dimension   | reserved | `4rem`                                                             | —        |
| `primitive.space.24`                         | `--ds-prim-space-24`                         | dimension   | reserved | `6rem`                                                             | —        |
| `primitive.space.32`                         | `--ds-prim-space-32`                         | dimension   | reserved | `8rem`                                                             | —        |
| `primitive.space.0-5`                        | `--ds-prim-space-0-5`                        | dimension   | reserved | `0.125rem`                                                         | —        |
| `primitive.space.page`                       | `--ds-prim-space-page`                       | dimension   | active   | `1.5rem`                                                           | —        |
| `primitive.space.section`                    | `--ds-prim-space-section`                    | dimension   | active   | `4rem`                                                             | —        |
| `primitive.space.content-sm`                 | `--ds-prim-space-content-sm`                 | dimension   | active   | `42rem`                                                            | —        |
| `primitive.space.content`                    | `--ds-prim-space-content`                    | dimension   | active   | `64rem`                                                            | —        |
| `primitive.space.content-lg`                 | `--ds-prim-space-content-lg`                 | dimension   | active   | `80rem`                                                            | —        |
| `primitive.space.sidebar`                    | `--ds-prim-space-sidebar`                    | dimension   | active   | `16rem`                                                            | —        |
| `primitive.space.sidebar-mobile`             | `--ds-prim-space-sidebar-mobile`             | dimension   | active   | `18rem`                                                            | —        |
| `primitive.space.focus-ring-width`           | `--ds-prim-space-focus-ring-width`           | dimension   | active   | `2px`                                                              | —        |
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
| `primitive.typography.font-weight.normal`    | `--ds-prim-typography-font-weight-normal`    | fontWeight  | active   | `400`                                                              | —        |
| `primitive.typography.font-weight.medium`    | `--ds-prim-typography-font-weight-medium`    | fontWeight  | active   | `500`                                                              | —        |
| `primitive.typography.font-weight.semibold`  | `--ds-prim-typography-font-weight-semibold`  | fontWeight  | active   | `600`                                                              | —        |
| `primitive.typography.font-weight.bold`      | `--ds-prim-typography-font-weight-bold`      | fontWeight  | active   | `700`                                                              | —        |
| `primitive.typography.font-family.sans`      | `--ds-prim-typography-font-family-sans`      | fontFamily  | active   | `Geist, sans-serif`                                                | —        |
| `primitive.typography.font-family.mono`      | `--ds-prim-typography-font-family-mono`      | fontFamily  | active   | `JetBrains Mono, monospace`                                        | —        |
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
