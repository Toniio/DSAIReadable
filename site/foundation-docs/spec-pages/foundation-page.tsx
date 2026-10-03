import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import {
  DoDont,
  NumberedRules,
} from "@/site/foundation-docs/spec-pages/do-dont"
import { LiveExample } from "@/site/foundation-docs/spec-pages/live-example"
import { LINK } from "@/site/ui/link"
import {
  foundationDoc,
  foundationRules,
} from "@/site/foundation-docs/spec-pages/spec"
import {
  foundationExampleCode,
  foundationExampleKeys,
} from "@/site/lib/foundation-examples"
import { foundation, FOUNDATION_GROUPS, foundationsNav } from "@/site/lib/nav"
import { sourceUrl } from "@/site/lib/site"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown, Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"
import type { TocItem } from "@/site/ui/page-toc"

/** The group a foundation sits in, in the navigation: `Tokens`, `Guidelines`. */
function groupOf(slug: string): string | undefined {
  return FOUNDATION_GROUPS.find((group) =>
    group.items.some((item) => item.slug === slug)
  )?.label
}

/** The live examples of a spec, `radius-1`…, with the code each one renders. */
function specExamples(file: string): { key: string; code: string }[] {
  const name = file.replace(/\.md$/, "")
  return foundationExampleKeys()
    .filter((key) => new RegExp(`^${name}-\\d+$`).test(key))
    .sort(
      (a, b) =>
        Number(a.slice(name.length + 1)) - Number(b.slice(name.length + 1))
    )
    .map((key) => ({ key, code: foundationExampleCode(key).trim() }))
}

/**
 * A spec section's Markdown, with each complete module it writes drawn live
 * above its code, in its place: the module is shown once, where the spec
 * explains it.
 */
function SpecBody({
  body,
  source,
  examples,
}: {
  body: string
  source: string
  examples: { key: string; code: string }[]
}) {
  const title = source.split("/").at(-1) ?? source
  const pieces: ReactNode[] = []
  let rest = body
  for (const example of examples) {
    const fence = `\`\`\`tsx\n${example.code}\n\`\`\``
    const at = rest.indexOf(fence)
    if (at < 0) continue
    const before = rest.slice(0, at).trim()
    if (before)
      pieces.push(
        <Markdown key={`${example.key}-before`} from={source}>
          {before}
        </Markdown>
      )
    pieces.push(
      <LiveExample key={example.key} id={example.key} title={title} />
    )
    rest = rest.slice(at + fence.length)
  }
  if (rest.trim())
    pieces.push(
      <Markdown key="rest" from={source}>
        {rest.trim()}
      </Markdown>
    )
  return <>{pieces}</>
}

/**
 * The frame of a Foundations page: the header, the page's own visual
 * sections (its children), then the spec, section by section. The spec's
 * Usage Rules come from ux-writing.json, laid out as Do and Don't; a section
 * the page lays out itself replaces the spec's Markdown through `custom`,
 * and a complete module of the spec renders live where the spec writes it.
 */
export function FoundationPage({
  slug,
  sections = [],
  children,
  custom = {},
  rules,
  after,
}: {
  slug: string
  /** The page's own sections, in the order the children render them. */
  sections?: TocItem[]
  children?: ReactNode
  /** A spec section laid out by the page, by its id: replaces its Markdown. */
  custom?: Record<string, ReactNode>
  /** For a foundation without a spec: its Do and Don't. */
  rules?: { dos: string[]; donts: string[] }
  /** Sections after the spec: the glossary. */
  after?: { toc: TocItem[]; node: ReactNode }
}) {
  const entry = foundation(slug)
  const doc = entry.spec ? foundationDoc(entry.spec) : undefined
  const specRules = entry.spec ? foundationRules(entry.spec) : undefined
  const examples = entry.spec ? specExamples(entry.spec) : []
  const group = groupOf(slug)

  const toc: TocItem[] = [
    ...sections,
    ...(rules && !doc ? [{ id: "usage-rules", label: "Usage rules" }] : []),
    ...(doc?.parts.map((part) => ({
      id: part.id,
      label: part.usageRules ? "Usage rules" : part.label,
    })) ?? []),
    ...(after?.toc ?? []),
  ]

  return (
    <DocsPage nav={foundationsNav()} navLabel="Foundations" toc={toc}>
      <PageHeader
        eyebrow={
          <span>
            <Link href="/foundations/" className={LINK}>
              Foundations
            </Link>
            {group ? ` / ${group}` : null}
          </span>
        }
        title={entry.label}
        lead={entry.summary}
      >
        {doc?.intro ? (
          <Markdown from={doc.source} className="max-w-3xl">
            {doc.intro}
          </Markdown>
        ) : null}
        {doc ? (
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
        ) : null}
      </PageHeader>

      <>
        {children}

        {rules && !doc ? (
          <DocSection id="usage-rules" title="Usage rules">
            <DoDont dos={rules.dos} donts={rules.donts} />
          </DocSection>
        ) : null}

        {doc?.parts.map((part) =>
          part.usageRules ? (
            <DocSection
              key={part.id}
              id={part.id}
              title="Usage rules"
              description="The spec's rules, as agents read them from the MCP server."
            >
              {specRules?.numbered.length ? (
                <NumberedRules items={specRules.numbered} from={doc.source} />
              ) : null}
              <DoDont
                dos={specRules?.dos ?? []}
                donts={specRules?.donts ?? []}
                from={doc.source}
              />
              {specRules?.notes.length ? (
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {specRules.notes.map((note) => (
                    <li key={note}>
                      <InlineMarkdown from={doc.source}>{note}</InlineMarkdown>
                    </li>
                  ))}
                </ul>
              ) : null}
              {part.body ? (
                <Markdown from={doc.source}>{part.body}</Markdown>
              ) : null}
            </DocSection>
          ) : (
            <DocSection key={part.id} id={part.id} title={part.label}>
              {custom[part.id] ?? (
                <SpecBody
                  body={part.body}
                  source={doc.source}
                  examples={examples}
                />
              )}
            </DocSection>
          )
        )}

        {after?.node}
      </>
    </DocsPage>
  )
}
