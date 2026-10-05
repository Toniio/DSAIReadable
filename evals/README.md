# Conformance harness

How well does an agent build screens with this design system? No public
benchmark measures that: Design2Code and WebGen-Bench score visual and
functional fidelity, not the respect of a given system. This harness does, in
one command.

A **generator** answers the 26 reference tasks of [`tasks.json`](./tasks.json)
(its default run) with one screen each: a TSX module whose default export renders the screen.
Each prompt asks for a screen the way a product team would, and names no
component. Each task points at its **gold standard**, the `## Code example` of a
page pattern (`specs/patterns/`) or a component spec (`specs/components/`): the
code the design system tells agents to follow.

Every screen is scored in three stages:

| Stage                | Checks                                                                                                                                                                                                                                                                                                                                                                                   | Needs               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **A. Deterministic** | TypeScript against the real components; ESLint with `@dsaireadable/eslint-plugin`'s `recommended` config, its findings counted by family (native elements, external UI imports, off-system classes and raw values, inline SVG, deprecations); the share of the gold standard's design-system modules it uses                                                                             | nothing             |
| **B. Accessibility** | Rendered in headless Chromium with `styles/globals.css`: zero axe violation (WCAG 2.2 A and AA) in light and dark, a focus indicator with a part at 3:1 against what it is drawn on on every tab stop, in light and dark (a `ring-ring/50` halo alone does not count, nor a ring on an element that paints nothing) — the component tests' own checks (`tests/axe.ts`, `tests/focus.ts`) | Chromium            |
| **C. Rubric**        | A model grades component choice, variants, hierarchy and copy from 1 to 5 against the gold standard                                                                                                                                                                                                                                                                                      | `ANTHROPIC_API_KEY` |

A task passes stage A when it compiles and lints clean (the coverage is graded,
not a gate: another valid component is no error), and stage B when it renders
with no axe violation and a visible focus everywhere. The **conformance** score
is the mean of the stages that ran.

## Commands

```bash
npm run evals                                       # the gold standard through the scorer: the calibration
npm run evals -- --generator replay --from <dir>    # score screens written elsewhere, <dir>/<task-id>.tsx
npm run evals -- --generator claude --model claude-opus-5-5 --context mcp   # an agent connected to the MCP server
npm run evals -- --generator claude --model claude-opus-5-5 --context none  # the same agent with no context: the baseline
npm run evals -- --generator claude --suite skills --skills all              # the agent skills of skills/, on their suite
npm run evals:generate -- --model sonnet --condition mcp --label <label>   # screens from Claude Code on a subscription: no API key
npm run evals:context -- evals/.work/claude-code/<label> [--reserve]          # where a run's tokens went, per tool
npm run evals:test                                  # the harness's own test, in npm run check and CI
```

Options: `--tasks sign-in,faq` runs a subset, `--suite skills` a named one, `--label <name>` names the run,
`--record` keeps its report in [`history/`](./history/), `--no-a11y` skips
stage B, `--no-rubric` skips stage C.

Each run writes `evals/.work/<label>/`: the screens, `report.json` and
`report.md`. The JSON is what [`history/`](./history/) keeps, one file per
recorded run, so the score can be followed from a release to the next.

## The Claude generator

`--generator claude` runs an agent on the Claude API: the task as the user
message, the design system's MCP server (started over stdio, as `npx` runs it)
as its tools with `--context mcp`, none with `--context none`. It records per
task the turns, the MCP tool calls by name, the tool errors and the tokens: the
same runs measure the tools themselves, and show which descriptions an agent
misreads. The measured model is the one named: no fallback to another model, so
a refusal counts as a task with no output.

It needs `ANTHROPIC_API_KEY` in the environment. Never paste a key in a
conversation or a file of this repository:

- **locally**: export it in your shell, or run `ant auth login`;
- **in a Claude Code cloud session**: add it to the environment's secrets;
- **in CI**: add the `ANTHROPIC_API_KEY` repository secret, then run the
  [Evals workflow](../.github/workflows/evals.yml) by hand (Actions → Evals →
  Run workflow). It runs only when started by hand, since each run costs API
  credits, and uploads the reports as an artifact.

The rubric of stage C uses the same key; `EVALS_JUDGE_MODEL` changes its model.

## Measuring the agent skills

`--skills all` (or `--skills dsaireadable-ui-guard`) gives
the agent the skills of [`skills/`](../skills/) the way a client does: each
skill's name and description in the system prompt, and a `read_skill_file`
tool that reads its `SKILL.md`, then the files it names. The report counts
those reads like the MCP calls, so a run shows whether the skill triggered.

The `skills` suite of `tasks.json` holds the eighteen tasks the skills are
measured on: ten screens to build from the page patterns, and eight changes
to an existing screen (`base`: the file the agent starts from, given with the
prompt). The removed `dsaireadable-build` skill was last measured on it
(`history/2026-10-05-0.3.0-suite-skills-*`).
Six of those changes are out of the default run (`"default": false`), so the
26 tasks the recorded runs compare stay the same. A measurement compares the same model and context with and without
the skills, on at least two models:

```bash
npm run evals -- --generator claude --model claude-sonnet-5-5 --suite skills --record
npm run evals -- --generator claude --model claude-sonnet-5-5 --suite skills --skills all --record
```

In CI, the Evals workflow takes `skills` (`none`, `with`, `both`) and `suite`.

## Measuring without an API key

`npm run evals:generate` has Claude Code answer the tasks in print mode
(`claude -p`), on the subscription it is logged in with, with the claude
generator's instructions appended to Claude Code's own system prompt. The
replay generator then scores the screens on stages A and B; stage C needs the
API and does not run.

| `--condition` | MCP server                                 | Skills                                                 |
| ------------- | ------------------------------------------ | ------------------------------------------------------ |
| `none`        | no                                         | no                                                     |
| `mcp`         | `dsaireadable`, started from this checkout | no                                                     |
| `mcp-skills`  | `dsaireadable`, started from this checkout | the skills of `skills/`, copied into `.claude/skills/` |

Each task runs in an empty folder outside the repository. The session has no
built-in tool except `Skill` and `Read` under `mcp-skills`, and 25 turns at
most. It loads none of your own Claude Code configuration (user settings,
plugins, hooks, `CLAUDE.md`, auto memory, MCP servers, claude.ai connectors)
and starts from an environment built from an allowlist, without
`ANTHROPIC_*` variables; managed settings still apply. Before a task counts,
the script checks the session's init message — no API key, no plugin, the
expected server, tools and skills — and stops the run otherwise. Run it from a
plain terminal, not from inside a Claude Code session, and start with one
task:

```bash
npm run evals:generate -- --model sonnet --condition mcp-skills --tasks sign-in --label smoke
```

`--dry-run` prints the command and starts the MCP server through the same
launch, with no session. The script was checked against Claude Code 2.1.285
(`--max-turns` is hidden from its `--help`, but defined) and warns on another
version; `--claude <path>` picks the install. Under `mcp-skills`, Claude Code's
bundled skills are listed next to the one of `skills/`: no flag hides them
alone, so `run.json` records the skills the sessions saw, and the plugins built
into Claude Code (`cc-plugin-diff@builtin`…), which the check accepts while it
refuses any other plugin.

The output is `evals/.work/claude-code/<label>/`: per task `<task>.tsx`,
`<task>.metrics.json` and the session's stream `<task>.jsonl`, plus `run.json`
with the exact model id and Claude Code version. A task already measured is
skipped, so after a usage limit the same command resumes: it exits with 2 when
it stops on one, and with 3 when a task is left to rerun (a timeout, an error of
the session). It refuses to resume when the model, Claude Code, or the sources
the sessions read (the MCP server, its context, the skills, the instructions)
changed since the run started. Then score and record the run:

```bash
npm run evals -- --generator replay --from evals/.work/claude-code/<label> --label <label> --no-rubric --record
```

**Passes.** A model does not build a screen the same way twice, so one run
cannot tell a real gap from noise. Generate each condition several times from
the same checkout, each pass under its own label (`<label>-r1` to `-r3`), and
record every pass. The report keeps the folder its screens were written in
(`generated.run`): the Audits page of the site counts each pass as its own
screens, with a row per pass and their mean in the chart. Compare two
conditions task by task, with a test for paired outcomes (McNemar's): with 26
tasks, a gap of a few tasks is within the noise.

The replay reads `<task>.metrics.json` and `run.json`, so the report carries
the turns, the MCP calls by tool, the tool errors and the tokens, the model and
`via claude-code <version>`. These runs compare with each other, not with the
claude generator's: the system prompt and the tools differ.

The report also says where the screens were generated, because the checkout
that scores a run is rarely the one that generated it. `design system <version>
(<commit>)` in its header is the scoring checkout; `generated at <commit> ·
sources <hash> · effort · turns max` is the one the sessions ran from (the
`generated` field of `report.json`, with the Claude Code version, the `--model`
option and the plugins the sessions listed), and each task keeps how its
session ended (`session`: `subtype`, `numTurns`, `stopReason`). The Generation
line counts the calls to the `dsaireadable_*` MCP tools apart from the others
(`Skill`, `Read`, `read_skill_file`), and the tasks whose session used all its
turns or stopped on the cap. A failure of stage B keeps its assertion only: no
stack frame, no local path, no port, so a recorded report names nobody and two
runs of one screen read the same. `npm run evals:test` fails on a recorded
report that holds a local path.

## What the context costs

Every turn sends the whole conversation again, so a tool's answer costs its
size once per turn that follows it: cutting a turn counts as much as cutting
an answer. Next to the conformance, the report gives the cost of the median
screen, in input tokens and in turns, and what each tool sent back, per tool
and per `response_format` (`—` when the call passed none). The generators
count those characters as the agent read them, a Skill call's SKILL.md
included; for a run recorded before
they did, the replay reads them from the session's stream, `<task>.jsonl`.

**The budget.** [`lib/budget.ts`](./lib/budget.ts) caps the median input
tokens per screen at a share of a recorded run's, at a conformance no lower
than that run's: a cheaper run that answers worse does not meet it. It holds
the MCP server alone, through Claude Code, to 70 % of
`2026-10-04-0.1.3-sonnet-mcp-rescored`. A report of the same condition (the
same tasks, model, context, skills, effort and turn cap, generated the same
way) prints the verdict under its cost; the conformance it compares is the
mean of the stages the recorded run ran, so a run scored with `--no-a11y`
gets no verdict.

**Where the tokens went.** `npm run evals:context` reads the streams of a
run and prints, per tool and per format, the calls, the characters sent back,
those characters times the turns after them, and the tokens that comes to
per screen, at the run's own characters per token: a least-squares fit of
each turn's growth in tokens on the results it added and on what it wrote
itself, which the next turn sends too. It reads the finished tasks only, as
the report does. `--reserve` sends
each recorded call of a `dsaireadable_*` tool again to the MCP server of this
checkout and estimates the cost of the same sessions with its answers: a
change to what the server answers can be weighed before a run measures it.
The estimate keeps the recorded turns; only a run shows what the new answers
make the agent do. A result Claude Code refused for its size ("exceeds
maximum allowed tokens") was recorded as that error, which is what the agent
read: the estimate keeps it as recorded, and a table of its own shows what
this checkout answers instead and whether Claude Code would still refuse it.

## The harness's own test

`npm run evals:test` proves the scorer, without a model:

- the gold screen of every task passes stages A and B — otherwise the scorer is
  wrong, or a spec example is, and the example is fixed in its spec;
- every `base` of [`bases/`](./bases/) passes them too, short of the gold
  modules its prompt asks to add: a change starts from a screen that follows
  the system;
- each screen of [`fixtures/`](./fixtures/) fails exactly the checks its first
  line declares (`// fails: compiles, lint:external-imports, renders`), so a
  check that stops catching anything fails here;
- the replay generator reads the metrics written next to a screen
  (`fixtures/faq.metrics.json`), and the session's stream for what each tool
  sent back (`fixtures/faq.jsonl`);
- the report prints the median cost and the tool volumes, and a budget is met
  under its ceiling only, at a conformance no lower than its baseline's.

## Adding a task

Add it to `tasks.json`: an `id`, the `prompt` as a product team would write it,
and the `gold` it is scored against (`pattern` or `component`; `render` mounts
a pattern example whose export takes props). A change to an existing screen
also names its `base`, a file of [`bases/`](./bases/): the gold minus what the
prompt asks to add. A task that only a suite runs takes `"default": false`, so
the default run, and the budgets measured on it, stay comparable. Then
`npm run evals:test`: the gold and the base must pass, which also proves the
example works.
