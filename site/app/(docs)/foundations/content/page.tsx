import type { Metadata } from "next"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UI_STRINGS } from "@/lib/ui-strings"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import { Code } from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import { readJson } from "@/site/lib/repo"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("content")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [{ id: "default-strings", label: "Default strings" }]
const AFTER = [{ id: "glossary", label: "Glossary" }]

/** What a string-making function returns, its argument left as a slot. */
const SLOT = "{item}"

/** Every default string of `UI_STRINGS`, by component, as the code holds it. */
function defaultStrings(): { group: string; key: string; value: string }[] {
  return Object.entries(UI_STRINGS).flatMap(([group, strings]) =>
    Object.entries(strings as Record<string, unknown>).map(([key, value]) => ({
      group,
      key: typeof value === "function" ? `${key}(item)` : key,
      value:
        typeof value === "function"
          ? String((value as (item: string) => string)(SLOT))
          : String(value),
    }))
  )
}

export default function ContentPage() {
  const strings = defaultStrings()
  const groups = new Set(strings.map((entry) => entry.group))
  const glossary = readJson<{ term: string; definition: string }[]>(
    "mcp-server/context/glossary.json"
  )

  return (
    <FoundationPage
      slug="content"
      sections={SECTIONS}
      after={{
        toc: AFTER,
        node: (
          <DocSection
            id="glossary"
            title="Glossary"
            description={`${glossary.length} terms the specs and the MCP server use, as agents read them.`}
          >
            <dl className="grid gap-px border bg-border md:grid-cols-2">
              {glossary.map((entry) => (
                <div
                  key={entry.term}
                  className="flex flex-col gap-1 bg-background p-4 md:last:odd:col-span-2"
                >
                  <dt className="font-mono text-sm font-semibold">
                    {entry.term}
                  </dt>
                  <dd className="text-xs leading-relaxed text-muted-foreground">
                    <InlineMarkdown>{entry.definition}</InlineMarkdown>
                  </dd>
                </div>
              ))}
            </dl>
          </DocSection>
        ),
      }}
    >
      <DocSection
        id="default-strings"
        title="Default strings"
        description={
          <>
            The {strings.length} strings the components render without being
            asked, across {groups.size} components, read from{" "}
            <Code>UI_STRINGS</Code> in <Code>lib/ui-strings.ts</Code>. Each one
            can be replaced through a prop.
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Default</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strings.map((entry) => (
              <TableRow key={`${entry.group}.${entry.key}`}>
                <TableCell className="align-top">
                  <code className="font-mono text-xs">
                    <span className="text-muted-foreground">
                      {entry.group}.
                    </span>
                    {entry.key}
                  </code>
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  {entry.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DocSection>
    </FoundationPage>
  )
}
