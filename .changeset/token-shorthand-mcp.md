---
"dsaireadable": patch
---

mcp: The critical styling rule served with every prompt and `dsaireadable_get_design_rules` agrees with the ESLint plugin on variables: it teaches Tailwind's shorthand for a token with no class (`w-(--radix-popover-trigger-width)`, never `w-[var(--…)]`) and no longer forbids an inline `style` that reads a token, which the plugin has always accepted (`style={{ width: 'var(--sidebar-width)' }}`; a raw value in a style stays refused). The `dataviz` heatmap entry says to read the sequential steps through `bg-(--color-chart-sequential-N)`. `dsaireadable_validate_code` returns the new `no-raw-values` message.
