---
"dsaireadable": patch
---

visual: Focus shows on invalid controls. Button, Checkbox, Input, NativeSelect, Questionnaire, RadioGroup, Select, Switch and Textarea with `aria-invalid`: the destructive ring is no longer drawn at rest (it was identical with and without focus, so keyboard focus was invisible, WCAG 2.4.7); at rest the destructive border alone marks the error, and the ring (`ring-destructive/20`, dark `/40`, `--space-focus-ring-width` wide) appears on focus, as in shadcn/ui. CommandInput: its InputGroup now draws the focus ring (none before, its selector never matched `data-slot="command-input"`).
