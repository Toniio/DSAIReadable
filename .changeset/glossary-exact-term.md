---
"dsaireadable": patch
---

mcp: `dsaireadable_get_glossary` answers with the exact term before a term that contains it. Asked for `token`, it served `component-token`; `component`, `slot` and `variant` served `component-token`, `data-slot` and `variant-axis` the same way. A partial match now answers only when no term is exact, and both still ignore case.
