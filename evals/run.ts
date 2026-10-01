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
 *   npm run evals -- --generator replay --from <dir> # score screens written elsewhere (<dir>/<task>.tsx)
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
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import * as prettier from "prettier"

import { scoreA11y } from "./lib/a11y"
import {
  passesA,
  passesB,
  summarize,
  toMarkdown,
  type RunReport,
  type TaskReport,
} from "./lib/report"
import { scoreStatic } from "./lib/static"
import {
  designSystemImports,
  goldScreen,
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
}

type Generator = (task: Task) => Promise<Generated>

function goldGenerator(): Generator {
  return async (task) => ({ code: goldScreen(ROOT, task) })
}

function replayGenerator(dir: string): Generator {
  return async (task) => {
    const file = resolve(dir, `${task.id}.tsx`)
    return { code: existsSync(file) ? readFileSync(file, "utf-8") : null }
  }
}

async function generatorFor(name: string): Promise<Generator> {
  if (name === "gold") return goldGenerator()
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
  throw new Error(`unknown generator "${name}": gold, replay or claude`)
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
    const { code, metrics } = await generate(task)
    console.log(code === null ? "no output" : "written")
    reports.set(task.id, { id: task.id, generated: code !== null, metrics })
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
  const report: RunReport = {
    label: options.label,
    date: new Date().toISOString().slice(0, 10),
    generator: options.generator,
    ...(options.generator === "claude" && {
      model: option("model") ?? "claude-opus-5-5",
      context: option("context") === "none" ? "none" : "mcp",
      skills: skillsOption(),
    }),
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
    summary: summarize(tasks, options.a11y),
    tasks,
  }
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
  const tasks = loadTasks(ROOT)
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
    `✅ evals self-test: the ${gold.tasks.length} gold screens pass stages A and B; the ${declared.size} fixtures fail exactly what they declare.`
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
