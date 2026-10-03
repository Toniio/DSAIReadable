import { readJson } from "@/site/lib/repo"

/** A pattern, as `mcp-server/context/patterns.json` parses its spec. */
export interface Pattern {
  name: string
  title: string
  kind: "task" | "ui"
  role: string
  usage: string[]
  structure: { region: string; content: string; components: string }[]
  components: { component: string; variant_props: string; job: string }[]
  spacing: string[]
  content: {
    element?: string
    situation?: string
    write: string
    not: string
  }[]
  code_example: string
  cross_references: string[]
  source: string
}

export function patterns(): Pattern[] {
  return Object.values(
    readJson<Record<string, Pattern>>("mcp-server/context/patterns.json")
  ).sort((a, b) => a.title.localeCompare(b.title))
}

export function pattern(name: string): Pattern | undefined {
  return patterns().find((entry) => entry.name === name)
}

/** The file names of the patterns: `create`, `empty-state`. */
export function patternNames(): string[] {
  return patterns().map((entry) => entry.name)
}
