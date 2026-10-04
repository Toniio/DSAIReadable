---
"dsaireadable": patch
---

visual: `SidebarProvider` now wraps its children in a `TooltipProvider` (`delayDuration` 0, the default of `TooltipProvider`), so the `tooltip` of a `SidebarMenuButton` renders with no provider of the app's own. It used to throw `` `Tooltip` must be used within `TooltipProvider` `` in an app that had none: the Sidebar spec requires a `tooltip` on every button collapsed to its icon, and agents that followed it built sidebars that did not render. A `TooltipProvider` in the root layout still works, but inside the `SidebarProvider` the sidebar's is the nearer one: a `Tooltip` there, in the sidebar or in `SidebarInset`, now opens after 0 ms, whatever `delayDuration` the root provider sets. shadcn/ui's `SidebarProvider` supplies no provider: the divergence is declared in `design-system.index.json`.
