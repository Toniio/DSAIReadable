# Radius Foundation

> Source: `tokens/semantic.json`, `tokens/semantic.nova.json` · CSS variables: `tokens.css` Layer 2

A component does not choose its corners: it names a **role**, and the brand gives the role its radius. **Lyra**, the default brand, sets every role to 0, so its buttons, inputs, cards, dialogs, menus and toasts are square. **Nova**, turned on by the `nova` class on `<html>`, sets them from a 14px surface down to a 4px checkbox and a pill. The class a component writes is the same in both.

The radius scale below is a **base** value of `0.625rem` (10px) and its multiples. Nova's roles read it. No lyra component does, apart from the two indicators listed in "By component": it is there for content a screen draws itself (an image, a hero).

---

## Roles

| Token            | CSS Variable       | Tailwind Class    | Lyra | Nova                  | What it draws                                                        |
| ---------------- | ------------------ | ----------------- | ---- | --------------------- | -------------------------------------------------------------------- |
| `radius.surface` | `--radius-surface` | `rounded-surface` | 0    | `radius.xl`, 14px     | What holds content: a card, a dialog, a drawer's edge, a bubble      |
| `radius.control` | `--radius-control` | `rounded-control` | 0    | `radius.lg`, 10px     | What is pressed or typed in: a button, an input, a popover, a menu   |
| `radius.item`    | `--radius-item`    | `rounded-item`    | 0    | `radius.md`, 8px      | What sits inside a control: a menu or sidebar item, a tab, a tooltip |
| `radius.inset`   | `--radius-inset`   | `rounded-inset`   | 0    | `radius.sm`, 6px      | What sits inside an item or a field: a `Kbd`, a chip, a command item |
| `radius.mark`    | `--radius-mark`    | `rounded-mark`    | 0    | `radius.xs`, 4px      | The smallest marks: a checkbox, a tooltip's arrow                    |
| `radius.pill`    | `--radius-pill`    | `rounded-pill`    | 0    | `radius.full`, a pill | What is a pill in nova: a badge, a progress bar, a slider, a handle  |

Each role has its directional forms, as any Tailwind radius does: `rounded-t-surface`, `rounded-l-control`.

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

The steps of the scale are fixed: `rounded-lg` is 10px in both brands. Only the roles above move with the brand.

| Token         | CSS Variable    | Computation  | Value           | Tailwind Class | Use                                                                                                                                 |
| ------------- | --------------- | ------------ | --------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `radius.none` | `--radius-none` | `0rem`       | 0 px            | `rounded-none` | No component reads it. `rounded-none` is a static class that reads no token, and it draws the edges that stay square in both brands |
| `radius.xs`   | `--radius-xs`   | `base × 0.4` | 0.25rem / 4px   | `rounded-xs`   | The legend and tooltip indicators of a chart                                                                                        |
| `radius.sm`   | `--radius-sm`   | `base × 0.6` | 0.375rem / 6px  | `rounded-sm`   | Content a screen draws itself (an image); no component names it                                                                     |
| `radius.md`   | `--radius-md`   | `base × 0.8` | 0.5rem / 8px    | `rounded-md`   | Content a screen draws itself (an image); no component names it                                                                     |
| `radius.lg`   | `--radius-lg`   | `base × 1.0` | 0.625rem / 10px | `rounded-lg`   | Content a screen draws itself (an image, an illustration); the `--radius` alias                                                     |
| `radius.xl`   | `--radius-xl`   | `base × 1.4` | 0.875rem / 14px | `rounded-xl`   | Content a screen draws itself (an image, a hero); no component names it                                                             |
| `radius.2xl`  | `--radius-2xl`  | `base × 1.8` | 1.125rem / 18px | `rounded-2xl`  | Content a screen draws itself (a hero); no component uses it                                                                        |
| `radius.3xl`  | `--radius-3xl`  | `base × 2.2` | 1.375rem / 22px | `rounded-3xl`  | Content a screen draws itself — occasional use; no component uses it                                                                |
| `radius.4xl`  | `--radius-4xl`  | `base × 2.6` | 1.625rem / 26px | `rounded-4xl`  | Content a screen draws itself — rare; no component uses it                                                                          |
| `radius.full` | `--radius-full` | `9999px`     | Pill            | `rounded-full` | A round shape: `Avatar`, `RadioGroup`, `Switch`. `rounded-full` is a static class that compiles to its own value, not this token    |

---

## By component

| Component                                                                                                                                                                                                                                                                                  | Lyra   | Nova   | Class                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ | ---------------------------------------- |
| `Card`, `Dialog`, `AlertDialog`, the edges of a `Drawer`, the content of a `Bubble`, `Empty`, `SidebarInset`, `Command`                                                                                                                                                                    | square | 14px   | `rounded-surface`                        |
| `Button` and the `Pagination` links it draws, `Input`, `Textarea`, `Select`, `Combobox`, `NativeSelect`, `InputGroup`, `InputOTP`, `Toggle`, `Popover`, `HoverCard`, the panels of `DropdownMenu`, `ContextMenu` and `Menubar`, `NavigationMenu`, `TabsList`, `Alert`, `Accordion`, `Item` | square | 10px   | `rounded-control`                        |
| `Sonner` toast                                                                                                                                                                                                                                                                             | square | 10px   | `--border-radius: var(--radius-control)` |
| The `xs`, `sm`, `icon-xs` and `icon-sm` sizes of `Button`, the items of a menu, a `Select`, a `Combobox` or a `Sidebar`, `TabsTrigger`, a `Calendar` day, `Tooltip`, `Skeleton`                                                                                                            | square | 8px    | `rounded-item`                           |
| `Kbd`, a `Combobox` chip, a `Command` item, a `MenubarTrigger`, the `xs` buttons and the `Kbd` of an `InputGroup`                                                                                                                                                                          | square | 6px    | `rounded-inset`                          |
| `Checkbox`, the `Questionnaire` indicator, the `Tooltip` arrow                                                                                                                                                                                                                             | square | 4px    | `rounded-mark`                           |
| `Badge`, the reactions of a `Bubble`, the `Carousel` previous and next buttons, the `Drawer` handle, `Progress`, the `ScrollArea` thumb, `Slider`                                                                                                                                          | square | pill   | `rounded-pill`                           |
| `Avatar` (image, fallback, badge), `Message` avatar, `RadioGroup` item, `Switch` (track and thumb), the `Questionnaire` choice dot                                                                                                                                                         | round  | round  | `rounded-full`                           |
| `Chart` legend and tooltip indicators                                                                                                                                                                                                                                                      | 4px    | 4px    | `rounded-xs`                             |
| The `Logo` mark, the `ButtonGroup` root and the corners where its children meet, the `line` variant of `TabsList`, the joined items of a `ToggleGroup`, the input and textarea inside an `InputGroup`, the middle of a `Calendar` range                                                    | square | square | `rounded-none`                           |
| `Sheet`, `Table`, `Separator`, `Breadcrumb`                                                                                                                                                                                                                                                | square | square | none: nothing to round                   |

The last two rows are seams, or shapes with nothing to round: an edge that meets another element stays square whatever the brand. A new component takes a role, and `rounded-none` only for such a seam.

---

## ⚠️ A note on the shadcn styles

shadcn/ui ships several styles. The **radix-lyra** style, the one this design system is anchored on, draws square corners; the **radix-nova** style, and the older **new-york**, round their buttons, inputs and cards. The code an agent has seen for shadcn/ui is mostly new-york: the classes it remembers (`rounded-md` on a button, `rounded-lg` on a card) are the wrong radius in either brand here, since a fixed step does not follow the brand.

**Decision rule:**

```
If the surface is a design-system component
  → Use it as it is: it draws its own corners, add no rounded-* class
If a screen draws the surface itself, next to components (a panel, a tile)
  → Use the role of what it sits beside: rounded-surface for a panel, rounded-control for a field-like tile
If an edge meets another element (a seam, a table cell)
  → Leave it square: no radius class, or rounded-none
If the shape is round in both brands (an avatar-like image, a dot)
  → Use rounded-full
If it is content, not interface (an image, a hero, an illustration)
  → Use radius.sm to radius.4xl, depending on its size
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
// ❌ A fixed step next to components: rounded in lyra, a different radius from the Card in nova
<div className="rounded-lg bg-card p-4">...</div>

// ❌ Square on purpose next to components: right in lyra, wrong beside a nova Card
<div className="rounded-none bg-card p-4">...</div>

// ✅ The role of the Card next to it: the two match in either brand
<div className="rounded-surface bg-card p-4">...</div>

// ❌ A radius class on a component: Button draws its own corners
<Button className="rounded-control">Save</Button>

// ✅ A round shape
<Skeleton className="size-10 rounded-full" />
```

---

## Usage Rules

1. **Always use the tokens** — no arbitrary values such as `rounded-[7px]`. When no token fits, escalate to the design team.
2. **Next to components, a screen uses a role** — `rounded-surface`, `rounded-control`, `rounded-item`, `rounded-inset`, `rounded-mark` or `rounded-pill`, the role of what it sits beside, so that it matches them in either brand.
3. **A component draws its own corners** — add no `rounded-*` class to a `Button`, `Input`, `Card`, `Dialog` or any other component.
4. **`rounded-none` and `rounded-full` are fixed in every brand** — `rounded-none` for a seam, an edge that meets another element; `rounded-full` for a round shape, an avatar or a dot. Do not use `rounded-full` on a button, a badge or a card: a pill that follows the brand is `rounded-pill`.
5. **The `radius.sm` to `radius.4xl` scale is for content** — an image, an illustration, a hero. Its steps are the same in both brands. `rounded-none` and `rounded-full` are static Tailwind classes that read no radius token, which is why `radius.full` is `reserved`.
