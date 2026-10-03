"use client"

import { Fragment, useState } from "react"
import { LockSimpleIcon } from "@phosphor-icons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Heading } from "@/components/ui/heading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import type {
  ColorAlias,
  ColorData,
  PrimitiveStep,
  SemanticColor,
  Surfaces,
} from "@/site/foundation-docs/tokens/color-data"
import { FilterInput } from "@/site/foundation-docs/tokens/filter-input"
import {
  Code,
  CopyCode,
  DottedName,
  DualFill,
  Fill,
  StatusBadge,
  Ticks,
} from "@/site/foundation-docs/tokens/token-ui"
import { DocSection } from "@/site/ui/doc-section"

type View = "swatches" | "table"
type Mode = "both" | "light" | "dark"

const MODES: { value: Exclude<Mode, "both">; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

function shown(mode: Mode) {
  return MODES.filter((item) => mode === "both" || item.value === mode)
}

/** The swatch of a semantic color: each mode shown is drawn on its own surface. */
function ModeSwatch({
  light,
  dark,
  mode,
  surfaces,
  className,
}: {
  light: string
  dark: string
  mode: Mode
  surfaces: Surfaces
  className?: string
}) {
  return (
    <div className={cn("flex border", className)}>
      {shown(mode).map((item) => (
        <Fill
          key={item.value}
          value={item.value === "light" ? light : dark}
          surface={surfaces[item.value]}
          className="flex-1"
        />
      ))}
    </div>
  )
}

/** The value of a color in each mode shown, with the primitive it reads. */
function Values({
  color,
  mode,
}: {
  color: Pick<SemanticColor, "light" | "dark" | "lightRef" | "darkRef">
  mode: Mode
}) {
  return (
    <dl className="flex flex-col gap-0.5 text-xs">
      {shown(mode).map((item) => {
        const value = item.value === "light" ? color.light : color.dark
        const ref = item.value === "light" ? color.lightRef : color.darkRef
        return (
          <div key={item.value} className="flex flex-wrap gap-x-2">
            <dt className="w-10 shrink-0 text-muted-foreground">
              {item.label}
            </dt>
            <dd className="font-mono break-all">
              {value}
              {ref ? (
                <span className="text-muted-foreground"> · {ref}</span>
              ) : null}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

/** The classes of a color; in a table column, `wrap` keeps each one whole. */
function Classes({
  classes,
  wrap = false,
}: {
  classes: string[]
  wrap?: boolean
}) {
  if (classes.length === 0)
    return <p className="text-xs text-muted-foreground">No utility class</p>
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-1">
      {classes.map((value) => (
        <li key={value} className="flex max-w-full min-w-0">
          <CopyCode value={value} wrap={wrap} />
        </li>
      ))}
    </ul>
  )
}

/**
 * A color value that wraps after its opening parenthesis or a comma, never
 * inside a number: a translucent white breaks into its channels and its
 * alpha in a narrow tile or column, not mid-digit.
 */
function ColorValue({ value }: { value: string }) {
  return value
    .replace(/,\s+/g, ",")
    .split(/(?<=[(,])/)
    .map((part, index) => (
      <Fragment key={index}>
        {index ? <wbr /> : null}
        {part}
      </Fragment>
    ))
}

function ColorCard({
  color,
  mode,
  surfaces,
}: {
  color: SemanticColor
  mode: Mode
  surfaces: Surfaces
}) {
  return (
    <article className="flex h-full min-w-0 flex-col border bg-background">
      <ModeSwatch
        light={color.light}
        dark={color.dark}
        mode={mode}
        surfaces={surfaces}
        className="h-14 shrink-0 border-x-0 border-t-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-sm font-medium break-all">
            {color.token}
          </p>
          <StatusBadge status={color.status} replacement={color.replacement} />
        </div>
        <CopyCode value={color.cssVar} />
        <Classes classes={color.classes} />
        <Values color={color} mode={mode} />
        {color.description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <Ticks>{color.description}</Ticks>
          </p>
        ) : null}
      </div>
    </article>
  )
}

function ValueCell({
  value,
  reference,
  surface,
}: {
  value: string
  reference?: string
  surface: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Fill
        value={value}
        surface={surface}
        className="size-6 shrink-0 border"
      />
      <div className="flex min-w-0 flex-col font-mono text-xs whitespace-normal">
        <span className="break-words">
          <ColorValue value={value} />
        </span>
        {reference ? (
          <span className="text-muted-foreground">{reference}</span>
        ) : null}
      </div>
    </div>
  )
}

function ColorTable({
  colors,
  mode,
  surfaces,
}: {
  colors: SemanticColor[]
  mode: Mode
  surfaces: Surfaces
}) {
  return (
    <Table className="min-w-2xl table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          {shown(mode).map((item) => (
            <TableHead key={item.value} className="w-36">
              {item.label}
            </TableHead>
          ))}
          <TableHead className="w-56">Classes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {colors.map((color) => (
          <TableRow key={color.token}>
            <TableCell className="align-top whitespace-normal">
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium break-all">
                    {color.token}
                  </span>
                  <StatusBadge
                    status={color.status}
                    replacement={color.replacement}
                  />
                </span>
                <CopyCode value={color.cssVar} className="max-w-full" />
                {color.description ? (
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    <Ticks>{color.description}</Ticks>
                  </span>
                ) : null}
              </div>
            </TableCell>
            {shown(mode).map((item) => (
              <TableCell key={item.value} className="align-top">
                <ValueCell
                  value={item.value === "light" ? color.light : color.dark}
                  reference={
                    item.value === "light" ? color.lightRef : color.darkRef
                  }
                  surface={surfaces[item.value]}
                />
              </TableCell>
            ))}
            <TableCell className="align-top whitespace-normal">
              <Classes classes={color.classes} wrap />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function AliasCard({
  alias,
  mode,
  surfaces,
}: {
  alias: ColorAlias
  mode: Mode
  surfaces: Surfaces
}) {
  return (
    <article className="flex h-full min-w-0 flex-col border bg-background">
      <ModeSwatch
        light={alias.light}
        dark={alias.dark}
        mode={mode}
        surfaces={surfaces}
        className="h-10 border-x-0 border-t-0"
      />
      <div className="flex min-w-0 flex-col gap-2 p-3">
        <CopyCode value={alias.cssVar} />
        <p className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
          Reads <Code>{alias.reads}</Code>
        </p>
        <Classes classes={alias.classes} />
      </div>
    </article>
  )
}

function AliasTable({
  aliases,
  mode,
  surfaces,
}: {
  aliases: ColorAlias[]
  mode: Mode
  surfaces: Surfaces
}) {
  // Fixed columns, as in ColorTable: in an automatic layout, the Reads
  // column shrank to a few letters a line.
  return (
    <Table className="min-w-2xl table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-56">CSS variable</TableHead>
          <TableHead>Reads</TableHead>
          {shown(mode).map((item) => (
            <TableHead key={item.value} className="w-36">
              {item.label}
            </TableHead>
          ))}
          <TableHead className="w-56">Classes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {aliases.map((alias) => (
          <TableRow key={alias.cssVar}>
            <TableCell className="align-top whitespace-normal">
              <CopyCode value={alias.cssVar} wrap className="max-w-full" />
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <span className="font-mono text-xs break-words">
                <DottedName name={alias.reads} />
              </span>
            </TableCell>
            {shown(mode).map((item) => (
              <TableCell key={item.value} className="align-top">
                <ValueCell
                  value={item.value === "light" ? alias.light : alias.dark}
                  surface={surfaces[item.value]}
                />
              </TableCell>
            ))}
            <TableCell className="align-top whitespace-normal">
              <Classes classes={alias.classes} wrap />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function UsedBy({ step }: { step: PrimitiveStep }) {
  return step.usedBy.length ? (
    <ul className="flex flex-wrap gap-1">
      {step.usedBy.map((name) => (
        <li key={name}>
          <Code>{name}</Code>
        </li>
      ))}
    </ul>
  ) : (
    <span className="text-xs text-muted-foreground">No semantic token</span>
  )
}

/**
 * How many semantic tokens read a step. A step no token reads is either
 * reserved, with the reason in its description, or due for deletion.
 */
function readers(step: PrimitiveStep): string {
  const count = step.usedBy.length
  if (count === 0) return step.status === "reserved" ? "Reserved" : "Unused"
  return count === 1 ? "1 token" : `${count} tokens`
}

function StepTile({
  step,
  surfaces,
}: {
  step: PrimitiveStep
  surfaces: Surfaces
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          className={cn(
            "flex h-full min-w-0 flex-col gap-1 border border-transparent p-1 transition-colors hover:border-border",
            FOCUS_OUTLINE_RESET,
            FOCUS_RING
          )}
        >
          <DualFill
            value={step.value}
            surfaces={surfaces}
            className="h-12 border"
          />
          <span className="text-xs font-medium">{step.step}</span>
          <span className="font-mono text-xs break-words text-muted-foreground">
            <ColorValue value={step.value} />
          </span>
          <span className="text-xs text-muted-foreground">{readers(step)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {step.usedBy.length
              ? `${step.name} is read by`
              : `${step.name} is read by no semantic token`}
          </span>
          {step.usedBy.length === 0 && step.description ? (
            <span>
              <Ticks>{step.description}</Ticks>
            </span>
          ) : null}
          {step.usedBy.length ? (
            <ul className="flex flex-col font-mono">
              {step.usedBy.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function PrimitiveTable({
  steps,
  surfaces,
}: {
  steps: PrimitiveStep[]
  surfaces: Surfaces
}) {
  return (
    <Table className="min-w-xl table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Step</TableHead>
          <TableHead className="w-56">Value</TableHead>
          <TableHead>Read by</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {steps.map((step) => (
          <TableRow key={step.name}>
            <TableCell className="align-top">
              <div className="flex flex-col items-start gap-1">
                <span className="font-mono text-xs font-medium">
                  {step.name}
                </span>
                <StatusBadge status={step.status} />
              </div>
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <div className="flex items-start gap-2">
                <DualFill
                  value={step.value}
                  surfaces={surfaces}
                  className="h-6 w-12 shrink-0 border"
                />
                <span className="font-mono text-xs break-all">
                  {step.value}
                </span>
              </div>
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <UsedBy step={step} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PaletteTitle({
  id,
  steps,
  children,
}: {
  id: string
  steps: number
  children: string
}) {
  return (
    <div className="flex shrink-0 items-baseline gap-2 md:w-32 md:flex-col md:gap-0.5 md:p-1">
      <Heading level={3} id={`palette-${id}`} className="scroll-mt-20">
        {children}
      </Heading>
      <span className="text-xs text-muted-foreground">
        {steps === 1 ? "1 step" : `${steps} steps`}
      </span>
    </div>
  )
}

function NoMatch({ query }: { query: string }) {
  return (
    <p className="text-sm text-muted-foreground">No color matches “{query}”.</p>
  )
}

/**
 * The colors of the design system, in three tiers: the semantic tokens the
 * components read, the shadcn/ui aliases over them, and the private palette
 * underneath. One toolbar drives the three: the view, the modes, the filter.
 */
export function ColorExplorer({ data }: { data: ColorData }) {
  const [view, setView] = useState<View>("swatches")
  const [mode, setMode] = useState<Mode>("both")
  const [query, setQuery] = useState("")

  const needle = query.trim().toLowerCase()
  const match = (search: string) => needle === "" || search.includes(needle)

  const groups = data.groups
    .map((group) => ({
      ...group,
      colors: group.colors.filter((color) => match(color.search)),
    }))
    .filter((group) => group.colors.length > 0)
  const aliases = data.aliases.filter((alias) => match(alias.search))
  const palettes = data.palettes
    .map((palette) => ({
      ...palette,
      steps: palette.steps.filter((step) => match(step.search)),
    }))
    .filter((palette) => palette.steps.length > 0)

  const total =
    data.groups.reduce((sum, group) => sum + group.colors.length, 0) +
    data.aliases.length +
    data.palettes.reduce((sum, palette) => sum + palette.steps.length, 0)
  const found =
    groups.reduce((sum, group) => sum + group.colors.length, 0) +
    aliases.length +
    palettes.reduce((sum, palette) => sum + palette.steps.length, 0)

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="View"
            value={view}
            onValueChange={(next) => {
              if (next) setView(next as View)
            }}
          >
            <ToggleGroupItem value="swatches">Swatches</ToggleGroupItem>
            <ToggleGroupItem value="table">Table</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Modes"
            value={mode}
            onValueChange={(next) => {
              if (next) setMode(next as Mode)
            }}
          >
            <ToggleGroupItem value="both">Both</ToggleGroupItem>
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          </ToggleGroup>
          <FilterInput
            id="color-filter"
            label="Filter colors"
            placeholder="Name, variable, class or value"
            value={query}
            onChange={setQuery}
            className="w-full sm:ml-auto sm:w-80"
          />
        </div>
        <p role="status" className="text-xs text-muted-foreground">
          {needle
            ? `${found} of ${total} colors match.`
            : `${total} colors. Swatches show each mode on its own page surface.`}
        </p>
      </div>

      <DocSection
        id="semantic"
        title="Semantic colors"
        description="The colors components read, by role, with the class each one is written with. bg-, border-, ring-, fill- and stroke- read the token the class names; text-primary, text-destructive, text-success and text-warning read the matching text token instead (color.text.*), so a label keeps 4.5:1."
      >
        {groups.length === 0 ? <NoMatch query={query} /> : null}
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <Heading
                level={3}
                id={`semantic-${group.id}`}
                className="scroll-mt-20"
              >
                {group.label}
              </Heading>
              <span className="text-xs text-muted-foreground">
                {group.colors.length}
              </span>
            </div>
            {view === "swatches" ? (
              <ul className="grid gap-3 lg:grid-cols-2">
                {group.colors.map((color) => (
                  <li key={color.token} className="min-w-0">
                    <ColorCard
                      color={color}
                      mode={mode}
                      surfaces={data.surfaces}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ColorTable
                colors={group.colors}
                mode={mode}
                surfaces={data.surfaces}
              />
            )}
          </div>
        ))}
      </DocSection>

      <DocSection
        id="aliases"
        title="Component aliases"
        description="The shadcn/ui variables, kept for compatibility: each one reads a semantic token and resolves to its value in both modes."
      >
        {aliases.length === 0 ? (
          <NoMatch query={query} />
        ) : view === "swatches" ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {aliases.map((alias) => (
              <li key={alias.cssVar} className="min-w-0">
                <AliasCard alias={alias} mode={mode} surfaces={data.surfaces} />
              </li>
            ))}
          </ul>
        ) : (
          <AliasTable aliases={aliases} mode={mode} surfaces={data.surfaces} />
        )}
      </DocSection>

      <DocSection
        id="primitives"
        title="Primitives"
        description="The palette the semantic tokens pick from. A primitive has one value: a mode changes the step a semantic token reads, so each swatch is drawn on both page surfaces."
      >
        <Alert variant="warning">
          <LockSimpleIcon aria-hidden="true" />
          <AlertTitle>Private: Tier 1</AlertTitle>
          <AlertDescription>
            Never referenced in a component. Use the semantic token that reads
            the step: hover or focus a step, or switch to the Table view, to see
            which ones.
          </AlertDescription>
        </Alert>
        {palettes.length === 0 ? <NoMatch query={query} /> : null}
        {palettes.length > 0 && view === "swatches" ? (
          <ul className="flex flex-col divide-y border">
            {palettes.map((palette) => (
              <li
                key={palette.id}
                className="flex flex-col gap-2 p-2 md:flex-row md:gap-4"
              >
                <PaletteTitle id={palette.id} steps={palette.steps.length}>
                  {palette.label}
                </PaletteTitle>
                <ul className="grid min-w-0 flex-1 grid-cols-3 gap-1 sm:grid-cols-6 lg:grid-cols-11">
                  {palette.steps.map((step) => (
                    <li key={step.name} className="min-w-0">
                      <StepTile step={step} surfaces={data.surfaces} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : null}
        {view === "table"
          ? palettes.map((palette) => (
              <div key={palette.id} className="flex flex-col gap-3">
                <PaletteTitle id={palette.id} steps={palette.steps.length}>
                  {palette.label}
                </PaletteTitle>
                <PrimitiveTable
                  steps={palette.steps}
                  surfaces={data.surfaces}
                />
              </div>
            ))
          : null}
      </DocSection>
    </>
  )
}
