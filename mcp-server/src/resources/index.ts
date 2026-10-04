import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/server"
import { loadContext } from "../lib/context.js"
import { CRITICAL_RULES, type RuleSet } from "../lib/response-format.js"

const JSON_MIME = "application/json"

/** The protocol caps a completion answer at 100 values. */
const MAX_COMPLETIONS = 100

function json(uri: URL, data: unknown) {
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: JSON_MIME,
        text: JSON.stringify(data),
      },
    ],
  }
}

/** A template variable arrives as a string, or a list for exploded forms. */
function single(value: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? "") : value
}

function complete(candidates: string[], prefix: string): string[] {
  const p = prefix.toLowerCase()
  return candidates
    .filter((c) => c.toLowerCase().startsWith(p))
    .slice(0, MAX_COMPLETIONS)
}

const specs = () => loadContext<Record<string, unknown>>("component-specs.json")

const tokens = () =>
  loadContext<Array<{ path: string; [k: string]: unknown }>>(
    "semantic-tokens.json"
  )

/**
 * The design system as MCP resources: data a client can list, complete and
 * attach as context without calling a tool.
 *
 * - ds://component/{name}/spec — the full spec of a component, listed
 * - ds://token/{path}          — one semantic token, found by completion
 * - ds://guidelines            — every rule, as dsaireadable_get_design_rules serves them
 */
export function registerResources(server: McpServer): void {
  server.registerResource(
    "component-spec",
    new ResourceTemplate("ds://component/{name}/spec", {
      list: () => ({
        resources: Object.keys(specs()).map((name) => ({
          uri: `ds://component/${name}/spec`,
          name: `${name} spec`,
          mimeType: JSON_MIME,
        })),
      }),
      complete: { name: (value) => complete(Object.keys(specs()), value) },
    }),
    {
      title: "Component spec",
      description:
        "The full spec of one component: role, usage, constraints, anatomy, tokens, props, states, accessibility, code example, cross-references",
      mimeType: JSON_MIME,
    },
    (uri, variables) => {
      const wanted = single(variables.name).toLowerCase()
      const entry = Object.entries(specs()).find(
        ([name]) => name.toLowerCase() === wanted
      )
      if (!entry) {
        throw new Error(
          `No component "${single(variables.name)}". List the resources, or complete {name}, for the ${Object.keys(specs()).length} names.`
        )
      }
      return json(uri, entry[1])
    }
  )

  server.registerResource(
    "token",
    // Not listed: 124 tokens would drown the component specs in
    // resources/list. Completion on {path} finds them.
    new ResourceTemplate("ds://token/{path}", {
      list: undefined,
      complete: {
        path: (value) =>
          complete(
            tokens().map((t) => t.path),
            value
          ),
      },
    }),
    {
      title: "Semantic token",
      description:
        "One semantic token: its CSS variable, its light and dark values, its status and usage. The path uses dots, e.g. ds://token/color.background.default",
      mimeType: JSON_MIME,
    },
    (uri, variables) => {
      const path = single(variables.path)
      const token = tokens().find((t) => t.path === path)
      if (!token) {
        throw new Error(
          `No semantic token "${path}". Complete {path}, or call dsaireadable_get_tokens, for the valid paths.`
        )
      }
      return json(uri, token)
    }
  )

  server.registerResource(
    "guidelines",
    "ds://guidelines",
    {
      title: "Design guidelines",
      description:
        "Every design rule: the critical rules, the foundation do/don't and the composition rules of design-system.index.json",
      mimeType: JSON_MIME,
    },
    (uri) => {
      const data = loadContext<RuleSet>("ux-writing.json")
      return json(uri, {
        critical_rules: CRITICAL_RULES,
        general_rules: data.general_rules ?? [],
        composition_rules: data.composition_rules ?? [],
      })
    }
  )
}
