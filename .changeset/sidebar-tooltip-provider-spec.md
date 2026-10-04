---
"dsaireadable": patch
---

docs: The Sidebar spec now names the `TooltipProvider`. `SidebarProvider` supplies one to everything inside it, so the `tooltip` of each `SidebarMenuButton`, which the spec requires on every button collapsed to its icon, needs no provider of the app's own; a `Tooltip` outside the `SidebarProvider` still needs a `TooltipProvider` in the root layout, and throws without one. The spec's dependencies and its `Tooltip` cross-reference name the provider.
