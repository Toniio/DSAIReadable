import type { ReactNode } from "react"
import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ToolUsage } from "@/site/mcp-skills-docs/tools-data"
import { LINK } from "@/site/ui/link"

const number = (value: number) => value.toLocaleString("en-US")

/** One figure of the runs, in a joined grid. */
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-background p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

/**
 * Every tool's calls over the latest eval runs with the server, and the
 * characters its answers added up to. A tool no session called stays in the
 * table at zero: the count to watch.
 */
export function ToolUsageBlock({ usage }: { usage: ToolUsage }) {
  const calls = usage.rows.reduce((sum, row) => sum + row.calls, 0)
  const most = Math.max(...usage.rows.map((row) => row.calls), 1)
  const unused = usage.rows.filter((row) => row.calls === 0).length
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-4">
        <Fact term="Runs">
          {usage.version}
          {usage.model ? (
            <>
              {" · "}
              <code className="font-mono">{usage.model}</code>
            </>
          ) : null}
        </Fact>
        <Fact term="Sessions">{number(usage.sessions)}</Fact>
        <Fact term="Tool calls">{number(calls)}</Fact>
        <Fact term="Never called">
          {unused} of {usage.rows.length} tools
        </Fact>
      </dl>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tool</TableHead>
            <TableHead>Calls</TableHead>
            <TableHead>Characters of its answers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usage.rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>
                <Link href={`#${row.name}`} className={LINK}>
                  <code className="font-mono">{row.name}</code>
                </Link>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="block h-2 w-24 bg-muted">
                    <span
                      className="block h-full bg-primary"
                      style={{ width: `${(row.calls / most) * 100}%` }}
                    />
                  </span>
                  <span className="font-mono tabular-nums">{row.calls}</span>
                </span>
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {number(row.chars)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
