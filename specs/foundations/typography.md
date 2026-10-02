# Typography Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

> ⚠️ **Key point:** this project uses **JetBrains Mono** (`typography.font-family.mono`) as the **default** typeface on `<html>`, through `@apply font-mono`. Geist Sans is available but secondary.
>
> **Who picks the typeface:** `next/font`, in `lib/fonts.ts`, which self-hosts it and adjusts its fallback metrics. The `typography.font-family.*` tokens **describe** that choice; they do not drive it: `font-mono` and `font-sans` read `--font-mono` and `--font-sans`, which `next/font` sets. `npm run tokens:lint-fonts` checks that each token names the family loaded under its variable. Changing the typeface means changing the loader in `layout.tsx` **and** the token.

---

## Font Families

| Token                         | CSS Variable                    | Family         | Tailwind Class | Usage                                                          |
| ----------------------------- | ------------------------------- | -------------- | -------------- | -------------------------------------------------------------- |
| `typography.font-family.mono` | `--typography-font-family-mono` | JetBrains Mono | `font-mono`    | **The application's default typeface** — all UI text           |
| `typography.font-family.sans` | `--typography-font-family-sans` | Geist Sans     | `font-sans`    | `Kbd` keys and long editorial content; never for the interface |

```css
/* Applied in globals.css — @layer base */
html {
  @apply font-mono;
}
```

> **Do:** use `font-mono` everywhere, unless an explicit decision says otherwise.  
> **Don't:** do not force `font-sans` on standard UI components — it breaks visual consistency.

---

## Type Scale (Sizes)

| Token                  | CSS Variable             | rem value  | px value | Tailwind Class | Usage                                                                                                            |
| ---------------------- | ------------------------ | ---------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `typography.size.xs`   | `--typography-size-xs`   | `0.75rem`  | 12 px    | `text-xs`      | Component text: labels (`Label`, `FieldLabel`), buttons, inputs, badges, menu items, descriptions, chart legends |
| `typography.size.sm`   | `--typography-size-sm`   | `0.875rem` | 14 px    | `text-sm`      | Titles inside a component (`CardTitle`, `DialogTitle`…), the `FieldLegend` legend, a screen's secondary text     |
| `typography.size.base` | `--typography-size-base` | `1rem`     | 16 px    | `text-base`    | Main body text; `Heading` level 4                                                                                |
| `typography.size.lg`   | `--typography-size-lg`   | `1.125rem` | 18 px    | `text-lg`      | Emphasized body text, introductions; `Heading` level 3                                                           |
| `typography.size.xl`   | `--typography-size-xl`   | `1.25rem`  | 20 px    | `text-xl`      | `Heading` level 2: section headings                                                                              |
| `typography.size.2xl`  | `--typography-size-2xl`  | `1.5rem`   | 24 px    | `text-2xl`     | `Heading` level 1: the page title                                                                                |
| `typography.size.3xl`  | `--typography-size-3xl`  | `1.875rem` | 30 px    | `text-3xl`     | Hero text a screen draws; no component uses it                                                                   |
| `typography.size.4xl`  | `--typography-size-4xl`  | `2.25rem`  | 36 px    | `text-4xl`     | Display text a screen draws, rare; no component uses it                                                          |

---

## Line Heights

| Token                            | CSS Variable                       | Value   | Tailwind Class    | Usage                                    |
| -------------------------------- | ---------------------------------- | ------- | ----------------- | ---------------------------------------- |
| `typography.line-height.tight`   | `--typography-line-height-tight`   | `1.25`  | `leading-tight`   | Short text on 1 or 2 lines               |
| `typography.line-height.snug`    | `--typography-line-height-snug`    | `1.375` | `leading-snug`    | Multi-line labels: `FieldLabel` draws it |
| `typography.line-height.normal`  | `--typography-line-height-normal`  | `1.5`   | `leading-normal`  | Default body text                        |
| `typography.line-height.relaxed` | `--typography-line-height-relaxed` | `1.625` | `leading-relaxed` | Long-form text, articles                 |
| `typography.line-height.loose`   | `--typography-line-height-loose`   | `2`     | `leading-loose`   | Very airy text — seldom used             |

---

## Letter Spacings

| Token                              | CSS Variable                         | Value      | Tailwind Class    | Usage                                          |
| ---------------------------------- | ------------------------------------ | ---------- | ----------------- | ---------------------------------------------- |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | `-0.025em` | `tracking-tight`  | Headings — `Heading` draws it at every level   |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | `0em`      | `tracking-normal` | Running text — the default                     |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | `0.025em`  | `tracking-wide`   | Captions a screen draws; no component uses it  |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | `0.05em`   | `tracking-wider`  | All-caps text, overlines; no component uses it |
| `typography.letter-spacing.widest` | `--typography-letter-spacing-widest` | `0.1em`    | `tracking-widest` | Keyboard shortcuts in menus and `Command`      |

---

## Font Weights

| Token                             | CSS Variable                        | Value | Tailwind Class  | Usage                                                                                |
| --------------------------------- | ----------------------------------- | ----- | --------------- | ------------------------------------------------------------------------------------ |
| `typography.font-weight.normal`   | `--typography-font-weight-normal`   | `400` | `font-normal`   | Body text, labels (`Label`, `FieldLabel`), descriptions                              |
| `typography.font-weight.medium`   | `--typography-font-weight-medium`   | `500` | `font-medium`   | Buttons, tabs, badges, component titles (`CardTitle`, `DialogTitle`…), table headers |
| `typography.font-weight.semibold` | `--typography-font-weight-semibold` | `600` | `font-semibold` | Headings — `Heading` draws it at every level                                         |
| `typography.font-weight.bold`     | `--typography-font-weight-bold`     | `700` | `font-bold`     | Strong emphasis a screen draws; the `Logo`                                           |

---

## Type Scale — suggested combinations

These combinations define the design system's canonical text styles.

### Body — body text

```tsx
<p className="text-base leading-normal font-normal text-foreground">
  The application's main text.
</p>
```

`size: base (16px)` · `lineHeight: normal (1.5)` · `weight: normal (400)`

### Body Small — secondary text

```tsx
<p className="text-sm leading-normal font-normal text-muted-foreground">
  Help text or metadata.
</p>
```

`size: sm (14px)` · `lineHeight: normal (1.5)` · `weight: normal (400)`

### Field label — `FieldLabel` draws it

```tsx
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function Example() {
  return (
    <Field>
      <FieldLabel htmlFor="field-name">Field name</FieldLabel>
      <Input id="field-name" />
    </Field>
  )
}
```

`size: xs (12px)` · `lineHeight: snug (1.375)` · `weight: normal (400)` · `tracking: normal`

`Label` and `FieldLabel` take no `text-*`, `font-*`, `tracking-*` or `leading-*` class: the label is what the component draws, the same in every form. A bigger or bolder label above a 12px input is the one change that breaks the form's rhythm.

### Button label — `Button` draws it

`size: xs (12px)` · `weight: medium (500)` · `tracking: normal`. The same goes for `Badge` and `TabsTrigger`: write the text, not the style.

### Headings — `Heading` draws them

| `level` | Tag  | Size        | Use             |
| ------- | ---- | ----------- | --------------- |
| `1`     | `h1` | 2xl (24px)  | The page title  |
| `2`     | `h2` | xl (20px)   | A section title |
| `3`     | `h3` | lg (18px)   | A subsection    |
| `4`     | `h4` | base (16px) | A group title   |

Every level is `font-heading` (the mono family) at weight semibold (600) with `tracking-tight`, and takes the line height its size sets (`text-2xl` → 1.33, `text-xl` → 1.4, `text-lg` → 1.56, `text-base` → 1.5). The size follows `level`, and `as` changes the tag only.

```tsx
import { Heading } from "@/components/ui/heading"

export default function Example() {
  return (
    <>
      <Heading level={1}>Main title</Heading>
      <Heading level={2}>Section title</Heading>
      <Heading level={3}>Subsection</Heading>
      <Heading level={4}>Group title</Heading>
    </>
  )
}
```

To give another element a heading's look, `headingVariants({ level })` returns its classes. A raw `<h1>` to `<h6>` with a `text-*` class is not a heading of the system, and a `Heading` takes no `text-*`, `font-*`, `tracking-*` or `leading-*` class.

### Caption — a caption or annotation a screen draws

```tsx
<span className="text-xs leading-normal font-normal tracking-wide text-muted-foreground">
  Caption or footnote
</span>
```

`size: xs (12px)` · `lineHeight: normal (1.5)` · `weight: normal (400)` · `tracking: wide`

### Code — code blocks and inline code

```tsx
<code className="font-mono text-sm leading-relaxed text-foreground">
  const x = 42;
</code>
```

`size: sm (14px)` · `lineHeight: relaxed (1.625)` · `family: mono` · `weight: normal (400)`

> Note: the project already sets `font-mono` on `<html>`, so code blocks need no extra family class.

---

## The Lock

`styles/globals.css` resets Tailwind's type namespaces (`--text-*`, `--font-*`,
`--font-weight-*`, `--leading-*`, `--tracking-*: initial`) and declares only the
tokens above. So `text-7xl`, `font-serif`, `font-thin` and `tracking-tighter`
generate no CSS, and ESLint (`better-tailwindcss/no-unknown-classes`) rejects
them.

- **Each `text-*` sets its paired line height**, as in Tailwind:
  `typography.size-line-height.*` holds it (`text-xs` → 16px on 12px), with
  Tailwind's values. `leading-*` or `text-xs/relaxed` overrides it.
- **Three families**: `font-sans` (Geist), `font-mono` (JetBrains Mono, the whole
  interface) and `font-heading` (the mono family). next/font sets `--font-sans`
  and `--font-mono` on `<html>`.
- **`leading-none` stays**: it is a static Tailwind class (`line-height: 1`), not
  a theme value. A numeric `leading-6` reads the spacing scale.

---

## Usage Rules

1. **JetBrains Mono is the default typeface** — never override `font-family` on standard UI components without design approval.
2. **A heading is a `Heading`, a field label a `FieldLabel`** — each draws its own size, weight, tracking and line height, so pass it no `text-*`, `font-*`, `tracking-*` or `leading-*` class. For text a screen draws itself, a `text-*` class already carries its paired line height: add `leading-*` only to change it.
3. **`tracking-tight` belongs to headings** — `Heading` draws it at every level; on running text, negative spacing hurts readability.
4. **`tracking-wider` is for all-caps only** — never use it on regular lowercase text. `tracking-widest` is for keyboard shortcuts only.
5. **A strict weight hierarchy** — `normal` → body text, labels and descriptions, `medium` → buttons, tabs, badges and component titles, `semibold` → headings, `bold` → strong emphasis a screen draws. A field label stays `normal`.
