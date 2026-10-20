---
"dsaireadable": patch
---

docs: The Props / API tables spell out a prop typed by a named union of literals instead of printing the name: Combobox `align` and `side`, Chart `verticalAlign`, Direction `dir`, MessageScroller `direction` and NavigationMenu `orientation` now list their values. A union a declaration writes out keeps its written order: Drawer `direction` reads `"top" | "bottom" | "left" | "right"` and InputGroup `type` `"submit" | "reset" | "button"`.
