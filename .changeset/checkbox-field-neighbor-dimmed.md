---
"dsaireadable": patch
---

visual: Checkbox: an enabled box in a `Field` that also holds a disabled control (the "Other: [text input]" pattern) is no longer dimmed to `opacity-disabled` (0.5); `group-has-disabled/field` matched any disabled control of the Field, and it now matches a disabled Checkbox only. A disabled Checkbox keeps its own `disabled:opacity-disabled`.
