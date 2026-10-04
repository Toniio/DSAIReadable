---
"dsaireadable": minor
---

mcp: The MCP server sends less over a session, since every turn of an agent sends the whole conversation again:

- `dsaireadable_get_component_specs` `detailed` serves what a screen writes with the component, and stops serving how it is built: `dependencies`, `anatomy`, `tokens`, `tokens_from`, `states`, `variant_sources` and `part_of`, each export's `example`, and the props rows every part has (the `...props` it spreads, a `className` that only adds classes; a `...props` that adds another library's props, and a `className` that says where its classes go, stay). The whole spec stays the resource `ds://component/{name}/spec`. The concise `detail` line names what `detailed` adds, read from it; the concise answer changes only by the constraints the specs gained.
- `dsaireadable_get_design_rules` serves the two critical rules without their `do` list and their token chain; the prompts still print the `do` list.
- `dsaireadable_get_pattern` `detailed` serves a relative link of its cross-references as the name it gives, `create` for `[create](./create.md)`, followed by that name in parentheses when the label differs; a link with a scheme stays whole.
- `dsaireadable_get_components` leaves out `has_spec`, true for every component; the overview and `dsaireadable_get_stats` still count the coverage.
- The text of every answer, error and resource is compact JSON, as `structuredContent` already was.
- The 19 tool descriptions and their parameters say the same in fewer words (10,386 to 8,315 characters, sent with every turn), and three wrong facts are put right: `dsaireadable_get_changelog` named a `Deprecated` heading and an `Unreleased` version that do not exist, and `dsaireadable_get_icons` promised a catalog where it serves its URL. `dsaireadable_validate_screen` names the checks it runs.
