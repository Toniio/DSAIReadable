---
"dsaireadable": patch
---

visual: `color.border.focus` in dark mode: from `mist.500` (the light value) to `mist.400`, so every focus indicator is lighter in dark: its solid part goes from 4.28:1 to 8.08:1 on the page, 3.21:1 to 6.06:1 on a card and 3.77:1 to 7.12:1 on a popover, and an InputGroupButton (PasswordInput's "Show password") on a field's `dark:bg-input/30` fill over a card from 2.80:1, below 3:1, to 5.27:1. The `ring-ring/50` halo follows (about 1.9:1 to 2.8:1). `--ring` and every `ring`, `border-ring` and `outline-ring` class read it; light mode is unchanged.
