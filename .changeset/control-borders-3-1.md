---
"dsaireadable": patch
---

visual: Control borders reach 3:1 (WCAG 1.4.11), and focus moves away from them:

- `color.border.input`: light #e0e8ea (mist.200) to #708185 (mist.500), dark white at 15% to #708185 (mist.500). The resting border of Input, Textarea, Select, NativeSelect, Checkbox, RadioGroupItem, InputOTPSlot, InputGroup, ComboboxChips, a Questionnaire choice, Calendar's dropdowns and the `outline` Button in dark goes from 1.12–1.61:1 to 3.65–4.86:1 on the page, the card and the popover. The search field of a Combobox popup keeps its `border-input/30`, now mist.500 at 30%.
- Switch: the unchecked track (`bg-input`, it has no border) moves with the token, and in dark it is solid where it was `bg-input/80`: 3.68:1 light and 3.65:1 dark on the card, where it measured 1.12:1 and 1.47:1.
- `color.border.focus`: light #708185 (mist.500) to #21292b (mist.800), dark #95a7ab (mist.400) to #e0e8ea (mist.200). Every focus indicator (`border-ring`, `outline-ring`, the `ring-ring/50` halo) is darker in light and lighter in dark: its solid part goes from 3.68–4.06:1 to 13.41–14.82:1 in light and from 5.92–7.89:1 to 11.93–15.89:1 in dark, and it sits 3.65:1 (light) and 3.27:1 (dark) away from the resting border, so a focused field no longer reads as a resting one.
