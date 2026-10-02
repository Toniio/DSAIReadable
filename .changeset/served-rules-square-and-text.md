---
"dsaireadable": patch
---

mcp: The critical styling rule served with every prompt and `dsaireadable_get_design_rules` no longer recommends `rounded-lg rounded-md` and a `font-medium` label: it says the components are square, that `rounded-full` is for a round shape, and that `Label`, `FieldLabel` and `Heading` take no `text-*`, `font-*`, `tracking-*` or `leading-*` class; the `validate_screen` message for a raw radius says the same. The `ux-writing` context no longer serves the `// ✅` and `// ❌` titles of the radius and opacity code examples as rules without their code.
