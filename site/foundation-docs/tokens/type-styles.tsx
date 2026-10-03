"use client"

import { useState, type ReactNode } from "react"

import { headingVariants } from "@/components/ui/heading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { CopyCode, Ticks } from "@/site/foundation-docs/tokens/token-ui"
import type {
  HeadingRow,
  TextStyle,
  TypeData,
  TypeRow,
} from "@/site/foundation-docs/tokens/type-data"
import { CopyButton } from "@/site/ui/copy-button"
import { DocSection } from "@/site/ui/doc-section"

type Display = "table" | "preview"

/**
 * Every class a specimen draws, written whole so Tailwind generates it: the
 * names come from the data, the classes from this table.
 */
const SPECIMEN: Record<string, string> = {
  "font-mono": "font-mono",
  "font-sans": "font-sans",
  "text-xs": "text-xs",
  "text-sm": "text-sm",
  "text-base": "text-base",
  "text-lg": "text-lg",
  "text-xl": "text-xl",
  "text-2xl": "text-2xl",
  "text-3xl": "text-3xl",
  "text-4xl": "text-4xl",
  "font-normal": "font-normal",
  "font-medium": "font-medium",
  "font-semibold": "font-semibold",
  "font-bold": "font-bold",
  "leading-tight": "leading-tight",
  "leading-snug": "leading-snug",
  "leading-normal": "leading-normal",
  "leading-relaxed": "leading-relaxed",
  "leading-loose": "leading-loose",
  "tracking-tight": "tracking-tight",
  "tracking-normal": "tracking-normal",
  "tracking-wide": "tracking-wide",
  "tracking-wider": "tracking-wider",
  "tracking-widest": "tracking-widest",
  "text-foreground": "text-foreground",
  "text-muted-foreground": "text-muted-foreground",
}

const PANGRAM = "The quick brown fox jumps over the lazy dog"
const PARAGRAPH =
  "Line height sets the rhythm of a block of text: the higher the ratio, the more air between two lines of the same paragraph."

function specimen(className: string): string {
  return SPECIMEN[className] ?? ""
}

/** The first word of a fact: `base (16px)` → `base`. */
function step(fact: string | undefined): string | undefined {
  return fact?.split(" ")[0]
}

/**
 * The classes a style's specimen draws: the spec's own sample when a screen
 * writes one, else the classes its facts name (a component draws the style).
 */
function styleClasses(style: TextStyle): string {
  const names = style.classes
    ? style.classes.split(" ")
    : [
        `text-${step(style.size)}`,
        `leading-${step(style.lineHeight)}`,
        `font-${step(style.weight)}`,
        `tracking-${step(style.tracking)}`,
        `font-${step(style.family)}`,
      ]
  return cn(names.map(specimen))
}

/** A style's classes to copy, wrapped rather than cut: a style is a whole line. */
function StyleClasses({ style }: { style: TextStyle }) {
  if (!style.classes)
    return (
      <span className="text-xs text-muted-foreground">
        None: the component draws it
      </span>
    )
  return (
    <span className="flex items-start gap-0.5">
      <code className="min-w-0 bg-muted px-1 py-0.5 font-mono text-xs break-words">
        {style.classes}
      </code>
      <CopyButton
        value={style.classes}
        label={`Copy the ${style.name} classes`}
      />
    </span>
  )
}

function TextStyles({
  styles,
  display,
}: {
  styles: TextStyle[]
  display: Display
}) {
  const dash = (value: string | undefined) => value ?? "—"
  if (display === "table")
    return (
      <Table className="min-w-3xl table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Name</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead className="w-28">Size</TableHead>
            <TableHead className="w-32">Line height</TableHead>
            <TableHead className="w-28">Weight</TableHead>
            <TableHead className="w-28">Letter spacing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles.map((style) => (
            <TableRow key={style.name}>
              <TableCell className="align-top whitespace-normal">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{style.name}</span>
                  <span className="text-muted-foreground">
                    <Ticks>{style.use}</Ticks>
                  </span>
                </span>
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <StyleClasses style={style} />
              </TableCell>
              <TableCell className="align-top font-mono whitespace-normal">
                {dash(style.size)}
              </TableCell>
              <TableCell className="align-top font-mono whitespace-normal">
                {dash(style.lineHeight)}
              </TableCell>
              <TableCell className="align-top font-mono whitespace-normal">
                {dash(style.weight)}
              </TableCell>
              <TableCell className="align-top font-mono whitespace-normal">
                {dash(style.tracking)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  return (
    <ul className="flex flex-col divide-y border">
      {styles.map((style) => (
        <li
          key={style.name}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <div className="flex shrink-0 flex-col items-start gap-1 sm:w-64">
            <span className="text-xs font-medium">{style.name}</span>
            <StyleClasses style={style} />
            <span className="font-mono text-xs text-muted-foreground">
              {[style.size, style.lineHeight, style.weight, style.tracking]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <p className={cn("min-w-0 flex-1 break-words", styleClasses(style))}>
            {PANGRAM}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** A table of type tokens, with the columns each kind needs. */
function TypeTable({
  rows,
  value,
  extra,
}: {
  rows: TypeRow[]
  /** The value column: "Size", "Weight", "Value". */
  value: string
  /** A second column after the value: "Line height", "Stack". */
  extra?: { label: string; cell: (row: TypeRow) => ReactNode }
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Token</TableHead>
          <TableHead>{value}</TableHead>
          {extra ? <TableHead>{extra.label}</TableHead> : null}
          <TableHead>Usage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.token}>
            <TableCell className="align-top font-medium">{row.name}</TableCell>
            <TableCell className="align-top">
              <CopyCode value={row.className} />
            </TableCell>
            <TableCell className="align-top">
              <span className="font-mono text-xs">{row.token}</span>
            </TableCell>
            <TableCell className="align-top font-mono">
              {row.value}
              {row.detail ? (
                <span className="text-muted-foreground"> · {row.detail}</span>
              ) : null}
            </TableCell>
            {extra ? (
              <TableCell className="align-top font-mono whitespace-normal">
                {extra.cell(row)}
              </TableCell>
            ) : null}
            <TableCell className="min-w-48 align-top whitespace-normal text-muted-foreground">
              <Ticks>{row.usage}</Ticks>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** The facts of a row beside its specimen: class, value, token. */
function Meta({ row, facts }: { row: TypeRow; facts: string[] }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:w-48">
      <CopyCode value={row.className} />
      {facts.filter(Boolean).map((fact) => (
        <span key={fact} className="font-mono text-xs text-muted-foreground">
          {fact}
        </span>
      ))}
    </div>
  )
}

/** Each row as a specimen drawn in its own style, its facts beside it. */
function SpecimenList({
  rows,
  facts,
  text = PANGRAM,
  base = "text-base",
}: {
  rows: TypeRow[]
  facts: (row: TypeRow) => string[]
  text?: string
  /** The size every specimen of the list shares, when the list is not the scale. */
  base?: string
}) {
  return (
    <ul className="flex flex-col divide-y border">
      {rows.map((row) => (
        <li
          key={row.token}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <Meta row={row} facts={facts(row)} />
          <p
            className={cn(
              "min-w-0 flex-1 break-words",
              specimen(base),
              specimen(row.className)
            )}
          >
            {text}
          </p>
        </li>
      ))}
    </ul>
  )
}

function Families({ rows, display }: { rows: TypeRow[]; display: Display }) {
  if (display === "table")
    return (
      <TypeTable
        rows={rows}
        value="Family"
        extra={{ label: "Stack", cell: (row) => row.stack ?? "—" }}
      />
    )
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {rows.map((row) => (
        <li key={row.token} className="flex flex-col gap-4 border p-4">
          <div className={cn("flex flex-col gap-2", specimen(row.className))}>
            <span className="text-4xl">Aa</span>
            <span className="text-sm break-words">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{row.value}</p>
            <CopyCode value={row.className} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <Ticks>{row.usage}</Ticks>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Headings({
  rows,
  scale,
  display,
}: {
  rows: HeadingRow[]
  scale: TypeRow[]
  display: Display
}) {
  const size = (level: HeadingRow["level"]) => {
    const classes = headingVariants({ level })
    return scale.find((row) => classes.split(" ").includes(row.className))
  }
  if (display === "table")
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Level</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Use</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.level}>
              <TableCell className="align-top font-medium">
                {row.level}
              </TableCell>
              <TableCell className="align-top font-mono">{row.tag}</TableCell>
              <TableCell className="align-top">
                <CopyCode value={headingVariants({ level: row.level })} />
              </TableCell>
              <TableCell className="align-top font-mono">
                {size(row.level)?.value} · {size(row.level)?.detail}
              </TableCell>
              <TableCell className="align-top whitespace-normal text-muted-foreground">
                {row.use}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  return (
    <ul className="flex flex-col divide-y border">
      {rows.map((row) => (
        <li
          key={row.level}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <div className="flex shrink-0 flex-col items-start gap-1 sm:w-48">
            <span className="text-xs font-medium">
              level {row.level} · {row.tag}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {size(row.level)?.className} · {size(row.level)?.detail}
            </span>
          </div>
          <p
            className={cn(
              "min-w-0 flex-1 break-words",
              headingVariants({ level: row.level })
            )}
          >
            {row.use}
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * The type tokens, each as a table row or as a specimen in its own style.
 * One switch drives every section.
 */
export function TypeStyles({ data }: { data: TypeData }) {
  const [display, setDisplay] = useState<Display>("table")

  return (
    <>
      <div className="flex flex-col gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Display"
          value={display}
          onValueChange={(next) => {
            if (next) setDisplay(next as Display)
          }}
        >
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
        </ToggleGroup>
        <p className="max-w-3xl border-l border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
          Specimens render in this site&apos;s own fonts, the ones{" "}
          <code className="font-mono">lib/fonts.ts</code> loads: JetBrains Mono
          for the interface, Geist for <code className="font-mono">Kbd</code>{" "}
          keys and editorial text.
        </p>
      </div>

      <DocSection
        id="text-styles"
        title="Text styles"
        description="The spec's canonical styles: a size, a line height, a weight and a spacing written together. Every one is in the mono family, which html applies. A style a component draws takes no class: write the text, not the style."
      >
        <TextStyles styles={data.styles} display={display} />
      </DocSection>

      <DocSection
        id="families"
        title="Font families"
        description="Two typefaces. The mono family is the whole interface: html applies font-mono."
      >
        <Families rows={data.families} display={display} />
      </DocSection>

      <DocSection
        id="scale"
        title="Type scale"
        description="Each size sets its paired line height: add a leading class only to change it."
      >
        {display === "table" ? (
          <TypeTable
            rows={data.scale}
            value="Size"
            extra={{
              label: "Line height",
              cell: (row) => row.lineHeight ?? "—",
            }}
          />
        ) : (
          <SpecimenList
            rows={data.scale}
            base=""
            facts={(row) => [
              `${row.value} · ${row.detail ?? ""}`,
              row.lineHeight ? `line height ${row.lineHeight}` : "",
            ]}
          />
        )}
      </DocSection>

      <DocSection
        id="weights"
        title="Weights"
        description="A strict hierarchy: normal for text and labels, medium for controls and component titles, semibold for headings, bold for the emphasis a screen draws."
      >
        {display === "table" ? (
          <TypeTable rows={data.weights} value="Weight" />
        ) : (
          <SpecimenList rows={data.weights} facts={(row) => [row.value]} />
        )}
      </DocSection>

      <DocSection
        id="leading"
        title="Line heights"
        description="Ratios of the font size, for text a screen draws itself."
      >
        {display === "table" ? (
          <TypeTable rows={data.leading} value="Ratio" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.leading.map((row) => (
              <li key={row.token} className="flex flex-col gap-3 border p-4">
                <Meta row={row} facts={[row.value]} />
                <p className={cn("bg-muted text-sm", specimen(row.className))}>
                  {PARAGRAPH}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DocSection>

      <DocSection
        id="tracking"
        title="Letter spacing"
        description="Tight for headings, wider for all caps, widest for keyboard shortcuts."
      >
        {display === "table" ? (
          <TypeTable rows={data.tracking} value="Spacing" />
        ) : (
          <SpecimenList rows={data.tracking} facts={(row) => [row.value]} />
        )}
      </DocSection>

      <DocSection
        id="headings"
        title="Headings"
        description="The Heading component draws each level: the size follows level, and the family, weight and spacing stay the same."
      >
        <Headings rows={data.headings} scale={data.scale} display={display} />
      </DocSection>
    </>
  )
}
