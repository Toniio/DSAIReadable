import type { Metadata } from "next"

import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import {
  Code,
  Dimension,
  shortName,
  StatusBadge,
} from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import {
  differsInNova,
  lightIn,
  tailwindClasses,
  tokenGroup,
} from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InBrand } from "@/site/ui/in-brand"
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
            A component draws its corners with a role:{" "}
            <Code>rounded-surface</Code> for a card or a dialog,{" "}
            <Code>rounded-control</Code> for a button or a field, and{" "}
            <Code>item</Code>, <Code>inset</Code>, <Code>mark</Code>,{" "}
            <Code>pill</Code> inside them. Every role is square in lyra and
            rounded in nova; the values below follow the brand this site is
            showing. <Code>rounded-full</Code> is for a round shape: an avatar,
            a radio, a switch. The steps between are for content a screen draws
            itself, such as an image or a hero.
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
                  <InBrand differs={differsInNova(entry.value)}>
                    {(brand) => (
                      <Dimension value={lightIn(entry.value, brand)} />
                    )}
                  </InBrand>
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
