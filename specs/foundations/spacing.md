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

> **Tailwind note:** Tailwind's numeric values (`gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px) map directly onto the component tokens. Reach for these classes first.

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

## Why spacing is wired but not locked

Colors, radii and shadows are locked: `styles/globals.css` resets their Tailwind
namespaces (`--color-*: initial`…), so only the names the design system declares
generate CSS. Spacing is not reset, on purpose. Components draw with Tailwind's
multiplier scale (`p-2`, `gap-1.5`, `--spacing(9)`), and the tokens above name
only a few of its steps; the layout tokens are bridged by name (`p-page`,
`gap-section`, `w-sidebar`). Resetting `--spacing` today would remove every class
of that scale before a canonical scale exists to replace it.

So `p-13` still compiles. Until the canonical spacing scale is decided and the
namespace is locked, the Usage Rules below and review are what keep off-scale
steps out.

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

| Allowed without justification | Why                                                     |
| ----------------------------- | ------------------------------------------------------- |
| `w-[var(--sidebar-width)]`    | reads a token; changing the token changes the component |
| `gap-[--spacing(4)]`          | reads the spacing scale                                 |
| `top-[50%]`                   | relative to the parent box, not a design value          |
| `grid-cols-[auto_1fr]`        | describes a structure, not a size                       |

As soon as there is **arithmetic** — `calc()`, `+`, `-`, `*`, `/` — the value
encodes a relationship invented inside the component, which no token expresses
and no agent can guess. It then requires `// allow-raw: <id>` on the line, or
right above it in a contiguous comment block, **and** a matching entry in
`tokens/allow-raw.registry.json`.

`npm run tokens:lint-values` enforces the rule. Simplify first:
`top-[calc(--spacing(1.25))]` is written `top-1.25` and compiles to the same
thing.
