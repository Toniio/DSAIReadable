---
"dsaireadable": minor
---

component-api: Alert and Badge get an `info` variant, for a notice that asks for no action (a tip, a change that took effect; a Beta or Scheduled label). Alert `info` is `text-info` on the card with its description at `text-info/90`; Badge `info` is `text-info` on a `bg-info/10` tint (`/20` in dark), `bg-info-hover` as a link. Both are declared in `shadcn.divergences`, like `success` and `warning`.
