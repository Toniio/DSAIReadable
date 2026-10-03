import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { ChangeLog, type LogRelease } from "@/site/change-docs/change-log"
import {
  categories,
  categoryTone,
  pendingChanges,
  releases,
  zeroVersionRule,
} from "@/site/change-docs/data"
import { plain } from "@/site/lib/markdown"
import type { NavGroup } from "@/site/lib/nav"
import { GITHUB_URL, sourceUrl, VERSION } from "@/site/lib/site"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"
import { LINK } from "@/site/ui/link"

export const metadata: Metadata = {
  title: "Changes",
  description:
    "Every release of the design system, newest first, each change with its category and its commit.",
}

const POLICY = `${sourceUrl("CONTRIBUTING.md")}#versioning-and-releases`

/**
 * The section's pages: the change log itself, and where the rest of a
 * change's story is told.
 */
function changesNav(): NavGroup[] {
  return [
    { items: [{ label: "Change log", href: "/changes/" }] },
    {
      label: "Related",
      items: [
        { label: "Deprecations", href: "/audits/#deprecations" },
        { label: "Versioning policy", href: POLICY },
        { label: "CHANGELOG.md", href: sourceUrl("CHANGELOG.md") },
      ],
    },
  ]
}

export default function ChangesPage() {
  const all = releases()
  const pending = pendingChanges()
  const policy = categories()
  const zero = zeroVersionRule()
  const latest = all[0]
  const total = all.reduce((sum, release) => sum + release.total, 0)

  const counts = new Map<string, number>()
  for (const release of all)
    for (const group of release.sections)
      for (const entry of group.entries)
        if (entry.category)
          counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1)
  const order = policy.map((category) => category.name)
  const chips = [...counts]
    .sort(
      ([a], [b]) =>
        (order.indexOf(a) < 0 ? order.length : order.indexOf(a)) -
          (order.indexOf(b) < 0 ? order.length : order.indexOf(b)) ||
        a.localeCompare(b)
    )
    .map(([name, count]) => ({ name, count }))

  const log: LogRelease[] = all.map((release, index) => {
    const previous = all[index + 1]
    return {
      version: release.version,
      id: release.id,
      date: release.date,
      total: release.total,
      tagUrl: `${GITHUB_URL}/tree/v${release.version}`,
      compareUrl: previous
        ? `${GITHUB_URL}/compare/v${previous.version}...v${release.version}`
        : undefined,
      sections: release.sections.map((group) => ({
        name: group.name,
        entries: group.entries.map((entry, position) => ({
          key: `${release.version}-${group.name}-${position}`,
          category: entry.category,
          tone: entry.category ? categoryTone(entry.category) : undefined,
          commit: entry.commit,
          search: [entry.category, group.name, entry.commit, plain(entry.text)]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
          body: (
            <InlineMarkdown from="CHANGELOG.md">{entry.text}</InlineMarkdown>
          ),
        })),
      })),
    }
  })

  const toc = [
    ...(pending.length ? [{ id: "pending", label: "Pending" }] : []),
    ...all.map((release) => ({ id: release.id, label: `v${release.version}` })),
    { id: "categories", label: "Categories" },
  ]

  return (
    <DocsPage nav={changesNav()} navLabel="Changes" toc={toc}>
      <PageHeader
        title="Changes"
        lead={
          <>
            Every release of the design system, newest first. One version names
            the tokens, the components, the registry, the MCP server and the
            ESLint plugin, and each change says what it moves with its category.
          </>
        }
      >
        <dl className="grid grid-cols-2 gap-px border bg-border lg:grid-cols-4">
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Current version</dt>
            <dd className="text-sm font-medium">v{VERSION}</dd>
            {latest?.version === VERSION && latest.date ? (
              <dd className="text-xs text-muted-foreground">
                <time dateTime={latest.date.iso}>{latest.date.label}</time>
              </dd>
            ) : null}
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Releases</dt>
            <dd className="text-sm font-medium">{all.length}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Changes</dt>
            <dd className="text-sm font-medium">{total}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Pending</dt>
            <dd className="text-sm font-medium">{pending.length}</dd>
          </div>
        </dl>
      </PageHeader>

      {pending.length ? (
        <DocSection
          id="pending"
          title="Pending"
          description={`Changesets merged after v${VERSION}: they ship with the next release.`}
        >
          <ul className="flex flex-col border-t">
            {pending.map((change) => (
              <li
                key={change.file}
                className="flex flex-col gap-2 border-b py-3 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-36 sm:flex-col sm:items-start">
                  {change.category ? (
                    <Badge variant={categoryTone(change.category)}>
                      {change.category}
                    </Badge>
                  ) : null}
                  {change.bump ? (
                    <span className="text-xs text-muted-foreground">
                      {change.bump}
                    </span>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-sm leading-relaxed">
                    <InlineMarkdown from={`.changeset/${change.file}`}>
                      {change.text}
                    </InlineMarkdown>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    .changeset/{change.file}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </DocSection>
      ) : null}

      <ChangeLog releases={log} categories={chips} githubUrl={GITHUB_URL} />

      <DocSection
        id="categories"
        title="Categories"
        description="Each changeset starts with the category that says what changed, and the bump follows from it."
      >
        <dl className="flex flex-col border-t">
          {policy.map((category) => (
            <div
              key={category.name}
              className="flex flex-col gap-2 border-b py-3 sm:flex-row sm:items-start sm:gap-4"
            >
              <dt className="shrink-0 sm:w-36">
                <Badge variant={categoryTone(category.name)}>
                  {category.name}
                </Badge>
              </dt>
              <dd className="min-w-0 flex-1 text-sm leading-relaxed wrap-break-word">
                <InlineMarkdown from="CONTRIBUTING.md">
                  {category.change}
                </InlineMarkdown>
              </dd>
              <dd className="text-sm leading-relaxed wrap-break-word text-muted-foreground sm:w-56">
                <span className="sr-only">Bump: </span>
                <InlineMarkdown from="CONTRIBUTING.md">
                  {category.bump}
                </InlineMarkdown>
              </dd>
            </div>
          ))}
        </dl>
        {zero ? (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            <InlineMarkdown from="CONTRIBUTING.md">{zero}</InlineMarkdown>
          </p>
        ) : null}
        <p className="text-sm">
          <Link href={POLICY} className={LINK}>
            Versioning and releases, in CONTRIBUTING.md
            <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        </p>
      </DocSection>
    </DocsPage>
  )
}
