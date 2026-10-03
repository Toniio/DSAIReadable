import type { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import { LINK } from "@/site/ui/link"
import { remToPx } from "@/site/foundation-docs/spec-pages/spec"
import {
  ClassList,
  Code,
  Dimension,
  shortName,
  StatusBadge,
} from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import { tailwindClasses, tokenGroup, type Token } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("spacing")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "scale", label: "Scale" },
  { id: "layout", label: "Layout" },
  { id: "widths", label: "Widths" },
]

const px = (entry: Token) => remToPx(entry.value.light) ?? 0
const byValue = (a: Token, b: Token) => px(a) - px(b)

/**
 * The utilities each layout token is written with, as the spec prescribes
 * them (`px-page`, `py-section`, `gap-section`, `w-sidebar`). The bridge
 * makes every spacing utility read the token, `p-sidebar` and `size-page`
 * included: listing those would teach padding a block by a sidebar width.
 */
const LAYOUT_UTILITIES: Record<string, string[]> = {
  "page-padding": ["px"],
  "section-gap": ["py", "gap"],
  sidebar: ["w"],
  "sidebar-mobile": ["w"],
  "sidebar-icon": ["w"],
}

/** `--spacing-page` bridges `p-page`: the classes of its axis, `px-page`. */
function layoutClasses(entry: Token): string[] {
  const bridged = tailwindClasses(entry.cssVar)
  const name = bridged[0]?.replace(/^[a-z]+-/, "")
  const utilities = LAYOUT_UTILITIES[shortName(entry, "space.layout")]
  if (!name || !utilities) return bridged
  return utilities.map((utility) => `${utility}-${name}`)
}

/**
 * A bar as wide as the token: the width is the token itself. With `widest`,
 * a list whose longest bars would not fit a phone's column draws them to
 * scale against it below md instead. The chart color keeps 3:1 on the page
 * in both modes, as a data mark must.
 */
function Bar({ entry, widest }: { entry: Token; widest?: number }) {
  const actual = (
    <div
      className={cn("h-3 max-w-full bg-chart-1", widest && "hidden md:block")}
      style={{ width: `var(${entry.cssVar})` }}
    />
  )
  if (!widest) return actual
  return (
    <>
      <div
        className="h-3 bg-chart-1 md:hidden"
        style={{ width: `${(px(entry) / widest) * 100}%` }}
      />
      {actual}
    </>
  )
}

export default function SpacingPage() {
  const scale = tokenGroup("space.scale").sort(byValue)
  const widestStep = Math.max(...scale.map(px))
  const reserved = tokenGroup("space.component").sort(byValue)
  const layout = tokenGroup("space.layout")
  const containers = tokenGroup("space.container")
  const content = layout.filter((entry) => entry.token.includes(".content-"))
  const layoutBars = layout.filter((entry) => !content.includes(entry))
  const widths = [...containers, ...content].sort(
    (a, b) => byValue(a, b) || a.token.localeCompare(b.token)
  )
  const widest = Math.max(...widths.map(px))
  const widestEntry = widths.find((entry) => px(entry) === widest)

  /** A content width has no class: the container step of the same value does. */
  const classesOf = (entry: Token): string[] => {
    const bridged = tailwindClasses(entry.cssVar)
    if (bridged.length) return bridged
    if (entry.docs?.tailwind) return entry.docs.tailwind.split(" · ")
    const twin = containers.find(
      (other) => other.value.light === entry.value.light
    )
    return twin?.docs?.tailwind?.split(" · ").slice(0, 1) ?? []
  }

  return (
    <FoundationPage
      slug="spacing"
      sections={SECTIONS}
      custom={{
        // The spec draws the scale in text; the bars above draw it from the tokens.
        "visual-scale": (
          <p className="text-sm leading-relaxed">
            The spec draws the scale as text. The bars of{" "}
            <Link href="#scale" className={LINK}>
              Scale
            </Link>{" "}
            and{" "}
            <Link href="#layout" className={LINK}>
              Layout
            </Link>{" "}
            draw it from the tokens themselves.
          </p>
        ),
      }}
    >
      <DocSection
        id="scale"
        title="Scale"
        description={
          <>
            {scale.length} steps of <Code>space.scale.*</Code>. Every spacing
            and sizing utility reads one: <Code>p-</Code>, <Code>m-</Code>,{" "}
            <Code>gap-</Code>, <Code>w-</Code>, <Code>h-</Code>,{" "}
            <Code>size-</Code>, <Code>inset-</Code>. Each bar is as wide as its
            token; on a narrow screen, drawn to scale against the widest.
          </>
        }
      >
        <ul className="flex flex-col border-t">
          {scale.map((entry) => {
            const step = tailwindClasses(entry.cssVar)[0]?.replace(/^p-/, "")
            return (
              <li
                key={entry.token}
                className="grid gap-2 border-b py-1.5 md:grid-cols-12 md:items-center md:gap-4"
              >
                <div className="flex items-baseline justify-between gap-3 md:col-span-4">
                  <span className="flex items-baseline gap-3">
                    <span className="w-10 font-mono text-sm font-medium">
                      {step ?? shortName(entry, "space.scale")}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {entry.token}
                    </span>
                  </span>
                  <Dimension value={entry.value.light} />
                </div>
                <div className="min-w-0 md:col-span-8">
                  <Bar entry={entry} widest={widestStep} />
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-col gap-2 border p-4">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <code className="font-mono">space.component.*</code>
            <StatusBadge status="reserved" />
          </p>
          <p className="text-sm text-muted-foreground">
            {reserved.length} tokens no component reads, with no class. Inside a
            component, use the step of the scale of the same value.
          </p>
          <ul className="flex flex-wrap gap-2">
            {reserved.map((entry) => (
              <li key={entry.token} className="flex items-center gap-1">
                <Code>{shortName(entry, "space.component")}</Code>
                <Dimension value={entry.value.light} />
              </li>
            ))}
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="layout"
        title="Layout"
        description="The spacing of a page, outside its components: the page gutter, the gap between sections, the widths of the sidebar."
      >
        <ul className="flex flex-col border-t">
          {layoutBars.map((entry) => (
            <li
              key={entry.token}
              className="grid gap-2 border-b py-3 md:grid-cols-12 md:items-center md:gap-4"
            >
              <div className="flex flex-col gap-1 md:col-span-5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    {shortName(entry, "space.layout")}
                  </span>
                  <Dimension value={entry.value.light} />
                  <StatusBadge status={entry.status} />
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {entry.description}
                </span>
                <ClassList classes={layoutClasses(entry)} />
              </div>
              <div className="min-w-0 md:col-span-7">
                <Bar entry={entry} />
              </div>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection
        id="widths"
        title="Widths"
        description={
          <>
            The container scale, <Code>space.container.*</Code>, and the content
            widths of <Code>space.layout.*</Code> that equal its steps. Drawn to
            scale, the widest,{" "}
            <Code>{widestEntry?.token ?? "space.container.7xl"}</Code>, filling
            the row. Tailwind compiles these widths, so the tokens are the
            reference it must match.
          </>
        }
      >
        <ul className="flex flex-col border-t">
          {widths.map((entry) => (
            <li
              key={entry.token}
              className="grid gap-2 border-b py-1.5 md:grid-cols-12 md:items-center md:gap-4"
            >
              <div className="flex flex-wrap items-center gap-2 md:col-span-5">
                <span className="font-mono text-xs">{entry.token}</span>
                <StatusBadge status={entry.status} />
              </div>
              <div className="flex items-center justify-between gap-2 md:col-span-3">
                <ClassList classes={classesOf(entry).slice(0, 1)} />
                <Dimension value={entry.value.light} />
              </div>
              <div className="min-w-0 md:col-span-4">
                <div
                  className="h-3 bg-chart-1"
                  style={{ width: `${(px(entry) / widest) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
