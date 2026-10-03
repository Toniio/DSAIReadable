import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowsHorizontalIcon,
  ArticleIcon,
  BracketsCurlyIcon,
  ChatCircleTextIcon,
  CornersOutIcon,
  CrosshairIcon,
  DevicesIcon,
  DropHalfIcon,
  HandPointingIcon,
  LineSegmentIcon,
  PaletteIcon,
  ShapesIcon,
  StackIcon,
  StackSimpleIcon,
  TextAaIcon,
  WaveSineIcon,
} from "@phosphor-icons/react/ssr"
import type { Icon } from "@phosphor-icons/react"

import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import {
  foundationCount,
  tierCounts,
} from "@/site/foundation-docs/tokens/foundation-counts"
import { anchor } from "@/site/lib/markdown"
import { FOUNDATION_GROUPS, foundationsNav } from "@/site/lib/nav"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { PageHeader } from "@/site/ui/page-header"

export const metadata: Metadata = {
  title: "Foundations",
  description:
    "The tokens every component is built from, and the guidelines that say how to use them.",
}

/** A plain signifier for each foundation's card. */
const ICONS: Record<string, Icon> = {
  color: PaletteIcon,
  typography: TextAaIcon,
  spacing: ArrowsHorizontalIcon,
  radius: CornersOutIcon,
  elevation: StackIcon,
  "border-width": LineSegmentIcon,
  opacity: DropHalfIcon,
  motion: WaveSineIcon,
  size: HandPointingIcon,
  breakpoints: DevicesIcon,
  layers: StackSimpleIcon,
  focus: CrosshairIcon,
  icons: ShapesIcon,
  content: ArticleIcon,
  "voice-and-tone": ChatCircleTextIcon,
  tokens: BracketsCurlyIcon,
}

const CARD = cn(
  "group flex h-full flex-col gap-3 border bg-background p-4 transition-colors hover:bg-muted",
  FOCUS_OUTLINE_RESET,
  FOCUS_RING
)

const GROUP_INTRO: Record<string, string> = {
  Tokens:
    "Each page lists its tokens with their values in light and dark, their Tailwind classes, and the rules of the spec.",
  Guidelines: "How the system looks, reads and sounds beyond its values.",
  Reference: "Every token in one table.",
}

export default function FoundationsPage() {
  const tiers = tierCounts()
  const groups = FOUNDATION_GROUPS.map((group) => ({
    ...group,
    id: anchor(group.label),
  }))
  const tokenPages =
    FOUNDATION_GROUPS.find((group) => group.label === "Tokens")?.items.length ??
    0

  return (
    <DocsPage
      nav={foundationsNav()}
      navLabel="Foundations"
      toc={groups.map((group) => ({ id: group.id, label: group.label }))}
    >
      <PageHeader
        title="Foundations"
        lead={`The decisions every component is built from: ${tiers.semantic} semantic tokens across ${tokenPages} foundations, in light and dark, and the guidelines that say how to use them.`}
      >
        <dl className="grid gap-px border bg-border sm:grid-cols-3">
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">
              Tier 1 · Primitive
            </dt>
            <dd className="flex flex-col gap-1">
              <span className="text-2xl font-semibold">{tiers.primitive}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Raw values. Private: only semantic tokens read them.
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Tier 2 · Semantic</dt>
            <dd className="flex flex-col gap-1">
              <span className="text-2xl font-semibold">{tiers.semantic}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                The decisions components read, by role and by mode.
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">
              Tier 3 · Component
            </dt>
            <dd className="flex flex-col gap-1">
              <span className="text-2xl font-semibold">{tiers.component}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                The shadcn/ui aliases, such as --primary and --background.
              </span>
            </dd>
          </div>
        </dl>
      </PageHeader>

      {groups.map((group) => (
        <DocSection
          key={group.id}
          id={group.id}
          title={group.label}
          description={GROUP_INTRO[group.label]}
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const Glyph = ICONS[item.slug] ?? ShapesIcon
              const count = foundationCount(item.slug)
              return (
                <li key={item.slug} className="min-w-0">
                  <Link href={`/foundations/${item.slug}/`} className={CARD}>
                    <span className="flex items-center justify-between gap-2">
                      <Glyph
                        aria-hidden="true"
                        className="size-5 text-primary"
                      />
                      {count ? (
                        <span className="text-xs text-muted-foreground">
                          {count}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      {item.label}
                      <ArrowRightIcon
                        aria-hidden="true"
                        className="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {item.summary}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </DocSection>
      ))}
    </DocsPage>
  )
}
