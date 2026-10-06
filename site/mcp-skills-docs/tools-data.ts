import { anchor, plain, tables } from "@/site/lib/markdown"
import { mcpTools } from "@/site/lib/mcp"
import { readJson, readText } from "@/site/lib/repo"

/**
 * What the Tools page reads at build time: the definitions and answers
 * scripts/build-site-mcp.ts recorded from the server into
 * site/generated/mcp/, and the categories of the README's tool table.
 */

const GENERATED = "site/generated/mcp"

// ── What the server serves ─────────────────────────────────────────────────

/** A property of a tool's input schema, as JSON Schema writes it. */
interface SchemaProperty {
  type?: string
  description?: string
  enum?: string[]
  default?: unknown
  minimum?: number
  maximum?: number
}

/** One answer of a tool, recorded from the server. */
export interface ToolAnswer {
  /** The arguments of the call. */
  input: Record<string, unknown>
  /** `concise` or `detailed`, for a tool that takes `response_format`. */
  format?: string
  /** The text the server sent: compact JSON. */
  text: string
  chars: number
}

/** A tool as `tools/list` serves it, and its recorded answers. */
export interface ToolRecord {
  name: string
  title: string
  description: string
  inputSchema: {
    properties?: Record<string, SchemaProperty>
    required?: string[]
  }
  annotations: { readOnlyHint?: boolean }
  answers: ToolAnswer[]
}

/**
 * The tools as the server serves them. A tool registered in the sources and
 * missing from the record (or the reverse) fails the build: the record is
 * stale, and `npm run site:mcp` writes it again.
 */
export function recordedTools(): { tools: ToolRecord[] } {
  const record = readJson<{ tools: ToolRecord[] }>(`${GENERATED}/tools.json`)
  const registered = [...mcpTools()].sort().join()
  const recorded = record.tools
    .map((tool) => tool.name)
    .sort()
    .join()
  if (registered !== recorded)
    throw new Error(
      `${GENERATED}/tools.json does not list the tools the server registers: run npm run site:mcp`
    )
  return record
}

/** One parameter of a tool. */
export interface ToolParameter {
  name: string
  /** `string`, `integer`; the values of an enum. */
  type: string
  values?: string[]
  required: boolean
  description?: string
  default?: string
  /** `1–200`, for a bounded number. */
  range?: string
}

export function toolParameters(tool: ToolRecord): ToolParameter[] {
  const required = new Set(tool.inputSchema.required ?? [])
  return Object.entries(tool.inputSchema.properties ?? {}).map(
    ([name, property]) => ({
      name,
      type: property.type ?? "any",
      values: property.enum,
      required: required.has(name),
      description: property.description,
      default:
        property.default === undefined
          ? undefined
          : JSON.stringify(property.default),
      range:
        property.minimum !== undefined && property.maximum !== undefined
          ? `${property.minimum}–${property.maximum}`
          : undefined,
    })
  )
}

/** What a tool's definition says of its behavior, as the badges show it. */
export function toolBehaviors(tool: ToolRecord): string[] {
  const properties = tool.inputSchema.properties ?? {}
  return [
    ...(tool.annotations.readOnlyHint ? ["Read-only"] : []),
    ...("cursor" in properties ? ["Paginated"] : []),
    ...("response_format" in properties ? ["Concise or detailed"] : []),
  ]
}

/** A group of the README's "Available tools" table. */
export interface ToolCategory {
  /** `DS Core`. */
  name: string
  /** The `<!-- site: … -->` marker that places it: `ds-core`. */
  id: string
  tools: ToolRecord[]
}

/**
 * The tools by category, as the README's "Available tools" table groups
 * them. A tool in no category, or in two, fails the build.
 */
export function toolCategories(): ToolCategory[] {
  const { tools } = recordedTools()
  const table = tables(readText("README.md")).find(
    ({ header }) => header[0] === "Category" && header[1] === "Tools"
  )
  if (!table) throw new Error("README.md: no Category | Tools table")
  const categories = table.rows.map(([category, names]) => {
    const name = plain(category)
    return {
      name,
      id: anchor(name),
      tools: [...names.matchAll(/`(dsaireadable_\w+)`/g)].map(([, tool]) => {
        const found = tools.find((entry) => entry.name === tool)
        if (!found)
          throw new Error(`README.md lists ${tool}, which the server lacks`)
        return found
      }),
    }
  })
  const listed = categories.flatMap((category) =>
    category.tools.map((tool) => tool.name)
  )
  const wrong = tools.filter(
    (tool) => listed.filter((name) => name === tool.name).length !== 1
  )
  if (wrong.length)
    throw new Error(
      `README.md's tool table must list each tool once: ${wrong.map((tool) => tool.name).join(", ")}`
    )
  return categories
}

/** A resource as the server lists it, with the size of one read. */
export interface ResourceRecord {
  name: string
  title: string
  /** A template's URI, or a fixed resource's. */
  uriTemplate?: string
  uri?: string
  description: string
  /** How many entries of resources/list it accounts for. */
  listed: number
  example: { uri: string; chars: number }
}

export function recordedResources(): ResourceRecord[] {
  return readJson<{ resources: ResourceRecord[] }>(
    `${GENERATED}/resources.json`
  ).resources
}

/** A prompt as prompts/list serves it. */
export interface PromptRecord {
  name: string
  description: string
  arguments: { name: string; description?: string; required?: boolean }[]
}

export function recordedPrompts(): {
  prompts: PromptRecord[]
  /** The call budget build_screen sets: `4 calls + 1 per component you retain`. */
  buildScreenBudget: string
} {
  return readJson(`${GENERATED}/prompts.json`)
}
