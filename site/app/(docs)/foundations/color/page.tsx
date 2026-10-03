import type { Metadata } from "next"

import { colorData } from "@/site/foundation-docs/a/color-data"
import { ColorExplorer } from "@/site/foundation-docs/a/color-explorer"
import {
  FoundationEyebrow,
  withoutTitle,
} from "@/site/foundation-docs/a/page-bits"
import { foundation, foundationsNav } from "@/site/lib/nav"
import { readText } from "@/site/lib/repo"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

const SPEC = "specs/foundations/color.md"

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
        description="The color spec, as written. Its value tables can lag behind the tokens: the swatches above, read from the token build, are the source of truth."
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Markdown from={SPEC} shift={1}>
            {withoutTitle(readText(SPEC))}
          </Markdown>
        </div>
      </DocSection>
    </DocsPage>
  )
}
