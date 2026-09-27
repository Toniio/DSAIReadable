/**
 * The composition rules of design-system.index.json, as get_design_rules
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

/**
 * Rules for a get_design_rules category: every rule for "composition", the
 * rules that cover a component for its name (`Select` → rule-09, rule-20),
 * none otherwise.
 */
export function compositionRulesFor(
  rules: CompositionRule[],
  category: string
): CompositionRule[] {
  const cat = category.toLowerCase()
  if (ALL.has(cat)) return rules
  return rules.filter(
    (r) =>
      r.applies_to?.some((c) => c.toLowerCase() === cat) ||
      new RegExp(
        `\\b${cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      ).test(r.rule)
  )
}
