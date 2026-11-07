---
"dsaireadable": minor
---

mcp: `dsaireadable_get_design_rules` `detailed` without a category serves the foundation rules grouped by foundation, in a `foundation_rules` object keyed by the foundation's name (`"color": ["…", …]`), in place of `general_rules`, a list where each rule carried its own `"source": "<foundation>.md"`. The answer goes from 32,809 to 30,237 characters, with the same 89 rules of 10 foundations, in the same order. Re-served on the six 0.3.0 runs with the MCP server (claude-sonnet-5-5, with and without the skills), the answer weighs 7 % less and the estimated median input tokens per screen drop by 2,000 to 3,200 per run. A foundation's `category` answer and `ds://guidelines` keep the flat list of `{ rule, source }`.
