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
        "Returns the rules for UI text: voice and tone (sentence case, verb-first buttons, errors that say what happened and how to fix it, word list) and content (UI_STRINGS defaults, one override prop per string, the defaults' language). Other rules: dsaireadable_get_design_rules",
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
      description: "Returns the glossary, or one term's definition",
      inputSchema: z.object({
        term: z.string().optional(),
      }),
      outputSchema: glossaryOutput,
      annotations: READ_ONLY,
    },
    async ({ term }) => {
      const terms = loadContext<GlossaryEntry[]>("glossary.json")
      // An object at the root, as structuredContent requires.
      if (!term) return result({ terms })

      // The exact term first: "token" is also inside "component-token", listed
      // before it. A partial match answers only when no term is exact.
      const needle = term.toLowerCase()
      const match =
        terms.find((t) => t.term.toLowerCase() === needle) ??
        terms.find((t) => t.term.toLowerCase().includes(needle))

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
        "Returns example UI strings: labels, placeholders and messages",
      inputSchema: z.object({
        category: z.enum(["labels", "placeholders", "messages"]).optional(),
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
