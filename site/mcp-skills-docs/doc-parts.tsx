import { Fragment, type ReactNode } from "react"

import type { SectionDoc } from "@/site/mcp-skills-docs/data"
import { DocSection } from "@/site/ui/doc-section"
import { Markdown } from "@/site/ui/markdown"

/** Where a page's Markdown places a block the site computes: `<!-- site: pipeline -->`. */
const MARKER = /<!-- site: ([\w-]+) -->/g

/**
 * The `## ` sections of a page, each with the blocks the page computes in the
 * place its Markdown marks. The markers are comments: on GitHub and through
 * llms.txt, the file reads whole without them. A marker with no block, or a
 * block no marker places, fails the build, so a figure never goes missing in
 * silence.
 */
export function DocParts({
  doc,
  blocks = {},
}: {
  doc: SectionDoc
  blocks?: Record<string, ReactNode>
}) {
  const placed = new Set<string>()
  const sections = doc.parts.map((part) => {
    const pieces: ReactNode[] = []
    let from = 0
    for (const match of part.body.matchAll(MARKER)) {
      const text = part.body.slice(from, match.index).trim()
      if (text)
        pieces.push(
          <Markdown key={`text-${from}`} from={doc.source}>
            {text}
          </Markdown>
        )
      const name = match[1]
      if (!(name in blocks))
        throw new Error(`${doc.source}: no block for <!-- site: ${name} -->`)
      placed.add(name)
      pieces.push(<Fragment key={name}>{blocks[name]}</Fragment>)
      from = match.index + match[0].length
    }
    const rest = part.body.slice(from).trim()
    if (rest)
      pieces.push(
        <Markdown key="rest" from={doc.source}>
          {rest}
        </Markdown>
      )
    return (
      <DocSection key={part.id} id={part.id} title={part.label}>
        {pieces}
      </DocSection>
    )
  })
  const unplaced = Object.keys(blocks).filter((name) => !placed.has(name))
  if (unplaced.length)
    throw new Error(
      `${doc.source}: no <!-- site: … --> marker for ${unplaced.join(", ")}`
    )
  return <>{sections}</>
}
