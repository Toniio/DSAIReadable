import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type EvalSeries, percent } from "@/site/audit-docs/data"
import { ResultBadge } from "@/site/audit-docs/result-badge"
import { LINK } from "@/site/ui/link"

const CHECKS = [
  { key: "compiles", label: "Compiles" },
  { key: "lint", label: "Lint" },
  { key: "renders", label: "Renders" },
  { key: "axe", label: "Axe" },
  { key: "focus", label: "Focus" },
] as const

type Check = (typeof CHECKS)[number]["key"]

const count = (value: number) => Math.round(value).toLocaleString("en-US")

/** What one task's session used on average: `130,522 tokens (124,081 input, 6,441 output), an estimated $0.20`. */
function usageSentence({ perTask }: EvalSeries): string {
  if (!perTask) return ""
  const tokens = `${count(perTask.inputTokens + perTask.outputTokens)} tokens (${count(perTask.inputTokens)} input, ${count(perTask.outputTokens)} output)`
  const cost =
    perTask.costUsd === null
      ? ""
      : `, an estimated $${perTask.costUsd.toFixed(2)} at API prices`
  return ` A task used ${tokens} on average${cost}.`
}

/**
 * A check's outcome over the passes: pass or fail when there is one, else
 * how many of the passes that ran it it passed.
 */
function Outcome({ outcomes }: { outcomes: (boolean | null)[] }) {
  const ran = outcomes.filter((outcome) => outcome !== null)
  if (outcomes.length === 1 || ran.length === 0)
    return <ResultBadge pass={ran.length ? ran[0] : null} />
  const passed = ran.filter(Boolean).length
  const variant =
    passed === ran.length ? "success" : passed === 0 ? "destructive" : "warning"
  return (
    <Badge variant={variant}>
      {passed} of {ran.length}
    </Badge>
  )
}

function SeriesMatrix({ series }: { series: EvalSeries }) {
  const { runs } = series
  const several = runs.length > 1
  const tasks = runs[0].results.map((task) => ({
    id: task.id,
    gold: task.gold,
    passes: runs.map((run) => run.results.find((r) => r.id === task.id)),
  }))
  const passesAll = (task: (typeof runs)[number]["results"][number]) =>
    task.compiles &&
    task.lint &&
    task.renders !== false &&
    task.axe !== false &&
    task.focus !== false
  const passing = tasks.filter((task) =>
    task.passes.every((result) => result && passesAll(result))
  ).length
  const perPass = runs.map(
    (run) => run.results.filter((task) => passesAll(task)).length
  )
  const failing = tasks.filter((task) =>
    task.passes.some((result) => result && result.findings.length > 0)
  )
  const outcomes = (task: (typeof tasks)[number], key: Check) =>
    task.passes.map((result) => (result ? result[key] : null))
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {several
          ? `${passing} of ${tasks.length} tasks pass every check in ${runs.length === 2 ? "both" : `all ${runs.length}`} passes; ${perPass.slice(0, -1).join(", ")} and ${perPass.at(-1)} in each pass, in order. `
          : `${passing} of ${tasks.length} tasks pass every check. `}
        {series.model ? `${series.model}, ` : ""}
        design system {series.version},{" "}
        {several ? "mean conformance" : "conformance"}{" "}
        {percent(series.conformance)}.{usageSentence(series)}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Gold standard</TableHead>
            {CHECKS.slice(0, 2).map((check) => (
              <TableHead key={check.key}>{check.label}</TableHead>
            ))}
            <TableHead>Coverage</TableHead>
            {CHECKS.slice(2).map((check) => (
              <TableHead key={check.key}>{check.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-mono">{task.id}</TableCell>
              <TableCell>
                {task.gold ? (
                  <Link href={task.gold.href} className={LINK}>
                    {task.gold.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              {CHECKS.slice(0, 2).map((check) => (
                <TableCell key={check.key}>
                  <Outcome outcomes={outcomes(task, check.key)} />
                </TableCell>
              ))}
              <TableCell className="font-mono tabular-nums">
                {percent(
                  task.passes.reduce(
                    (sum, result) => sum + (result?.coverage ?? 0),
                    0
                  ) / task.passes.length
                )}
              </TableCell>
              {CHECKS.slice(2).map((check) => (
                <TableCell key={check.key}>
                  <Outcome outcomes={outcomes(task, check.key)} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {failing.length ? (
        <div className="flex flex-col gap-2">
          <Heading level={4}>Findings</Heading>
          <ul className="flex flex-col gap-3">
            {failing.map((task) => (
              <li key={task.id} className="flex flex-col gap-1 border-l pl-3">
                <span className="font-mono text-xs font-semibold">
                  {task.id}
                </span>
                {task.passes.flatMap((result, pass) =>
                  (result?.findings ?? []).map((finding, index) => (
                    <span
                      key={`${pass}-${index}`}
                      className="font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
                    >
                      {several ? `Pass ${pass + 1}: ${finding}` : finding}
                    </span>
                  ))
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Each task of the latest recorded measurements against every check, one tab
 * per condition: the deterministic checks of stage A, the coverage of the
 * gold standard's modules, and the accessibility checks of stage B. A
 * condition measured in several passes gives, for each check, how many passes
 * it passed, and its mean coverage.
 */
export function TaskMatrix({ series }: { series: EvalSeries[] }) {
  if (series.length === 0) return null
  return (
    <Tabs defaultValue={series[0].file} className="flex flex-col gap-4">
      <TabsList aria-label="Recorded measurement" className="flex-wrap">
        {series.map((entry) => (
          <TabsTrigger key={entry.file} value={entry.file}>
            {entry.condition}
          </TabsTrigger>
        ))}
      </TabsList>
      {series.map((entry) => (
        <TabsContent key={entry.file} value={entry.file}>
          <SeriesMatrix series={entry} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
