import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { loadContext, notFound, text } from "../lib/context.js"
import { READ_ONLY } from "../lib/annotations.js"

export function registerDatavizTools(server: McpServer): void {
  // 1. get_dataviz_recommendation
  server.registerTool(
    "get_dataviz_recommendation",
    {
      title: "Chart recommendation",
      description:
        "Returns recommended chart types for a given data visualization objective",
      inputSchema: {
        objective: z
          .enum([
            "evolution",
            "correlation",
            "comparison",
            "distribution",
            "proportion",
            "kpi",
          ])
          .describe("The data visualization objective"),
      },
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
        return text({
          objective,
          note: "No exact match found. Showing all objectives.",
          objectives,
        })
      }

      // Enrich with specs from catalog
      const catalog = loadContext<Record<string, unknown>>(
        "dataviz-catalog.json"
      )
      const charts = match.recommended_charts.map((ct) => ({
        type: ct,
        ...((catalog[ct] as object) ?? {}),
      }))

      return text({
        objective: match.name,
        description: match.description,
        recommended_charts: charts,
      })
    }
  )

  // 2. get_dataviz_specs
  server.registerTool(
    "get_dataviz_specs",
    {
      title: "Chart spec",
      description:
        "Returns full specs for a chart type (tokens, anatomy, do/don't, library, variants)",
      inputSchema: {
        chart_type: z
          .string()
          .describe(
            "The chart type to get specs for (e.g. 'bar', 'line', 'pie')"
          ),
      },
      annotations: READ_ONLY,
    },
    async ({ chart_type }) => {
      const catalog = loadContext<Record<string, unknown>>(
        "dataviz-catalog.json"
      )

      const needle = chart_type.toLowerCase().replace(/[\s-_]/g, "")

      for (const [key, value] of Object.entries(catalog)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return text({ type: key, ...(value as object) })
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
          return text({ type: key, ...(value as object) })
        }
      }

      return notFound(
        `Chart type "${chart_type}" not found. Pass one of the available types.`,
        Object.keys(catalog)
      )
    }
  )
}
