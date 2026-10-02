# Elevation Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Elevation expresses the **relative height** of a surface in the visual hierarchy. The higher the level, the stronger the shadow. In dark mode, the opacities are much higher to make up for the darker background.

---

## The 7 elevation levels

| Token             | CSS Variable        | Tailwind Class | Meaning / Surface                                       |
| ----------------- | ------------------- | -------------- | ------------------------------------------------------- |
| `elevation.xs`    | `--elevation-xs`    | `shadow-xs`    | Micro-lift — hover on an interactive element            |
| `elevation.sm`    | `--elevation-sm`    | `shadow-sm`    | Light lift — a card at rest, a stronger hover           |
| `elevation.md`    | `--elevation-md`    | `shadow-md`    | Standard elevation — drop-downs, context menus          |
| `elevation.lg`    | `--elevation-lg`    | `shadow-lg`    | Marked elevation — modals, side panels                  |
| `elevation.xl`    | `--elevation-xl`    | `shadow-xl`    | High elevation — full-screen panel, drawer              |
| `elevation.2xl`   | `--elevation-2xl`   | `shadow-2xl`   | Maximum elevation — toasts, high-priority notifications |
| `elevation.inner` | `--elevation-inner` | `shadow-inner` | Inner shadow — sunken inputs, pressed state             |

---

## CSS values

### Light Mode (low opacities, 4–12%)

| Token             | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| `elevation.xs`    | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    |
| `elevation.sm`    | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     |
| `elevation.md`    | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     |
| `elevation.lg`    | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   |
| `elevation.xl`    | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` |
| `elevation.2xl`   | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  |
| `elevation.inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              |

### Dark Mode (high opacities, 20–50%)

| Token             | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| `elevation.xs`    | `0 1px 2px rgba(0, 0, 0, 0.2)`                                    |
| `elevation.sm`    | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`      |
| `elevation.md`    | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`    |
| `elevation.lg`    | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`    |
| `elevation.xl`    | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)` |
| `elevation.2xl`   | `0 25px 50px rgba(0, 0, 0, 0.5)`                                  |
| `elevation.inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                              |

> **Why higher opacities in dark mode?** Dark backgrounds swallow light shadows. An opacity of 0.08 is nearly invisible in dark mode — it takes 0.25–0.50 to get the same perceived result as in light mode.

---

## Semantic hierarchy

```
Level        Surface type                      Approximate z-index
─────────────────────────────────────────────────────────────────────
2xl   ████   Toasts, urgent notifications       z-toast (1600)
xl    ███    Drawers, full-screen panels        z-modal (1400)
lg    ███    Modals, dialogs                    z-modal (1400)
md    ██     Drop-downs, context menus          z-dropdown (1000)
sm    █      Cards at rest, element hover       —
xs    ░      Micro-interactions, subtle hover   —
inner ▼      Sunken inputs, pressed state       —
```

### Local stacking inside a component

The `z-dropdown` … `z-tooltip` layers (1000 to 1700) place a surface above the
page. A few components also order **their own parts** — a stretched click
target under its buttons, a badge over the block it overlaps. That order is
internal to the component: it takes a small raw z-index, far below the global
layers, and needs no token.

| Component        | Class          | What it orders                                                                   |
| ---------------- | -------------- | -------------------------------------------------------------------------------- |
| `Attachment`     | `z-10`, `z-20` | `AttachmentTrigger` over the media and the content, `AttachmentActions` above it |
| `Bubble`         | `z-10`         | `BubbleReactions` over the bubble it overlaps                                    |
| `Questionnaire`  | `z-10`         | The transparent native input of a choice over its indicator and label            |
| `NavigationMenu` | `z-1`          | `NavigationMenuIndicator` above the menu bar border                              |
| `Calendar`       | `z-0`          | The ends of a range, isolated so their highlight paints under the day cells      |

These values are reserved to the component files that use them: each one is
declared `allow-raw: local-stacking` in `tokens/allow-raw.registry.json`, with
its reason, and `npm run tokens:lint-values` rejects any other. Code built
with the design system never writes a z-index of its own: it composes the
components, and places a surface above the page with a global layer.

---

## Examples

```tsx
// Card at rest
<div className="shadow-sm bg-card p-4">...</div>

// Card on hover — raised elevation
<div className="shadow-sm hover:shadow-md transition-shadow duration-normal bg-card p-4">
  ...
</div>

// Drop-down menu level — DropdownMenuContent and PopoverContent already draw it
<div className="shadow-md bg-popover p-2">...</div>

// Modal level — Sheet already draws it
<div className="shadow-lg bg-card p-6">...</div>

// Toast level
<div className="shadow-2xl bg-card p-4">...</div>

// Input with an inner shadow (focus or inset state)
<Input className="shadow-inner" />
```

---

## A note on `shadow-inner`

`shadow-inner` is an **inner shadow** (inset). Use it to:

- Show a **pressed state** on a button or a control
- Make an active form field look **sunken**
- Suggest a **recessed background** on a selected area

```tsx
// Pressed button
<Button variant="outline" className="active:shadow-inner">Click</Button>

// Sunken input (focus)
<Input className="focus:shadow-inner focus:border-ring" />
```

> **Important:** never combine `shadow-inner` with an outer shadow. The two clash visually.

---

## Usage Rules

1. **Follow the hierarchy** — elevation must reflect the surface's real position on the Z axis. A popover never has less elevation than an inline card.
2. **Always test in dark mode** — light-mode shadows vanish in dark mode unless adjusted. The tokens handle this automatically.
3. **Elevation transitions** — use `transition-shadow` with `duration-normal` (200ms) on state changes (hover, focus).
4. **`shadow-inner` stands alone** — never pair it with an outer shadow on the same element.
5. **No decorative shadows** — elevation expresses structure, not style. Do not add `shadow-lg` to a card just to make it look nice.
