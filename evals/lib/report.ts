/**
 * The report of a run: one JSON file the history keeps and compares, and its
 * Markdown rendering for a pull request or a release note.
 */

import type { A11yResult } from "./a11y"
import type { LintFamily, StaticResult } from "./static"

/** What the generator measured while it worked: the MCP tools in use. */
export interface GenerationMetrics {
  turns: number
  toolCalls: number
  toolErrors: number
  inputTokens: number
  outputTokens: number
  tools: Record<string, number>
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
}

export interface RunReport {
  label: string
  date: string
  generator: string
  model?: string
  /** The claude generator's context: the MCP server or none, and the skills it could load. */
  context?: string
  skills?: string[]
  designSystem: { version: string; commit: string }
  summary: Summary
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
  generation: Omit<GenerationMetrics, "tools"> | null
}

const share = (values: boolean[]) =>
  values.length === 0 ? 0 : values.filter(Boolean).length / values.length
const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length
const round = (n: number) => Math.round(n * 1000) / 1000

/** Coverage is graded, not a gate: another valid component choice is no error. */
export const passesA = (s?: StaticResult) => !!s && s.compiles && s.lint
export const passesB = (a?: A11yResult) => !!a && a.renders && a.axe && a.focus

export function summarize(tasks: TaskReport[], ranB: boolean): Summary {
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
  const sum = (key: keyof Omit<GenerationMetrics, "tools">) =>
    metrics.reduce((a, m) => a + m[key], 0)
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
            toolCalls: sum("toolCalls"),
            toolErrors: sum("toolErrors"),
            inputTokens: sum("inputTokens"),
            outputTokens: sum("outputTokens"),
          }
        : null,
  }
}

const pct = (n: number) => `${Math.round(n * 100)} %`
const mark = (ok: boolean | undefined) => (ok ? "✅" : "❌")

export function toMarkdown(report: RunReport): string {
  const { summary: s } = report
  const lines = [
    `# Conformance run — ${report.label}`,
    "",
    `${report.date} · generator \`${report.generator}\`${report.model ? ` · model \`${report.model}\`` : ""}${report.context ? ` · context \`${report.context}\`` : ""}${report.skills?.length ? ` · skills ${report.skills.map((name) => `\`${name}\``).join(", ")}` : ""} · design system ${report.designSystem.version} (\`${report.designSystem.commit.slice(0, 7)}\`) · ${s.generated}/${s.tasks} tasks answered`,
    "",
    `**Conformance: ${pct(s.conformance)}** (the mean of the stages that ran)`,
    "",
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
    "",
  ]
  const families = Object.entries(s.stageA.lintByFamily)
  if (families.length > 0)
    lines.push(
      `Lint findings by family: ${families.map(([f, n]) => `${f} ${n}`).join(" · ")}`,
      ""
    )
  if (s.generation)
    lines.push(
      `Generation: ${s.generation.turns} turns · ${s.generation.toolCalls} MCP tool calls (${s.generation.toolErrors} errors) · ${s.generation.inputTokens} input and ${s.generation.outputTokens} output tokens`,
      ""
    )
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
