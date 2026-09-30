---
"dsaireadable": patch
---

visual: Tabs passes `orientation` to Radix. With `orientation="vertical"`, the list now carries `aria-orientation="vertical"` and `ArrowDown` / `ArrowUp` move between tabs; before, the list stayed horizontal for assistive technology and the vertical arrows did nothing.
