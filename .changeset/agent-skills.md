---
"dsaireadable": minor
---

skills: Add two agent skills in `skills/`, installable with `npx skills add Toniio/DSAIReadable` or as the `dsaireadable` Claude Code plugin (`.claude-plugin/marketplace.json`), which also starts the MCP server. `dsaireadable-build` builds or changes a screen MCP-first: the page pattern, one detailed spec per component, then `dsaireadable_validate_code` and `dsaireadable_validate_screen` until both report zero errors. `dsaireadable-ui-guard` reviews every screen it builds or changes for basic UI and UX errors before handing it back: a checklist in eight domains (hierarchy, forms, states, destructive actions, navigation, accessibility, microcopy, restraint), then a `file:line — severity — rule — fix` review that ends in pass or fail. Each of its rules cites the spec, pattern or foundation that writes it.
