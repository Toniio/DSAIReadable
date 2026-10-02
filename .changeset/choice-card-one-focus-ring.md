---
"dsaireadable": patch
---

visual: Choice card (a `FieldLabel` that wraps a `Field`): Checkbox, RadioGroupItem and Switch no longer draw their own `ring-ring/50` ring and `border-ring` border inside the card's ring; the card draws the only one. A focused unchecked box or radio keeps `border-input` (Switch: transparent) instead of turning `border-ring`; an invalid one keeps `border-destructive`. The classes upstream wrote for this never took effect (they tied FOCUS_RING on specificity and lost on emission order), and applied to any FieldLabel: they are scoped to a card, so a control in a `FieldLabel` with no `Field` keeps its ring, and a focused checked Checkbox or RadioGroupItem there turns `border-ring` like anywhere else, where it kept `border-primary`.
