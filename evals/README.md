# Conformance harness

How well does an agent build screens with this design system? No public
benchmark measures that: Design2Code and WebGen-Bench score visual and
functional fidelity, not the respect of a given system. This harness does, in
one command.

A **generator** answers the 26 reference tasks of [`tasks.json`](./tasks.json)
with one screen each: a TSX module whose default export renders the screen.
Each prompt asks for a screen the way a product team would, and names no
component. Each task points at its **gold standard**, the `## Code example` of a
page pattern (`specs/patterns/`) or a component spec (`specs/components/`): the
code the design system tells agents to follow.

Every screen is scored in three stages:

| Stage                | Checks                                                                                                                                                                                                                                                                                                       | Needs               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **A. Deterministic** | TypeScript against the real components; ESLint with `@dsaireadable/eslint-plugin`'s `recommended` config, its findings counted by family (native elements, external UI imports, off-system classes and raw values, inline SVG, deprecations); the share of the gold standard's design-system modules it uses | nothing             |
| **B. Accessibility** | Rendered in headless Chromium with `styles/globals.css`: zero axe violation (WCAG 2.2 A and AA) in light and dark, a focus indicator on every tab stop — the component tests' own checks (`tests/axe.ts`, `tests/focus.ts`)                                                                                  | Chromium            |
| **C. Rubric**        | A model grades component choice, variants, hierarchy and copy from 1 to 5 against the gold standard                                                                                                                                                                                                          | `ANTHROPIC_API_KEY` |

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

`--skills all` (or `--skills dsaireadable-build,dsaireadable-ui-guard`) gives
the agent the skills of [`skills/`](../skills/) the way a client does: each
skill's name and description in the system prompt, and a `read_skill_file`
tool that reads its `SKILL.md`, then the files it names. The report counts
those reads like the MCP calls, so a run shows whether the skill triggered.

The `skills` suite of `tasks.json` holds the twelve tasks the skills are
measured on: ten screens to build from the page patterns, and two changes to an
existing screen (`base`: the file the agent starts from, given with the
prompt). A measurement compares the same model and context with and without
the skills, on at least two models:

```bash
npm run evals -- --generator claude --model claude-sonnet-5-5 --suite skills --record
npm run evals -- --generator claude --model claude-sonnet-5-5 --suite skills --skills all --record
```

In CI, the Evals workflow takes `skills` (`none`, `with`, `both`) and `suite`.

## The harness's own test

`npm run evals:test` proves the scorer, without a model:

- the 26 gold screens pass stages A and B — otherwise the scorer is wrong, or a
  spec example is, and the example is fixed in its spec;
- each screen of [`fixtures/`](./fixtures/) fails exactly the checks its first
  line declares (`// fails: compiles, lint:external-imports, renders`), so a
  check that stops catching anything fails here.

## Adding a task

Add it to `tasks.json`: an `id`, the `prompt` as a product team would write it,
and the `gold` it is scored against (`pattern` or `component`; `render` mounts
a pattern example whose export takes props). A change to an existing screen
also names its `base`, a file of [`bases/`](./bases/): the gold minus what the
prompt asks to add. Then `npm run evals:test`: the
gold must pass, which also proves the example works.
