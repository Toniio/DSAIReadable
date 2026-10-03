# Spacing Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The spacing system has two separate axes: **component** spacing (micro), drawn with the steps of the spacing scale, and **layout** spacing (macro), drawn with the `space.layout.*` tokens. Never use a layout class for spacing inside a component, and vice versa.

---

## Component Spacing

Space **inside** a component (`padding`, `gap`) or **between nearby components** comes from the steps of [the spacing scale](#the-spacing-scale). Among the steps the components draw with:

| Class           | Token             | Value | Where the components use it                                                                                                         |
| --------------- | ----------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `gap-1`         | `space.scale.1`   | 4px   | Between a dialog's title and its description, a compact button's icon and label                                                     |
| `gap-1.5`       | `space.scale.1-5` | 6px   | Between a button's icon and its label                                                                                               |
| `gap-2`         | `space.scale.2`   | 8px   | Between the buttons of a dialog's footer                                                                                            |
| `px-2.5`        | `space.scale.2-5` | 10px  | A button's horizontal padding                                                                                                       |
| `p-4` · `gap-4` | `space.scale.4`   | 16px  | A dialog's padding and the gap between its parts; the same step through `--card-spacing` in a card (`space.scale.3` at `size="sm"`) |
| `gap-5`         | `space.scale.5`   | 20px  | Between the fields of a `FieldGroup`                                                                                                |

### Tailwind examples

```tsx
// Compact button — size="sm" puts gap-1 (4px) between the icon and the label
<Button size="sm">
  <PlusIcon /> Label
</Button>

// A card — gap-4 (16px) between the blocks of its content, gap-2 (8px) between its actions
<Card>
  <CardContent className="flex flex-col gap-4">
    <p>Summary</p>
    <p>Details</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

`DialogContent` already pads and spaces its parts (`p-4`, `gap-4`): do not add padding to it.

> **The `space.component.*` tokens draw no class.** All five are reserved: no component reads them, and `p-component-md` generates no CSS. `DialogContent` keeps its viewport gutter through the scale (`max-w-[calc(100%-var(--space-scale-8))]`, 16px on each side). Reach for the steps of the scale.

---

## The Spacing Scale

Every numeric spacing and sizing class reads one step of `space.scale.*`: `p-2`
reads `--space-scale-2`, `gap-1.5` reads `--space-scale-1-5`, `size-9` reads
`--space-scale-9`. A step `n` is `n × 4px`. Width, height and size share the
scale with padding, margin, gap, inset and translate, because Tailwind reads
them from one namespace; negative steps (`-mx-1`) come for free.

| Steps                                                            | Values          | Note                                                                                                            |
| ---------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `0` `0.5` `1` `1.5` `2` `2.5` `3` `3.5`                          | 0 → 14px        | fine adjustments inside components                                                                              |
| `4` `5` `6` `7` `8` `9` `10` `11` `12`                           | 16 → 48px       | padding, gaps, control heights (`h-8`, `h-9`)                                                                   |
| `14` `16` `20` `24` `28` `32` `36` `40` `44` `48` `52` `56` `60` | 56 → 240px      | large sizes (`min-w-32`, `size-48`)                                                                             |
| `64` `72` `80` `96`                                              | 256 → 384px     | panel widths (`w-64`, `w-72`)                                                                                   |
| `1.25` `5.25` `18`                                               | 5px, 21px, 72px | outside Tailwind v3's scale: `Alert`'s close button and action room, `Combobox`'s chip, as shadcn/ui draws them |

This is Tailwind v3's spacing scale, the one models write from memory and
shadcn/ui draws with, plus the three steps shadcn/ui adds. Any other step
(`p-13`, `h-15`, `gap-17`) generates no CSS.

### Container widths

`max-w-*` and `w-*` also take the container scale, `space.container.*`:
`3xs` (256px), `2xs` (288px), `xs` (320px), `sm` (384px), `md` (448px), `lg`
(512px), `xl` (576px), `2xl` (672px), `3xl` (768px), `4xl` (896px), `5xl`
(1024px), `6xl` (1152px), `7xl` (1280px). `max-w-2xl`, `max-w-5xl` and
`max-w-7xl` match `space.layout.content-sm`, `content-default` and
`content-lg`.

These are also the steps of container queries (`@md/field-group:`), which
Tailwind compiles at build time and which cannot read `var()`. So, like the
breakpoints, they are not bridged: Tailwind's own values are the
`space.container.*` tokens, and `tokens:lint-bridge` checks the two stay equal.

---

## Layout Spacing

**Layout** space: page padding, gaps between sections, maximum content widths.

| Token                          | CSS Variable                     | Value            | Typical use                                                                  |
| ------------------------------ | -------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | `1.5rem` (24 px) | Horizontal padding of the root page container                                |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | `4rem` (64 px)   | Vertical space between the major sections of a page                          |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | `42rem`          | `max-width` of a narrow column (an article, prose)                           |
| `space.layout.content-default` | `--space-layout-content-default` | `64rem`          | Default `max-width` of the main content                                      |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | `80rem`          | `max-width` of wide layouts (dashboards)                                     |
| `space.layout.sidebar`         | `--space-layout-sidebar`         | `16rem` (256 px) | Width of the navigation sidebar: `w-sidebar`                                 |
| `space.layout.sidebar-mobile`  | `--space-layout-sidebar-mobile`  | `18rem` (288 px) | Width of the sidebar on mobile viewports, in its `Sheet`: `w-sidebar-mobile` |
| `space.layout.sidebar-icon`    | `--space-layout-sidebar-icon`    | `3rem` (48 px)   | Width of the sidebar collapsed to its icons: `w-sidebar-icon`                |

### Generated Tailwind classes

Through `@theme inline` in `globals.css`, `px-page`, `py-section` and `gap-section` read the layout tokens, and `w-sidebar`, `w-sidebar-mobile` and `w-sidebar-icon` the sidebar widths. The content widths have no class of their own: use the container steps they equal (see Container widths):

```tsx
// Page container — px-page = 1.5rem of horizontal padding
<main className="px-page mx-auto max-w-5xl">
  ...
</main>

// Gap between sections — gap-section = 4rem
<div className="flex flex-col gap-section">
  <HeroSection />
  <FeaturesSection />
  <CTASection />
</div>

// Content container — max-w-2xl, max-w-5xl and max-w-7xl are content-sm, content-default and content-lg
<article className="mx-auto w-full max-w-2xl">
  {/* prose / narrow article */}
</article>

<div className="mx-auto w-full max-w-7xl">
  {/* wide dashboard */}
</div>
```

### A full page layout

```tsx
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <Sidebar />
        <main className="flex flex-col gap-section px-page py-section">
          {children}
        </main>
      </body>
    </html>
  )
}
```

---

## Visual scale

```
1   ▌ 4px
2   ▌▌ 8px
4   ▌▌▌▌ 16px
6   ▌▌▌▌▌▌ 24px
8   ▌▌▌▌▌▌▌▌ 32px
─────────────────────────────
page-padding  ████████████████████ 24px (1.5rem)
section-gap   ████████████████████████████████████████████████████████████████ 64px (4rem)
```

---

## The Lock

`styles/globals.css` resets Tailwind's spacing namespace (`--spacing: initial`,
`--spacing-*: initial`), then
declares each step of the scale by name, read from its token:
`--spacing-2: var(--space-scale-2)`, `--spacing-0\.5: var(--space-scale-0-5)`.
While `--spacing` exists, Tailwind accepts any multiple of it; without it, only
the declared steps resolve. So `p-13` and `max-w-13` generate no CSS, and
ESLint (`better-tailwindcss/no-unknown-classes`) rejects them.

- **`--spacing()` no longer compiles** in an arbitrary value: read the step's
  token instead, `[--cell-size:var(--space-scale-7)]`.
- **The runtime `--spacing` variable stays**: `tw-animate-css`
  (`slide-in-from-top-2`) and `shadcn/tailwind.css` (the scroll fade) read
  `var(--spacing)` in their CSS, so `@layer base` sets it on `:root` to
  `--space-scale-1`. It
  generates no class. `ToggleGroup` multiplies it by its `spacing` prop, a
  number of scale units.
- **Adding a step** takes a primitive, a `space.scale.*` token and its bridge
  line; review is where the scale grows.

**`@theme static`: not adopted.** `static` would print every theme variable to
`:root`, including an alias for each step (`--spacing-2` beside
`--space-scale-2`). `tokens.css` already prints every token, and `@theme inline`
compiles each class straight to the token (`p-2` → `var(--space-scale-2)`), so
the aliases would only add a second name that code could read instead of the
token.

---

## Usage Rules

1. **Two axes, two vocabularies** — the steps of the spacing scale (`gap-2`, `px-2.5`, `p-4`) inside and between components; `space.layout.*` (`px-page`, `gap-section`) for the overall layout. Never swap them.
2. **No arbitrary values** — use the steps of the scale only. When an in-between value is needed, discuss it with the design team first.
3. **Keep the component's rhythm** — a form lets `FieldGroup` space its fields (`gap-5`), and a card spaces its content with `--card-spacing` (`space.scale.4`, `space.scale.3` at `size="sm"`). Keep to those steps throughout the same component.
4. **`page-padding` is applied once** — on the page's root container, not on each section.
5. **`content-*` through `max-width`** — these tokens set maximum widths, not padding. Always pair them with `mx-auto` to center.

### Arbitrary values: reading a token is free, computing one is not

**In a screen, there is no arbitrary value at all**: `@dsaireadable/eslint-plugin` (`dsaireadable/no-raw-values`) rejects every `x-[…]` class, `top-[50%]` and `grid-cols-[auto_1fr]` included. Use a step of the scale or a class of the design system (`w-sidebar`, `max-w-5xl`, `top-1/2`, `grid-cols-2`).

When no class reads a token or a runtime variable (`--radix-popover-trigger-width`, `--color-chart-sequential-3`), write Tailwind's shorthand, `utility-(--variable)`: `w-(--radix-popover-trigger-width)`, `bg-(--color-chart-sequential-3)`, and `text-(length:--x)` where the utility could read a color or a size. Never `w-[var(--…)]`, which the plugin rejects and answers with the shorthand, and never `w-[--…]`, which compiles to the invalid `width: --…`. The shorthand is for a variable with no class: where a class exists, `p-(--space-scale-4)` is a spelling you did not need, write `p-4`. A `style` prop may read a token too (`style={{ width: "var(--sidebar-width)" }}`), after a class has been ruled out.

The rule below applies to the design system's own components, in `components/ui/`.

A Tailwind arbitrary value (`w-[…]`, `gap-[…]`, `grid-cols-[…]`…) is allowed
without justification as long as it **reads** a decision without making one:

| Allowed without justification        | Why                                                     |
| ------------------------------------ | ------------------------------------------------------- |
| `w-(--sidebar-width)`                | reads a token; changing the token changes the component |
| `[--cell-size:var(--space-scale-7)]` | reads a step of the spacing scale                       |
| `top-[50%]`                          | relative to the parent box, not a design value          |
| `grid-cols-[auto_1fr]`               | describes a structure, not a size                       |

As soon as there is **arithmetic** — `calc()`, `+`, `-`, `*`, `/` — the value
encodes a relationship invented inside the component, which no token expresses
and no agent can guess. It then requires `// allow-raw: <id>` on the line, or
right above it in a contiguous comment block, **and** a matching entry in
`tokens/allow-raw.registry.json`.

`npm run tokens:lint-values` enforces the rule. Simplify first:
`top-[calc(var(--space-scale-1-25))]` is written `top-1.25` and compiles to
the same thing.
