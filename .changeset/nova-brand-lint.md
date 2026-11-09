---
"dsaireadable": minor
---

lint: Add `no-text-role-in-stock-cn` to `configs.core`: a text role (`text-ui`, `text-description`, `text-title`, `text-control`) passed to a `cn` imported from a module other than `@/lib/cn`, whose tailwind-merge does not know the roles and can drop them.
