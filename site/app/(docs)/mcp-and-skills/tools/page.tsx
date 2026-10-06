import type { Metadata } from "next"

import { mcpSkillsNav } from "@/site/lib/nav"
import { sectionDoc } from "@/site/mcp-skills-docs/data"
import { DocParts } from "@/site/mcp-skills-docs/doc-parts"
import {
  PromptTable,
  ResourceTable,
} from "@/site/mcp-skills-docs/resources-prompts"
import { ToolCards } from "@/site/mcp-skills-docs/tool-card"
import {
  recordedPrompts,
  recordedResources,
  recordedTools,
  toolCategories,
} from "@/site/mcp-skills-docs/tools-data"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Every tool of the MCP server with its definition and a real answer, and the resources and prompts.",
}

export default function ToolsPage() {
  const doc = sectionDoc("tools.md")
  const { tools } = recordedTools()
  const resources = recordedResources()
  const { prompts, buildScreenBudget } = recordedPrompts()
  const stats = [
    {
      label: "Prompts",
      value: prompts.length,
      detail: "A task opened on the server's workflow",
    },
    {
      label: "Tools",
      value: tools.length,
      detail: "Read-only, each named dsaireadable_*",
    },
    {
      label: "Resources",
      value: resources.length,
      detail: "Attached without a tool call",
    },
  ]

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
        <dl className="grid gap-px border bg-border sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 bg-background p-4"
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </dd>
              <dd className="text-xs break-words text-muted-foreground">
                {stat.detail}
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <DocParts
        doc={doc}
        blocks={{
          ...Object.fromEntries(
            toolCategories().map((category) => [
              category.id,
              <ToolCards key={category.id} tools={category.tools} />,
            ])
          ),
          resources: <ResourceTable resources={resources} />,
          prompts: <PromptTable prompts={prompts} budget={buildScreenBudget} />,
        }}
      />
    </DocsPage>
  )
}
