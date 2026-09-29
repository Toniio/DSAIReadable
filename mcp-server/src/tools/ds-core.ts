import { readdirSync } from "node:fs"
import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { contextDir, loadContext, notFound, text } from "../lib/context.js"
import {
  compositionRulesFor,
  type CompositionRule,
} from "../lib/composition-rules.js"
import { READ_ONLY } from "../lib/annotations.js"
import { pageParams, paginate } from "../lib/paginate.js"
import {
  conciseRuleSet,
  conciseSpec,
  CRITICAL_RULES,
  criticalRuleTitles,
  responseFormat,
  type ComponentSpec,
  type ResponseFormat,
  type RuleSet,
} from "../lib/response-format.js"

/** The generated ds-metadata.json (src/context/generate.ts). */
interface DsMetadata {
  name: string
  description: string
  design_system_version: string
  mcp_server_version: string
  registry_source: {
    repository: string
    registry: string
    item_address: string
  }
  stack: Record<string, string>
  framework: string
  sources: Record<string, string>
}

interface ComponentEntry {
  name: string
  category?: string
  status?: string
  code_path?: string
  has_spec?: boolean
}

export function registerDsCoreTools(server: McpServer): void {
  // 1. get_design_system_overview
  server.registerTool(
    "get_design_system_overview",
    {
      title: "Design system overview",
      description:
        "Returns DS version, library info, stats summary (components, tokens, spec coverage)",
      annotations: READ_ONLY,
    },
    async () => {
      const components = loadContext<ComponentEntry[]>("components.json")
      const semanticTokens = loadContext<unknown[]>("semantic-tokens.json")
      const primitives = loadContext<unknown[]>("primitives.json")
      const variables = loadContext<Array<{ tier?: string }>>("variables.json")
      const meta = loadContext<DsMetadata>("ds-metadata.json")

      const withSpec = components.filter((c) => c.has_spec).length
      const contextFiles = readdirSync(contextDir).filter((f) =>
        f.endsWith(".json")
      )

      const semanticCount = Array.isArray(semanticTokens)
        ? semanticTokens.length
        : 0
      const primitiveCount = Array.isArray(primitives) ? primitives.length : 0
      const componentTokenCount = Array.isArray(variables)
        ? variables.filter((v) => v.tier === "component").length
        : 0
      const pct = (n: number) =>
        components.length > 0 ? Math.round((n / components.length) * 100) : 0

      return text({
        name: meta.name,
        description: meta.description,
        // Two versions, never one ambiguous "version": each is read from the
        // file ds-metadata.json names in `sources`.
        design_system_version: meta.design_system_version,
        mcp_server_version: meta.mcp_server_version,
        framework: meta.framework,
        stack: meta.stack,
        distribution: {
          model:
            "shadcn registry — component source is copied into the consuming project, there is no npm package to install",
          registry_source: meta.registry_source,
          install: `npx shadcn@latest add ${meta.registry_source.item_address}`,
          component_location: "components/ui/<name>.tsx",
        },
        sources: meta.sources,
        required_setup: {
          description:
            "MANDATORY: Every generated file MUST import each component from its own module inside the consuming project.",
          component_import:
            'import { Button } from "@/components/ui/button"  // one import per component',
          utils_import: 'import { cn } from "@/lib/utils"',
          css_setup:
            'styles/globals.css already does `@import "../tokens.css"` and bridges the tokens into Tailwind v4 with `@theme inline`.',
          explanation:
            "Tokens are loaded once by the application stylesheet. Generated files must never import a stylesheet themselves, and must never reference a token variable directly in JSX.",
          full_example: `// components/example.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"`,
        },
        stats: {
          total_components: components.length,
          spec_coverage: `${withSpec}/${components.length} (${pct(withSpec)}%)`,
          tokens: {
            semantic: semanticCount,
            primitive: primitiveCount,
            component: componentTokenCount,
            total: semanticCount + primitiveCount + componentTokenCount,
          },
          context_files: contextFiles.length,
        },
        categories: [
          ...new Set(components.map((c) => c.category).filter(Boolean)),
        ],
      })
    }
  )

  // 2. get_components
  server.registerTool(
    "get_components",
    {
      title: "Components",
      description:
        "Returns the list of components, optionally filtered by category, one page at a time: { total, items, next_cursor }",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(
            "Filter by category (Forms, Overlay, Navigation, Data, Layout, Feedback, Misc)"
          ),
        ...pageParams,
      },
      annotations: READ_ONLY,
    },
    async ({ category, limit, cursor }) => {
      let components = loadContext<ComponentEntry[]>("components.json")
      if (!Array.isArray(components)) components = []
      if (category) {
        const cat = category.toLowerCase()
        components = components.filter((c) => c.category?.toLowerCase() === cat)
      }
      return text(paginate(components, limit, cursor))
    }
  )

  // 3. get_component_specs
  server.registerTool(
    "get_component_specs",
    {
      title: "Component spec",
      description:
        'Returns the spec of one component. "concise" (default): role, MUST / MUST NOT constraints, exported names, cross-references. "detailed": the full spec — usage, anatomy, tokens, props, states, accessibility (ARIA pattern, keyboard, accessible name, known pitfalls), code example. The full spec is also the resource ds://component/{name}/spec',
      inputSchema: {
        component_name: z
          .string()
          .describe("Component name (e.g. Button, Card, Dialog)"),
        response_format: responseFormat(
          "usage, anatomy, tokens, props, states, accessibility and the code example"
        ),
      },
      annotations: READ_ONLY,
    },
    async ({ component_name, response_format }) => {
      const specs = loadContext<Record<string, ComponentSpec>>(
        "component-specs.json"
      )
      const needle = component_name.toLowerCase().replace(/[\s-_]/g, "")
      const answer = (spec: ComponentSpec) =>
        text(response_format === "detailed" ? spec : conciseSpec(spec))

      // Exact match first
      for (const [key, value] of Object.entries(specs)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return answer(value)
        }
      }
      // Fuzzy match
      for (const [key, value] of Object.entries(specs)) {
        if (
          key
            .toLowerCase()
            .replace(/[\s-_]/g, "")
            .includes(needle)
        ) {
          return answer(value)
        }
      }

      return notFound(
        `Component "${component_name}" not found. Pass one of the available names.`,
        Object.keys(specs)
      )
    }
  )

  // 4. get_component_variants
  server.registerTool(
    "get_component_variants",
    {
      title: "Component variants",
      description:
        "Returns the variants/props extracted from cva() for a component",
      inputSchema: {
        component_name: z
          .string()
          .describe("Component name to look up variants for"),
      },
      annotations: READ_ONLY,
    },
    async ({ component_name }) => {
      const variants = loadContext<Record<string, unknown>>(
        "component-variants.json"
      )
      const needle = component_name.toLowerCase().replace(/[\s-_]/g, "")

      for (const [key, value] of Object.entries(variants)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return text({ component: key, ...(value as object) })
        }
      }
      for (const [key, value] of Object.entries(variants)) {
        if (
          key
            .toLowerCase()
            .replace(/[\s-_]/g, "")
            .includes(needle)
        ) {
          return text({ component: key, ...(value as object) })
        }
      }

      return notFound(
        `No variants found for "${component_name}". Pass one of the available names; a component absent from this list has no cva variants.`,
        Object.keys(variants)
      )
    }
  )

  // 5. get_tokens
  server.registerTool(
    "get_tokens",
    {
      title: "Semantic tokens",
      description:
        "Returns the semantic design tokens, filtered by category or all of them, one page at a time: { total, items, next_cursor }. One token is also the resource ds://token/{path}",
      inputSchema: {
        category: z
          .enum([
            "color",
            "space",
            "typography",
            "radius",
            "elevation",
            "motion",
            "opacity",
            "zindex",
            "breakpoint",
            "border-width",
          ])
          .optional()
          .describe("Token category to filter by"),
        ...pageParams,
      },
      annotations: READ_ONLY,
    },
    async ({ category, limit, cursor }) => {
      const tokens = loadContext<
        Array<{ path: string; css_var: string; [k: string]: unknown }>
      >("semantic-tokens.json")
      const all = Array.isArray(tokens) ? tokens : []
      const filtered = category
        ? all.filter((t) => t.path.startsWith(category + "."))
        : all
      return text(paginate(filtered, limit, cursor))
    }
  )

  // 6. get_typography
  server.registerTool(
    "get_typography",
    {
      title: "Typography",
      description:
        "Returns the full typography system (families, scale, weights, line-heights)",
      annotations: READ_ONLY,
    },
    async () => {
      const typo = loadContext("text-styles.json")
      return text(typo)
    }
  )

  // 7. get_icons
  server.registerTool(
    "get_icons",
    {
      title: "Icons",
      description: "Returns the icon catalog and recommendations",
      annotations: READ_ONLY,
    },
    async () => {
      const icons = loadContext("icons.json")
      return text(icons)
    }
  )

  // 8. get_design_rules
  server.registerTool(
    "get_design_rules",
    {
      title: "Design rules",
      description:
        'Returns design rules: foundation do/don\'t, component constraints and the composition rules of design-system.index.json. Filter by category: a foundation (color, typography…), a component name (its constraints and the composition rules that cover it), "composition" for every composition rule, or "tailwind" for the critical rules in full. Without a category, "concise" (default) returns the composition rules, the titles of the critical rules and the categories; "detailed" returns every rule. With a category, "concise" reduces the critical rules to their titles',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe("Filter rules by category (e.g. color, radius, Button)"),
        response_format: responseFormat(
          "every rule without a category, and the critical rules in full with one"
        ),
      },
      annotations: READ_ONLY,
    },
    async ({ category, response_format }) => {
      const data = loadContext<RuleSet>("ux-writing.json")
      const critical = (format: ResponseFormat) =>
        format === "detailed" ? CRITICAL_RULES : criticalRuleTitles()

      if (!category) {
        return text(
          response_format === "detailed"
            ? { ...data, critical_rules: CRITICAL_RULES }
            : conciseRuleSet(data)
        )
      }

      const cat = category.toLowerCase()
      const composition = compositionRulesFor(
        (data.composition_rules as CompositionRule[] | undefined) ?? [],
        category
      )
      if (["composition", "composition_rules", "rules"].includes(cat))
        return text({ category, composition_rules: composition })

      if (cat === "tailwind" || cat === "css" || cat === "styling") {
        return text({ category, rules: CRITICAL_RULES })
      }

      // Check general_rules and component_rules
      const generalRules = data.general_rules
      const componentRules = data.component_rules

      if (Array.isArray(generalRules)) {
        const filtered = (
          generalRules as Array<{ source?: string; category?: string }>
        ).filter(
          (r) =>
            r.source?.toLowerCase().includes(cat) ||
            r.category?.toLowerCase().includes(cat)
        )
        if (filtered.length > 0)
          return text({
            category,
            rules: filtered,
            composition_rules: composition,
            critical_rules: critical(response_format),
          })
      }

      if (componentRules && typeof componentRules === "object") {
        const match = Object.entries(
          componentRules as Record<string, unknown>
        ).find(([name]) => name.toLowerCase() === cat)?.[1]
        if (match)
          return text({
            category,
            rules: match,
            composition_rules: composition,
            critical_rules: critical(response_format),
          })
      }

      if (composition.length > 0)
        return text({
          category,
          rules: [],
          composition_rules: composition,
          critical_rules: critical(response_format),
        })

      // Nothing matched: an empty answer would read as "no rules apply".
      const { foundations, components } = conciseRuleSet(data).categories
      return notFound(
        `No rules for category "${category}". Pass a foundation or a component name below, "composition", or "tailwind".`,
        [...foundations, ...components] as string[]
      )
    }
  )

  // 9. get_page_patterns
  server.registerTool(
    "get_page_patterns",
    {
      title: "Page patterns",
      description: "Returns all page layout patterns",
      annotations: READ_ONLY,
    },
    async () => {
      const patterns = loadContext("page-patterns.json")
      return text(patterns)
    }
  )
}
