---
"dsaireadable": patch
---

visual: Calendar names each day button by its full date without an ordinal, "Sunday, September 27, 2026" instead of "Sunday, September 27th, 2026", so the name contains the number the button shows (WCAG 2.5.3, Label in Name). The date follows the calendar's `locale`; the "Today" and "selected" parts and a `labels.labelDayButton` passed in are unchanged.
