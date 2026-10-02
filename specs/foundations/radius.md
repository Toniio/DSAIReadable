# Radius Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The design system is **square**. Its components are shadcn's **radix-lyra** style, which draws every surface with `rounded-none`: buttons, inputs, cards, dialogs, popovers, menus, tooltips and toasts all have square corners. Only a few shapes are round: the avatar, the radio button and the switch.

The radius scale below is a **base** value of `0.625rem` (10px) and its multiples. Almost no component reads it: it is there for content a screen draws itself (an image, a hero) and for the few small shapes listed in "By component".

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

shadcn's `--radius` alias is `radius.lg` (the base). No component reads it.

---

## Token Reference

| Token         | CSS Variable    | Computation  | Value           | Tailwind Class | Use                                                                                                                              |
| ------------- | --------------- | ------------ | --------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `radius.none` | `--radius-none` | `0rem`       | 0 px            | `rounded-none` | Every component. `rounded-none` is a static class that reads no token; only the Sonner toast reads `var(--radius-none)`          |
| `radius.xs`   | `--radius-xs`   | `base × 0.4` | 0.25rem / 4px   | `rounded-xs`   | The legend and tooltip indicators of a chart                                                                                     |
| `radius.sm`   | `--radius-sm`   | `base × 0.6` | 0.375rem / 6px  | `rounded-sm`   | Content a screen draws itself (an image); no component uses it                                                                   |
| `radius.md`   | `--radius-md`   | `base × 0.8` | 0.5rem / 8px    | `rounded-md`   | Content a screen draws itself (an image); no component uses it                                                                   |
| `radius.lg`   | `--radius-lg`   | `base × 1.0` | 0.625rem / 10px | `rounded-lg`   | Content a screen draws itself (an image, an illustration); the `--radius` alias                                                  |
| `radius.xl`   | `--radius-xl`   | `base × 1.4` | 0.875rem / 14px | `rounded-xl`   | Content a screen draws itself (an image, a hero); no component uses it                                                           |
| `radius.2xl`  | `--radius-2xl`  | `base × 1.8` | 1.125rem / 18px | `rounded-2xl`  | Content a screen draws itself (a hero); no component uses it                                                                     |
| `radius.3xl`  | `--radius-3xl`  | `base × 2.2` | 1.375rem / 22px | `rounded-3xl`  | Content a screen draws itself — occasional use; no component uses it                                                             |
| `radius.4xl`  | `--radius-4xl`  | `base × 2.6` | 1.625rem / 26px | `rounded-4xl`  | Content a screen draws itself — rare; no component uses it                                                                       |
| `radius.full` | `--radius-full` | `9999px`     | Pill            | `rounded-full` | A round shape: `Avatar`, `RadioGroup`, `Switch`. `rounded-full` is a static class that compiles to its own value, not this token |

---

## By component

What the components draw, read in the browser:

| Component                                                                                                                                            | Radius            | Class                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------- |
| `Button`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Badge`, `Card`, `Alert`, `Tabs`, `Toggle`, `Kbd`, `Progress`, `Slider`, `Skeleton` | square            | `rounded-none`                        |
| `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `HoverCard`, `DropdownMenu`, `ContextMenu`, `Menubar`, `Command`, `Tooltip`                            | square            | `rounded-none`                        |
| `Sheet`, `Table`, `Separator`, `Breadcrumb`, `Pagination`                                                                                            | square            | none: nothing to round                |
| `Sonner` toast                                                                                                                                       | square            | `--border-radius: var(--radius-none)` |
| `Avatar` (image, fallback, badge), `Message` avatar, `RadioGroup` item, `Switch` (track and thumb), the `Questionnaire` choice dot                   | round             | `rounded-full`                        |
| `Chart` legend and tooltip indicators                                                                                                                | 4px (`radius.xs`) | `rounded-xs`                          |

Square is the default of the whole system, so a new component is square too.

---

## ⚠️ A note on the shadcn radix-lyra style

shadcn/ui ships several styles. The older **new-york** style rounds its buttons, inputs and cards (`rounded-md`, `rounded-xl`); **radix-lyra**, the one this design system is anchored on, does not. The code an agent has seen for shadcn/ui is mostly new-york: the classes it remembers (`rounded-md` on a button, `rounded-lg` on a card) put a rounded surface among square ones.

**Decision rule:**

```
If the surface is a design-system component
  → Use it as it is: it draws its own corners, add no rounded-* class
If the surface is one a screen draws itself (a panel, a tile, a table cell)
  → Leave it square: no radius class, or rounded-none
If the shape is round (an avatar-like image, a dot)
  → Use rounded-full
If it is content, not interface (an image, a hero, an illustration)
  → Use radius.lg to radius.4xl, depending on its size
```

```tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>INV-001</TableCell>
              <TableCell>
                <Badge>Paid</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

```tsx
// ❌ A rounded surface among square components: the mixed look rule 2 warns against
<div className="rounded-lg bg-card p-4">...</div>

// ✅ The same surface, square like the Card next to it
<div className="bg-card p-4">...</div>

// ❌ A radius class on a component: Button draws its own corners
<Button className="rounded-md">Save</Button>

// ✅ A round shape
<Skeleton className="size-10 rounded-full" />
```

---

## Usage Rules

1. **Always use the tokens** — no arbitrary values such as `rounded-[7px]`. When no token fits, escalate to the design team.
2. **Consistency across the interface** — every system surface is square, so a surface a screen draws next to them stays square. A rounded one among them is the mixed look the system does not have.
3. **A component draws its own corners** — add no `rounded-*` class to a `Button`, `Input`, `Card`, `Dialog` or any other component.
4. **`rounded-full` only for a round shape** — an avatar, a dot. Do not use it on a button, a badge or a card.
5. **The `radius.sm` to `radius.4xl` scale is for content** — an image, an illustration, a hero. `rounded-none` and `rounded-full` are static Tailwind classes that read no radius token, which is why `radius.full` is `reserved`.
