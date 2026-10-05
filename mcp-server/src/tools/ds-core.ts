import { readdirSync } from "node:fs"
import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/server"
import { contextDir, loadContext, notFound, result } from "../lib/context.js"
import {
  compositionRulesFor,
  type CompositionRule,
} from "../lib/composition-rules.js"
import { READ_ONLY } from "../lib/annotations.js"
import { loadProjectPatterns } from "../lib/patterns.js"
import {
  changelogOutput,
  componentSpecOutput,
  componentsOutput,
  deprecationsOutput,
  designRulesOutput,
  iconsOutput,
  overviewOutput,
  patternListOutput,
  patternOutput,
  tokensOutput,
  typographyOutput,
} from "../lib/output-schemas.js"
import { pageParams, paginate } from "../lib/paginate.js"
import {
  conciseRuleSet,
  concisePattern,
  conciseSpec,
  criticalRuleTitles,
  detailedRuleSet,
  responseFormat,
  servedCriticalRules,
  type ComponentSpec,
  type Pattern,
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
  shadcn_excluded: ShadcnExclusion[]
  sources: Record<string, string>
}

/** A shadcn/ui component the design system does not ship. */
interface ShadcnExclusion {
  item: string
  reason: string
  instead?: string
}

const normalize = (name: string) => name.toLowerCase().replace(/[\s-_]/g, "")

/**
 * The design system's patterns, then those of the project the server runs in
 * (`design/patterns/*.md` under `DSAIREADABLE_PROJECT_DIR`, or under the working
 * directory a client starts the server in). The project's wins on a shared name.
 * Read on each call: the project's files change while the server runs.
 */
function allPatterns(): Record<string, Pattern> {
  return {
    ...loadContext<Record<string, Pattern>>("patterns.json"),
    ...loadProjectPatterns(
      process.env.DSAIREADABLE_PROJECT_DIR ?? process.cwd()
    ),
  }
}

/**
 * The answer to a request for a shadcn/ui component the design system leaves
 * out on purpose (Form): an agent that knows it from shadcn/ui learns it is not
 * here, why, and what to write instead, rather than a bare "not found".
 */
function excludedAnswer(name: string, available: string[]) {
  const needle = normalize(name)
  const excluded = loadContext<DsMetadata>(
    "ds-metadata.json"
  ).shadcn_excluded.find((x) => normalize(x.item) === needle)
  if (!excluded) return undefined
  return notFound(
    `"${name}" is a shadcn/ui component this design system does not ship: ${excluded.reason}${excluded.instead ? ` Use ${excluded.instead} instead.` : ""}`,
    available
  )
}

interface ComponentEntry {
  name: string
  category?: string
  status?: string
  code_path?: string
  has_spec?: boolean
  sizes?: string[]
}

/** The cva axes of a component, as src/context/generate.ts extracts them. */
interface VariantEntry {
  variants: Record<string, { values: string[]; default: string | null }>
  sources: string[]
  part_of: string | null
}

/**
 * What the detailed answer of dsaireadable_get_component_specs leaves to the
 * resource ds://component/{name}/spec: how the component is built — the
 * libraries it wraps, its data-slots, the tokens its classes read, how each
 * state looks. A screen that uses the component writes none of it, and what a
 * state asks of the screen is one of the spec's constraints.
 */
const BUILD_FIELDS = new Set([
  "dependencies",
  "anatomy",
  "tokens",
  "tokens_from",
  "states",
])

interface PropRow {
  component: string
  prop: string
  type: string
  default: string
  description: string
}

/**
 * A props row every part has and that says nothing more: the `...props` it
 * spreads (each export's summary names the element it renders), or a
 * `className` that only adds classes to it. A `...props` that adds the props
 * of another element or library (an intersection, an Omit or a Pick) stays,
 * and so does a `className` row that says where the classes go.
 */
const restatesTheElement = (row: PropRow) =>
  (row.prop.startsWith("`...") && !/&|\bOmit<|\bPick</.test(row.type)) ||
  (row.prop === "`className`" &&
    row.type === "`string`" &&
    row.description === "Additional CSS classes")

/**
 * The detailed answer of dsaireadable_get_component_specs: what a screen needs
 * to use the component in one call — its usage, constraints, exports, props,
 * accessibility and code example, its cva variants, the sizes its size prop
 * accepts, and the composition rules that cover it.
 */
function componentContext(spec: ComponentSpec) {
  const variants = loadContext<Record<string, VariantEntry>>(
    "component-variants.json"
  )[spec.name]
  const entry = loadContext<ComponentEntry[]>("components.json").find(
    (c) => c.name === spec.name
  )
  const rules = loadContext<RuleSet>("ux-writing.json").composition_rules
  const kept = Object.fromEntries(
    Object.entries(spec).filter(([field]) => !BUILD_FIELDS.has(field))
  )
  return {
    ...kept,
    exports: (
      (spec.exports ?? []) as Array<{
        name: string
        summary: string
        description: string
      }>
    ).map(({ name, summary, description }) => ({ name, summary, description })),
    props: ((spec.props ?? []) as PropRow[]).filter(
      (row) => !restatesTheElement(row)
    ),
    variants: variants?.variants ?? {},
    sizes: entry?.sizes ?? [],
    composition_rules: compositionRulesFor(
      (rules as CompositionRule[] | undefined) ?? [],
      spec.name
    ),
  }
}

/**
 * A link to another file of the design system read as the name it gives:
 * `[create](./create.md)` as `create`. An agent follows no relative link, and
 * every turn would resend the path. When the label is not that name,
 * `[voice and tone](../foundations/voice-and-tone.md)`, the name follows it
 * in parentheses, since the tools take the name. A link with a scheme
 * (`https:`) stays whole: it is the only pointer to what it names.
 */
const withoutLinkTargets = (text: string) =>
  text.replace(
    /\[([^\]]+)\]\((?![a-z][a-z\d+.-]*:)([^()\s]*)\)/gi,
    (_, label: string, target: string) => {
      const name = target
        .replace(/#.*$/, "")
        .split("/")
        .pop()!
        .replace(/\.md$/, "")
      const plain = label.replace(/`/g, "").toLowerCase()
      return !name || plain === name.toLowerCase()
        ? label
        : `${label} (${name})`
    }
  )

export function registerDsCoreTools(server: McpServer): void {
  // 1. dsaireadable_get_design_system_overview
  server.registerTool(
    "dsaireadable_get_design_system_overview",
    {
      title: "Design system overview",
      description:
        "Returns the versions, the install command, the required imports, the shadcn/ui components left out, counts and categories",
      outputSchema: overviewOutput,
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

      return result({
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
        // shadcn/ui components left out on purpose, and what to use instead.
        shadcn_excluded: meta.shadcn_excluded,
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

  // 2. dsaireadable_get_components
  server.registerTool(
    "dsaireadable_get_components",
    {
      title: "Components",
      description:
        "Lists the components with their category, status, code path and sizes: { total, items, next_cursor }",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            "Brand, Conversation, Data, Feedback, Forms, Layout, Media, Misc, Navigation, Overlay or Typography"
          ),
        ...pageParams,
      }),
      outputSchema: componentsOutput,
      annotations: READ_ONLY,
    },
    async ({ category, limit, cursor }) => {
      let components = loadContext<ComponentEntry[]>("components.json")
      if (!Array.isArray(components)) components = []
      if (category) {
        const cat = category.toLowerCase()
        components = components.filter((c) => c.category?.toLowerCase() === cat)
      }
      // has_spec is true for every component: the overview counts it, the
      // list does not resend it.
      const items = components.map(
        ({ name, category, status, code_path, sizes }) => ({
          name,
          category,
          status,
          code_path,
          sizes,
        })
      )
      return result(paginate(items, limit, cursor))
    }
  )

  // 3. dsaireadable_get_component_specs
  server.registerTool(
    "dsaireadable_get_component_specs",
    {
      title: "Component spec",
      description:
        "Returns one component's spec: role, MUST / MUST NOT constraints, export names, cross-references and how its API departs from shadcn/ui (each divergence, with the reason; write the shadcn/ui API everywhere else). The whole spec, with anatomy, tokens and states, is the resource ds://component/{name}/spec",
      inputSchema: z.object({
        component_name: z.string().describe("e.g. Button, Card, Dialog"),
        response_format: responseFormat(
          "usage, export summaries and descriptions, props, accessibility (ARIA pattern, keyboard, accessible name, pitfalls), the code example, the cva variants with their defaults, the sizes and the composition rules that cover it"
        ),
      }),
      outputSchema: componentSpecOutput,
      annotations: READ_ONLY,
    },
    async ({ component_name, response_format }) => {
      const specs = loadContext<Record<string, ComponentSpec>>(
        "component-specs.json"
      )
      const needle = component_name.toLowerCase().replace(/[\s-_]/g, "")
      const answer = (spec: ComponentSpec) => {
        const detailed = componentContext(spec)
        return result(
          response_format === "detailed"
            ? detailed
            : conciseSpec(spec, detailed)
        )
      }

      // Exact match first
      for (const [key, value] of Object.entries(specs)) {
        if (key.toLowerCase().replace(/[\s-_]/g, "") === needle) {
          return answer(value)
        }
      }
      // A shadcn/ui component left out on purpose, before a fuzzy match
      // answers with a component whose name merely contains it.
      const excluded = excludedAnswer(component_name, Object.keys(specs))
      if (excluded) return excluded
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

  // 4. dsaireadable_get_tokens
  server.registerTool(
    "dsaireadable_get_tokens",
    {
      title: "Semantic tokens",
      description:
        "Returns the semantic tokens: { total, items, next_cursor }. One token is the resource ds://token/{path}",
      inputSchema: z.object({
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
            "size",
          ])
          .optional(),
        ...pageParams,
      }),
      outputSchema: tokensOutput,
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
      return result(paginate(filtered, limit, cursor))
    }
  )

  // 4 bis. dsaireadable_get_deprecations
  server.registerTool(
    "dsaireadable_get_deprecations",
    {
      title: "Deprecations",
      description:
        "Returns the deprecated tokens and component exports, each with its replacement. Check it before using a token or an export from an earlier version",
      inputSchema: z.object({
        kind: z.enum(["token", "export"]).optional().describe("Omit for both"),
      }),
      outputSchema: deprecationsOutput,
      annotations: READ_ONLY,
    },
    async ({ kind }) => {
      const all = loadContext<{
        tokens: unknown[]
        exports: unknown[]
      }>("deprecations.json")
      const tokens = kind === "export" ? [] : all.tokens
      const exports = kind === "token" ? [] : all.exports
      return result({
        total: tokens.length + exports.length,
        tokens,
        exports,
      })
    }
  )

  // 4 ter. dsaireadable_get_changelog
  server.registerTool(
    "dsaireadable_get_changelog",
    {
      title: "Changelog",
      description:
        "Returns the changelog, one entry per change, newest release first: { total, items, next_cursor }. Read it for what changed since the version you know",
      inputSchema: z.object({
        version: z.string().optional().describe("A release number"),
        category: z
          .string()
          .optional()
          .describe("A changelog heading, such as Minor Changes or Fixed"),
        ...pageParams,
      }),
      outputSchema: changelogOutput,
      annotations: READ_ONLY,
    },
    async ({ version, category, limit, cursor }) => {
      const all = loadContext<
        Array<{
          version: string
          date: string | null
          category: string
          text: string
        }>
      >("changelog.json")
      const versions = [...new Set(all.map((e) => e.version))]
      if (version !== undefined && !versions.includes(version))
        return notFound(
          `Version "${version}" is not in the changelog. Pass one of the available versions.`,
          versions
        )
      const categories = [...new Set(all.map((e) => e.category))]
      if (category !== undefined && !categories.includes(category))
        return notFound(
          `Category "${category}" is not in the changelog. Pass one of the available categories.`,
          categories
        )
      const items = all.filter(
        (e) =>
          (version === undefined || e.version === version) &&
          (category === undefined || e.category === category)
      )
      return result(paginate(items, limit, cursor))
    }
  )

  // 5. dsaireadable_get_typography
  server.registerTool(
    "dsaireadable_get_typography",
    {
      title: "Typography",
      description:
        "Returns the font families, type scale, weights, line heights, letter spacing and usage rules",
      outputSchema: typographyOutput,
      annotations: READ_ONLY,
    },
    async () => {
      const typo = loadContext<object>("text-styles.json")
      return result(typo)
    }
  )

  // 6. dsaireadable_get_icons
  server.registerTool(
    "dsaireadable_get_icons",
    {
      title: "Icons",
      description:
        "Returns the icon library, its default size, its usage rules and the catalog URL",
      outputSchema: iconsOutput,
      annotations: READ_ONLY,
    },
    async () => {
      const icons = loadContext<object>("icons.json")
      return result(icons)
    }
  )

  // 7. dsaireadable_get_design_rules
  server.registerTool(
    "dsaireadable_get_design_rules",
    {
      title: "Design rules",
      description:
        "Returns the design rules. Without a category: the composition rules, the titles of the critical rules and the categories to pass",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            'A foundation (color, spacing, focus…) or a component name: its rules and the composition rules that cover it. "composition": every composition rule. "tailwind": the critical rules'
          ),
        response_format: responseFormat(
          "the critical rules, not only their titles, and every foundation's rules without a category"
        ),
      }),
      outputSchema: designRulesOutput,
      annotations: READ_ONLY,
    },
    async ({ category, response_format }) => {
      const data = loadContext<RuleSet>("ux-writing.json")
      const critical = (format: ResponseFormat) =>
        format === "detailed" ? servedCriticalRules() : criticalRuleTitles()

      if (!category) {
        return result(
          response_format === "detailed"
            ? detailedRuleSet(data)
            : conciseRuleSet(data)
        )
      }

      const cat = category.toLowerCase()
      const composition = compositionRulesFor(
        (data.composition_rules as CompositionRule[] | undefined) ?? [],
        category
      )
      if (["composition", "composition_rules", "rules"].includes(cat))
        return result({ category, composition_rules: composition })

      if (cat === "tailwind" || cat === "css" || cat === "styling") {
        return result({ category, rules: servedCriticalRules() })
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
          return result({
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
          return result({
            category,
            rules: match,
            composition_rules: composition,
            critical_rules: critical(response_format),
          })
      }

      if (composition.length > 0)
        return result({
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

  // 8. dsaireadable_list_patterns
  server.registerTool(
    "dsaireadable_list_patterns",
    {
      title: "Page patterns",
      description:
        "Lists the page patterns with name, title, kind and role: tasks (create, edit, delete, filter, search, sign-in, settings), the UI patterns they share (empty-state, form, loading, navigation, saving) and the project's own",
      inputSchema: z.object({
        kind: z.enum(["task", "ui"]).optional(),
      }),
      outputSchema: patternListOutput,
      annotations: READ_ONLY,
    },
    async ({ kind }) => {
      const patterns = Object.values(allPatterns()).filter(
        (p) => !kind || p.kind === kind
      )
      return result({
        total: patterns.length,
        patterns: patterns.map(({ name, title, kind, role }) => ({
          name,
          title,
          kind,
          role,
        })),
      })
    }
  )

  // 9. dsaireadable_get_pattern
  server.registerTool(
    "dsaireadable_get_pattern",
    {
      title: "Page pattern",
      description:
        "Returns one page pattern by name or title: role, usage rules and the components it takes",
      inputSchema: z.object({
        name: z.string().describe('e.g. "create", "sign-in", "Empty state"'),
        response_format: responseFormat(
          "the structure (regions and their components), the component variants, the spacing and content rules, the code example and the cross-references"
        ),
      }),
      outputSchema: patternOutput,
      annotations: READ_ONLY,
    },
    async ({ name, response_format }) => {
      const patterns = allPatterns()
      const needle = normalize(name)
      const all = Object.values(patterns)
      const pattern =
        all.find((p) => [p.name, p.title].map(normalize).includes(needle)) ??
        all.find((p) => normalize(p.name).includes(needle))
      if (!pattern)
        return notFound(
          `Pattern "${name}" not found. Pass one of the available names.`,
          Object.keys(patterns)
        )
      return result(
        response_format === "detailed"
          ? {
              ...pattern,
              cross_references: (
                (pattern.cross_references ?? []) as string[]
              ).map(withoutLinkTargets),
            }
          : concisePattern(pattern)
      )
    }
  )
}
