#!/usr/bin/env tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerDsCoreTools } from "./tools/ds-core.js"
import { registerDatavizTools } from "./tools/dataviz.js"
import { registerUxWritingTools } from "./tools/ux-writing.js"
import { registerAdminTools } from "./tools/admin.js"
import { registerPrompts } from "./prompts/index.js"
import {
  validateScreen,
  SCREEN_RULES,
  SCREEN_WIDE_RULES,
} from "./lib/validate-screen.js"
import {
  compositionRulesFor,
  type CompositionRule,
} from "./lib/composition-rules.js"
import { TAILWIND_RULE } from "./lib/tailwind-rule.js"
import { COMPONENT_RULE } from "./lib/component-rule.js"
import { registerResources } from "./resources/index.js"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
} from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { tmpdir } from "node:os"
import { setContextDir, contextDir as servedContextDir } from "./lib/context.js"
import { createServer as createNetServer } from "node:net"

const __dirname = dirname(fileURLToPath(import.meta.url))
const contextDir = resolve(__dirname, "../context")

let passed = 0
let failed = 0

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    console.error(`  ❌ ${label}`)
    failed++
  }
}

console.log("🧪 DSAIReadable MCP Server — Test Suite\n")

// --- Test 1: Server creation ---
console.log("1. Server creation")
const server = new McpServer({
  name: "DSAIReadable-test",
  version: "1.0.0",
})
assert(server !== null, "McpServer instantiated")

// --- Test 2: Tool registration ---
console.log("\n2. Tool registration")
try {
  registerDsCoreTools(server)
  assert(true, "DS Core tools registered (9 tools)")
} catch (e) {
  assert(false, `DS Core tools registration failed: ${e}`)
}

try {
  registerDatavizTools(server)
  assert(true, "Dataviz tools registered (2 tools)")
} catch (e) {
  assert(false, `Dataviz tools registration failed: ${e}`)
}

try {
  registerUxWritingTools(server)
  assert(true, "UX Writing tools registered (3 tools)")
} catch (e) {
  assert(false, `UX Writing tools registration failed: ${e}`)
}

try {
  registerAdminTools(server)
  assert(true, "Admin tools registered (2 tools)")
} catch (e) {
  assert(false, `Admin tools registration failed: ${e}`)
}

// --- Test 3: Prompt registration ---
console.log("\n3. Prompt registration")
try {
  registerPrompts(server)
  assert(true, "All 5 prompts registered")
} catch (e) {
  assert(false, `Prompt registration failed: ${e}`)
}

// --- Test 4: Context files ---
console.log("\n4. Context files")
const expectedFiles = [
  "components.json",
  "component-specs.json",
  "component-variants.json",
  "variables.json",
  "semantic-tokens.json",
  "layout-tokens.json",
  "primitives.json",
  "text-styles.json",
  "icons.json",
  "ux-writing.json",
  "glossary.json",
  "content-library.json",
  "dataviz-decision-tree.json",
  "dataviz-catalog.json",
  "page-patterns.json",
  "ds-metadata.json",
]

assert(existsSync(contextDir), `Context directory exists: ${contextDir}`)

if (existsSync(contextDir)) {
  const files = readdirSync(contextDir)
  console.log(`  📂 Found ${files.length} files in context/`)

  for (const expected of expectedFiles) {
    const exists = files.includes(expected)
    if (exists) {
      assert(true, `${expected} found`)
    } else {
      console.log(`  ⚠️  ${expected} not found (may be generating in parallel)`)
    }
  }
} else {
  console.log(
    "  ⚠️  Context directory not found — files may be generating in parallel"
  )
}

// --- Test 5: cva variant extraction (non-regression) ---
// Guards against the regex parser that used to leak Tailwind modifiers
// (`hover:`, `dark:`, `aria-expanded:`) into the variant values served to agents.
console.log("\n5. cva variant extraction")
const variantsPath = resolve(contextDir, "component-variants.json")

if (!existsSync(variantsPath)) {
  assert(
    false,
    "component-variants.json is missing — run `npm run generate-context`"
  )
} else {
  const variants = JSON.parse(readFileSync(variantsPath, "utf-8")) as Record<
    string,
    {
      variants: Record<string, { values: string[]; default: string | null }>
      has_variants: boolean
    }
  >

  const expectations: Record<
    string,
    Record<string, { values: string[]; default: string }>
  > = {
    Button: {
      variant: {
        values: [
          "default",
          "outline",
          "secondary",
          "ghost",
          "destructive",
          "link",
        ],
        default: "default",
      },
      size: {
        values: [
          "default",
          "xs",
          "sm",
          "lg",
          "icon",
          "icon-xs",
          "icon-sm",
          "icon-lg",
        ],
        default: "default",
      },
    },
    Badge: {
      variant: {
        values: [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link",
        ],
        default: "default",
      },
    },
    Alert: {
      variant: { values: ["default", "destructive"], default: "default" },
    },
    // Sub-components own their cva, and their values are theirs alone. These
    // three used to be folded into Item, Empty and Tabs, which advertised
    // variants they do not accept and hid the components that do.
    ItemMedia: {
      variant: { values: ["default", "icon", "image"], default: "default" },
    },
    EmptyMedia: {
      variant: { values: ["default", "icon"], default: "default" },
    },
    TabsList: {
      variant: { values: ["default", "line"], default: "default" },
    },
  }

  for (const [component, groups] of Object.entries(expectations)) {
    for (const [group, expected] of Object.entries(groups)) {
      const actual = variants[component]?.variants?.[group]
      const ok =
        actual !== undefined &&
        JSON.stringify(actual.values) === JSON.stringify(expected.values) &&
        actual.default === expected.default
      assert(
        ok,
        ok
          ? `${component}.${group} = ${expected.values.join("|")}`
          : `${component}.${group} mismatch — expected [${expected.values.join(", ")}] (default ${expected.default}), got ${JSON.stringify(actual)}`
      )
    }
  }

  // No Tailwind modifier may ever appear as a variant value.
  const forbidden = new Set([
    "hover",
    "focus",
    "focus-visible",
    "active",
    "dark",
    "disabled",
    "group-hover",
    "aria-expanded",
    "data-state",
  ])
  const leaked: string[] = []
  for (const [component, entry] of Object.entries(variants)) {
    for (const [group, def] of Object.entries(entry.variants ?? {})) {
      for (const value of def.values) {
        if (forbidden.has(value) || value.startsWith("_")) {
          leaked.push(`${component}.${group}="${value}"`)
        }
      }
    }
  }
  assert(
    leaked.length === 0,
    leaked.length === 0
      ? "No Tailwind modifier leaked into variant values"
      : `Tailwind modifiers leaked into variants: ${leaked.join(", ")}`
  )

  // A parent must not advertise a sub-component's values. This is the union
  // bug: `<Item variant="icon">` compiles, renders nothing special, and the
  // agent has no way to discover the mistake.
  const bleed: string[] = []
  for (const [parent, child] of [
    ["Item", "ItemMedia"],
    ["Empty", "EmptyMedia"],
    ["Tabs", "TabsList"],
    ["InputGroup", "InputGroupButton"],
    ["Sidebar", "SidebarMenuButton"],
  ]) {
    const parentValues = new Set(
      Object.values(variants[parent]?.variants ?? {}).flatMap((g) => g.values)
    )
    for (const [group, def] of Object.entries(
      variants[child]?.variants ?? {}
    )) {
      const own = def.values.filter(
        (v) => v !== "default" && parentValues.has(v)
      )
      if (own.length > 0)
        bleed.push(`${parent} advertises ${child}.${group}=${own.join("|")}`)
    }
  }
  assert(
    bleed.length === 0,
    bleed.length === 0
      ? "No sub-component variant bleeds into its parent"
      : bleed.join("; ")
  )

  // Sub-components must be reachable by their own name.
  const missingParts = [
    "ItemMedia",
    "EmptyMedia",
    "TabsList",
    "InputGroupAddon",
    "InputGroupButton",
    "SidebarMenuButton",
  ].filter((n) => variants[n] === undefined)
  assert(
    missingParts.length === 0,
    missingParts.length === 0
      ? "Every sub-component has its own entry"
      : `Sub-components missing from the context: ${missingParts.join(", ")}`
  )

  // Every component must be present, so agents get an explicit answer
  // instead of a lookup error.
  assert(
    Object.keys(variants).length >= 59,
    `All components emitted (${Object.keys(variants).length} entries)`
  )
}

// --- Test 5b: borrowed variant axes (non-regression) ---
// The cva() parser only sees calls in the file itself: ToggleGroup, typed
// `VariantProps<typeof toggleVariants>`, and Calendar, whose `buttonVariant`
// is typed as Button's `variant`, used to be served with no variants at all.
console.log("\n5b. Borrowed variant axes")
{
  const borrowed = JSON.parse(
    readFileSync(resolve(contextDir, "component-variants.json"), "utf-8")
  ) as Record<
    string,
    {
      variants: Record<string, { values: string[]; default: string | null }>
    }
  >
  const tg = borrowed.ToggleGroup?.variants ?? {}
  assert(
    tg.variant?.values.join() === "default,outline" &&
      tg.size?.values.join() === "default,sm,lg",
    "ToggleGroup borrows Toggle's variant and size axes"
  )
  const cal = borrowed.Calendar?.variants.buttonVariant
  assert(
    cal?.values.includes("ghost") === true && cal.default === "ghost",
    "Calendar's buttonVariant takes Button's variants, default ghost"
  )
}

// --- Test 5c: spec sections read to their real end (non-regression) ---
// mdSection ended sections on `\Z`, which JavaScript reads as a literal "Z":
// the last section of every spec (Cross-references) was never found, and a
// section stopped at its first capital Z (ScrollArea's role, then "Zone …").
console.log("\n5c. Spec sections read to their end")
{
  const specs = JSON.parse(
    readFileSync(resolve(contextDir, "component-specs.json"), "utf-8")
  ) as Record<string, { role: string; cross_references: unknown[] }>
  const withRefs = Object.values(specs).filter(
    (s) => s.cross_references.length > 0
  ).length
  assert(
    withRefs === Object.keys(specs).length,
    `Every spec serves its cross-references (${withRefs}/${Object.keys(specs).length})`
  )
  // Each served role must equal the section as written, whatever letters it
  // holds: read here with a plain split, independent of mdSection.
  const truncated = Object.keys(specs).filter((name) => {
    const md = readFileSync(
      resolve(contextDir, `../../specs/components/${name}.md`),
      "utf-8"
    )
    const written = md.split("\n## Role\n")[1]?.split("\n## ")[0].trim()
    return specs[name].role !== written
  })
  assert(
    truncated.length === 0,
    `Every role is served in full, as written (${truncated.join(", ") || "none truncated"})`
  )
  const rules = (
    JSON.parse(
      readFileSync(resolve(contextDir, "ux-writing.json"), "utf-8")
    ) as { general_rules: Array<{ rule: string; source: string }> }
  ).general_rules
  const keys = rules.map((r) => `${r.source}|${r.rule}`)
  assert(
    new Set(keys).size === keys.length,
    `No UX rule is served twice (${keys.length - new Set(keys).size} duplicates)`
  )
}

// --- Test 5d: accessibility reaches agents ---
console.log("\n5d. Spec accessibility section")
{
  const specs = JSON.parse(
    readFileSync(resolve(contextDir, "component-specs.json"), "utf-8")
  ) as Record<string, { accessibility?: string }>
  const withA11y = Object.values(specs).filter((s) =>
    /\*\*Pattern\*\*:[\s\S]*\*\*Keyboard\*\*:[\s\S]*\*\*Accessible name\*\*:[\s\S]*\*\*Pitfalls\*\*:/.test(
      s.accessibility ?? ""
    )
  ).length
  assert(
    withA11y === Object.keys(specs).length,
    `Every spec serves its full accessibility section (${withA11y}/${Object.keys(specs).length})`
  )
  assert(
    specs.Button?.accessibility?.includes("aria-label") === true,
    "Button's section states the icon-only aria-label requirement"
  )
}

// --- Test 6: validate_screen rules ---
// One failing fixture per rule. Without them a rule can rot silently and the
// tool answers "passed" to an agent that is about to ship a violation.
console.log("\n6. validate_screen rules")

const NEGATIVE_FIXTURES: Array<{ rule: string; label: string; code: string }> =
  [
    {
      rule: "no-raw-colors",
      label: "hex color",
      code: `export const C = () => <div className="p-4" style={{ color: "#ff0000" }} />`,
    },
    {
      rule: "no-raw-color-functions",
      label: "rgb() / oklch() / color-mix()",
      code: `const bg = "oklch(0.7 0.1 250)"\nconst border = "rgba(0, 0, 0, 0.2)"`,
    },
    {
      rule: "no-default-palette",
      label: "Tailwind default palette class",
      code: `export const C = () => <div className="bg-violet-600 text-slate-50" />`,
    },
    {
      rule: "no-arbitrary-values",
      label: "arbitrary Tailwind value",
      code: `export const C = () => <div className="p-[13px]" />`,
    },
    {
      rule: "no-private-tokens",
      label: "private primitive token",
      code: `export const C = () => <div style={{ borderRadius: "var(--ds-prim-radius-base)" }} />`,
    },
    {
      rule: "no-media-dark-mode",
      label: "prefers-color-scheme",
      code: `const css = "@media (prefers-color-scheme: dark) { body { background: black } }"`,
    },
    {
      rule: "no-inline-styles",
      label: "inline style object",
      code: `export const C = () => <div style={{ display: "flex" }} />`,
    },
    {
      rule: "no-raw-font-sizes",
      label: "raw font size",
      code: `const s = { fontSize: 14 }`,
    },
    {
      rule: "no-raw-spacing",
      label: "raw spacing",
      code: `const s = "padding: 12px"`,
    },
    {
      rule: "no-raw-radius",
      label: "raw border-radius",
      code: `const s = "border-radius: 8px"`,
    },
    {
      rule: "no-raw-duration",
      label: "raw duration",
      code: `export const C = () => <div className="duration-[350ms]" />`,
    },
    {
      rule: "use-ds-components",
      label: "native <label>",
      code: `export const C = () => <label htmlFor="x">Name</label>`,
    },
    {
      rule: "ui-import-origin",
      label: "UI import from a foreign origin",
      code: `import { Button } from "@dsaireadable/make-kit/components/ui/button"`,
    },
    {
      rule: "ds-imports",
      label: "a screen that imports nothing from @/components/ui",
      code: `import { useState } from "react"
export const C = () => <div>{useState(0)[0]}</div>`,
    },
  ]

const declaredRules = new Set([
  ...SCREEN_RULES.map((r) => r.rule),
  ...SCREEN_WIDE_RULES,
])
const coveredRules = new Set(NEGATIVE_FIXTURES.map((f) => f.rule))

for (const fixture of NEGATIVE_FIXTURES) {
  const report = validateScreen(fixture.code)
  const caught = report.issues.some((i) => i.rule === fixture.rule)
  assert(
    caught,
    caught
      ? `${fixture.rule} flags ${fixture.label}`
      : `${fixture.rule} MISSED ${fixture.label} — got [${report.issues.map((i) => i.rule).join(", ") || "nothing"}]`
  )
}

// A rule with no fixture is a rule nothing protects.
const uncovered = [...declaredRules].filter((r) => !coveredRules.has(r))
assert(
  uncovered.length === 0,
  uncovered.length === 0
    ? `Every rule has a failing fixture (${declaredRules.size} rules)`
    : `Rules without a negative fixture: ${uncovered.join(", ")}`
)

// The positive fixture must stay clean, or the rules are unusable in practice.
const CLEAN_SCREEN = `import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignInScreen() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="gap-2">
        <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" aria-invalid={false} />
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
        <Button className="w-full transition-colors duration-normal">
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}`

const cleanReport = validateScreen(CLEAN_SCREEN)
assert(
  cleanReport.passed,
  cleanReport.passed
    ? "Compliant screen passes with zero issues"
    : `Compliant screen wrongly flagged: ${cleanReport.issues
        .map((i) => `${i.rule}@${i.line}`)
        .join(", ")}`
)

// --- Test 7: spec table parsing (non-regression) ---
// Guards against the table parser that only skipped a section's first two
// lines: every later table leaked its header and delimiter rows into `props`,
// and an escaped `\|` in a union type split the row and shifted its columns.
console.log("\n7. Spec table parsing")
type PropRow = Record<"component" | "prop" | "type" | "default", string>
const specs = JSON.parse(
  readFileSync(resolve(contextDir, "component-specs.json"), "utf-8")
) as Record<string, { props: PropRow[] }>
const allProps = Object.values(specs).flatMap((s) => s.props)

const leaked = allProps.filter(
  (p) =>
    /^:?-+:?$/.test(p.prop) ||
    ["prop", "property", "hook"].includes(p.prop.toLowerCase())
)
assert(
  leaked.length === 0,
  `No table header or delimiter row served as a prop (${leaked.length} found)`
)

const split = allProps.filter((p) =>
  [p.prop, p.type, p.default].some((c) => c.endsWith("\\"))
)
assert(
  split.length === 0,
  `No row split on an escaped \\| (${split.length} found)`
)

const accordionType = specs.Accordion?.props.find((p) => p.prop === "`type`")
assert(
  accordionType?.type === '`"single" | "multiple"`' &&
    accordionType.default === "—",
  "Union type kept whole, columns in place (Accordion `type`)"
)

assert(
  specs.Card?.props.some((p) => p.component === "CardHeader") === true &&
    allProps.every((p) => p.component !== ""),
  "Every prop names its sub-component (CardHeader found in Card)"
)

assert(
  specs.Logo?.props.every(
    (p) => !["`sm`", "`default`", "`lg`"].includes(p.prop)
  ) === true,
  "A mapping table (Logo size → classes) is not served as props"
)

// Tokens is generated (scripts/build-spec-tokens.ts) with columns
// Token | Classes and variables | Where. Read by position, the old parser served
// the class list as the token's "usage" and dropped where it is used.
type TokenRow = { token: string; classes: string[]; where: string[] }
const tokenSpecs = specs as unknown as Record<
  string,
  { tokens: TokenRow[]; tokens_from: string[] }
>
const buttonPrimary = tokenSpecs.Button?.tokens.find(
  (t) => t.token === "color.action.background.default"
)
assert(
  buttonPrimary?.classes.includes("bg-primary") === true &&
    buttonPrimary.where.includes("buttonVariants.variant.default"),
  "Token rows read by header: token, classes and where (Button primary)"
)
assert(
  Object.values(tokenSpecs).every((s) =>
    s.tokens.every((t) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(t.token))
  ),
  "Every served token is a bare DTCG path (no backticks, no header row)"
)
assert(
  tokenSpecs.Pagination?.tokens.length === 0 &&
    tokenSpecs.Pagination.tokens_from.includes("Button"),
  "A component with no token of its own points to the specs it composes"
)

// Props / API is generated (scripts/build-spec-api.ts): one `### \`Export\``
// block per runtime export, opening with what it renders or returns.
const apiSpecs = specs as unknown as Record<
  string,
  { exports: { name: string; summary: string }[]; props: PropRow[] }
>
const sidebarExports = apiSpecs.Sidebar?.exports ?? []
assert(
  sidebarExports.some(
    (e) => e.name === "useSidebar()" && e.summary.startsWith("Returns ")
  ) &&
    sidebarExports.some(
      (e) => e.name === "SidebarMenuAction" && e.summary.startsWith("Renders ")
    ),
  "Every export is served with its summary (Sidebar: a hook and a component)"
)
assert(
  apiSpecs.Sidebar?.props.some(
    (p) => p.component === "SidebarMenuAction" && p.prop === "`showOnHover`"
  ) === true,
  "A prop is filed under its own export (SidebarMenuAction.showOnHover)"
)

// Composition rules (design-system.index.json) reach MCP agents through
// get_design_rules. Before, the context cache carried rule-05 alone.
const indexRules = (
  JSON.parse(
    readFileSync(resolve(__dirname, "../../design-system.index.json"), "utf-8")
  ) as { composition_rules: CompositionRule[] }
).composition_rules
const servedRules =
  (
    JSON.parse(
      readFileSync(resolve(contextDir, "ux-writing.json"), "utf-8")
    ) as { composition_rules?: CompositionRule[] }
  ).composition_rules ?? []
assert(
  servedRules.length === indexRules.length &&
    servedRules.every(
      (r, i) => r.id === indexRules[i].id && r.rule === indexRules[i].rule
    ),
  `Every composition rule is served as written in the index (${indexRules.length})`
)
const forSelect = compositionRulesFor(servedRules, "Select").map((r) => r.id)
assert(
  forSelect.includes("rule-09") && forSelect.includes("rule-20"),
  "A component name gets the rules that cover it (Select: rule-09, rule-20)"
)
assert(
  compositionRulesFor(servedRules, "composition").length ===
    indexRules.length &&
    compositionRulesFor(servedRules, "Heading").every(
      (r) => !r.applies_to || r.applies_to.includes("Heading")
    ),
  '"composition" gets every rule; a component gets only rules that cover it'
)

// The styling rule served with every get_design_rules answer: each link of
// its token chain must be the one styles/globals.css declares, and it quotes no
// value — values drift, get_tokens serves them from the tokens.
const bridge = new Map(
  [
    ...readFileSync(
      resolve(__dirname, "../../styles/globals.css"),
      "utf-8"
    ).matchAll(/^\s*(--color-[\w-]+):\s*var\((--[\w-]+)\);/gm),
  ].map((m) => [m[1], m[2]])
)
const semanticVars = new Set(
  (
    JSON.parse(
      readFileSync(resolve(contextDir, "semantic-tokens.json"), "utf-8")
    ) as { css_var: string }[]
  ).map((t) => t.css_var)
)
const brokenLinks = Object.entries(
  TAILWIND_RULE.token_chain_explanation.mapping
).filter(([, chain]) => {
  const [theme, semantic] = chain.split(" → ")
  return bridge.get(theme) !== semantic || !semanticVars.has(semantic)
})
assert(
  brokenLinks.length === 0,
  `Every token chain of the styling rule matches styles/globals.css (${brokenLinks.map(([c]) => c).join(", ") || "all"})`
)
const ruleText = JSON.stringify(TAILWIND_RULE)
assert(
  !ruleText.includes("theme.css") &&
    !/#[0-9a-f]{6}\b/i.test(
      JSON.stringify(TAILWIND_RULE.token_chain_explanation)
    ),
  "The styling rule names styles/globals.css as the bridge and quotes no hex value"
)

const uxRules = (
  JSON.parse(readFileSync(resolve(contextDir, "ux-writing.json"), "utf-8")) as {
    general_rules: Array<{ rule: string }>
  }
).general_rules
assert(
  uxRules.every((r) => !r.rule.includes("|")),
  "No table header served as a UX writing rule"
)

// --- Test 7b: the served context says what the sources say (P3-21) ---
console.log("\n7b. Served context exactness")
const readContext = <T>(file: string): T =>
  JSON.parse(readFileSync(resolve(contextDir, file), "utf-8")) as T

// Five foundations number their rules: a bullet-only parser served none.
const foundations = readdirSync(resolve(__dirname, "../../specs/foundations"))
  .filter((f) => f.endsWith(".md"))
  .sort()
const generalRules = readContext<{
  general_rules: Array<{ rule: string; source: string }>
}>("ux-writing.json").general_rules
const ruleSources = new Set(generalRules.map((r) => r.source))
const ruleless = foundations.filter((f) => !ruleSources.has(f))
assert(
  foundations.length === 11 && ruleless.length === 0,
  `Every foundation serves its rules (${foundations.length - ruleless.length}/${foundations.length}${ruleless.length ? `; none for ${ruleless.join(", ")}` : ""})`
)

// A numbered rule wrapped over several lines is served whole, and the
// paragraph or table nested under an item is not part of it.
const layoutRules = readContext<{ spacing_rules: string[] }>(
  "layout-tokens.json"
).spacing_rules
const focusRule = generalRules.find(
  (r) =>
    r.source === "focus.md" &&
    r.rule.startsWith("**Never hard-code a ring width")
)
assert(
  layoutRules.length === 5 &&
    focusRule?.rule.endsWith("`aria-invalid` prefix.") === true &&
    generalRules.every((r) => !r.rule.includes("| Mechanism")),
  "A wrapped numbered rule is served whole, without what is nested under it"
)

// get_typography serves values an agent copies: no Markdown around them.
// Its usage_rules are prose, whose inline code stays, as in every rule.
const typeTables = {
  ...readContext<Record<string, unknown>>("text-styles.json"),
  usage_rules: undefined,
}
const markedCells = JSON.stringify(typeTables).match(/`|\*\*/g)
assert(
  markedCells === null,
  `get_typography serves plain values (${markedCells?.length ?? 0} Markdown markers)`
)

// The component tier is the shadcn alias layer: its variables are the names
// tokens.css declares (--background), not --shadcn-background.
const declaredVars = new Set(
  [
    ...readFileSync(resolve(__dirname, "../../tokens.css"), "utf-8").matchAll(
      /^\s*(--[\w-]+):/gm
    ),
  ].map((m) => m[1])
)
const componentVars = readContext<
  Array<{ path: string; css_variable: string; tier: string }>
>("variables.json").filter((v) => v.tier === "component")
const undeclared = componentVars.filter(
  (v) =>
    !declaredVars.has(v.css_variable) || v.path.startsWith("shadcn.shadcn.")
)
assert(
  componentVars.length > 0 && undeclared.length === 0,
  `Every component-tier variable is the one tokens.css declares (${componentVars.length}${undeclared.length ? `; wrong: ${undeclared.map((v) => v.css_variable).join(", ")}` : ""})`
)

// --- Test 8: annotations, resources, response_format, pagination (P3-06) ---
// Called through a real client, as an agent calls them.
console.log("\n8. Annotations, resources, response_format, pagination")

const live = new McpServer({ name: "DSAIReadable-live", version: "1.0.0" })
registerDsCoreTools(live)
registerDatavizTools(live)
registerUxWritingTools(live)
registerAdminTools(live)
registerResources(live)
const client = new Client({
  name: "DSAIReadable-test-client",
  version: "1.0.0",
})
const [serverSide, clientSide] = InMemoryTransport.createLinkedPair()
await Promise.all([live.connect(serverSide), client.connect(clientSide)])

type ToolText = { content: { text: string }[]; isError?: boolean }
async function call(name: string, args: Record<string, unknown> = {}) {
  return (await client.callTool({ name, arguments: args })) as ToolText
}
const payload = async (name: string, args: Record<string, unknown> = {}) =>
  (await call(name, args)).content[0].text

// Without annotations, the MCP defaults describe a tool as destructive and
// open-world: a client may then ask the user to confirm every call.
const { tools } = await client.listTools()
const unannotated = tools.filter(
  (t) =>
    t.annotations?.readOnlyHint !== true ||
    t.annotations?.openWorldHint !== false
)
assert(
  tools.length === 16 && unannotated.length === 0,
  `Every tool is annotated read-only and closed-world (${tools.length} tools${unannotated.length ? `; missing: ${unannotated.map((t) => t.name).join(", ")}` : ""})`
)

const specNames = Object.keys(specs)
const fullSpecs = specs as unknown as Record<
  string,
  { constraints: string[]; accessibility: string }
>
const { resources } = await client.listResources()
const { resourceTemplates } = await client.listResourceTemplates()
const templates = resourceTemplates.map((t) => t.uriTemplate)
assert(
  templates.includes("ds://component/{name}/spec") &&
    templates.includes("ds://token/{path}") &&
    resources.some((r) => r.uri === "ds://guidelines") &&
    specNames.every((n) =>
      resources.some((r) => r.uri === `ds://component/${n}/spec`)
    ),
  `Resources: 2 templates, ds://guidelines and the ${specNames.length} component specs listed`
)

const read = async (uri: string) =>
  JSON.parse(
    ((await client.readResource({ uri })).contents[0] as { text: string }).text
  )
assert(
  JSON.stringify(await read("ds://component/Button/spec")) ===
    JSON.stringify(specs.Button),
  "ds://component/Button/spec serves the full spec"
)
assert(
  (await read("ds://token/color.background.default")).css_var ===
    "--color-background-default",
  "ds://token/{path} serves a token by its dotted path"
)
const guidelines = await read("ds://guidelines")
assert(
  guidelines.composition_rules.length === indexRules.length &&
    guidelines.critical_rules.some(
      (r: { id: string }) => r.id === "tailwind-tokens"
    ),
  "ds://guidelines serves the critical and the composition rules"
)
let unknownRefused = false
try {
  await read("ds://component/NoSuchThing/spec")
} catch (e) {
  unknownRefused = String(e).includes("NoSuchThing")
}
assert(unknownRefused, "An unknown component is refused, and named")

const completion = async (uri: string, name: string, value: string) =>
  (
    await client.complete({
      ref: { type: "ref/resource", uri },
      argument: { name, value },
    })
  ).completion.values
assert(
  JSON.stringify(
    await completion("ds://component/{name}/spec", "name", "dia")
  ) === JSON.stringify(["Dialog"]) &&
    (await completion("ds://token/{path}", "path", "color.background.")).every(
      (p) => p.startsWith("color.background.")
    ),
  "Completion finds a component name and a token path by prefix"
)

// concise is the default and stays ≤ 20 % of detailed: summed over every
// spec for get_component_specs, unfiltered for the two rule tools.
let conciseTotal = 0
let detailedTotal = 0
for (const name of specNames) {
  conciseTotal += (
    await payload("get_component_specs", { component_name: name })
  ).length
  detailedTotal += (
    await payload("get_component_specs", {
      component_name: name,
      response_format: "detailed",
    })
  ).length
}
const ratios = {
  get_component_specs: conciseTotal / detailedTotal,
  get_design_rules:
    (await payload("get_design_rules")).length /
    (await payload("get_design_rules", { response_format: "detailed" })).length,
  get_ux_writing_rules:
    (await payload("get_ux_writing_rules")).length /
    (await payload("get_ux_writing_rules", { response_format: "detailed" }))
      .length,
}
for (const [tool, ratio] of Object.entries(ratios)) {
  assert(
    ratio <= 0.2,
    `${tool}: concise is ${Math.round(ratio * 100)} % of detailed (≤ 20 %)`
  )
}
const conciseButton = JSON.parse(
  await payload("get_component_specs", { component_name: "Button" })
)
assert(
  JSON.stringify(conciseButton.constraints) ===
    JSON.stringify(fullSpecs.Button.constraints) &&
    conciseButton.props === undefined &&
    conciseButton.detail.includes("props"),
  "concise keeps every constraint and names what detailed adds"
)
assert(
  JSON.parse(
    await payload("get_component_specs", {
      component_name: "Button",
      response_format: "detailed",
    })
  ).accessibility === fullSpecs.Button.accessibility,
  "detailed serves the spec whole"
)

// Pagination: pages of a list are disjoint and add up to the whole list.
const tokenPaths: string[] = []
let cursor: string | undefined
let pages = 0
let total = 0
do {
  const page = JSON.parse(
    await payload("get_tokens", { limit: 50, ...(cursor ? { cursor } : {}) })
  ) as { total: number; items: { path: string }[]; next_cursor?: string }
  tokenPaths.push(...(page.items ?? []).map((t) => t.path))
  total = page.total
  cursor = page.next_cursor
  pages++
} while (cursor && pages < 20)
assert(
  pages === Math.ceil(total / 50) &&
    tokenPaths.length === total &&
    new Set(tokenPaths).size === total,
  `get_tokens pages cover the ${total} tokens once each (${pages} pages of 50)`
)
const components = JSON.parse(await payload("get_components"))
assert(
  components.total === specNames.length &&
    components.items.length === specNames.length &&
    components.next_cursor === undefined,
  `get_components fits the ${specNames.length} components in one default page`
)
const badCursor = await call("get_tokens", { cursor: "not-a-cursor" })
assert(
  badCursor.isError === true &&
    badCursor.content[0].text.includes("next_cursor"),
  "A cursor the server did not issue is an error that says what to pass"
)

await client.close()

// --- Test 9: prompts (P3-07) ---
// build_screen used to mandate 9 calls, specs and variants included, before
// any code: the protocol an agent is likely to drop. It now asks for 4 calls
// plus one per retained component, and ends with validate_screen.
console.log("\n9. Prompts")

const promptServer = new McpServer({
  name: "DSAIReadable-prompts",
  version: "1.0.0",
})
registerDsCoreTools(promptServer)
registerDatavizTools(promptServer)
registerUxWritingTools(promptServer)
registerAdminTools(promptServer)
registerPrompts(promptServer)
const promptClient = new Client({
  name: "DSAIReadable-test-client",
  version: "1.0.0",
})
const [promptServerSide, promptClientSide] =
  InMemoryTransport.createLinkedPair()
await Promise.all([
  promptServer.connect(promptServerSide),
  promptClient.connect(promptClientSide),
])

const PROMPT_ARGS: Record<string, Record<string, string>> = {
  build_screen: { task: "A sign-in form", device: "desktop", mode: "light" },
  revise_design: { target: "Button", change: "Change the label" },
  generate_idea: { experience: "dashboard" },
  suggest_next_steps: { current_screen: "A sign-in form" },
  showcase_components: { category: "Forms", device: "desktop" },
}
const promptText = async (name: string) =>
  (
    (await promptClient.getPrompt({ name, arguments: PROMPT_ARGS[name] }))
      .messages[0].content as { text: string }
  ).text

const toolNames = new Set(
  (await promptClient.listTools()).tools.map((t) => t.name)
)
const { prompts } = await promptClient.listPrompts()
const unknownTools: string[] = []
for (const { name } of prompts) {
  for (const [, tool] of (await promptText(name)).matchAll(
    /`((?:get|validate)_[a-z_]+)`/g
  )) {
    if (!toolNames.has(tool)) unknownTools.push(`${name} → ${tool}`)
  }
}
assert(
  prompts.length === Object.keys(PROMPT_ARGS).length &&
    unknownTools.length === 0,
  `Every tool a prompt names exists (${prompts.length} prompts${unknownTools.length ? `; unknown: ${unknownTools.join(", ")}` : ""})`
)

const buildScreen = await promptText("build_screen")
const steps = [...buildScreen.matchAll(/^\d+\. .*$/gm)].map((m) => m[0])
const stepTools = steps.map((step) =>
  [...step.matchAll(/`((?:get|validate)_[a-z_]+)`/g)].map((m) => m[1])
)
assert(
  JSON.stringify(stepTools) ===
    JSON.stringify([
      ["get_design_system_overview"],
      ["get_components"],
      ["get_design_rules"],
      ["get_component_specs", "get_component_variants"],
      ["validate_screen"],
    ]) &&
    /For each retained component only/.test(steps[3]) &&
    /no `get_component_variants` call is needed/.test(steps[3]),
  "build_screen: overview, components, rules, one spec per retained component, validate_screen"
)
assert(
  /call budget: 4 calls \+ 1 per component you retain/.test(buildScreen) &&
    !/no raw <div>/.test(buildScreen),
  "build_screen states its call budget and allows a layout <div>"
)

// build_screen skips get_component_variants because the detailed spec's props
// carry every cva axis and value (sub-components live in their parent spec).
const cvaVariants = JSON.parse(
  readFileSync(resolve(contextDir, "component-variants.json"), "utf-8")
) as Record<
  string,
  { part_of: string | null; variants: Record<string, { values: string[] }> }
>
const propSpecs = specs as unknown as Record<
  string,
  { props: Array<PropRow & { component: string }> }
>
const missingValues: string[] = []
let axisCount = 0
for (const [name, entry] of Object.entries(cvaVariants)) {
  const spec = propSpecs[name] ?? propSpecs[entry.part_of ?? ""]
  for (const [axis, { values }] of Object.entries(entry.variants)) {
    axisCount++
    const row = spec?.props.find(
      (p) => p.component === name && p.prop === `\`${axis}\``
    )
    const missing = values.filter(
      (v) =>
        !row || !new RegExp(`(^|[\\s|\`])"?${v}"?([\\s|\`]|$)`).test(row.type)
    )
    if (missing.length)
      missingValues.push(`${name}.${axis}: ${missing.join(", ")}`)
  }
}
assert(
  axisCount > 0 && missingValues.length === 0,
  `The detailed spec lists every variant value (${axisCount} axes${missingValues.length ? `; missing: ${missingValues.join("; ")}` : ""})`
)

// Any change to the build_screen text shows in review: regenerate with
// UPDATE_SNAPSHOTS=1 npm run mcp:test, then read the diff.
const snapshotPath = resolve(__dirname, "prompts/build_screen.snapshot.txt")
if (process.env.UPDATE_SNAPSHOTS === "1") {
  writeFileSync(snapshotPath, buildScreen)
}
assert(
  existsSync(snapshotPath) &&
    readFileSync(snapshotPath, "utf-8") === buildScreen,
  "build_screen matches its snapshot (UPDATE_SNAPSHOTS=1 npm run mcp:test to accept a change)"
)

// The prompts render the rules get_design_rules serves: no second copy.
const promptTexts = await Promise.all(
  prompts.map(({ name }) => promptText(name))
)
const missingRuleLines = [
  ...TAILWIND_RULE.description,
  ...TAILWIND_RULE.dont,
  ...COMPONENT_RULE.page_structure,
].filter((line) => promptTexts.some((t) => !t.includes(line)))
assert(
  missingRuleLines.length === 0,
  `Every prompt carries the critical rules from their source (${missingRuleLines.length} line(s) missing)`
)
assert(
  !/mode color tokens/.test(buildScreen) &&
    /One semantic class serves both color modes/.test(buildScreen),
  "build_screen does not suggest per-mode color tokens"
)

await promptClient.close()

// --- Test 10: HTTP transport ---
// The real server, started as a subprocess on a free port with a short TTL.
console.log("\n10. HTTP transport")

const SESSION_TTL_MS = 300
const freePort = await new Promise<number>((done) => {
  const probe = createNetServer().listen(0, "127.0.0.1", () => {
    const { port } = probe.address() as { port: number }
    probe.close(() => done(port))
  })
})
const httpServer = spawn(
  process.execPath,
  ["--import", "tsx", resolve(__dirname, "index.ts"), "--http"],
  {
    env: {
      ...process.env,
      MCP_PORT: String(freePort),
      MCP_SESSION_TTL_MS: String(SESSION_TTL_MS),
    },
    stdio: ["ignore", "pipe", "inherit"],
  }
)
try {
  await new Promise<void>((ready, fail) => {
    const timer = setTimeout(
      () => fail(new Error("HTTP server did not start")),
      20_000
    )
    httpServer.stdout.on("data", (chunk: Buffer) => {
      if (chunk.toString().includes("listening")) {
        clearTimeout(timer)
        ready()
      }
    })
    httpServer.on("exit", (code) =>
      fail(new Error(`HTTP server exited (${code})`))
    )
  })

  const mcpUrl = `http://127.0.0.1:${freePort}/mcp`
  const post = (body: unknown, sessionId?: string) =>
    fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
      },
      body: JSON.stringify(body),
    })
  const initialize = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "DSAIReadable-test", version: "1.0.0" },
    },
  }
  const init = await post(initialize)
  const sessionId = init.headers.get("mcp-session-id") ?? ""
  await init.text()
  await (
    await post(
      { jsonrpc: "2.0", method: "notifications/initialized" },
      sessionId
    )
  ).text()
  const listTools = { jsonrpc: "2.0", id: 2, method: "tools/list" }

  const live = await post(listTools, sessionId)
  await live.text()
  assert(
    init.status === 200 && sessionId !== "" && live.status === 200,
    "A session answers within its TTL"
  )

  // Expired, the session must be refused at once — not at the next sweep,
  // 60 s later, and not revived by the request.
  await new Promise((wait) => setTimeout(wait, SESSION_TTL_MS * 2))
  const expired = await post(listTools, sessionId)
  const expiredBody = await expired.text()
  assert(
    expired.status === 404 && expiredBody.includes("initialize"),
    `An expired session is refused with 404 and told to initialize (got ${expired.status})`
  )

  // MCP spec: the Origin header is validated against DNS rebinding.
  const fromOrigin = (origin: string) =>
    fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Origin: origin,
      },
      body: JSON.stringify(initialize),
    })
  const hostile = await fromOrigin("http://attacker.example")
  const hostileBody = await hostile.text()
  const allowed = await fromOrigin(`http://localhost:${freePort}`)
  await allowed.text()
  assert(
    hostile.status === 403 &&
      hostileBody.includes("MCP_ALLOWED_ORIGINS") &&
      allowed.status === 200,
    `A hostile Origin is refused with 403, an allowed one is served (${hostile.status}, ${allowed.status})`
  )

  const unknown = await post(listTools, "00000000-0000-0000-0000-000000000000")
  await unknown.text()
  assert(
    unknown.status === 404,
    `An unknown session is refused with 404, the spec's signal to initialize (got ${unknown.status})`
  )

  // A session the client closes (DELETE) leaves the server at once. Kept, it
  // is routed to its closed transport, which never answers, and counts
  // against MCP_MAX_SESSIONS until the TTL sweep.
  const closing = await post(initialize)
  const closingId = closing.headers.get("mcp-session-id") ?? ""
  await closing.text()
  const deleted = await fetch(mcpUrl, {
    method: "DELETE",
    headers: { "Mcp-Session-Id": closingId },
  })
  await deleted.text()
  const afterDelete = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Mcp-Session-Id": closingId,
    },
    body: JSON.stringify(listTools),
    signal: AbortSignal.timeout(5_000),
  })
    .then(async (res) => {
      await res.text()
      return String(res.status)
    })
    .catch((e: Error) => e.name)
  assert(
    closingId !== "" && deleted.status === 200 && afterDelete === "404",
    `A session closed by the client is refused with 404 (DELETE ${deleted.status}, then ${afterDelete})`
  )
} catch (e) {
  assert(false, `HTTP transport: ${e}`)
} finally {
  httpServer.kill()
}

// --- Test 11: every tool, called as an agent calls it (P3-08) ---
// One content assertion and one error case per tool. Errors are results with
// isError: true, so the agent sees a failed call, and each says what to pass.
console.log("\n11. Every tool: content and error")

const toolServer = new McpServer({
  name: "DSAIReadable-tools",
  version: "1.0.0",
})
registerDsCoreTools(toolServer)
registerDatavizTools(toolServer)
registerUxWritingTools(toolServer)
registerAdminTools(toolServer)
const toolClient = new Client({
  name: "DSAIReadable-test-client",
  version: "1.0.0",
})
const [toolServerSide, toolClientSide] = InMemoryTransport.createLinkedPair()
await Promise.all([
  toolServer.connect(toolServerSide),
  toolClient.connect(toolClientSide),
])
async function callTool(name: string, args: Record<string, unknown>) {
  const result = (await toolClient.callTool({
    name,
    arguments: args,
  })) as ToolText
  return { isError: result.isError === true, text: result.content[0].text }
}

type Json = any // eslint-disable-line @typescript-eslint/no-explicit-any
const semanticPaths = new Set(
  (
    JSON.parse(
      readFileSync(resolve(contextDir, "semantic-tokens.json"), "utf-8")
    ) as { path: string }[]
  ).map((t) => t.path)
)
const meta = JSON.parse(
  readFileSync(resolve(contextDir, "ds-metadata.json"), "utf-8")
)
const contentRuleCount = uxRules.filter(
  (r) => (r as { source?: string }).source === "content.md"
).length

interface ToolCase {
  args: Record<string, unknown>
  content: (payload: Json) => boolean
  /** Arguments that must fail; absent for a tool that takes none. */
  errorArgs?: Record<string, unknown>
  /** What the error must name so the agent can recover. */
  errorNames?: string
}

const TOOL_CASES: Record<string, ToolCase> = {
  get_design_system_overview: {
    args: {},
    content: (p) =>
      p.name === "DSAIReadable" &&
      p.version === undefined &&
      p.design_system_version === meta.design_system_version &&
      p.mcp_server_version === meta.mcp_server_version &&
      p.distribution.install ===
        `npx shadcn@latest add ${meta.registry_source.item_address}` &&
      p.stats.total_components === specNames.length,
  },
  get_components: {
    args: { category: "Forms" },
    content: (p) =>
      p.items.length > 0 &&
      p.items.every((c: Json) => c.category === "Forms") &&
      p.items.some((c: Json) => c.name === "Button"),
    errorArgs: { cursor: "not-a-cursor" },
    errorNames: "next_cursor",
  },
  get_component_specs: {
    args: { component_name: "Button" },
    // Minimal snapshot of the concise payload: its fields, in order.
    content: (p) =>
      Object.keys(p).join() ===
        "name,category,status,role,constraints,exports,cross_references,detail" &&
      p.exports.join() === "Button,buttonVariants",
    errorArgs: { component_name: "NoSuchThing" },
    errorNames: "Button",
  },
  get_component_variants: {
    args: { component_name: "Button" },
    content: (p) =>
      p.variants.variant.values.join() ===
      "default,outline,secondary,ghost,destructive,link",
    errorArgs: { component_name: "NoSuchThing" },
    errorNames: "Button",
  },
  get_tokens: {
    args: { category: "color" },
    content: (p) =>
      p.items.every((t: Json) => t.path.startsWith("color.")) &&
      p.items.some(
        (t: Json) =>
          t.path === "color.background.default" &&
          t.css_var === "--color-background-default"
      ),
    errorArgs: { category: "colors" },
    errorNames: "color",
  },
  get_typography: {
    args: {},
    content: (p) =>
      p.font_families.length > 0 &&
      p.font_families.every((f: Json) =>
        semanticPaths.has(f.token.replace(/`/g, ""))
      ),
  },
  get_icons: {
    args: {},
    content: (p) => p.library === "@phosphor-icons/react",
  },
  get_design_rules: {
    args: { category: "Select" },
    content: (p) => {
      const ids = p.composition_rules.map((r: Json) => r.id)
      return ids.includes("rule-09") && ids.includes("rule-20")
    },
    errorArgs: { category: "no-such-category" },
    errorNames: "color",
  },
  get_page_patterns: {
    args: {},
    content: (p) =>
      p.length > 0 &&
      p.every((pattern: Json) =>
        existsSync(resolve(__dirname, "../..", pattern.source))
      ),
  },
  get_dataviz_recommendation: {
    args: { objective: "evolution" },
    content: (p) => p.recommended_charts.some((c: Json) => c.type === "line"),
    errorArgs: { objective: "trend" },
    errorNames: "evolution",
  },
  get_dataviz_specs: {
    args: { chart_type: "bar" },
    content: (p) => p.library === "recharts" && p.component === "BarChart",
    errorArgs: { chart_type: "no-such-chart" },
    errorNames: "bar",
  },
  get_ux_writing_rules: {
    args: {},
    content: (p) =>
      Object.keys(p).join() === "rules,detail" &&
      p.rules.length === contentRuleCount &&
      p.rules.every((r: Json) => r.source === "content.md"),
    errorArgs: { response_format: "verbose" },
    errorNames: "detailed",
  },
  get_glossary: {
    args: { term: "primitive" },
    content: (p) =>
      p.term === "primitive" && p.definition.includes("primitive.json"),
    errorArgs: { term: "no-such-term" },
    errorNames: "semantic",
  },
  get_content_library: {
    args: { category: "labels" },
    content: (p) => Object.keys(p.labels).length > 0,
    errorArgs: { category: "buttons" },
    errorNames: "labels",
  },
  get_stats: {
    args: {},
    content: (p) =>
      p.total_components === specNames.length &&
      p.total_tokens.semantic === semanticPaths.size,
  },
  validate_screen: {
    args: { code: CLEAN_SCREEN },
    content: (p) =>
      p.passed === true &&
      validateScreen('<div className="bg-[#ffffff]" />').passed === false,
    errorArgs: {},
    errorNames: "code",
  },
}

const listedTools = (await toolClient.listTools()).tools.map((t) => t.name)
assert(
  listedTools.length === Object.keys(TOOL_CASES).length &&
    listedTools.every((t) => t in TOOL_CASES),
  `Every tool has its cases (${listedTools.filter((t) => !(t in TOOL_CASES)).join(", ") || "all"})`
)

for (const [tool, c] of Object.entries(TOOL_CASES)) {
  const ok = await callTool(tool, c.args)
  let content = false
  try {
    content = !ok.isError && c.content(JSON.parse(ok.text))
  } catch {
    content = false
  }
  assert(content, `${tool}: content`)

  if (c.errorArgs) {
    const failed = await callTool(tool, c.errorArgs)
    assert(
      failed.isError && failed.text.includes(c.errorNames ?? ""),
      `${tool}: error on ${JSON.stringify(c.errorArgs)}, naming "${c.errorNames}"`
    )
  }
}

// A missing cache must fail the call and say how to rebuild it — never
// answer as an empty design system. validate_screen reads no cache.
const emptyContextDir = mkdtempSync(
  resolve(tmpdir(), "dsaireadable-no-context-")
)
setContextDir(emptyContextDir)
console.log("  (the [mcp] errors below are expected: one per tool)")
const silentOnMissingCache: string[] = []
for (const [tool, c] of Object.entries(TOOL_CASES)) {
  if (tool === "validate_screen") continue
  const result = await callTool(tool, c.args)
  if (!result.isError || !result.text.includes("generate-context"))
    silentOnMissingCache.push(tool)
}
setContextDir(contextDir)
rmSync(emptyContextDir, { recursive: true })
assert(
  silentOnMissingCache.length === 0 && servedContextDir === contextDir,
  `Without a cache, every tool fails and says to run generate-context (${silentOnMissingCache.join(", ") || "15 tools"})`
)

await toolClient.close()

// --- Test 12: versions and identity, each from its source (P3-09) ---
console.log("\n12. Versions and identity")

const readRoot = (rel: string) =>
  JSON.parse(readFileSync(resolve(__dirname, "../..", rel), "utf-8"))
const rootPkg = readRoot("package.json")
const rootDeps = { ...rootPkg.devDependencies, ...rootPkg.dependencies }
const registryJson = readRoot("registry.json")
const repository = new URL(registryJson.homepage).pathname.replace(
  /^\/|\/$/g,
  ""
)
assert(
  meta.design_system_version === readRoot("design-system.index.json").version &&
    meta.mcp_server_version === readRoot("mcp-server/package.json").version,
  `design_system_version (${meta.design_system_version}) and mcp_server_version (${meta.mcp_server_version}) match their files`
)
assert(
  meta.registry_source?.repository === repository &&
    meta.registry_source?.registry === registryJson.name &&
    meta.registry_source?.item_address === `${repository}/<item>`,
  `registry_source matches registry.json (${repository}, ${registryJson.name})`
)
assert(
  ["react", "next", "tailwindcss"].every(
    (dep) => meta.stack?.[dep] === rootDeps[dep]
  ) &&
    meta.framework ===
      `React ${/\d+/.exec(rootDeps.react)?.[0]} / Next.js ${/\d+/.exec(rootDeps.next)?.[0]} / Tailwind CSS v${/\d+/.exec(rootDeps.tailwindcss)?.[0]} / shadcn-ui`,
  `stack and framework come from package.json (${meta.framework})`
)
assert(
  meta.last_publish === undefined &&
    readRoot("design-system.index.json").library === undefined,
  "No last_publish: only the removed Figma library set it"
)

// A version written in the served code lies at the first bump.
const servedSources = [
  "index.ts",
  ...["tools", "resources", "prompts", "lib"].flatMap((dir) =>
    readdirSync(resolve(__dirname, dir))
      .filter((f) => f.endsWith(".ts"))
      .map((f) => `${dir}/${f}`)
  ),
]
const versionLiterals = servedSources.flatMap((file) =>
  [
    ...readFileSync(resolve(__dirname, file), "utf-8").matchAll(
      /["'`]v?\d+\.\d+\.\d+["'`]/g
    ),
  ].map((m) => `${file}: ${m[0]}`)
)
assert(
  versionLiterals.length === 0,
  `No version literal in the served code (${servedSources.length} files${versionLiterals.length ? `; ${versionLiterals.join(", ")}` : ""})`
)

// --- Summary ---
console.log("\n" + "=".repeat(50))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)
console.log("=".repeat(50))

if (failed > 0) {
  process.exit(1)
}
