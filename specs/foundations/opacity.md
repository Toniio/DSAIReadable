# Opacity Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The opacity system has **one active semantic token**: `opacity.disabled`, for disabled elements. Opacity is for **binary states** only — disabled, shown or hidden. A placeholder is colored and a modal backdrop is a tint; neither uses an opacity. Outside those cases, **opacity must not be used** as a substitute for the dedicated color tokens.

---

## Semantic Tokens

| Token                 | CSS Variable            | Value | Tailwind Class                                                 | Status                                         |
| --------------------- | ----------------------- | ----- | -------------------------------------------------------------- | ---------------------------------------------- |
| `opacity.disabled`    | `--opacity-disabled`    | `0.5` | `disabled:opacity-disabled` (and every disabled-state variant) | active — disabled interactive elements         |
| `opacity.placeholder` | `--opacity-placeholder` | `0.5` | —                                                              | deprecated — use `color.text.subtle`           |
| `opacity.overlay`     | `--opacity-overlay`     | `0.8` | —                                                              | deprecated — use the scrim of `lib/overlay.ts` |

The two deprecated tokens stay resolvable in `tokens.css` but nothing reads them, and `tokens:lint-lifecycle` fails if something starts to.

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

## Placeholder text — a color, not an opacity

Input, Textarea, Select and NativeSelect color their placeholder with the subtle text token:

```tsx
// ✅ What the fields do: color.text.subtle, 5.10:1 on white
<input className="placeholder:text-muted-foreground" placeholder="Search accounts…" />

// ❌ Faded default text: 3.70:1 on white, below 4.5:1 — and ESLint rejects the class
<input className="placeholder:text-foreground placeholder:opacity-50" placeholder="Search accounts…" />
```

`opacity.placeholder` is deprecated for that reason.

---

## Modal backdrops — a tint, not an opacity

Dialog, AlertDialog, Sheet and Drawer build their backdrop on `OVERLAY_BASE` in `lib/overlay.ts`: a 10% static-black tint with a backdrop blur, shadcn/ui v4's scrim.

```tsx
import { OVERLAY_BASE } from "@/lib/overlay"

// ✅ What the modal surfaces do
<div className={cn(OVERLAY_BASE, className)} />
// OVERLAY_BASE = "fixed inset-0 z-modal bg-black/10 supports-backdrop-filter:backdrop-blur-xs …"

// ❌ A backdrop darkened with an opacity: the page behind disappears,
// and ESLint rejects opacity-80
<div className="fixed inset-0 z-modal bg-black opacity-80" />
```

The `/10` is an alpha on the color (`color.static.black`), not an opacity on the node: the dialog above it is not affected. `opacity.overlay`, at `0.8`, was never read by a component and is deprecated.

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

**Rule:** when the intent is to reduce the **visual prominence** of a text or an icon, use the `subtle` / `muted-foreground` color tokens. Opacity is reserved for **binary states** (disabled, shown / hidden).

> **Guard:** a second `better-tailwindcss/no-restricted-classes` rule rejects every `opacity-<n>` except the binary ones: `opacity-0` and `opacity-100` (show / hide) and `opacity-disabled`. It found four decorative uses, now colors: Command's search icon and Combobox's chip remove button (`text-muted-foreground`), Illustration's strokes and Calendar's secondary day line (`text-muted-foreground/20`, `text-current/70` — an alpha on the color, which leaves the rest of the node untouched).

---

## Decision summary

```
Need                                   → Solution
──────────────────────────────────────────────────────────────────
Disable a button / input               → disabled:opacity-disabled
Show / hide (with a transition)        → opacity-0 / opacity-100
A field's placeholder                  → placeholder:text-muted-foreground
A modal / dialog backdrop              → OVERLAY_BASE (bg-black/10 + backdrop-blur-xs)
Secondary / muted text                 → text-muted-foreground
Secondary icon                         → text-muted-foreground
Muted background                       → bg-card / bg-secondary
Desaturate an image                    → CSS filter (outside the tokens)
```

---

## Usage Rules

1. **One token, one case** — `opacity.disabled` is the only active opacity token; `opacity-0` and `opacity-100` show and hide.
2. **A disabled state is written `opacity-disabled`** under its variant (`disabled:opacity-disabled`) — never `opacity-50`, which ESLint rejects: the value is the token's, not a step of Tailwind's scale.
3. **Never use opacity to fake a subtle color** — always use `color.text.subtle` / `text-muted-foreground`, placeholders included.
4. **Opacity is not selective** — it applies to the whole DOM subtree. When only part of it should change, use a color, or an alpha on a color (`bg-black/10`, `text-current/70`).
5. **A modal backdrop comes from `OVERLAY_BASE`** — do not write a backdrop of your own, and do not darken it: the page behind stays visible under the blur.
