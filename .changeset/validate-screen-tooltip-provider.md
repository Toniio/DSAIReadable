---
"dsaireadable": minor
---

mcp: `dsaireadable_validate_screen` adds a `tooltip-provider` rule: a warning, at the line of the first `<Tooltip>`, on a file that renders a `Tooltip` with neither a `<TooltipProvider>` nor a `<SidebarProvider>`, which supplies one. A `Tooltip` throws `` `Tooltip` must be used within `TooltipProvider` `` without a provider above it. It is a warning, not an error: the provider often lives in the root layout, which a check of one file does not see.
