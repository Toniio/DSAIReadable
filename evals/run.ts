/**
 * The design-system conformance harness: a generator answers the reference
 * tasks of `evals/tasks.json` with one screen each, then every screen is
 * scored in three stages (evals/README.md):
 *
 *   A. deterministic — TypeScript, the design system's ESLint plugin, the gold
 *      components used;
 *   B. accessibility — rendered in headless Chromium, axe light and dark, a
 *      focus indicator on every tab stop;
 *   C. rubric — a model grades component choice, variants, hierarchy and copy
 *      against the gold standard (needs ANTHROPIC_API_KEY).
 *
 *   npm run evals                                   # gold calibration: the scorer against the specs' own examples
 *   npm run evals -- --generator replay --from <dir> # score screens written elsewhere (<dir>/<task>.tsx, and
 *                                                   # <task>.metrics.json and run.json when evals:generate wrote them)
 *   npm run evals -- --generator claude --model claude-opus-5-5 [--context mcp|none] [--skills all]
 *   npm run evals:test                              # the harness's own test: gold passes, fixtures fail
 *
 * Options: --tasks a,b · --suite skills (a named subset of tasks.json) ·
 * --label name · --record (keeps the report in evals/history/) · --no-a11y ·
 * --no-rubric.
 */

import { execSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { homedir } from "node:os"
import { basename, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import * as prettier from "prettier"

import { scoreA11y, scrubFailure } from "./lib/a11y"
import { BUDGETS, budgetFor, compareBudget } from "./lib/budget"
import {
  median,
  passesA,
  passesB,
  summarize,
  toMarkdown,
  type GenerationMetrics,
  type RunReport,
  type SessionOutcome,
  type TaskReport,
} from "./lib/report"
import { scoreStatic } from "./lib/static"
import { addResults, readStream, toolResults } from "./lib/stream"
import {
  designSystemImports,
  goldScreen,
  allTasks,
  loadTasks,
  suiteIds,
  type Task,
} from "./lib/tasks"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const WORK = join(ROOT, "evals/.work")

function option(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i < 0 ? undefined : process.argv[i + 1]
}
const flag = (name: string) => process.argv.includes(`--${name}`)
/** The skills the claude generator can load: `--skills all` or `--skills a,b`. */
const skillsOption = () => option("skills")?.split(",") ?? []

interface Generated {
  code: string | null
  metrics?: TaskReport["metrics"]
  session?: SessionOutcome
}

type Generator = (task: Task) => Promise<Generated>

function goldGenerator(): Generator {
  return async (task) => ({ code: goldScreen(ROOT, task) })
}

/** The screen a change starts from: the `base` of a task, unchanged. */
function baseGenerator(): Generator {
  return async (task) => ({
    code: task.base ? readFileSync(join(ROOT, task.base), "utf-8") : null,
  })
}

/** What evals/generate-claude-code.ts writes in `<dir>/run.json`; a run recorded before a field existed lacks it. */
interface RunFile {
  model: string
  modelOption?: string
  context: string
  skills: string[]
  claudeCode: string
  sessionPlugins?: string[]
  maxTurns?: number
  effort?: string
  sources?: string
  designSystem?: { version: string; commit: string; dirty: boolean }
  tasks?: Record<string, Partial<SessionOutcome>>
}

function readRunFile(dir: string): RunFile | undefined {
  const file = resolve(dir, "run.json")
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf-8")) as RunFile)
    : undefined
}

/**
 * The metrics of the session that wrote a screen, `<dir>/<task>.metrics.json`.
 * Metrics written before the tools' results were measured get them from the
 * session's stream, `<dir>/<task>.jsonl`, when it is there.
 */
function replayMetrics(dir: string, id: string) {
  const file = resolve(dir, `${id}.metrics.json`)
  if (!existsSync(file)) return undefined
  const metrics = JSON.parse(readFileSync(file, "utf-8")) as GenerationMetrics
  const stream = resolve(dir, `${id}.jsonl`)
  if (!metrics.results && existsSync(stream))
    metrics.results = toolResults(readStream(readFileSync(stream, "utf-8")))
  return metrics
}

/**
 * Screens written elsewhere: `<dir>/<task>.tsx`, with the metrics of the
 * session that wrote it when there is a `<dir>/<task>.metrics.json`, and how
 * that session ended when `<dir>/run.json` says (evals/generate-claude-code.ts
 * writes all three, and the session's stream).
 */
function replayGenerator(dir: string): Generator {
  const outcomes = readRunFile(dir)?.tasks ?? {}
  return async (task) => {
    const file = resolve(dir, `${task.id}.tsx`)
    const metrics = replayMetrics(dir, task.id)
    const outcome = outcomes[task.id]
    return {
      code: existsSync(file) ? readFileSync(file, "utf-8") : null,
      ...(metrics && { metrics }),
      ...(outcome?.subtype && {
        session: {
          subtype: outcome.subtype,
          numTurns: outcome.numTurns,
          stopReason: outcome.stopReason ?? null,
          ...(outcome.costUsd !== undefined && { costUsd: outcome.costUsd }),
        },
      }),
    }
  }
}

/**
 * What evals/generate-claude-code.ts says of the screens it wrote, and of the
 * sessions that wrote them: the model, the context, and where they were
 * generated. The local path of the Claude Code install stays in run.json.
 */
function replayAbout(
  dir: string
): Pick<RunReport, "model" | "context" | "skills" | "via" | "generated"> {
  const about = readRunFile(dir)
  if (!about) return {}
  const { designSystem: ds } = about
  return {
    model: about.model,
    context: about.context,
    skills: about.skills,
    via: `claude-code ${about.claudeCode}`,
    ...(ds &&
      about.sources &&
      about.effort &&
      about.maxTurns !== undefined && {
        generated: {
          run: basename(resolve(dir)),
          commit: ds.commit,
          version: ds.version,
          dirty: ds.dirty,
          sources: about.sources,
          effort: about.effort,
          maxTurns: about.maxTurns,
          modelOption: about.modelOption ?? about.model,
          claudeCode: about.claudeCode,
          sessionPlugins: about.sessionPlugins ?? [],
        },
      }),
  }
}

async function generatorFor(name: string): Promise<Generator> {
  if (name === "gold") return goldGenerator()
  if (name === "base") return baseGenerator()
  if (name === "replay") {
    const dir = option("from")
    if (!dir) throw new Error("--generator replay needs --from <dir>")
    return replayGenerator(dir)
  }
  if (name === "claude") {
    const { claudeGenerator } = await import("./lib/claude")
    return claudeGenerator({
      root: ROOT,
      model: option("model") ?? "claude-opus-5-5",
      context: option("context") === "none" ? "none" : "mcp",
      skills: skillsOption(),
    })
  }
  throw new Error(`unknown generator "${name}": gold, base, replay or claude`)
}

/** Generates, writes and scores one run; returns its report. */
async function run(options: {
  label: string
  generator: string
  tasks: Task[]
  a11y: boolean
  rubric: boolean
}): Promise<RunReport> {
  const generate = await generatorFor(options.generator)
  const dir = join(WORK, options.label)
  const screensDir = join(dir, "screens")
  const from = options.generator === "replay" ? option("from") : undefined
  if (from && !relative(dir, resolve(from)).startsWith(".."))
    throw new Error(
      `--from ${from} is inside evals/.work/${options.label}, which the run deletes first: give the run another --label`
    )
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(screensDir, { recursive: true })

  const reports = new Map<string, TaskReport>()
  const screens = new Map<string, string>()
  const expected = new Map<string, string[]>()
  const imported = new Map<string, string[]>()
  const golds = new Map<string, string>()
  for (const task of options.tasks) {
    const gold = goldScreen(ROOT, task)
    golds.set(task.id, gold)
    expected.set(task.id, designSystemImports(gold))
    process.stdout.write(`  ${task.id}… `)
    const { code, metrics, session } = await generate(task)
    console.log(code === null ? "no output" : "written")
    reports.set(task.id, {
      id: task.id,
      generated: code !== null,
      metrics,
      session,
    })
    if (code === null) continue
    const file = join(screensDir, `${task.id}.tsx`)
    writeFileSync(file, code)
    screens.set(task.id, file)
    imported.set(task.id, designSystemImports(code))
  }

  if (screens.size > 0) {
    console.log("Stage A: TypeScript, ESLint, gold components…")
    for (const [id, result] of await scoreStatic(
      ROOT,
      screens,
      expected,
      imported
    ))
      reports.get(id)!.static = result
    if (options.a11y) {
      console.log("Stage B: Chromium, axe, focus…")
      for (const [id, result] of scoreA11y(ROOT, screensDir, [
        ...screens.keys(),
      ]))
        reports.get(id)!.a11y = result
    }
    if (options.rubric) {
      console.log("Stage C: rubric…")
      const { gradeRubric } = await import("./lib/claude")
      for (const task of options.tasks) {
        const file = screens.get(task.id)
        if (file)
          reports.get(task.id)!.rubric = await gradeRubric({
            task,
            screen: readFileSync(file, "utf-8"),
            gold: golds.get(task.id)!,
          })
      }
    }
  }

  const tasks = options.tasks.map((t) => reports.get(t.id)!)
  const about = from ? replayAbout(from) : {}
  const head: Omit<RunReport, "tasks"> = {
    label: options.label,
    date: new Date().toISOString().slice(0, 10),
    generator: options.generator,
    ...(options.generator === "claude" && {
      model: option("model") ?? "claude-opus-5-5",
      context: option("context") === "none" ? "none" : "mcp",
      skills: skillsOption(),
    }),
    ...about,
    designSystem: {
      version: (
        JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")) as {
          version: string
        }
      ).version,
      commit: execSync("git rev-parse HEAD", {
        cwd: ROOT,
        encoding: "utf-8",
      }).trim(),
    },
    summary: summarize(tasks, options.a11y, about.generated?.maxTurns),
  }
  // The budget reads before the tasks in report.json.
  const budget = budgetFor(ROOT, { ...head, tasks })
  const report: RunReport = { ...head, ...(budget && { budget }), tasks }
  writeFileSync(
    join(dir, "report.json"),
    JSON.stringify(report, null, 2) + "\n"
  )
  writeFileSync(join(dir, "report.md"), toMarkdown(report))
  return report
}

/**
 * The harness's own test. The gold standard must pass stages A and B — else
 * the scorer is wrong, or a spec example is — and each fixture of
 * `evals/fixtures/` must fail exactly the checks its first line declares
 * (`// fails: compiles, lint:native-elements, axe`), so a check that stops
 * catching anything fails here.
 */
async function selfTest() {
  const errors: string[] = []
  const tasks = allTasks(ROOT)
  const gold = await run({
    label: "self-test-gold",
    generator: "gold",
    tasks,
    a11y: true,
    rubric: false,
  })
  for (const t of gold.tasks) {
    if (!passesA(t.static) || t.static?.coverage !== 1)
      errors.push(
        `gold ${t.id} fails stage A:\n${[...(t.static?.typeErrors ?? []), ...(t.static?.lintErrors ?? [])].join("\n")}`
      )
    if (!passesB(t.a11y))
      errors.push(`gold ${t.id} fails stage B:\n${t.a11y?.failures.join("\n")}`)
  }
  // A change starts from a screen that follows the system: its base passes
  // stages A and B too, short of the gold modules the prompt asks to add.
  const bases = await run({
    label: "self-test-bases",
    generator: "base",
    tasks: tasks.filter((t) => t.base && existsSync(join(ROOT, t.base))),
    a11y: true,
    rubric: false,
  })
  for (const t of bases.tasks) {
    if (!passesA(t.static))
      errors.push(
        `base ${t.id} fails stage A:\n${[...(t.static?.typeErrors ?? []), ...(t.static?.lintErrors ?? [])].join("\n")}`
      )
    if (!passesB(t.a11y))
      errors.push(`base ${t.id} fails stage B:\n${t.a11y?.failures.join("\n")}`)
  }

  const fixturesDir = join(ROOT, "evals/fixtures")
  const fixtures = readdirSync(fixturesDir).filter((f) => f.endsWith(".tsx"))
  const declared = new Map(
    fixtures.map((f) => {
      const head = readFileSync(join(fixturesDir, f), "utf-8").split("\n")[0]
      const fails = head.match(/^\/\/ fails: (.+)$/)?.[1]
      if (!fails)
        throw new Error(`evals/fixtures/${f}: no "// fails: …" first line`)
      return [f.slice(0, -".tsx".length), fails.split(/,\s*/).sort()]
    })
  )
  const fixtureRun = await run({
    label: "self-test-fixtures",
    generator: "replay",
    tasks: tasks.filter((t) => declared.has(t.id)),
    a11y: true,
    rubric: false,
  }).catch((e: unknown) => {
    throw e
  })
  for (const t of fixtureRun.tasks) {
    const failed = [
      ...(t.static && !t.static.compiles ? ["compiles"] : []),
      ...Object.keys(t.static?.lintByFamily ?? {}).map((f) => `lint:${f}`),
      ...(t.a11y && !t.a11y.renders ? ["renders"] : []),
      ...(t.a11y && t.a11y.renders && !t.a11y.axe ? ["axe"] : []),
      ...(t.a11y && t.a11y.renders && !t.a11y.focus ? ["focus"] : []),
    ].sort()
    const want = declared.get(t.id)!
    if (failed.join(",") !== want.join(","))
      errors.push(
        `fixture ${t.id}: declares it fails [${want.join(", ")}], fails [${failed.join(", ")}]`
      )
  }
  // evals/fixtures/faq.metrics.json stands for what evals:generate writes.
  if (fixtureRun.tasks.find((t) => t.id === "faq")?.metrics?.turns !== 3)
    errors.push(
      "evals/fixtures/faq.metrics.json: the replay generator did not read it"
    )
  // evals/fixtures/run.json stands for what evals:generate writes next to them:
  // where the screens were generated, and how each session ended.
  const generated = fixtureRun.generated
  if (
    generated?.run !== "fixtures" ||
    generated.commit !== "abcdef1234567890abcdef1234567890abcdef12" ||
    generated.version !== "0.0.0-fixture" ||
    generated.dirty !== false ||
    generated.sources !== "0123456789abcdef" ||
    generated.effort !== "high" ||
    generated.maxTurns !== 25 ||
    generated.modelOption !== "sonnet" ||
    generated.claudeCode !== "2.1.285" ||
    generated.sessionPlugins.join() !== "cc-plugin-agents-md@builtin"
  )
    errors.push(
      `evals/fixtures/run.json: the report did not carry its provenance (generated: ${JSON.stringify(generated)})`
    )
  const faqSession = fixtureRun.tasks.find((t) => t.id === "faq")?.session
  if (
    faqSession?.subtype !== "success" ||
    faqSession.numTurns !== 7 ||
    faqSession.stopReason !== "end_turn" ||
    faqSession.costUsd !== 0.2131922
  )
    errors.push(
      `evals/fixtures/run.json: the faq task did not carry how its session ended (${JSON.stringify(faqSession)})`
    )
  // faq.jsonl stands for the stream evals:generate keeps: the turns of the
  // main loop (a subagent's lines left out), the context each one sent, and
  // what each call sent back, per tool and per response_format. The metrics
  // next to it predate that measure, so the replay reads the stream.
  const faqStream = readStream(
    readFileSync(join(fixturesDir, "faq.jsonl"), "utf-8")
  )
  if (
    faqStream.map((t) => t.context).join() !== "300,400,500" ||
    faqStream.map((t) => t.ownChars).join() !== "89,30,58" ||
    faqStream.flatMap((t) => t.calls.map((c) => c.tool)).join() !==
      "dsaireadable_get_component_specs,Skill,dsaireadable_get_component_specs"
  )
    errors.push(
      `evals/fixtures/faq.jsonl: readStream reads ${JSON.stringify(faqStream)}`
    )
  // A result over Claude Code's output limit reaches the agent as an error:
  // the stream records that error, and evals:context --reserve weighs the
  // call apart rather than as the answer the agent never read.
  const refusedStream = readStream(
    [
      {
        type: "assistant",
        message: {
          id: "msg_1",
          content: ["toolu_1", "toolu_2"].map((id) => ({
            type: "tool_use",
            id,
            name: "mcp__dsaireadable__dsaireadable_get_design_rules",
            input: { response_format: "detailed" },
          })),
          usage: { input_tokens: 100 },
        },
      },
      {
        type: "user",
        message: {
          content: [
            {
              type: "tool_result",
              tool_use_id: "toolu_1",
              content:
                "Error: result (73,517 characters) exceeds maximum allowed tokens. Output has been saved to /tmp/rules.txt.",
            },
            {
              type: "tool_result",
              tool_use_id: "toolu_2",
              content: [{ type: "text", text: '{"rules":[]}' }],
            },
          ],
        },
      },
    ]
      .map((line) => JSON.stringify(line))
      .join("\n")
  )
  if (
    refusedStream[0]?.calls.map((c) => c.refused === true).join() !==
    "true,false"
  )
    errors.push(
      `readStream does not flag the result Claude Code refused for its size (${JSON.stringify(refusedStream)})`
    )
  const faqResults = JSON.stringify(
    fixtureRun.tasks.find((t) => t.id === "faq")?.metrics?.results
  )
  if (
    faqResults !==
    JSON.stringify({
      "dsaireadable_get_component_specs:detailed": { calls: 1, chars: 70 },
      // "Launching skill: …", then the SKILL.md Claude Code sends after it.
      Skill: { calls: 1, chars: 90 },
      dsaireadable_get_component_specs: { calls: 1, chars: 20 },
    })
  )
    errors.push(
      `evals/fixtures/faq.jsonl: the replay did not measure what each tool sent back (${faqResults})`
    )
  // faq.metrics.json holds two MCP calls and one Skill call.
  const generation = fixtureRun.summary.generation
  if (generation?.mcpCalls !== 2 || generation.otherCalls !== 1)
    errors.push(
      `the report counts ${generation?.mcpCalls} MCP and ${generation?.otherCalls} other tool calls, not 2 and 1: only dsaireadable_* tools are MCP calls`
    )
  // sign-in used its 25 turns and delete-project stopped on error_max_turns.
  if (generation?.turnCapReached !== 2)
    errors.push(
      `the report counts ${generation?.turnCapReached} tasks at the turn cap, not 2`
    )
  if (
    median([3, 1, 2]) !== 2 ||
    median([1, 2, 10, 20]) !== 6 ||
    JSON.stringify(
      addResults(
        { a: { calls: 1, chars: 10 } },
        { a: { calls: 2, chars: 5 }, b: { calls: 1, chars: 1 } }
      )
    ) !==
      JSON.stringify({ a: { calls: 3, chars: 15 }, b: { calls: 1, chars: 1 } })
  )
    errors.push("median() or addResults() miscounts several tasks")
  if (generation?.medianInputTokens !== 1200 || generation.medianTurns !== 3)
    errors.push(
      `the report's median screen costs ${generation?.medianInputTokens} input tokens in ${generation?.medianTurns} turns, not 1200 in 3`
    )
  const markdown = toMarkdown(fixtureRun)
  for (const text of [
    "generated at `abcdef1`",
    "sources `0123456789abcdef`",
    "effort high",
    "25 turns max",
    "2 MCP tool calls",
    "1 other tool call",
    "2 tasks reached the 25-turn cap",
    "**Cost: 1,200 input tokens per screen**, in 3 turns",
    "What the tools sent back: 0.2 KiB",
    "| `dsaireadable_get_component_specs` | detailed | 1 | 0.1 KiB | 39 % |",
  ])
    if (!markdown.includes(text))
      errors.push(`the report header or generation line lacks "${text}"`)

  // A budget compares a run with its baseline's condition only, and holds it
  // to the token ceiling at a conformance no lower than the baseline's.
  const withMedian = (inputTokens: number, conformance: number) => ({
    ...fixtureRun,
    summary: { ...fixtureRun.summary, conformance },
    tasks: fixtureRun.tasks.map((t) =>
      t.metrics ? { ...t, metrics: { ...t.metrics, inputTokens } } : t
    ),
  })
  const budget = { baseline: "fixture", tokens: 0.7 }
  const verdicts = [
    compareBudget(fixtureRun, withMedian(2000, 0.2), budget),
    compareBudget(fixtureRun, withMedian(1500, 0.2), budget),
    compareBudget(fixtureRun, withMedian(2000, 0.99), budget),
    compareBudget(fixtureRun, { ...withMedian(2000, 0), model: "x" }, budget),
    // Another Claude Code release is the same condition.
    compareBudget(
      { ...fixtureRun, via: "claude-code 9.9.9" },
      withMedian(2000, 0.2),
      budget
    ),
  ]
  if (
    verdicts[0]?.target !== 1400 ||
    verdicts[0].medianInputTokens !== 1200 ||
    !verdicts[0].met ||
    verdicts[1]?.met !== false ||
    verdicts[2]?.met !== false ||
    verdicts[3] !== undefined ||
    verdicts[4]?.met !== true
  )
    errors.push(
      `compareBudget: ${JSON.stringify(verdicts)} (met under the ceiling, missed over it or at a lower conformance, none for another model)`
    )
  if (
    !toMarkdown({ ...fixtureRun, budget: verdicts[0] }).includes(
      "Budget against `fixture`: 1,200 input tokens per screen for at most 1,400 (-30 % of 2,000) ✅"
    )
  )
    errors.push("the report does not print the budget line")
  for (const { baseline, tokens } of BUDGETS) {
    const file = join(ROOT, "evals/history", `${baseline}.json`)
    if (!existsSync(file) || !(tokens > 0 && tokens < 1)) {
      errors.push(
        `evals/lib/budget.ts: the baseline "${baseline}" is not a run of evals/history/, or ${tokens} is not a share`
      )
      continue
    }
    // A run of the baseline's own condition, from a later Claude Code, gets
    // the budget's verdict.
    const recorded = JSON.parse(readFileSync(file, "utf-8")) as RunReport
    if (
      budgetFor(ROOT, { ...recorded, via: "claude-code 9.9.9" })?.baseline !==
      baseline
    )
      errors.push(
        `evals/lib/budget.ts: a run of the condition of "${baseline}" gets no verdict`
      )
  }
  // A failure message keeps its assertion, not the path of the machine that ran it.
  const failures = JSON.stringify(fixtureRun.tasks.map((t) => t.a11y))
  for (const [what, found] of [
    ["the repository path", failures.includes(ROOT)],
    ["a home folder", failures.includes(homedir())],
    ["a stack frame", /\\n\s+at /.test(failures)],
    ["a dev server port", /localhost:\d/.test(failures)],
    ["a Vite cache token", /browserv=|[?&]v=/.test(failures)],
  ] as const)
    if (found) errors.push(`a stage B failure of the fixtures holds ${what}`)
  const scrubbed = scrubFailure(
    [
      "AssertionError: dark color-contrast: button",
      `    at http://localhost:5173${ROOT}evals/a11y/screens.test.tsx?import&browserv=1790966891861:33:45`,
      `Failed to fetch http://localhost:5173/evals/.work/x/screens/a.tsx?v=dff84207 in ${homedir()}/notes`,
    ].join("\n"),
    ROOT
  )
  if (
    scrubbed !==
    [
      "AssertionError: dark color-contrast: button",
      "Failed to fetch http://localhost/evals/.work/x/screens/a.tsx in ~/notes",
    ].join("\n")
  )
    errors.push(`scrubFailure leaves "${scrubbed}"`)
  // The history is public: no recorded report may name the local user.
  for (const file of readdirSync(join(ROOT, "evals/history"))) {
    const text = readFileSync(join(ROOT, "evals/history", file), "utf-8")
    if (
      text.includes(homedir()) ||
      /\/Users\/[^\s/]+\/|[A-Za-z]:\\Users\\/.test(text)
    )
      errors.push(`evals/history/${file} holds a local path`)
  }
  for (const task of tasks)
    if (task.base && !existsSync(join(ROOT, task.base)))
      errors.push(`${task.id}: its base ${task.base} does not exist`)
  for (const [suite, ids] of Object.entries(suiteIds(ROOT)))
    for (const id of ids)
      if (!tasks.some((t) => t.id === id))
        errors.push(`suite "${suite}" names "${id}", not a task`)
  for (const id of declared.keys())
    if (!tasks.some((t) => t.id === id))
      errors.push(
        `evals/fixtures/${id}.tsx: no task "${id}" in evals/tasks.json`
      )

  if (errors.length > 0) {
    console.error(
      `❌ evals self-test: ${errors.length} error(s):\n\n${errors.join("\n\n")}`
    )
    process.exit(1)
  }
  console.log(
    `✅ evals self-test: the ${gold.tasks.length} gold screens and the ${bases.tasks.length} bases pass stages A and B; the ${declared.size} fixtures fail exactly what they declare.`
  )
}

async function main() {
  if (flag("self-test")) {
    // The fixtures are read by the replay generator.
    process.argv.push("--from", join(ROOT, "evals/fixtures"))
    return selfTest()
  }
  const generator = option("generator") ?? "gold"
  const tasks = loadTasks(ROOT, option("tasks")?.split(","), option("suite"))
  const label =
    option("label") ??
    (generator === "claude"
      ? `${option("model") ?? "claude-opus-5-5"}-${option("context") ?? "mcp"}${skillsOption().length ? "-skills" : ""}`
      : generator)
  const rubric =
    !flag("no-rubric") &&
    generator !== "gold" &&
    !!process.env.ANTHROPIC_API_KEY
  const report = await run({
    label,
    generator,
    tasks,
    a11y: !flag("no-a11y"),
    rubric,
  })
  const markdown = toMarkdown(report)
  console.log(`\n${markdown}`)
  console.log(`Report: evals/.work/${label}/report.{json,md}`)
  if (flag("record")) {
    const base = join(ROOT, "evals/history", `${report.date}-${label}`)
    mkdirSync(join(ROOT, "evals/history"), { recursive: true })
    writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n")
    // Committed: formatted as Prettier checks every Markdown file.
    const options = (await prettier.resolveConfig(`${base}.md`)) ?? {}
    writeFileSync(
      `${base}.md`,
      await prettier.format(markdown, { ...options, parser: "markdown" })
    )
    console.log(`Recorded: evals/history/${report.date}-${label}.{json,md}`)
  }
}

await main()
