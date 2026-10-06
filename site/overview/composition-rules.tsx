import Link from "next/link"

import { componentByName } from "@/site/lib/components"
import type { CompositionRule } from "@/site/overview/data"
import { MoreRules } from "@/site/overview/more-rules"
import { LINK } from "@/site/ui/link"
import { InlineMarkdown } from "@/site/ui/markdown"

/** One rule: its identifier, its text and the components it applies to. */
function Rule({ rule }: { rule: CompositionRule }) {
  return (
    <li
      id={rule.id}
      className="flex scroll-mt-20 flex-col gap-1 border-b py-3 target:bg-muted"
    >
      <p className="font-mono text-xs font-medium">{rule.id}</p>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <InlineMarkdown>{rule.rule}</InlineMarkdown>
      </p>
      {rule.appliesTo.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Applies to{" "}
          {rule.appliesTo.map((name, index) => {
            const entry = componentByName(name)
            return (
              <span key={name}>
                {index > 0 ? ", " : null}
                {entry ? (
                  <Link href={`/components/${entry.slug}/`} className={LINK}>
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </span>
            )
          })}
        </p>
      ) : null}
    </li>
  )
}

/** The rules shown before the list is opened. */
const FIRST = 5

/**
 * The composition rules, one anchor each: a spec cites a rule by its
 * identifier (`rule-21`), and that code links here. The first few show, the
 * rest open on demand.
 */
export function CompositionRules({ rules }: { rules: CompositionRule[] }) {
  const rest = rules.slice(FIRST)
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col border-t">
        {rules.slice(0, FIRST).map((rule) => (
          <Rule key={rule.id} rule={rule} />
        ))}
      </ol>
      {rest.length > 0 ? (
        <MoreRules ids={rest.map((rule) => rule.id)}>
          <ol start={FIRST + 1} className="flex flex-col">
            {rest.map((rule) => (
              <Rule key={rule.id} rule={rule} />
            ))}
          </ol>
        </MoreRules>
      ) : null}
    </div>
  )
}
