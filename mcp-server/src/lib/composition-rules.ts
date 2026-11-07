/**
 * The composition rules of design-system.index.json, as dsaireadable_get_design_rules
 * serves them.
 *
 * Until they were served here, no MCP agent saw them: the context cache
 * carried only rule-05, copied into icons.json. A rule names the components
 * it covers in `applies_to` when it is about choosing between them.
 */

export interface CompositionRule {
  id: string
  rule: string
  applies_to?: string[]
}

const ALL = new Set(["composition", "composition_rules", "rules"])

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Rules for a dsaireadable_get_design_rules category: every rule for
 * "composition"; for a component, found by its name in `components` in any
 * case, the rules about it (`Select` → rule-09, rule-20); for a foundation,
 * the rules whose text names it in any case (`spacing` → rule-12).
 *
 * A rule is about a component when its `applies_to` lists it, or, without
 * `applies_to`, when its text names the component in its case. Matched in any
 * case, Button got rule-13 for data-slot='button' and Message got rule-09
 * for "an error message"; rule-21 names Sidebar only to explain a Sheet.
 */
export function compositionRulesFor(
  rules: CompositionRule[],
  category: string,
  components: string[]
): CompositionRule[] {
  const cat = category.toLowerCase()
  if (ALL.has(cat)) return rules
  const component = components.find((name) => name.toLowerCase() === cat)
  if (component) {
    const named = new RegExp(`\\b${escapeRegExp(component)}\\b`)
    return rules.filter((r) =>
      r.applies_to ? r.applies_to.includes(component) : named.test(r.rule)
    )
  }
  const named = new RegExp(`\\b${escapeRegExp(cat)}\\b`, "i")
  return rules.filter(
    (r) =>
      r.applies_to?.some((c) => c.toLowerCase() === cat) || named.test(r.rule)
  )
}
