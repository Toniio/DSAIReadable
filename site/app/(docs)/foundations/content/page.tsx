import type { Metadata } from "next"

import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import { foundation } from "@/site/lib/nav"
import { readJson } from "@/site/lib/repo"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("content")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const AFTER = [{ id: "glossary", label: "Glossary" }]

export default function ContentPage() {
  const glossary = readJson<{ term: string; definition: string }[]>(
    "mcp-server/context/glossary.json"
  )

  return (
    <FoundationPage
      slug="content"
      after={{
        toc: AFTER,
        node: (
          <DocSection
            id="glossary"
            title="Glossary"
            description={`${glossary.length} terms the specs and the MCP server use, as agents read them.`}
          >
            <dl className="grid gap-px border bg-border md:grid-cols-2">
              {glossary.map((entry) => (
                <div
                  key={entry.term}
                  className="flex flex-col gap-1 bg-background p-4 md:last:odd:col-span-2"
                >
                  <dt className="font-mono text-sm font-semibold">
                    {entry.term}
                  </dt>
                  <dd className="text-xs leading-relaxed text-muted-foreground">
                    <InlineMarkdown>{entry.definition}</InlineMarkdown>
                  </dd>
                </div>
              ))}
            </dl>
          </DocSection>
        ),
      }}
    />
  )
}
