/**
 * shadcn registry generator.
 *
 * A GitHub repository holding a `registry.json` at its root is a shadcn
 * registry — there is no package to publish and no server to run. This builds
 * that file from the sources that already exist, so the registry cannot
 * describe a component that was renamed, deleted, or given a new dependency.
 *
 * Inputs:
 *   · design-system.index.json  — the 59 components and their code paths
 *   · specs/components/*.md     — human titles and the one-line role
 *   · components/ui/*.tsx       — real imports, for npm and internal deps
 *   · tokens.css + globals.css  — the css variables shipped by the base item
 *
 *   npx tsx scripts/build-registry.ts [--check]
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { resolve, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const OUT = resolve(ROOT, "registry.json")

const OWNER = "Toniio"
const REPO = "DSAIReadable"
const REGISTRY_NAME = "dsaireadable"
const HOMEPAGE = `https://github.com/${OWNER}/${REPO}`

/**
 * A bare name in `registryDependencies` means the official shadcn/ui registry.
 * Internal dependencies must therefore be fully addressed, or installing
 * `alert-dialog` would silently pull shadcn's `button` instead of ours.
 */
const selfRef = (item: string) => `${OWNER}/${REPO}/${item}`

/** Shipped by the consumer's own toolchain, never by a registry item. */
const AMBIENT_PACKAGES = new Set(["react", "react-dom", "next"])

/**
 * Shared modules shipped once by the `design-system` base item rather than by
 * each component. Every `@/lib/*` a component imports must be listed here, or
 * the consumer gets an import that resolves to nothing.
 */
const BASE_MODULES = new Map([
  ["@/lib/utils", "lib/utils.ts"],
  ["@/lib/focus", "lib/focus.ts"],
  ["@/lib/ui-strings", "lib/ui-strings.ts"],
  ["@/lib/overlay", "lib/overlay.ts"],
])

const read = (rel: string) => readFileSync(resolve(ROOT, rel), "utf-8")

// ---------------------------------------------------------------------------
// Inventory + specs
// ---------------------------------------------------------------------------
interface InventoryEntry {
  name: string
  code_path: string
  status: string
}

const inventory = (
  JSON.parse(read("design-system.index.json")) as {
    inventory: InventoryEntry[]
  }
).inventory

/** First paragraph of the `## Role` section — the component in one line. */
function roleOf(component: string): string | undefined {
  let spec: string
  try {
    spec = read(`specs/components/${component}.md`)
  } catch {
    return undefined
  }
  const body = spec.split(/^##\s+Role\s*$/m)[1]
  if (!body) return undefined
  const paragraph = body.split(/\n\s*\n/).find((p) => p.trim().length > 0)
  return paragraph?.trim().replace(/\s+/g, " ")
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
function importsOf(rel: string): string[] {
  const source = read(rel)
  return [...source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)].map(
    (m) => m[1]
  )
}

/** "radix-ui/react-slot" and "radix-ui" are both the "radix-ui" package. */
function packageOf(specifier: string): string {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

const declaredDeps = (
  JSON.parse(read("package.json")) as { dependencies: Record<string, string> }
).dependencies

/**
 * A bare package name installs whatever version is latest on the day the
 * consumer runs `shadcn add`. The components are written against the ranges
 * in our package.json, so that range travels with the name: without it,
 * react-day-picker 10 broke calendar.tsx the week it came out.
 */
const withRange = (pkg: string) => `${pkg}@${declaredDeps[pkg]}`

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
interface RegistryFile {
  path: string
  type: string
  target?: string
}

interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
  cssVars?: Record<string, Record<string, string>>
  meta?: Record<string, unknown>
}

const itemNameOf = (codePath: string) => basename(codePath, ".tsx")

const unknownPackages: string[] = []
const unshippedModules: string[] = []
const items: RegistryItem[] = []

for (const entry of [...inventory].sort((a, b) =>
  a.code_path.localeCompare(b.code_path)
)) {
  const item = itemNameOf(entry.code_path)
  const files: RegistryFile[] = [{ path: entry.code_path, type: "registry:ui" }]
  const dependencies = new Set<string>()
  const registryDependencies = new Set<string>()

  for (const specifier of importsOf(entry.code_path)) {
    if (specifier.startsWith("@/components/ui/")) {
      registryDependencies.add(selfRef(basename(specifier)))
      continue
    }
    if (specifier.startsWith("@/hooks/")) {
      // Hooks have no item of their own: they travel with their only consumer,
      // the way shadcn ships use-mobile alongside sidebar.
      files.push({
        path: `hooks/${basename(specifier)}.ts`,
        type: "registry:hook",
      })
      continue
    }
    if (BASE_MODULES.has(specifier)) {
      registryDependencies.add(selfRef("design-system"))
      continue
    }
    if (specifier.startsWith("@/") || specifier.startsWith(".")) {
      unshippedModules.push(`${entry.name}: ${specifier}`)
      continue
    }

    const pkg = packageOf(specifier)
    if (AMBIENT_PACKAGES.has(pkg)) continue
    if (!(pkg in declaredDeps)) unknownPackages.push(`${entry.name}: ${pkg}`)
    dependencies.add(pkg)
  }

  items.push({
    name: item,
    type: "registry:ui",
    title: entry.name,
    description: roleOf(entry.name),
    ...(dependencies.size > 0
      ? { dependencies: [...dependencies].sort().map(withRange) }
      : {}),
    ...(registryDependencies.size > 0
      ? { registryDependencies: [...registryDependencies].sort() }
      : {}),
    files,
    meta: { status: entry.status },
  })
}

if (unshippedModules.length > 0) {
  console.error(
    "❌ build-registry: components import local modules no registry item ships:\n" +
      unshippedModules.map((u) => `   ${u}`).join("\n") +
      "\n   Add them to BASE_MODULES, or give them an item of their own."
  )
  process.exit(1)
}

if (unknownPackages.length > 0) {
  console.error(
    "❌ build-registry: components import packages missing from package.json dependencies:\n" +
      unknownPackages.map((u) => `   ${u}`).join("\n")
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// The base item — tokens, in the form shadcn merges into a consumer project
// ---------------------------------------------------------------------------
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

/** Declarations of the first block matching `selector`, as name -> value. */
function blockVars(css: string, selector: RegExp): Record<string, string> {
  const start = css.search(selector)
  if (start === -1) throw new Error(`No block matching ${selector}`)
  const open = css.indexOf("{", start)
  let depth = 0
  let end = css.length
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}" && --depth === 0) {
      end = i
      break
    }
  }
  const vars: Record<string, string> = {}
  for (const m of css
    .slice(open + 1, end)
    .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    vars[m[1].slice(2)] = m[2].trim()
  return vars
}

const tokensCss = stripComments(read("tokens.css"))
const globalsCss = stripComments(read("app/globals.css"))

/** tokens.css declares :root twice per tier; merge them all, in order. */
function allRootVars(css: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const m of css.matchAll(/(?:^|\n):root\s*\{/g)) {
    Object.assign(vars, blockVars(css.slice(m.index ?? 0), /:root\s*\{/))
  }
  return vars
}

const base: RegistryItem = {
  name: "design-system",
  type: "registry:base",
  title: "DSAIReadable design system",
  description:
    "Tokens, dark mode and the shared helpers (cn(), focus ring, UI strings, modal surface classes) every component in this registry expects. Install it first.",
  dependencies: ["clsx", "tailwind-merge"].map(withRange),
  files: [...BASE_MODULES.values()].map((path) => ({
    path,
    type: "registry:lib",
  })),
  cssVars: {
    theme: blockVars(globalsCss, /@theme\s+inline\s*\{/),
    light: allRootVars(tokensCss),
    dark: blockVars(tokensCss, /\.dark\s*\{/),
  },
}

// ---------------------------------------------------------------------------
// The conventions item — the design system's rules, for the consumer's agents
// ---------------------------------------------------------------------------
const CONVENTIONS_SOURCE = "registry/conventions/dsaireadable.md"

/**
 * One source, dropped where each agent loads rules on its own. Its front
 * matter carries every tool's key at once (`alwaysApply` for Cursor, `applyTo`
 * for Copilot; Claude loads a rule without `paths` everywhere), so the three
 * copies cannot drift. Nothing is written over an existing AGENTS.md.
 */
const CONVENTIONS_TARGETS = [
  "~/.cursor/rules/dsaireadable.mdc",
  "~/.claude/rules/dsaireadable.md",
  "~/.github/instructions/dsaireadable.instructions.md",
]

const conventions: RegistryItem = {
  name: "conventions",
  type: "registry:item",
  title: "DSAIReadable conventions",
  description:
    "The design system's rules for the consuming project's agents (Cursor, Claude Code, Copilot): registry addresses, semantic tokens only, Phosphor icons, class-based dark mode, accessibility.",
  files: CONVENTIONS_TARGETS.map((target) => ({
    path: CONVENTIONS_SOURCE,
    type: "registry:file",
    target,
  })),
}
read(CONVENTIONS_SOURCE) // fail here, not in a consumer's project, if it moved

// ---------------------------------------------------------------------------
// Coverage — every component file must have an item, and vice versa
// ---------------------------------------------------------------------------
const onDisk = readdirSync(resolve(ROOT, "components/ui"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => basename(f, ".tsx"))
  .sort()
const inRegistry = items.map((i) => i.name).sort()

const missing = onDisk.filter((n) => !inRegistry.includes(n))
const phantom = inRegistry.filter((n) => !onDisk.includes(n))
if (missing.length > 0 || phantom.length > 0) {
  console.error("❌ build-registry: registry and components/ui disagree.")
  if (missing.length > 0)
    console.error(
      `   ${missing.length} component(s) absent from design-system.index.json: ${missing.join(", ")}`
    )
  if (phantom.length > 0)
    console.error(
      `   ${phantom.length} item(s) with no source file: ${phantom.join(", ")}`
    )
  process.exit(1)
}

const missingDescription = items.filter((i) => !i.description)
if (missingDescription.length > 0) {
  console.error(
    `❌ build-registry: no "## Role" section found for ${missingDescription
      .map((i) => i.title)
      .join(", ")}.`
  )
  process.exit(1)
}

/**
 * `shadcn registry validate` checks the schema and the existence of every
 * files[].path, but never resolves registryDependencies. A typo there is
 * therefore invisible until a consumer runs `add` — and a bare name would
 * quietly install shadcn's component instead of ours. Both are checked here.
 */
const SELF_PREFIX = `${OWNER}/${REPO}/`
const knownItems = new Set([
  base.name,
  conventions.name,
  ...items.map((i) => i.name),
])
const danglingDeps: string[] = []
const bareDeps: string[] = []

for (const item of items) {
  for (const dep of item.registryDependencies ?? []) {
    if (dep.startsWith(SELF_PREFIX)) {
      if (!knownItems.has(dep.slice(SELF_PREFIX.length)))
        danglingDeps.push(`${item.name} → ${dep}`)
    } else if (!/^(https?:\/\/|@|\.)/.test(dep) && !dep.includes("/")) {
      bareDeps.push(`${item.name} → ${dep}`)
    }
  }
}

if (danglingDeps.length > 0 || bareDeps.length > 0) {
  console.error("❌ build-registry: broken registry dependencies.")
  for (const d of danglingDeps)
    console.error(`   ${d} — no item of that name exists in this registry.`)
  for (const d of bareDeps)
    console.error(
      `   ${d} — bare names resolve to the official shadcn registry. ` +
        `Use "${SELF_PREFIX}${d.split(" → ")[1]}" to mean this repository.`
    )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Emit or check
// ---------------------------------------------------------------------------
const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: REGISTRY_NAME,
  homepage: HOMEPAGE,
  items: [base, conventions, ...items],
}

const content = JSON.stringify(registry, null, 2) + "\n"

if (CHECK) {
  let current = ""
  try {
    current = readFileSync(OUT, "utf-8")
  } catch {
    /* missing file is a drift */
  }
  if (current !== content) {
    console.error(
      "❌ build-registry: registry.json is out of date.\n" +
        "   Run `npm run registry:build` and commit the result."
    )
    process.exit(1)
  }
  console.log(
    `✅ build-registry: registry.json up to date — ${items.length} components + base and conventions items.`
  )
  process.exit(0)
}

writeFileSync(OUT, content)
console.log(
  `✅ build-registry: registry.json — ${items.length} components + base and conventions items.`
)
