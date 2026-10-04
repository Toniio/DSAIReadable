import type { ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { cn } from "@/lib/utils"
import { ComponentTable } from "@/site/audit-docs/component-table"
import { contrastRows, contrastTotals } from "@/site/audit-docs/contrast"
import { ContrastTable } from "@/site/audit-docs/contrast-table"
import {
  componentAudits,
  deprecations,
  type EvalRun,
  currentRuns,
  evalRuns,
  exemptions,
  latestRuns,
  latestVersionRuns,
  percent,
  shadcnAudit,
  SPEC_SECTIONS,
  tokenStatus,
} from "@/site/audit-docs/data"
import { EvalChart } from "@/site/audit-docs/eval-chart"
import { StatCard } from "@/site/audit-docs/stat-card"
import { TaskMatrix } from "@/site/audit-docs/task-matrix"
import { CATEGORY_ORDER, componentHref } from "@/site/lib/components"
import { auditsNav } from "@/site/lib/nav"
import { sourceUrl, VERSION } from "@/site/lib/site"
import { DocSection } from "@/site/ui/doc-section"
import { DocsPage } from "@/site/ui/docs-page"
import { InlineMarkdown } from "@/site/ui/markdown"
import { PageHeader } from "@/site/ui/page-header"
import type { TocItem } from "@/site/ui/page-toc"
import { LINK } from "@/site/ui/link"

export const metadata: Metadata = {
  title: "Audits",
  description:
    "What the repository's checks measure: eval runs, contrast, spec coverage, shadcn/ui divergences, exemptions and deprecations.",
}

const TOC: TocItem[] = [
  { id: "summary", label: "Summary" },
  { id: "evals", label: "Evals" },
  { id: "contrast", label: "Contrast" },
  { id: "components", label: "Components" },
  { id: "shadcn", label: "shadcn/ui" },
  { id: "exemptions", label: "Exemptions" },
  { id: "deprecations", label: "Deprecations" },
]

/** How a run's condition reads in a sentence. */
const CONDITION_PHRASE: Record<string, string> = {
  "Gold (calibration)": "as the gold standard",
  "No context": "with no context",
  MCP: "with the MCP server",
  "MCP + skills": "with the MCP server and the skills",
}

/** "a, b and c". */
function list(items: string[]): string {
  return items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

/** The takeaway of the chart, from the runs it draws. */
function evalSummary(runs: EvalRun[], latest: EvalRun[]): string {
  const gold = runs.filter((run) => run.generator === "gold")
  const sentences: string[] = []
  const first = latest[0]
  if (first && first.generator !== "gold") {
    sentences.push(
      `On ${first.builtOn}, ${first.model ?? first.generator} built the ${first.tasks} tasks on design system ${first.version}${first.rescored ? `, rescored on ${first.date}` : ""}: ${list(
        latest.map(
          (run) =>
            `${percent(run.conformance)} ${CONDITION_PHRASE[run.condition] ?? run.condition}`
        )
      )}.`
    )
  }
  if (gold.length && gold.every((run) => run.conformance === 1)) {
    sentences.push(
      `${gold.length === 1 ? "The gold run scores" : `The ${gold.length} gold runs score`} 100%: the scorer passes the design system's own examples.`
    )
  }
  return sentences.join(" ")
}

/** One term of a definition list in a joined grid. */
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-background p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

function ExternalLink({ href, children }: { href: string; children: string }) {
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

export default function AuditsPage() {
  const runs = latestVersionRuns(currentRuns(evalRuns()))
  const latest = latestRuns(runs)
  const best = [...latest].sort((a, b) => b.conformance - a.conformance)[0]
  const contrast = contrastRows()
  const totals = contrastTotals(contrast)
  const audits = componentAudits()
  const complete = audits.filter(
    (row) => row.sections === SPEC_SECTIONS.length
  ).length
  const keyed = audits.filter((row) => row.keyboard > 0)
  const covered = keyed.filter((row) => row.test === "tested").length
  const stable = audits.filter((row) => row.status === "stable").length
  const beta = audits.filter((row) => row.status === "beta").length
  const categories = CATEGORY_ORDER.filter((category) =>
    audits.some((row) => row.category === category)
  )
  const tokens = tokenStatus()
  const shadcn = shadcnAudit()
  const divergingComponents = new Set(
    shadcn.divergences.map((row) => row.component)
  ).size
  const byType = Object.entries(
    shadcn.divergences.reduce<Record<string, number>>((counts, row) => {
      counts[row.type] = (counts[row.type] ?? 0) + 1
      return counts
    }, {})
  ).sort((a, b) => b[1] - a[1])
  const exempt = exemptions()
  const deprecated = deprecations()
  const replaced = deprecated.tokens.filter((row) => row.replacement).length

  return (
    <DocsPage nav={auditsNav()} navLabel="Audits" toc={TOC}>
      <PageHeader
        title="Audits"
        lead="What the repository's checks measure, read from its files when this site is built: the conformance of generated screens, contrast, spec coverage, the declared shadcn/ui divergences, the raw-value exemptions and the deprecations."
      >
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Badge variant="outline" className="mt-0.5">
            {VERSION}
          </Badge>
          <span>
            Measured at version {VERSION}. The checks run in CI and in{" "}
            <code className="font-mono">npm run check</code>; the eval runs are
            recorded by hand in{" "}
            <code className="font-mono">evals/history/</code>.
          </span>
        </p>
      </PageHeader>

      <DocSection id="summary" title="Summary">
        <ul className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <StatCard
              href="#components"
              label="Components"
              value={String(audits.length)}
            >
              {stable} stable · {beta} beta
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#components"
              label="Complete specs"
              value={`${complete} / ${audits.length}`}
            >
              With all {SPEC_SECTIONS.length} sections; {covered} of{" "}
              {keyed.length} components with keyboard rows have their test file
            </StatCard>
          </li>
          <li>
            <StatCard
              href="/foundations/tokens/"
              label="Tokens"
              value={String(tokens.total)}
            >
              <span className="whitespace-nowrap">{tokens.active} active</span>{" "}
              ·{" "}
              <span className="whitespace-nowrap">
                {tokens.reserved} reserved
              </span>{" "}
              ·{" "}
              <span className="whitespace-nowrap">
                {tokens.deprecated} deprecated
              </span>
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#contrast"
              label="Contrast"
              value={`${totals.checked - totals.failures} / ${totals.checked}`}
            >
              Measurements at WCAG 2.2 AA in light and dark; {totals.failures}{" "}
              below threshold
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#evals"
              label="Eval conformance"
              value={best ? percent(best.conformance) : "—"}
            >
              {best
                ? `${best.model ?? best.generator} ${CONDITION_PHRASE[best.condition] ?? best.condition}, design system ${best.version}`
                : "No recorded run"}
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#shadcn"
              label="shadcn/ui divergences"
              value={String(shadcn.divergences.length)}
            >
              Declared across {divergingComponents} components
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#exemptions"
              label="Raw-value exemptions"
              value={String(exempt.length)}
            >
              {exempt[0] ? (
                <>
                  First review after{" "}
                  <span className="whitespace-nowrap">
                    {exempt[0].review_after}
                  </span>
                </>
              ) : (
                "None registered"
              )}
            </StatCard>
          </li>
          <li>
            <StatCard
              href="#deprecations"
              label="Deprecated tokens"
              value={String(deprecated.tokens.length)}
            >
              {replaced} with a replacement;{" "}
              {deprecated.exports.length
                ? `${deprecated.exports.length} deprecated exports`
                : "no deprecated export"}
            </StatCard>
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="evals"
        title="Evals"
        description={
          <>
            A generator builds each task of{" "}
            <code className="font-mono">evals/tasks.json</code> as one screen.
            Stage A is deterministic: the screen compiles against the real
            components and lints clean with the design system&apos;s ESLint
            plugin. Stage B renders it in headless Chromium: no axe violation
            and a visible focus indicator on every tab stop, in light and dark.
            Conformance is the mean of the stages that ran. The page shows the
            runs of the latest version measured, and a rescore in place of the
            run whose screens it scores again; the earlier ones stay in{" "}
            <code className="font-mono">evals/history/</code>.
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <EvalChart
            data={runs.map((run) => ({
              run: `${run.condition} · ${run.version}`,
              conformance: Math.round(run.conformance * 1000) / 10,
              stageA: Math.round(run.stageA * 1000) / 10,
              stageB:
                run.stageB === null ? null : Math.round(run.stageB * 1000) / 10,
            }))}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {evalSummary(runs, latest)}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Generator</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Stage A</TableHead>
                <TableHead>Stage B</TableHead>
                <TableHead>Conformance</TableHead>
                <TableHead>MCP calls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.file}>
                  <TableCell className="min-w-36 whitespace-normal">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-mono">{run.date}</span>
                      {run.rescored ? (
                        <span className="text-muted-foreground">
                          Rescored, screens of {run.builtOn}
                        </span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{run.version}</TableCell>
                  <TableCell className="min-w-44 whitespace-normal">
                    {run.generator === "gold" ? (
                      "Gold (calibration)"
                    ) : (
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono">
                          {run.model ?? run.generator}
                        </span>
                        <span className="text-muted-foreground">
                          {run.generator}
                          {run.via ? ` via ${run.via}` : ""}
                        </span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{run.context ?? "—"}</TableCell>
                  <TableCell>
                    {run.skills.length ? (
                      <span className="flex flex-col gap-0.5 font-mono">
                        {run.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {run.tasks}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {percent(run.stageA)}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {run.stageB === null ? "Not run" : percent(run.stageB)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold tabular-nums">
                    {percent(run.conformance)}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {run.mcpCalls ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={3}>Per task</Heading>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The runs of {latest[0]?.builtOn ?? "the latest date"}
              {latest[0]?.rescored ? `, rescored on ${latest[0].date}` : ""},
              task by task. Coverage is the share of the gold standard&apos;s
              design-system modules the screen uses: it is graded, not a gate.
            </p>
          </div>
          <TaskMatrix runs={latest} />
        </div>
      </DocSection>

      <DocSection
        id="contrast"
        title="Contrast"
        description={
          <>
            The pairs{" "}
            <code className="font-mono">npm run tokens:lint-contrast</code>{" "}
            checks, computed from the resolved token values: 4.5:1 for text, 3:1
            for a focus indicator. A tint or a translucent color is painted over
            its surface first. Information rows are measured and never block.
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {totals.checked} measurements across{" "}
          {contrast.length - totals.informative} pairs, {totals.failures} below
          threshold; {totals.informative} information rows.
        </p>
        <div className="flex min-w-0 flex-col gap-4">
          <ContrastTable rows={contrast} />
        </div>
      </DocSection>

      <DocSection
        id="components"
        title="Components"
        description={
          <>
            Each spec against the {SPEC_SECTIONS.length} canonical sections, the
            rows of its Keyboard table and the test file they require in{" "}
            <code className="font-mono">tests/components/</code>, and what it
            declares. Every spec example also renders in{" "}
            <code className="font-mono">tests/examples.test.tsx</code>.
          </>
        }
      >
        <div className="flex min-w-0 flex-col gap-4">
          <ComponentTable
            rows={audits}
            categories={categories}
            sections={SPEC_SECTIONS.length}
          />
        </div>
      </DocSection>

      <DocSection
        id="shadcn"
        title="shadcn/ui"
        description="The shadcn/ui API is the contract: each component is re-anchored on its upstream through the re-tokenization table, and every difference from it is declared with its reason."
      >
        <dl className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-6">
          <Fact term="Upstream">
            <code className="font-mono">{shadcn.upstream.repository}</code>
          </Fact>
          <Fact term="Ref">
            <code className="font-mono">{shadcn.upstream.ref}</code>
          </Fact>
          <Fact term="Base and style">
            {shadcn.upstream.base} · {shadcn.upstream.style}
          </Fact>
          <Fact term="Re-anchored">{shadcn.reanchored.length}</Fact>
          <Fact term="Outside shadcn/ui">{shadcn.outside.length}</Fact>
          <Fact term="Table entries">{shadcn.tableSize}</Fact>
        </dl>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={3}>Declared divergences</Heading>
            <p className="text-sm text-muted-foreground">
              {shadcn.divergences.length} divergences across{" "}
              {divergingComponents} components:{" "}
              {list(byType.map(([type, count]) => `${count} ${type}`))}.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Where</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Why</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shadcn.divergences.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="min-w-44 align-top whitespace-normal">
                    <span className="flex flex-col gap-1">
                      <Link href={`/components/${row.slug}/`} className={LINK}>
                        {row.component}
                      </Link>
                      <span className="font-mono break-words text-muted-foreground">
                        {[row.export, row.prop, row.value]
                          .filter(Boolean)
                          .join(" · ") || "The component"}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline">{row.type}</Badge>
                  </TableCell>
                  <TableCell className="min-w-64 align-top whitespace-normal">
                    <span className="flex flex-col gap-1">
                      <span>
                        <InlineMarkdown>{row.note}</InlineMarkdown>
                      </span>
                      {row.upstream ? (
                        <span className="text-muted-foreground">
                          Upstream:{" "}
                          <code className="font-mono break-words">
                            {row.upstream.replace(/^= /, "")}
                          </code>
                        </span>
                      ) : null}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2">
          <Heading level={3}>Re-anchoring notes</Heading>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {shadcn.reanchoredNotes.length} re-anchored components keep classes
            of their own, each with its reason; the other{" "}
            {shadcn.reanchored.length - shadcn.reanchoredNotes.length} match
            their upstream once the table is applied.{" "}
            {shadcn.outside.length
              ? `${list(shadcn.outside.map((row) => row.name))} have no shadcn/ui item: they are the design system's own.`
              : ""}
          </p>
        </div>
        <Accordion type="multiple" className="border-t">
          {shadcn.reanchoredNotes.map((row) => (
            <AccordionItem key={row.slug} value={row.slug}>
              <AccordionTrigger>
                <span className="flex flex-wrap items-center gap-2">
                  <span>{row.name}</span>
                  <Badge variant="outline">
                    {row.added} {row.added === 1 ? "class" : "classes"} added
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 text-sm leading-relaxed">
                  <p>
                    <InlineMarkdown>{row.reason ?? ""}</InlineMarkdown>
                  </p>
                  <p>
                    <Link href={`/components/${row.slug}/`} className={LINK}>
                      {row.name} documentation
                    </Link>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {shadcn.excluded.length ? (
          <div className="flex flex-col gap-2">
            <Heading level={3}>Excluded items</Heading>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed">
              {shadcn.excluded.map((row) => (
                <li key={row.item} className="border-l pl-3">
                  <code className="font-mono">{row.item}</code>
                  {row.instead ? (
                    <>
                      , replaced by{" "}
                      {componentHref(row.instead) ? (
                        <Link
                          href={componentHref(row.instead) ?? "/components/"}
                          className={LINK}
                        >
                          {row.instead}
                        </Link>
                      ) : (
                        row.instead
                      )}
                    </>
                  ) : null}
                  : <InlineMarkdown>{row.reason}</InlineMarkdown>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DocSection>

      <DocSection
        id="exemptions"
        title="Exemptions"
        description={
          <>
            Every <code className="font-mono">allow-raw</code> comment the raw
            value lint accepts, registered in{" "}
            <code className="font-mono">tokens/allow-raw.registry.json</code>{" "}
            with its reason, the earliest review first.
          </>
        }
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review after</TableHead>
                <TableHead>Exemption</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exempt.map((row) => (
                <TableRow key={`${row.id} ${row.file}`}>
                  <TableCell className="align-top font-mono">
                    {row.review_after}
                  </TableCell>
                  <TableCell className="align-top font-mono">
                    {row.id}
                  </TableCell>
                  <TableCell className="align-top">
                    <ExternalLink href={sourceUrl(row.file)}>
                      {row.file.replace(/^components\/ui\//, "")}
                    </ExternalLink>
                  </TableCell>
                  <TableCell className="min-w-64 align-top whitespace-normal">
                    <InlineMarkdown>{row.reason}</InlineMarkdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DocSection>

      <DocSection
        id="deprecations"
        title="Deprecations"
        description="The tokens and exports marked deprecated, as the MCP server and the ESLint plugin serve them."
      >
        <div className="flex min-w-0 flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>CSS variable</TableHead>
                <TableHead>Replacement</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deprecated.tokens.map((row) => (
                <TableRow key={row.token}>
                  <TableCell className="align-top font-mono">
                    {row.token}
                  </TableCell>
                  <TableCell className="align-top font-mono">
                    {row.css_var}
                  </TableCell>
                  <TableCell className="align-top">
                    {row.replacement ? (
                      <span className="flex flex-col gap-0.5 font-mono">
                        <span>{row.replacement.token}</span>
                        <span className="text-muted-foreground">
                          {row.replacement.css_var}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-64 align-top whitespace-normal">
                    <InlineMarkdown>{row.message}</InlineMarkdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground">
            {deprecated.exports.length
              ? `${deprecated.exports.length} deprecated exports.`
              : "No component export is deprecated."}
          </p>
        </div>
      </DocSection>
    </DocsPage>
  )
}
