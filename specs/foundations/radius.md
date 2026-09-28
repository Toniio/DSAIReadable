# Radius Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The radius system is built on a **base** value of `0.625rem` (10px). Every other value is a multiple, computed through `calc(var(--ds-prim-radius-base) * N)`.

---

## Base System

```
base = 0.625rem (10px)

xs   = base × 0.4  = 0.25rem   (4px)
sm   = base × 0.6  = 0.375rem  (6px)
md   = base × 0.8  = 0.5rem    (8px)
lg   = base × 1.0  = 0.625rem  (10px)  ← reference value
xl   = base × 1.4  = 0.875rem  (14px)
2xl  = base × 1.8  = 1.125rem  (18px)
3xl  = base × 2.2  = 1.375rem  (22px)
4xl  = base × 2.6  = 1.625rem  (26px)
full = 9999px                  ← full pill
```

shadcn's `--radius` value is mapped to `--radius-lg` (the base).

---

## Token Reference

| Token         | CSS Variable    | Computation  | Value           | Tailwind Class | Use                                        |
| ------------- | --------------- | ------------ | --------------- | -------------- | ------------------------------------------ |
| `radius.none` | `--radius-none` | `0rem`       | 0 px            | `rounded-none` | Full-bleed, table cells, dividers          |
| `radius.xs`   | `--radius-xs`   | `base × 0.4` | 0.25rem / 4px   | `rounded-xs`   | Minimal tags, very tight chips             |
| `radius.sm`   | `--radius-sm`   | `base × 0.6` | 0.375rem / 6px  | `rounded-sm`   | Inputs, small buttons, selects             |
| `radius.md`   | `--radius-md`   | `base × 0.8` | 0.5rem / 8px    | `rounded-md`   | Default buttons, form controls             |
| `radius.lg`   | `--radius-lg`   | `base × 1.0` | 0.625rem / 10px | `rounded-lg`   | **Cards, panels** — shadcn's default value |
| `radius.xl`   | `--radius-xl`   | `base × 1.4` | 0.875rem / 14px | `rounded-xl`   | Modals, drawers, prominent containers      |
| `radius.2xl`  | `--radius-2xl`  | `base × 1.8` | 1.125rem / 18px | `rounded-2xl`  | Floating panels, bottom sheets             |
| `radius.3xl`  | `--radius-3xl`  | `base × 2.2` | 1.375rem / 22px | `rounded-3xl`  | Decorative containers — occasional use     |
| `radius.4xl`  | `--radius-4xl`  | `base × 2.6` | 1.625rem / 26px | `rounded-4xl`  | Hero cards, large chips — rare             |
| `radius.full` | `--radius-full` | `9999px`     | Pill            | `rounded-full` | Avatars, toggles, pill badges              |

---

## By component

| Component                  | Suggested token              | Why                                     |
| -------------------------- | ---------------------------- | --------------------------------------- |
| `<Button>` default         | `radius.md`                  | Standard button, consistent with shadcn |
| `<Button>` small           | `radius.sm`                  | Smaller size, proportional radius       |
| `<Input>` / `<Select>`     | `radius.sm`                  | Consistent with the form controls       |
| `<Card>`                   | `radius.lg`                  | Standard secondary surface              |
| `<Badge>`                  | `radius.xs` or `radius.full` | Depending on the style: square or pill  |
| `<Avatar>`                 | `radius.full`                | Always round                            |
| `<Dialog>` / `<Modal>`     | `radius.xl`                  | Prominent floating surface              |
| `<Popover>` / `<Dropdown>` | `radius.lg`                  | Consistent with the card element        |
| `<Tooltip>`                | `radius.sm`                  | Small, discreet surface                 |
| `<Toast>`                  | `radius.lg`                  | Floating notification surface           |
| `<Toggle>` / `<Switch>`    | `radius.full`                | Pill shape by convention                |
| `<Table>` cell             | `radius.none`                | No rounding in data grids               |

---

## ⚠️ A note on the shadcn radix-lyra style

shadcn's **radix-lyra** style uses `rounded-none` on **most components** by default. The `--radius` CSS variable is set to `var(--radius-lg)`, but it is not necessarily applied everywhere.

**Decision rule:**

```
If the component belongs to the system UI (button, input, card)
  → Use radius.md or radius.lg, depending on its size
If the component has an explicitly "flat" style (a table, a full-width navigation bar)
  → Use radius.none
If the component is decorative or expressive (a hero, an illustration card)
  → Use radius.2xl to radius.4xl, depending on its size
```

```tsx
// ✅ Standard card
<div className="rounded-lg bg-card p-4">...</div>

// ✅ Default button
<button className="rounded-md px-4 py-2">...</button>

// ✅ Pill badge
<span className="rounded-full px-2 py-0.5 text-xs">Active</span>

// ✅ Table cell — no radius
<td className="rounded-none px-4 py-2">...</td>

// ✅ Modal
<div className="rounded-xl shadow-lg p-6">...</div>
```

---

## Usage Rules

1. **Always use the tokens** — no arbitrary values such as `rounded-[7px]`. When no token fits, escalate to the design team.
2. **Consistency within a component** — every corner of a component uses the same token, unless there is a stated reason (an element that attaches to an edge of the screen, for example).
3. **`radius.lg` is shadcn's default** — it is the starting point for any card-like component.
4. **`radius.full` only for pill shapes** — avatars, toggles, rounded badges. Do not use it on standard buttons.
5. **`radius.none` is a deliberate choice** — use it only for full-bleed components or data-grid elements, not as a default.
