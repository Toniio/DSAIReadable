import { Badge } from "@/components/ui/badge"
import { InlineMarkdown, Markdown } from "@/site/ui/markdown"

/**
 * A spec table of writing examples, as cards: a title, what it means, then
 * what to write and what not to. The columns are the spec's, in its order:
 * title, meaning, write, not.
 */
export function ExampleCards({
  before,
  rows,
  after,
  from,
}: {
  before: string
  rows: string[][]
  after: string
  from: string
}) {
  return (
    <>
      {before ? <Markdown from={from}>{before}</Markdown> : null}
      <ul className="grid gap-px border bg-border md:grid-cols-2">
        {rows.map(([title, meaning, write, not]) => (
          <li
            key={title}
            className="flex flex-col gap-3 bg-background p-4 md:last:odd:col-span-2"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">
                <InlineMarkdown from={from}>{title}</InlineMarkdown>
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <InlineMarkdown from={from}>{meaning}</InlineMarkdown>
              </p>
            </div>
            <dl className="mt-auto flex flex-col gap-2 text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <dt className="w-12 shrink-0">
                  <Badge variant="success">Write</Badge>
                </dt>
                <dd className="min-w-0">
                  <InlineMarkdown from={from}>{write ?? ""}</InlineMarkdown>
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt className="w-12 shrink-0">
                  <Badge variant="destructive">Not</Badge>
                </dt>
                <dd className="min-w-0">
                  <InlineMarkdown from={from}>{not ?? ""}</InlineMarkdown>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {after ? <Markdown from={from}>{after}</Markdown> : null}
    </>
  )
}
