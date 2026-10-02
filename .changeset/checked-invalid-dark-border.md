---
"dsaireadable": patch
---

visual: Checkbox and RadioGroupItem, checked and invalid, in dark mode: border from `border-destructive/50` to `border-primary`, as in light mode (upstream's `aria-invalid:aria-checked:border-primary` had no dark counterpart and lost to `dark:aria-invalid:border-destructive/50` on emission order).
