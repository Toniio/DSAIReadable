---
"dsaireadable": patch
---

docs: The Chart spec names the chart on the Recharts element (`aria-label` on `BarChart`, not on `ChartContainer`), asks for a visible text summary and a visible Table when readers need the values, never a Table in `sr-only`, and documents its keys (Tab, ArrowLeft / ArrowRight, Enter) and `<Pie rootTabIndex={-1}>`; the focus foundation no longer counts the Recharts tooltip as a focus indicator.
