#!/usr/bin/env tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerDsCoreTools } from "./tools/ds-core.js"
import { registerDatavizTools } from "./tools/dataviz.js"
import { registerUxWritingTools } from "./tools/ux-writing.js"
import { registerAdminTools } from "./tools/admin.js"
import { registerPrompts } from "./prompts/index.js"
import { validateScreen, SCREEN_RULES } from "./lib/validate-screen.js"
import { readdirSync, existsSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

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
// the last section of every spec (Références croisées) was never found, and a
// section stopped at its first capital Z (ScrollArea's role, "Zone …").
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
  assert(
    specs.ScrollArea?.role.startsWith("Zone de défilement") === true,
    "A section starting with a capital Z is read in full (ScrollArea role)"
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
    /\*\*Pattern\*\* :[\s\S]*\*\*Clavier\*\* :[\s\S]*\*\*Nom accessible\*\* :[\s\S]*\*\*Vigilance\*\* :/.test(
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
  ]

const declaredRules = new Set(SCREEN_RULES.map((r) => r.rule))
declaredRules.add("ui-import-origin")
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
    ["prop", "propriété", "hook"].includes(p.prop.toLowerCase())
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

// Tokens utilisés is generated (scripts/build-spec-tokens.ts) with columns
// Token | Classes et variables | Où. Read by position, the old parser served
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
    (e) => e.name === "useSidebar()" && e.summary.startsWith("Retourne ")
  ) &&
    sidebarExports.some(
      (e) => e.name === "SidebarMenuAction" && e.summary.startsWith("Rend ")
    ),
  "Every export is served with its summary (Sidebar: a hook and a component)"
)
assert(
  apiSpecs.Sidebar?.props.some(
    (p) => p.component === "SidebarMenuAction" && p.prop === "`showOnHover`"
  ) === true,
  "A prop is filed under its own export (SidebarMenuAction.showOnHover)"
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

// --- Summary ---
console.log("\n" + "=".repeat(50))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)
console.log("=".repeat(50))

if (failed > 0) {
  process.exit(1)
}
