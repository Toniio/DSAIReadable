---
"dsaireadable": patch
---

visual: Tooltip: a tooltip opened by keyboard focus, or by a hover right after another tooltip closed (Radix `instant-open`), now enters like a hover open, with `fade-in-0`, `zoom-in-95` and a `slide-in-from-*` from its side (the fade alone under reduced motion). It used to appear at once and leave with `fade-out-0` and `zoom-out-95`: the entrance classes waited for `data-state="open"`, which Radix never writes on a tooltip.
