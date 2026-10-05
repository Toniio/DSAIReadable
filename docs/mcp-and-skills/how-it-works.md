# How it works

An agent that writes interfaces with DSAIReadable reads the design system through two pieces. The MCP server serves it: the components and their specs, the tokens, the page patterns, the rules and the copy, with two tools that check the code the agent writes. The UI guard skill gives a screen a second look when someone asks for a review. The eval harness measures what the server changes, on the same screens built with it and without it.

## From sources to answers

The server never reads the specs while it runs. `npm run generate-context` compiles them, with the tokens, the component index and the component sources, into the JSON files of `mcp-server/context/`, and each answer is a lookup in that cache.

<!-- site: pipeline -->

- **The package needs no repository.** `@dsaireadable/mcp-server` ships its compiled code and the cache, not the specs, the tokens or the parsers that read them.
- **Every client gets the same answer.** Lists and resources carry a one-hour cache hint, which shared caches may keep.
- **What agents will read is reviewed.** A spec changed in a pull request changes, in the same diff, the JSON the server serves, and the `context-freshness` CI job fails on the slightest drift.
- **A parse error stops the build, not the agent.** `generate-context` fails when a parser does or when the index drifts from `components/ui/`, and the server refuses a missing cache rather than serve an empty design system.
- **People and agents read the same data.** The documentation site is built from the same cache: the components, patterns and rules it shows are the ones the server serves.

The server runs on the machine, over stdio, or over HTTP bound to `127.0.0.1`. A hosted server is on the backlog.

## A session, tool by tool

The [`build_screen`](../../mcp-server/src/prompts/index.ts) prompt sets the workflow of a new screen, within a budget of four calls plus one per component:

1. `dsaireadable_get_design_system_overview`: the setup, the imports and the component categories.
2. `dsaireadable_get_pattern`, outside the budget, when the screen carries out a common task (create, edit, delete, filter, search, sign in, settings): the components, structure, spacing and copy of that task.
3. `dsaireadable_get_components`: the components the screen needs, and only those.
4. `dsaireadable_get_design_rules`: the composition rules and the critical rules.
5. `dsaireadable_get_component_specs`, once for each component kept.
6. The screen, then `dsaireadable_validate_screen` and `dsaireadable_validate_code`, again after each fix, until both report no error.

The eval harness records each session it runs: the tools the agent called, how many times, and the size of their answers, in `evals/history/`. The session in the middle of the latest version's runs with the server, by input tokens, shows where the context of a typical screen goes.

<!-- site: session -->

## The UI guard skill

A screen can pass every lint and still be hard to use: two buttons fight for attention, a list goes blank with no next step, a delete happens without a word. The `dsaireadable-ui-guard` agent skill gives a screen that second look when someone asks for a review. It runs the validation tools first, ticks its checklist domain by domain, writes one line per finding, and ends with a verdict: pass or fail.

- **On request only.** While a screen is built, the server's patterns and validation tools carry the rules.
- **Judgment only.** What a tool can check stays with the tools: the ESLint plugin, `dsaireadable_validate_code`, axe.
- **No copied limit.** Each rule names its source (`spec:Button`, `pattern:delete`, `foundation:voice-and-tone`), and the agent reads the value there through the server, so the skill cannot drift from the specs. `npm run skills:validate` checks that every source it cites exists.
- **Pinned to the release.** `npx skills add` and the Claude Code plugin install it from the release tag, so the tools it names always exist.

<!-- site: ui-guard -->
