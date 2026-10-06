import type { Metadata } from "next"

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { mcpSkillsNav } from "@/site/lib/nav"
import { sectionDoc } from "@/site/mcp-skills-docs/data"
import { DisclosureTrigger } from "@/site/mcp-skills-docs/disclosure"
import { DocParts } from "@/site/mcp-skills-docs/doc-parts"
import {
  Headline,
  Next,
  Rescue,
  Returns,
  Versions,
} from "@/site/mcp-skills-docs/optimization"
import {
  cheapestRescue,
  measurements,
  nextLever,
} from "@/site/mcp-skills-docs/optimization-data"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Optimization",
  description:
    "What the MCP server costs and what it buys: conformance, input tokens and dollars per screen with and without it, version by version, and the levers that moved them.",
}

export default function OptimizationPage() {
  const doc = sectionDoc("optimization.md")
  const rescue = cheapestRescue()
  const next = nextLever()

  return (
    <DocsPage
      nav={mcpSkillsNav()}
      navLabel="MCP & Skills"
      toc={doc.parts.map((part) => ({ id: part.id, label: part.label }))}
    >
      <PageHeader
        eyebrow="MCP & Skills"
        title={doc.title}
        lead={<InlineMarkdown from={doc.source}>{doc.lead}</InlineMarkdown>}
      >
        <Headline />
      </PageHeader>

      <DocParts
        doc={doc}
        blocks={{
          versions: <Versions rows={measurements()} />,
          returns: <Returns />,
          rescue: rescue ? (
            <Rescue data={rescue} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No task fails every pass with no context and passes every pass
              with the server.
            </p>
          ),
          levers: (table) => (
            <Collapsible className="flex min-w-0 flex-col gap-2">
              <DisclosureTrigger>Changes by release</DisclosureTrigger>
              <CollapsibleContent className="min-w-0">
                {table}
              </CollapsibleContent>
            </Collapsible>
          ),
          next: next ? (
            <Next data={next} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No run with the server records what its tools sent back.
            </p>
          ),
        }}
      />
    </DocsPage>
  )
}
