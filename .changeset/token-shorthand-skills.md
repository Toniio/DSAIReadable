---
"dsaireadable": patch
---

skills: `dsaireadable-build` no longer says arbitrary values "generate nothing": `p-[13px]` generates `padding: 13px`, and the ESLint plugin and `dsaireadable_validate_code` are what refuse it. It names Tailwind's `(--…)` shorthand for a variable with no class.
