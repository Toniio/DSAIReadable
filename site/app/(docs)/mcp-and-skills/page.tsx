import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { answerCap } from "@/site/lib/mcp"
import { mcpSkillsNav } from "@/site/lib/nav"
import { GITHUB_URL, sourceUrl, VERSION } from "@/site/lib/site"
import {
  medianSession,
  pipelineSteps,
  sectionDoc,
  serverFacts,
  size,
  uiGuard,
} from "@/site/mcp-skills-docs/data"
import { DocParts } from "@/site/mcp-skills-docs/doc-parts"
import { Pipeline } from "@/site/mcp-skills-docs/pipeline"
import { SessionBlock } from "@/site/mcp-skills-docs/session"
import { UiGuard } from "@/site/mcp-skills-docs/ui-guard"
import { DocsPage } from "@/site/ui/docs-page"
import { LINK } from "@/site/ui/link"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "MCP & Skills",
  description:
    "How an agent reads the design system: why an MCP server beside llms.txt, how its answers are compiled, a recorded session tool by tool, and the UI guard skill.",
}

export default function HowItWorksPage() {
  const doc = sectionDoc("how-it-works.md")
  const facts = serverFacts()
  const session = medianSession()
  const guard = uiGuard()
  const stats = [
    {
      label: "Tools",
      value: facts.tools,
      detail: "Read-only, each named dsaireadable_*",
    },
    {
      label: "Resources",
      value: facts.resources,
      detail: "A spec, a token, the guidelines",
    },
    {
      label: "Prompts",
      value: facts.prompts,
      detail: "A task opened on the server's workflow",
    },
    {
      label: facts.skills.length === 1 ? "Skill" : "Skills",
      value: facts.skills.length,
      detail: facts.skills.join(", "),
    },
    {
      label: "Context cache",
      value: facts.cacheFiles,
      detail: `JSON files, ${size(facts.cacheBytes)}`,
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
        <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-5">
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
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/#get-started">
              Install the server and the skill
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`${GITHUB_URL}/tree/v${VERSION}/mcp-server`}>
              <GithubLogoIcon aria-hidden="true" />
              The server on GitHub
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Written in{" "}
          <Link
            href={sourceUrl(doc.source)}
            className={cn(LINK, "inline-flex items-center gap-1")}
          >
            {doc.source}
            <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        </p>
      </PageHeader>

      <DocParts
        doc={doc}
        blocks={{
          pipeline: <Pipeline steps={pipelineSteps()} />,
          session: session ? (
            <SessionBlock session={session} cap={answerCap()} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No session is recorded with the server yet.
            </p>
          ),
          "ui-guard": <UiGuard {...guard} />,
        }}
      />
    </DocsPage>
  )
}
