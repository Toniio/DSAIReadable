import Link from "next/link"

import { componentByName } from "@/site/lib/components"
import type { CompositionRule } from "@/site/overview/data"
import { LINK } from "@/site/ui/link"
import { InlineMarkdown } from "@/site/ui/markdown"

/**
 * The composition rules, one anchor each: a spec cites a rule by its
 * identifier (`rule-21`), and that code links here.
 */
export function CompositionRules({ rules }: { rules: CompositionRule[] }) {
  return (
    <ol className="flex flex-col border-t">
      {rules.map((rule) => (
        <li
          key={rule.id}
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
                      <Link
                        href={`/components/${entry.slug}/`}
                        className={LINK}
                      >
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
      ))}
    </ol>
  )
}
