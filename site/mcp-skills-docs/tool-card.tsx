import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Heading } from "@/components/ui/heading"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  toolBehaviors,
  toolParameters,
  type ToolAnswer,
  type ToolRecord,
} from "@/site/mcp-skills-docs/tools-data"
import { DisclosureTrigger } from "@/site/mcp-skills-docs/disclosure"
import { CodeBlock } from "@/site/ui/code-block"
import { CopyButton } from "@/site/ui/copy-button"

const number = (value: number) => value.toLocaleString("en-US")

/** Past this many lines, an answer scrolls inside a bounded area. */
const LONG_ANSWER = 20

/** The parameters of a tool's input schema, one row each. */
function Parameters({ tool }: { tool: ToolRecord }) {
  const parameters = toolParameters(tool)
  if (!parameters.length)
    return <p className="text-sm text-muted-foreground">No parameters.</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Parameter</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((parameter) => (
          <TableRow key={parameter.name}>
            <TableCell className="align-top">
              <span className="flex flex-col items-start gap-1">
                <code className="font-mono">{parameter.name}</code>
                {parameter.required ? (
                  <Badge variant="outline">Required</Badge>
                ) : null}
              </span>
            </TableCell>
            <TableCell className="align-top">
              {parameter.values ? (
                <span className="flex flex-wrap gap-1">
                  {parameter.values.map((value) => (
                    <code key={value} className="bg-muted px-1 font-mono">
                      {JSON.stringify(value)}
                    </code>
                  ))}
                </span>
              ) : (
                <span className="flex flex-col gap-1">
                  <code className="font-mono">{parameter.type}</code>
                  {parameter.range ? (
                    <span className="text-muted-foreground tabular-nums">
                      {parameter.range}
                    </span>
                  ) : null}
                </span>
              )}
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <span className="flex flex-col gap-1">
                <span>{parameter.description ?? "—"}</span>
                {parameter.default ? (
                  <span className="text-muted-foreground">
                    Default{" "}
                    <code className="font-mono">{parameter.default}</code>
                  </span>
                ) : null}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** An argument of the example call, by name. */
type Argument = [name: string, value: unknown]

/** An argument that runs over several lines: a screen's code. */
const multiline = (entry: Argument): entry is [string, string] =>
  typeof entry[1] === "string" && entry[1].includes("\n")

/**
 * The arguments of the example call that fit on a line, shown beside the
 * trigger; a multi-line one, a screen's code, opens with the answer.
 */
function ExampleInput({ entries }: { entries: Argument[] }) {
  const inline = entries.filter((entry) => !multiline(entry))
  if (!entries.length)
    return <p className="text-sm text-muted-foreground">No arguments.</p>
  if (!inline.length) return null
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {inline.map(([name, value]) => (
        <code
          key={name}
          className="w-fit bg-muted px-2 py-1 font-mono text-xs break-all"
        >
          {name}: {JSON.stringify(value)}
        </code>
      ))}
    </div>
  )
}

/**
 * One answer as the server sent it, pretty-printed, with its size: the
 * characters of the compact JSON the agent reads. A long one scrolls inside
 * a bounded, focusable area, so a card never runs the length of the page.
 */
function Answer({ tool, answer }: { tool: string; answer: ToolAnswer }) {
  const text = JSON.stringify(JSON.parse(answer.text), null, 2)
  const label = answer.format ? `${answer.format} answer` : "answer"
  const code = (
    <pre className="p-4 font-mono text-xs leading-relaxed wrap-anywhere whitespace-pre-wrap text-foreground">
      <code>{text}</code>
    </pre>
  )
  return (
    <figure className="flex min-w-0 flex-col border bg-muted">
      <figcaption className="flex min-h-9 items-center justify-between gap-2 border-b pr-1 pl-3">
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {answer.format ? (
            <Badge variant="outline">{answer.format}</Badge>
          ) : (
            <span>Answer</span>
          )}
          <span className="tabular-nums">
            {number(answer.chars)} characters
          </span>
        </span>
        <CopyButton value={text} label={`Copy the ${label} of ${tool}`} />
      </figcaption>
      {text.split("\n").length > LONG_ANSWER ? (
        <ScrollArea
          role="region"
          aria-label={`The ${label} of ${tool}`}
          className="h-80"
        >
          {code}
        </ScrollArea>
      ) : (
        code
      )}
    </figure>
  )
}

/**
 * A tool as an agent meets it: its definition, with its parameters and its
 * behaviors, then an example call, whose answer opens on demand. The concise
 * and the detailed answer of a tool that takes `response_format` sit side by
 * side.
 */
function ToolCard({ tool }: { tool: ToolRecord }) {
  const behaviors = toolBehaviors(tool)
  const entries: Argument[] = Object.entries(
    tool.answers[0]?.input ?? {}
  ).filter(([name]) => name !== "response_format")
  return (
    <Card id={tool.name} className="scroll-mt-20">
      <CardHeader>
        <Heading level={4} as="h3">
          {tool.title}
        </Heading>
        <CardDescription>
          <code className="font-mono break-all">{tool.name}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4">
        <p className="text-sm leading-relaxed">{tool.description}</p>
        {behaviors.length ? (
          <ul className="flex flex-wrap gap-2" aria-label="Behaviors">
            {behaviors.map((behavior) => (
              <li key={behavior} className="flex">
                <Badge variant="secondary">{behavior}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <Parameters tool={tool} />
        <Collapsible className="flex min-w-0 flex-col gap-2">
          <DisclosureTrigger>Example call</DisclosureTrigger>
          <ExampleInput entries={entries} />
          <CollapsibleContent className="mt-2 flex min-w-0 flex-col gap-4">
            {entries.filter(multiline).map(([name, code]) => (
              <CodeBlock key={name} code={code} language="tsx" title={name} />
            ))}
            <div
              className={
                tool.answers.length > 1
                  ? "grid min-w-0 gap-4 lg:grid-cols-2"
                  : "flex min-w-0 flex-col"
              }
            >
              {tool.answers.map((answer) => (
                <Answer
                  key={answer.format ?? "answer"}
                  tool={tool.name}
                  answer={answer}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

/** The tools of one category, one card each. */
export function ToolCards({ tools }: { tools: ToolRecord[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.name} tool={tool} />
      ))}
    </div>
  )
}
