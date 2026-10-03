"use client"

import { type ReactNode, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRightIcon, XIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { CategoryTone, ReleaseDate } from "@/site/change-docs/data"
import { LINK } from "@/site/ui/link"

/**
 * A link with its arrow: the icon is a block under the stylesheet's reset, so
 * the link lays its text and icon out on one line.
 */
const EXTERNAL_LINK = cn(LINK, "inline-flex items-center gap-1")

interface LogEntry {
  key: string
  category?: string
  tone?: CategoryTone
  commit?: string
  /** The lowercase text the search reads: the change, its category, its commit. */
  search: string
  /** The change, rendered. */
  body: ReactNode
}

export interface LogRelease {
  version: string
  id: string
  date?: ReleaseDate
  total: number
  tagUrl: string
  /** The diff from the release before; none for the first one. */
  compareUrl?: string
  sections: { name: string; entries: LogEntry[] }[]
}

/**
 * The releases as a timeline, newest first, with a filter by changeset
 * category and a text search.
 */
export function ChangeLog({
  releases,
  categories,
  githubUrl,
}: {
  releases: LogRelease[]
  categories: { name: string; count: number }[]
  githubUrl: string
}) {
  const searchId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const needle = query.trim().toLowerCase()
  const total = releases.reduce((sum, release) => sum + release.total, 0)

  const visible = useMemo(() => {
    const keep = (entry: LogEntry) =>
      (selected.length === 0 ||
        (entry.category !== undefined && selected.includes(entry.category))) &&
      (needle === "" || entry.search.includes(needle))
    return releases.map((release) => ({
      ...release,
      sections: release.sections
        .map((group) => ({ ...group, entries: group.entries.filter(keep) }))
        .filter((group) => group.entries.length > 0),
    }))
  }, [releases, selected, needle])

  const shown = visible.reduce(
    (sum, release) =>
      sum +
      release.sections.reduce(
        (count, group) => count + group.entries.length,
        0
      ),
    0
  )
  const filtered = selected.length > 0 || needle !== ""

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={searchId}>Search the changes</Label>
          <Input
            ref={searchRef}
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Button, contrast, a commit…"
            className="max-w-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Changeset category
          </p>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            aria-label="Changeset category"
            value={selected}
            onValueChange={setSelected}
            className="flex-wrap"
          >
            {categories.map((category) => (
              <ToggleGroupItem key={category.name} value={category.name}>
                {category.name}
                <span className="text-muted-foreground">{category.count}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex min-h-target flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {filtered
              ? `${shown} of ${total} changes match.`
              : `${total} changes in ${releases.length} releases.`}
          </p>
          {filtered ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setSelected([])
                // The button leaves with the filters it clears: focus goes
                // back to the search, or it would fall to the page's start.
                searchRef.current?.focus()
              }}
            >
              <XIcon />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <ol className="flex flex-col">
        {visible.map((release) => (
          <li
            key={release.version}
            className="relative border-l pb-12 pl-6 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="absolute top-2 -left-1.5 size-3 rounded-full border border-ring bg-background"
            />
            <section
              id={release.id}
              aria-labelledby={`${release.id}-title`}
              className="flex scroll-mt-20 flex-col gap-6"
            >
              <header className="flex flex-col gap-2">
                <Heading level={2} id={`${release.id}-title`}>
                  v{release.version}
                </Heading>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {release.date ? (
                    <time dateTime={release.date.iso}>
                      {release.date.label}
                    </time>
                  ) : null}
                  <span>
                    {release.total} {release.total === 1 ? "change" : "changes"}
                  </span>
                  <Link href={release.tagUrl} className={EXTERNAL_LINK}>
                    Tag v{release.version}
                    <ArrowUpRightIcon aria-hidden="true" />
                  </Link>
                  {release.compareUrl ? (
                    <Link href={release.compareUrl} className={EXTERNAL_LINK}>
                      Diff from the release before
                      <ArrowUpRightIcon aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </header>

              {release.sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No change of this release matches.
                </p>
              ) : (
                release.sections.map((group) => (
                  <div key={group.name} className="flex flex-col gap-3">
                    <Heading level={4} as="h3">
                      {group.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        {group.entries.length}
                      </span>
                    </Heading>
                    <ul className="flex flex-col border-t">
                      {group.entries.map((entry) => (
                        <li
                          key={entry.key}
                          className="flex flex-col gap-2 border-b py-3 sm:flex-row sm:items-start sm:gap-4"
                        >
                          {/* The badge column, only where a change of the
                              section carries a category or a commit. */}
                          {group.entries.some(
                            (item) => item.category || item.commit
                          ) ? (
                            <div className="flex shrink-0 items-center gap-2 empty:hidden sm:w-36 sm:flex-col sm:items-start sm:empty:flex">
                              {entry.category ? (
                                <Badge variant={entry.tone ?? "outline"}>
                                  {entry.category}
                                </Badge>
                              ) : null}
                              {entry.commit ? (
                                <Link
                                  href={`${githubUrl}/commit/${entry.commit}`}
                                  className={cn(LINK, "font-mono text-xs")}
                                >
                                  <span className="sr-only">Commit </span>
                                  {entry.commit}
                                </Link>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1 text-sm leading-relaxed">
                            {entry.body}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </li>
        ))}
      </ol>
    </div>
  )
}
