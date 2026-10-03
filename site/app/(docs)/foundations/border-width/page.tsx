import type { Metadata } from "next"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { FoundationPage } from "@/site/foundation-docs/b/foundation-page"
import {
  ClassList,
  Dimension,
  shortName,
} from "@/site/foundation-docs/b/token-bits"
import { foundation } from "@/site/lib/nav"
import { tailwindClasses, tokenGroup, type Token } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("border-width")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "widths", label: "Widths" }]

/** What a width draws, at its token's width. */
function Sample({ entry }: { entry: Token }) {
  const name = shortName(entry, "border-width")
  if (name === "separation")
    return (
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JK</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    )
  const dashed = name === "chart-indicator"
  return (
    <div aria-hidden="true" className="flex w-full items-center gap-6">
      <div
        className={cn("size-12 border-foreground", dashed && "border-dashed")}
        style={{ borderWidth: `var(${entry.cssVar})` }}
      />
      <div
        className={cn(
          "min-w-0 flex-1 border-foreground",
          dashed && "border-dashed"
        )}
        style={{ borderTopWidth: `var(${entry.cssVar})` }}
      />
    </div>
  )
}

export default function BorderWidthPage() {
  const widths = tokenGroup("border-width")

  return (
    <FoundationPage slug="border-width" sections={SECTIONS}>
      <DocSection
        id="widths"
        title="Widths"
        description="Each width drawn at its token: a box, a rule, and for the separation, the band of background color that cuts overlapping avatars apart."
      >
        <ul className="flex flex-col gap-px border bg-border">
          {widths.map((entry) => {
            const classes = tailwindClasses(entry.cssVar)
            return (
              <li
                key={entry.token}
                className="grid gap-4 bg-background p-4 md:grid-cols-2 md:items-center"
              >
                <div className="flex flex-col gap-2">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-sm font-medium">
                      {shortName(entry, "border-width")}
                    </span>
                    <Dimension value={entry.value.light} />
                  </span>
                  <ClassList
                    classes={
                      classes.length
                        ? classes
                        : entry.docs?.tailwind
                          ? [entry.docs.tailwind]
                          : []
                    }
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <InlineMarkdown>{entry.description ?? ""}</InlineMarkdown>
                  </p>
                </div>
                <div className="flex min-h-16 items-center">
                  <Sample entry={entry} />
                </div>
              </li>
            )
          })}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
