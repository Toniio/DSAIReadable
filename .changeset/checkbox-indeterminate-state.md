---
"dsaireadable": patch
---

visual: Checkbox `checked="indeterminate"`: from an unfilled box (`border-input`, no fill) with a `CheckIcon`, which read as checked while assistive technology announced "mixed", to a box filled like a checked one (`border-primary bg-primary text-primary-foreground`, `dark:bg-primary`) with a `MinusIcon`. The icons swap in CSS on the root's `data-state`, so an uncontrolled box shows the check again once clicked. At keyboard focus it takes `border-ring` like a checked box, and keeps `border-primary` in a choice card.
