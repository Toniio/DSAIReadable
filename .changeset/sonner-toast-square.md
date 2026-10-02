---
"dsaireadable": patch
---

visual: Sonner toast radius: from 8px (`radius.md`) to 0 (`radius.none`), square like every radix-lyra surface. The table of `shadcn-upstream.json` mapped the `var(--radius)` of the toast's `--border-radius` to `var(--radius-md)` for every component; it now maps it to `var(--radius-none)` for Sonner alone (a `values` entry per component).
