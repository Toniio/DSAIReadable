---
"dsaireadable": minor
---

skills: `dsaireadable-build` is removed, from `skills/` and from the Claude Code plugin. The harness measured it against the MCP server alone with claude-sonnet-5-5, three passes each: on new screens (0.3.0 evals, 26 tasks) 96.8 % against 98.1 % conformance at 164,878 input tokens per screen against 95,446; narrowed to changes of an existing screen (the `skills` suite, 8 edit tasks), 21 of 24 against 23 of 24 at a median 59,206 tokens against 35,468 (+22 % once the test environment's own overhead is taken out). The server's instructions, patterns and validation tools carry the workflow: an agent that loaded the skill asks the server directly. `dsaireadable-ui-guard` now reviews a screen when asked to, instead of on every screen built or changed.
