import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { loadContext, notFound, text } from "../lib/context.js"
import { READ_ONLY } from "../lib/annotations.js"
import {
  conciseUxWriting,
  responseFormat,
  type RuleSet,
} from "../lib/response-format.js"

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
  server.registerTool(
    "get_ux_writing_rules",
    {
      title: "UX writing rules",
      description:
        'Returns the rules for the text a UI renders. "concise" (default): the voice and tone rules (sentence case, verb-first buttons, errors that say what happened and how to fix it, word list) and the content rules (default strings from UI_STRINGS, one override prop per string, language of the defaults). "detailed": the whole rule set — foundation rules, component constraints, composition rules — which get_design_rules also serves',
      inputSchema: {
        response_format: responseFormat(
          "every foundation rule, the component constraints and the composition rules"
        ),
      },
      annotations: READ_ONLY,
    },
    async ({ response_format }) => {
      const rules = loadContext<RuleSet>("ux-writing.json")
      return text(
        response_format === "detailed" ? rules : conciseUxWriting(rules)
      )
    }
  )

  // 2. get_glossary
  server.registerTool(
    "get_glossary",
    {
      title: "Glossary",
      description: "Returns the full glossary or a specific term definition",
      inputSchema: {
        term: z.string().optional().describe("Specific term to look up"),
      },
      annotations: READ_ONLY,
    },
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
        return notFound(
          `Term "${term}" not found. Pass one of the available terms, or omit term for the whole glossary.`,
          terms.map((t) => t.term ?? t.name ?? "").filter(Boolean)
        )
      }

      return text(match)
    }
  )

  // 3. get_content_library
  server.registerTool(
    "get_content_library",
    {
      title: "Content library",
      description:
        "Returns content examples (labels, placeholders, messages), optionally filtered by category",
      inputSchema: {
        category: z
          .enum(["labels", "placeholders", "messages"])
          .optional()
          .describe("Content category to filter by"),
      },
      annotations: READ_ONLY,
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
