---
"dsaireadable": patch
---

docs: What six States tables asked of a screen is now a constraint of its spec, which `dsaireadable_get_component_specs` serves in both formats: `aria-invalid` on each `InputOTPSlot` (on `InputOTP` it draws nothing); no `disabled` on `PaginationLink`, `PaginationPrevious` or `PaginationNext`, which render an `<a>`; `data-disabled` on the `Field` of a disabled control, and how a choice card is built; a `Command` around the content of a `CommandDialog`, and `data-checked` on a `CommandItem`; a `Spinner` child and `aria-busy` on a pending `Button`; the `border` class for the dashed outline of an `Empty`.
