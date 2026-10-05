import type { ReactNode } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Session } from "@/site/mcp-skills-docs/data"
import { LINK } from "@/site/ui/link"

const number = (value: number) => value.toLocaleString("en-US")

/** One figure of the session, in a joined grid. */
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-background p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

/**
 * A recorded session of the eval harness: the request, what the session
 * used, then each tool the agent called with the size of one of its answers
 * against the server's cap.
 */
export function SessionBlock({
  session,
  cap,
}: {
  session: Session
  cap: number
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-6">
        <Fact term="Task">
          <span className="flex flex-col gap-0.5">
            <code className="font-mono">{session.task}</code>
            {session.gold ? (
              <Link href={session.gold.href} className={LINK}>
                {session.gold.label}
              </Link>
            ) : null}
          </span>
        </Fact>
        <Fact term="Turns">{number(session.turns)}</Fact>
        <Fact term="Tool calls">{number(session.toolCalls)}</Fact>
        <Fact term="Input tokens">{number(session.inputTokens)}</Fact>
        <Fact term="Output tokens">{number(session.outputTokens)}</Fact>
        <Fact term="Cost">
          {session.costUsd === undefined
            ? "Not recorded"
            : `$${session.costUsd.toFixed(2)}`}
        </Fact>
      </dl>
      <blockquote className="border-l border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
        {session.prompt}
      </blockquote>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tool</TableHead>
            <TableHead>Calls</TableHead>
            <TableHead>Characters per answer</TableHead>
            <TableHead>Of the {number(cap)}-character cap</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {session.answers.map((answer) => {
            const share = Math.round((answer.perAnswer / cap) * 100)
            return (
              <TableRow key={`${answer.tool}:${answer.format ?? ""}`}>
                <TableCell>
                  <span className="flex flex-wrap items-center gap-2">
                    <code className="font-mono">{answer.tool}</code>
                    {answer.format ? (
                      <Badge variant="outline">{answer.format}</Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="font-mono tabular-nums">
                  {answer.calls}
                </TableCell>
                <TableCell className="font-mono tabular-nums">
                  {number(answer.perAnswer)}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="block h-2 w-24 bg-muted"
                    >
                      <span
                        className="block h-full bg-primary"
                        style={{ width: `${Math.max(share, 1)}%` }}
                      />
                    </span>
                    <span className="font-mono tabular-nums">{share}%</span>
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {session.model ?? "The model"} through the eval harness, design system{" "}
        {session.version}: the median of {session.of} sessions with the server,
        recorded in{" "}
        <code className="font-mono">evals/history/{session.file}.json</code>.
        Input tokens count everything each turn sends again, cached or not; the
        cost is Claude Code&apos;s estimate at API prices.
      </p>
    </div>
  )
}
