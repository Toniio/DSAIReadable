---
"dsaireadable": patch
---

docs: The Sidebar spec's constraint on the `TooltipProvider` is rewritten now that `SidebarProvider` supplies one: a `Tooltip` inside the `SidebarProvider`, the `tooltip` of each `SidebarMenuButton` included, needs no provider of the app's own, and a `Tooltip` outside it still needs a `TooltipProvider` in the root layout. The spec's dependencies name `TooltipProvider`.
