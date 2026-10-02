---
"dsaireadable": patch
---

visual: InputGroup takes its disabled look (`opacity-disabled`, `bg-input/50`, dark `bg-input/80`) from its field only (`has-[[data-slot=input-group-control]:disabled]`, was `has-disabled`): a disabled `InputGroupButton` no longer dims the whole group and the enabled field in it (text at 3.51:1, below WCAG 1.4.3). The two inert `in-data-[slot=combobox-content]:focus-within` classes are dropped, with no rendering change.
