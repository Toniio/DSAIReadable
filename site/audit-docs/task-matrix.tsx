import Link from "next/link"

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
import { type EvalRun, percent } from "@/site/audit-docs/data"
import { ResultBadge } from "@/site/audit-docs/result-badge"
import { LINK } from "@/site/ui/link"

const CHECKS = [
  { key: "compiles", label: "Compiles" },
  { key: "lint", label: "Lint" },
  { key: "renders", label: "Renders" },
  { key: "axe", label: "Axe" },
  { key: "focus", label: "Focus" },
] as const

function RunMatrix({ run }: { run: EvalRun }) {
  const failing = run.results.filter((task) => task.findings.length > 0)
  const passing = run.results.filter(
    (task) =>
      task.compiles &&
      task.lint &&
      task.renders !== false &&
      task.axe !== false &&
      task.focus !== false
  ).length
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {passing} of {run.results.length} tasks pass every check.{" "}
        {run.model ? `${run.model}, ` : ""}
        design system {run.version}, conformance {percent(run.conformance)}.
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
          {run.results.map((task) => (
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
              <TableCell>
                <ResultBadge pass={task.compiles} />
              </TableCell>
              <TableCell>
                <ResultBadge pass={task.lint} />
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {percent(task.coverage)}
              </TableCell>
              <TableCell>
                <ResultBadge pass={task.renders} />
              </TableCell>
              <TableCell>
                <ResultBadge pass={task.axe} />
              </TableCell>
              <TableCell>
                <ResultBadge pass={task.focus} />
              </TableCell>
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
                {task.findings.map((finding, index) => (
                  <span
                    key={index}
                    className="font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
                  >
                    {finding}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Each task of the latest recorded runs against every check, one tab per
 * run: the deterministic checks of stage A, the coverage of the gold
 * standard's modules, and the accessibility checks of stage B.
 */
export function TaskMatrix({ runs }: { runs: EvalRun[] }) {
  if (runs.length === 0) return null
  return (
    <Tabs defaultValue={runs[0].file} className="flex flex-col gap-4">
      <TabsList aria-label="Recorded run" className="flex-wrap">
        {runs.map((run) => (
          <TabsTrigger key={run.file} value={run.file}>
            {run.condition}
          </TabsTrigger>
        ))}
      </TabsList>
      {runs.map((run) => (
        <TabsContent key={run.file} value={run.file}>
          <RunMatrix run={run} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
