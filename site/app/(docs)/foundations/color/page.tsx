import type { Metadata } from "next"
import Link from "next/link"

import { colorData } from "@/site/foundation-docs/tokens/color-data"
import { ColorExplorer } from "@/site/foundation-docs/tokens/color-explorer"
import {
  FoundationEyebrow,
  withoutTitle,
} from "@/site/foundation-docs/tokens/page-bits"
import { foundation, foundationsNav } from "@/site/lib/nav"
import { readText } from "@/site/lib/repo"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { LINK } from "@/site/ui/link"
import { Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

const SPEC = "specs/foundations/color.md"

/** The spec section whose tables write each token's values by hand. */
const VALUES = "Semantic Tokens"

/** The spec section of measured ratios: the Audits page computes them. */
const MEASURED = "Measured contrast"

/**
 * The spec's rules without the values it writes by hand, which can lag
 * behind the token build: the value tables of the semantic tokens, each
 * replaced by a link to its swatches above, and the measured ratios, which
 * the Audits page computes from the same build.
 */
function guidelines(markdown: string): string {
  return withoutTitle(markdown)
    .split(/^(?=## )/m)
    .map((part) => {
      const heading = /^## (.+)$/m.exec(part)?.[1]?.trim()
      if (heading === MEASURED) return ""
      if (heading !== VALUES) return part
      return part
        .split(/^(?=### )/m)
        .map((group) => {
          const title = /^### (.+)$/m.exec(group)?.[1]?.trim()
          if (!title) return group
          const lines = group.split("\n")
          const first = lines.findIndex((line) => line.trim().startsWith("|"))
          if (first < 0) return group
          const link = `Values: [Semantic colors › ${title}](#semantic-${title.toLowerCase()}), read from the token build.`
          return lines
            .flatMap((line, index) =>
              index === first
                ? [link]
                : line.trim().startsWith("|")
                  ? []
                  : [line]
            )
            .join("\n")
        })
        .join("")
    })
    .join("")
}

export const metadata: Metadata = {
  title: "Color",
  description: foundation("color").summary,
}

const TOC = [
  { id: "semantic", label: "Semantic colors" },
  { id: "aliases", label: "Component aliases" },
  { id: "primitives", label: "Primitives" },
  { id: "guidelines", label: "Guidelines" },
]

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

export default function ColorPage() {
  const data = colorData()
  const semantic = data.groups.reduce(
    (sum, group) => sum + group.colors.length,
    0
  )
  const steps = data.palettes.reduce(
    (sum, palette) => sum + palette.steps.length,
    0
  )

  return (
    <DocsPage nav={foundationsNav()} navLabel="Foundations" toc={TOC}>
      <PageHeader
        eyebrow={<FoundationEyebrow group="Tokens" />}
        title="Color"
        lead={`${plural(semantic, "semantic color", "semantic colors")}, ${plural(data.aliases.length, "shadcn/ui alias", "shadcn/ui aliases")} and ${plural(steps, "primitive step", "primitive steps")} in ${plural(data.palettes.length, "palette", "palettes")}, in light and dark. Copy a variable or a class with the button beside it.`}
      />

      <div className="flex flex-col gap-12">
        <ColorExplorer data={data} />
      </div>

      <DocSection
        id="guidelines"
        title="Guidelines"
        description="The color spec's rules. The values above come from the token build."
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Markdown from={SPEC} shift={1}>
            {guidelines(readText(SPEC))}
          </Markdown>
          <p className="text-sm leading-relaxed">
            The contrast ratio of every pair under watch, in both modes, is on
            the{" "}
            <Link href="/audits/#contrast" className={LINK}>
              Audits page
            </Link>
            , computed from the same build.
          </p>
        </div>
      </DocSection>
    </DocsPage>
  )
}
