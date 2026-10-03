"use client"

import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type { NavGroup } from "@/site/lib/nav"
import { Canvas, useSiteTheme } from "@/site/playground/canvas"
import type { FrameState } from "@/site/playground/protocol"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import type { TocItem } from "@/site/ui/page-toc"

interface IndexCard {
  name: string
  slug: string
  status: "stable" | "beta" | "deprecated"
  /** The spec's Role, as plain text. */
  role: string
}

export interface IndexGroup {
  /** The section's anchor: `forms`. */
  id: string
  category: string
  items: IndexCard[]
}

/**
 * Whether an element is on screen or within half a screen of it. Each
 * thumbnail is a whole preview document: the index keeps only those near
 * the reader alive, rather than 65 of them for the life of the page.
 */
function useNearScreen(): [(element: HTMLElement | null) => void, boolean] {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "50% 0%" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [setElement, near]
}

/** The spec's example, small and inert: the card is the link, not the preview. */
function Thumbnail({ name, slug }: { name: string; slug: string }) {
  const theme = useSiteTheme()
  const [ref, near] = useNearScreen()
  const state = useMemo<FrameState>(
    () => ({ view: "example", args: {}, state: "rest", theme }),
    [theme]
  )
  return (
    <div
      ref={ref}
      inert
      aria-hidden="true"
      className="pointer-events-none h-40 overflow-hidden border-b bg-background"
    >
      {near ? (
        /* Laid out a third wider, drawn at three quarters: more of the example shows. */
        <div className="w-4/3 origin-top-left scale-75">
          <Canvas slug={slug} state={state} title={`${name} example`} />
        </div>
      ) : null}
    </div>
  )
}

function Card({ item }: { item: IndexCard }) {
  return (
    <Link
      href={`/components/${item.slug}/`}
      className={cn(
        "flex h-full flex-col border bg-background transition-colors hover:border-foreground/30 hover:bg-muted",
        FOCUS_OUTLINE_RESET,
        FOCUS_RING
      )}
    >
      <Thumbnail name={item.name} slug={item.slug} />
      <span className="flex flex-col gap-1 p-4">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{item.name}</span>
          {item.status === "stable" ? null : (
            <Badge variant={item.status === "beta" ? "warning" : "destructive"}>
              {item.status}
            </Badge>
          )}
        </span>
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.role}
        </span>
      </span>
    </Link>
  )
}

function matches(item: IndexCard, query: string): boolean {
  return [item.name, item.slug, item.role].some((text) =>
    text.toLowerCase().includes(query)
  )
}

/**
 * The Components index: a filter over every component, then one section per
 * category with a card for each, its spec example drawn live. It frames the
 * page itself, so "On this page" lists the sections the filter leaves.
 */
export function ComponentIndex({
  nav,
  header,
  groups,
  total,
}: {
  nav: NavGroup[]
  /** The page's title and lead, above the filter. */
  header: ReactNode
  groups: IndexGroup[]
  total: number
}) {
  const [filter, setFilter] = useState("")
  const query = useDeferredValue(filter.trim().toLowerCase())

  const shown = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: query
            ? group.items.filter((item) => matches(item, query))
            : group.items,
        }))
        .filter((group) => group.items.length > 0),
    [groups, query]
  )
  const count = shown.reduce((sum, group) => sum + group.items.length, 0)
  const toc = useMemo<TocItem[]>(
    () => shown.map((group) => ({ id: group.id, label: group.category })),
    [shown]
  )

  return (
    <DocsPage nav={nav} navLabel="Components" toc={toc}>
      {header}
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <Label htmlFor="component-filter" className="sr-only">
            Filter the components
          </Label>
          <Input
            id="component-filter"
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={`Filter ${total} components by name or role`}
            autoComplete="off"
            className="h-10 text-sm md:text-sm"
          />
          <p role="status" className="text-xs text-muted-foreground">
            {query
              ? `${count} of ${total} components match “${filter.trim()}”.`
              : ""}
          </p>
        </div>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No component matches this filter. Try a shorter word, or a part of
            what the component does.
          </p>
        ) : null}
        {shown.map((group) => {
          const all = groups.find((entry) => entry.id === group.id)
          const size = all?.items.length ?? group.items.length
          return (
            <DocSection
              key={group.id}
              id={group.id}
              title={group.category}
              description={
                query
                  ? `${group.items.length} of ${size} components`
                  : `${size} ${size === 1 ? "component" : "components"}`
              }
            >
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Card item={item} />
                  </li>
                ))}
              </ul>
            </DocSection>
          )
        })}
      </div>
    </DocsPage>
  )
}
