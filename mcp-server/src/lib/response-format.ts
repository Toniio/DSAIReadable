/**
 * The `response_format` argument of the tools whose answers are large:
 * dsaireadable_get_component_specs (up to 15 K characters for one detailed
 * spec), dsaireadable_get_design_rules (about 37 K detailed, without a
 * filter), and dsaireadable_get_pattern (a pattern and its code example).
 *
 * `concise`, the default, keeps what an agent needs to choose and to stay
 * within the rules, and names what `detailed` would add. Every turn after a
 * call sends its answer again, so `detailed` serves what a screen writes, not
 * how the design system is built. src/test.ts holds the volumes.
 */
import { z } from "zod"
import { COMPONENT_RULE } from "./component-rule.js"
import { TAILWIND_RULE } from "./tailwind-rule.js"

export type ResponseFormat = "concise" | "detailed"

export function responseFormat(detailedAdds: string) {
  return z
    .enum(["concise", "detailed"])
    .default("concise")
    .describe(`"detailed" adds ${detailedAdds}`)
}

export const CRITICAL_RULES = [TAILWIND_RULE, COMPONENT_RULE]

/**
 * The critical rules as dsaireadable_get_design_rules serves them: without
 * the `do` list, which repeats the description as classes (the prompts print
 * it), and the token chain, which traces each class to its token — a screen
 * writes the class, and dsaireadable_get_tokens has the values.
 */
export const servedCriticalRules = () =>
  CRITICAL_RULES.map((rule) => {
    const served: Record<string, unknown> = { ...rule }
    delete served.do
    delete served.token_chain_explanation
    return served
  })

/** A critical rule reduced to what identifies it. */
export const criticalRuleTitles = () =>
  CRITICAL_RULES.map(({ id, severity, title }) => ({ id, severity, title }))

export interface ComponentSpec {
  name: string
  category?: string
  status?: string
  role?: string
  constraints?: string[]
  exports?: Array<{ name: string }>
  cross_references?: string[]
  shadcn?: unknown
  [section: string]: unknown
}

const CONCISE_SPEC_FIELDS = [
  "name",
  "category",
  "status",
  "role",
  "constraints",
  "exports",
  "cross_references",
  "shadcn",
]

/**
 * A spec reduced to its role, its MUST / MUST NOT constraints, the names it
 * exports, the components it points to and how its API departs from
 * shadcn/ui's: an agent writes the shadcn/ui API from memory, so the
 * divergences belong in the short answer. `detail` names what the detailed
 * answer adds, read from that answer.
 */
export function conciseSpec(spec: ComponentSpec, detailed: object) {
  const omitted = Object.keys(detailed).filter(
    (k) => !CONCISE_SPEC_FIELDS.includes(k)
  )
  return {
    name: spec.name,
    category: spec.category,
    status: spec.status,
    role: spec.role,
    constraints: spec.constraints ?? [],
    exports: (spec.exports ?? []).map((e) => e.name),
    cross_references: spec.cross_references ?? [],
    shadcn: spec.shadcn ?? null,
    detail: `response_format: "detailed" adds ${omitted.join(", ")}`,
  }
}

/** A page pattern of specs/patterns/, as src/context/generate.ts serves it. */
export interface Pattern {
  name: string
  title: string
  kind: "task" | "ui"
  role: string
  usage: string[]
  components: Array<{ component: string }>
  [section: string]: unknown
}

/**
 * A pattern reduced to when and how to use it, and the components to fetch
 * the specs of: enough to plan a screen before calling dsaireadable_get_component_specs.
 */
export function concisePattern(pattern: Pattern) {
  const kept = ["name", "title", "kind", "role", "usage", "components"]
  return {
    name: pattern.name,
    title: pattern.title,
    kind: pattern.kind,
    role: pattern.role,
    usage: pattern.usage,
    components: [...new Set(pattern.components.map((c) => c.component))],
    detail: `response_format: "detailed" adds ${Object.keys(pattern)
      .filter((k) => !kept.includes(k))
      .join(", ")}`,
  }
}

export interface RuleSet {
  general_rules?: Array<{ rule: string; source?: string }>
  component_rules?: Record<string, unknown>
  composition_rules?: unknown[]
  [key: string]: unknown
}

/**
 * The unfiltered answer of dsaireadable_get_design_rules, reduced to the composition rules,
 * the titles of the critical rules and the categories to filter by.
 */
export function conciseRuleSet(data: RuleSet) {
  const foundations = [
    ...new Set(
      (data.general_rules ?? []).map((r) => r.source?.replace(/\.md$/, ""))
    ),
  ].filter(Boolean)
  return {
    critical_rules: criticalRuleTitles(),
    composition_rules: data.composition_rules ?? [],
    categories: {
      foundations,
      components: Object.keys(data.component_rules ?? {}),
    },
    detail:
      'Pass a category (a foundation or a component name) for its rules, "tailwind" for the critical rules, or response_format: "detailed" for every foundation\'s rules and the critical rules whole',
  }
}

/**
 * The unfiltered detailed answer of dsaireadable_get_design_rules: the
 * critical rules whole, every foundation's rules and the composition rules,
 * the rules ds://guidelines holds. A component's rules are the constraints of
 * its spec, which dsaireadable_get_component_specs serves too: all 65 came to
 * 37 K of the 74 K characters Claude Code refused as one result, so they stay
 * one category away.
 */
export function detailedRuleSet(data: RuleSet) {
  const { composition_rules, categories } = conciseRuleSet(data)
  return {
    critical_rules: servedCriticalRules(),
    general_rules: data.general_rules ?? [],
    composition_rules,
    categories,
    detail:
      "A component's rules are the constraints of its spec: pass its name as category for them and the composition rules that cover it",
  }
}

/** The foundations about text: the voice it is written in, the strings a component ships. */
const UX_WRITING_SOURCES = ["voice-and-tone.md", "content.md"]

export function uxWritingRules(data: RuleSet) {
  return {
    rules: (data.general_rules ?? []).filter((r) =>
      UX_WRITING_SOURCES.includes(r.source ?? "")
    ),
  }
}
