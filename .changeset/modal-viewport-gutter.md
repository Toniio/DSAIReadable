---
"dsaireadable": patch
---

visual: Viewport gutter of the centered modals: DialogContent (and CommandDialog) below 640px, from 12px to 16px on each side (`max-w-[calc(100%-var(--space-component-lg))]` becomes `max-w-[calc(100%-var(--space-scale-8))]`, the 2rem shadcn/ui draws); AlertDialogContent below 352px, from flush with the viewport edges to 16px on each side (`w-[calc(100%-var(--space-scale-8))]`), still 320px wide from 352px. `space.component.lg` (24px) has no reader left and becomes `reserved`, so all five `space.component.*` tokens are reserved; rule-12 says so.
