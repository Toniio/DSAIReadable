# Opacity Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The opacity system defines **three semantic tokens** for the main use cases: disabled elements, placeholders and overlay backdrops. Outside those three cases, **opacity must not be used** as a substitute for the dedicated color tokens.

---

## Semantic Tokens

| Token                 | CSS Variable            | Value | Tailwind Class                                                 | Usage                           |
| --------------------- | ----------------------- | ----- | -------------------------------------------------------------- | ------------------------------- |
| `opacity.disabled`    | `--opacity-disabled`    | `0.5` | `disabled:opacity-disabled` (and every disabled-state variant) | Disabled interactive elements   |
| `opacity.placeholder` | `--opacity-placeholder` | `0.5` | `placeholder:opacity-50`                                       | Placeholder text in form fields |
| `opacity.overlay`     | `--opacity-overlay`     | `0.8` | `opacity-80`                                                   | Backdrop of modals and dialogs  |

---

## `opacity.disabled` — disabled elements

### When to use it

Apply it to every interactive element in the `disabled` state: buttons, inputs, selects, checkboxes…

### The `opacity-disabled` class

The `@theme` bridge in `styles/globals.css` turns the token into a Tailwind class: `opacity-disabled` reads `--opacity-disabled`. It goes under the disabled-state variant, whatever form that variant takes:

```tsx
// ✅ The token, under the state's variant
<button disabled className="disabled:opacity-disabled disabled:cursor-not-allowed">
  Disabled button
</button>
// Same rule for data-disabled:, aria-disabled:, has-disabled:, peer-disabled:,
// group-data-[disabled=true]/…:

// ❌ Same rendering, but the token is gone: ESLint rejects it
<button disabled className="disabled:opacity-50">
  Disabled button
</button>

// ❌ Hard-coded value
<button disabled style={{ opacity: 0.5 }}>
  Disabled button
</button>
```

> **Guard:** the `better-tailwindcss/no-restricted-classes` rule rejects `opacity-<n>` under any variant that contains `disabled`, and `eslint --fix` replaces it with `opacity-disabled`. It cannot see a bare class whose state lives elsewhere — the `disabled` key of `Calendar`'s `classNames`, for example: write it there by hand.

---

## `opacity.placeholder` — placeholder text

Applied to the `::placeholder` pseudo-element of form fields:

```tsx
// ✅ Through Tailwind
<input
  className="placeholder:opacity-50 placeholder:text-foreground"
  placeholder="Enter a value..."
/>

// ✅ Through CSS
input::placeholder {
  opacity: var(--opacity-placeholder);
}
```

---

## `opacity.overlay` — modal backdrops

Applied to the semi-transparent backdrop behind modals, drawers and dialogs:

```tsx
// ✅ Modal backdrop
<div
  className="fixed inset-0 bg-background-inverse opacity-80 z-overlay"
  aria-hidden="true"
/>

// Or with a Tailwind class directly
<div className="fixed inset-0 bg-black/80 z-overlay" aria-hidden="true" />
```

> A value of `0.8` darkens enough for the modal's content to stay readable, without hiding the visual context underneath entirely.

---

## ⚠️ When NOT to use opacity

Global opacity changes **the whole** component (text, background, border, icon). It is **not selective**, and it can have side effects.

### Cases to steer clear of — use the color tokens instead

| ❌ Don't                                              | ✅ Do instead                                          |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `<p class="opacity-50">Secondary text</p>`            | `<p class="text-muted-foreground">Secondary text</p>`  |
| `<p class="text-foreground opacity-50">Caption</p>`   | `<p class="text-muted-foreground text-xs">Caption</p>` |
| `<div class="bg-primary opacity-70">Muted area</div>` | `<div class="bg-secondary">Muted area</div>`           |
| `<Icon class="opacity-50" />`                         | `<Icon class="text-muted-foreground" />`               |

**Rule:** when the intent is to reduce the **visual prominence** of a text or an icon, use the `subtle` / `muted-foreground` color tokens. Opacity is reserved for **binary states** (disabled, overlay).

> **Guard:** a second `better-tailwindcss/no-restricted-classes` rule rejects every `opacity-<n>` except the binary ones: `opacity-0` and `opacity-100` (show / hide), `opacity-disabled`, `placeholder:opacity-50` and `opacity-80` (backdrop). It found four decorative uses, now colors: Command's search icon and Combobox's chip remove button (`text-muted-foreground`), Illustration's strokes and Calendar's secondary day line (`text-muted-foreground/20`, `text-current/70` — an alpha on the color, which leaves the rest of the node untouched).

---

## Decision summary

```
Need                                   → Solution
──────────────────────────────────────────────────────────────────
Disable a button / input               → disabled:opacity-disabled
A field's placeholder                  → placeholder:opacity-50
A modal / dialog backdrop              → opacity-80 (bg-black/80)
Secondary / muted text                 → text-muted-foreground
Secondary icon                         → text-muted-foreground
Muted background                       → bg-card / bg-secondary
Desaturate an image                    → CSS filter (outside the tokens)
```

---

## Usage Rules

1. **Three cases, three tokens** — `disabled`, `placeholder` and `overlay` are the only legitimate contexts for global opacity.
2. **A disabled state is written `opacity-disabled`** under its variant (`disabled:opacity-disabled`) — never `opacity-50`, which ESLint rejects: the value is the token's, not a step of Tailwind's scale.
3. **Never use opacity to fake a subtle color** — always use `color.text.subtle` / `text-muted-foreground`.
4. **Opacity is not selective** — it applies to the whole DOM subtree. When only part of it should change, use targeted color tokens.
5. **`opacity.overlay` at `0.8` is the reference value** — do not lower it for standard modals: it hurts the readability of the main content.
