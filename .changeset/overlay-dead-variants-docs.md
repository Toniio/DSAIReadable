---
"dsaireadable": patch
---

docs: NavigationMenu: the trigger drops `data-popup-open:bg-muted/50`, `data-popup-open:hover:bg-muted` and the caret's `group-data-popup-open:rotate-180`, Base UI attributes Radix never sets, and Resizable drops `aria-[orientation=vertical]:flex-col`, which never matched; the `data-open` classes keep drawing the open trigger and nothing changes on screen. The Tooltip spec describes the animated keyboard open, the motion foundation names the default Select, which opens with no animation by design, as the exception, the focus foundation lists the mechanisms the `focus-managed` comments name as the primitives really work (roving tabindex, active descendant, no focus scope on HoverCard), and `specs:states` refuses a Base UI-only variant on a Radix component.
