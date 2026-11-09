# Typography Foundation

> Source: `tokens/semantic.json`, `tokens/semantic.nova.json` · CSS variables: `tokens.css` Layer 2

> ⚠️ **Key point:** `<html>` is set in **`font-body`** (`@apply font-body`), and the brand decides what that is: **JetBrains Mono** in lyra, the default brand, and **Lora** in nova, turned on by the `nova` class on `<html>`. Never write `font-mono` to mean "the interface font": it means code.
>
> **Who picks the typeface:** the `typography.font-family.*` tokens. `next/font` self-hosts each face and sets one variable for it on `<html>` (`--font-mono` and `--font-sans` in `lib/fonts.ts`; `--font-lora`, `--font-dm-sans` and `--font-geist-mono` in `lib/fonts-nova.ts`, with `preload: false`). A primitive prints `var(--font-<face>, Family, generic)`, and a semantic token chooses a primitive. `npm run tokens:lint-fonts` checks that every family token resolves to a face its brand's file loads, and that `font-mono` ends in `monospace` in every brand. Changing a typeface means changing its loader **and** its primitive.
>
> **Why the tokens drive the family:** with one brand, the tokens only described what `next/font` had set, because nothing else could change. A second brand has to swap the typefaces with one class on `<html>`, with no reload, and `next/font` cannot do that: its variable holds one face, fixed at build time. A custom property redeclared under `.nova` can, so the token now names the face and `next/font` only loads it.

---

## Font Families

| Token                            | CSS Variable                       | Family                                   | Tailwind Class | Usage                                                                                   |
| -------------------------------- | ---------------------------------- | ---------------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `typography.font-family.body`    | `--typography-font-family-body`    | JetBrains Mono (lyra), Lora (nova)       | `font-body`    | **The application's default typeface**, set on `<html>`: all text no other role takes   |
| `typography.font-family.heading` | `--typography-font-family-heading` | JetBrains Mono (lyra), DM Sans (nova)    | `font-heading` | Headings: `Heading`, the titles of `Card`, `Dialog`, `Drawer` and `Sheet`, the `Logo`   |
| `typography.font-family.mono`    | `--typography-font-family-mono`    | JetBrains Mono (lyra), Geist Mono (nova) | `font-mono`    | Code and tabular values: `CodeBlock`, the values of a `Chart` tooltip; always monospace |
| `typography.font-family.sans`    | `--typography-font-family-sans`    | Geist (lyra), DM Sans (nova)             | `font-sans`    | `Kbd` keys, the title of a `CodeBlock`, long editorial content; never for the interface |

```css
/* Applied in globals.css — @layer base */
html {
  @apply font-body;
}
```

> **Do:** let text inherit `font-body`, and write `font-mono` for code and nothing else.  
> **Don't:** do not force `font-sans` or `font-mono` on standard UI components — both look right in lyra's monospace interface and wrong in nova's serif one.

---

## Type Scale (Sizes)

| Token                  | CSS Variable             | rem value  | px value | Tailwind Class | Usage                                                                                                                                 |
| ---------------------- | ------------------------ | ---------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `typography.size.xs`   | `--typography-size-xs`   | `0.75rem`  | 12 px    | `text-xs`      | Text that stays 12px in every brand: badges, `Kbd`, `Tooltip`, menu shortcuts and group labels, chart legends, a caption              |
| `typography.size.sm`   | `--typography-size-sm`   | `0.875rem` | 14 px    | `text-sm`      | Text that stays 14px in every brand: a screen's own line that no component draws (a result count, a prompt under a form), inline code |
| `typography.size.base` | `--typography-size-base` | `1rem`     | 16 px    | `text-base`    | Main body text; `Heading` level 4                                                                                                     |
| `typography.size.lg`   | `--typography-size-lg`   | `1.125rem` | 18 px    | `text-lg`      | Emphasized body text, introductions; `Heading` level 3                                                                                |
| `typography.size.xl`   | `--typography-size-xl`   | `1.25rem`  | 20 px    | `text-xl`      | `Heading` level 2: section headings                                                                                                   |
| `typography.size.2xl`  | `--typography-size-2xl`  | `1.5rem`   | 24 px    | `text-2xl`     | `Heading` level 1: the page title                                                                                                     |
| `typography.size.3xl`  | `--typography-size-3xl`  | `1.875rem` | 30 px    | `text-3xl`     | Hero text a screen draws; no component uses it                                                                                        |
| `typography.size.4xl`  | `--typography-size-4xl`  | `2.25rem`  | 36 px    | `text-4xl`     | Display text a screen draws, rare; no component uses it                                                                               |

---

## Text Roles

Most component text does not name a size: it names a **role**, and the brand sets its size and paired line height. In lyra a role equals the size it replaced, so nothing moved; in nova it is larger.

| Class              | Token                         | Lyra: size / line height | Nova: size / line height           | What it draws                                                                                           |
| ------------------ | ----------------------------- | ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `text-ui`          | `typography.size.ui`          | 12px / 16px              | 14px / 20px                        | Component text: `Button`, `Label`, `FieldLabel`, menu items, `TabsTrigger`, table cells, `FieldError`   |
| `text-description` | `typography.size.description` | 12px / 1.625             | 14px / 20px                        | A surface's running text: `Card`, `CardDescription`, `DialogDescription`, `FieldDescription`            |
| `text-title`       | `typography.size.title`       | 14px / 20px              | 16px / 24px                        | Titles inside a component: `CardTitle`, `DialogTitle`, the `FieldLegend` legend                         |
| `text-control`     | `typography.size.control`     | 12px / 16px              | 16px / 24px, 14px / 20px from `md` | The text typed in `Input`, `Textarea` and the `Questionnaire` input, always with `md:text-ui` beside it |

The line height is the one the size pairs with (`typography.size-line-height.*`), and each role can be overridden the usual way: `text-ui/relaxed`, or a `leading-*` class. In nova, `text-control` is 16px on a phone so that iOS does not zoom the page when a field takes focus, and returns to `text-ui` from `md` up.

**What a screen writes.** Text that answers a component's text uses the role of what it sits beside: a panel's title beside a `CardTitle` is `text-title`, its body `text-description`, so the two match in either brand; help text under a field is a `FieldDescription`. `text-xs` and `text-sm` stay valid and stay fixed in every brand: write them only for text that must keep its size, as `Badge` and `Kbd` do, and write `text-sm` for a line of the screen's own that no component draws, such as a result count or a prompt under a form. It is 14px in both brands: the size the roles reach in nova, and where lyra's screens already set such a line.

`cn` in `lib/cn.ts` knows the roles through `extendTailwindMerge`, and every component imports it from `@/lib/cn`. A screen that puts a text role in a `cn` call imports `cn` from `@/lib/cn` too: the stock `cn` of `@/lib/utils` reads `text-ui` as a color and drops the role class next to `text-muted-foreground`. A project's own `twMerge` must declare the roles the same way.

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

### Body Small — a screen's own secondary line

```tsx
<p className="text-sm leading-normal font-normal text-muted-foreground">
  A result count or a footnote.
</p>
```

`size: sm (14px)` · `lineHeight: normal (1.5)` · `weight: normal (400)`

Help text or a description beside a component is not this line: it is a `FieldDescription`, or `text-description`.

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

`size: ui (12px in lyra, 14px in nova)` · `lineHeight: snug (1.375)` · `weight: normal (400)` · `tracking: normal`

`Label` and `FieldLabel` take no `text-*`, `font-*`, `tracking-*` or `leading-*` class: the label is what the component draws, the same in every form. A bigger or bolder label above an input is the one change that breaks the form's rhythm.

### Button label — `Button` draws it

`size: ui (12px in lyra, 14px in nova)` · `weight: medium (500)` · `tracking: normal`. The same goes for `TabsTrigger`, and for `Badge`, which keeps `text-xs` in every brand: write the text, not the style.

### Headings — `Heading` draws them

| `level` | Tag  | Size        | Use             |
| ------- | ---- | ----------- | --------------- |
| `1`     | `h1` | 2xl (24px)  | The page title  |
| `2`     | `h2` | xl (20px)   | A section title |
| `3`     | `h3` | lg (18px)   | A subsection    |
| `4`     | `h4` | base (16px) | A group title   |

Every level is `font-heading` (JetBrains Mono in lyra, DM Sans in nova) at weight semibold (600) with `tracking-tight`, and takes the line height its size sets (`text-2xl` → 1.33, `text-xl` → 1.4, `text-lg` → 1.56, `text-base` → 1.5). The size follows `level`, and `as` changes the tag only.

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

### Caption — an annotation a screen draws away from any component

```tsx
<span className="text-xs leading-normal font-normal tracking-wide text-muted-foreground">
  Caption or footnote
</span>
```

`size: xs (12px)` · `lineHeight: normal (1.5)` · `weight: normal (400)` · `tracking: wide`

Beside a component, the same line is `text-ui`: 12px in lyra, and it follows nova.

### Code — inline code and code blocks

Code inside a sentence is a `<code>` element:

```tsx
<code className="font-mono text-sm leading-relaxed text-foreground">
  const x = 42;
</code>
```

`size: sm (14px)` · `lineHeight: relaxed (1.625)` · `family: mono` · `weight: normal (400)`

A block of code (a file, a command, a tool's output) is a `CodeBlock`: it draws the same size, line height and family in its frame, numbers or wraps the lines, and copies the code with its `CodeBlockCopyButton`. It stays one color, with no syntax highlighting: the design system has no syntax tokens.

```tsx
<CodeBlock>
  <CodeBlockContent>npm install @dsaireadable/eslint-plugin</CodeBlockContent>
</CodeBlock>
```

> Note: code always takes `font-mono`. In lyra the whole page happens to be monospace, so a missing `font-mono` goes unseen until nova sets the page in Lora.

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
- **Four families**: `font-body` (the interface), `font-heading`, `font-mono`
  (code) and `font-sans`, each read from its `typography.font-family.*` token.
  `font-serif` does not exist, even in nova: Lora is `font-body`. next/font sets
  one `--font-<face>` variable per face on `<html>`.
- **Four roles**: `text-ui`, `text-description`, `text-title` and `text-control`
  are declared with the sizes, each with its `--text-<role>--line-height`.
- **`leading-none` stays**: it is a static Tailwind class (`line-height: 1`), not
  a theme value. A numeric `leading-6` reads the spacing scale.

---

## Usage Rules

1. **`font-body` is the default typeface, and the brand chooses it** — never override `font-family` on standard UI components without design approval.
2. **A heading is a `Heading`, a field label a `FieldLabel`** — each draws its own size, weight, tracking and line height, so pass it no `text-*`, `font-*`, `tracking-*` or `leading-*` class. For text a screen draws itself, a `text-*` class already carries its paired line height: add `leading-*` only to change it.
3. **`tracking-tight` belongs to headings** — `Heading` draws it at every level; on running text, negative spacing hurts readability.
4. **`tracking-wider` is for all-caps only** — never use it on regular lowercase text. `tracking-widest` is for keyboard shortcuts only.
5. **A strict weight hierarchy** — `normal` → body text, labels and descriptions, `medium` → buttons, tabs, badges and component titles, `semibold` → headings, `bold` → strong emphasis a screen draws. A field label stays `normal`.
6. **Next to components, text uses a role** — `text-ui`, `text-description` or `text-title`, the role of what it sits beside, so that it matches them in either brand. `text-xs` and `text-sm` are fixed sizes: use them only for text that must not follow the brand, and `text-sm` for a screen's own line that no component draws (a result count).
7. **`font-mono` means code** — write it on code and tabular values only, and write it even where the page already looks monospace.
8. **A text role in a `cn` call needs the `cn` of `@/lib/cn`** — the stock `cn` of `@/lib/utils` drops the role.
