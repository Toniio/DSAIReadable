---
"dsaireadable": patch
---

visual: Transitions with no duration class (the hover and focus color changes of Button, Input, Textarea, Tabs, Switch, Checkbox, Badge, Toggle, the Sidebar buttons and rail…): from 150ms, Tailwind's default, to 100ms (`motion.duration.fast`); their curve now reads `motion.easing.default`, which holds the same `cubic-bezier(0.4, 0, 0.2, 1)`. `styles/globals.css` bridges `--default-transition-duration` and `--default-transition-timing-function` in `@theme inline`, so a consumer's `transition-colors` follows. Overlays, the Sheet, the Accordion and the Tooltip keep their own timing.
