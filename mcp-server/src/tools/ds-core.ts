import { readdirSync } from "node:fs"
import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { contextDir, loadContext, text } from "../lib/context.js"
import {
  compositionRulesFor,
  type CompositionRule,
} from "../lib/composition-rules.js"
import { TAILWIND_RULE } from "../lib/tailwind-rule.js"

interface ComponentEntry {
  name: string
  category?: string
  status?: string
  code_path?: string
  has_spec?: boolean
}

export function registerDsCoreTools(server: McpServer): void {
  // 1. get_design_system_overview
  server.tool(
    "get_design_system_overview",
    "Returns DS version, library info, stats summary (components, tokens, spec coverage)",
    {},
    async () => {
      const components = loadContext<ComponentEntry[]>("components.json")
      const semanticTokens = loadContext<unknown[]>("semantic-tokens.json")
      const primitives = loadContext<unknown[]>("primitives.json")
      const variables = loadContext<Array<{ tier?: string }>>("variables.json")
      const meta = loadContext<{
        name?: string
        description?: string
        design_system_version?: string
        mcp_server_version?: string
        framework?: string
      }>("ds-metadata.json")

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
        name: meta.name ?? "DSAIReadable",
        version: meta.design_system_version ?? "unknown",
        mcp_server_version: meta.mcp_server_version ?? "unknown",
        description: meta.description ?? "Design System AI-Readable",
        framework:
          meta.framework ??
          "React 19 / Next.js 16 / Tailwind CSS v4 / shadcn-ui",
        distribution: {
          model:
            "shadcn registry — component source is copied into the consuming project, there is no npm package to install",
          component_location: "components/ui/<name>.tsx",
        },
        required_setup: {
          description:
            "MANDATORY: Every generated file MUST import each component from its own module inside the consuming project.",
          component_import:
            'import { Button } from "@/components/ui/button"  // one import per component',
          utils_import: 'import { cn } from "@/lib/utils"',
          css_setup:
            'app/globals.css already does `@import "../tokens.css"` and bridges the tokens into Tailwind v4 with `@theme inline`.',
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
  server.tool(
    "get_components",
    "Returns the full list of components, optionally filtered by category",
    {
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category (Forms, Overlay, Navigation, Data, Layout, Feedback, Misc)"
        ),
    },
    async ({ category }) => {
      let components = loadContext<ComponentEntry[]>("components.json")
      if (!Array.isArray(components)) components = []
      if (category) {
        const cat = category.toLowerCase()
        components = components.filter((c) => c.category?.toLowerCase() === cat)
      }
      return text(components)
    }
  )

  // 3. get_component_specs
  server.tool(
    "get_component_specs",
    "Returns the full spec for one component (role, usage, constraints, anatomy, tokens, props, states, accessibility — ARIA pattern, keyboard, accessible name, known pitfalls —, code example, cross-references)",
    {
      component_name: z
        .string()
        .describe("Component name (e.g. Button, Card, Dialog)"),
    },
    async ({ component_name }) => {
      const specs = loadContext<Record<string, unknown>>("component-specs.json")
      const needle = component_name.toLowerCase().replace(/[\s-_]/g, "")

      // Exact match first
      for (const [key, value] of Object.entries(specs)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return text(value)
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
          return text(value)
        }
      }

      return text({
        error: `Component "${component_name}" not found`,
        available: Object.keys(specs),
      })
    }
  )

  // 4. get_component_variants
  server.tool(
    "get_component_variants",
    "Returns the variants/props extracted from cva() for a component",
    {
      component_name: z
        .string()
        .describe("Component name to look up variants for"),
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

      return text({
        error: `No variants found for "${component_name}"`,
        available: Object.keys(variants),
      })
    }
  )

  // 5. get_tokens
  server.tool(
    "get_tokens",
    "Returns design tokens filtered by category, or all tokens if no category specified",
    {
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
    },
    async ({ category }) => {
      const tokens = loadContext<
        Array<{ path: string; css_var: string; [k: string]: unknown }>
      >("semantic-tokens.json")
      if (!Array.isArray(tokens)) return text([])

      if (!category) return text(tokens)

      const filtered = tokens.filter((t) => t.path.startsWith(category + "."))
      return text(filtered)
    }
  )

  // 6. get_typography
  server.tool(
    "get_typography",
    "Returns the full typography system (families, scale, weights, line-heights)",
    {},
    async () => {
      const typo = loadContext("text-styles.json")
      return text(typo)
    }
  )

  // 7. get_icons
  server.tool(
    "get_icons",
    "Returns the icon catalog and recommendations",
    {},
    async () => {
      const icons = loadContext("icons.json")
      return text(icons)
    }
  )

  // 8. get_design_rules
  server.tool(
    "get_design_rules",
    'Returns design rules: foundation do/don\'t, component constraints and the composition rules of design-system.index.json. Filter by category: a foundation (color, typography…), a component name (its constraints and the composition rules that cover it), or "composition" for every composition rule',
    {
      category: z
        .string()
        .optional()
        .describe("Filter rules by category (e.g. color, typography, spacing)"),
    },
    async ({ category }) => {
      const data = loadContext<Record<string, unknown>>("ux-writing.json")

      const tailwindRule = TAILWIND_RULE

      const componentRule = {
        id: "use-ds-components",
        severity: "critical",
        title: "ALWAYS use DS React components — NEVER use raw HTML elements",
        description: [
          "The design system provides pre-built React components that enforce tokens, accessibility, and visual consistency.",
          "ALWAYS prefer DS components over raw HTML elements. Every visual element should come from @/components/ui/<name>.",
        ],
        mandatory_mappings: {
          "Content sections / containers":
            "Use <Card>, <CardHeader>, <CardContent>, <CardFooter> — NOT raw <div>",
          "Titles / headings":
            "Use <Heading> component — NOT raw <h1>, <h2>, <h3>",
          "Buttons / CTAs":
            "Use <Button> component with variant prop — NOT raw <button> or <a> styled as button",
          "Form fields":
            "Use <Input>, <Label>, <Checkbox>, <Select>, <Textarea>, <RadioGroup> — NOT raw <input>",
          "Form groups":
            "Use <Field>, <FieldLabel>, <FieldDescription>, <FieldError> — NOT raw <div> + <label>",
          "Links with icon":
            "Use <Button variant='link'> or <Button variant='ghost'> — NOT raw <a>",
          Separators: "Use <Separator> — NOT raw <hr> or border-b",
          "Loading / empty states":
            "Use <Skeleton>, <Spinner>, <Empty> — NOT custom loading divs",
          "Modals / dialogs":
            "Use <Dialog> or <AlertDialog> — NOT custom overlay divs",
          Icons: "Use @phosphor-icons/react — NOT raw <svg> elements",
          Navigation:
            "Use <NavigationMenu>, <Breadcrumb>, <Tabs> — NOT raw <nav> + <a>",
          Tooltips: "Use <Tooltip> — NOT title attribute",
          "Lists of items":
            "Use <Item>, <ItemHeader>, <ItemContent> — NOT raw <li> or <div>",
          "Data display": "Use <Table>, <Badge>, <Avatar> — NOT custom layouts",
          Notifications:
            "Use <Alert>, Toaster (sonner) — NOT custom notification divs",
        },
        page_structure: [
          "Root container MUST have: className='min-h-screen bg-background text-foreground'",
          "Every page MUST set bg-background and text-foreground on the outermost element",
          "Wrap content sections in <Card> components for visual grouping",
          "Use <Heading> for all titles with proper level (1-4)",
          "All interactive elements MUST be DS components (Button, Input, etc.)",
        ],
      }

      if (!category) {
        return text({ ...data, critical_rules: [tailwindRule, componentRule] })
      }

      const cat = category.toLowerCase()
      const composition = compositionRulesFor(
        (data.composition_rules as CompositionRule[] | undefined) ?? [],
        category
      )
      if (["composition", "composition_rules", "rules"].includes(cat))
        return text({ category, composition_rules: composition })

      if (cat === "tailwind" || cat === "css" || cat === "styling") {
        return text({ category, rules: [tailwindRule, componentRule] })
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
            critical_rules: [tailwindRule, componentRule],
          })
      }

      if (componentRules && typeof componentRules === "object") {
        const match = (componentRules as Record<string, unknown>)[category]
        if (match)
          return text({
            category,
            rules: match,
            composition_rules: composition,
            critical_rules: [tailwindRule, componentRule],
          })
      }

      return text({
        category,
        rules: [],
        composition_rules: composition,
        critical_rules: [tailwindRule, componentRule],
      })
    }
  )

  // 9. get_page_patterns
  server.tool(
    "get_page_patterns",
    "Returns all page layout patterns",
    {},
    async () => {
      const patterns = loadContext("page-patterns.json")
      return text(patterns)
    }
  )
}
