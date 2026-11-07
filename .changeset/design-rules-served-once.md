---
"dsaireadable": minor
---

mcp: Two answers of the MCP server stop repeating rules that another answer serves, since every turn of an agent sends each answer it read again.

- `dsaireadable_get_design_rules` `detailed` without a category leaves out the 14 rules of `voice-and-tone` and `content`, which `dsaireadable_get_ux_writing_rules` serves, and names that tool in its `detail` line (36,879 to 35,312 characters). Both foundations stay in `categories`, a `category` still returns their rules, and `ds://guidelines` still holds every rule. In the 0.3.0 evals, 76 of the 102 sessions that read this answer called `dsaireadable_get_ux_writing_rules` too.
- `dsaireadable_get_component_specs` `detailed` serves in `composition_rules` the rules about the component that its `usage` does not already carry: a choice rule (rule-20 to rule-23) is copied into the usage of each spec it covers, and 23 specs served it twice in one answer. The 65 detailed specs go from 357,940 to 337,140 characters.
- A component's composition rules, in that answer and in `dsaireadable_get_design_rules` with the component's name as `category`, are the rules whose `applies_to` lists it, or, for a rule without `applies_to`, whose text names it in its case. Matched in any case, 9 components got a rule about something else: Button got rule-13, the `data-slot` authoring rule, for `data-slot='button'`, and Message got rule-09 for "an error message". A foundation's name still matches in any case: `spacing` returns rule-12.
