import { Fragment, type ReactNode } from "react"

import type { SectionDoc } from "@/site/mcp-skills-docs/data"
import { DocSection } from "@/site/ui/doc-section"
import { Markdown } from "@/site/ui/markdown"

/** Where a page's Markdown places a block the site computes: `<!-- site: pipeline -->`. */
const MARKER = /<!-- site: ([\w-]+) -->/g

/**
 * A block the site computes, or a function that wraps the Markdown its marker
 * precedes, up to the next marker or the end of the section: a long table
 * behind a disclosure.
 */
type Block = ReactNode | ((markdown: ReactNode) => ReactNode)

/**
 * The `## ` sections of a page, each with the blocks the page computes in the
 * place its Markdown marks. The markers are comments: on GitHub and through
 * llms.txt, the file reads whole without them. A marker with no block, a
 * block no marker places, or a wrapping block with nothing to wrap fails the
 * build, so a figure never goes missing in silence.
 */
export function DocParts({
  doc,
  blocks = {},
}: {
  doc: SectionDoc
  blocks?: Record<string, Block>
}) {
  const placed = new Set<string>()
  const sections = doc.parts.map((part) => {
    const matches = [...part.body.matchAll(MARKER)]
    /** The Markdown between two offsets of the section, or nothing when blank. */
    const text = (from: number, to?: number) => {
      const source = part.body.slice(from, to).trim()
      return source ? (
        <Markdown key={`text-${from}`} from={doc.source}>
          {source}
        </Markdown>
      ) : null
    }
    const pieces: ReactNode[] = [text(0, matches[0]?.index)]
    matches.forEach((match, index) => {
      const name = match[1]
      if (!(name in blocks))
        throw new Error(`${doc.source}: no block for <!-- site: ${name} -->`)
      placed.add(name)
      const block = blocks[name]
      const after = text(
        match.index + match[0].length,
        matches[index + 1]?.index
      )
      if (typeof block !== "function")
        pieces.push(<Fragment key={name}>{block}</Fragment>, after)
      else if (after)
        pieces.push(<Fragment key={name}>{block(after)}</Fragment>)
      else
        throw new Error(
          `${doc.source}: no Markdown after <!-- site: ${name} --> to wrap`
        )
    })
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
