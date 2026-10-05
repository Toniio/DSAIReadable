---
"dsaireadable": minor
---

skills: `dsaireadable-build` now loads for a change to an existing screen only — an edit, a refactor, a field, a section, a state or a confirmation added to a file that imports from `@/components/ui` — and no longer for a new screen, which the MCP server alone builds as well for fewer tokens (0.3.0 evals: 98.1 % against 96.8 %, 95,446 input tokens per screen against 164,878). Its workflow starts from the file: read it whole, keep what follows the system, read the concise spec of each component the change adds or touches, the pattern only for a task or a state the screen lacks, then validate the whole file. `dsaireadable-ui-guard` reviews a screen when asked to, instead of on every screen built or changed.
