---
"dsaireadable": patch
---

visual: PasswordInput disables its visibility toggle with the field and masks the value again: a disabled PasswordInput's toggle leaves the tab order and no longer responds to hover or click (its icon was at 1.91:1, below WCAG 1.4.11). With `readOnly` the toggle still works.
