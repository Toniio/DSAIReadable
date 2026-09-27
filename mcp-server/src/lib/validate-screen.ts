/**
 * Screen validation rules.
 *
 * Extracted from the `validate_screen` tool so every rule can be exercised
 * directly by the test suite: a rule with no failing fixture is a rule that
 * quietly stops working, and this tool answers "passed" to agents.
 *
 * The checks are textual on purpose — they run on code an agent has just
 * written, which may not parse yet.
 */

export type Severity = "error" | "warning" | "info"

export interface ScreenIssue {
  severity: Severity
  rule: string
  message: string
  line?: number
}

export interface ScreenReport {
  total_issues: number
  errors: number
  warnings: number
  info: number
  passed: boolean
  issues: ScreenIssue[]
}

interface LineRule {
  rule: string
  severity: Severity
  pattern: RegExp
  /** One issue per match rather than one per line. */
  perMatch?: boolean
  skipImports?: boolean
  message: (match: string) => string
}

/** Tailwind's default palette — none of it is part of this design system. */
const TAILWIND_PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"

export const SCREEN_RULES: LineRule[] = [
  {
    rule: "no-raw-colors",
    severity: "error",
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    skipImports: true,
    message: (m) =>
      `Raw hex color ${m} found. Use DS color tokens instead (e.g. text-primary, bg-secondary)`,
  },
  {
    rule: "no-raw-color-functions",
    severity: "error",
    pattern: /\b(?:rgba?|hsla?|oklch|oklab|color-mix)\s*\(/,
    skipImports: true,
    message: (m) =>
      `Raw color function "${m.trim()}" found. Colors come from tokens, which already carry their dark-mode value`,
  },
  {
    rule: "no-default-palette",
    severity: "error",
    pattern: new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|accent|caret|decoration|shadow)-(?:${TAILWIND_PALETTE})-\\d{2,3}\\b`
    ),
    perMatch: true,
    message: (m) =>
      `Tailwind default palette class "${m}" found. It ignores the DS palette and does not switch in dark mode — use a semantic token class (bg-primary, text-muted-foreground…)`,
  },
  {
    rule: "no-arbitrary-values",
    severity: "error",
    pattern:
      /(?:bg|text|border|ring|shadow|p|m|w|h|gap|rounded|opacity)-\[.+?\]/,
    perMatch: true,
    message: (m) =>
      `Arbitrary Tailwind value "${m}" found. Use DS tokens instead`,
  },
  {
    rule: "no-private-tokens",
    severity: "error",
    pattern: /var\(\s*--ds-prim-/,
    message: () =>
      "Private primitive token referenced. Tier 1 is internal to tokens.css — use a semantic token (var(--color-…)) or its Tailwind class",
  },
  {
    rule: "no-media-dark-mode",
    severity: "error",
    pattern: /prefers-color-scheme/,
    message: () =>
      "prefers-color-scheme detected. Dark mode is class-based in this DS (.dark on <html>) — use the `dark:` Tailwind variant",
  },
  {
    rule: "no-inline-styles",
    severity: "warning",
    pattern: /style\s*=\s*\{\{/,
    message: () =>
      "Inline styles detected. Prefer DS tokens and Tailwind utility classes",
  },
  {
    rule: "no-raw-font-sizes",
    severity: "warning",
    pattern: /font-size\s*:\s*\d|fontSize\s*:\s*["']?\d/,
    message: () =>
      "Raw font size found. Use DS typography tokens (text-sm, text-base, text-lg, etc.)",
  },
  {
    rule: "no-raw-spacing",
    severity: "warning",
    pattern: /(?:margin|padding|gap)\s*:\s*\d/,
    message: () =>
      "Raw spacing value found. Use DS spacing tokens (p-2, m-4, gap-3, etc.)",
  },
  {
    rule: "no-raw-radius",
    severity: "warning",
    pattern: /border-radius\s*:\s*\d/,
    message: () =>
      "Raw border-radius found. Use DS radius tokens (rounded-sm, rounded-md, rounded-lg, etc.)",
  },
  {
    rule: "no-raw-duration",
    severity: "warning",
    pattern: /(?:transition-duration|animation-duration)\s*:\s*\d|duration-\[/,
    message: () =>
      "Raw duration found. Use DS motion tokens (duration-fast, duration-normal, duration-slow)",
  },
  {
    rule: "use-ds-components",
    severity: "warning",
    // Case-sensitive on purpose: <input> is an HTML element, <Input> is the DS
    // component. The former rule matched both and flagged compliant screens.
    pattern: /<(?:button|input|select|textarea|table|dialog|a|label)[\s/>]/,
    perMatch: true,
    message: (m) => {
      const tag = m.replace(/[<\s/>]/g, "")
      const hint =
        tag === "label"
          ? "<Label>, or <FieldLabel> inside a <Field>"
          : "<Button>, <Input>, <Select>"
      return `Raw HTML <${tag}> element found. Use the DS component equivalent from @/components/ui/ instead (e.g. ${hint})`
    },
  },
]

const isComment = (line: string) => {
  const t = line.trim()
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")
}

/** Where a UI component may legitimately come from. */
const CANONICAL_UI_IMPORT = "@/components/ui/"

/**
 * Anything that looks like a UI component but comes from somewhere else:
 * a deleted package, a relative path into another project, a bare library.
 * Consumers install this DS into `@/components/ui`, so nothing else resolves.
 */
const FOREIGN_UI_IMPORT =
  /import\s+[^;]*?from\s+["']([^"']*(?:components\/ui|design-system|make-kit|ui-kit)[^"']*)["']/g

export function validateScreen(code: string): ScreenReport {
  const issues: ScreenIssue[] = []
  const lines = code.split("\n")

  lines.forEach((line, i) => {
    if (isComment(line)) return
    const isImport = line.trim().startsWith("import")

    for (const rule of SCREEN_RULES) {
      if (isImport && rule.skipImports) continue
      if (isImport && rule.rule === "use-ds-components") continue

      if (rule.perMatch) {
        const all = line.match(
          new RegExp(
            rule.pattern.source,
            `g${rule.pattern.flags.replace("g", "")}`
          )
        )
        for (const match of all ?? [])
          issues.push({
            severity: rule.severity,
            rule: rule.rule,
            message: rule.message(match),
            line: i + 1,
          })
        continue
      }

      const match = line.match(rule.pattern)
      if (match)
        issues.push({
          severity: rule.severity,
          rule: rule.rule,
          message: rule.message(match[0]),
          line: i + 1,
        })
    }
  })

  // Import origin: a UI component from anywhere but @/components/ui will not
  // resolve in a consumer project, whatever it is named.
  for (const match of code.matchAll(FOREIGN_UI_IMPORT)) {
    const source = match[1]
    if (source.startsWith(CANONICAL_UI_IMPORT)) continue
    issues.push({
      severity: "error",
      rule: "ui-import-origin",
      message: `UI components imported from "${source}". The only valid origin is ${CANONICAL_UI_IMPORT}, where the shadcn registry installs them`,
      line: code.slice(0, match.index ?? 0).split("\n").length,
    })
  }

  const hasUiImports = new RegExp(
    `import\\s+.*from\\s+["']${CANONICAL_UI_IMPORT.replace(/\//g, "\\/")}[^"']+["']`
  ).test(code)

  if (!hasUiImports && code.includes("import")) {
    issues.push({
      severity: "info",
      rule: "ds-imports",
      message:
        "No imports from @/components/ui/ detected. Make sure to use DS components",
    })
  }

  return {
    total_issues: issues.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
    passed: issues.length === 0,
    issues,
  }
}
