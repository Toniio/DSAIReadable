---
"dsaireadable": patch
---

visual: Every state drawn with an opacity now takes a named token:

- Primary fill on hover (Button, Badge link, default Bubble): `bg-primary/80` to `bg-primary-hover`, violet.700 light (the label goes from 4.24:1 to 9.76:1) and violet.600 dark.
- Secondary fill on hover (Button, Badge link, secondary and muted Bubble): a 5% foreground mix or `/80` to `bg-secondary-hover`, mist.200 light and mist.700 dark; it now shows on a card too.
- Destructive tint on hover (Button, Badge link, Bubble) and highlighted destructive menu items (ContextMenu, DropdownMenu, Menubar): `bg-destructive/20` (`/30` dark; menus `/10`, `/20` dark) to `bg-destructive-hover`, red.200 light and red.700 dark. A destructive Badge link in dark changed nothing on hover; it does now.
- Success and warning Badge links on hover: `/20` to `bg-success-hover` and `bg-warning-hover`, step 200 light and 700 dark.
- Tinted Bubble on hover: a relative primary color to `bg-primary-tint-hover`, violet.200 light and violet.700 dark.
- Neutral hovers (table row, Attachment link, choice card, Questionnaire choice; ghost Button and Badge, outline Button, Select and NativeSelect triggers, outline and ghost Bubbles in dark): `bg-muted/50` or `bg-input-fill/50` to the `bg-overlay-hover` veil, ink at 5% light and white at 8% dark, visible on the page, a card and a popover.
- Open, current and expanded (NavigationMenu trigger and link, expanded table row) and the active tab in dark: `bg-muted/50` or `bg-input-fill/30` to the `bg-overlay-selected` veil, ink at 7% light and white at 8% dark.
- Checked choice card (FieldLabel wrapping a Field): `bg-primary/5` and `border-primary/30` (`/10` and `/20` dark) to `bg-primary-selected` (violet.50 light, violet.950 dark) and a solid `border-primary`.
- Checked Questionnaire choice: `border-foreground/30` to a solid `border-foreground` frame, which no longer sits lighter than the resting 3:1 border.
- Documentation site: the component cards and dependency links take `hover:border-foreground` instead of `hover:border-foreground/30`.
