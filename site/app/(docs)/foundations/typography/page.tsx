import type { Metadata } from "next"

import { FoundationExample } from "@/site/ui/foundation-example"
import {
  FoundationEyebrow,
  withoutTitle,
} from "@/site/foundation-docs/a/page-bits"
import {
  COMBINATIONS,
  foundationExamples,
  typeData,
} from "@/site/foundation-docs/a/type-data"
import { TypeStyles } from "@/site/foundation-docs/a/type-styles"
import { foundation, foundationsNav } from "@/site/lib/nav"
import { readText } from "@/site/lib/repo"
import { CodeBlock } from "@/site/ui/code-block"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

const SPEC = "specs/foundations/typography.md"

/**
 * The spec's sections whose tables the page lays out above, from the same
 * data: their tables are left out of the guidelines, the rest is kept.
 */
const TABLED = [
  "Font Families",
  "Type Scale (Sizes)",
  "Line Heights",
  "Letter Spacings",
  "Font Weights",
]

/**
 * The combinations section without what the page shows above it: the
 * samples and facts are the Text styles table, the headings table is the
 * Headings section, and each module is an Examples entry. The prose stays,
 * and an entry with nothing else to say goes.
 */
function combinationsProse(part: string): string {
  const [heading, ...rest] = part.split(/^(?=### )/m)
  const entries = rest.map((entry) => {
    const [title, ...lines] = entry.split("\n")
    const kept: string[] = []
    let fenced = false
    for (const line of lines) {
      if (line.startsWith("```")) {
        fenced = !fenced
        continue
      }
      if (fenced || line.trim().startsWith("|")) continue
      // A facts line can end with a sentence: only the facts go.
      kept.push(
        line.startsWith("`size: ")
          ? line.replace(/^(`[^`]+`\s*(·\s*)?)+\.?\s*/, "")
          : line
      )
    }
    const prose = kept
      .join("\n")
      .replace(/^-{3,}$/gm, "")
      .trim()
    return prose ? `${title}\n\n${prose}\n\n` : ""
  })
  return [heading, ...entries].join("")
}

/** The spec without its title and without the token tables shown above. */
function guidelines(markdown: string): string {
  const parts = withoutTitle(markdown).split(/^(?=## )/m)
  return parts
    .map((part) => {
      const heading = /^## (.+)$/m.exec(part)?.[1]?.trim()
      if (heading === COMBINATIONS) return combinationsProse(part)
      if (!heading || !TABLED.includes(heading)) return part
      const rest = part
        .split("\n")
        .slice(1)
        .filter((line) => !line.trim().startsWith("|"))
        .join("\n")
      const prose = rest.replace(/^-{3,}$/gm, "").trim()
      return prose ? part.split("\n")[0] + "\n" + rest : ""
    })
    .join("")
}

export const metadata: Metadata = {
  title: "Typography",
  description: foundation("typography").summary,
}

const TOC = [
  { id: "text-styles", label: "Text styles" },
  { id: "families", label: "Font families" },
  { id: "scale", label: "Type scale" },
  { id: "weights", label: "Weights" },
  { id: "leading", label: "Line heights" },
  { id: "tracking", label: "Letter spacing" },
  { id: "headings", label: "Headings" },
  { id: "examples", label: "Examples" },
  { id: "guidelines", label: "Guidelines" },
]

export default function TypographyPage() {
  const data = typeData()
  const examples = foundationExamples("typography")

  return (
    <DocsPage nav={foundationsNav()} navLabel="Foundations" toc={TOC}>
      <PageHeader
        eyebrow={<FoundationEyebrow group="Tokens" />}
        title="Typography"
        lead={`${data.families.length} typefaces, a type scale of ${data.scale.length} sizes and their ${data.scale.length} paired line heights, ${data.weights.length} weights, ${data.leading.length} line heights and ${data.tracking.length} letter spacings: ${data.tokenCount} semantic tokens, written together as ${data.styles.length} text styles. A component draws its own text style; these are for the text a screen draws.`}
      />

      <div className="flex flex-col gap-12">
        <TypeStyles data={data} />
      </div>

      <DocSection
        id="examples"
        title="Examples"
        description="The spec's examples, rendered live: the text style comes with the component."
      >
        {examples.map((example) => (
          <div key={example.key} className="flex flex-col border">
            <p className="border-b px-4 py-2 text-xs font-medium">
              {example.title}
            </p>
            <FoundationExample
              exampleKey={example.key}
              title={`${example.title}: live example`}
            />
            <CodeBlock
              code={example.code}
              language="tsx"
              title={`${example.key}.tsx`}
              className="border-x-0 border-b-0"
            />
          </div>
        ))}
      </DocSection>

      <DocSection
        id="guidelines"
        title="Guidelines"
        description="The typography spec, without the tables, styles and examples laid out above."
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Markdown from={SPEC} shift={1}>
            {guidelines(readText(SPEC))}
          </Markdown>
        </div>
      </DocSection>
    </DocsPage>
  )
}
