import {
  currentRuns,
  evalRuns,
  latestRuns,
  latestVersionRuns,
} from "@/site/audit-docs/data"
import { anchor, headings, plain, section } from "@/site/lib/markdown"
import {
  contextCache,
  mcpPrompts,
  mcpResources,
  mcpTools,
  skills,
} from "@/site/lib/mcp"
import { listFiles, readJson, readText } from "@/site/lib/repo"

/**
 * What the MCP & Skills pages read at build time: their prose from
 * docs/mcp-and-skills/, and the figures from the server's sources, its
 * context cache, the eval history and the skill. Nothing is measured by the
 * site itself.
 */

// ── The prose ──────────────────────────────────────────────────────────────

/** One `## ` section of a page's Markdown. */
interface DocPart {
  /** The id the page gives the section: `from-sources-to-answers`. */
  id: string
  /** The heading as the page shows it: no code marks. */
  label: string
  body: string
}

/** A page of the section, as docs/mcp-and-skills/ writes it. */
export interface SectionDoc {
  /** The repository path: `docs/mcp-and-skills/how-it-works.md`. */
  source: string
  /** The H1. */
  title: string
  /** What sits between the H1 and the first `## `: the page's lead. */
  lead: string
  parts: DocPart[]
}

export function sectionDoc(file: string): SectionDoc {
  const source = `docs/mcp-and-skills/${file}`
  const text = readText(source).replace(/\r\n/g, "\n")
  const title = /^# (.+)$/m.exec(text)?.[1]
  if (!title) throw new Error(`${source}: no H1`)
  const names = headings(text)
  const start = text.indexOf(`# ${title}`) + title.length + 2
  const end = names.length ? text.indexOf(`\n## ${names[0]}`) : text.length
  return {
    source,
    title,
    lead: text.slice(start, end).trim(),
    parts: names.map((heading) => ({
      id: anchor(heading),
      label: plain(heading),
      body: section(text, heading),
    })),
  }
}

// ── The figures ────────────────────────────────────────────────────────────

/** The server's registered surface and its cache. */
export function serverFacts() {
  const cache = contextCache()
  return {
    tools: mcpTools().length,
    resources: mcpResources().length,
    prompts: mcpPrompts().length,
    skills: skills(),
    cacheFiles: cache.files.length,
    cacheBytes: cache.bytes,
    largest: cache.largest,
  }
}

/** `1384483` → `1.4 MB`; `904319` → `904 KB`. */
export function size(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`
}

/** One step from the sources to the agent. */
export interface PipelineStep {
  title: string
  /** Where it happens: a folder, a command, a package. */
  where: string
  lines: string[]
}

export function pipelineSteps(): PipelineStep[] {
  const facts = serverFacts()
  const count = (dir: string, extension: string) =>
    listFiles(dir, extension).length
  return [
    {
      title: "Sources",
      where: "specs/ · tokens/ · components/ui/",
      lines: [
        `${count("specs/components", ".md")} component specs, ${count("specs/foundations", ".md")} foundations, ${count("specs/patterns", ".md")} page patterns`,
        "The token tiers and their dark context",
        `${count("components/ui", ".tsx")} component sources and design-system.index.json`,
      ],
    },
    {
      title: "Compile",
      where: "npm run generate-context",
      lines: [
        "Parses the specs by structure: tables by header",
        "Fails on a parse error or an index that drifted from the code",
      ],
    },
    {
      title: "Cache",
      where: "mcp-server/context/",
      lines: [
        `${facts.cacheFiles} JSON files, ${size(facts.cacheBytes)}`,
        `The largest, ${facts.largest.file}: ${size(facts.largest.bytes)}`,
        "Committed, and checked fresh in CI",
      ],
    },
    {
      title: "Server",
      where: "@dsaireadable/mcp-server",
      lines: [
        `${facts.tools} tools, ${facts.resources} resources, ${facts.prompts} prompts`,
        "Read-only; no answer over the cap",
        "stdio, or HTTP on 127.0.0.1",
      ],
    },
    {
      title: "Agent",
      where: "Any MCP client",
      lines: [
        "Claude Code, Claude Desktop, VS Code, Copilot",
        "Started with npx: no clone, no hosting",
      ],
    },
  ]
}

interface SessionTask {
  id: string
  metrics?: {
    turns: number
    toolCalls: number
    inputTokens: number
    outputTokens: number
    /** What each turn sent and the calls it made at once. */
    timeline?: {
      context: number
      calls: { tool: string; format?: string; chars?: number }[]
    }[]
  }
  session?: { costUsd?: number }
}

/** The calls of one tool, at one format, in one turn. */
interface SessionCall {
  tool: string
  /** `concise` or `detailed`, for a tool that takes `response_format`. */
  format?: string
  calls: number
  /** The characters of one answer: the mean when the agent called it more than once. */
  perAnswer: number
}

/** One turn of a session: the agent answers with calls, which run together, or with its screen. */
interface SessionTurn {
  /** The input tokens the turn sent: the whole conversation so far. */
  context: number
  calls: SessionCall[]
}

/**
 * Where a tool comes in a turn, whose calls have no order of their own: the
 * workflow's, with the writing rules after the pattern. A tool not listed
 * comes last, and `concise` comes before `detailed`.
 */
const TURN_ORDER = [
  "dsaireadable_get_design_system_overview",
  "dsaireadable_get_design_rules",
  "dsaireadable_get_pattern",
  "dsaireadable_get_ux_writing_rules",
  "dsaireadable_get_component_specs",
  "dsaireadable_validate_code",
]

const turnRank = (tool: string) => {
  const rank = TURN_ORDER.indexOf(tool)
  return rank === -1 ? TURN_ORDER.length : rank
}

/** A recorded session of the eval harness: one screen, built with the server. */
export interface Session {
  task: string
  /** The request the agent was given. */
  prompt: string
  turns: number
  toolCalls: number
  inputTokens: number
  outputTokens: number
  costUsd?: number
  timeline: SessionTurn[]
}

/**
 * The median session, by input tokens, of the latest runs with the server:
 * every pass of the default tasks pooled. With an even count, the lower of
 * the two middle sessions, so it is always a session that ran.
 */
export function medianSession(): Session | undefined {
  const { tasks } = readJson<{ tasks: { id: string; prompt: string }[] }>(
    "evals/tasks.json"
  )
  const sessions = latestRuns(latestVersionRuns(currentRuns(evalRuns())))
    .filter((run) => run.condition === "MCP")
    .flatMap((run) =>
      readJson<{ tasks: SessionTask[] }>(
        `evals/history/${run.file}.json`
      ).tasks.flatMap((task) =>
        task.metrics?.timeline ? [{ task, metrics: task.metrics }] : []
      )
    )
    .sort((a, b) => a.metrics.inputTokens - b.metrics.inputTokens)
  const middle = sessions[Math.floor((sessions.length - 1) / 2)]
  if (!middle) return undefined
  const { task, metrics } = middle
  return {
    task: task.id,
    prompt: tasks.find((entry) => entry.id === task.id)?.prompt ?? "",
    turns: metrics.turns,
    toolCalls: metrics.toolCalls,
    inputTokens: metrics.inputTokens,
    outputTokens: metrics.outputTokens,
    costUsd: task.session?.costUsd,
    timeline: (metrics.timeline ?? []).map(({ context, calls }) => {
      const grouped = new Map<string, SessionCall & { chars: number }>()
      for (const { tool, format, chars } of calls) {
        const key = `${tool}:${format ?? ""}`
        const group = grouped.get(key) ?? {
          tool,
          format,
          calls: 0,
          perAnswer: 0,
          chars: 0,
        }
        group.calls++
        group.chars += chars ?? 0
        grouped.set(key, group)
      }
      return {
        context,
        calls: [...grouped.values()]
          .map(({ chars, ...group }) => ({
            ...group,
            perAnswer: Math.round(chars / group.calls),
          }))
          .sort(
            (a, b) =>
              turnRank(a.tool) - turnRank(b.tool) ||
              (a.format ?? "").localeCompare(b.format ?? "")
          ),
      }
    }),
  }
}

// ── The skill ──────────────────────────────────────────────────────────────

/** One domain of the UI guard's checklist. */
export interface GuardDomain {
  title: string
  /** The reference file that explains its rules, from the skill's folder. */
  reference: string
  rules: string[]
}

const GUARD = "skills/dsaireadable-ui-guard/SKILL.md"

/** The UI guard's checklist and review format, as its SKILL.md writes them. */
export function uiGuard(): {
  source: string
  domains: GuardDomain[]
  review: string
} {
  const skill = readText(GUARD)
  const block = /```\n([\s\S]*?)```/.exec(section(skill, "Checklist"))?.[1]
  if (!block) throw new Error(`${GUARD}: no checklist block`)
  const domains: GuardDomain[] = []
  for (const line of block.split("\n")) {
    const domain = /^(.+?) — (references\/[\w-]+\.md)$/.exec(line)
    const rule = /^- \[ \] (.+)$/.exec(line)
    if (domain)
      domains.push({ title: domain[1], reference: domain[2], rules: [] })
    else if (rule && domains.length) domains.at(-1)?.rules.push(rule[1])
  }
  if (!domains.length) throw new Error(`${GUARD}: no checklist domain`)
  return { source: GUARD, domains, review: section(skill, "Review format") }
}
