import { readdirSync } from "node:fs"
import path from "node:path"

import {
  currentRuns,
  evalRuns,
  evalSeries,
  latestRuns,
  latestVersionRuns,
  percent,
} from "@/site/audit-docs/data"
import { remToPx } from "@/site/foundation-docs/spec-pages/spec"
import { components } from "@/site/lib/components"
import { changelog } from "@/site/lib/changelog"
import { section } from "@/site/lib/markdown"
import { FOUNDATION_GROUPS } from "@/site/lib/nav"
import { patterns } from "@/site/lib/patterns"
import { listFiles, readJson, readText, ROOT } from "@/site/lib/repo"
import { META, REPOSITORY, VERSION } from "@/site/lib/site"

/**
 * What the Overview counts and installs, read from the repository at build
 * time: every number on the page comes from here.
 */

interface ManifestEntry {
  token: string
  tier: "primitive" | "semantic" | "component"
  status: "active" | "reserved" | "deprecated"
  value: { light: string; dark?: string }
}

interface RegistryItem {
  name: string
  type: string
}

interface IndexEntry {
  shadcn: { divergences: unknown[] }
}

/** The names of the folders under a repository folder. */
function folders(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function packageName(file: string): string {
  return readJson<{ name: string }>(file).name
}

/** The README's opening sentence: what the design system is. */
export function intro(): string {
  const line = readText("README.md")
    .split("\n")
    .find((row) => row.startsWith("A design system"))
  return line ?? META.description
}

/** The bullets of the README's "Why this project exists": what ships. */
export function ships(): string[] {
  return section(readText("README.md"), "Why this project exists")
    .split("\n")
    .filter((row) => row.startsWith("- "))
    .map((row) => row.slice(2).trim())
}

/** The tools the MCP server registers, by name, from its sources. */
function mcpTools(): string[] {
  return listFiles("mcp-server/src/tools", ".ts")
    .filter((file) => !file.endsWith(".test.ts"))
    .flatMap((file) =>
      [
        ...readText(`mcp-server/src/tools/${file}`).matchAll(
          /registerTool\(\s*"([\w-]+)"/g
        ),
      ].map((match) => match[1])
    )
}

/** The rules of the ESLint plugin, one file each. */
function eslintRules(): string[] {
  return listFiles("packages/eslint-plugin/src/rules", ".ts")
    .filter((file) => file !== "utils.ts" && !file.endsWith(".test.ts"))
    .map((file) => file.replace(/\.ts$/, ""))
}

/** The agent skills of skills/. */
function skills(): string[] {
  return folders("skills")
}

interface EvalSummary {
  version: string
  model?: string
  tasks: number
  withMcp?: number
  without?: number
  /** The passes of the condition with the MCP server. */
  passes: number
}

/**
 * The measurement the Audits page leads with: the latest model runs of the
 * default tasks, on the latest version measured, with and without the MCP
 * server, the mean of their passes when a condition ran several. A suite's
 * runs measure a subset of the tasks, so they never stand in for it.
 */
function latestEval(): EvalSummary | undefined {
  const latest = evalSeries(
    latestRuns(latestVersionRuns(currentRuns(evalRuns())))
  )
  const withMcp = latest.find((series) => series.condition === "MCP")
  const without = latest.find((series) => series.condition === "No context")
  const reference = withMcp ?? without ?? latest[0]
  if (!reference) return undefined
  return {
    version: reference.version,
    model: reference.model,
    tasks: reference.tasks,
    withMcp: withMcp?.conformance,
    without: without?.conformance,
    passes: withMcp?.runs.length ?? 0,
  }
}

/** How the stat card names a group of Foundations pages. */
const GROUP_NOUN: Record<string, string> = {
  Tokens: "token foundations",
  Reference: "reference",
}

interface Stat {
  label: string
  value: string
  detail: string
}

function count<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const out = new Map<string, number>()
  for (const item of items) out.set(key(item), (out.get(key(item)) ?? 0) + 1)
  return out
}

/** The numbers of the design system, for the stat cards. */
export function stats(): Stat[] {
  const all = components()
  const byStatus = count(all, (entry) => entry.status)
  const tokens = readJson<{ tokenCount: number; tokens: ManifestEntry[] }>(
    "tokens.manifest.json"
  )
  const byTier = count(tokens.tokens, (entry) => entry.tier)
  const foundationPages = FOUNDATION_GROUPS.flatMap((group) => group.items)
  const allPatterns = patterns()
  const byKind = count(allPatterns, (entry) => entry.kind)
  const registry = readJson<{ items: RegistryItem[] }>("registry.json").items
  const ui = registry.filter((item) => item.type === "registry:ui").length
  const tools = mcpTools()
  const evals = latestEval()
  const rules = eslintRules()

  const out: Stat[] = [
    {
      label: "Components",
      value: String(all.length),
      detail: [...byStatus].map(([status, n]) => `${n} ${status}`).join(" · "),
    },
    {
      label: "Tokens",
      value: String(tokens.tokenCount),
      detail: (["primitive", "semantic", "component"] as const)
        .map((tier) => `${byTier.get(tier) ?? 0} ${tier}`)
        .join(" · "),
    },
    {
      // The pages the Foundations tab lists, as its index and the Sections
      // card count them: some draw on no spec (Layers, Icons, All tokens).
      label: "Foundations",
      value: String(foundationPages.length),
      detail: FOUNDATION_GROUPS.map(
        (group) =>
          `${group.items.length} ${GROUP_NOUN[group.label] ?? group.label.toLowerCase()}`
      ).join(" · "),
    },
    {
      label: "Patterns",
      value: String(allPatterns.length),
      detail: `${byKind.get("task") ?? 0} tasks · ${byKind.get("ui") ?? 0} interface`,
    },
    {
      label: "Registry items",
      value: String(registry.length),
      detail: `${ui} components · ${registry.length - ui} base, fonts and rules`,
    },
    {
      label: "MCP tools",
      value: String(tools.length),
      detail: `In ${packageName("mcp-server/package.json")}`,
    },
    {
      label: "ESLint rules",
      value: String(rules.length),
      detail: `In ${packageName("packages/eslint-plugin/package.json")}`,
    },
  ]
  // The run is named in full: its design system version can be older than
  // the release this page documents.
  if (evals?.withMcp !== undefined)
    out.push({
      label: "Eval conformance",
      value: percent(evals.withMcp),
      detail: [
        evals.without === undefined
          ? "With the MCP server"
          : `With the MCP server; ${percent(evals.without)} without`,
        `Run on v${evals.version} with ${evals.model ?? "a model"}, ${evals.tasks} tasks${evals.passes > 1 ? `, mean of ${evals.passes} passes` : ""}`,
      ].join(". "),
    })
  return out
}

export interface Install {
  registry: string
  /** The release the site documents, which every command pins. */
  version: string
  mcpPackage: string
  mcpNode?: string
  mcpConfig: string
  tools: string[]
  skills: string[]
  skillsAdd: string
  marketplaceAdd: string
  pluginInstall: string
  eslintPackage: string
  eslintConfig: string
  eslintRules: string[]
}

/** The install commands of each channel, built from the published names. */
export function install(): Install {
  const registry = META.registry_source.registry
  const mcpPackage = packageName("mcp-server/package.json")
  const eslintPackage = packageName("packages/eslint-plugin/package.json")
  const marketplace = readJson<{ name: string; plugins: { name: string }[] }>(
    ".claude-plugin/marketplace.json"
  )
  const node = readJson<{ engines?: { node?: string } }>(
    "mcp-server/package.json"
  ).engines?.node
  // Pinned to the release this site documents, as the Claude Code plugin
  // pins it: the tools the page lists are the ones that run.
  const mcpPinned = `${mcpPackage}@${VERSION}`
  return {
    registry,
    version: VERSION,
    mcpPackage,
    mcpNode: node?.replace(/^>=\s*/, ""),
    mcpConfig: JSON.stringify(
      {
        mcpServers: {
          [registry]: { command: "npx", args: ["-y", mcpPinned] },
        },
      },
      null,
      2
    ),
    tools: mcpTools(),
    skills: skills(),
    skillsAdd: `npx skills add ${REPOSITORY}#v${VERSION}`,
    marketplaceAdd: `claude plugin marketplace add ${REPOSITORY}`,
    pluginInstall: `claude plugin install ${marketplace.plugins[0]?.name ?? registry}@${marketplace.name}`,
    eslintPackage,
    eslintConfig: [
      "// eslint.config.mjs",
      `import ${registry} from "${eslintPackage}"`,
      "",
      `export default [...${registry}.configs.recommended]`,
    ].join("\n"),
    eslintRules: eslintRules(),
  }
}

/**
 * The minimum pointer target in CSS pixels, the unit WCAG 2.2 SC 2.5.8 states
 * it in, converted from the rem value of `size.target.min`.
 */
export function targetSize(): number | undefined {
  const value = readJson<{ tokens: ManifestEntry[] }>(
    "tokens.manifest.json"
  ).tokens.find((entry) => entry.token === "size.target.min")?.value.light
  return value === undefined ? undefined : remToPx(value)
}

/** How many shadcn/ui divergences are declared, and in how many components. */
export function divergences(): { total: number; components: number } {
  const inventory = readJson<{ inventory: IndexEntry[] }>(
    "design-system.index.json"
  ).inventory
  const withAny = inventory.filter((entry) => entry.shadcn.divergences.length)
  return {
    total: withAny.reduce(
      (sum, entry) => sum + entry.shadcn.divergences.length,
      0
    ),
    components: withAny.length,
  }
}

/** One line of figures for each section card. */
export function sectionFacts(): Record<string, string> {
  const entries = changelog()
  const releases = new Set(entries.map((entry) => entry.version)).size
  const categories = new Set(components().map((entry) => entry.category)).size
  const runs = latestVersionRuns(currentRuns(evalRuns()))
  const gold = runs.filter((run) => run.generator === "gold").length
  return {
    "/foundations/": `${FOUNDATION_GROUPS.flatMap((group) => group.items).length} pages`,
    "/components/": `${components().length} components in ${categories} categories`,
    "/patterns/": `${patterns().length} patterns`,
    "/changes/": `${entries.length} entries in ${releases} releases`,
    "/audits/": `${runs.length - gold} model eval runs, ${gold} of the gold standard`,
  }
}

export interface CompositionRule {
  /** `rule-21`: what the specs cite, and the anchor of the rule on the Overview. */
  id: string
  /** The rule, as Markdown. */
  rule: string
  /** The components a choice rule covers; none for a general rule. */
  appliesTo: string[]
}

/** The composition rules of the inventory, as `dsaireadable_get_design_rules` serves them. */
export function compositionRules(): CompositionRule[] {
  return readJson<{
    composition_rules: { id: string; rule: string; applies_to?: string[] }[]
  }>("design-system.index.json").composition_rules.map((entry) => ({
    id: entry.id,
    rule: entry.rule,
    appliesTo: entry.applies_to ?? [],
  }))
}

/** The glossary the MCP server serves. */
export function glossary(): { term: string; definition: string }[] {
  return readJson<{ term: string; definition: string }[]>(
    "mcp-server/context/glossary.json"
  )
}
