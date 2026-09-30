import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/server"
import { loadContext, result } from "../lib/context.js"
import { validateScreen } from "../lib/validate-screen.js"
import { validateCode } from "../lib/validate-code.js"
import { READ_ONLY } from "../lib/annotations.js"
import {
  codeReportOutput,
  screenReportOutput,
  statsOutput,
} from "../lib/output-schemas.js"

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
  // 1. dsaireadable_get_stats
  server.registerTool(
    "dsaireadable_get_stats",
    {
      title: "Design system stats",
      description:
        "Returns design system stats: total components, tokens per tier, spec coverage",
      outputSchema: statsOutput,
      annotations: READ_ONLY,
    },
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

      return result(stats)
    }
  )

  // 2. dsaireadable_validate_screen
  server.registerTool(
    "dsaireadable_validate_screen",
    {
      title: "Validate a screen",
      description:
        "Analyzes code against DS rules: checks DS component usage, token usage, composition rules. Returns a list of issues/warnings",
      inputSchema: z.object({
        code: z
          .string()
          .describe(
            "React/TSX code to validate against the design system rules"
          ),
      }),
      outputSchema: screenReportOutput,
      annotations: READ_ONLY,
    },
    async ({ code }) => result(validateScreen(code))
  )

  // 3. dsaireadable_validate_code
  server.registerTool(
    "dsaireadable_validate_code",
    {
      title: "Validate code with the ESLint rules",
      description:
        "Lints and type-checks TSX with the design system's own ESLint rules (@dsaireadable/eslint-plugin, the same a project runs): native elements instead of components, other UI or icon libraries, raw colors, default-palette and arbitrary Tailwind values, primitive tokens, deprecated imports, plus syntax and undefined names from TypeScript. Reads the syntax tree where dsaireadable_validate_screen reads text, so run it on the final code. Unknown Tailwind classes are checked by the project's own lint, which reads its stylesheet",
      inputSchema: z.object({
        code: z
          .string()
          .describe(
            "TSX code to validate, as it would be saved in a .tsx file"
          ),
      }),
      outputSchema: codeReportOutput,
      annotations: READ_ONLY,
    },
    async ({ code }) => result(validateCode(code))
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
