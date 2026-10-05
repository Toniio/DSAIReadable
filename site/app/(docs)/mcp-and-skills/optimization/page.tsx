import type { Metadata } from "next"

import { mcpSkillsNav } from "@/site/lib/nav"
import { sectionDoc } from "@/site/mcp-skills-docs/data"
import { DocParts } from "@/site/mcp-skills-docs/doc-parts"
import {
  BuildSkill,
  Failures,
  Headline,
  Next,
  Rescue,
  Returns,
  Versions,
} from "@/site/mcp-skills-docs/optimization"
import {
  buildSkill,
  cheapestRescue,
  failures,
  latest,
  measurements,
  nextLever,
} from "@/site/mcp-skills-docs/optimization-data"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Optimization",
  description:
    "What the MCP server costs and what it buys: conformance, input tokens and dollars per screen with and without it, version by version, the levers that moved them, and the skill that cost more.",
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
          failures: (
            <Failures data={failures()} version={latest().none.version} />
          ),
          rescue: rescue ? (
            <Rescue data={rescue} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No task fails every pass with no context and passes every pass
              with the server.
            </p>
          ),
          "build-skill": <BuildSkill pairs={buildSkill()} />,
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
