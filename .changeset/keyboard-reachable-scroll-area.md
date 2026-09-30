---
"dsaireadable": patch
---

visual: ScrollArea's viewport is in the tab order (`tabIndex={0}`, with its focus ring), so the keyboard reaches and scrolls an area that holds nothing focusable in every browser, Safari included (WCAG 2.1.1); name the area with `role="region"` and an `aria-label`. CommandSeparator is `aria-hidden`: a listbox may own only options and groups.
