---
"dsaireadable": patch
---

visual: Chart: keyboard focus draws a `ring-ring/50` ring and a `border-ring` outline (`outline-ring`, `border-width.default`) around ChartContainer on every focus, a Pie layer and a Brush included; before, the surface had no outline and only the tooltip of the first focus showed it, so a returning focus, or a chart with no ChartTooltip, showed nothing (WCAG 2.4.7).
