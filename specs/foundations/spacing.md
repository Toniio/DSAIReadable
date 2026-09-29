# Spacing Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The spacing system has two separate axes: **component** spacing (micro) and **layout** spacing (macro). Never use a layout token for spacing inside a component, and vice versa.

---

## Component Spacing

Space **inside** a component (`padding`, `gap`) or **between nearby components**. Range: 4 px → 32 px.

| Token                | CSS Variable           | rem value | px value | Typical use                                                            |
| -------------------- | ---------------------- | --------- | -------- | ---------------------------------------------------------------------- |
| `space.component.xs` | `--space-component-xs` | `0.25rem` | 4 px     | Gap between an icon and its label, a badge's inner padding             |
| `space.component.sm` | `--space-component-sm` | `0.5rem`  | 8 px     | Padding of a compact button, gap between tight list items              |
| `space.component.md` | `--space-component-md` | `1rem`    | 16 px    | Standard card padding, gap between the buttons of a group              |
| `space.component.lg` | `--space-component-lg` | `1.5rem`  | 24 px    | A dialog's inner padding, gap between the fields of a form             |
| `space.component.xl` | `--space-component-xl` | `2rem`    | 32 px    | Padding of a large card section, spacing between groups of form fields |

### Tailwind examples

```tsx
// Compact button — xs gap between the icon and the label
<button className="flex items-center gap-1 px-3 py-1.5">
  <Icon /> Label
</button>

// Standard card — md padding
<div className="p-4 flex flex-col gap-4">
  <h2>Title</h2>
  <p>Content</p>
</div>

// Dialog — lg padding
<div className="p-6 flex flex-col gap-6">
  <DialogHeader />
  <DialogContent />
</div>
```

> **Tailwind note:** the numeric classes (`gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px) read the steps of the spacing scale below, and land on the same values as the component tokens. Reach for these classes first.

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

| Token                          | CSS Variable                     | Value            | Typical use                                         |
| ------------------------------ | -------------------------------- | ---------------- | --------------------------------------------------- |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | `1.5rem` (24 px) | Horizontal padding of the root page container       |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | `4rem` (64 px)   | Vertical space between the major sections of a page |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | `42rem`          | `max-width` of a narrow column (an article, prose)  |
| `space.layout.content-default` | `--space-layout-content-default` | `64rem`          | Default `max-width` of the main content             |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | `80rem`          | `max-width` of wide layouts (dashboards)            |

### Generated Tailwind classes

Through `@theme inline` in `globals.css`, the layout tokens are available as:

```tsx
// Page container — px-page = 1.5rem of horizontal padding
<main className="px-page mx-auto max-w-[var(--space-layout-content-default)]">
  ...
</main>

// Gap between sections — gap-section = 4rem
<div className="flex flex-col gap-section">
  <HeroSection />
  <FeaturesSection />
  <CTASection />
</div>

// Content container — maximum widths
<article className="mx-auto w-full max-w-[var(--space-layout-content-sm)]">
  {/* prose / narrow article */}
</article>

<div className="mx-auto w-full max-w-[var(--space-layout-content-lg)]">
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
xs  ▌ 4px
sm  ▌▌ 8px
md  ▌▌▌▌ 16px
lg  ▌▌▌▌▌▌ 24px
xl  ▌▌▌▌▌▌▌▌ 32px
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

1. **Two axes, two vocabularies** — `space.component.*` inside components; `space.layout.*` for the overall layout. Never swap them.
2. **No arbitrary values** — use the tokens only. When an in-between value is needed, discuss it with the design team first.
3. **Stay on the component axis** — a form uses `lg` (24px) between its fields and `md` (16px) for inner padding. Keep to that axis throughout the same component.
4. **`page-padding` is applied once** — on the page's root container, not on each section.
5. **`content-*` through `max-width`** — these tokens set maximum widths, not padding. Always pair them with `mx-auto` to center.

### Arbitrary values: reading a token is free, computing one is not

A Tailwind arbitrary value (`w-[…]`, `gap-[…]`, `grid-cols-[…]`…) is allowed
without justification as long as it **reads** a decision without making one:

| Allowed without justification        | Why                                                     |
| ------------------------------------ | ------------------------------------------------------- |
| `w-[var(--sidebar-width)]`           | reads a token; changing the token changes the component |
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
