import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/server"
import { loadContext, notFound, result } from "../lib/context.js"
import { READ_ONLY } from "../lib/annotations.js"
import {
  contentLibraryOutput,
  glossaryOutput,
  uxWritingRulesOutput,
} from "../lib/output-schemas.js"
import { uxWritingRules, type RuleSet } from "../lib/response-format.js"

interface GlossaryEntry {
  term: string
  definition: string
}

export function registerUxWritingTools(server: McpServer): void {
  // 1. dsaireadable_get_ux_writing_rules
  server.registerTool(
    "dsaireadable_get_ux_writing_rules",
    {
      title: "UX writing rules",
      description:
        "Returns the rules for the text a UI renders: the voice and tone rules (sentence case, verb-first buttons, errors that say what happened and how to fix it, word list) and the content rules (default strings from UI_STRINGS, one override prop per string, language of the defaults). The other rules — foundations, component constraints, composition — are served by dsaireadable_get_design_rules",
      outputSchema: uxWritingRulesOutput,
      annotations: READ_ONLY,
    },
    async () => result(uxWritingRules(loadContext<RuleSet>("ux-writing.json")))
  )

  // 2. dsaireadable_get_glossary
  server.registerTool(
    "dsaireadable_get_glossary",
    {
      title: "Glossary",
      description: "Returns the full glossary or a specific term definition",
      inputSchema: z.object({
        term: z.string().optional().describe("Specific term to look up"),
      }),
      outputSchema: glossaryOutput,
      annotations: READ_ONLY,
    },
    async ({ term }) => {
      const terms = loadContext<GlossaryEntry[]>("glossary.json")
      // An object at the root, as structuredContent requires.
      if (!term) return result({ terms })

      const needle = term.toLowerCase()
      const match = terms.find(
        (t) =>
          t.term.toLowerCase() === needle ||
          t.term.toLowerCase().includes(needle)
      )

      if (!match) {
        return notFound(
          `Term "${term}" not found. Pass one of the available terms, or omit term for the whole glossary.`,
          terms.map((t) => t.term)
        )
      }

      return result(match)
    }
  )

  // 3. dsaireadable_get_content_library
  server.registerTool(
    "dsaireadable_get_content_library",
    {
      title: "Content library",
      description:
        "Returns content examples (labels, placeholders, messages), optionally filtered by category",
      inputSchema: z.object({
        category: z
          .enum(["labels", "placeholders", "messages"])
          .optional()
          .describe("Content category to filter by"),
      }),
      outputSchema: contentLibraryOutput,
      annotations: READ_ONLY,
    },
    async ({ category }) => {
      const data = loadContext<Record<string, Record<string, string>>>(
        "content-library.json"
      )
      if (!category) return result(data)
      return result({ [category]: data[category] ?? {} })
    }
  )
}
