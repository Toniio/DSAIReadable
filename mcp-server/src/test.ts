#!/usr/bin/env tsx
import { McpServer } from "@modelcontextprotocol/server"
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
import { validateCode } from "./lib/validate-code.js"
import plugin from "@dsaireadable/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import { ESLint, Linter } from "eslint"
import { parseChangelog } from "./lib/changelog.js"
import { exportDocs } from "./lib/jsdoc.js"
import {
  exportDeprecations,
  lintLists,
  tokenDeprecations,
} from "./lib/deprecations.js"
import {
  compositionRulesFor,
  type CompositionRule,
} from "./lib/composition-rules.js"
import { TAILWIND_RULE } from "./lib/tailwind-rule.js"
import { mdWithoutCode } from "./lib/markdown.js"
import { COMPONENT_RULE } from "./lib/component-rule.js"
import { registerResources } from "./resources/index.js"
import {
  Client,
  InMemoryTransport,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"
import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
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
  "patterns.json",
  "dataviz-decision-tree.json",
  "dataviz-catalog.json",
  "ds-metadata.json",
  "deprecations.json",
  "changelog.json",
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
          "success",
          "warning",
          "info",
          "outline",
          "ghost",
          "link",
        ],
        default: "default",
      },
    },
    Alert: {
      variant: {
        values: ["default", "destructive", "success", "warning", "info"],
        default: "default",
      },
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
    Object.keys(variants).length >= 65,
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

// --- Test 6: dsaireadable_validate_screen rules ---
// One failing fixture per rule. Without them a rule can rot silently and the
// tool answers "passed" to an agent that is about to ship a violation.
console.log("\n6. dsaireadable_validate_screen rules")

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
    {
      rule: "tooltip-provider",
      label: "a Tooltip with no provider in the file",
      code: `import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
export const C = () => <Tooltip><TooltipTrigger>Plan</TooltipTrigger><TooltipContent>Renews monthly</TooltipContent></Tooltip>`,
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

// tooltip-provider: a Tooltip throws without a provider above it. A warning,
// not an error: the provider often lives in the root layout, which a check of
// one file does not see. A SidebarProvider supplies one.
{
  const tooltip = `<Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Copy</Button>
        </TooltipTrigger>
        <TooltipContent>Copy the link</TooltipContent>
      </Tooltip>`
  const screen = (open: string, close: string, imports = "") =>
    `import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"${imports}

export function CopyLink() {
  return (
    ${open}
      ${tooltip}
    ${close}
  )
}`
  const flagged = (code: string) =>
    validateScreen(code).issues.filter((i) => i.rule === "tooltip-provider")

  const lone = validateScreen(screen("<div>", "</div>"))
  const [issue] = lone.issues.filter((i) => i.rule === "tooltip-provider")
  const warned =
    issue?.severity === "warning" &&
    issue.line === 12 &&
    lone.total_issues === 1 &&
    lone.errors === 0
  assert(
    warned,
    `tooltip-provider warns once, at the <Tooltip> line, on a Tooltip with no provider${warned ? "" : ` (got ${JSON.stringify(lone.issues)})`}`
  )
  const underProvider = flagged(
    screen("<TooltipProvider>", "</TooltipProvider>")
  )
  assert(
    underProvider.length === 0,
    "tooltip-provider passes a Tooltip under a TooltipProvider"
  )
  const inSidebar = flagged(
    screen(
      "<SidebarProvider>\n      <SidebarInset>",
      "</SidebarInset>\n    </SidebarProvider>",
      `\nimport { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"`
    )
  )
  assert(
    inSidebar.length === 0,
    "tooltip-provider passes a Tooltip inside a SidebarProvider, which supplies one"
  )
  const commented = flagged(
    `import { Button } from "@/components/ui/button"\n// <Tooltip> needs a provider\nexport const C = () => <Button>Save</Button>`
  )
  assert(
    commented.length === 0,
    "tooltip-provider reads no <Tooltip> in a comment"
  )
}

// --- Test 6b: dsaireadable_validate_code (P4-05) ---
// The design system's ESLint rules, run on the syntax tree. One failing
// fixture per rule of the plugin's `core` config, as for validate_screen.
console.log("\n6b. dsaireadable_validate_code")

const CODE_FIXTURES: Record<string, string> = {
  "no-native-interactive-elements": `export const C = () => <button>Save</button>`,
  "no-external-ui-imports": `import { Plus } from "lucide-react"\nexport const C = () => <Plus />`,
  "no-inline-svg": `export const C = () => <svg viewBox="0 0 1 1" />`,
  "no-class-interpolation":
    "export const C = ({ tone }: { tone: string }) => <div className={`bg-${tone}`} />",
  "no-raw-values": `export const C = () => <div className="bg-[#432dd7] text-red-500" />`,
  "no-deprecated-imports": "",
  "no-deprecated-token": `export const C = () => <div className="p-4" style={{ opacity: "var(--opacity-placeholder)" }} />`,
}
const codeRules = Object.keys(plugin.rules)
const missingCodeFixtures = codeRules.filter(
  (r) => r !== "no-deprecated-imports" && !CODE_FIXTURES[r]
)
assert(
  missingCodeFixtures.length === 0,
  `Every rule of the plugin has a failing fixture (${codeRules.length} rules${missingCodeFixtures.length ? `; missing: ${missingCodeFixtures.join(", ")}` : ""})`
)
for (const [rule, code] of Object.entries(CODE_FIXTURES)) {
  // The import list is empty until a component export is deprecated: that
  // rule is exercised with a list of its own (11c and the plugin's tests).
  if (!code) continue
  const caught = validateCode(code).issues.some(
    (i) => i.source === "eslint" && i.rule === `dsaireadable/${rule}`
  )
  assert(caught, `dsaireadable/${rule} flags its fixture`)
}

const codeClean = validateCode(CLEAN_SCREEN)
assert(
  codeClean.passed && codeClean.total_issues === 0,
  "validate_code: the compliant screen passes with zero issues"
)
const syntaxError = validateCode(`export const C = () => <div`)
assert(
  !syntaxError.passed &&
    syntaxError.issues.every((i) => i.source === "typescript") &&
    syntaxError.issues.length === 1,
  "validate_code: code that does not parse is reported once, by TypeScript"
)
const undefinedName = validateCode(
  `export const C = () => <div>{useCounter()}</div>`
)
assert(
  undefinedName.issues.some(
    (i) => i.source === "typescript" && i.rule === "TS2304" && i.line === 1
  ),
  "validate_code: a name that is not defined is reported (TS2304)"
)
// TypeScript sees one file: what lives in other modules is not its finding.
const unresolved = validateCode(
  `import { Thing } from "@/components/ui/thing"\nexport const C = () => <Thing tone={Math.max("a")} />`
)
assert(
  unresolved.issues.every((i) => i.source !== "typescript"),
  "validate_code: unresolved imports and untyped calls are not reported"
)
const located = validateCode(
  `import { Button } from "@/components/ui/button"\n\nexport const C = () => <button>Save</button>`
).issues[0]
assert(
  located?.line === 3 && located.column > 1,
  "validate_code: an issue carries its line and column"
)

// Every example the design system serves is code an agent copies: each must
// pass the rules the project's own lint will run on it.
const exampleSpecs = JSON.parse(
  readFileSync(resolve(contextDir, "component-specs.json"), "utf-8")
) as Record<string, { code_example?: string }>
const exampleFailures = [
  ...Object.entries(exampleSpecs).map(
    ([name, spec]) => [name, spec.code_example ?? ""] as const
  ),
  ...Object.values(
    JSON.parse(
      readFileSync(resolve(contextDir, "patterns.json"), "utf-8")
    ) as Record<string, { name: string; code_example: string }>
  ).map((p) => [p.name, p.code_example] as const),
].flatMap(([name, code]) => {
  const issues = validateCode(code).issues
  return issues.length > 0
    ? [`${name} (${issues.map((i) => `${i.rule}@${i.line}`).join(", ")})`]
    : []
})
assert(
  exampleFailures.length === 0,
  `Every component and pattern example passes dsaireadable_validate_code${exampleFailures.length ? ` (${exampleFailures.join("; ")})` : ""}`
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
  tokenSpecs.PasswordInput?.tokens.length === 0 &&
    tokenSpecs.PasswordInput.tokens_from.includes("InputGroup"),
  "A component with no token of its own points to the specs it composes"
)
// The Composes line names the variant of each part after its " — " ("Button
// in DialogContent: variant ghost, …"): a name before it would be served as a
// composed spec.
assert(
  Object.values(tokenSpecs).every((s) =>
    s.tokens_from.every((name) => name in specs)
  ) && tokenSpecs.Dialog?.tokens_from.join() === "Button",
  "Every tokens_from entry is a spec that exists, not a variant name"
)

// States is generated (scripts/build-spec-states.ts) with columns
// State | Classes | Description. Read by position, `behavior` would be the
// class list: it is the description, and the state is a bare name.
const stateSpecs = specs as unknown as Record<
  string,
  { states: { state: string; behavior: string }[] }
>
// The Classes cell joins its classes with " · "; no description does.
assert(
  Object.values(stateSpecs).every((s) =>
    s.states.every((r) => !r.behavior.includes(" · "))
  ) && stateSpecs.Button?.states.some((s) => s.state === "hover") === true,
  "State rows read by header: the description is served, not the classes"
)
assert(
  Object.values(stateSpecs).every((s) =>
    s.states.every((r) => !r.state.includes("`") && r.behavior.length > 0)
  ),
  "Every served state is a bare name with a description"
)

// Props / API is generated (scripts/build-spec-api.ts): one `### \`Export\``
// block per runtime export, opening with what it renders or returns.
const apiSpecs = specs as unknown as Record<
  string,
  {
    exports: {
      name: string
      summary: string
      description: string
      example: string
    }[]
    props: PropRow[]
  }
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

// The description and the example of an export are its JSDoc, and only there
// (src/lib/jsdoc.ts). An invented file covers what the reader must get right.
const documented = exportDocs(
  [
    "/**",
    " * A panel that holds one thing.",
    " * It wraps on two lines.",
    " *",
    " * @example",
    " * <Panel>",
    " *   <PanelTitle>Hi</PanelTitle>",
    " * </Panel>",
    " */",
    "function Panel() { return null }",
    "const Bare = () => null",
    "/** Inline, with a description and no example. */",
    "export const Inline = () => null",
    "function Hidden() { return null }",
    'import { useThing } from "pkg"',
    "export type PanelProps = {}",
    "export {",
    "  Panel,",
    "  Bare,",
    "  /**",
    "   * Reads the thing.",
    "   *",
    "   * @example",
    "   * const thing = useThing()",
    "   */",
    "  useThing,",
    "}",
  ].join("\n"),
  "@/components/ui/panel"
)
assert(
  documented.map((d) => d.name).join() === "Panel,Bare,Inline,useThing" &&
    documented[0].description ===
      "A panel that holds one thing. It wraps on two lines." &&
    documented[0].example ===
      "<Panel>\n  <PanelTitle>Hi</PanelTitle>\n</Panel>",
  "exportDocs reads the description and the example of each runtime export — on its declaration, or on its specifier when it is imported and re-exported — and leaves types and private functions out"
)
assert(
  documented[3].description === "Reads the thing." &&
    documented[3].example === "const thing = useThing()" &&
    documented[1].description === "" &&
    documented[1].example === "" &&
    documented[2].description !== "" &&
    documented[2].example === "",
  "exportDocs lists an export with no JSDoc, or no example, with an empty string instead of skipping it"
)

// Every export of every component spec has both, so an agent never has to
// open the file to learn what an export is for or how it is written: the
// detailed answer serves the description, the resource and the site the
// example too.
const undocumented = Object.entries(apiSpecs).flatMap(([name, spec]) =>
  spec.exports.flatMap((e) => [
    ...(e.description === "" ? [`${name}.${e.name}: description`] : []),
    ...(e.example === "" ? [`${name}.${e.name}: @example`] : []),
  ])
)
assert(
  undocumented.length === 0,
  `Every export of the ${Object.keys(apiSpecs).length} component specs has a JSDoc description and @example — missing: ${undocumented.slice(0, 12).join(", ")}${undocumented.length > 12 ? ` … (${undocumented.length} in all)` : ""}`
)
assert(
  apiSpecs.Sidebar?.props.some(
    (p) => p.component === "SidebarMenuAction" && p.prop === "`showOnHover`"
  ) === true,
  "A prop is filed under its own export (SidebarMenuAction.showOnHover)"
)

// Composition rules (design-system.index.json) reach MCP agents through
// dsaireadable_get_design_rules. Before, the context cache carried rule-05 alone.
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

// The styling rule served with every dsaireadable_get_design_rules answer: each link of
// its token chain must be the one styles/globals.css declares, and it quotes no
// value — values drift, dsaireadable_get_tokens serves them from the tokens.
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

// The critical rule is served in every prompt, so it says what the components
// draw: square (rounded-none), a label and a heading with a text style of
// their own. It recommended rounded-lg rounded-md and a 14px medium label.
assert(
  !TAILWIND_RULE.do.some((line) =>
    /\brounded-(?:sm|md|lg|xl|2xl)\b/.test(line)
  ) &&
    TAILWIND_RULE.do.some((line) => /\brounded-none\b/.test(line)) &&
    TAILWIND_RULE.description.some(
      (line) => /square/.test(line) && /\brounded-/.test(line)
    ) &&
    TAILWIND_RULE.description.some((line) =>
      /FieldLabel[^.]*no text-\*, font-\*, tracking-\* or leading-\*/.test(line)
    ),
  "The styling rule says the components are square and a label draws its own text style"
)

// The styling rule is served in every prompt and by get_design_rules, and it
// had drifted from the plugin more than once (an inline style it forbade and
// the plugin allows, a class it called valid and no stylesheet generates).
// Every `do` goes through the plugin's `recommended` config, the one a project
// runs, with styles/globals.css as the entry point of its Tailwind half: it
// must lint clean. Every `dont` that names a class or a value must fail it.
// A `dont` that is a convention, valid on purpose, is listed here by name.
const CONVENTION_DONTS: Record<string, string> = {
  "rounded-md on a Button, rounded-lg on a Card or rounded-xl on a Dialog":
    "valid classes: the components are square by convention, which no stylesheet or lint rule enforces",
}
const ruleLinter = new ESLint({
  cwd: resolve(__dirname, "../.."),
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["**/*.tsx"],
      languageOptions: {
        parser: tsParser as Linter.Parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    },
    ...(plugin.configs.recommended as unknown as Linter.Config[]),
  ],
})
/** The code of a rule line: what precedes " — " (a `dont`), then a trailing "(…)" explanation. */
const codeOfRuleLine = (line: string) =>
  line
    .split(" — ")[0]
    .replace(/\s\([^)]*\).*$/, "")
    .trim()
const lintRuleLine = async (code: string) => {
  const attribute = code.startsWith("style=")
    ? code
    : `className=${JSON.stringify(code)}`
  const [result] = await ruleLinter.lintText(
    `export default function Example() { return <div ${attribute} /> }\n`,
    { filePath: resolve(__dirname, "../../screens/tailwind-rule.tsx") }
  )
  return result.messages.filter((m) => m.severity === 2 || m.fatal)
}
const doesNotLint: string[] = []
for (const line of TAILWIND_RULE.do) {
  const messages = await lintRuleLine(codeOfRuleLine(line))
  if (messages.length > 0)
    doesNotLint.push(`${line} (${messages.map((m) => m.message).join("; ")})`)
}
assert(
  doesNotLint.length === 0,
  `Every "do" of the styling rule passes the plugin's recommended config (${doesNotLint.join(" | ") || "all"})`
)
const lintsClean: string[] = []
const exempted = new Set<string>()
for (const line of TAILWIND_RULE.dont) {
  const code = codeOfRuleLine(line)
  if (CONVENTION_DONTS[code]) {
    exempted.add(code)
    continue
  }
  if ((await lintRuleLine(code)).length === 0) lintsClean.push(line)
}
assert(
  lintsClean.length === 0,
  `Every "dont" of the styling rule fails the plugin's recommended config, bar the conventions listed (${lintsClean.join(" | ") || "all"})`
)
assert(
  Object.keys(CONVENTION_DONTS).every((code) => exempted.has(code)),
  "Every exempted convention is still a line of the styling rule"
)
assert(
  (await lintRuleLine("w-[var(--sidebar-width)]")).some((m) =>
    m.message.includes("w-(--sidebar-width)")
  ),
  "The plugin answers a bracketed variable with the shorthand the styling rule teaches"
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
  foundations.length === 13 && ruleless.length === 0,
  `Every foundation serves its rules (${foundations.length - ruleless.length}/${foundations.length}${ruleless.length ? `; none for ${ruleless.join(", ")}` : ""})`
)

// A ✅/❌ comment inside a code example titles the code under it: served as a
// rule on its own ("✅ Standard card"), it names nothing.
const exampleTitles = foundations.flatMap((f) =>
  [
    ...readFileSync(
      resolve(__dirname, "../../specs/foundations", f),
      "utf-8"
    ).matchAll(/^\s*\/\/ ([✅❌].*)$/gm),
  ].map((m) => ({ source: f, title: m[1].trim() }))
)
const servedTitles = exampleTitles.filter((t) =>
  generalRules.some((r) => r.source === t.source && r.rule.startsWith(t.title))
)
assert(
  exampleTitles.length > 0 && servedTitles.length === 0,
  `No ✅/❌ title of a code example is served as a rule (${exampleTitles.length} in the foundations${servedTitles.length ? `; served: ${servedTitles.map((t) => t.title).join(" | ")}` : ""})`
)
assert(
  mdWithoutCode("- ✅ a rule\n```tsx\n// ✅ a title\n```\n- ❌ another")
    .split("\n")
    .filter((line) => /[✅❌]/.test(line)).length === 2,
  "mdWithoutCode drops the lines of a fenced code block, the fences included"
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

// dsaireadable_get_typography serves values an agent copies: no Markdown around them.
// Its usage_rules are prose, whose inline code stays, as in every rule.
const typeTables = {
  ...readContext<Record<string, unknown>>("text-styles.json"),
  usage_rules: undefined,
}
const markedCells = JSON.stringify(typeTables).match(/`|\*\*/g)
assert(
  markedCells === null,
  `dsaireadable_get_typography serves plain values (${markedCells?.length ?? 0} Markdown markers)`
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

// tokens/primitive.json holds DTCG 2025.10 objects ({ colorSpace, components },
// shadow layers); get_primitives serves the CSS tokens.css declares.
const primitives =
  readContext<Array<{ path: string; value: unknown; type: string }>>(
    "primitives.json"
  )
const shadow = primitives.find((p) => p.path === "primitive.elevation.light.xs")
assert(
  primitives.every((p) => typeof p.value === "string") &&
    primitives.find((p) => p.path === "primitive.color.white")?.value ===
      "oklch(100% 0 0)" &&
    shadow?.value === "0 1px 2px oklch(0% 0 0 / 0.04)",
  `Every primitive is served as CSS (${primitives.filter((p) => typeof p.value !== "string").length} objects)`
)

// The dark values come from the resolver's dark context
// (tokens/semantic.dark.json), not from $extensions.modes.
type DarkLeaf = [string, unknown]
const darkLeaves = (node: object, path: string[] = []): DarkLeaf[] =>
  Object.entries(node).flatMap(([key, child]): DarkLeaf[] =>
    "$value" in child
      ? [[[...path, key].join("."), child.$value]]
      : darkLeaves(child, [...path, key])
  )
const overrides = darkLeaves(
  JSON.parse(
    readFileSync(resolve(__dirname, "../../tokens/semantic.dark.json"), "utf-8")
  ) as object
)
const servedDark = new Map(
  readContext<Array<{ path: string; dark: string }>>(
    "semantic-tokens.json"
  ).map((t) => [t.path, t.dark])
)
const variablesDark = new Map(
  readContext<Array<{ path: string; value_dark: string }>>(
    "variables.json"
  ).map((t) => [t.path, t.value_dark])
)
const wrongDark = overrides.filter(
  ([path, value]) =>
    servedDark.get(path) !== value || variablesDark.get(path) !== value
)
assert(
  overrides.length > 0 &&
    wrongDark.length === 0 &&
    servedDark.get("color.background.default") === "{primitive.color.mist.950}",
  `Every dark override is served as the token's dark value (${overrides.length - wrongDark.length}/${overrides.length})`
)

// --- Test 7c: the content library speaks in the foundation's voice ---
// The generator served "Something went wrong", word for word in the "Not"
// column of voice-and-tone.md: agents copied it into the screens they built.
console.log("\n7c. Content library voice")
{
  const tablesOf = (md: string) =>
    md.split("\n\n").map((block) =>
      block
        .split("\n")
        .filter((line) => line.startsWith("|"))
        .map((row) =>
          row
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim())
        )
    )
  const column = (tables: string[][][], header: string) =>
    tables.flatMap((rows) => {
      const i = rows[0]?.indexOf(header) ?? -1
      return i < 0 ? [] : rows.slice(2).map((row) => row[i])
    })
  const quoted = (cell: string) =>
    [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1])

  const specsDir = resolve(__dirname, "../../specs")
  const voiceTables = tablesOf(
    readFileSync(resolve(specsDir, "foundations/voice-and-tone.md"), "utf-8")
  )
  const patternTables = readdirSync(resolve(specsDir, "patterns"))
    .filter((f) => f.endsWith(".md"))
    .flatMap((f) =>
      tablesOf(readFileSync(resolve(specsDir, "patterns", f), "utf-8"))
    )

  // Each rejected phrase, its closing punctuation dropped so that "Something
  // went wrong" matches "Something went wrong.", matched on word boundaries.
  // Only the foundation's: a pattern's "Not" belongs to one element.
  const rejected = column(voiceTables, "Not").flatMap((cell) =>
    quoted(cell).map((p) => p.replace(/(?<=\w)[.!…]+$/, ""))
  )
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const matches = (phrase: string, served: string) =>
    new RegExp(
      `${/^\w/.test(phrase) ? "\\b" : ""}${escape(phrase)}${/\w$/.test(phrase) ? "\\b" : ""}`,
      "i"
    ).test(served)

  const library = readContext<{
    placeholders: Record<string, string>
    messages: Record<string, string>
  }>("content-library.json")
  const served = Object.entries({
    ...library.placeholders,
    ...library.messages,
  })
  const offending = served.flatMap(([key, value]) =>
    rejected
      .filter((phrase) => matches(phrase, value))
      .map((p) => `${key}: "${p}"`)
  )
  assert(
    rejected.includes("Something went wrong") &&
      rejected.includes("please") &&
      offending.length === 0,
    `No served message or placeholder uses a phrase of the "Not" columns (${rejected.length} phrases${offending.length ? `; ${offending.join(", ")}` : ""})`
  )

  // Every message is a phrase of a "Write" column, word for word; {name} and
  // {query} stand for the object the caller names ("Q3 launch").
  const written = column([...voiceTables, ...patternTables], "Write").flatMap(
    quoted
  )
  const canonical = (message: string) =>
    new RegExp(`^${escape(message).replace(/\\\{\w+\\\}/g, ".+")}$`)
  const unwritten = Object.entries(library.messages).filter(
    ([, m]) => !written.some((w) => canonical(m).test(w))
  )
  assert(
    patternTables.length > 0 && unwritten.length === 0,
    `Every served message is the canonical wording of a pattern or of the foundation (${unwritten.map(([k]) => k).join(", ") || "all"})`
  )
  const unexampled = Object.entries(library.placeholders).filter(
    ([, p]) => !/\p{L}/u.test(p) || !written.some((w) => w.includes(p))
  )
  assert(
    unexampled.length === 0,
    `Every placeholder is an example value a "Write" column gives, never a row of dots (${unexampled.map(([k]) => k).join(", ") || "all"})`
  )
}

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
type Json = any // eslint-disable-line @typescript-eslint/no-explicit-any
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
  tools.length === 19 && unannotated.length === 0,
  `Every tool is annotated read-only and closed-world (${tools.length} tools${unannotated.length ? `; missing: ${unannotated.map((t) => t.name).join(", ")}` : ""})`
)

const specNames = Object.keys(specs)
const fullSpecs = specs as unknown as Record<
  string,
  { constraints: string[]; accessibility: string; shadcn?: unknown }
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

// Every turn after a call sends its answer again. Summed over every spec,
// concise stays ≤ 20 % of the spec whole (the resource), and detailed serves
// what a screen writes: ≤ 55 % of it, where it served the spec whole and the
// variants on top. Unfiltered, the concise rules stay ≤ 20 % of the detailed
// ones.
let conciseTotal = 0
let detailedTotal = 0
let wholeTotal = 0
for (const name of specNames) {
  conciseTotal += (
    await payload("dsaireadable_get_component_specs", { component_name: name })
  ).length
  detailedTotal += (
    await payload("dsaireadable_get_component_specs", {
      component_name: name,
      response_format: "detailed",
    })
  ).length
  wholeTotal += (
    (await client.readResource({ uri: `ds://component/${name}/spec` }))
      .contents[0] as { text: string }
  ).text.length
}
const rulesRatio =
  (await payload("dsaireadable_get_design_rules")).length /
  (
    await payload("dsaireadable_get_design_rules", {
      response_format: "detailed",
    })
  ).length
assert(
  conciseTotal / wholeTotal <= 0.2 &&
    detailedTotal / wholeTotal <= 0.55 &&
    rulesRatio <= 0.2,
  `dsaireadable_get_component_specs: concise is ${Math.round((conciseTotal / wholeTotal) * 100)} % of the specs whole (≤ 20 %), detailed ${Math.round((detailedTotal / wholeTotal) * 100)} % (≤ 55 %); dsaireadable_get_design_rules: concise is ${Math.round(rulesRatio * 100)} % of detailed (≤ 20 %)`
)
const conciseButton = JSON.parse(
  await payload("dsaireadable_get_component_specs", {
    component_name: "Button",
  })
)
assert(
  JSON.stringify(conciseButton.constraints) ===
    JSON.stringify(fullSpecs.Button.constraints) &&
    conciseButton.props === undefined &&
    conciseButton.detail ===
      'response_format: "detailed" adds usage, props, accessibility, code_example, variants, sizes, composition_rules',
  `concise keeps every constraint and names what detailed adds, read from it (${conciseButton.detail})`
)

// detailed answers everything needed to write the component in one call:
// its cva variants, the sizes of its size prop (design-system.index.json,
// served nowhere else before) and the composition rules that cover it.
const detailedSpec = async (component_name: string) =>
  JSON.parse(
    await payload("dsaireadable_get_component_specs", {
      component_name,
      response_format: "detailed",
    })
  )
{
  const button = await detailedSpec("Button")
  const select = await detailedSpec("Select")
  const index = JSON.parse(
    readFileSync(resolve(__dirname, "../../design-system.index.json"), "utf-8")
  ) as { inventory: { name: string; sizes?: string[] }[] }
  const buttonSizes = index.inventory.find((c) => c.name === "Button")?.sizes
  const listed = JSON.parse(
    await payload("dsaireadable_get_components", { category: "Forms" })
  ) as { items: { name: string; sizes: string[] }[] }
  assert(
    button.variants.variant.values.join() ===
      "default,outline,secondary,ghost,destructive,link" &&
      button.variants.variant.default === "default" &&
      buttonSizes !== undefined &&
      button.sizes.join() === buttonSizes.join() &&
      listed.items.find((c) => c.name === "Button")?.sizes.join() ===
        buttonSizes.join() &&
      select.composition_rules.some((r: CompositionRule) =>
        r.applies_to?.includes("Select")
      ),
    "detailed serves the variants, the sizes and the composition rules; dsaireadable_get_components serves the sizes"
  )
}

// detailed leaves how a component is built to the resource: its libraries,
// data-slots, tokens and the look of each state, each export's example, and
// the props rows every part has (the `...props` it spreads, a className that
// only adds classes). A `...props` that adds another element's or library's
// props stays (ChartTooltipContent takes Recharts' formatter), and so does a
// className row that says where the classes go.
{
  type ServedProp = PropRow & { description: string }
  const built = [
    "dependencies",
    "anatomy",
    "tokens",
    "tokens_from",
    "states",
    "variant_sources",
    "part_of",
  ]
  const answers = await Promise.all(specNames.map(detailedSpec))
  const leaks = answers.flatMap((a) => [
    ...built.filter((field) => field in a).map((f) => `${a.name}.${f}`),
    ...a.exports
      .filter((e: Json) => Object.keys(e).join() !== "name,summary,description")
      .map((e: Json) => `${a.name}.exports.${e.name}`),
    ...a.props
      .filter(
        (row: ServedProp) =>
          (row.prop.startsWith("`...") &&
            !/&|\bOmit<|\bPick</.test(row.type)) ||
          (row.prop === "`className`" &&
            row.type === "`string`" &&
            row.description === "Additional CSS classes")
      )
      .map((row: ServedProp) => `${a.name}.props.${row.component}.${row.prop}`),
  ])
  const otp = answers.find((a) => a.name === "InputOtp")
  const chart = answers.find((a) => a.name === "Chart")
  assert(
    leaks.length === 0 &&
      chart.props.some(
        (row: ServedProp) =>
          row.component === "ChartTooltipContent" &&
          row.prop.startsWith("`...") &&
          row.type.includes("RechartsPrimitive.Tooltip")
      ) &&
      otp.props.some(
        (row: ServedProp) =>
          row.prop === "`className`" &&
          row.description === "CSS classes on the hidden input"
      ) &&
      answers.every((a) => a.accessibility === fullSpecs[a.name].accessibility),
    `detailed serves what a screen writes, accessibility whole, and leaves the build to the resource${leaks.length ? `: ${leaks.slice(0, 8).join(", ")}` : ""}`
  )
}

// What a state asked of the screen is a constraint, served in both formats
// now that detailed leaves the States table to the resource.
{
  const constraints = async (component_name: string) =>
    (
      JSON.parse(
        await payload("dsaireadable_get_component_specs", { component_name })
      ).constraints as string[]
    ).join("\n")
  const facts: [string, RegExp][] = [
    ["InputOtp", /`aria-invalid` on each `InputOTPSlot`/],
    ["Pagination", /pass `disabled` to `PaginationLink`/],
    ["Field", /`data-disabled` on a `Field`/],
    ["Field", /a choice card is a `FieldLabel` wrapping a `Field/],
    ["Command", /wrap the content of a `CommandDialog` in a `Command`/],
    ["Button", /a `Spinner` as a child[^\n]*`aria-busy="true"`/],
  ]
  const missing = []
  for (const [name, fact] of facts)
    if (!fact.test(await constraints(name))) missing.push(`${name}: ${fact}`)
  assert(
    missing.length === 0,
    `The obligations of the States tables are constraints${missing.length ? `; missing: ${missing.join(", ")}` : ""}`
  )
}

// The critical rules are served without the `do` list (the prompts print it)
// and the token chain: a screen writes the class, not the token it reads.
{
  const tailwind = JSON.parse(
    await payload("dsaireadable_get_design_rules", { category: "tailwind" })
  )
  const detailedRules = JSON.parse(
    await payload("dsaireadable_get_design_rules", {
      response_format: "detailed",
    })
  )
  const lean = (rules: Json[]) =>
    rules.every((r) => !("do" in r) && !("token_chain_explanation" in r)) &&
    rules.some(
      (r) =>
        r.id === TAILWIND_RULE.id &&
        JSON.stringify(r.dont) === JSON.stringify(TAILWIND_RULE.dont) &&
        JSON.stringify(r.description) ===
          JSON.stringify(TAILWIND_RULE.description)
    )
  assert(
    lean(tailwind.rules) && lean(detailedRules.critical_rules),
    "dsaireadable_get_design_rules serves the critical rules without their do list and token chain"
  )
}

// A detailed pattern's cross-references are names: an agent follows no link,
// and every turn would resend the path.
{
  const names = Object.keys(
    JSON.parse(readFileSync(resolve(contextDir, "patterns.json"), "utf-8"))
  )
  const linked: string[] = []
  for (const name of names) {
    const pattern = JSON.parse(
      await payload("dsaireadable_get_pattern", {
        name,
        response_format: "detailed",
      })
    )
    for (const ref of pattern.cross_references as string[])
      if (/\]\(/.test(ref)) linked.push(`${name}: ${ref}`)
  }
  const form = JSON.parse(
    await payload("dsaireadable_get_pattern", {
      name: "form",
      response_format: "detailed",
    })
  )
  assert(
    linked.length === 0 &&
      form.cross_references.some((r: string) =>
        r.startsWith("create, edit, sign-in")
      ),
    `dsaireadable_get_pattern serves its cross-references without link targets${linked.length ? `: ${linked.slice(0, 3).join(" · ")}` : ""}`
  )
}

// The list leaves out has_spec, true for every component: the overview
// counts the coverage.
{
  const listed = JSON.parse(await payload("dsaireadable_get_components"))
  assert(
    listed.items.length === specNames.length &&
      listed.items.every(
        (c: Json) =>
          Object.keys(c).join() === "name,category,status,code_path,sizes"
      ),
    "dsaireadable_get_components lists name, category, status, code path and sizes"
  )
}

// Every turn resends the tool definitions: they stay under 8,500 characters
// (10,386 in 0.2.0), and what their descriptions name exists.
{
  const definitions = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }))
  const size = JSON.stringify(definitions).length
  const tool = (name: string) => tools.find((t) => t.name === name)!
  const param = (name: string, key: string) =>
    (tool(name).inputSchema.properties?.[key] as { description?: string })
      ?.description ?? ""
  const patternNames = Object.keys(
    JSON.parse(readFileSync(resolve(contextDir, "patterns.json"), "utf-8"))
  )
  const categories = [
    ...new Set(
      (
        JSON.parse(
          readFileSync(resolve(contextDir, "components.json"), "utf-8")
        ) as { category: string }[]
      ).map((c) => c.category)
    ),
  ]
  const headings = new Set(
    (
      JSON.parse(
        readFileSync(resolve(contextDir, "changelog.json"), "utf-8")
      ) as { category: string }[]
    ).map((e) => e.category)
  )
  const versions = new Set(
    (
      JSON.parse(
        readFileSync(resolve(contextDir, "changelog.json"), "utf-8")
      ) as { version: string }[]
    ).map((e) => e.version)
  )
  const changelogText = `${tool("dsaireadable_get_changelog").description} ${param("dsaireadable_get_changelog", "version")}`
  const icons = JSON.parse(
    readFileSync(resolve(contextDir, "icons.json"), "utf-8")
  )
  const examples =
    /such as (.+) or (.+)$/
      .exec(param("dsaireadable_get_changelog", "category"))
      ?.slice(1) ?? []
  const wrong = [
    ...patternNames
      .filter(
        (n) => !tool("dsaireadable_list_patterns").description?.includes(n)
      )
      .map((n) => `list_patterns does not name ${n}`),
    ...categories
      .filter(
        (c) => !param("dsaireadable_get_components", "category").includes(c)
      )
      .map((c) => `get_components does not name ${c}`),
    ...(examples.length === 2 ? examples : ["(none)"])
      .filter((h) => !headings.has(h))
      .map((h) => `get_changelog names the heading ${h}`),
    ...[...changelogText.matchAll(/Unreleased|\b\d+\.\d+\.\d+\b/g)]
      .map(([v]) => v)
      .filter((v) => !versions.has(v))
      .map((v) => `get_changelog names the version ${v}`),
    ...(/\bcatalog\b(?! URL)/.test(
      tool("dsaireadable_get_icons").description ?? ""
    ) || !("catalog_url" in icons)
      ? ["get_icons promises a catalog it does not serve"]
      : []),
  ]
  assert(
    size <= 8500 && wrong.length === 0,
    `The tool definitions take ${size} characters (≤ 8,500), and what they name exists${wrong.length ? `: ${wrong.join(", ")}` : ""}`
  )
}

// An error and a resource are compact JSON too.
{
  const error = await call("dsaireadable_get_component_specs", {
    component_name: "NoSuchThing",
  })
  const resource = (
    (await client.readResource({ uri: "ds://component/Button/spec" }))
      .contents[0] as { text: string }
  ).text
  assert(
    error.isError === true &&
      error.content[0].text ===
        JSON.stringify(JSON.parse(error.content[0].text)) &&
      resource === JSON.stringify(JSON.parse(resource)),
    "notFound() and the resources answer compact JSON"
  )
}

// Divergences from shadcn/ui (design-system.index.json) reach the agent in the
// concise answer: it writes the shadcn/ui API from memory.
{
  const inventory = (
    JSON.parse(
      readFileSync(
        resolve(__dirname, "../../design-system.index.json"),
        "utf-8"
      )
    ) as { inventory: { name: string; shadcn: unknown }[] }
  ).inventory
  const sidebar = JSON.parse(
    await payload("dsaireadable_get_component_specs", {
      component_name: "Sidebar",
    })
  ) as {
    shadcn: {
      item: string
      divergences: { export?: string; prop?: string; type: string }[]
    }
  }
  const heading = JSON.parse(
    await payload("dsaireadable_get_component_specs", {
      component_name: "Heading",
    })
  ) as { shadcn: { item: string | null } }
  assert(
    inventory.every(
      (c) =>
        JSON.stringify(fullSpecs[c.name]?.shadcn) === JSON.stringify(c.shadcn)
    ) &&
      sidebar.shadcn.item === "sidebar" &&
      sidebar.shadcn.divergences.some(
        (d) =>
          d.export === "SidebarMenuSubButton" &&
          d.prop === "size" &&
          d.type === "renamed"
      ) &&
      heading.shadcn.item === null,
    "dsaireadable_get_component_specs serves each component's divergences from shadcn/ui, concise included"
  )
}

// A shadcn/ui component excluded from the design system: the lookup fails,
// says why and names the component to use, and the overview lists it.
{
  const form = await call("dsaireadable_get_component_specs", {
    component_name: "Form",
  })
  const overview = JSON.parse(
    await payload("dsaireadable_get_design_system_overview")
  ) as {
    shadcn_excluded: { item: string; instead?: string }[]
  }
  assert(
    form.isError === true &&
      form.content[0].text.includes("Use Field instead") &&
      overview.shadcn_excluded.some(
        (x) => x.item === "form" && x.instead === "Field"
      ),
    "an excluded shadcn/ui component (Form) answers with its reason and Field"
  )
}

// Pagination: pages of a list are disjoint and add up to the whole list.
const tokenPaths: string[] = []
let cursor: string | undefined
let pages = 0
let total = 0
do {
  const page = JSON.parse(
    await payload("dsaireadable_get_tokens", {
      limit: 50,
      ...(cursor ? { cursor } : {}),
    })
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
  `dsaireadable_get_tokens pages cover the ${total} tokens once each (${pages} pages of 50)`
)
const components = JSON.parse(await payload("dsaireadable_get_components"))
assert(
  components.total === specNames.length &&
    components.items.length === specNames.length &&
    components.next_cursor === undefined,
  `dsaireadable_get_components fits the ${specNames.length} components in one default page`
)
const badCursor = await call("dsaireadable_get_tokens", {
  cursor: "not-a-cursor",
})
assert(
  badCursor.isError === true &&
    badCursor.content[0].text.includes("next_cursor"),
  "A cursor the server did not issue is an error that says what to pass"
)

// The order of tools/list, compared with the real transports in test 10.
const memoryToolNames = (await client.listTools()).tools.map((t) => t.name)
await client.close()

// --- Test 9: prompts (P3-07) ---
// build_screen used to mandate 9 calls, specs and variants included, before
// any code: the protocol an agent is likely to drop. It now asks for 4 calls
// plus one per retained component, and ends with dsaireadable_validate_screen.
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
    /`(dsaireadable_[a-z_]+)`/g
  )) {
    if (!toolNames.has(tool)) unknownTools.push(`${name} → ${tool}`)
  }
}
assert(
  prompts.length === Object.keys(PROMPT_ARGS).length &&
    unknownTools.length === 0,
  `Every tool a prompt names exists (${prompts.length} prompts${unknownTools.length ? `; unknown: ${unknownTools.join(", ")}` : ""})`
)

for (const name of ["generate_idea", "suggest_next_steps"]) {
  const text = await promptText(name)
  assert(
    text.includes("`dsaireadable-ui-guard`") &&
      !/senior Product Designer/.test(text),
    `${name} points at the dsaireadable-ui-guard skill instead of a persona`
  )
}

const buildScreen = await promptText("build_screen")
const steps = [...buildScreen.matchAll(/^\d+\. .*$/gm)].map((m) => m[0])
const stepTools = steps.map((step) =>
  [...step.matchAll(/`(dsaireadable_[a-z_]+)`/g)].map((m) => m[1])
)
assert(
  JSON.stringify(stepTools) ===
    JSON.stringify([
      ["dsaireadable_get_design_system_overview"],
      ["dsaireadable_get_components"],
      ["dsaireadable_get_design_rules"],
      ["dsaireadable_get_component_specs"],
      ["dsaireadable_validate_screen", "dsaireadable_validate_code"],
    ]) &&
    /For each retained component only/.test(steps[3]) &&
    /every cva variant with its default, the sizes/.test(steps[3]),
  "build_screen: overview, components, rules, one spec per retained component, dsaireadable_validate_screen and dsaireadable_validate_code"
)
assert(
  /call budget: 4 calls \+ 1 per component you retain/.test(buildScreen) &&
    !/no raw <div>/.test(buildScreen),
  "build_screen states its call budget and allows a layout <div>"
)

// The detailed spec's props carry every cva axis and value, sub-components
// in their parent spec: they agree with the variants it serves.
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

// The prompts render the rules dsaireadable_get_design_rules serves: no second copy.
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

// --- Test 10: transports and protocol revisions (P4-03) ---
// The real server, started as a subprocess: over HTTP on a free port, then
// over stdio. Both serve the 2026-07-28 revision and 2025-era clients.
console.log("\n10. Transports and protocol revisions")

const MODERN = { versionNegotiation: { mode: { pin: "2026-07-28" } } } as const
const sameOrder = (names: string[]) => names.join() === memoryToolNames.join()

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
    env: { ...process.env, MCP_PORT: String(freePort) },
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

  // 2026-07-28: server/discover opens the connection, no session exists.
  const modern = new Client(
    { name: "DSAIReadable-test-client", version: "1.0.0" },
    MODERN
  )
  // The raw answers, for the cache fields the client consumes.
  const answers: Json[] = []
  await modern.connect(
    new StreamableHTTPClientTransport(new URL(mcpUrl), {
      fetch: async (url, init) => {
        const response = await fetch(url, init)
        const body = await response.clone().text()
        if (body.startsWith("{")) answers.push(JSON.parse(body))
        return response
      },
    })
  )
  const modernTools = (await modern.listTools()).tools.map((t) => t.name)
  const modernCall = (await modern.callTool({
    name: "dsaireadable_get_component_specs",
    arguments: { component_name: "Button" },
  })) as ToolText
  assert(
    modern.getProtocolEra() === "modern" &&
      modern.getServerVersion()?.name === "DSAIReadable" &&
      !modernCall.isError,
    `A 2026-07-28 client negotiates through server/discover and calls a tool (era ${modern.getProtocolEra()})`
  )
  // Each stateless request is served by a fresh instance: tools/list must
  // come back in the same order every time, or a client's prompt cache misses.
  const again = (await modern.listTools()).tools.map((t) => t.name)
  assert(
    sameOrder(modernTools) && sameOrder(again),
    `tools/list comes back in one deterministic order (${modernTools.length} tools)`
  )
  const toolList = answers.find((a) => Array.isArray(a.result?.tools))?.result
  assert(
    toolList?.ttlMs === 3_600_000 && toolList?.cacheScope === "public",
    `tools/list carries its cache hint (ttlMs ${toolList?.ttlMs}, cacheScope ${toolList?.cacheScope})`
  )
  await modern.close()

  const post = (body: unknown, headers: Record<string, string> = {}) =>
    fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...headers,
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

  // 2025-era clients are still served, statelessly: no Mcp-Session-Id is
  // issued, and a request needs none.
  const init = await post(initialize)
  await init.text()
  const listed = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" })
  const listedBody = await listed.text()
  assert(
    init.status === 200 &&
      init.headers.get("mcp-session-id") === null &&
      listed.status === 200 &&
      listedBody.includes("dsaireadable_get_component_specs"),
    `A 2025-era client is served without a session (${init.status}, ${listed.status})`
  )
  const deleted = await fetch(mcpUrl, { method: "DELETE" })
  await deleted.text()
  assert(
    deleted.status === 405,
    `DELETE, a session operation, is not allowed (got ${deleted.status})`
  )

  // MCP spec: the Origin header is validated against DNS rebinding.
  const hostile = await post(initialize, { Origin: "http://attacker.example" })
  const hostileBody = await hostile.text()
  const allowed = await post(initialize, {
    Origin: `http://localhost:${freePort}`,
  })
  await allowed.text()
  assert(
    hostile.status === 403 &&
      hostileBody.includes("MCP_ALLOWED_ORIGINS") &&
      allowed.status === 200,
    `A hostile Origin is refused with 403, an allowed one is served (${hostile.status}, ${allowed.status})`
  )
} catch (e) {
  assert(false, `HTTP transport: ${e}`)
} finally {
  httpServer.kill()
}

// stdio, the transport of a local install (npx), serves both eras too.
for (const [era, options] of [
  ["modern", MODERN],
  ["legacy", {}],
] as const) {
  const stdioClient = new Client(
    { name: "DSAIReadable-test-client", version: "1.0.0" },
    options
  )
  try {
    await stdioClient.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: ["--import", "tsx", resolve(__dirname, "index.ts")],
        stderr: "ignore",
      })
    )
    const names = (await stdioClient.listTools()).tools.map((t) => t.name)
    assert(
      stdioClient.getProtocolEra() === era && sameOrder(names),
      `stdio serves a ${era} client (${names.length} tools)`
    )
  } catch (e) {
    assert(false, `stdio (${era}): ${e}`)
  } finally {
    await stdioClient.close()
  }
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
const contentRuleCount = uxRules.filter((r) =>
  ["voice-and-tone.md", "content.md"].includes(
    (r as { source?: string }).source ?? ""
  )
).length

const patterns = JSON.parse(
  readFileSync(resolve(contextDir, "patterns.json"), "utf-8")
) as Record<
  string,
  { name: string; title: string; kind: string; code_example: string }
>

interface ToolCase {
  args: Record<string, unknown>
  content: (payload: Json) => boolean
  /** Arguments that must fail; absent for a tool that takes none. */
  errorArgs?: Record<string, unknown>
  /** What the error must name so the agent can recover. */
  errorNames?: string
}

const TOOL_CASES: Record<string, ToolCase> = {
  dsaireadable_get_design_system_overview: {
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
  dsaireadable_get_components: {
    args: { category: "Forms" },
    content: (p) =>
      p.items.length > 0 &&
      p.items.every((c: Json) => c.category === "Forms") &&
      p.items.some((c: Json) => c.name === "Button"),
    errorArgs: { cursor: "not-a-cursor" },
    errorNames: "next_cursor",
  },
  dsaireadable_get_component_specs: {
    args: { component_name: "Button" },
    // Minimal snapshot of the concise payload: its fields, in order.
    content: (p) =>
      Object.keys(p).join() ===
        "name,category,status,role,constraints,exports,cross_references,shadcn,detail" &&
      p.exports.join() === "Button,buttonVariants",
    errorArgs: { component_name: "NoSuchThing" },
    errorNames: "Button",
  },
  dsaireadable_get_tokens: {
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
  dsaireadable_get_deprecations: {
    args: {},
    content: (p) =>
      p.total === p.tokens.length + p.exports.length &&
      p.tokens.some(
        (t: Json) =>
          t.token === "opacity.placeholder" &&
          t.css_var === "--opacity-placeholder" &&
          t.replacement.token === "color.text.subtle" &&
          t.replacement.css_var === "--color-text-subtle"
      ) &&
      p.tokens.every((t: Json) => semanticPaths.has(t.token)),
    errorArgs: { kind: "component" },
    errorNames: "kind",
  },
  dsaireadable_get_changelog: {
    args: { version: "0.1.0", category: "Added" },
    content: (p) =>
      p.total > 0 &&
      p.items.every(
        (e: Json) =>
          e.version === "0.1.0" && e.category === "Added" && e.text.length > 0
      ),
    errorArgs: { version: "9.9.9" },
    errorNames: "0.1.0",
  },
  dsaireadable_get_typography: {
    args: {},
    content: (p) =>
      p.font_families.length > 0 &&
      p.font_families.every((f: Json) =>
        semanticPaths.has(f.token.replace(/`/g, ""))
      ),
  },
  dsaireadable_get_icons: {
    args: {},
    content: (p) => p.library === "@phosphor-icons/react",
  },
  dsaireadable_get_design_rules: {
    args: { category: "Select" },
    content: (p) => {
      const ids = p.composition_rules.map((r: Json) => r.id)
      return ids.includes("rule-09") && ids.includes("rule-20")
    },
    errorArgs: { category: "no-such-category" },
    errorNames: "color",
  },
  dsaireadable_get_dataviz_recommendation: {
    args: { objective: "evolution" },
    content: (p) => p.recommended_charts.some((c: Json) => c.type === "line"),
    errorArgs: { objective: "trend" },
    errorNames: "evolution",
  },
  dsaireadable_get_dataviz_specs: {
    args: { chart_type: "bar" },
    content: (p) => p.library === "recharts" && p.component === "BarChart",
    errorArgs: { chart_type: "no-such-chart" },
    errorNames: "bar",
  },
  dsaireadable_get_ux_writing_rules: {
    args: {},
    content: (p) =>
      Object.keys(p).join() === "rules" &&
      p.rules.length === contentRuleCount &&
      p.rules.some((r: Json) => r.source === "voice-and-tone.md") &&
      p.rules.some((r: Json) => r.source === "content.md") &&
      p.rules.every((r: Json) =>
        ["voice-and-tone.md", "content.md"].includes(r.source)
      ),
  },
  dsaireadable_get_glossary: {
    args: { term: "primitive" },
    content: (p) =>
      p.term === "primitive" && p.definition.includes("primitive.json"),
    errorArgs: { term: "no-such-term" },
    errorNames: "semantic",
  },
  dsaireadable_get_content_library: {
    args: { category: "labels" },
    content: (p) => Object.keys(p.labels).length > 0,
    errorArgs: { category: "buttons" },
    errorNames: "labels",
  },
  dsaireadable_list_patterns: {
    args: { kind: "task" },
    content: (p) =>
      p.total > 0 &&
      p.patterns.every((x: Json) => x.kind === "task") &&
      p.patterns.some((x: Json) => x.name === "sign-in"),
    errorArgs: { kind: "page" },
    errorNames: "task",
  },
  dsaireadable_get_pattern: {
    args: { name: "Sign in", response_format: "detailed" },
    content: (p) =>
      p.name === "sign-in" &&
      p.kind === "task" &&
      p.components.some((c: Json) => c.component === "PasswordInput") &&
      p.code_example.includes("<PasswordInput"),
    errorArgs: { name: "checkout" },
    errorNames: "sign-in",
  },
  dsaireadable_get_stats: {
    args: {},
    content: (p) =>
      p.total_components === specNames.length &&
      p.total_tokens.semantic === semanticPaths.size,
  },
  dsaireadable_validate_screen: {
    args: { code: CLEAN_SCREEN },
    content: (p) =>
      p.passed === true &&
      validateScreen('<div className="bg-[#ffffff]" />').passed === false,
    errorArgs: {},
    errorNames: "code",
  },
  dsaireadable_validate_code: {
    args: { code: CLEAN_SCREEN },
    content: (p) =>
      p.passed === true &&
      validateCode("export const C = () => <button />").passed === false,
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
// answer as an empty design system. dsaireadable_validate_screen and dsaireadable_validate_code read no cache.
const emptyContextDir = mkdtempSync(
  resolve(tmpdir(), "dsaireadable-no-context-")
)
setContextDir(emptyContextDir)
console.log("  (the [mcp] errors below are expected: one per tool)")
const silentOnMissingCache: string[] = []
for (const [tool, c] of Object.entries(TOOL_CASES)) {
  if (tool === "dsaireadable_validate_screen") continue
  if (tool === "dsaireadable_validate_code") continue
  const result = await callTool(tool, c.args)
  if (!result.isError || !result.text.includes("generate-context"))
    silentOnMissingCache.push(tool)
}
setContextDir(contextDir)
rmSync(emptyContextDir, { recursive: true })
assert(
  silentOnMissingCache.length === 0 && servedContextDir === contextDir,
  `Without a cache, every tool fails and says to run generate-context (${silentOnMissingCache.join(", ") || "19 tools"})`
)

// --- Test 11c: the deprecation chain (P4-08) ---
console.log("\n11c. Deprecation chain")

// A token and a component export that do not exist, deprecated the way the
// sources do it: the four channels (token data, JSDoc, lint, MCP) must all see
// them, and none may see them once the deprecation is gone.
const legacyTree = (deprecated: boolean) => ({
  color: {
    background: {
      subtle: {
        $value: "{primitive.color.mist.100}",
        $type: "color",
        $extensions: { status: "active" },
      },
    },
    legacy: {
      $value: "{primitive.color.mist.100}",
      $type: "color",
      $description: "Deprecated: the old surface.",
      ...(deprecated
        ? { $deprecated: "The old surface is gone: use the subtle surface." }
        : {}),
      $extensions: {
        docs: { tailwind: "bg-legacy" },
        ...(deprecated
          ? {
              "design.dsaireadable": { replacement: "color.background.subtle" },
            }
          : {}),
      },
    },
  },
})
const legacyChip = (deprecated: boolean) => `
${deprecated ? "/** @deprecated Use {@link Badge} instead: a chip is a badge you can remove. */" : ""}
function Chip() {}
function Badge() {}
export { Chip, Badge }
`
const chain = {
  tokens: tokenDeprecations(legacyTree(true)),
  exports: exportDeprecations(legacyChip(true), "@/components/ui/chip"),
}
assert(
  chain.tokens.length === 1 &&
    chain.tokens[0].token === "color.legacy" &&
    chain.tokens[0].css_var === "--color-legacy" &&
    chain.tokens[0].tailwind === "bg-legacy" &&
    chain.tokens[0].replacement?.css_var === "--color-background-subtle",
  "a $deprecated token is listed with its CSS variable, Tailwind class and replacement, and an active one is not"
)
assert(
  chain.exports.length === 1 &&
    chain.exports[0].name === "Chip" &&
    chain.exports[0].replacement === "Badge" &&
    chain.exports[0].message.startsWith("Use Badge instead"),
  "a JSDoc @deprecated on an exported component names its replacement from {@link}"
)
assert(
  exportDeprecations(
    `/** @deprecated Use {@link Badge}. */\nexport function Chip() {}`,
    "@/components/ui/chip"
  ).length === 1 &&
    exportDeprecations(
      `/** @deprecated Use {@link Badge}. */\nfunction Chip() {}`,
      "@/components/ui/chip"
    ).length === 0,
  "a @deprecated declaration counts when it is exported, inline or in `export { … }`, and not when it is private"
)
let bareTag = ""
try {
  exportDeprecations(
    `/** @deprecated */\nexport function Chip() {}`,
    "@/components/ui/chip"
  )
} catch (e) {
  bareTag = String(e)
}
assert(
  bareTag.includes("without a message"),
  "a @deprecated tag with no guidance is an error"
)

// The lint: the same lists, read by the plugin's two rules.
const lists = lintLists(chain)
const lintDeprecated = (code: string, l = lists) =>
  new Linter()
    .verify(
      code,
      [
        {
          files: ["**/*.tsx"],
          languageOptions: {
            parser: tsParser as Linter.Parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          plugins: { dsaireadable: plugin as never },
          rules: {
            "dsaireadable/no-deprecated-token": ["error", { tokens: l.tokens }],
            "dsaireadable/no-deprecated-imports": [
              "error",
              { modules: l.imports },
            ],
          },
        },
      ],
      { filename: "screen.tsx" }
    )
    .map((m) => m.ruleId)
assert(
  lintDeprecated(
    `export const C = () => <div className="bg-legacy p-4" />`
  ).join() === "dsaireadable/no-deprecated-token" &&
    lintDeprecated(`const c = "hover:bg-legacy/50"`).length === 1 &&
    lintDeprecated(`const c = "var(--color-legacy)"`).length === 1 &&
    lintDeprecated(`const c = "bg-legacy-2 var(--color-legacy-2)"`).length ===
      0,
  "no-deprecated-token flags the CSS variable and the class of a deprecated token, variants and modifiers included, and only those"
)
assert(
  lintDeprecated(`import { Chip } from "@/components/ui/chip"`).join() ===
    "dsaireadable/no-deprecated-imports" &&
    lintDeprecated(`import { Badge } from "@/components/ui/chip"`).length === 0,
  "no-deprecated-imports flags a deprecated export and leaves its sibling"
)

// The MCP tool: a cache holding the chain answers with it.
const chainContext = mkdtempSync(resolve(tmpdir(), "dsaireadable-chain-"))
for (const f of readdirSync(contextDir))
  writeFileSync(
    resolve(chainContext, f),
    f === "deprecations.json"
      ? JSON.stringify(chain)
      : readFileSync(resolve(contextDir, f))
  )
setContextDir(chainContext)
const served = JSON.parse(
  (await callTool("dsaireadable_get_deprecations", {})).text
)
const servedExports = JSON.parse(
  (await callTool("dsaireadable_get_deprecations", { kind: "export" })).text
)
setContextDir(contextDir)
rmSync(chainContext, { recursive: true })
assert(
  served.total === 2 &&
    served.tokens[0].token === "color.legacy" &&
    served.exports[0].replacement === "Badge" &&
    servedExports.tokens.length === 0 &&
    servedExports.total === 1,
  "dsaireadable_get_deprecations serves the token and the export, and kind narrows them"
)

// Removing the deprecation removes it from every channel.
const gone = {
  tokens: tokenDeprecations(legacyTree(false)),
  exports: exportDeprecations(legacyChip(false), "@/components/ui/chip"),
}
const goneLists = lintDeprecated(
  `const c = "bg-legacy"\nimport { Chip } from "@/components/ui/chip"`,
  lintLists(gone)
)
assert(
  gone.tokens.length === 0 &&
    gone.exports.length === 0 &&
    goneLists.length === 0,
  "once the deprecation is removed, the token, the export and the lint all forget it"
)

// What the repository itself has deprecated reaches the manifest and the docs.
const manifest = JSON.parse(
  readFileSync(resolve(contextDir, "../../tokens.manifest.json"), "utf-8")
) as { tokens: { token: string; status: string; replacement?: string }[] }
const placeholder = manifest.tokens.find(
  (t) => t.token === "opacity.placeholder"
)
assert(
  placeholder?.status === "deprecated" &&
    placeholder.replacement === "color.text.subtle" &&
    plugin.configs.core.some(
      (c) => c.rules?.["dsaireadable/no-deprecated-token"]
    ),
  "the repository's own deprecation reaches the manifest, and the plugin's core config lints it"
)

// The changelog, in both shapes it is written in.
const log = parseChangelog(`# Changelog

Intro paragraph.

## [Unreleased]

### Added

- One change
  that wraps.
- Another change.

### Deprecated

- A token.

## [0.1.0] - 2026-10-01

### Removed

- Gone.

## 0.0.9

### Patch Changes

- abc1234: docs: A changeset line.
`)
assert(
  log.length === 5 &&
    log[0].version === "Unreleased" &&
    log[0].text === "One change that wraps." &&
    log[2].category === "Deprecated" &&
    log[3].version === "0.1.0" &&
    log[3].date === "2026-10-01" &&
    log[4].version === "0.0.9" &&
    log[4].category === "Patch Changes",
  "parseChangelog reads Keep a Changelog and Changesets headings, and joins a wrapped bullet"
)

// --- Test 11b: page patterns (P4-26) ---
console.log("\n11b. Page patterns")

// Every pattern is served by its name and by its title, and its code example
// is a screen dsaireadable_validate_screen accepts without a single issue: a pattern is
// the example agents copy first.
const patternNames = Object.keys(patterns)
const unserved: string[] = []
for (const p of Object.values(patterns)) {
  for (const name of [p.name, p.title]) {
    const served = await callTool("dsaireadable_get_pattern", {
      name,
      response_format: "detailed",
    })
    if (served.isError || JSON.parse(served.text).name !== p.name)
      unserved.push(name)
  }
}
assert(
  patternNames.length === 12 && unserved.length === 0,
  `dsaireadable_get_pattern serves each of the ${patternNames.length} patterns by name and title${unserved.length ? ` (not: ${unserved.join(", ")})` : ""}`
)
const listed = JSON.parse(
  (await callTool("dsaireadable_list_patterns", {})).text
)
assert(
  listed.total === patternNames.length &&
    JSON.parse(
      (await callTool("dsaireadable_list_patterns", { kind: "task" })).text
    ).total +
      JSON.parse(
        (await callTool("dsaireadable_list_patterns", { kind: "ui" })).text
      ).total ===
      patternNames.length,
  `dsaireadable_list_patterns lists every pattern, split into task and ui (${listed.total})`
)
const invalidExamples = Object.values(patterns).flatMap((p) => {
  const report = validateScreen(p.code_example)
  return report.total_issues > 0 || !p.code_example
    ? [`${p.name} (${report.issues.map((i) => i.rule).join(", ") || "empty"})`]
    : []
})
assert(
  invalidExamples.length === 0,
  `Every pattern's code example passes dsaireadable_validate_screen with no issue${invalidExamples.length ? ` (${invalidExamples.join("; ")})` : ""}`
)
// app/ held test pages only and is gone (P4-25): no pattern points at it.
const citingApp = Object.values(patterns)
  .filter((p) => /(?:^|[\s`"(/])app\//.test(JSON.stringify(p)))
  .map((p) => p.name)
assert(
  citingApp.length === 0,
  `No pattern cites a test page under app/${citingApp.length ? ` (${citingApp.join(", ")})` : ""}`
)
const concise = JSON.parse(
  (await callTool("dsaireadable_get_pattern", { name: "create" })).text
)
assert(
  Object.keys(concise).join() ===
    "name,title,kind,role,usage,components,detail" &&
    concise.components.includes("Dialog") &&
    concise.detail.includes("code_example"),
  "dsaireadable_get_pattern concise keeps role, usage and components, and names what detailed adds"
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
      `React ${/\d+/.exec(rootDeps.react)?.[0]} / Next.js ${/\d+/.exec(rootDeps.next)?.[0]} / Tailwind CSS v${/\d+/.exec(rootDeps.tailwindcss)?.[0]} / shadcn/ui`,
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

// --- Test 13: output schemas (P4-03) ---
// Every tool declares an output schema and its answers conform to it, for
// every input an agent can pass: the server validates each answer before
// sending it and turns a mismatch into an error, so one call per input finds
// a field served but not declared, or declared but no longer served.
console.log("\n13. Output schemas")

const schemaServer = new McpServer({
  name: "DSAIReadable-schemas",
  version: "1.0.0",
})
registerDsCoreTools(schemaServer)
registerDatavizTools(schemaServer)
registerUxWritingTools(schemaServer)
registerAdminTools(schemaServer)
const schemaClient = new Client({
  name: "DSAIReadable-test-client",
  version: "1.0.0",
})
const [schemaServerSide, schemaClientSide] =
  InMemoryTransport.createLinkedPair()
await Promise.all([
  schemaServer.connect(schemaServerSide),
  schemaClient.connect(schemaClientSide),
])

const declared = (await schemaClient.listTools()).tools
const withoutSchema = declared
  .filter((t) => t.outputSchema?.type !== "object")
  .map((t) => t.name)
assert(
  withoutSchema.length === 0,
  `Every tool declares an output schema with an object root${withoutSchema.length ? ` (missing: ${withoutSchema.join(", ")})` : ""}`
)

const context = (file: string) =>
  JSON.parse(readFileSync(resolve(contextDir, file), "utf-8")) as Json
const formats = ["concise", "detailed"]
const allSpecNames = Object.keys(context("component-specs.json"))
const ruleSet = context("ux-writing.json")
const ruleCategories = [
  ...new Set(
    (ruleSet.general_rules as { source: string }[]).map((r) =>
      r.source.replace(/\.md$/, "")
    )
  ),
  ...Object.keys(ruleSet.component_rules),
  "composition",
  "tailwind",
]
const inputs: [string, Record<string, unknown>][] = [
  ["dsaireadable_get_design_system_overview", {}],
  ["dsaireadable_get_components", {}],
  ["dsaireadable_get_components", { category: "Forms", limit: 2 }],
  ...allSpecNames.flatMap((component_name) =>
    formats.map(
      (response_format) =>
        [
          "dsaireadable_get_component_specs",
          { component_name, response_format },
        ] as [string, Record<string, unknown>]
    )
  ),
  ["dsaireadable_get_tokens", {}],
  ["dsaireadable_get_tokens", { category: "color", limit: 3 }],
  ["dsaireadable_get_deprecations", {}],
  ["dsaireadable_get_deprecations", { kind: "token" }],
  ["dsaireadable_get_deprecations", { kind: "export" }],
  ["dsaireadable_get_changelog", {}],
  ["dsaireadable_get_changelog", { version: "0.1.0", limit: 2 }],
  ["dsaireadable_get_changelog", { category: "Added" }],
  ["dsaireadable_get_typography", {}],
  ["dsaireadable_get_icons", {}],
  ...[undefined, ...ruleCategories].flatMap((category) =>
    formats.map(
      (response_format) =>
        ["dsaireadable_get_design_rules", { category, response_format }] as [
          string,
          Record<string, unknown>,
        ]
    )
  ),
  ["dsaireadable_list_patterns", {}],
  ["dsaireadable_list_patterns", { kind: "ui" }],
  ...Object.keys(patterns).flatMap((name) =>
    formats.map(
      (response_format) =>
        ["dsaireadable_get_pattern", { name, response_format }] as [
          string,
          Record<string, unknown>,
        ]
    )
  ),
  ...(
    context("dataviz-decision-tree.json").objectives as { name: string }[]
  ).map(
    ({ name }) =>
      [
        "dsaireadable_get_dataviz_recommendation",
        { objective: name.toLowerCase() },
      ] as [string, Record<string, unknown>]
  ),
  ...Object.keys(context("dataviz-catalog.json")).map(
    (chart_type) =>
      ["dsaireadable_get_dataviz_specs", { chart_type }] as [
        string,
        Record<string, unknown>,
      ]
  ),
  ["dsaireadable_get_ux_writing_rules", {}],
  ["dsaireadable_get_glossary", {}],
  ["dsaireadable_get_glossary", { term: "primitive" }],
  ["dsaireadable_get_content_library", {}],
  ...["labels", "placeholders", "messages"].map(
    (category) =>
      ["dsaireadable_get_content_library", { category }] as [
        string,
        Record<string, unknown>,
      ]
  ),
  ["dsaireadable_get_stats", {}],
  ["dsaireadable_validate_screen", { code: CLEAN_SCREEN }],
  ["dsaireadable_validate_screen", { code: "<button>Save</button>" }],
  ["dsaireadable_validate_code", { code: CLEAN_SCREEN }],
  ["dsaireadable_validate_code", { code: "<button>Save</button>" }],
]
const nonConforming: string[] = []
const calledTools = new Set<string>()
for (const [name, args] of inputs) {
  calledTools.add(name)
  const answer = (await schemaClient.callTool({ name, arguments: args })) as {
    content: { text: string }[]
    structuredContent?: unknown
    isError?: boolean
  }
  // The text is the same JSON, for clients that read only the text, and
  // compact: every turn after the call sends it again, indentation included.
  if (
    answer.isError ||
    answer.content[0].text !== JSON.stringify(answer.structuredContent)
  )
    nonConforming.push(
      `${name} ${JSON.stringify(args)}: ${answer.content[0].text.slice(0, 200)}`
    )
}
assert(
  nonConforming.length === 0 && declared.every((t) => calledTools.has(t.name)),
  `${inputs.length} calls over the ${calledTools.size} tools conform to their output schema, text and structuredContent alike, the text compact${nonConforming.length ? `:\n    ${nonConforming.join("\n    ")}` : ""}`
)

// An argument outside the input schema is a tool execution error, which the
// agent reads and corrects, not a protocol error that ends the call.
const outOfSchema = (await schemaClient.callTool({
  name: "dsaireadable_get_tokens",
  arguments: { category: "hue" },
})) as ToolText
assert(
  outOfSchema.isError === true &&
    outOfSchema.content[0].text.includes("category"),
  "An argument outside the input schema is a tool execution error naming it"
)
// --- A consumer project's own patterns (design/patterns/) ---
console.log("\n14. Project patterns")
const projectPattern = (
  name: string,
  kind: string,
  role: string
) => `# ${name} (project)

## Metadata

| Field | Value  |
| ----- | ------ |
| Name  | ${name} |
| Kind  | ${kind} |

## Role

${role}

## Usage

- **MUST** — keep it to one screen

## Structure

| Region | Content | Components |
| ------ | ------- | ---------- |
| Body   | The form | \`Field\`   |

## Components

| Component | Variant / props | Job            |
| --------- | --------------- | -------------- |
| \`Field\`   | —               | Holds an input |

## Spacing

- **MUST** — use \`gap-4\`

## Content

| Situation | Write  | Not |
| --------- | ------ | --- |
| Title     | Welcome | Hi  |

## Code example

\`\`\`tsx
export const Screen = () => null
\`\`\`

## Cross-references

- \`form\`
- [voice and tone](../foundations/voice-and-tone.md) — the copy
- [Payment copy guide](https://wiki.example.com/Payments_(copy)) — the wording
- [Figma](https://figma.com/file/abc) — the mockups
`
const projectDir = mkdtempSync(resolve(tmpdir(), "dsai-project-"))
const projectPatternsDir = resolve(projectDir, "design/patterns")
mkdirSync(projectPatternsDir, { recursive: true })
writeFileSync(
  resolve(projectPatternsDir, "onboarding.md"),
  projectPattern(
    "onboarding",
    "Task",
    "Walks a new member through their first steps."
  )
)
writeFileSync(
  resolve(projectPatternsDir, "create.md"),
  projectPattern("create", "Task", "The project's own way to create a thing.")
)
type PatternListed = { patterns: { name: string; role: string }[] }
const patternsOf = async (args: Record<string, unknown>) =>
  (await schemaClient.callTool({
    name: "dsaireadable_list_patterns",
    arguments: args,
  })) as ToolText

process.env.DSAIREADABLE_PROJECT_DIR = projectDir
try {
  const listed = JSON.parse(
    (await patternsOf({})).content[0].text
  ) as PatternListed
  const names = listed.patterns.map((p) => p.name)
  assert(
    names.includes("onboarding"),
    "A pattern of design/patterns/ is listed with the design system's"
  )
  assert(
    names.length === new Set(names).size &&
      listed.patterns.find((p) => p.name === "create")?.role ===
        "The project's own way to create a thing.",
    "The project's pattern wins when it shares a name with the design system's"
  )
  const detailed = JSON.parse(
    (
      (await schemaClient.callTool({
        name: "dsaireadable_get_pattern",
        arguments: { name: "onboarding", response_format: "detailed" },
      })) as ToolText
    ).content[0].text
  ) as { source: string; kind: string; cross_references: string[] }
  assert(
    detailed.source === "design/patterns/onboarding.md" &&
      detailed.kind === "task",
    "A project pattern is served whole, with its own source"
  )
  assert(
    detailed.cross_references.join("\n") ===
      [
        "`form`",
        "voice and tone (voice-and-tone) — the copy",
        "[Payment copy guide](https://wiki.example.com/Payments_(copy)) — the wording",
        "[Figma](https://figma.com/file/abc) — the mockups",
      ].join("\n"),
    `A relative link is served as the name it gives, an absolute one whole (${JSON.stringify(detailed.cross_references)})`
  )

  writeFileSync(
    resolve(projectPatternsDir, "broken.md"),
    projectPattern("broken", "Nonsense", "Not a pattern kind.")
  )
  const broken = await patternsOf({})
  assert(
    broken.isError === true &&
      broken.content[0].text.includes("design/patterns/broken.md") &&
      broken.content[0].text.includes("Kind"),
    "A project pattern that does not parse is an error naming its file, not a silent omission"
  )
} finally {
  delete process.env.DSAIREADABLE_PROJECT_DIR
  rmSync(projectDir, { recursive: true, force: true })
}
const withoutProject = JSON.parse(
  (await patternsOf({})).content[0].text
) as PatternListed
assert(
  !withoutProject.patterns.some((p) => p.name === "onboarding") &&
    withoutProject.patterns.length === Object.keys(patterns).length,
  "Without a project folder, only the design system's patterns are served"
)
await schemaClient.close()

// --- Summary ---
console.log("\n" + "=".repeat(50))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)
console.log("=".repeat(50))

if (failed > 0) {
  process.exit(1)
}
