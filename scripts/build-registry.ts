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
 *   · tokens.css + globals.css  — the stylesheet shipped by the base item
 *   · lib/fonts.ts              — the fonts, one registry:font item each
 *
 *   npx tsx scripts/build-registry.ts [--check]
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { resolve, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"
import { firstFamily, nextFontsOf } from "./lib/next-fonts.js"

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
  ["@/lib/surface", "lib/surface.ts"],
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

const manifest = JSON.parse(read("package.json")) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
const declaredDeps = manifest.dependencies

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

/** A stylesheet in the shape the shadcn CLI merges: rule → declarations. */
interface CssObject {
  [key: string]: CssObject | string
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
  css?: CssObject
  font?: Record<string, unknown>
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
// The base item — the stylesheet, in the form shadcn merges into a consumer's
// ---------------------------------------------------------------------------
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

/** Body of the first block matching `selector`, braces excluded. */
function blockBody(css: string, selector: RegExp): string {
  const start = css.search(selector)
  if (start === -1) throw new Error(`No block matching ${selector}`)
  const open = css.indexOf("{", start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i)
  }
  throw new Error(`Unclosed block matching ${selector}`)
}

/** Declarations of the first block matching `selector`, as --name -> value. */
function blockVars(css: string, selector: RegExp): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const m of blockBody(css, selector).matchAll(
    /(--[\w-]+)\s*:\s*([^;]+);/g
  ))
    vars[m[1]] = m[2].trim()
  return vars
}

type CssNode =
  | { kind: "statement"; text: string }
  | { kind: "declaration"; prop: string; value: string }
  | { kind: "block"; selector: string; children: CssNode[] }

/** Just enough of a CSS parser for styles/globals.css: statements
 * (`@import`, `@apply`), declarations and nested blocks. */
function parseCss(css: string): CssNode[] {
  const stack: CssNode[][] = [[]]
  const selectors: string[] = []
  let buffer = ""
  for (const char of css) {
    if (char === "{") {
      selectors.push(buffer.trim())
      stack.push([])
      buffer = ""
    } else if (char === "}") {
      const children = stack.pop()!
      stack
        .at(-1)!
        .push({ kind: "block", selector: selectors.pop()!, children })
      buffer = ""
    } else if (char === ";") {
      const text = buffer.trim()
      const colon = text.indexOf(":")
      stack.at(-1)!.push(
        text.startsWith("@") || colon === -1
          ? { kind: "statement", text }
          : {
              kind: "declaration",
              prop: text.slice(0, colon).trim(),
              value: text.slice(colon + 1).trim(),
            }
      )
      buffer = ""
    } else buffer += char
  }
  return stack[0]
}

const toCssObject = (nodes: CssNode[]): CssObject =>
  Object.fromEntries(
    nodes.map((n) =>
      n.kind === "statement"
        ? [n.text, {}]
        : n.kind === "declaration"
          ? [n.prop, n.value]
          : [n.selector, toCssObject(n.children)]
    )
  )

const tokensSource = read("tokens.css")
const tokensCss = stripComments(tokensSource)
const globals = parseCss(stripComments(read("styles/globals.css")))

/** tokens.css declares :root once per tier; merge them all, in order. */
function allRootVars(css: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const m of css.matchAll(/(?:^|\n):root\s*\{/g))
    Object.assign(vars, blockVars(css.slice(m.index ?? 0), /:root\s*\{/))
  return vars
}

/**
 * The tokens travel in the `css` field, not in `cssVars`: for every cssVars
 * key the CLI (4.21) also writes a mirror into `@theme inline`. That mirror
 * turned each primitive into a class (`bg-ds-prim-color-mist-0`) and compiled
 * `sm:` into `@media (width >= var(--breakpoint-sm))`, a query no browser
 * matches — every responsive variant was dead in the consumer's app.
 *
 * `.dark` also re-declares the Layer 3 aliases (`--background`, `--primary`…):
 * `shadcn init` writes its own dark values for those names, which would
 * otherwise outlive ours.
 */
const layer3At = tokensSource.search(/Layer 3\b/)
if (layer3At === -1) throw new Error("build-registry: no Layer 3 in tokens.css")
const layer3 = blockVars(
  stripComments(tokensSource.slice(layer3At)),
  /:root\s*\{/
)
const rootVars = allRootVars(tokensCss)
const darkVars = { ...blockVars(tokensCss, /\.dark\s*\{/), ...layer3 }

// --- The fonts: one registry:font item per font lib/fonts.ts loads ---------
/** `var(--typography-font-family-mono)` → the primitive stack it resolves to. */
function stackOf(variable: string): string {
  let value = rootVars[variable]
  while (value?.startsWith("var(")) value = rootVars[value.slice(4, -1)]
  if (!value) throw new Error(`build-registry: ${variable} resolves to nothing`)
  return value
}

/**
 * Next.js consumers get the font through next/font, exactly as lib/fonts.ts
 * loads it: the CLI adds the loader to their root layout. Everyone else gets
 * `@fontsource-variable/<name>`, whose family is the token's name plus
 * " Variable" — test-registry-install checks that against the @font-face the
 * package actually declares. tokens:lint-fonts keeps the token and
 * lib/fonts.ts in step, so the family below is never written by hand.
 *
 * The empty `selector` stops the CLI from writing `@apply font-<key>` on
 * <html> for each font (it stacked `font-mono font-sans font-mono`): which
 * font <html> gets is globals.css's `@layer base`, shipped below.
 */
const fonts: RegistryItem[] = nextFontsOf(ROOT).loaded.map((font) => {
  if (!font.variable)
    throw new Error(`build-registry: ${font.loader} sets no --font-* variable`)
  const key = font.variable.replace(/^--font-/, "")
  const [first, ...fallbacks] = stackOf(
    `--typography-font-family-${key}`
  ).split(",")
  const family = firstFamily(first)
  const slug = family.toLowerCase().replace(/\s+/g, "-")
  return {
    name: `font-${slug}`,
    type: "registry:font",
    title: family,
    description: `The ${family} typeface behind font-${key}: next/font in a Next.js app, @fontsource-variable elsewhere.`,
    font: {
      family: [`'${family} Variable'`, ...fallbacks.map((f) => f.trim())].join(
        ", "
      ),
      provider: "google",
      import: font.loader,
      variable: font.variable,
      subsets: font.subsets,
      dependency: `@fontsource-variable/${slug}`,
      selector: "",
    },
  }
})

// --- The @theme bridge, and the lockdown --------------------------------------
const themeBlock = globals.find(
  (n): n is Extract<CssNode, { kind: "block" }> =>
    n.kind === "block" && /^@theme\s+inline$/.test(n.selector)
)
if (!themeBlock) throw new Error("build-registry: no @theme inline block")
const themeDecls = themeBlock.children.filter(
  (n): n is Extract<CssNode, { kind: "declaration" }> =>
    n.kind === "declaration"
)

/** `--color-*: initial` → `color`: the namespaces globals.css locks. */
const lockedNamespaces = themeDecls
  .filter((d) => d.value === "initial" && d.prop.endsWith("-*"))
  .map((d) => d.prop.slice(2, -2))

const fontVariables = new Set(
  fonts.map((f) => (f.font as { variable: string }).variable)
)
const theme: Record<string, string> = {}
for (const d of themeDecls) {
  if (d.value === "initial" && d.prop.endsWith("-*")) continue
  // A font item sets its own variable: next/font's, or the @fontsource family.
  if (fontVariables.has(d.prop)) continue
  theme[d.prop.slice(2)] = d.value
}

/**
 * The lockdown. `--color-*: initial` only clears what comes before it, and the
 * CLI appends new theme keys after the ones a consumer already has — the
 * wildcard would erase the design system's own colors. Each Tailwind default
 * the design system does not redefine is reset by name instead, read from the
 * installed Tailwind so a new default cannot slip through.
 */
const tailwindTheme = stripComments(
  readFileSync(resolve(ROOT, "node_modules/tailwindcss/theme.css"), "utf-8")
)
for (const ns of lockedNamespaces)
  for (const m of tailwindTheme.matchAll(
    new RegExp(`--(${ns}-[\\w-]+)\\s*:`, "g")
  ))
    theme[m[1]] ??= "initial"

/**
 * The CLI also mirrors every theme key whose value mentions `--color-` as
 * `--color-<key>`: `color-primary` would bring a `bg-color-primary` class.
 * Declaring the mirror first, as `initial`, stops it.
 */
for (const [key, value] of Object.entries(theme))
  if (value.includes("--color-")) theme[`color-${key}`] ??= "initial"

// --- Everything else in globals.css --------------------------------------------
const css: CssObject = {}
const cssDependencies: string[] = []
for (const node of globals) {
  if (node === themeBlock) continue
  if (node.kind === "statement" && node.text.startsWith("@import")) {
    const target = node.text.match(/^@import\s+"([^"]+)"$/)?.[1]
    if (!target) throw new Error(`build-registry: cannot read ${node.text}`)
    // Tailwind is the consumer's own; tokens.css travels as :root below.
    if (target === "tailwindcss" || target.startsWith(".")) continue
    css[node.text] = {}
    const pkg = packageOf(target)
    cssDependencies.push(
      `${pkg}@${declaredDeps[pkg] ?? manifest.devDependencies[pkg]}`
    )
  } else if (
    node.kind === "statement" &&
    node.text.startsWith("@custom-variant")
  )
    css[node.text] = {}
  else if (node.kind === "block" && /^@(utility|layer)\s/.test(node.selector))
    continue
  else
    throw new Error(
      `build-registry: styles/globals.css has "${node.kind === "block" ? node.selector : node.kind === "statement" ? node.text : node.prop}", which the base item does not know how to ship`
    )
}
css[":root"] = rootVars
css[".dark"] = darkVars
for (const node of globals)
  if (node.kind === "block" && /^@(utility|layer)\s/.test(node.selector))
    css[node.selector] = toCssObject(node.children)

const base: RegistryItem = {
  name: "design-system",
  type: "registry:base",
  title: "DSAIReadable design system",
  description:
    "Tokens, the Tailwind lockdown, dark mode, the fonts and the shared helpers (cn(), focus ring, UI strings, modal surface classes) every component in this registry expects. Install it first.",
  dependencies: [
    ...["clsx", "tailwind-merge"].map(withRange),
    ...cssDependencies,
  ],
  registryDependencies: fonts.map((f) => selfRef(f.name)),
  files: [...BASE_MODULES.values()].map((path) => ({
    path,
    type: "registry:lib",
  })),
  cssVars: { theme },
  css,
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
  ...fonts.map((f) => f.name),
  ...items.map((i) => i.name),
])
const danglingDeps: string[] = []
const bareDeps: string[] = []

for (const item of [base, ...items]) {
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
  items: [base, ...fonts, conventions, ...items],
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
    `✅ build-registry: registry.json up to date — ${items.length} components + base, ${fonts.length} font and conventions items.`
  )
  process.exit(0)
}

writeFileSync(OUT, content)
console.log(
  `✅ build-registry: registry.json — ${items.length} components + base, ${fonts.length} font and conventions items.`
)
