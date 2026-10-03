import type { Metadata } from "next"

import { ExampleCards } from "@/site/foundation-docs/spec-pages/example-cards"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import {
  foundationDoc,
  splitTable,
} from "@/site/foundation-docs/spec-pages/spec"
import { Code } from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import { readJson } from "@/site/lib/repo"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("voice-and-tone")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "messages", label: "Messages" }]

/** The spec sections whose example table the page lays out as cards. */
const CARDS = ["voice", "tone-by-situation"]

export default function VoiceAndTonePage() {
  const doc = foundationDoc(ENTRY.spec ?? "voice-and-tone.md")
  const messages = Object.entries(
    readJson<{ messages: Record<string, string> }>(
      "mcp-server/context/content-library.json"
    ).messages
  )
  const slots = [
    ...new Set(
      messages.flatMap(([, text]) =>
        [...text.matchAll(/\{\w+\}/g)].map((match) => match[0])
      )
    ),
  ]
  const custom = Object.fromEntries(
    doc.parts
      .filter((part) => CARDS.includes(part.id))
      .map((part) => [
        part.id,
        <ExampleCards
          key={part.id}
          {...splitTable(part.body)}
          from={doc.source}
        />,
      ])
  )

  return (
    <FoundationPage slug="voice-and-tone" sections={SECTIONS} custom={custom}>
      <DocSection
        id="messages"
        title="Messages"
        description={
          <>
            {messages.length} messages of the MCP server&apos;s content library,
            written in this voice. The screen fills in{" "}
            {slots.map((slot, index) => (
              <span key={slot}>
                {index ? (index === slots.length - 1 ? " and " : ", ") : null}
                <Code>{slot}</Code>
              </span>
            ))}
            .
          </>
        }
      >
        <ul className="grid gap-px border bg-border md:grid-cols-2">
          {messages.map(([key, text]) => (
            <li
              key={key}
              className="flex flex-col gap-2 bg-background p-4 md:last:odd:col-span-2"
            >
              <code className="font-mono text-xs text-muted-foreground">
                {key}
              </code>
              <p className="text-sm leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
