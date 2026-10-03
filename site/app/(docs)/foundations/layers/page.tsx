import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import { LINK } from "@/site/ui/link"
import { tokenAdvice } from "@/site/foundation-docs/spec-pages/spec"
import { Code } from "@/site/foundation-docs/spec-pages/token-bits"
import { components } from "@/site/lib/components"
import { foundation } from "@/site/lib/nav"
import { listFiles, readText } from "@/site/lib/repo"
import { tailwindClasses, tokenGroup } from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"

const ENTRY = foundation("layers")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "stack", label: "Stack" },
  { id: "layers", label: "Layers" },
]

/**
 * The components that draw each z-index class, read from their source: a
 * class written in the component, or in a lib/ preset it imports
 * (lib/overlay.ts gives Dialog and Sheet their `z-modal`).
 */
function usersOf(classes: string[]): Map<string, string[]> {
  const byFile = new Map(
    components().map((entry) => [entry.codePath, entry.name])
  )
  const libs = listFiles("lib", ".ts").map((file) => ({
    module: `@/lib/${file.replace(/\.ts$/, "")}`,
    text: readText(`lib/${file}`),
  }))
  const users = new Map<string, string[]>(classes.map((name) => [name, []]))
  for (const file of listFiles("components/ui", ".tsx")) {
    const name = byFile.get(`components/ui/${file}`)
    if (!name) continue
    const text = readText(`components/ui/${file}`)
    const imported = libs
      .filter((lib) => text.includes(`from "${lib.module}"`))
      .map((lib) => lib.text)
    for (const value of classes) {
      const pattern = new RegExp(`(^|[\\s"'\`:])${value}(?=[\\s"'\`]|$)`, "m")
      if ([text, ...imported].some((source) => pattern.test(source)))
        users.get(value)?.push(name)
    }
  }
  return users
}

export default function LayersPage() {
  const layers = tokenGroup("zindex")
  const classOf = (cssVar: string) =>
    tailwindClasses(cssVar)[0] ?? cssVar.replace("--zindex-", "z-")
  const users = usersOf(layers.map((entry) => classOf(entry.cssVar)))
  const advice = tokenAdvice(["zindex"])
  const slugOf = new Map(components().map((entry) => [entry.name, entry.slug]))
  const top = layers.length - 1

  return (
    <FoundationPage
      slug="layers"
      sections={SECTIONS}
      rules={{ dos: advice.dos, donts: advice.donts }}
    >
      <DocSection
        id="stack"
        title="Stack"
        description={
          <>
            {layers.length} layers, from the dropdown menus to the tooltips. The
            cards below are written in reverse order: each one&apos;s{" "}
            <Code>z-index</Code> token, not its place in the page, puts it above
            the one before.
          </>
        }
      >
        {/* Each card steps down by less than its height, so it visibly
            covers part of the one before, but not the value it prints;
            the frame fits the last card. */}
        <div
          className="relative isolate overflow-hidden border bg-muted"
          style={{
            height: `calc(var(--space-scale-5) * ${layers.length + 1} + var(--space-scale-7))`,
          }}
        >
          {[...layers].reverse().map((entry) => {
            const index = layers.indexOf(entry)
            return (
              <div
                key={entry.token}
                className="absolute flex h-7 w-44 items-center justify-between gap-2 border bg-popover px-2 text-popover-foreground shadow-md"
                style={{
                  zIndex: `var(${entry.cssVar})`,
                  top: `calc(var(--space-scale-5) * ${index} + var(--space-scale-5))`,
                  left: `calc((100% - var(--space-scale-44) - var(--space-scale-8)) * ${index} / ${top} + var(--space-scale-4))`,
                }}
              >
                <span className="font-mono text-xs font-medium">
                  {classOf(entry.cssVar)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {entry.value.light}
                </span>
              </div>
            )
          })}
        </div>
      </DocSection>

      <DocSection
        id="layers"
        title="Layers"
        description={
          <>
            Highest first. Inside a component, a few parts order themselves with
            a small local value instead:{" "}
            <Link
              href="/foundations/elevation/#local-stacking-inside-a-component"
              className={LINK}
            >
              local stacking
            </Link>
            .
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Used by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...layers].reverse().map((entry) => {
              const name = classOf(entry.cssVar)
              const usedBy = users.get(name) ?? []
              return (
                <TableRow key={entry.token}>
                  <TableCell className="align-top">
                    <span className="flex flex-col gap-1">
                      <Code className="w-fit">{name}</Code>
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.token}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="align-top font-mono">
                    {entry.value.light}
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
                    {entry.description}
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
                    {usedBy.length ? (
                      <ul className="flex flex-wrap gap-1">
                        {usedBy.map((user) => (
                          <li key={user}>
                            <Badge variant="outline" asChild>
                              <Link href={`/components/${slugOf.get(user)}/`}>
                                {user}
                              </Link>
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">
                        No component yet
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DocSection>
    </FoundationPage>
  )
}
