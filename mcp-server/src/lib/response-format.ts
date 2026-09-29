/**
 * The `response_format` argument of the three tools whose answers are large:
 * get_component_specs (up to 25 K characters for one spec),
 * get_design_rules and get_ux_writing_rules (about 50 K each without a
 * filter).
 *
 * `concise`, the default, keeps what an agent needs to choose and to stay
 * within the rules, and names what `detailed` would add. The acceptance
 * threshold is ≤ 20 % of the detailed volume, held by src/test.ts.
 */
import { z } from "zod"
import { COMPONENT_RULE } from "./component-rule.js"
import { TAILWIND_RULE } from "./tailwind-rule.js"

export type ResponseFormat = "concise" | "detailed"

export function responseFormat(detailedAdds: string) {
  return z
    .enum(["concise", "detailed"])
    .default("concise")
    .describe(`"concise" (default) or "detailed", which adds ${detailedAdds}`)
}

export const CRITICAL_RULES = [TAILWIND_RULE, COMPONENT_RULE]

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
 * divergences belong in the short answer.
 */
export function conciseSpec(spec: ComponentSpec) {
  const omitted = Object.keys(spec).filter(
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

export interface RuleSet {
  general_rules?: Array<{ rule: string; source?: string }>
  component_rules?: Record<string, unknown>
  composition_rules?: unknown[]
  [key: string]: unknown
}

/**
 * The unfiltered answer of get_design_rules, reduced to the composition rules,
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
      'Pass a category (a foundation or a component name) for its rules, "tailwind" for the critical rules in full, or response_format: "detailed" for every rule',
  }
}

/** The rules about the text a UI renders: those of the content foundation. */
export function conciseUxWriting(data: RuleSet) {
  return {
    rules: (data.general_rules ?? []).filter((r) => r.source === "content.md"),
    detail:
      'response_format: "detailed" returns the whole rule set — foundation rules, component constraints, composition rules — the same rules get_design_rules serves',
  }
}
