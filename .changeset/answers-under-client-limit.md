---
"dsaireadable": minor
---

mcp: No answer of the MCP server passes 40,000 characters, under the 25,000 tokens Claude Code accepts from one MCP result by default (`MAX_MCP_OUTPUT_TOKENS`). Over it, the agent reads an error and the path of a file instead of the answer: in the 0.3.0 evals, 19 calls of `dsaireadable_get_design_rules` `detailed` without a category got that error.

- `dsaireadable_get_design_rules` `detailed` without a category serves the critical rules whole, every foundation's rules (`general_rules`) and the composition rules, as `ds://guidelines` does, with the `categories` to pass and a `detail` line; it stops serving `component_rules`, the constraints of the 65 component specs (73,517 to 36,879 characters). A component's rules stay its `category`'s answer, and `dsaireadable_get_component_specs` serves them as `constraints`.
- `dsaireadable_get_components`, `dsaireadable_get_tokens` and `dsaireadable_get_changelog` end a page before 40,000 characters, so `limit` is a maximum: `next_cursor` points at the first item left out. A page of 200 tokens came to 62,726 characters, and the changelog's default page to 61,940.
- `dsaireadable_validate_screen` and `dsaireadable_validate_code` list the issues that fit and count the rest in `issues_not_listed`; `total_issues`, `errors` and `warnings` still count every issue.
