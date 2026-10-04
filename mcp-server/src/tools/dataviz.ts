import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/server"
import { loadContext, notFound, result } from "../lib/context.js"
import { READ_ONLY } from "../lib/annotations.js"
import {
  chartRecommendationOutput,
  chartSpecOutput,
} from "../lib/output-schemas.js"

export function registerDatavizTools(server: McpServer): void {
  // 1. dsaireadable_get_dataviz_recommendation
  server.registerTool(
    "dsaireadable_get_dataviz_recommendation",
    {
      title: "Chart recommendation",
      description:
        "Returns the chart types recommended for an objective, each with its spec",
      inputSchema: z.object({
        objective: z.enum([
          "evolution",
          "correlation",
          "comparison",
          "distribution",
          "proportion",
          "kpi",
        ]),
      }),
      outputSchema: chartRecommendationOutput,
      annotations: READ_ONLY,
    },
    async ({ objective }) => {
      const data = loadContext<{
        objectives?: Array<{
          name: string
          recommended_charts: string[]
          description: string
        }>
      }>("dataviz-decision-tree.json")
      const objectives = data.objectives ?? []
      const obj = objective.toLowerCase()
      const match = objectives.find((o) => o.name.toLowerCase() === obj)

      if (!match) {
        return notFound(
          `The decision tree has no objective "${objective}". Pass one of the available objectives.`,
          objectives.map((o) => o.name)
        )
      }
      // Enrich with specs from catalog
      const catalog = loadContext<Record<string, unknown>>(
        "dataviz-catalog.json"
      )
      const charts = match.recommended_charts.map((ct) => ({
        type: ct,
        ...((catalog[ct] as object) ?? {}),
      }))

      return result({
        objective: match.name,
        description: match.description,
        recommended_charts: charts,
      })
    }
  )

  // 2. dsaireadable_get_dataviz_specs
  server.registerTool(
    "dsaireadable_get_dataviz_specs",
    {
      title: "Chart spec",
      description:
        "Returns one chart type's spec: library, component, tokens, anatomy, do/don't, variants",
      inputSchema: z.object({
        chart_type: z.string().describe("e.g. bar, line, pie, data_card"),
      }),
      outputSchema: chartSpecOutput,
      annotations: READ_ONLY,
    },
    async ({ chart_type }) => {
      const catalog = loadContext<Record<string, unknown>>(
        "dataviz-catalog.json"
      )

      const needle = chart_type.toLowerCase().replace(/[\s-_]/g, "")

      for (const [key, value] of Object.entries(catalog)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return result({ type: key, ...(value as object) })
        }
      }
      // Fuzzy
      for (const [key, value] of Object.entries(catalog)) {
        if (
          key
            .toLowerCase()
            .replace(/[\s-_]/g, "")
            .includes(needle)
        ) {
          return result({ type: key, ...(value as object) })
        }
      }

      return notFound(
        `Chart type "${chart_type}" not found. Pass one of the available types.`,
        Object.keys(catalog)
      )
    }
  )
}
