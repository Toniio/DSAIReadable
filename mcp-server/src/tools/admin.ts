import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { loadContext, text } from "../lib/context.js"
import { validateScreen } from "../lib/validate-screen.js"

interface ComponentEntry {
  name: string
  category?: string
  status?: string
  code_path?: string
  has_spec?: boolean
}

interface VariantEntry {
  variants?: Record<string, unknown>
  has_variants?: boolean
}

/** Format a count against a total as "n/total (p%)". */
function coverage(count: number, total: number): string {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return `${count}/${total} (${pct}%)`
}

export function registerAdminTools(server: McpServer): void {
  // 1. get_stats
  server.tool(
    "get_stats",
    "Returns design system stats: total components, tokens per tier, spec coverage",
    {},
    async () => {
      const components = loadContext<ComponentEntry[]>("components.json")
      const tokenData = loadContext<unknown[]>("semantic-tokens.json")
      const primitives = loadContext<unknown[]>("primitives.json")
      const variables = loadContext<Array<{ tier?: string }>>("variables.json")
      const variants = loadContext<Record<string, VariantEntry>>(
        "component-variants.json"
      )

      const comps = Array.isArray(components) ? components : []
      const totalComponents = comps.length
      const withSpec = comps.filter((c) => c.has_spec).length

      const semanticCount = Array.isArray(tokenData) ? tokenData.length : 0
      const primitiveCount = Array.isArray(primitives) ? primitives.length : 0
      const componentTokenCount = Array.isArray(variables)
        ? variables.filter((v) => v.tier === "component").length
        : 0

      const stats = {
        total_components: totalComponents,
        spec_coverage: coverage(withSpec, totalComponents),
        total_tokens: {
          semantic: semanticCount,
          primitive: primitiveCount,
          component: componentTokenCount,
          total: semanticCount + primitiveCount + componentTokenCount,
        },
        components_with_variants: Object.values(variants).filter(
          (v) => v?.has_variants ?? Object.keys(v?.variants ?? {}).length > 0
        ).length,
        components_by_status: groupBy(comps, "status"),
        components_by_category: groupBy(comps, "category"),
      }

      return text(stats)
    }
  )

  // 2. validate_screen
  server.tool(
    "validate_screen",
    "Analyzes code against DS rules: checks DS component usage, token usage, composition rules. Returns a list of issues/warnings",
    {
      code: z
        .string()
        .describe("React/TSX code to validate against the design system rules"),
    },
    async ({ code }) => text(validateScreen(code))
  )
}

function groupBy<T>(arr: T[], key: keyof T & string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of arr) {
    const k = String(item[key] ?? "unknown")
    result[k] = (result[k] ?? 0) + 1
  }
  return result
}
