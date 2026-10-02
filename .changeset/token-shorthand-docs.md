---
"dsaireadable": patch
---

docs: How to read a token in a class. `spacing.md` says a screen takes a class first, then Tailwind's shorthand `utility-(--variable)` (`w-(--radix-popover-trigger-width)`) for a variable with no class, never `w-[var(--…)]` or `w-[--…]`, and that a `style` prop may read a token; its components/ui table writes `w-(--sidebar-width)`, the form `sidebar.tsx` uses. `color.md` reads the sequential chart colors through `bg-(--color-chart-sequential-N)`. `llms.txt` no longer says to style "through `var(--…)` tokens".
