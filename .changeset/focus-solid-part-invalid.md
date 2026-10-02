---
"dsaireadable": patch
---

visual: Focus indicator of an invalid control (`aria-invalid`): Input, Textarea, NativeSelect, SelectTrigger, Checkbox, RadioGroupItem, Switch, Toggle, Button, Badge and the active InputOTPSlot. They keep their `destructive` border at focus, so focus only added a `ring-destructive/20` halo (dark `/40`), about 1.4:1 light and 1.9:1 dark; it now also draws a solid 1px `outline-destructive` outline (`border-width.default`: 4.77:1 light, 6.83:1 dark). An InputGroup (PasswordInput included) or a ComboboxChips holding an invalid control showed no change at all on focus (WCAG 2.4.7): it draws the same outline while the control has focus.
