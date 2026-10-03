---
"dsaireadable": patch
---

visual: Accessibility fixes with no change of API. AvatarBadge renders `role="img"` when it is given an `aria-label` or `aria-labelledby`, which a `span` with no role cannot carry (axe `aria-prohibited-attr`); the Avatar example labels its badge "Online". BreadcrumbEllipsis hides its icon only, so screen readers announce its `srLabel` ("More"), which `aria-hidden` on the whole ellipsis kept silent. SidebarMenuAction goes from a 20 × 20 box to 24 × 24 (`min-w-target`, `size.target.min`), grown 2px on every side so it stays centered on its menu button: axe measured a 20px target overlapping the button. Sonner toasts take the design system's typeface (`var(--font-mono)`, `typography.font-family.mono`) where they used sonner's system font stack.
