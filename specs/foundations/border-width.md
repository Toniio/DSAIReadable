# Border Width Foundation

> Source: `tokens/semantic.json` (`border-width.*`) · CSS variables: `tokens.css` Layer 2

Three widths, each named after its role: a design-system border is a one-pixel
hairline, except in two named cases. The `@theme` bridge in `styles/globals.css`
wires the tokens into Tailwind — a bare `border` reads `--border-width-default`.

---

## Token Reference

| Token                          | CSS variable                     | Value | Tailwind class                                | Use                                                                      |
| ------------------------------ | -------------------------------- | ----- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `border-width.default`         | `--border-width-default`         | 1px   | `border`, `border-t`, `border-x`, `divide-y`… | Every border: inputs, cards, separators, tables                          |
| `border-width.chart-indicator` | `--border-width-chart-indicator` | 1.5px | `border-chart-indicator`                      | Dashed stroke of the series indicator (Chart)                            |
| `border-width.separation`      | `--border-width-separation`      | 2px   | `SEPARATION_RING` (`lib/surface`)             | Background-colored ring around overlapping avatars and an avatar's badge |

The focus ring is not a border: its width is `space.focus-ring-width`, applied
by the `lib/focus` presets (see [focus.md](./focus.md)).

---

## Surface Outline

Cards, popovers, menus, selects, comboboxes, hover cards, dialogs and the
floating Sidebar are outlined with a `box-shadow` ring, not a `border`: a ring
takes no layout space, so the content box, the padding and the overflow
clipping stay the same with or without the outline. Its width is still
`border-width.default`, applied by `SURFACE_OUTLINE` from `lib/surface.ts`
(`ring-(length:--border-width-default)`); the component keeps its ring color
(`ring-foreground/10`, `ring-sidebar-border`). Change `border-width.default`
and fields, separators and surfaces all follow.

Tailwind compiles `ring-1`, `ring-2` and a bare `ring` to fixed pixel widths
that no token controls: `npm run tokens:lint-values` rejects them everywhere,
and an `allow-raw` comment does not excuse them.

---

## Usage Rules

- ✅ Write `border` (or `border-t`, `border-b`…): the width comes from the `border-width.default` token
- ✅ Remove a border with `border-0` / `border-t-0` — a reset to zero is not a value
- ✅ Add a `border-width.*` token named after its role when a component genuinely needs another width
- ✅ Outline a surface with `SURFACE_OUTLINE`, and write `ring-(length:--border-width-default)` under a variant (`group-data-[variant=floating]:`)
- ❌ Never hard-code a width: `border-2`, `border-[1.5px]`, `border-(length:3px)`, `ring-1`, `ring` — `npm run tokens:lint-values` rejects them
- ❌ Do not use `border-none` to remove a border: it sets the border **style**, not its width
