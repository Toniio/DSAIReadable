import { Fragment, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { cn } from "@/lib/utils"
import { Anatomy } from "@/site/component-docs/anatomy"
import { categoryId } from "@/site/component-docs/category-id"
import { DependencyGraph } from "@/site/component-docs/dependency-graph"
import { applies, setBy } from "@/site/component-docs/set-by"
import { StoryGrid } from "@/site/component-docs/story-grid"
import { TokenValue } from "@/site/component-docs/token-value"
import { changelog, changesFor } from "@/site/lib/changelog"
import {
  componentBySlug,
  componentHref,
  componentMarkdown,
  components,
  componentSpec,
  stateRows,
  usedByComponents,
  usesComponents,
  variantAxes,
} from "@/site/lib/components"
import { plain, section } from "@/site/lib/markdown"
import { componentsNav } from "@/site/lib/nav"
import { autoControls, forcedStates } from "@/site/lib/playground"
import { installCommand, sourceUrl } from "@/site/lib/site"
import { Playground } from "@/site/playground/playground"
import { CodeBlock, CommandLine } from "@/site/ui/code-block"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown, Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"
import type { TocItem } from "@/site/ui/page-toc"
import { LINK } from "@/site/ui/link"

export const dynamicParams = false

export function generateStaticParams() {
  return components().map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const entry = componentBySlug((await params).slug)
  if (!entry) return {}
  return {
    title: entry.name,
    description: plain(componentSpec(entry.name).role),
  }
}

/** Where the generated part of a spec section ends and the prose resumes. */
const END_OF_GENERATED = "<!-- End of the generated part. -->"

/**
 * `data-slot="tabs-trigger"` → `tabs-trigger`. A part the spec names another
 * way ("toggle button", "_(no data-slot)_") has none: no slot is made up.
 */
function slotName(cell: string): string | undefined {
  return /data-slot=\\?"([^"\\]+)/.exec(cell)?.[1]
}

/**
 * A dotted path that may wrap after each dot, `buttonVariants.size.sm`: a
 * long one otherwise takes its whole width from the Classes column beside it.
 */
function DottedPath({ children }: { children: string }) {
  return children.split(/(?<=\.)/).map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ))
}

/** The hand-written prose that follows the generated tables of Props / API. */
function propsProse(name: string): string {
  const body = section(componentMarkdown(name), "Props / API")
  const end = body.indexOf(END_OF_GENERATED)
  return end < 0 ? "" : body.slice(end + END_OF_GENERATED.length).trim()
}

/** One cell of the facts under the title. */
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-background p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

/** A link to a repository file on GitHub, at the release tag. */
function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={cn(LINK, "inline-flex items-center gap-1 break-all")}
    >
      {children}
      <ArrowUpRightIcon aria-hidden="true" className="shrink-0" />
    </Link>
  )
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const entry = componentBySlug((await params).slug)
  if (!entry) notFound()
  const spec = componentSpec(entry.name)
  const source = `specs/components/${entry.name}.md`
  const controls = autoControls(entry.name)
  const rows = stateRows(entry.name)
  // A forced state must draw something. Offered: a state the component draws
  // with classes of its own, or one a component it is built on draws (the
  // Button of a Dialog or a Pagination). Not offered: a state the spec marks
  // "Not applicable", and one with no class at all ("No dedicated style").
  const builtOnOthers = usesComponents(entry.slug).length > 0
  const states = forcedStates(entry.name).filter((state) => {
    if (state === "rest") return true
    const row = rows.find((candidate) => candidate.state === state)
    return (
      !!row &&
      applies(row.description) &&
      (row.classes.length > 0 || builtOnOthers)
    )
  })
  const axes = variantAxes(entry.name)
  const musts = spec.constraints.filter((rule) => rule.startsWith("**MUST** —"))
  const mustNots = spec.constraints.filter((rule) =>
    rule.startsWith("**MUST NOT** —")
  )
  const notes = spec.constraints.filter(
    (rule) =>
      !rule.startsWith("**MUST** —") && !rule.startsWith("**MUST NOT** —")
  )
  const exportsWithProps = spec.exports.map((item) => ({
    ...item,
    props: spec.props.filter((prop) => prop.component === item.name),
  }))
  const prose = propsProse(entry.name)
  // A note on the variant axes reads best right under their table.
  const axesNote = axes.length > 0 && prose.startsWith("> **Variant axes**")
  const graphNode = (slug: string) => ({
    name: componentBySlug(slug)?.name ?? slug,
    href: `/components/${slug}/`,
  })
  const uses = usesComponents(entry.slug).map(graphNode)
  const usedBy = usedByComponents(entry.slug).map(graphNode)
  const changes = changesFor(entry.name)
  const lastChanged = changes[0]?.version
  const firstCovered = changelog().at(-1)?.version
  const related = [
    ...new Set(
      spec.cross_references
        .map((reference) => /^(\w+)/.exec(reference)?.[1] ?? reference)
        .filter((name) => name !== entry.name && componentHref(name))
    ),
  ]

  const has = {
    anatomy: spec.anatomy.length > 0,
    dependencies: uses.length + usedBy.length + spec.dependencies.length > 0,
    properties: axes.length > 0 || exportsWithProps.length > 0 || !!prose,
    states: rows.length > 0,
    accessibility: spec.accessibility.trim().length > 0,
    code: spec.code_example.trim().length > 0,
    related: related.length > 0,
  }
  const toc: TocItem[] = [
    { id: "usage", label: "Usage" },
    has.anatomy && { id: "anatomy", label: "Anatomy" },
    has.dependencies && { id: "dependencies", label: "Dependencies" },
    has.properties && { id: "properties", label: "Properties" },
    has.states && { id: "states", label: "States" },
    { id: "tokens", label: "Tokens" },
    has.accessibility && { id: "accessibility", label: "Accessibility" },
    has.code && { id: "code", label: "Code" },
    { id: "shadcn", label: "shadcn/ui" },
    has.related && { id: "related", label: "Related" },
    { id: "changes", label: "Change log" },
  ].filter((item): item is TocItem => Boolean(item))

  return (
    <DocsPage nav={componentsNav()} navLabel="Components" toc={toc}>
      <PageHeader
        eyebrow={
          <span>
            <Link href="/components/" className={LINK}>
              Components
            </Link>{" "}
            /{" "}
            <Link
              href={`/components/#${categoryId(entry.category)}`}
              className={LINK}
            >
              {entry.category}
            </Link>
          </span>
        }
        title={entry.name}
        lead={<InlineMarkdown from={source}>{spec.role}</InlineMarkdown>}
      >
        <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3">
          <Fact term="Status">
            <Badge
              variant={
                entry.status === "stable"
                  ? "success"
                  : entry.status === "beta"
                    ? "warning"
                    : "destructive"
              }
            >
              {entry.status}
            </Badge>
          </Fact>
          <Fact term="Category">{entry.category}</Fact>
          <Fact term="Last changed">
            {lastChanged ? (
              <Link href="#changes" className={LINK}>
                {lastChanged}
              </Link>
            ) : (
              <span className="text-muted-foreground">No entry</span>
            )}
          </Fact>
          <Fact term="Source">
            <SourceLink href={sourceUrl(entry.codePath)}>
              {entry.codePath.replace("components/ui/", "")}
            </SourceLink>
          </Fact>
          <Fact term="Spec">
            <SourceLink
              href={sourceUrl(source)}
            >{`${entry.name}.md`}</SourceLink>
          </Fact>
          <Fact term="shadcn/ui">
            {spec.shadcn.item ? (
              <code className="font-mono">{spec.shadcn.item}</code>
            ) : (
              <span className="text-muted-foreground">Design system only</span>
            )}
          </Fact>
        </dl>
        <CommandLine
          command={installCommand(entry.slug)}
          label="Copy the install command"
        />
      </PageHeader>

      <Playground
        name={entry.name}
        slug={entry.slug}
        autoControls={controls}
        states={states}
        exampleCode={spec.code_example}
      />

      <DocSection id="usage" title="Usage">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
          {spec.usage.map((item) => (
            <li key={item}>
              <InlineMarkdown from={source}>{item}</InlineMarkdown>
            </li>
          ))}
        </ul>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 border p-4">
            <Badge variant="success">Must</Badge>
            {musts.length ? (
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
                {musts.map((rule) => (
                  <li key={rule}>
                    <InlineMarkdown from={source}>
                      {rule.replace("**MUST** — ", "")}
                    </InlineMarkdown>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No further rule.</p>
            )}
          </div>
          <div className="flex flex-col gap-3 border p-4">
            <Badge variant="destructive">Must not</Badge>
            {mustNots.length ? (
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
                {mustNots.map((rule) => (
                  <li key={rule}>
                    <InlineMarkdown from={source}>
                      {rule.replace("**MUST NOT** — ", "")}
                    </InlineMarkdown>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No prohibition.</p>
            )}
          </div>
        </div>
        {notes.length ? (
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-muted-foreground">
            {notes.map((note) => (
              <li key={note}>
                <InlineMarkdown from={source}>{note}</InlineMarkdown>
              </li>
            ))}
          </ul>
        ) : null}
      </DocSection>

      {has.anatomy ? (
        <DocSection
          id="anatomy"
          title="Anatomy"
          description="The parts of the component, each named by the data-slot attribute it renders, where it has one."
        >
          <Anatomy
            name={entry.name}
            slug={entry.slug}
            parts={spec.anatomy.map((part) => ({
              slot: slotName(part.slot),
              label: <InlineMarkdown from={source}>{part.slot}</InlineMarkdown>,
              role: <InlineMarkdown from={source}>{part.role}</InlineMarkdown>,
            }))}
          />
        </DocSection>
      ) : null}

      {has.dependencies ? (
        <DocSection
          id="dependencies"
          title="Dependencies"
          description="The components of the design system it is built on, and those built on it, from the registry."
        >
          <DependencyGraph name={entry.name} uses={uses} usedBy={usedBy} />
          {spec.dependencies.length ? (
            <div className="flex flex-col gap-2">
              <Heading level={3}>Imports</Heading>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
                {spec.dependencies.map((dependency) => (
                  <li key={dependency}>
                    <InlineMarkdown from={source}>{dependency}</InlineMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DocSection>
      ) : null}

      {has.properties ? (
        <DocSection id="properties" title="Properties">
          {axes.length ? (
            <div className="flex flex-col gap-3">
              <Heading level={3}>Variant axes</Heading>
              <div className="min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Axis</TableHead>
                      <TableHead>Values</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {axes.map((axis) => (
                      <TableRow key={`${axis.component}-${axis.axis}`}>
                        <TableCell className="align-top">
                          <code className="font-mono text-xs">
                            {axis.component}
                          </code>
                        </TableCell>
                        <TableCell className="align-top">
                          <code className="font-mono text-xs">{axis.axis}</code>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <ul className="flex flex-wrap gap-1">
                            {axis.values.map((value) => (
                              <li key={value}>
                                <Badge
                                  variant={
                                    value === axis.default
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {value}
                                  {value === axis.default ? (
                                    <span className="sr-only"> (default)</span>
                                  ) : null}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {axesNote ? <Markdown from={source}>{prose}</Markdown> : null}
              <StoryGrid
                name={entry.name}
                slug={entry.slug}
                autoControls={controls}
                states={states}
                mode="axes"
                axes={axes
                  .filter((axis) => axis.component === entry.name)
                  .map((axis) => axis.axis)}
              />
            </div>
          ) : null}
          {exportsWithProps.map((item) => (
            <div key={item.name} className="flex flex-col gap-2">
              <Heading level={3}>
                <code className="font-mono">{item.name}</code>
              </Heading>
              {item.description || item.summary ? (
                <div className="text-sm leading-relaxed text-muted-foreground">
                  <InlineMarkdown from={source}>
                    {item.description || item.summary}
                  </InlineMarkdown>
                </div>
              ) : null}
              {item.props.length ? (
                <div className="min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Prop</TableHead>
                        <TableHead className="w-64">Type</TableHead>
                        <TableHead className="w-36">Default</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.props.map((prop) => (
                        <TableRow key={prop.prop}>
                          <TableCell className="align-top">
                            <InlineMarkdown>{prop.prop}</InlineMarkdown>
                          </TableCell>
                          <TableCell className="max-w-xs align-top whitespace-normal">
                            <InlineMarkdown>{prop.type}</InlineMarkdown>
                          </TableCell>
                          <TableCell className="align-top">
                            <InlineMarkdown>{prop.default}</InlineMarkdown>
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <InlineMarkdown from={source}>
                              {prop.description}
                            </InlineMarkdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </div>
          ))}
          {prose && !axesNote ? (
            /^\|/m.test(prose) ? (
              <div className="min-w-0">
                <Markdown from={source}>{prose}</Markdown>
              </div>
            ) : (
              <Markdown from={source}>{prose}</Markdown>
            )
          ) : null}
        </DocSection>
      ) : null}

      {has.states ? (
        <DocSection id="states" title="States">
          <StoryGrid
            name={entry.name}
            slug={entry.slug}
            autoControls={controls}
            states={states}
            mode="states"
          />
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead className="w-48">Set by</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.state}>
                    <TableCell className="align-top font-medium">
                      {row.state}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal text-muted-foreground">
                      <InlineMarkdown>
                        {setBy(entry.name, row.state, row.description)}
                      </InlineMarkdown>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <InlineMarkdown from={source}>
                        {row.description}
                      </InlineMarkdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DocSection>
      ) : null}

      <DocSection
        id="tokens"
        title="Tokens"
        description="The design tokens the component reads, through the Tailwind classes the theme bridge ties to them, with their values in light and dark mode."
      >
        {spec.tokens.length ? (
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-64">Classes</TableHead>
                  <TableHead>Where</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spec.tokens.map((token) => (
                  <TableRow key={token.token}>
                    <TableCell className="align-top">
                      <code className="font-mono text-xs">{token.token}</code>
                    </TableCell>
                    <TableCell className="max-w-xs align-top whitespace-normal">
                      <TokenValue name={token.token} />
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      {/* Chips wrap between classes; a class longer than the
                          column breaks after a hyphen, never between letters. */}
                      <span className="flex flex-wrap gap-1">
                        {token.classes.map((value) => (
                          <code
                            key={value}
                            className="bg-muted px-1 py-0.5 font-mono text-xs"
                          >
                            {value}
                          </code>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell className="align-top text-xs whitespace-normal text-muted-foreground">
                      <DottedPath>{token.where.join(" · ")}</DottedPath>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This component reads no token of its own.
          </p>
        )}
      </DocSection>

      {has.accessibility ? (
        <DocSection id="accessibility" title="Accessibility">
          <Markdown from={source} shift={1}>
            {spec.accessibility}
          </Markdown>
        </DocSection>
      ) : null}

      {has.code ? (
        <DocSection
          id="code"
          title="Code"
          description="The spec's example, as an agent copies it."
        >
          <CodeBlock
            code={spec.code_example}
            language="tsx"
            title={`${entry.name}.tsx`}
          />
        </DocSection>
      ) : null}

      <DocSection
        id="shadcn"
        title="shadcn/ui"
        description={
          spec.shadcn.item
            ? `Follows the shadcn/ui ${spec.shadcn.item} API; every difference is declared.`
            : "Not a shadcn/ui component: the design system adds it."
        }
      >
        {spec.shadcn.divergences.length ? (
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Change</TableHead>
                  <TableHead>Where</TableHead>
                  <TableHead>Why</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spec.shadcn.divergences.map((divergence, index) => (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <Badge variant="outline">{divergence.type}</Badge>
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs whitespace-normal">
                      {[divergence.export, divergence.prop, divergence.value]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                      {divergence.upstream
                        ? ` (upstream: ${divergence.upstream})`
                        : ""}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <InlineMarkdown from={source}>
                        {divergence.note}
                      </InlineMarkdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {spec.shadcn.item
              ? "No divergence: the shadcn/ui API, as is."
              : "No upstream API to diverge from."}
          </p>
        )}
      </DocSection>

      {has.related ? (
        <DocSection
          id="related"
          title="Related"
          description="The components the spec points to."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((name) => (
              <li key={name}>
                <Link
                  href={componentHref(name) ?? "/components/"}
                  className={cn(
                    "flex h-full flex-col gap-1 border p-3 transition-colors hover:border-foreground hover:bg-muted",
                    FOCUS_OUTLINE_RESET,
                    FOCUS_RING
                  )}
                >
                  <span className="text-sm font-semibold">{name}</span>
                  <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {plain(componentSpec(name).role)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DocSection>
      ) : null}

      <DocSection
        id="changes"
        title="Change log"
        description="The changelog entries that name this component, newest first."
      >
        {changes.length ? (
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change, index) => (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <span className="flex flex-col items-start gap-1">
                        <span className="font-mono text-xs">
                          {change.version}
                        </span>
                        {change.category ? (
                          <Badge variant="secondary">{change.category}</Badge>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <InlineMarkdown>{change.text}</InlineMarkdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {firstCovered
              ? `No entry names it since ${firstCovered}, the first version the changelog covers.`
              : "No entry names it yet."}
          </p>
        )}
      </DocSection>
    </DocsPage>
  )
}
