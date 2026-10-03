---
"dsaireadable": patch
---

visual: Toggle and ToggleGroupItem on state: a solid `border-foreground` frame over the muted fill, 19.72:1 on the page in light mode and 18.99:1 in dark, where the fill alone measured 1.11:1 and 1.33:1 and matched hover. The `default` variant gains a transparent 1px border at rest, so nothing moves when the frame shows, and keeps it transparent at focus, where its `outline-ring` still draws the focus; an invalid `default` toggle now shows its `destructive` border at rest, as the `outline` variant did, and a pressed invalid toggle shows the frame. On the `outline` variant, focus turns a pressed toggle's frame into the `border-ring` border, as on an unpressed one, so focus still adds a solid part; on the `default` variant the frame stays and the `outline-ring` outline is added around it. In a joined `outline` group (`spacing={0}`), the frame shows on three sides, the fourth being the neighbor's border.
