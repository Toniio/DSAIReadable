/**
 * The report of a run: one JSON file the history keeps and compares, and its
 * Markdown rendering for a pull request or a release note.
 */

import type { A11yResult } from "./a11y"
import type { BudgetResult } from "./budget"
import type { LintFamily, StaticResult } from "./static"
import { addResults, type ToolResults } from "./stream"

/** What the generator measured while it worked: the MCP tools in use, and what they cost. */
export interface GenerationMetrics {
  turns: number
  toolCalls: number
  toolErrors: number
  /** Every turn's input tokens, summed: each turn sends the whole conversation again. */
  inputTokens: number
  outputTokens: number
  tools: Record<string, number>
  /** The characters each tool sent back; absent from metrics written before it was measured. */
  results?: ToolResults
}

/** The tools of the design system's MCP server are named `dsaireadable_*`: any other call (Skill, Read, read_skill_file) is not one. */
const MCP_TOOL_PREFIX = "dsaireadable_"

/** Where the screens of a replayed run were generated: what `evals/generate-claude-code.ts` wrote in its run.json. */
interface GenerationProvenance {
  /**
   * The folder evals:generate wrote the screens in,
   * `evals/.work/claude-code/<run>`: two passes from one checkout differ by
   * it, a rescore of the same screens keeps it. Absent from a report
   * recorded before it was kept.
   */
  run?: string
  /** The checkout the sessions ran from, which is not always the one that scores. */
  commit: string
  version: string
  dirty: boolean
  /** A hash of what the sessions read: the MCP server, its context, the skills, the instructions. */
  sources: string
  effort: string
  maxTurns: number
  /** The `--model` the sessions were given (`sonnet`); the report's `model` is the id it resolved to. */
  modelOption: string
  claudeCode: string
  sessionPlugins: string[]
}

/** How the session of one task ended, from the result line of its stream. */
export interface SessionOutcome {
  /** `success`, or `error_max_turns` when the session stopped on its turn cap. */
  subtype: string
  numTurns?: number
  stopReason: string | null
}

export interface RubricResult {
  /** Each criterion from 1 (wrong) to 5 (what the design system asks). */
  scores: Record<string, number>
  notes: string
}

export interface TaskReport {
  id: string
  generated: boolean
  static?: StaticResult
  a11y?: A11yResult
  rubric?: RubricResult
  metrics?: GenerationMetrics
  session?: SessionOutcome
}

export interface RunReport {
  label: string
  date: string
  generator: string
  model?: string
  /** The claude generator's context: the MCP server or none, and the skills it could load. */
  context?: string
  skills?: string[]
  /** Where a replayed run was generated: `claude-code 2.1.76` for evals/generate-claude-code.ts. */
  via?: string
  /** Where a replayed run was generated, when its run.json says. */
  generated?: GenerationProvenance
  /** The checkout that scored the run. */
  designSystem: { version: string; commit: string }
  summary: Summary
  /** The cost budget of the run's condition, when evals/lib/budget.ts sets one. */
  budget?: BudgetResult
  tasks: TaskReport[]
}

interface Summary {
  tasks: number
  generated: number
  /** Stage A, deterministic: share of tasks that pass each check. */
  stageA: {
    compiles: number
    lint: number
    coverage: number
    pass: number
    lintByFamily: Partial<Record<LintFamily, number>>
  }
  /** Stage B, accessibility; null when it did not run. */
  stageB: { renders: number; axe: number; focus: number; pass: number } | null
  /** Stage C, rubric: mean score as a share of the maximum; null when it did not run. */
  stageC: { score: number; byCriterion: Record<string, number> } | null
  /** The mean of the stages that ran. */
  conformance: number
  generation:
    | (Omit<GenerationMetrics, "tools" | "toolCalls" | "results"> & {
        /** Calls to the design system's MCP tools. */
        mcpCalls: number
        /** Calls to any other tool: Skill, Read, read_skill_file. */
        otherCalls: number
        /** Tasks whose session used all its turns or stopped on the cap; null when no session outcome is known. */
        turnCapReached: number | null
        /** The median screen's input tokens and turns: the cost a budget tracks. */
        medianInputTokens: number
        medianTurns: number
        /** What the tools sent back, per tool and per response_format; null when no task measured it. */
        results: ToolResults | null
      })
    | null
}

const share = (values: boolean[]) =>
  values.length === 0 ? 0 : values.filter(Boolean).length / values.length
const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length
const round = (n: number) => Math.round(n * 1000) / 1000
export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  if (sorted.length === 0) return 0
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Coverage is graded, not a gate: another valid component choice is no error. */
export const passesA = (s?: StaticResult) => !!s && s.compiles && s.lint
export const passesB = (a?: A11yResult) => !!a && a.renders && a.axe && a.focus

export function summarize(
  tasks: TaskReport[],
  ranB: boolean,
  maxTurns?: number
): Summary {
  const lintByFamily: Partial<Record<LintFamily, number>> = {}
  for (const t of tasks)
    for (const [family, n] of Object.entries(t.static?.lintByFamily ?? {}))
      lintByFamily[family as LintFamily] =
        (lintByFamily[family as LintFamily] ?? 0) + n

  // A task with no output fails every check of every stage.
  const stageA = {
    compiles: round(share(tasks.map((t) => !!t.static?.compiles))),
    lint: round(share(tasks.map((t) => !!t.static?.lint))),
    coverage: round(mean(tasks.map((t) => t.static?.coverage ?? 0))),
    pass: round(share(tasks.map((t) => passesA(t.static)))),
    lintByFamily,
  }
  const stageB = ranB
    ? {
        renders: round(share(tasks.map((t) => !!t.a11y?.renders))),
        axe: round(share(tasks.map((t) => !!t.a11y?.axe))),
        focus: round(share(tasks.map((t) => !!t.a11y?.focus))),
        pass: round(share(tasks.map((t) => passesB(t.a11y)))),
      }
    : null
  const rubrics = tasks.filter((t) => t.rubric)
  const criteria = [
    ...new Set(rubrics.flatMap((t) => Object.keys(t.rubric!.scores))),
  ]
  const stageC =
    rubrics.length > 0
      ? {
          score: round(
            mean(
              tasks.map(
                (t) =>
                  (t.rubric ? mean(Object.values(t.rubric.scores)) - 1 : 0) / 4
              )
            )
          ),
          byCriterion: Object.fromEntries(
            criteria.map((c) => [
              c,
              round(
                mean(tasks.map((t) => ((t.rubric?.scores[c] ?? 1) - 1) / 4))
              ),
            ])
          ),
        }
      : null
  const metrics = tasks.flatMap((t) => (t.metrics ? [t.metrics] : []))
  const sum = (
    key: keyof Omit<GenerationMetrics, "tools" | "toolCalls" | "results">
  ) => metrics.reduce((a, m) => a + m[key], 0)
  const calls = metrics.flatMap((m) => Object.entries(m.tools))
  const mcpCalls = calls
    .filter(([name]) => name.startsWith(MCP_TOOL_PREFIX))
    .reduce((a, [, n]) => a + n, 0)
  const sessions = tasks.flatMap((t) => (t.session ? [t.session] : []))
  const measured = metrics.filter((m) => m.results)
  return {
    tasks: tasks.length,
    generated: tasks.filter((t) => t.generated).length,
    stageA,
    stageB,
    stageC,
    conformance: round(
      mean([
        stageA.pass,
        ...(stageB ? [stageB.pass] : []),
        ...(stageC ? [stageC.score] : []),
      ])
    ),
    generation:
      metrics.length > 0
        ? {
            turns: sum("turns"),
            mcpCalls,
            otherCalls: calls.reduce((a, [, n]) => a + n, 0) - mcpCalls,
            toolErrors: sum("toolErrors"),
            inputTokens: sum("inputTokens"),
            outputTokens: sum("outputTokens"),
            turnCapReached:
              sessions.length > 0
                ? sessions.filter(
                    (s) =>
                      s.subtype === "error_max_turns" ||
                      (maxTurns !== undefined && (s.numTurns ?? 0) >= maxTurns)
                  ).length
                : null,
            medianInputTokens: median(metrics.map((m) => m.inputTokens)),
            medianTurns: median(metrics.map((m) => m.turns)),
            results:
              measured.length > 0
                ? measured.reduce<ToolResults>(
                    (all, m) => addResults(all, m.results!),
                    {}
                  )
                : null,
          }
        : null,
  }
}

const pct = (n: number) => `${Math.round(n * 100)} %`
const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`
const int = (n: number) => Math.round(n).toLocaleString("en-US")
const kib = (chars: number) =>
  chars < 10 * 1024
    ? `${(chars / 1024).toFixed(1)} KiB`
    : `${int(chars / 1024)} KiB`
const mark = (ok: boolean | undefined) => (ok ? "✅" : "❌")

export function toMarkdown(report: RunReport): string {
  const { summary: s } = report
  const lines = [
    `# Conformance run — ${report.label}`,
    "",
    `${report.date} · generator \`${report.generator}\`${report.via ? ` via \`${report.via}\`` : ""}${report.model ? ` · model \`${report.model}\`` : ""}${report.context ? ` · context \`${report.context}\`` : ""}${report.skills?.length ? ` · skills ${report.skills.map((name) => `\`${name}\``).join(", ")}` : ""} · design system ${report.designSystem.version} (\`${report.designSystem.commit.slice(0, 7)}\`)${report.generated ? ` · generated at \`${report.generated.commit.slice(0, 7)}\`${report.generated.dirty ? " (dirty)" : ""} · sources \`${report.generated.sources}\` · effort ${report.generated.effort} · ${report.generated.maxTurns} turns max` : ""} · ${s.generated}/${s.tasks} tasks answered`,
    "",
    `**Conformance: ${pct(s.conformance)}** (the mean of the stages that ran)`,
    "",
  ]
  const g = s.generation
  if (g)
    lines.push(
      `**Cost: ${int(g.medianInputTokens)} input tokens per screen**, in ${g.medianTurns} turns (medians: every turn sends the whole conversation again)`,
      ""
    )
  const b = report.budget
  if (b)
    lines.push(
      `Budget against \`${b.baseline}\`: ${int(b.medianInputTokens)} input tokens per screen for at most ${int(b.target)} (${pct(b.target / b.baselineMedian - 1)} of ${int(b.baselineMedian)}) ${mark(b.medianInputTokens <= b.target)} · conformance ${pct(b.conformance)} for at least ${pct(b.baselineConformance)} ${mark(b.conformance >= b.baselineConformance)}`,
      ""
    )
  lines.push(
    "| Stage | Pass | Detail |",
    "| --- | --- | --- |",
    `| A. Deterministic | ${pct(s.stageA.pass)} | compiles ${pct(s.stageA.compiles)} · lint clean ${pct(s.stageA.lint)} · gold components used ${pct(s.stageA.coverage)} |`,
    s.stageB
      ? `| B. Accessibility | ${pct(s.stageB.pass)} | renders ${pct(s.stageB.renders)} · axe light + dark ${pct(s.stageB.axe)} · focus on every tab stop ${pct(s.stageB.focus)} |`
      : "| B. Accessibility | — | not run |",
    s.stageC
      ? `| C. Rubric | ${pct(s.stageC.score)} | ${Object.entries(
          s.stageC.byCriterion
        )
          .map(([c, v]) => `${c} ${pct(v)}`)
          .join(" · ")} |`
      : "| C. Rubric | — | not run |",
    ""
  )
  const families = Object.entries(s.stageA.lintByFamily)
  if (families.length > 0)
    lines.push(
      `Lint findings by family: ${families.map(([f, n]) => `${f} ${n}`).join(" · ")}`,
      ""
    )
  if (g) {
    const cap = g.turnCapReached
    lines.push(
      `Generation: ${g.turns} turns · ${count(g.mcpCalls, "MCP tool call")} · ${count(g.otherCalls, "other tool call")} · ${count(g.toolErrors, "tool error")} · ${g.inputTokens} input and ${g.outputTokens} output tokens${cap === null ? "" : ` · ${count(cap, "task")} reached the ${report.generated ? `${report.generated.maxTurns}-turn` : "turn"} cap`}`,
      ""
    )
  }
  if (g?.results) {
    const rows = Object.entries(g.results).sort(
      (x, y) => y[1].chars - x[1].chars
    )
    const total = rows.reduce((a, [, r]) => a + r.chars, 0)
    lines.push(
      `What the tools sent back: ${kib(total)}, per tool and per \`response_format\``,
      "",
      "| Tool | Format | Calls | Sent back | Share |",
      "| --- | --- | --- | --- | --- |",
      ...rows.map(([key, r]) => {
        const [tool, format] = key.split(":")
        return `| \`${tool}\` | ${format ?? "—"} | ${r.calls} | ${kib(r.chars)} | ${pct(total ? r.chars / total : 0)} |`
      }),
      ""
    )
  }
  lines.push(
    "| Task | Compiles | Lint | Coverage | Renders | Axe | Focus | Rubric |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  )
  for (const t of report.tasks) {
    const r = t.rubric
      ? `${(Object.values(t.rubric.scores).reduce((a, b) => a + b, 0) / Object.values(t.rubric.scores).length).toFixed(1)}/5`
      : "—"
    lines.push(
      t.generated
        ? `| \`${t.id}\` | ${mark(t.static?.compiles)} | ${mark(t.static?.lint)} | ${pct(t.static?.coverage ?? 0)} | ${t.a11y ? mark(t.a11y.renders) : "—"} | ${t.a11y ? mark(t.a11y.axe) : "—"} | ${t.a11y ? mark(t.a11y.focus) : "—"} | ${r} |`
        : `| \`${t.id}\` | no output | | | | | | |`
    )
  }
  const failures = report.tasks.filter(
    (t) =>
      t.static?.typeErrors.length ||
      t.static?.lintErrors.length ||
      t.static?.missing.length ||
      t.a11y?.failures.length
  )
  if (failures.length > 0) {
    lines.push("", "## Findings", "")
    for (const t of failures) {
      lines.push(`### \`${t.id}\``, "", "```")
      for (const e of t.static?.typeErrors ?? []) lines.push(`tsc   ${e}`)
      for (const e of t.static?.lintErrors ?? []) lines.push(`lint  ${e}`)
      if (t.static?.missing.length)
        lines.push(`gold  not used: ${t.static.missing.join(", ")}`)
      for (const e of t.a11y?.failures ?? []) lines.push(`a11y  ${e}`)
      lines.push("```", "")
    }
  }
  return lines.join("\n").trimEnd() + "\n"
}
