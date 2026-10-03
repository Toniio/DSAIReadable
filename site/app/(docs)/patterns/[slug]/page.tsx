import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { plain } from "@/site/lib/markdown"
import { patternsNav } from "@/site/lib/nav"
import { pattern, patterns } from "@/site/lib/patterns"
import { sourceUrl } from "@/site/lib/site"
import { fillsViewport, KIND_LABEL } from "@/site/pattern-docs/kinds"
import { linkComponents } from "@/site/pattern-docs/links"
import { PatternPreview } from "@/site/pattern-docs/pattern-preview"
import { CodeBlock } from "@/site/ui/code-block"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"
import { LINK } from "@/site/ui/link"

export const dynamicParams = false

export function generateStaticParams() {
  return patterns().map((entry) => ({ slug: entry.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const entry = pattern((await params).slug)
  if (!entry) return {}
  return { title: `${entry.title} pattern`, description: plain(entry.role) }
}

const MUST = "**MUST** — "
const MUST_NOT = "**MUST NOT** — "

const TOC = [
  { id: "usage", label: "Usage" },
  { id: "structure", label: "Structure" },
  { id: "components", label: "Components" },
  { id: "spacing", label: "Spacing" },
  { id: "content", label: "Content" },
  { id: "code", label: "Code" },
  { id: "related", label: "Related" },
]

/** A rule read alone starts a sentence: `lay the fields out` → `Lay the fields out`. */
function sentence(rule: string): string {
  return /^[a-z]/.test(rule)
    ? rule.charAt(0).toUpperCase() + rule.slice(1)
    : rule
}

/** A list of rules, each without its MUST prefix: the column says it. */
function RuleList({
  rules,
  prefix,
  from,
}: {
  rules: string[]
  prefix: string
  from: string
}) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
      {rules.map((rule) => (
        <li key={rule}>
          <InlineMarkdown from={from}>
            {sentence(rule.replace(prefix, ""))}
          </InlineMarkdown>
        </li>
      ))}
    </ul>
  )
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const entry = pattern((await params).slug)
  if (!entry) notFound()
  const source = entry.source
  const musts = entry.usage.filter((rule) => rule.startsWith(MUST))
  const mustNots = entry.usage.filter((rule) => rule.startsWith(MUST_NOT))
  const notes = entry.usage.filter(
    (rule) => !rule.startsWith(MUST) && !rule.startsWith(MUST_NOT)
  )
  const situations = entry.content.some((row) => row.situation)
  const elements = entry.content.some((row) => row.element)
  const contentHeader =
    situations && elements
      ? "Element or situation"
      : situations
        ? "Situation"
        : "Element"

  return (
    <DocsPage nav={patternsNav()} navLabel="Patterns" toc={TOC}>
      <PageHeader
        eyebrow={
          <span>
            <Link href="/patterns/" className={LINK}>
              Patterns
            </Link>{" "}
            / {KIND_LABEL[entry.kind]}
          </span>
        }
        title={entry.title}
        lead={<InlineMarkdown from={source}>{entry.role}</InlineMarkdown>}
      >
        <dl className="grid grid-cols-2 gap-px border bg-border lg:grid-cols-4">
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Kind</dt>
            <dd>
              <Badge variant="secondary">{KIND_LABEL[entry.kind]}</Badge>
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Regions</dt>
            <dd className="text-sm">{entry.structure.length}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Components</dt>
            <dd className="text-sm">{entry.components.length}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Spec</dt>
            <dd className="text-sm">
              <Link
                href={sourceUrl(source)}
                className={cn(LINK, "inline-flex items-center gap-1")}
              >
                {source.split("/").pop()}
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <PatternPreview
        slug={entry.name}
        title={entry.title}
        fill={fillsViewport(entry)}
      />

      <DocSection id="usage" title="Usage">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 border p-4">
            <Badge variant="success">Do</Badge>
            {musts.length ? (
              <RuleList rules={musts} prefix={MUST} from={source} />
            ) : (
              <p className="text-sm text-muted-foreground">No MUST rule.</p>
            )}
          </div>
          <div className="flex flex-col gap-3 border p-4">
            <Badge variant="destructive">Don&apos;t</Badge>
            {mustNots.length ? (
              <RuleList rules={mustNots} prefix={MUST_NOT} from={source} />
            ) : (
              <p className="text-sm text-muted-foreground">No MUST NOT rule.</p>
            )}
          </div>
        </div>
        {notes.length ? (
          <RuleList rules={notes} prefix="" from={source} />
        ) : null}
      </DocSection>

      <DocSection
        id="structure"
        title="Structure"
        description="The regions of the screen, from top to bottom, and what fills each one."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Components</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.structure.map((row) => (
              <TableRow key={row.region}>
                <TableCell className="align-top font-medium whitespace-normal">
                  {row.region}
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <InlineMarkdown from={source}>{row.content}</InlineMarkdown>
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <InlineMarkdown from={source}>
                    {linkComponents(row.components)}
                  </InlineMarkdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DocSection>

      <DocSection
        id="components"
        title="Components"
        description="The components the pattern uses, the variant or props it sets, and the job each one does."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Variant / props</TableHead>
              <TableHead>Job</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.components.map((row, index) => (
              <TableRow key={`${row.component}-${index}`}>
                <TableCell className="align-top">
                  <InlineMarkdown from={source}>
                    {linkComponents(row.component)}
                  </InlineMarkdown>
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  {row.variant_props === "—" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <InlineMarkdown from={source}>
                      {row.variant_props}
                    </InlineMarkdown>
                  )}
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <InlineMarkdown from={source}>{row.job}</InlineMarkdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DocSection>

      <DocSection id="spacing" title="Spacing">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
          {entry.spacing.map((rule) => (
            <li key={rule}>
              <InlineMarkdown from={source}>{rule}</InlineMarkdown>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection
        id="content"
        title="Content"
        description="What the screen says, and what it never says."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{contentHeader}</TableHead>
              <TableHead>Write</TableHead>
              <TableHead>Not</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.content.map((row, index) => (
              <TableRow key={`${row.element ?? row.situation}-${index}`}>
                <TableCell className="align-top font-medium whitespace-normal">
                  {row.element ?? row.situation}
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <span className="flex items-start gap-2">
                    <CheckIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-success"
                    />
                    <span>
                      <InlineMarkdown from={source}>{row.write}</InlineMarkdown>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="align-top whitespace-normal text-muted-foreground">
                  <span className="flex items-start gap-2">
                    <XIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                    />
                    <span>
                      <InlineMarkdown from={source}>{row.not}</InlineMarkdown>
                    </span>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DocSection>

      <DocSection
        id="code"
        title="Code"
        description="The spec's example, as an agent copies it. The preview above renders it."
      >
        <CodeBlock
          code={entry.code_example}
          language="tsx"
          title={`${entry.name}.tsx`}
        />
      </DocSection>

      <DocSection id="related" title="Related">
        {entry.cross_references.length ? (
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
            {entry.cross_references.map((reference) => (
              <li key={reference}>
                <InlineMarkdown from={source}>{reference}</InlineMarkdown>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No cross-reference.</p>
        )}
      </DocSection>
    </DocsPage>
  )
}
