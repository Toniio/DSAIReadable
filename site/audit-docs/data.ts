import { components, componentSpec } from "@/site/lib/components"
import { headings } from "@/site/lib/markdown"
import { pattern } from "@/site/lib/patterns"
import { exists, listFiles, readJson, readText } from "@/site/lib/repo"
import { tokens } from "@/site/lib/tokens"

/**
 * What the Audits page reads, at build time: the eval history, the specs,
 * the declared shadcn/ui divergences, the allow-raw registry and the
 * deprecations. Nothing here is measured by the site itself, except the
 * contrast ratios (contrast.ts) and the counts of spec sections.
 */

// ── Evals ──────────────────────────────────────────────────────────────────

interface StaticResult {
  compiles: boolean
  typeErrors: string[]
  lint: boolean
  lintErrors: string[]
  coverage: number
  missing: string[]
}

interface A11yResult {
  renders: boolean
  axe: boolean
  focus: boolean
  failures: string[]
}

/** A recorded run, as evals/lib/report.ts writes it (`RunReport`). */
interface RunReport {
  label: string
  date: string
  generator: string
  model?: string
  context?: string
  skills?: string[]
  via?: string
  designSystem: { version: string; commit: string }
  /** Where the screens come from: absent from a gold run. */
  generated?: { commit: string; sources?: string }
  summary: {
    tasks: number
    generated: number
    stageA: { compiles: number; lint: number; coverage: number; pass: number }
    stageB: { renders: number; axe: number; focus: number; pass: number } | null
    stageC: { score: number } | null
    conformance: number
    generation: { mcpCalls: number; otherCalls: number } | null
  }
  tasks: {
    id: string
    generated: boolean
    static?: StaticResult
    a11y?: A11yResult
  }[]
}

interface TaskResult {
  id: string
  /** The page of the gold standard the task is scored against. */
  gold?: { label: string; href: string }
  compiles: boolean
  lint: boolean
  coverage: number
  renders: boolean | null
  axe: boolean | null
  focus: boolean | null
  /** The assertions that failed, as the report keeps them. */
  findings: string[]
}

export interface EvalRun {
  /** The history file, without `.json`. */
  file: string
  date: string
  version: string
  generator: string
  model?: string
  via?: string
  /** `Gold (calibration)`, `No context`, `MCP`, `MCP + skills`. */
  condition: string
  /**
   * The screens it scores, by the commit and sources they were generated
   * from: null for a gold run, which scores the gold examples.
   */
  screens: string | null
  /** The date its screens were first scored: `date`, unless it rescores them. */
  builtOn: string
  /** It scores again the screens of an earlier run, with a later scorer. */
  rescored: boolean
  context?: string
  skills: string[]
  tasks: number
  stageA: number
  stageB: number | null
  conformance: number
  mcpCalls: number | null
  results: TaskResult[]
}

const CONDITION_ORDER = [
  "Gold (calibration)",
  "No context",
  "MCP",
  "MCP + skills",
]

function condition(report: RunReport): string {
  if (report.generator === "gold") return "Gold (calibration)"
  if (report.context === "none") return "No context"
  return report.skills?.length ? "MCP + skills" : "MCP"
}

/** `0.1.10` after `0.1.9`. */
function compareVersions(a: string, b: string): number {
  const parts = (value: string) => value.split(".").map(Number)
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const delta = (x[i] ?? 0) - (y[i] ?? 0)
    if (delta) return delta
  }
  return 0
}

interface EvalTask {
  id: string
  gold: { pattern?: string; component?: string }
}

function goldLink(task: EvalTask | undefined): TaskResult["gold"] {
  if (!task) return undefined
  if (task.gold.pattern) {
    const found = pattern(task.gold.pattern)
    return found
      ? { label: found.title, href: `/patterns/${found.name}/` }
      : undefined
  }
  const name = task.gold.component
  const entry = name
    ? components().find((item) => item.name === name)
    : undefined
  return entry
    ? { label: entry.name, href: `/components/${entry.slug}/` }
    : undefined
}

/**
 * The runs that score the same screens under the same condition: a run and
 * its rescores share it. A run with no screens of its own is alone.
 */
const sameScreens = (run: EvalRun) =>
  run.screens
    ? [run.version, run.model, run.condition, run.screens].join("|")
    : run.file

/** Every recorded run of evals/history/, oldest first. */
export function evalRuns(): EvalRun[] {
  const tasks = readJson<{ tasks: EvalTask[] }>("evals/tasks.json").tasks
  const runs: EvalRun[] = listFiles("evals/history", ".json")
    .map((file) => {
      const report = readJson<RunReport>(`evals/history/${file}`)
      return {
        file: file.replace(/\.json$/, ""),
        date: report.date,
        version: report.designSystem.version,
        generator: report.generator,
        model: report.model,
        via: report.via,
        condition: condition(report),
        screens: report.generated
          ? `${report.generated.commit}:${report.generated.sources ?? ""}`
          : null,
        builtOn: report.date,
        rescored: false,
        context: report.context,
        skills: report.skills ?? [],
        tasks: report.summary.tasks,
        stageA: report.summary.stageA.pass,
        stageB: report.summary.stageB?.pass ?? null,
        conformance: report.summary.conformance,
        mcpCalls: report.summary.generation?.mcpCalls ?? null,
        results: report.tasks.map((task) => ({
          id: task.id,
          gold: goldLink(tasks.find((entry) => entry.id === task.id)),
          compiles: Boolean(task.static?.compiles),
          lint: Boolean(task.static?.lint),
          coverage: task.static?.coverage ?? 0,
          renders: task.a11y ? task.a11y.renders : null,
          axe: task.a11y ? task.a11y.axe : null,
          focus: task.a11y ? task.a11y.focus : null,
          findings: [
            ...(task.generated ? [] : ["No screen generated."]),
            ...(task.static?.typeErrors ?? []),
            ...(task.static?.lintErrors ?? []),
            ...(task.a11y?.failures ?? []),
          ],
        })),
      }
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        compareVersions(a.version, b.version) ||
        CONDITION_ORDER.indexOf(a.condition) -
          CONDITION_ORDER.indexOf(b.condition)
    )
  const firstScored = new Map<string, string>()
  for (const run of runs) {
    const first = firstScored.get(sameScreens(run))
    if (first === undefined) firstScored.set(sameScreens(run), run.date)
    else if (first !== run.date)
      Object.assign(run, { builtOn: first, rescored: true })
  }
  return runs
}

/**
 * The runs the page shows: a run whose screens a later run scores again (a
 * rescore, after a fix of the scorer) gives way to it. evals/history/ keeps
 * both.
 */
export function currentRuns(runs: EvalRun[]): EvalRun[] {
  const last = new Map(runs.map((run) => [sameScreens(run), run]))
  return runs.filter((run) => last.get(sameScreens(run)) === run)
}

/** The runs of the most recent version measured; the others stay in evals/history/. */
export function latestVersionRuns(runs: EvalRun[]): EvalRun[] {
  const last = runs
    .map((run) => run.version)
    .sort(compareVersions)
    .at(-1)
  return runs.filter((run) => run.version === last)
}

/**
 * The model runs whose screens were built last: the conditions measured
 * together, rescored or not. A gold run calibrates the scorer, it measures no
 * model.
 */
export function latestRuns(runs: EvalRun[]): EvalRun[] {
  const models = runs.filter((run) => run.generator !== "gold")
  const last = models
    .map((run) => run.builtOn)
    .sort()
    .at(-1)
  return models.filter((run) => run.builtOn === last)
}

/** A share as a percentage: `0.981` → `98.1%`. */
export function percent(share: number): string {
  return `${Math.round(share * 1000) / 10}%`
}

// ── Components ─────────────────────────────────────────────────────────────

/** The 13 sections every component spec has, in order (scripts/lint-spec-sections.ts). */
export const SPEC_SECTIONS = [
  "Metadata",
  "Role",
  "Usage",
  "Constraints",
  "Dependencies",
  "Anatomy",
  "Tokens",
  "Props / API",
  "Variants",
  "States",
  "Accessibility",
  "Code example",
  "Cross-references",
]

/**
 * The keys of each row of a spec's Keyboard table, as
 * scripts/lint-test-coverage.ts reads them.
 */
function keyboardRows(spec: string): string[] {
  const block = /^\*\*Keyboard\*\*:\n([\s\S]*?)(?=^\*\*|^## )/m.exec(spec)?.[1]
  if (!block) return []
  return block
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) => line.split("|")[1].replaceAll("`", "").trim())
}

export interface ComponentAudit {
  name: string
  slug: string
  category: string
  status: string
  /** How many of the 13 canonical sections the spec has. */
  sections: number
  /** The canonical sections it lacks. */
  missing: string[]
  keyboard: number
  /** `tested`: tests/components/<file>.test.tsx exists; `none`: no keyboard row asks for one. */
  test: "tested" | "missing" | "none"
  tokens: number
  states: number
  divergences: number
}

export function componentAudits(): ComponentAudit[] {
  return components().map((entry) => {
    const markdown = readText(`specs/components/${entry.name}.md`)
    const present = new Set(headings(markdown))
    const spec = componentSpec(entry.name)
    const keyboard = keyboardRows(markdown).length
    const tested = exists(`tests/components/${entry.slug}.test.tsx`)
    return {
      name: entry.name,
      slug: entry.slug,
      category: entry.category,
      status: entry.status,
      sections: SPEC_SECTIONS.filter((name) => present.has(name)).length,
      missing: SPEC_SECTIONS.filter((name) => !present.has(name)),
      keyboard,
      test: tested ? "tested" : keyboard > 0 ? "missing" : "none",
      tokens: spec.tokens.length,
      states: spec.states.length,
      divergences: spec.shadcn.divergences.length,
    }
  })
}

// ── shadcn/ui ──────────────────────────────────────────────────────────────

interface Upstream {
  upstream: { repository: string; ref: string; base: string; style: string }
  map: { classes: Record<string, string>; utilities: Record<string, string> }
  components: Record<
    string,
    { status: "reanchored" | "outside"; reason?: string; added?: string[] }
  >
}

interface DivergenceRow {
  component: string
  slug: string
  export?: string
  prop?: string
  value?: string
  type: string
  upstream?: string
  note: string
}

interface IndexFile {
  version: string
  inventory: {
    name: string
    code_path: string
    shadcn: {
      item: string | null
      divergences: Omit<DivergenceRow, "component" | "slug">[]
    }
  }[]
  shadcn: { excluded: { item: string; reason: string; instead?: string }[] }
}

export function shadcnAudit() {
  const upstream = readJson<Upstream>("shadcn-upstream.json")
  const index = readJson<IndexFile>("design-system.index.json")
  const entries = Object.entries(upstream.components).map(([slug, value]) => ({
    slug,
    name: components().find((item) => item.slug === slug)?.name ?? slug,
    status: value.status,
    reason: value.reason,
    added: value.added?.length ?? 0,
  }))
  const divergences: DivergenceRow[] = index.inventory.flatMap((item) =>
    item.shadcn.divergences.map((divergence) => ({
      component: item.name,
      slug: item.code_path
        .replace(/^components\/ui\//, "")
        .replace(/\.tsx$/, ""),
      ...divergence,
    }))
  )
  return {
    upstream: upstream.upstream,
    tableSize:
      Object.keys(upstream.map.classes).length +
      Object.keys(upstream.map.utilities).length,
    reanchored: entries.filter((entry) => entry.status === "reanchored"),
    outside: entries.filter((entry) => entry.status === "outside"),
    reanchoredNotes: entries
      .filter((entry) => entry.status === "reanchored" && entry.reason)
      .sort((a, b) => a.name.localeCompare(b.name)),
    divergences,
    excluded: index.shadcn.excluded,
  }
}

// ── Exemptions and deprecations ────────────────────────────────────────────

export interface Exemption {
  id: string
  file: string
  reason: string
  token_candidate: string | null
  review_after: string
}

/** The allow-raw registry, the earliest review first. */
export function exemptions(): Exemption[] {
  return [
    ...readJson<{ exemptions: Exemption[] }>("tokens/allow-raw.registry.json")
      .exemptions,
  ].sort(
    (a, b) =>
      a.review_after.localeCompare(b.review_after) || a.id.localeCompare(b.id)
  )
}

export interface DeprecatedToken {
  token: string
  css_var: string
  tailwind: string | null
  message: string
  replacement: { token: string; css_var: string } | null
}

export function deprecations(): {
  tokens: DeprecatedToken[]
  exports: { name: string; message?: string }[]
} {
  return readJson("mcp-server/context/deprecations.json")
}

// ── Tokens ─────────────────────────────────────────────────────────────────

/** The tokens of the three tiers by lifecycle status. */
export function tokenStatus() {
  const all = tokens()
  const count = (status: string) =>
    all.filter((entry) => entry.status === status).length
  return {
    total: all.length,
    active: count("active"),
    reserved: count("reserved"),
    deprecated: count("deprecated"),
  }
}
