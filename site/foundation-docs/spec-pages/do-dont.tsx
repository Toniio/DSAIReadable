import { Badge } from "@/components/ui/badge"
import { InlineMarkdown } from "@/site/ui/markdown"

/** A rule list: Markdown items, the spec's links made links of the site. */
function RuleList({ items, from }: { items: string[]; from?: string }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>
          <InlineMarkdown from={from}>{item}</InlineMarkdown>
        </li>
      ))}
    </ul>
  )
}

/** Do and Don't, side by side, as the component pages lay out their rules. */
export function DoDont({
  dos,
  donts,
  from,
}: {
  dos: string[]
  donts: string[]
  from?: string
}) {
  if (!dos.length && !donts.length) return null
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 border p-4">
        <Badge variant="success">Do</Badge>
        {dos.length ? (
          <RuleList items={dos} from={from} />
        ) : (
          <p className="text-sm text-muted-foreground">No rule of this kind.</p>
        )}
      </div>
      <div className="flex flex-col gap-3 border p-4">
        <Badge variant="destructive">Don&apos;t</Badge>
        {donts.length ? (
          <RuleList items={donts} from={from} />
        ) : (
          <p className="text-sm text-muted-foreground">No rule of this kind.</p>
        )}
      </div>
    </div>
  )
}

/** Numbered rules: each a bold title and its reason. */
export function NumberedRules({
  items,
  from,
}: {
  items: string[]
  from?: string
}) {
  return (
    <ol className="grid gap-px border bg-border md:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex gap-3 bg-background p-4 text-sm leading-relaxed md:last:odd:col-span-2"
        >
          <span className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <InlineMarkdown from={from}>{item}</InlineMarkdown>
          </span>
        </li>
      ))}
    </ol>
  )
}
