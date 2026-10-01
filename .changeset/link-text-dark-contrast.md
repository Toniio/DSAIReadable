---
"dsaireadable": patch
---

visual: Link text reaches 4.5:1 in dark mode. `text-primary` now reads the action text token `color.text.action.default` (active, it was reserved), and `bg-primary` keeps the action fill, as `text-destructive`, `text-success` and `text-warning` already do. Button and Badge `variant="link"`, and a hovered link in EmptyDescription, FieldDescription and ItemDescription: in dark mode, from the action fill (1.5:1 on the card) to the new `primitive.color.violet.300` (7.4:1 on the card, 8.7:1 on a popover); light mode is unchanged (`violet.600`).
