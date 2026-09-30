import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/server"
import { loadContext, notFound, result } from "../lib/context.js"
import { READ_ONLY } from "../lib/annotations.js"
import {
  contentLibraryOutput,
  glossaryOutput,
  uxWritingRulesOutput,
} from "../lib/output-schemas.js"
import {
  conciseUxWriting,
  responseFormat,
  type RuleSet,
} from "../lib/response-format.js"

interface GlossaryEntry {
  term: string
  definition: string
}

export function registerUxWritingTools(server: McpServer): void {
  // 1. get_ux_writing_rules
  server.registerTool(
    "get_ux_writing_rules",
    {
      title: "UX writing rules",
      description:
        'Returns the rules for the text a UI renders. "concise" (default): the voice and tone rules (sentence case, verb-first buttons, errors that say what happened and how to fix it, word list) and the content rules (default strings from UI_STRINGS, one override prop per string, language of the defaults). "detailed": the whole rule set — foundation rules, component constraints, composition rules — which get_design_rules also serves',
      inputSchema: z.object({
        response_format: responseFormat(
          "every foundation rule, the component constraints and the composition rules"
        ),
      }),
      outputSchema: uxWritingRulesOutput,
      annotations: READ_ONLY,
    },
    async ({ response_format }) => {
      const rules = loadContext<RuleSet>("ux-writing.json")
      return result(
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

  // 3. get_content_library
  server.registerTool(
    "get_content_library",
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
