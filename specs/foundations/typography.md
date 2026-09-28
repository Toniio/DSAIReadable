# Typography Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

> ⚠️ **Key point:** this project uses **JetBrains Mono** (`typography.font-family.mono`) as the **default** typeface on `<html>`, through `@apply font-mono`. Geist Sans is available but secondary.
>
> **Who picks the typeface:** `next/font`, in `app/layout.tsx`, which self-hosts it and adjusts its fallback metrics. The `typography.font-family.*` tokens **describe** that choice; they do not drive it: `font-mono` and `font-sans` read `--font-mono` and `--font-sans`, which `next/font` sets. `npm run tokens:lint-fonts` checks that each token names the family loaded under its variable. Changing the typeface means changing the loader in `layout.tsx` **and** the token.

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

| Token                  | CSS Variable             | rem value  | px value | Tailwind Class | Usage                                     |
| ---------------------- | ------------------------ | ---------- | -------- | -------------- | ----------------------------------------- |
| `typography.size.xs`   | `--typography-size-xs`   | `0.75rem`  | 12 px    | `text-xs`      | Labels, badges, chart legends             |
| `typography.size.sm`   | `--typography-size-sm`   | `0.875rem` | 14 px    | `text-sm`      | Secondary text, field labels, helper text |
| `typography.size.base` | `--typography-size-base` | `1rem`     | 16 px    | `text-base`    | Main body text                            |
| `typography.size.lg`   | `--typography-size-lg`   | `1.125rem` | 18 px    | `text-lg`      | Emphasized body text, introductions       |
| `typography.size.xl`   | `--typography-size-xl`   | `1.25rem`  | 20 px    | `text-xl`      | Section headings (h3, h4)                 |
| `typography.size.2xl`  | `--typography-size-2xl`  | `1.5rem`   | 24 px    | `text-2xl`     | Page headings (h2)                        |
| `typography.size.3xl`  | `--typography-size-3xl`  | `1.875rem` | 30 px    | `text-3xl`     | Hero headings (h1)                        |
| `typography.size.4xl`  | `--typography-size-4xl`  | `2.25rem`  | 36 px    | `text-4xl`     | Display headings — rare                   |

---

## Line Heights

| Token                            | CSS Variable                       | Value   | Tailwind Class    | Usage                                 |
| -------------------------------- | ---------------------------------- | ------- | ----------------- | ------------------------------------- |
| `typography.line-height.tight`   | `--typography-line-height-tight`   | `1.25`  | `leading-tight`   | Headings — short text on 1 or 2 lines |
| `typography.line-height.snug`    | `--typography-line-height-snug`    | `1.375` | `leading-snug`    | Subheadings, multi-line labels        |
| `typography.line-height.normal`  | `--typography-line-height-normal`  | `1.5`   | `leading-normal`  | Default body text                     |
| `typography.line-height.relaxed` | `--typography-line-height-relaxed` | `1.625` | `leading-relaxed` | Long-form text, articles              |
| `typography.line-height.loose`   | `--typography-line-height-loose`   | `2`     | `leading-loose`   | Very airy text — seldom used          |

---

## Letter Spacings

| Token                              | CSS Variable                         | Value      | Tailwind Class    | Usage                                            |
| ---------------------------------- | ------------------------------------ | ---------- | ----------------- | ------------------------------------------------ |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | `-0.025em` | `tracking-tight`  | Large headings (3xl, 4xl) — tightens the letters |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | `0em`      | `tracking-normal` | Running text — the default                       |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | `0.025em`  | `tracking-wide`   | Small UI labels (xs, sm)                         |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | `0.05em`   | `tracking-wider`  | All-caps text, overlines                         |

---

## Font Weights

| Token                             | CSS Variable                        | Value | Tailwind Class  | Usage                                |
| --------------------------------- | ----------------------------------- | ----- | --------------- | ------------------------------------ |
| `typography.font-weight.normal`   | `--typography-font-weight-normal`   | `400` | `font-normal`   | Standard body text                   |
| `typography.font-weight.medium`   | `--typography-font-weight-medium`   | `500` | `font-medium`   | UI labels, buttons, navigation items |
| `typography.font-weight.semibold` | `--typography-font-weight-semibold` | `600` | `font-semibold` | Subheadings, emphasis in the UI      |
| `typography.font-weight.bold`     | `--typography-font-weight-bold`     | `700` | `font-bold`     | Main headings, strong emphasis       |

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

### Label — field or button label

```tsx
<label className="text-sm leading-snug font-medium tracking-wide text-foreground">
  Field name
</label>
```

`size: sm (14px)` · `lineHeight: snug (1.375)` · `weight: medium (500)` · `tracking: wide`

### Heading 1 — page title

```tsx
<h1 className="text-3xl leading-tight font-bold tracking-tight text-foreground">
  Main title
</h1>
```

`size: 3xl (30px)` · `lineHeight: tight (1.25)` · `weight: bold (700)` · `tracking: tight`

### Heading 2 — section title

```tsx
<h2 className="text-2xl leading-tight font-semibold text-foreground">
  Section title
</h2>
```

`size: 2xl (24px)` · `lineHeight: tight (1.25)` · `weight: semibold (600)`

### Heading 3 — subsection

```tsx
<h3 className="text-xl leading-snug font-semibold text-foreground">
  Subsection
</h3>
```

`size: xl (20px)` · `lineHeight: snug (1.375)` · `weight: semibold (600)`

### Caption — caption, annotation

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

### Display — large hero title

```tsx
<h1 className="text-4xl leading-tight font-bold tracking-tight text-foreground">
  Display Heading
</h1>
```

`size: 4xl (36px)` · `lineHeight: tight (1.25)` · `weight: bold (700)` · `tracking: tight`

---

## Usage Rules

1. **JetBrains Mono is the default typeface** — never override `font-family` on standard UI components without design approval.
2. **Always pair `size` with `lineHeight`** — a heading without `leading-tight` looks too loose; body text without `leading-normal` is hard to read.
3. **`tracking-tight` only from `text-3xl` up** — on small text, negative spacing hurts readability.
4. **`tracking-wider` is for all-caps only** — never use it on regular lowercase text.
5. **A strict weight hierarchy** — `normal` → body, `medium` → labels and navigation, `semibold` → subheadings, `bold` → main headings. Do not skip levels.
