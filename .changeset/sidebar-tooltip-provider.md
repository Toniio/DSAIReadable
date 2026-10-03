---
"dsaireadable": patch
---

docs: The Sidebar spec now says that a `SidebarMenuButton` with a `tooltip` renders under a `TooltipProvider`, in the root layout or around the `SidebarProvider`. Its `Tooltip` throws without one, and the spec, which requires a `tooltip` on every button collapsed to its icon, never named the provider: agents that followed it built sidebars that did not render.
