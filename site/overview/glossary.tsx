import { ShowMore } from "@/site/overview/show-more"
import { InlineMarkdown } from "@/site/ui/markdown"

/** The terms shown before the list is opened: two rows of two. */
const FIRST = 4

const GRID = "grid gap-x-8 gap-y-4 md:grid-cols-2"

/** One term and its definition. */
function Term({ entry }: { entry: { term: string; definition: string } }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-sm font-medium">{entry.term}</dt>
      <dd className="text-sm leading-relaxed text-muted-foreground">
        <InlineMarkdown>{entry.definition}</InlineMarkdown>
      </dd>
    </div>
  )
}

/** The glossary of the specs: the first few terms show, the rest open on demand. */
export function Glossary({
  terms,
}: {
  terms: { term: string; definition: string }[]
}) {
  const rest = terms.slice(FIRST)
  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <dl className={GRID}>
        {terms.slice(0, FIRST).map((entry) => (
          <Term key={entry.term} entry={entry} />
        ))}
      </dl>
      {rest.length > 0 ? (
        <ShowMore count={rest.length} noun="terms">
          <dl className={GRID}>
            {rest.map((entry) => (
              <Term key={entry.term} entry={entry} />
            ))}
          </dl>
        </ShowMore>
      ) : null}
    </div>
  )
}
