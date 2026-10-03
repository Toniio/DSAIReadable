import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { FoundationPage } from "@/site/foundation-docs/b/foundation-page"
import { remToPx } from "@/site/foundation-docs/b/spec"
import {
  Code,
  Dimension,
  shortName,
  StatusBadge,
} from "@/site/foundation-docs/b/token-bits"
import { foundation } from "@/site/lib/nav"
import { tokenGroup, type Token } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("breakpoints")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "ruler", label: "Ruler" }]

/**
 * A badge shown from its breakpoint up: the classes are written out whole,
 * one per prefix, so that Tailwind compiles each.
 */
const FROM_HERE: Record<string, string> = {
  sm: "hidden sm:inline-flex",
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
  "2xl": "hidden 2xl:inline-flex",
}
const BELOW: Record<string, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
  "2xl": "2xl:hidden",
}

const px = (entry: Token) => remToPx(entry.value.light) ?? 0

export default function BreakpointsPage() {
  const points = tokenGroup("breakpoint").sort((a, b) => px(a) - px(b))
  const widest = Math.max(...points.map(px))

  return (
    <FoundationPage slug="breakpoints" sections={SECTIONS}>
      <DocSection
        id="ruler"
        title="Ruler"
        description={
          <>
            {points.length} viewport widths, drawn to scale against the widest.
            A prefix applies from its width up; a class without one applies
            everywhere. The badges follow this window: resize it to see them
            change.
          </>
        }
      >
        <ul className="flex flex-col border-t">
          {points.map((entry) => {
            const name = shortName(entry, "breakpoint")
            const prefix = entry.docs?.tailwind ?? `${name}:`
            return (
              <li
                key={entry.token}
                className="grid gap-2 border-b py-3 md:grid-cols-12 md:items-center md:gap-4"
              >
                <div className="flex flex-wrap items-center gap-2 md:col-span-5">
                  <Code className="text-sm">{prefix}</Code>
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.token}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="flex items-center justify-between gap-2 md:col-span-3">
                  <Dimension value={entry.value.light} />
                  <Badge variant="success" className={FROM_HERE[name]}>
                    Applies
                  </Badge>
                  <Badge variant="outline" className={BELOW[name]}>
                    Not yet
                  </Badge>
                </div>
                <div className="min-w-0 md:col-span-4">
                  <div
                    className="h-3 bg-chart-1"
                    style={{ width: `${(px(entry) / widest) * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
