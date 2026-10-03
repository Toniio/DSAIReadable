import type { Metadata } from "next"

import { FoundationPage } from "@/site/foundation-docs/b/foundation-page"
import {
  Code,
  Dimension,
  shortName,
  StatusBadge,
} from "@/site/foundation-docs/b/token-bits"
import { foundation } from "@/site/lib/nav"
import { tailwindClasses, tokenGroup } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("radius")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "scale", label: "Scale" }]

export default function RadiusPage() {
  const scale = tokenGroup("radius")

  return (
    <FoundationPage slug="radius" sections={SECTIONS}>
      <DocSection
        id="scale"
        title="Scale"
        description={
          <>
            Every surface is square, <Code>rounded-none</Code>: buttons, fields,
            cards, menus, dialogs. <Code>rounded-full</Code> is for a round
            shape: an avatar, a radio, a switch. The steps between are for
            content a screen draws itself, such as an image or a hero.
          </>
        }
      >
        <ul className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {scale.map((entry) => {
            const name = shortName(entry, "radius")
            const bridged = tailwindClasses(entry.cssVar)[0]
            return (
              <li
                key={entry.token}
                className="flex flex-col gap-3 bg-background p-4"
              >
                <div
                  aria-hidden="true"
                  className="size-16 border border-foreground bg-muted"
                  style={{ borderRadius: `var(${entry.cssVar})` }}
                />
                <div className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {name}
                    </span>
                    <StatusBadge status={entry.status} />
                  </span>
                  <Code className="w-fit">{bridged ?? `rounded-${name}`}</Code>
                  <Dimension value={entry.value.light} />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    <InlineMarkdown>{entry.description ?? ""}</InlineMarkdown>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
