import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
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
import { StoryGrid } from "@/site/component-docs/story-grid"
import { changesFor } from "@/site/lib/changelog"
import {
  componentBySlug,
  componentHref,
  components,
  componentSpec,
  stateRows,
  usedByComponents,
  usesComponents,
  variantAxes,
} from "@/site/lib/components"
import { plain } from "@/site/lib/markdown"
import { componentsNav } from "@/site/lib/nav"
import { autoControls, forcedStates } from "@/site/lib/playground"
import { installCommand, sourceUrl } from "@/site/lib/site"
import { Playground } from "@/site/playground/playground"
import { CodeBlock, CommandLine } from "@/site/ui/code-block"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown, Markdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"

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

const LINK = cn(
  "text-primary underline underline-offset-4",
  FOCUS_OUTLINE_RESET,
  FOCUS_RING
)

/** What puts a component in a state: the reader's interaction, or a prop. */
const SET_BY: Record<string, string> = {
  default: "—",
  hover: "Interaction: pointer over",
  focus: "Interaction: keyboard focus",
  active: "Interaction: press",
  disabled: "The `disabled` prop",
  error: "`aria-invalid`",
  open: "The trigger, or `open`",
  closing: "Closing the overlay",
  loading: "A child `Spinner`, `aria-busy`",
  checked: "`checked`, or a click",
  selected: "A click, or `value`",
  pressed: "`pressed`, or a click",
}

/** `data-slot="tabs-trigger"` → `tabs-trigger`. */
function slotName(cell: string): string {
  return /data-slot=\\?"([^"\\]+)/.exec(cell)?.[1] ?? plain(cell)
}

const TOC = [
  { id: "usage", label: "Usage" },
  { id: "anatomy", label: "Anatomy" },
  { id: "dependencies", label: "Dependencies" },
  { id: "properties", label: "Properties" },
  { id: "states", label: "States" },
  { id: "tokens", label: "Tokens" },
  { id: "accessibility", label: "Accessibility" },
  { id: "code", label: "Code" },
  { id: "shadcn", label: "shadcn/ui" },
  { id: "related", label: "Related" },
  { id: "changes", label: "Change log" },
]

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
  const states = forcedStates(entry.name)
  const axes = variantAxes(entry.name)
  const rows = stateRows(entry.name)
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
  const uses = usesComponents(entry.slug)
  const usedBy = usedByComponents(entry.slug)
  const changes = changesFor(entry.name)
  const related = spec.cross_references
    .map((reference) => /^(\w+)/.exec(reference)?.[1] ?? reference)
    .filter((name) => componentHref(name))

  return (
    <DocsPage nav={componentsNav()} navLabel="Components" toc={TOC}>
      <PageHeader
        eyebrow={
          <span>
            <Link href="/components/" className={LINK}>
              Components
            </Link>{" "}
            / {entry.category}
          </span>
        }
        title={entry.name}
        lead={<InlineMarkdown from={source}>{spec.role}</InlineMarkdown>}
      >
        <dl className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd>
              <Badge
                variant={entry.status === "stable" ? "success" : "warning"}
              >
                {entry.status}
              </Badge>
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Category</dt>
            <dd className="text-sm">{entry.category}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="text-sm">
              <Link
                href={sourceUrl(entry.codePath)}
                className={cn(LINK, "inline-flex items-center gap-1")}
              >
                {entry.codePath.replace("components/ui/", "")}
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Spec</dt>
            <dd className="text-sm">
              <Link
                href={sourceUrl(source)}
                className={cn(LINK, "inline-flex items-center gap-1")}
              >
                {entry.name}.md
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            </dd>
          </div>
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
            <Badge variant="success">Do</Badge>
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
              <p className="text-sm text-muted-foreground">
                No MUST rule beyond the usage above.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 border p-4">
            <Badge variant="destructive">Don&apos;t</Badge>
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
              <p className="text-sm text-muted-foreground">No MUST NOT rule.</p>
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

      <DocSection
        id="anatomy"
        title="Anatomy"
        description="The parts of the component, each marked with the data-slot attribute it renders."
      >
        <Anatomy
          name={entry.name}
          slug={entry.slug}
          parts={spec.anatomy.map((part) => ({
            slot: slotName(part.slot),
            role: <InlineMarkdown from={source}>{part.role}</InlineMarkdown>,
          }))}
        />
      </DocSection>

      <DocSection id="dependencies" title="Dependencies">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Built on
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
              {spec.dependencies.map((dependency) => (
                <li key={dependency}>
                  <InlineMarkdown from={source}>{dependency}</InlineMarkdown>
                </li>
              ))}
              {uses.map((slug) => (
                <li key={slug}>
                  <Link href={`/components/${slug}/`} className={LINK}>
                    {componentBySlug(slug)?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 border p-4">
            <p className="text-xs font-medium text-muted-foreground">Used by</p>
            {usedBy.length ? (
              <ul className="flex flex-wrap gap-2">
                {usedBy.map((slug) => (
                  <li key={slug}>
                    <Badge variant="outline" asChild>
                      <Link href={`/components/${slug}/`}>
                        {componentBySlug(slug)?.name}
                      </Link>
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No other component builds on it.
              </p>
            )}
          </div>
        </div>
      </DocSection>

      <DocSection id="properties" title="Properties">
        {axes.length ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Variant axes</p>
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
                                value === axis.default ? "default" : "secondary"
                              }
                            >
                              {value}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <p className="text-sm font-medium">
              <code className="font-mono">{item.name}</code>
            </p>
            {item.description || item.summary ? (
              <div className="text-sm leading-relaxed text-muted-foreground">
                <InlineMarkdown from={source}>
                  {item.description || item.summary}
                </InlineMarkdown>
              </div>
            ) : null}
            {item.props.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prop</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Default</TableHead>
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
            ) : null}
          </div>
        ))}
      </DocSection>

      <DocSection id="states" title="States">
        <StoryGrid
          name={entry.name}
          slug={entry.slug}
          autoControls={controls}
          states={states}
          mode="states"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Set by</TableHead>
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
                    {SET_BY[row.state] ?? "A prop or an attribute"}
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
      </DocSection>

      <DocSection
        id="tokens"
        title="Tokens"
        description="The design tokens the component reads, through the Tailwind classes the theme bridge ties to them."
      >
        {spec.tokens.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Where</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spec.tokens.map((token) => (
                <TableRow key={token.token}>
                  <TableCell className="align-top">
                    <code className="font-mono text-xs">{token.token}</code>
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
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
                    {token.where.join(" · ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            This component reads no token of its own.
          </p>
        )}
      </DocSection>

      <DocSection id="accessibility" title="Accessibility">
        <Markdown from={source} shift={1}>
          {spec.accessibility}
        </Markdown>
      </DocSection>

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
        ) : (
          <p className="text-sm text-muted-foreground">
            No divergence: the shadcn/ui API, as is.
          </p>
        )}
      </DocSection>

      <DocSection id="related" title="Related">
        {related.length ? (
          <ul className="flex flex-wrap gap-2">
            {related.map((name) => (
              <li key={name}>
                <Badge variant="outline" asChild>
                  <Link href={componentHref(name) ?? "/components/"}>
                    {name}
                  </Link>
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No cross-reference.</p>
        )}
      </DocSection>

      <DocSection
        id="changes"
        title="Change log"
        description="The changelog entries that name this component."
      >
        {changes.length ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">
            No entry names it yet.
          </p>
        )}
      </DocSection>
    </DocsPage>
  )
}
