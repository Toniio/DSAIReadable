/**
 * The cost budgets the report tracks. A budget caps the median input tokens
 * per screen at a share of a recorded baseline's, at a conformance no lower
 * than the baseline's: a run that costs less by answering worse does not meet
 * it. It applies to the runs of the baseline's condition only — the same
 * tasks, model, context, skills, effort and turn cap, generated the same way —
 * since a cost compares with nothing else.
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { median, type RunReport } from "./report"

interface Budget {
  /** A recorded run of evals/history/, named without its extension. */
  baseline: string
  /** The share of the baseline's median input tokens per screen a run may reach. */
  tokens: number
}

/**
 * Issue #123: −30 % median input tokens per screen with the MCP server alone,
 * at equal conformance, against the 0.1.3 run as the current scorer scores it.
 */
export const BUDGETS: Budget[] = [
  { baseline: "2026-10-04-0.1.3-sonnet-mcp-rescored", tokens: 0.7 },
]

export interface BudgetResult {
  baseline: string
  baselineMedian: number
  /** The ceiling: the baseline's median times the budget's share. */
  target: number
  medianInputTokens: number
  baselineConformance: number
  /** The run's conformance over the stages the baseline ran. */
  conformance: number
  /** Within the ceiling, at a conformance no lower than the baseline's. */
  met: boolean
}

/** What a run measures; two runs compare only when it is the same. */
function condition(report: RunReport) {
  return JSON.stringify({
    generator: report.generator,
    // `claude-code 2.1.288`: the route, not the release.
    via: report.via?.split(" ")[0] ?? null,
    model: report.model ?? null,
    context: report.context ?? null,
    skills: [...(report.skills ?? [])].sort(),
    effort: report.generated?.effort ?? null,
    maxTurns: report.generated?.maxTurns ?? null,
    tasks: report.tasks.map((t) => t.id).sort(),
  })
}

/**
 * The conformance over the stages the baseline ran, or undefined when the run
 * skipped one of them (`--no-a11y`): a mean over other stages compares with
 * nothing.
 */
function conformanceOver(report: RunReport, baseline: RunReport) {
  const stages = ({ summary: s }: RunReport) => [
    s.stageA.pass,
    s.stageB?.pass,
    s.stageC?.score,
  ]
  const ran = stages(baseline).map((value) => value !== undefined)
  const values = stages(report).filter((_, i) => ran[i])
  if (!values.every((value) => value !== undefined)) return undefined
  const mean = values.reduce((a, value) => a + value, 0) / values.length
  return Math.round(mean * 1000) / 1000
}

const medianInputTokens = (report: RunReport) =>
  median(
    report.tasks.flatMap((t) => (t.metrics ? [t.metrics.inputTokens] : []))
  )

/** The budget's verdict on a run, or undefined when the run measures another condition. */
export function compareBudget(
  report: RunReport,
  baseline: RunReport,
  budget: Budget
): BudgetResult | undefined {
  if (condition(report) !== condition(baseline)) return undefined
  const baselineMedian = medianInputTokens(baseline)
  const run = medianInputTokens(report)
  const conformance = conformanceOver(report, baseline)
  if (baselineMedian === 0 || run === 0 || conformance === undefined)
    return undefined
  const target = Math.floor(baselineMedian * budget.tokens)
  return {
    baseline: budget.baseline,
    baselineMedian,
    target,
    medianInputTokens: run,
    baselineConformance: baseline.summary.conformance,
    conformance,
    met: run <= target && conformance >= baseline.summary.conformance,
  }
}

/** The first budget whose baseline measures the run's condition. */
export function budgetFor(
  root: string,
  report: RunReport
): BudgetResult | undefined {
  for (const budget of BUDGETS) {
    const baseline = JSON.parse(
      readFileSync(
        join(root, "evals/history", `${budget.baseline}.json`),
        "utf-8"
      )
    ) as RunReport
    const result = compareBudget(report, baseline, budget)
    if (result) return result
  }
  return undefined
}
