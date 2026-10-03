import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import { DoDont, NumberedRules } from "@/site/foundation-docs/b/do-dont"
import { LINK } from "@/site/ui/link"
import {
  foundationDoc,
  foundationRules,
  tokenAdvice,
} from "@/site/foundation-docs/b/spec"
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

/**
 * The frame of a Foundations page: the header, the page's own visual
 * sections (its children), then the spec, section by section. The spec's
 * Usage Rules come from ux-writing.json, laid out as Do and Don't; a section
 * the page lays out itself replaces the spec's Markdown through `custom`.
 */
export function FoundationPage({
  slug,
  sections = [],
  children,
  custom = {},
  advice = [],
  rules,
  after,
}: {
  slug: string
  /** The page's own sections, in the order the children render them. */
  sections?: TocItem[]
  children?: ReactNode
  /** A spec section laid out by the page, by its id: replaces its Markdown. */
  custom?: Record<string, ReactNode>
  /** Token groups whose do and don't advice joins numbered usage rules. */
  advice?: string[]
  /** For a foundation without a spec: its Do and Don't. */
  rules?: { dos: string[]; donts: string[] }
  /** Sections after the spec: the glossary. */
  after?: { toc: TocItem[]; node: ReactNode }
}) {
  const entry = foundation(slug)
  const doc = entry.spec ? foundationDoc(entry.spec) : undefined
  const specRules = entry.spec ? foundationRules(entry.spec) : undefined
  const tokenRules = advice.length ? tokenAdvice(advice) : undefined
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
              description={
                tokenRules?.dos.length || tokenRules?.donts.length
                  ? "The spec's rules, as agents read them from the MCP server, then the do and don't its tokens carry."
                  : "The spec's rules, as agents read them from the MCP server."
              }
            >
              {specRules?.numbered.length ? (
                <NumberedRules items={specRules.numbered} from={doc.source} />
              ) : null}
              <DoDont
                dos={[...(specRules?.dos ?? []), ...(tokenRules?.dos ?? [])]}
                donts={[
                  ...(specRules?.donts ?? []),
                  ...(tokenRules?.donts ?? []),
                ]}
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
                <Markdown from={doc.source}>{part.body}</Markdown>
              )}
            </DocSection>
          )
        )}

        {after?.node}
      </>
    </DocsPage>
  )
}
