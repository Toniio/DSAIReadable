---
"dsaireadable": patch
---

visual: The base registry item no longer carries its own `prefers-reduced-motion` rule for the Attachment title shimmer (`[data-slot="attachment-title"]`): `shadcn/tailwind.css` 4.21.1 stops the shimmer itself, and the item now depends on `shadcn@^4.21.1` (was `^4.21.0`). The title still stays static, in the text color, under reduced motion.
