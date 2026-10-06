# Optimization

An agent with no context builds screens that break the design system's rules more often than an agent connected to the MCP server, and the server's answers cost tokens. The eval harness measures both at every version, on the same tasks: how conformant the screens are, and the input tokens and dollars each one costs. This page follows both conditions version by version, and the levers that moved them.

## No context against the server

The harness builds each of its default tasks as one screen, with no context and with the MCP server, from the same version of the design system, then scores every screen. A screen is fully conformant when it compiles, lints clean, and passes axe and the focus check in light and dark; conformance is the harness's score, the mean of those two stages. A version measured in several passes pools them.

<!-- site: versions -->

## What the tokens buy

The server's tokens are a cost per screen. What they buy is screens that pass every check with nothing left to fix.

<!-- site: returns -->

### Why screens without context fail

With no context, an agent writes the interface it knows: plain HTML controls and Tailwind's default classes. The design system's lint refuses both: a native `<button>`, `<a>` or `<input>` where a component exists, and a class the system does not define, an arbitrary value or an opacity on a state. The server's answers name the component and the class instead.

### The cheapest rescue

Among the tasks the agent never gets right with no context and always gets right with the server, the one that costs the least shows the trade at its smallest.

<!-- site: rescue -->

## Five levers

Every change to the server pulls one of five levers:

- **Correct**: an answer the agent can act on as given, and a check of the code it writes.
- **Lean**: fewer characters per answer and fewer calls per screen, since every turn sends the whole conversation again.
- **Never refused**: no answer larger than the client accepts.
- **Agent ergonomics**: names, errors and a workflow an agent follows without guessing.
- **Tracked**: each change measured by the harness, against a budget.

<!-- site: levers -->

| Release | Lever            | Change                                                                                                                                                                   | Measured at the time                                                                                                                            |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | Lean             | [#16](https://github.com/Toniio/DSAIReadable/pull/16): concise answers by default, pagination, every tool annotated read-only                                            | A concise `get_component_specs` is 13% of the detailed one over the 59 specs; the concise `get_design_rules`, 17%                               |
| 0.1.0   | Agent ergonomics | [#17](https://github.com/Toniio/DSAIReadable/pull/17): `build_screen` asks for 4 calls plus one per component kept                                                       | It asked for 9 before the first line of code                                                                                                    |
| 0.1.0   | Agent ergonomics | [#19](https://github.com/Toniio/DSAIReadable/pull/19): an empty lookup is a tool error that lists the accepted values                                                    | Four tools answered "not found" as a success                                                                                                    |
| 0.1.0   | Correct          | [#72](https://github.com/Toniio/DSAIReadable/pull/72): an output schema for every tool, each answer validated as `structuredContent`                                     | 17 tools; 429 calls cover every input, and every answer conforms                                                                                |
| 0.1.0   | Agent ergonomics | [#73](https://github.com/Toniio/DSAIReadable/pull/73): every tool named `dsaireadable_*`, duplicates removed                                                             | 16 tools, none duplicating another                                                                                                              |
| 0.1.0   | Correct          | [#77](https://github.com/Toniio/DSAIReadable/pull/77): `dsaireadable_validate_code` runs the design system's ESLint plugin on the code an agent writes                   | Every component and pattern example run through it: 3 spec examples taught an arbitrary value it refuses                                        |
| 0.1.0   | Correct          | [#79](https://github.com/Toniio/DSAIReadable/pull/79): deprecations and the changelog, served                                                                            | 19 tools; a deprecation written once reaches the agent four ways                                                                                |
| 0.1.0   | Tracked          | [#83](https://github.com/Toniio/DSAIReadable/pull/83): the conformance harness                                                                                           | 24 tasks; the gold calibration passes stages A and B at 100%                                                                                    |
| 0.1.1   | Tracked          | [#91](https://github.com/Toniio/DSAIReadable/pull/91): the first measured runs, through Claude Code on a subscription                                                    | Conformance 89% with no context, 98% with the server; $0.91 against $5.09 for the 26 screens                                                    |
| 0.3.0   | Lean             | [#136](https://github.com/Toniio/DSAIReadable/pull/136): a smaller served context: the detailed spec cut to what a screen writes, compact JSON, shorter tool definitions | Detailed spec −50% on the recorded calls; tool definitions 10,386 → 8,315 characters; estimated median 113,325 → 90,846 input tokens per screen |
| 0.3.0   | Tracked          | [#136](https://github.com/Toniio/DSAIReadable/pull/136): the median input tokens per screen and each tool's share in every report, and a budget                          | The server alone held to 70% of 0.1.3's median, 79,327 input tokens per screen, at a conformance no lower                                       |
| 0.3.0   | Lean             | [#137](https://github.com/Toniio/DSAIReadable/pull/137): the build skill reads concise specs first                                                                       | Estimated −15 to −20% per screen on top of #136, for the runs with the skill                                                                    |
| 0.3.0   | Never refused    | [#141](https://github.com/Toniio/DSAIReadable/pull/141): no answer over 40,000 characters                                                                                | Claude Code refused 19 answers in three passes; the unfiltered detailed rules went from 73,517 to 36,879 characters                             |
| 0.3.0   | Lean             | [#145](https://github.com/Toniio/DSAIReadable/pull/145): the build skill removed                                                                                         | On edits, 23 of 24 pass without it and 21 of 24 with it, at a median 35,468 against 59,206 input tokens                                         |
| 0.3.0   | Tracked          | [#152](https://github.com/Toniio/DSAIReadable/pull/152): the audit of the 0.3.0 release                                                                                  | Conformance 100% with the server, 90.4% with no context; budget not met, the unfiltered detailed rules 51% of the cost in its first pass        |

## What's next

At the latest version, one answer makes up the largest share of what the server sends: the detailed `dsaireadable_get_design_rules`, which agents ask for without a category in most sessions ([#152](https://github.com/Toniio/DSAIReadable/pull/152)), and which arrives whole since #141. It weighs most on the median input tokens per screen, still over the budget the harness tracks.

<!-- site: next -->

The next levers are that answer, and a hosted server, which is on the backlog.
