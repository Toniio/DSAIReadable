import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { loadContext, text } from "../lib/context.js"

interface GlossaryEntry {
  term?: string
  name?: string
  [key: string]: unknown
}

interface ContentEntry {
  category?: string
  type?: string
  [key: string]: unknown
}

export function registerUxWritingTools(server: McpServer): void {
  // 1. get_ux_writing_rules
  server.tool(
    "get_ux_writing_rules",
    "Returns all UX writing rules (tone, voice, guidelines, do/don't)",
    {},
    async () => {
      const rules = loadContext("ux-writing.json")
      return text(rules)
    }
  )

  // 2. get_glossary
  server.tool(
    "get_glossary",
    "Returns the full glossary or a specific term definition",
    { term: z.string().optional().describe("Specific term to look up") },
    async ({ term }) => {
      const data = loadContext<
        { terms?: GlossaryEntry[] } & Record<string, unknown>
      >("glossary.json")

      if (!term) return text(data)

      const needle = term.toLowerCase()
      const terms =
        data.terms ?? (Array.isArray(data) ? (data as GlossaryEntry[]) : [])

      const match = terms.find(
        (t) =>
          (t.term ?? t.name ?? "").toLowerCase() === needle ||
          (t.term ?? t.name ?? "").toLowerCase().includes(needle)
      )

      if (!match) {
        return text({
          error: `Term "${term}" not found`,
          available: terms.map((t) => t.term ?? t.name),
        })
      }

      return text(match)
    }
  )

  // 3. get_content_library
  server.tool(
    "get_content_library",
    "Returns content examples (labels, placeholders, messages), optionally filtered by category",
    {
      category: z
        .enum(["labels", "placeholders", "messages"])
        .optional()
        .describe("Content category to filter by"),
    },
    async ({ category }) => {
      const data = loadContext<
        { entries?: ContentEntry[] } & Record<string, unknown>
      >("content-library.json")

      if (!category) return text(data)

      // Support both flat array and categorized object structures
      if (data.entries && Array.isArray(data.entries)) {
        const filtered = data.entries.filter(
          (e) =>
            (e.category ?? e.type ?? "").toLowerCase() ===
            category.toLowerCase()
        )
        return text(filtered)
      }

      const categoryData = (data as Record<string, unknown>)[category]
      if (categoryData) return text({ [category]: categoryData })

      return text({ category, entries: [] })
    }
  )
}
