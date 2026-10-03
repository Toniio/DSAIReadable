import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { plain } from "@/site/lib/markdown"
import { patternsNav } from "@/site/lib/nav"
import { type Pattern, patterns } from "@/site/lib/patterns"
import { fillsViewport, KIND_LABEL } from "@/site/pattern-docs/kinds"
import { PatternThumbnail } from "@/site/pattern-docs/pattern-thumbnail"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "The page patterns of the design system: screens that do one job, composed from its components.",
}

const TOC = [
  { id: "tasks", label: "Tasks" },
  { id: "interface", label: "Interface" },
]

/**
 * The card is one link: its title stretches over the whole card, and the
 * focus indicator is drawn around the card, not the title.
 */
const CARD_LINK = cn(
  "after:absolute after:inset-0 focus-visible:after:ring-(length:--space-focus-ring-width) focus-visible:after:ring-ring/50",
  FOCUS_OUTLINE_RESET
)

function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <li className="group relative flex flex-col border bg-background">
      <PatternThumbnail
        slug={pattern.name}
        title={pattern.title}
        fill={fillsViewport(pattern)}
      />
      <div className="flex flex-1 flex-col gap-2 p-4 transition-colors group-hover:bg-muted">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/patterns/${pattern.name}/`}
            className={cn("font-heading text-base font-semibold", CARD_LINK)}
          >
            {pattern.title}
          </Link>
          <Badge variant="secondary">{KIND_LABEL[pattern.kind]}</Badge>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          <InlineMarkdown>{pattern.role}</InlineMarkdown>
        </p>
        <p className="text-xs text-muted-foreground">
          {pattern.components.length} components · {pattern.usage.length} rules
        </p>
      </div>
    </li>
  )
}

export default function PatternsPage() {
  const all = patterns()
  const tasks = all.filter((entry) => entry.kind === "task")
  const ui = all.filter((entry) => entry.kind === "ui")

  return (
    <DocsPage nav={patternsNav()} navLabel="Patterns" toc={TOC}>
      <PageHeader
        title="Patterns"
        lead={
          <>
            {all.length} page patterns: how the components come together on a
            screen that does one job. Each one sets its rules, its regions, the
            components it uses, its spacing and its wording, with a code example
            an agent copies.
          </>
        }
      />

      <DocSection
        id="tasks"
        title="Tasks"
        description={`${tasks.length} things a person does on a page: ${tasks
          .map((entry) => plain(entry.title).toLowerCase())
          .join(", ")}.`}
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((entry) => (
            <PatternCard key={entry.name} pattern={entry} />
          ))}
        </ul>
      </DocSection>

      <DocSection
        id="interface"
        title="Interface"
        description={`${ui.length} concerns every screen handles: ${ui
          .map((entry) => plain(entry.title).toLowerCase())
          .join(", ")}.`}
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ui.map((entry) => (
            <PatternCard key={entry.name} pattern={entry} />
          ))}
        </ul>
      </DocSection>
    </DocsPage>
  )
}
