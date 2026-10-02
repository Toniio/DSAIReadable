---
"dsaireadable": patch
---

visual: NativeSelect draws its selected empty-value option (its placeholder) in `text-muted-foreground` (`color.text.subtle`) instead of `text-foreground`, as Select does; ComboboxChipsInput's placeholder takes `text-muted-foreground` instead of Tailwind's faded default (3.70:1 on white).
