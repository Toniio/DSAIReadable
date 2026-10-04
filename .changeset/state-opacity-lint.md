---
"dsaireadable": minor
---

lint: `configs.tailwind` rejects a color with an opacity modifier under a state variant: `hover:`, `active:`, `focus:`, and the open, expanded, checked, selected and pressed variants (`hover:bg-primary/80`, `data-open:bg-muted/50`, `has-data-checked:bg-primary/5`). The message names the state token to use. A focus ring keeps its halo alpha (`focus-visible:ring-ring/50`), and a resting tint (`bg-destructive/10`) is not a state.
