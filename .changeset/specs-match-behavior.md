---
"dsaireadable": patch
---

docs: Specs now describe what the components do, replayed in a real browser. ToggleGroup's role is `radiogroup` (single) or `toolbar` (multiple), not `group`; Calendar marks an unavailable day as a `disabled` button; Combobox points `aria-activedescendant` at the highlighted option and `aria-selected` at the chosen one; ContextMenu opens with right-click and the Menu key, `Shift+F10` only where the OS maps it (not macOS); Popover's `Tab` loops through its content; Questionnaire's `Enter` moves on from a checked choice and does not check it; Attachment's group scrolls with `ArrowLeft` / `ArrowRight`; Accordion's `Tab` visits each trigger. Resizable sizes: a number is in pixels, so the examples use percent strings (`defaultSize="50%"`). The CommandDialog example wraps its content in `Command`.
