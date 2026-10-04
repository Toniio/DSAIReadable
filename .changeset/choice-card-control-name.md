---
"dsaireadable": patch
---

visual: The control of a choice card has a name. Inside a `FieldLabel`, `Field` now renders a plain `<div>` instead of a `<div role="group">`: Chromium and axe leave the text of a group out of the name a `<label>` gives its control, so the `Checkbox`, `RadioGroupItem` or `Switch` of a card built as the Field spec says (a `FieldLabel` wrapping a `Field` with its `FieldContent`, then the control) was announced with no name, and axe reported `button-name`. The card's text names it now, `FieldTitle` then `FieldDescription`. A `Field` outside a `FieldLabel` keeps `role="group"`; no prop, class or look changes.
