---
"dsaireadable": patch
---

visual: Calendar: a hovered selected day (single, range start and end) keeps `bg-primary` with `text-primary-foreground` in dark mode, and a hovered range middle keeps `bg-muted`, instead of `bg-muted/50` with `text-foreground`; a disabled day moves from opacity 0.25 (`opacity-disabled` on the cell and on its button) to `opacity-disabled` once (0.5); with `captionLayout="dropdown"` the month and year dropdowns take a `border-input` border, and `border-ring` with a `ring-ring/50` ring on focus, where focusing them showed nothing (WCAG 2.4.7).
