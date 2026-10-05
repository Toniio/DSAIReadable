import { z } from "zod"

/**
 * The output schema of every tool. The server validates each answer against
 * its schema before sending it (MCP 2026-07-28, `outputSchema` +
 * `structuredContent`), and a client can too: a field this server starts
 * serving, or stops serving, fails the test suite instead of reaching agents
 * unannounced. Objects are strict for that reason: an undeclared field is an
 * error, not a silent addition.
 */

const strings = z.array(z.string())
const record = z.record(z.string(), z.string())

/**
 * One schema for the answers a tool gives in its different forms (concise or
 * detailed, filtered or not). The protocol wants an object at the root of an
 * output schema; a union compiles to `anyOf`, so the root type is restated.
 */
function forms<const T extends readonly [z.ZodType, z.ZodType, ...z.ZodType[]]>(
  ...schemas: T
) {
  return z.union(schemas).meta({ type: "object" })
}

/** The `{ total, items, next_cursor }` page of a paginated list. */
function page<T extends z.ZodType>(item: T) {
  return z.strictObject({
    total: z.number().int(),
    items: z.array(item),
    next_cursor: z.string().optional(),
  })
}

const compositionRule = z.strictObject({
  id: z.string(),
  rule: z.string(),
  applies_to: strings.optional(),
})

const detail = z
  .string()
  .describe('What response_format: "detailed" adds to this answer')

// --- Design system ---

export const overviewOutput = z.strictObject({
  name: z.string(),
  description: z.string(),
  design_system_version: z.string(),
  mcp_server_version: z.string(),
  framework: z.string(),
  stack: record,
  distribution: z.strictObject({
    model: z.string(),
    registry_source: z.strictObject({
      repository: z.string(),
      registry: z.string(),
      item_address: z.string(),
    }),
    install: z.string(),
    component_location: z.string(),
  }),
  sources: record,
  shadcn_excluded: z.array(
    z.strictObject({
      item: z.string(),
      reason: z.string(),
      instead: z.string().optional(),
    })
  ),
  required_setup: z.strictObject({
    description: z.string(),
    component_import: z.string(),
    utils_import: z.string(),
    css_setup: z.string(),
    explanation: z.string(),
    full_example: z.string(),
  }),
  stats: z.strictObject({
    total_components: z.number().int(),
    spec_coverage: z.string(),
    tokens: z.strictObject({
      semantic: z.number().int(),
      primitive: z.number().int(),
      component: z.number().int(),
      total: z.number().int(),
    }),
    context_files: z.number().int(),
  }),
  categories: strings,
})

export const componentsOutput = page(
  z.strictObject({
    name: z.string(),
    category: z.string(),
    status: z.string(),
    code_path: z.string(),
    sizes: strings,
  })
)

const shadcn = z
  .strictObject({
    item: z.string().nullable(),
    divergences: z.array(
      z.strictObject({
        type: z.string(),
        export: z.string().optional(),
        prop: z.string().optional(),
        value: z.string().optional(),
        upstream: z.string().optional(),
        note: z.string(),
      })
    ),
  })
  .nullable()

const specHead = {
  name: z.string(),
  category: z.string(),
  status: z.string(),
  role: z.string(),
  constraints: strings,
  cross_references: strings,
  shadcn,
}

export const componentSpecOutput = forms(
  z.strictObject({ ...specHead, exports: strings, detail }),
  z.strictObject({
    ...specHead,
    usage: strings,
    exports: z.array(
      z.strictObject({
        name: z.string(),
        summary: z.string(),
        description: z.string(),
      })
    ),
    props: z.array(
      z.strictObject({
        component: z.string(),
        prop: z.string(),
        type: z.string(),
        default: z.string(),
        description: z.string(),
      })
    ),
    accessibility: z.string(),
    code_example: z.string(),
    variants: z.record(
      z.string(),
      z.strictObject({ values: strings, default: z.string().nullable() })
    ),
    sizes: strings,
    composition_rules: z.array(compositionRule),
  })
)

export const tokensOutput = page(
  z.strictObject({
    path: z.string(),
    css_var: z.string(),
    light: z.string(),
    dark: z.string(),
    type: z.string(),
    status: z.string(),
    /** The token to use instead, on a deprecated token that has one. */
    replacement: z.string().optional(),
    usage: z.string(),
  })
)

export const deprecationsOutput = z.strictObject({
  total: z.number().int(),
  tokens: z.array(
    z.strictObject({
      token: z.string(),
      css_var: z.string(),
      tailwind: z.string().nullable(),
      message: z.string(),
      replacement: z
        .strictObject({ token: z.string(), css_var: z.string() })
        .nullable(),
    })
  ),
  exports: z.array(
    z.strictObject({
      name: z.string(),
      import_path: z.string(),
      message: z.string(),
      replacement: z.string().nullable(),
    })
  ),
})

export const changelogOutput = page(
  z.strictObject({
    version: z.string(),
    date: z.string().nullable(),
    category: z.string(),
    text: z.string(),
  })
)

const typeStyle = <T extends z.ZodRawShape>(value: T) =>
  z.array(
    z.strictObject({
      token: z.string(),
      css_variable: z.string(),
      ...value,
      tailwind_class: z.string(),
      usage: z.string(),
    })
  )

export const typographyOutput = z.strictObject({
  font_families: typeStyle({ family: z.string() }),
  type_scale: typeStyle({ rem: z.string(), px: z.string() }),
  line_heights: typeStyle({ value: z.string() }),
  font_weights: typeStyle({ value: z.string() }),
  letter_spacings: typeStyle({ value: z.string() }),
  usage_rules: strings,
})

export const iconsOutput = z.strictObject({
  library: z.string(),
  description: z.string(),
  default_size: z.string(),
  rule: z.string(),
  usage: strings,
  catalog_url: z.string(),
})

// --- Rules ---

const generalRule = z.strictObject({ rule: z.string(), source: z.string() })
const criticalTitle = z.strictObject({
  id: z.string(),
  severity: z.string(),
  title: z.string(),
})
const criticalRule = z.strictObject({
  id: z.string(),
  severity: z.string(),
  title: z.string(),
  description: strings,
  dont: strings.optional(),
  mandatory_mappings: record.optional(),
  page_structure: strings.optional(),
})
const ruleCategories = z.strictObject({
  foundations: strings,
  components: strings,
})

export const designRulesOutput = forms(
  // No category, concise
  z.strictObject({
    critical_rules: z.array(criticalTitle),
    composition_rules: z.array(compositionRule),
    categories: ruleCategories,
    detail: z.string(),
  }),
  // No category, detailed
  z.strictObject({
    critical_rules: z.array(criticalRule),
    general_rules: z.array(generalRule),
    composition_rules: z.array(compositionRule),
    categories: ruleCategories,
    detail: z.string(),
  }),
  // "composition"
  z.strictObject({
    category: z.string(),
    composition_rules: z.array(compositionRule),
  }),
  // "tailwind"
  z.strictObject({ category: z.string(), rules: z.array(criticalRule) }),
  // A foundation or a component
  z.strictObject({
    category: z.string(),
    rules: z.union([z.array(generalRule), strings]),
    composition_rules: z.array(compositionRule),
    critical_rules: z.union([z.array(criticalTitle), z.array(criticalRule)]),
  })
)

export const uxWritingRulesOutput = z.strictObject({
  rules: z.array(generalRule),
})

// --- Patterns ---

export const patternListOutput = z.strictObject({
  total: z.number().int(),
  patterns: z.array(
    z.strictObject({
      name: z.string(),
      title: z.string(),
      kind: z.enum(["task", "ui"]),
      role: z.string(),
    })
  ),
})

const patternHead = {
  name: z.string(),
  title: z.string(),
  kind: z.enum(["task", "ui"]),
  role: z.string(),
  usage: strings,
}

export const patternOutput = forms(
  z.strictObject({ ...patternHead, components: strings, detail }),
  z.strictObject({
    ...patternHead,
    structure: z.array(
      z.strictObject({
        region: z.string(),
        content: z.string(),
        components: z.string(),
      })
    ),
    components: z.array(
      z.strictObject({
        component: z.string(),
        variant_props: z.string(),
        job: z.string(),
      })
    ),
    spacing: strings,
    content: z.array(
      z.strictObject({
        element: z.string().optional(),
        situation: z.string().optional(),
        write: z.string(),
        not: z.string(),
      })
    ),
    code_example: z.string(),
    cross_references: strings,
    source: z.string(),
  })
)

// --- Dataviz ---

const chartSpec = {
  type: z.string(),
  name: z.string(),
  description: z.string(),
  library: z.string(),
  component: z.string(),
  tokens: strings,
  anatomy: strings,
  do: strings,
  dont: strings,
  variants: strings,
}

export const chartSpecOutput = z.strictObject(chartSpec)

export const chartRecommendationOutput = z.strictObject({
  objective: z.string(),
  description: z.string(),
  recommended_charts: z.array(z.strictObject(chartSpec)),
})

// --- Content ---

const glossaryEntry = z.strictObject({
  term: z.string(),
  definition: z.string(),
})

export const glossaryOutput = forms(
  z.strictObject({ terms: z.array(glossaryEntry) }),
  glossaryEntry
)

export const contentLibraryOutput = z.strictObject({
  labels: record.optional(),
  placeholders: record.optional(),
  messages: record.optional(),
})

// --- Admin ---

export const statsOutput = z.strictObject({
  total_components: z.number().int(),
  spec_coverage: z.string(),
  total_tokens: z.strictObject({
    semantic: z.number().int(),
    primitive: z.number().int(),
    component: z.number().int(),
    total: z.number().int(),
  }),
  components_with_variants: z.number().int(),
  components_by_status: z.record(z.string(), z.number().int()),
  components_by_category: z.record(z.string(), z.number().int()),
})

/** Set when a validation report lists only the issues that fit in one answer (src/lib/answer-size.ts). */
const issuesNotListed = z
  .number()
  .int()
  .optional()
  .describe(
    "The issues past the size of one answer: fix the listed ones and validate again"
  )

export const screenReportOutput = z.strictObject({
  total_issues: z.number().int(),
  errors: z.number().int(),
  warnings: z.number().int(),
  info: z.number().int(),
  passed: z.boolean(),
  issues: z.array(
    z.strictObject({
      severity: z.enum(["error", "warning", "info"]),
      rule: z.string(),
      message: z.string(),
      line: z.number().int().optional(),
    })
  ),
  issues_not_listed: issuesNotListed,
})

export const codeReportOutput = z.strictObject({
  total_issues: z.number().int(),
  errors: z.number().int(),
  warnings: z.number().int(),
  passed: z.boolean(),
  issues: z.array(
    z.strictObject({
      source: z.enum(["eslint", "typescript"]),
      severity: z.enum(["error", "warning"]),
      rule: z.string(),
      message: z.string(),
      line: z.number().int(),
      column: z.number().int(),
    })
  ),
  issues_not_listed: issuesNotListed,
})
