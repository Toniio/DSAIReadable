---
"dsaireadable": patch
---

visual: The components are re-anchored on shadcn/ui 4.21.0 (`radix-lyra`) and take its fixes. Button default: the hover color (`bg-primary/80`) shows on every button, not only on a link. Card: the gap and padding come from `--card-spacing` like upstream; a `sm` card's gap goes from `space.scale.2` to `space.scale.3`. CarouselPrevious and CarouselNext: centered with `inset-y-0 my-auto` instead of a `-translate-y-1/2`, which the Button's pressed `translate-y-px` overrode. Checkbox, RadioGroup and Switch inside a choice-card `FieldLabel`: the label draws the focus ring and the hover background, the control draws none. BubbleReactions: its ring takes `border-width.separation`, not the focus-ring width. Marker: links underline at offset 3 like every other link.
