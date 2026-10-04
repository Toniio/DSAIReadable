---
"dsaireadable": minor
---

component-api: Add the `color.background.input` token and its `bg-input-fill` class, the fill of a form control. `--input` stays the border, as in shadcn/ui, and the translucent fills that read it move to the new token with the same values (mist.200 in light, white at 15% in dark): `dark:bg-input/30` becomes `dark:bg-input-fill/30`, `disabled:bg-input/50` becomes `disabled:bg-input-fill/50` and `dark:disabled:bg-input/80` becomes `dark:disabled:bg-input-fill/80` in Bubble, Button, Checkbox, Combobox, Command, Input, InputGroup, InputOTP, NativeSelect, Questionnaire, RadioGroup, Select, Tabs and Textarea, and ButtonGroupSeparator's `bg-input` becomes `bg-input-fill`. Paint a field's fill with `bg-input-fill/<n>`: `bg-input/<n>` is now the 3:1 border color at that opacity.
