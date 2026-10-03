import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as focus from "@/lib/focus"
import { FoundationPage } from "@/site/foundation-docs/spec-pages/foundation-page"
import {
  ClassList,
  Code,
  ModePanels,
} from "@/site/foundation-docs/spec-pages/token-bits"
import { foundation } from "@/site/lib/nav"
import {
  darkValue,
  tailwindClasses,
  tokenByName,
  type Token,
} from "@/site/lib/tokens"
import { DocSection } from "@/site/ui/doc-section"
import { InlineMarkdown } from "@/site/ui/markdown"

const ENTRY = foundation("focus")

export const metadata: Metadata = {
  title: ENTRY.label,
  description: ENTRY.summary,
}

const SECTIONS = [
  { id: "indicator", label: "Indicator" },
  { id: "tokens", label: "Tokens" },
  { id: "presets", label: "Presets" },
]

/** The tokens the indicator is drawn with: its width, then its color. */
const TOKENS = [
  "space.focus-ring-width",
  "color.border.focus",
  "color.sidebar.ring",
]

/**
 * The classes that draw a focus token: a width as a ring length, a color as
 * the border, ring and outline color the presets write.
 */
function classesFor(entry: Token): string[] {
  if (entry.type !== "color") return [`ring-(length:${entry.cssVar})`]
  const name = tailwindClasses(entry.cssVar)
    .find((value) => value.startsWith("border-"))
    ?.slice("border-".length)
  return name ? [`border-${name}`, `ring-${name}`, `outline-${name}`] : []
}

/** One value of a token, with a swatch when it is a color. */
function Value({ entry, value }: { entry: Token; value: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-xs">
      {entry.type === "color" ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 border"
          style={{ background: value }}
        />
      ) : null}
      {value}
    </span>
  )
}

export default function FocusPage() {
  const tokens = TOKENS.map((name) => tokenByName(name)).filter(
    (entry): entry is Token => entry !== undefined
  )
  const presets: [string, string][] = Object.entries(focus)

  return (
    <FoundationPage slug="focus" sections={SECTIONS}>
      <DocSection
        id="indicator"
        title="Indicator"
        description="Four controls with their focus drawn, in both modes: a solid part in the focus color and a halo around it. The same indicator on every control; none describes its own. A picture: the controls take no input."
      >
        <ModePanels>
          {(mode) => (
            // A picture of the indicator: inert, so that no control drawn
            // focused is a tab stop, and the one that has focus stands out.
            <div
              data-force-state="focus"
              inert
              className="grid gap-6 sm:grid-cols-2"
            >
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs text-muted-foreground">Button</span>
                <Button type="button" variant="outline">
                  Save draft
                </Button>
              </div>
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs text-muted-foreground">Link</span>
                <Button variant="link" asChild className="px-0">
                  <Link href="/foundations/focus/">Focus foundation</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`focus-${mode}-email`}>Email</Label>
                <Input
                  id={`focus-${mode}-email`}
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs text-muted-foreground">Switch</span>
                <div className="flex items-center gap-2">
                  <Switch id={`focus-${mode}-alerts`} defaultChecked />
                  <Label htmlFor={`focus-${mode}-alerts`}>Email alerts</Label>
                </div>
              </div>
            </div>
          )}
        </ModePanels>
      </DocSection>

      <DocSection
        id="tokens"
        title="Tokens"
        description="The width of the halo, and the color of the solid part and the halo. Dark mode lightens the color, so the solid part keeps 3:1 on a dark card."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Light</TableHead>
              <TableHead>Dark</TableHead>
              <TableHead>Classes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((entry) => (
              <TableRow key={entry.token}>
                <TableCell className="align-top whitespace-normal">
                  <span className="flex flex-col gap-1">
                    <Code className="w-fit">{entry.token}</Code>
                    <span className="text-xs text-muted-foreground">
                      <InlineMarkdown>
                        {entry.docs?.description ?? entry.description ?? ""}
                      </InlineMarkdown>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="align-top">
                  <Value entry={entry} value={entry.value.light} />
                </TableCell>
                <TableCell className="align-top">
                  <Value entry={entry} value={darkValue(entry)} />
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <ClassList classes={classesFor(entry)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DocSection>

      <DocSection
        id="presets"
        title="Presets"
        description={
          <>
            The classes <Code>lib/focus.ts</Code> exports, as a component
            composes them. A component imports a preset; it never writes its own
            focus classes.
          </>
        }
      >
        <ul className="flex flex-col gap-px border bg-border">
          {presets.map(([name, classes]) => (
            <li
              key={name}
              className="grid gap-2 bg-background p-4 md:grid-cols-3"
            >
              <code className="font-mono text-sm font-medium">{name}</code>
              <span className="md:col-span-2">
                <ClassList classes={classes.split(" ")} />
              </span>
            </li>
          ))}
        </ul>
      </DocSection>
    </FoundationPage>
  )
}
