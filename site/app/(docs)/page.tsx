import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { headingVariants } from "@/components/ui/heading"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { SECTIONS } from "@/site/lib/nav"
import { GITHUB_URL, META, sourceUrl, VERSION } from "@/site/lib/site"
import {
  compositionRules,
  divergences,
  glossary,
  install,
  intro,
  sectionFacts,
  ships,
  stats,
  targetSize,
} from "@/site/overview/data"
import { CompositionRules } from "@/site/overview/composition-rules"
import { GetStarted } from "@/site/overview/get-started"
import { Glossary } from "@/site/overview/glossary"
import { OverviewFrame } from "@/site/overview/overview-frame"
import { Rules } from "@/site/overview/rules"
import { DocSection } from "@/site/ui/doc-section"
import { LINK } from "@/site/ui/link"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

const TOC = [
  { id: "at-a-glance", label: "At a glance" },
  { id: "get-started", label: "Get started" },
  { id: "rules", label: "Rules" },
  { id: "composition-rules", label: "Composition rules" },
  { id: "sections", label: "Sections" },
  { id: "glossary", label: "Glossary" },
]

/** One line for each section of the site, under its card. */
const SECTION_LINES: Record<string, string> = {
  "/foundations/":
    "The tokens by family, with their light and dark values, and the guidelines for focus, icons and content.",
  "/components/":
    "Each component with a live playground, its anatomy, properties, states, tokens and accessibility.",
  "/patterns/":
    "Screens that do one job, composed from the components: the rules, the structure and the code.",
  "/mcp-and-skills/":
    "How an agent reads the design system: what the MCP server serves, how it compiles its answers, and the UI guard skill.",
  "/changes/":
    "Every release, newest first, each changeset with its category and its commit.",
  "/audits/":
    "What the checks measure: eval conformance, contrast, and the declared shadcn/ui divergences.",
}

export default function OverviewPage() {
  const facts = sectionFacts()

  return (
    <OverviewFrame toc={TOC}>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">v{VERSION}</Badge>
            <span>{META.framework}</span>
          </span>
        }
        title={META.name}
        lead={<InlineMarkdown>{intro()}</InlineMarkdown>}
      >
        <ul className="flex max-w-3xl list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          {ships().map((item) => (
            <li key={item}>
              <InlineMarkdown from="README.md">{item}</InlineMarkdown>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="#get-started">
              Get started
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/components/">Browse the components</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={GITHUB_URL}>
              <GithubLogoIcon aria-hidden="true" />
              Source on GitHub
            </Link>
          </Button>
        </div>
      </PageHeader>

      <DocSection
        id="at-a-glance"
        title="At a glance"
        description="Counted from the repository at build time."
      >
        <dl className="grid grid-cols-2 gap-px border bg-border lg:grid-cols-4">
          {stats().map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 bg-background p-4"
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="font-heading text-3xl font-semibold tracking-tight">
                {stat.value}
              </dd>
              <dd className="text-xs text-muted-foreground">{stat.detail}</dd>
            </div>
          ))}
        </dl>
      </DocSection>

      <DocSection
        id="get-started"
        title="Get started"
        description="Four channels, one version. Use the registry for the components, then give your agent the MCP server, the UI guard skill and the lint rules."
      >
        <GetStarted install={install()} />
      </DocSection>

      <DocSection
        id="rules"
        title="Rules"
        description="What every screen built with the design system follows. The ESLint plugin and the MCP server check the first four in your code. The last two are built into the tokens and the components, and checked in the design system's own CI."
      >
        <Rules targetSize={targetSize()} divergences={divergences()} />
      </DocSection>

      <DocSection
        id="composition-rules"
        title="Composition rules"
        description={
          <>
            The choices the specs make for you, as the MCP server serves them (
            <code className="font-mono text-xs">
              dsaireadable_get_design_rules
            </code>
            ). A spec cites the rule that applies to it by its identifier.
          </>
        }
      >
        <CompositionRules rules={compositionRules()} />
      </DocSection>

      <DocSection id="sections" title="Sections">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.filter((item) => item.href !== "/").map((item) => (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                className={cn(
                  "group flex flex-1 flex-col gap-2 border p-5 transition-colors hover:bg-muted",
                  FOCUS_OUTLINE_RESET,
                  FOCUS_RING
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-between gap-2",
                    headingVariants({ level: 4 })
                  )}
                >
                  {item.label}
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                  />
                </span>
                <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {SECTION_LINES[item.href]}
                </span>
                {facts[item.href] ? (
                  <span className="text-xs text-muted-foreground">
                    {facts[item.href]}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection
        id="glossary"
        title="Glossary"
        description={
          <>
            The terms the specs use, as the MCP server serves them (
            <code className="font-mono text-xs">dsaireadable_get_glossary</code>
            ).
          </>
        }
      >
        <Glossary terms={glossary()} />
        <p className="text-xs text-muted-foreground">
          <Link
            href={sourceUrl("design-system.index.json")}
            className={cn(LINK, "inline-flex items-center gap-1")}
          >
            design-system.index.json
            <ArrowUpRightIcon aria-hidden="true" />
          </Link>{" "}
          holds the source of most terms.
        </p>
      </DocSection>
    </OverviewFrame>
  )
}
