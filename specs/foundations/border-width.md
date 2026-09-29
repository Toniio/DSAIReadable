# Border Width Foundation

> Source: `tokens/semantic.json` (`border-width.*`) · CSS variables: `tokens.css` Layer 2

Two border widths, and no more: a design-system border is a one-pixel hairline,
except in one named case. The `@theme` bridge in `styles/globals.css` wires the
tokens into Tailwind — a bare `border` reads `--border-width-default`.

---

## Token Reference

| Token                          | CSS variable                     | Value | Tailwind class                                | Use                                             |
| ------------------------------ | -------------------------------- | ----- | --------------------------------------------- | ----------------------------------------------- |
| `border-width.default`         | `--border-width-default`         | 1px   | `border`, `border-t`, `border-x`, `divide-y`… | Every border: inputs, cards, separators, tables |
| `border-width.chart-indicator` | `--border-width-chart-indicator` | 1.5px | `border-chart-indicator`                      | Dashed stroke of the series indicator (Chart)   |

The focus ring is not a border: its width is `space.focus-ring-width`, applied
by the `lib/focus` presets (see [focus.md](./focus.md)).

---

## Usage Rules

- ✅ Write `border` (or `border-t`, `border-b`…): the width comes from the `border-width.default` token
- ✅ Remove a border with `border-0` / `border-t-0` — a reset to zero is not a value
- ✅ Add a `border-width.*` token named after its role when a component genuinely needs another width
- ❌ Never hard-code a width: `border-2`, `border-[1.5px]`, `border-(length:3px)` — `npm run tokens:lint-values` rejects them
- ❌ Do not use `border-none` to remove a border: it sets the border **style**, not its width
