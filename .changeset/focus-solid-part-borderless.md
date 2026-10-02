---
"dsaireadable": patch
---

visual: Focus indicator of the elements with no border: Toggle and ToggleGroupItem (`default` variant), MenubarTrigger, the NavigationMenu trigger and link, TabsContent, the ScrollArea viewport, the Resizable handle, the Slider thumb, a focused Calendar day and the CommandInput field. From a `ring-ring/50` halo alone (about 1.9:1, below the 3:1 of WCAG 1.4.11) to a solid 1px `outline-ring` outline (`outline-solid`, `border-width.default`: 4.61:1 light, 8.08:1 dark) inside the same 2px halo. On the Calendar day it replaces `border-ring`, which drew nothing on a `border-0` button; on the Resizable handle and the Slider thumb it replaces `focus-visible:outline-hidden`.
