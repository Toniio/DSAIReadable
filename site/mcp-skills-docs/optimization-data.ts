import { listFiles, readJson } from "@/site/lib/repo"

/**
 * What the Optimization page reads at build time: the recorded runs of
 * evals/history/, grouped by the version their screens were generated from
 * (`generated.version`), not by the checkout that scored them. Every figure
 * is computed here; the page measures nothing itself.
 */

// ── The recorded runs ──────────────────────────────────────────────────────

/** One task of a recorded run, as evals/lib/report.ts writes it. */
interface ReportTask {
  id: string
  static?: { compiles: boolean; lint: boolean }
  a11y?: { renders: boolean; axe: boolean; focus: boolean }
  metrics?: {
    inputTokens: number
    outputTokens: number
    /** What each tool sent back in the session, by `tool` or `tool:format`. */
    results?: Record<string, { calls: number; chars: number }>
  }
  /** Claude Code's estimate of the session's cost at API prices, from 0.3.0 on. */
  session?: { costUsd?: number }
}

interface Report {
  date: string
  generator: string
  model?: string
  context?: string
  skills?: string[]
  /** Where the screens come from: absent from a gold run. */
  generated?: {
    version?: string
    commit: string
    sources?: string
    /** The folder its screens were written in; absent before passes. */
    run?: string
  }
  summary: {
    tasks: number
    conformance: number
    generation: {
      /** What each tool sent back, by `tool` or `tool:format`. */
      results: Record<string, { calls: number; chars: number }> | null
    } | null
  }
  /** The cost budget the report tracked, when one applies to its condition. */
  budget?: { target: number }
  tasks: ReportTask[]
}

interface EvalTasks {
  tasks: { id: string; prompt: string }[]
  suites: Record<string, string[]>
}

export type Condition = "none" | "mcp"

interface Run {
  report: Report
  version: string
  condition: Condition
  skills: string[]
  /** Its tasks are exactly a suite's, not the default run's. */
  suite: boolean
}

/** `0.1.10` after `0.1.9`. */
function compareVersions(a: string, b: string): number {
  const x = a.split(".").map(Number)
  const y = b.split(".").map(Number)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const delta = (x[i] ?? 0) - (y[i] ?? 0)
    if (delta) return delta
  }
  return 0
}

const evalTasks = () => readJson<EvalTasks>("evals/tasks.json")

/**
 * The model runs of evals/history/, each set of screens once: a later report
 * that scores the same screens again (a rescore, after a fix of the scorer)
 * replaces the earlier one.
 */
function runs(): Run[] {
  const { suites } = evalTasks()
  const members = Object.values(suites).map((ids) => [...ids].sort().join())
  const reports = listFiles("evals/history", ".json")
    .map((file) => ({
      file,
      report: readJson<Report>(`evals/history/${file}`),
    }))
    .filter(
      ({ report }) =>
        report.generator !== "gold" && report.generated?.version !== undefined
    )
    .sort(
      (a, b) =>
        a.report.date.localeCompare(b.report.date) ||
        a.file.localeCompare(b.file)
    )
  const latest = new Map<string, Report>()
  for (const { report } of reports) {
    const { commit, sources, run } = report.generated ?? { commit: "" }
    const screens = [
      report.model,
      report.context,
      [...(report.skills ?? [])].sort().join("+"),
      commit,
      sources ?? "",
      run ?? "",
    ].join("|")
    latest.set(screens, report)
  }
  return [...latest.values()].map((report) => ({
    report,
    version: report.generated?.version ?? "",
    condition: report.context === "none" ? "none" : "mcp",
    skills: report.skills ?? [],
    suite: members.includes(
      report.tasks
        .map((task) => task.id)
        .sort()
        .join()
    ),
  }))
}

/** The runs of the two conditions the page compares: the default tasks, no skills. */
const measured = () =>
  runs().filter((run) => !run.suite && run.skills.length === 0)

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0)

const mean = (values: number[]) => sum(values) / values.length

/** The middle value; the mean of the two middle ones for an even count. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Stage A (compiles, lints clean) and stage B (renders, axe, focus) pass. */
const fullyConformant = (task: ReportTask) =>
  Boolean(
    task.static?.compiles &&
    task.static.lint &&
    task.a11y?.renders &&
    task.a11y.axe &&
    task.a11y.focus
  )

const sessions = (group: Run[]) =>
  group.flatMap((run) => run.report.tasks).filter((task) => task.metrics)

// ── Cost ───────────────────────────────────────────────────────────────────

/**
 * The price of an output token of claude-sonnet-5-5, the model of every
 * recorded run: $10 per million. A session's cost is its input at the rate
 * fitted below, plus its output at this price.
 */
const OUTPUT_PRICE = 10 / 1_000_000

/** Every session of these runs records Claude Code's cost estimate. */
const costRecorded = (group: Run[]) =>
  sessions(group).every((task) => task.session?.costUsd !== undefined)

/**
 * The price of an input token in each condition, fitted on the sessions of
 * the latest version whose every session records its cost: what they cost
 * past their output, over their input tokens. It blends fresh input, cache
 * reads and cache writes in the shares the condition uses them.
 */
function inputRates(all: Run[]): Record<Condition, number> | null {
  const version = [...new Set(all.map((run) => run.version))]
    .sort(compareVersions)
    .reverse()
    .find((candidate) =>
      costRecorded(all.filter((run) => run.version === candidate))
    )
  if (version === undefined) return null
  const rate = (condition: Condition) => {
    const fitted = sessions(
      all.filter(
        (run) => run.version === version && run.condition === condition
      )
    )
    return (
      (sum(fitted.map((task) => task.session?.costUsd ?? 0)) -
        OUTPUT_PRICE *
          sum(fitted.map((task) => task.metrics?.outputTokens ?? 0))) /
      sum(fitted.map((task) => task.metrics?.inputTokens ?? 0))
    )
  }
  return { none: rate("none"), mcp: rate("mcp") }
}

/**
 * What one session cost: as Claude Code recorded it when every session of
 * its version does, estimated from its tokens otherwise.
 */
function sessionCost(
  task: ReportTask,
  condition: Condition,
  recorded: boolean,
  rates: Record<Condition, number> | null
): number | null {
  if (recorded) return task.session?.costUsd ?? null
  if (!rates || !task.metrics) return null
  return (
    rates[condition] * task.metrics.inputTokens +
    OUTPUT_PRICE * task.metrics.outputTokens
  )
}

// ── By version ─────────────────────────────────────────────────────────────

/**
 * The first version the page compares: the first whose screens the current
 * scorer scored. The 0.1.0 screens were scored by an earlier scorer and are
 * no longer on disk to be scored again.
 */
const SCORED_FROM = "0.1.3"

/** One condition at one version: its passes pooled. */
export interface Measurement {
  version: string
  condition: Condition
  passes: number
  screens: number
  /** The harness's score, the mean of its passes. */
  conformance: number
  /** How many screens pass stages A and B. */
  fullyConformant: number
  medianInputTokens: number
  /** The mean over its sessions, in dollars. */
  costPerScreen: number | null
  /** The cost is estimated from the tokens, not recorded. */
  estimated: boolean
}

/** Both conditions at every version from SCORED_FROM on, the oldest first. */
export function measurements(): Measurement[] {
  const all = measured()
  const rates = inputRates(all)
  const versions = [...new Set(all.map((run) => run.version))]
    .filter((version) => compareVersions(version, SCORED_FROM) >= 0)
    .sort(compareVersions)
  return versions.flatMap((version) => {
    const atVersion = all.filter((run) => run.version === version)
    const recorded = costRecorded(atVersion)
    return (["none", "mcp"] as const).flatMap((condition) => {
      const group = atVersion.filter((run) => run.condition === condition)
      if (group.length === 0) return []
      const tasks = group.flatMap((run) => run.report.tasks)
      const used = sessions(group)
      const costs = used.map((task) =>
        sessionCost(task, condition, recorded, rates)
      )
      return [
        {
          version,
          condition,
          passes: group.length,
          screens: tasks.length,
          conformance: mean(group.map((run) => run.report.summary.conformance)),
          fullyConformant: tasks.filter(fullyConformant).length,
          medianInputTokens: median(
            used.map((task) => task.metrics?.inputTokens ?? 0)
          ),
          costPerScreen: costs.every((cost) => cost !== null)
            ? mean(costs as number[])
            : null,
          estimated: !recorded,
        },
      ]
    })
  })
}

/** The two conditions at the latest version. */
export function latest(): { none: Measurement; mcp: Measurement } {
  const rows = measurements()
  const version = rows.at(-1)?.version
  const pick = (condition: Condition) => {
    const row = rows.find(
      (entry) => entry.version === version && entry.condition === condition
    )
    if (!row)
      throw new Error(`evals/history: no ${condition} run at ${version}`)
    return row
  }
  return { none: pick("none"), mcp: pick("mcp") }
}

// ── What the tokens buy ────────────────────────────────────────────────────

/** The latest version's runs of one condition. */
function latestRuns(condition: Condition): Run[] {
  const { mcp } = latest()
  return measured().filter(
    (run) => run.version === mcp.version && run.condition === condition
  )
}

/** The share of a measurement's screens that pass stages A and B. */
export const conformantShare = (row: Measurement) =>
  row.fullyConformant / row.screens

/**
 * What the server's tokens buy at the latest version: what it adds to the
 * cost of a screen, the share of screens it makes fully conformant, and what
 * one pass of the default tasks costs in each condition.
 */
export function returns() {
  const { none, mcp } = latest()
  if (mcp.costPerScreen === null || none.costPerScreen === null) return null
  const extraCost = mcp.costPerScreen - none.costPerScreen
  const gained = conformantShare(mcp) - conformantShare(none)
  const tasks = latestRuns("mcp")[0].report.summary.tasks
  return {
    version: mcp.version,
    estimated: mcp.estimated,
    extraCost,
    gained,
    tasks,
    run: { none: none.costPerScreen * tasks, mcp: mcp.costPerScreen * tasks },
  }
}

/**
 * The task the server rescues for the least: among the tasks no pass gets
 * fully conformant with no context and every pass gets with the server, the
 * one whose sessions with the server cost the least, by their median.
 */
export function cheapestRescue() {
  const { mcp } = latest()
  const rates = inputRates(measured())
  const outcomes = (condition: Condition) => {
    const group = latestRuns(condition)
    const recorded = costRecorded(group)
    return group
      .flatMap((run) => run.report.tasks)
      .map((task) => ({
        id: task.id,
        passes: fullyConformant(task),
        cost: sessionCost(task, condition, recorded, rates),
      }))
  }
  const none = outcomes("none")
  const server = outcomes("mcp")
  const rescued = [...new Set(server.map((task) => task.id))]
    .map((id) => {
      const without = none.filter((task) => task.id === id)
      const withServer = server.filter((task) => task.id === id)
      const costs = withServer.map((task) => task.cost)
      return {
        id,
        passes: withServer.length,
        none: without.filter((task) => task.passes).length,
        mcp: withServer.filter((task) => task.passes).length,
        medianCost: costs.every((cost) => cost !== null)
          ? median(costs as number[])
          : null,
        noneRuns: without.length,
      }
    })
    .filter(
      (task) =>
        task.noneRuns > 0 &&
        task.none === 0 &&
        task.mcp === task.passes &&
        task.medianCost !== null
    )
    .sort((a, b) => (a.medianCost ?? 0) - (b.medianCost ?? 0))
  const [cheapest] = rescued
  if (!cheapest) return null
  return {
    version: mcp.version,
    task: cheapest.id,
    prompt:
      evalTasks().tasks.find((task) => task.id === cheapest.id)?.prompt ?? "",
    /** The passes that built it with the server, all fully conformant. */
    passes: cheapest.passes,
    /** The passes that built it with no context, none fully conformant. */
    noneRuns: cheapest.noneRuns,
    medianCost: cheapest.medianCost ?? 0,
    estimated: mcp.estimated,
    /** How many tasks the server takes from no pass to every pass. */
    rescued: rescued.length,
  }
}

// ── What's next ────────────────────────────────────────────────────────────

/**
 * At the latest version, with the server: the answer that makes up the
 * largest share of the characters the tools sent back, and the median input
 * tokens per screen against the budget the harness tracks.
 */
export function nextLever() {
  const group = latestRuns("mcp")
  const totals = new Map<string, number>()
  for (const run of group)
    for (const [key, { chars }] of Object.entries(
      run.report.summary.generation?.results ?? {}
    ))
      totals.set(key, (totals.get(key) ?? 0) + chars)
  const [top] = [...totals.entries()].sort((a, b) => b[1] - a[1])
  if (!top) return null
  const [tool, format] = top[0].split(":")
  const tasks = group.flatMap((run) => run.report.tasks)
  return {
    tool,
    format,
    share: top[1] / sum([...totals.values()]),
    /** The sessions that asked for it at least once. */
    sessions: tasks.filter((task) => task.metrics?.results?.[top[0]]).length,
    screens: tasks.length,
    median: latest().mcp.medianInputTokens,
    budget: group[0].report.budget?.target ?? null,
  }
}
