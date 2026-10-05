import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import type { GuardDomain } from "@/site/mcp-skills-docs/data"
import { sourceUrl } from "@/site/lib/site"
import { LINK } from "@/site/ui/link"
import { InlineMarkdown, Markdown } from "@/site/ui/markdown"

/** The UI guard's checklist, one card per domain, then its review format. */
export function UiGuard({
  source,
  domains,
  review,
}: {
  source: string
  domains: GuardDomain[]
  review: string
}) {
  const folder = source.slice(0, source.lastIndexOf("/"))
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Heading level={3}>The checklist</Heading>
        <ul className="grid gap-4 md:grid-cols-2">
          {domains.map((domain) => (
            <li key={domain.title} className="flex">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>{domain.title}</CardTitle>
                  <CardDescription>
                    <Link
                      href={sourceUrl(`${folder}/${domain.reference}`)}
                      className={LINK}
                    >
                      {domain.reference}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
                    {domain.rules.map((rule) => (
                      <li key={rule}>
                        <InlineMarkdown from={source}>{rule}</InlineMarkdown>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <Heading level={3}>The review</Heading>
        <Markdown from={source}>{review}</Markdown>
      </div>
    </div>
  )
}
