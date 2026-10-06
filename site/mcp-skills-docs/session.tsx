import type { ReactNode } from "react"

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
 * used, then each turn with its calls, grouped by tool, and the size of their answers
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
          <code className="font-mono">{session.task}</code>
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
      <ol className="flex min-w-0 flex-col gap-4">
        {session.timeline.map((turn, index) => (
          <li key={index} className="flex min-w-0 flex-col gap-2">
            <h4 className="text-sm font-medium">
              Turn {index + 1}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {number(turn.context)} input tokens
                {turn.calls.length === 0 ? " · the screen, no tool" : ""}
              </span>
            </h4>
            {turn.calls.length > 0 ? (
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Tool</TableHead>
                    <TableHead className="w-1/12">Calls</TableHead>
                    <TableHead className="w-1/4 whitespace-normal">
                      Characters per answer
                    </TableHead>
                    <TableHead className="whitespace-normal">
                      Of the {number(cap)}-character cap
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turn.calls.map((call, k) => {
                    const share = Math.round((call.perAnswer / cap) * 100)
                    return (
                      <TableRow key={k}>
                        <TableCell>
                          <span className="flex flex-wrap items-center gap-2">
                            <code className="font-mono">{call.tool}</code>
                            {call.format ? (
                              <Badge variant="outline">{call.format}</Badge>
                            ) : null}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {call.calls}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {number(call.perAnswer)}
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
                            <span className="font-mono tabular-nums">
                              {share}%
                            </span>
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
