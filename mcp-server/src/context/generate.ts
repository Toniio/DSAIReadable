/**
 * Context generation script — reads all design system data sources
 * and produces 18 JSON files in mcp-server/context/.
 *
 * Run: tsx src/context/generate.ts
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  statSync,
} from "fs"
import path from "path"
import ts from "typescript"

import { parseChangelog } from "../lib/changelog.js"
import { collectDeprecations, tokenDeprecations } from "../lib/deprecations.js"
import { cssValue, loadTokens } from "../lib/dtcg.js"
import { exportDocs } from "../lib/jsdoc.js"
import {
  mdCode,
  mdListItems,
  mdPlain,
  mdSection,
  mdTable,
  mdTables,
  mdWithoutCode,
} from "../lib/markdown.js"
import { parsePattern, patternFiles } from "../lib/patterns.js"

// ── Paths ───────────────────────────────────────────────────────────
/** Structural type for the arbitrary JSON we read from tokens/ and specs/. */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
type JsonObject = { [key: string]: Json }

const ROOT = path.resolve(import.meta.dirname, "../../..")
const CTX = path.resolve(import.meta.dirname, "../../context")

const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf-8")
const readJSON = (rel: string) => JSON.parse(read(rel))
const write = (name: string, data: unknown) => {
  const p = path.join(CTX, name)
  writeFileSync(p, JSON.stringify(data, null, 2))
  return p
}

// ── Helpers ─────────────────────────────────────────────────────────
// The Markdown readers (mdSection, mdTables, …) are shared with the server at
// run time: src/lib/markdown.ts.

/** Narrow an arbitrary JSON value to a plain object (arrays and null excluded). */
function isJsonObject(val: Json): val is { [key: string]: Json } {
  return typeof val === "object" && val !== null && !Array.isArray(val)
}

/** Flatten DTCG nested tokens to a list of {path, ...leaf} */
function flattenDTCG(
  obj: JsonObject,
  prefix: string[] = []
): Array<{ path: string; [k: string]: Json }> {
  const results: Array<{ path: string; [k: string]: Json }> = []
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue
    if (!isJsonObject(val)) continue
    if ("$value" in val) {
      results.push({ path: [...prefix, key].join("."), ...val })
    } else {
      results.push(...flattenDTCG(val, [...prefix, key]))
    }
  }
  return results
}

/**
 * Lifecycle of a token: `$deprecated`, else `$extensions.status`, else
 * "active". Tells an agent a reserved token is a valid decision nothing uses
 * yet, and a deprecated one must not be used (lint-token-lifecycle keeps the
 * statuses true).
 */
function statusOf(leaf: { [k: string]: Json }): string {
  if (leaf.$deprecated !== undefined) return "deprecated"
  const ext = leaf.$extensions
  return isJsonObject(ext) && typeof ext.status === "string"
    ? ext.status
    : "active"
}

// ── Data loading ────────────────────────────────────────────────────
const dsIndex = readJSON("design-system.index.json")
const inventory: Array<{
  name: string
  code_path: string
  status: string
  /** Every size a size prop accepts; absent when there is no size prop. */
  sizes?: string[]
  shadcn: { item: string | null; divergences: JsonObject[] }
}> = dsIndex.inventory

// The tiers and the dark context, as tokens/tokens.resolver.json declares them.
const tokens = loadTokens(ROOT)
const semanticTokens = tokens.tiers.semantic.tree as JsonObject
const componentTokens = tokens.tiers.component.tree as JsonObject
const primitiveTokens = tokens.tiers.primitive.tree as JsonObject

/** The dark value of a semantic token, when the dark context overrides it. */
function darkValue(leaf: { path: string }): string | undefined {
  const value = tokens.override(leaf.path, "dark")
  return typeof value === "string" ? value : undefined
}

const specDir = path.join(ROOT, "specs/components")
const specFiles = readdirSync(specDir).filter((f) => f.endsWith(".md"))

const foundationsDir = path.join(ROOT, "specs/foundations")
const foundationFiles = readdirSync(foundationsDir).filter((f) =>
  f.endsWith(".md")
)

const uiDir = path.join(ROOT, "components/ui")
const uiFiles = readdirSync(uiDir).filter((f) => f.endsWith(".tsx"))

// ── 1. components.json ──────────────────────────────────────────────
function generateComponents() {
  const specCategories: Record<string, string> = {}
  for (const f of specFiles) {
    const md = readFileSync(path.join(specDir, f), "utf-8")
    const meta = mdSection(md, "Metadata")
    const rows = mdTable(meta)
    const nameRow = rows.find((r) => r[0]?.toLowerCase() === "name")
    const catRow = rows.find((r) => r[0]?.toLowerCase() === "category")
    const name = nameRow?.[1] ?? f.replace(".md", "")
    if (catRow) specCategories[name] = catRow[1]
  }

  const specNames = new Set(specFiles.map((f) => f.replace(".md", "")))

  const result = inventory.map((c) => {
    return {
      name: c.name,
      category: specCategories[c.name] ?? "Uncategorized",
      status: c.status,
      code_path: c.code_path,
      has_spec: specNames.has(c.name),
      sizes: c.sizes ?? [],
    }
  })
  return write("components.json", result)
}

// ── 2. component-specs.json ─────────────────────────────────────────
function generateComponentSpecs() {
  const result: JsonObject = {}

  for (const f of specFiles) {
    const md = readFileSync(path.join(specDir, f), "utf-8")
    const baseName = f.replace(".md", "")

    // Metadata
    const meta = mdSection(md, "Metadata")
    const metaRows = mdTable(meta)
    const get = (label: string) =>
      metaRows.find((r) => r[0]?.toLowerCase() === label.toLowerCase())?.[1] ??
      ""

    const name = get("Name") || baseName
    const category = get("Category") || "Uncategorized"
    const status = get("Status") || "stable"

    // Role
    const role = mdSection(md, "Role")

    // Usage
    const usage = mdListItems(mdSection(md, "Usage"))

    // Constraints
    const constraints = mdListItems(mdSection(md, "Constraints"))

    // Dependencies
    const dependencies = mdListItems(mdSection(md, "Dependencies"))

    // Anatomy
    const anatomyRows = mdTable(mdSection(md, "Anatomy"))
    const anatomy = anatomyRows.map((r) => ({
      slot: r[0] ?? "",
      role: r[1] ?? "",
    }))

    // Tokens — generated by scripts/build-spec-tokens.ts; columns
    // read by header name. Backticks are stripped: each cell is a list of
    // code names separated by " · ".
    const tokens = mdTables(mdSection(md, "Tokens")).flatMap((t) => {
      const col = (name: string) =>
        t.header.findIndex((h) => h.toLowerCase() === name)
      const [token, forms, where] = [
        col("token"),
        col("classes and variables"),
        col("where"),
      ]
      const list = (cell = "") =>
        cell
          .split(" · ")
          .map((v) => v.replace(/`/g, "").trim())
          .filter(Boolean)
      return t.rows.map((r) => ({
        token: (r[token] ?? "").replace(/`/g, ""),
        classes: list(r[forms]),
        where: list(r[where]),
      }))
    })
    // "Composes `Button`, `Label` — …": components whose specs hold the rest.
    const composeLine = mdSection(md, "Tokens")
      .split("\n")
      .find((l) => l.startsWith("Composes "))
    const tokensFrom = [
      ...(composeLine?.split(" — ")[0] ?? "").matchAll(/`(\w+)`/g),
    ].map((m) => m[1])

    // Props / API
    const propsSection = mdSection(md, "Props / API")
    // One table per sub-component under a `###` heading, or a single table.
    // Columns are read by header name: a table whose first column is not a
    // prop, a config property or a hook (e.g. a size → class mapping) is not
    // API and stays out of `props`.
    // Each export's block (scripts/build-spec-api.ts) opens with a one-line
    // summary: what a component renders, what a hook returns.
    // The description and the example of each export are its JSDoc
    // (src/lib/jsdoc.ts), the one place they are written.
    const codePath = inventory.find((c) => c.name === name)?.code_path
    const docs = new Map(
      (codePath
        ? exportDocs(read(codePath), `@/${codePath.replace(/\.tsx$/, "")}`)
        : []
      ).map((d) => [d.name, d])
    )
    const exports: {
      name: string
      summary: string
      description: string
      example: string
    }[] = []
    const apiLines = propsSection.split("\n").map((l) => l.trim())
    apiLines.forEach((line, i) => {
      const heading = line.match(/^### `(.+)`$/)
      if (!heading) return
      const summary = apiLines
        .slice(i + 1)
        .find((l) => l !== "" && !l.startsWith("|"))
      // A hook is titled `useX()`; the code exports `useX`.
      const doc = docs.get(heading[1].replace(/\(\)$/, ""))
      exports.push({
        name: heading[1],
        summary: summary && !summary.startsWith("#") ? summary : "",
        description: doc?.description ?? "",
        example: doc?.example ?? "",
      })
    })
    const props = mdTables(propsSection).flatMap((t) => {
      const col = (...names: string[]) =>
        t.header.findIndex((h) => names.includes(h.toLowerCase()))
      if (col("prop", "property", "hook") !== 0) return []
      const type = col("type", "returns")
      const def = col("default")
      const desc = col("description")
      return t.rows.map((r) => ({
        component: t.heading || name,
        prop: r[0] ?? "",
        type: r[type] ?? "",
        default: r[def] ?? "",
        description: r[desc] ?? "",
      }))
    })

    // States — generated by scripts/build-spec-states.ts. Columns are read by
    // name: the table also lists each state's classes, which are not served;
    // `behavior` is the description.
    const states = mdTables(mdSection(md, "States")).flatMap((t) => {
      const desc = t.header.findIndex((h) =>
        ["description", "visual behavior"].includes(h.toLowerCase())
      )
      return t.rows.map((r) => ({
        state: (r[0] ?? "").replace(/`/g, ""),
        behavior: r[desc] ?? "",
      }))
    })

    // Accessibility — served as written: its fixed shape (Pattern, Role,
    // Keyboard, Accessible name, Pitfalls) is checked by lint-spec-sections.
    const accessibility = mdSection(md, "Accessibility")

    // Code example
    const codeExample = mdCode(mdSection(md, "Code example"))

    // Cross-references
    const crossRefSection = mdSection(md, "Cross-references")
    const crossRefBullets = mdListItems(crossRefSection)
    const crossReferences = crossRefBullets.map((b) => {
      const m = b.match(/^`(\w+)`/)
      return m ? m[1] : b.split("—")[0].split("–")[0].trim()
    })

    result[name] = {
      name,
      category,
      status,
      role,
      usage,
      constraints,
      dependencies,
      anatomy,
      tokens,
      tokens_from: tokensFrom,
      exports,
      props,
      states,
      accessibility,
      code_example: codeExample,
      cross_references: crossReferences,
      // How its API departs from shadcn/ui's, the API models already know
      // (design-system.index.json, checked by scripts/lint-shadcn-api.ts).
      shadcn: inventory.find((c) => c.name === name)?.shadcn ?? null,
    }
  }

  return write("component-specs.json", result)
}

// ── 3. component-variants.json ──────────────────────────────────────

/** Resolve a property name node to its literal string, or null if computed. */
function propName(name: ts.PropertyName): string | null {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text
  }
  return null
}

/** Resolve a literal expression to its string form, or null if not a literal. */
function literalText(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true"
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false"
  return null
}

/** Find a property with the given name in an object literal. */
function findProp(
  obj: ts.ObjectLiteralExpression,
  key: string
): ts.Expression | null {
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue
    if (propName(p.name) === key) return p.initializer
  }
  return null
}

type VariantGroup = { values: string[]; default: string | null }

/**
 * Extract cva() variant definitions from a component file using the TypeScript
 * AST. Walking the AST is what keeps Tailwind modifiers (`hover:`, `dark:`,
 * `aria-expanded:`) out of the results — a regex over the class strings cannot
 * tell a variant key from a modifier prefix.
 *
 * One result per cva() call, keyed by the component it belongs to, which the
 * declaration name gives away: `itemMediaVariants` styles `ItemMedia`. An
 * earlier version unioned every cva() of a file under the file's own name, so
 * `Item` appeared to accept `variant="icon"` — a value only `ItemMedia` takes —
 * and `ItemMedia` did not appear at all. An agent reading that would write code
 * the component ignores.
 */
function parseCvaVariants(
  code: string,
  fileName: string,
  fallbackOwner: string
) {
  const sf = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  )

  /** Variant groups per owning component name. */
  const byComponent: Record<string, Record<string, VariantGroup>> = {}
  const sources: string[] = []

  /** `itemMediaVariants` → `ItemMedia`; anything else keeps its own name. */
  const ownerOf = (declName: string) => {
    const base = declName.replace(/Variants$/, "")
    return base.charAt(0).toUpperCase() + base.slice(1)
  }

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "cva"
    ) {
      // cva(base, config) — locate the argument that actually carries `variants`
      const config = node.arguments.find(
        (a): a is ts.ObjectLiteralExpression =>
          ts.isObjectLiteralExpression(a) && findProp(a, "variants") !== null
      )

      if (config) {
        const decl = ts.findAncestor(node, ts.isVariableDeclaration)
        const declName =
          decl && ts.isIdentifier(decl.name) ? decl.name.text : null
        if (declName) sources.push(declName)
        const owner = declName ? ownerOf(declName) : fallbackOwner
        const variants = (byComponent[owner] ??= {})

        const variantsObj = findProp(config, "variants")
        const defaultsObj = findProp(config, "defaultVariants")

        if (variantsObj && ts.isObjectLiteralExpression(variantsObj)) {
          for (const group of variantsObj.properties) {
            if (!ts.isPropertyAssignment(group)) continue
            const gName = propName(group.name)
            if (!gName || !ts.isObjectLiteralExpression(group.initializer))
              continue

            const values = group.initializer.properties
              .map((v) =>
                ts.isPropertyAssignment(v) ? propName(v.name) : null
              )
              .filter((v): v is string => v !== null)

            // A second cva() for the same component is a rare but legal split.
            const existing = variants[gName]
            variants[gName] = existing
              ? {
                  values: [...new Set([...existing.values, ...values])],
                  default: existing.default,
                }
              : { values, default: null }
          }
        }

        if (defaultsObj && ts.isObjectLiteralExpression(defaultsObj)) {
          for (const d of defaultsObj.properties) {
            if (!ts.isPropertyAssignment(d)) continue
            const dName = propName(d.name)
            if (!dName || !variants[dName]) continue
            if (variants[dName].default === null) {
              variants[dName].default = literalText(d.initializer)
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return { byComponent, sources }
}

function generateComponentVariants() {
  const result: Record<string, unknown> = {}

  for (const f of uiFiles) {
    const code = readFileSync(path.join(uiDir, f), "utf-8")
    const componentName = f
      .replace(".tsx", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")

    const { byComponent, sources } = parseCvaVariants(code, f, componentName)

    // Emit every component, including those without cva(). An explicit
    // "no variants" answer is more useful to an agent than a lookup error.
    // Sub-components get their own entry: they are what the author imports and
    // what the agent writes, so they are what the lookup must answer for.
    const owners = new Set([componentName, ...Object.keys(byComponent)])
    for (const owner of owners) {
      const variants = byComponent[owner] ?? {}
      result[owner] = {
        variants,
        sources: owner === componentName ? sources : [],
        part_of: owner === componentName ? null : componentName,
        has_variants: Object.keys(variants).length > 0,
      }
    }
  }

  // Second pass — axes a component borrows instead of declaring. The cva()
  // parser only sees calls in the file itself, so ToggleGroup (which takes
  // `VariantProps<typeof toggleVariants>`) and Calendar (whose `buttonVariant`
  // prop is typed as Button's `variant`) were served as having no variants.
  type Group = { values: string[]; default: string | null }
  const entry = (name: string) =>
    result[name] as
      | {
          variants: Record<string, Group>
          sources: string[]
          has_variants: boolean
        }
      | undefined
  for (const f of uiFiles) {
    // Block comments out: a JSDoc `@example` is JSX with props of its own, and
    // these patterns read the code, not the documentation.
    const code = readFileSync(path.join(uiDir, f), "utf-8").replace(
      /\/\*[\s\S]*?\*\//g,
      ""
    )
    const owner = f
      .replace(".tsx", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
    const target = entry(owner)
    if (!target) continue
    /** A destructured default such as `buttonVariant = "ghost"`. */
    const defaultOf = (prop: string) =>
      code.match(new RegExp(`\\b${prop}\\s*=\\s*"([\\w-]+)"`))?.[1] ?? null

    // `VariantProps<typeof toggleVariants>` with toggleVariants imported
    for (const m of code.matchAll(/VariantProps<typeof (\w+)Variants>/g)) {
      const decl = `${m[1]}Variants`
      if (
        !new RegExp(
          `import \\{[^}]*\\b${decl}\\b[^}]*\\} from "@/components/ui/`
        ).test(code)
      )
        continue
      const source = entry(m[1].charAt(0).toUpperCase() + m[1].slice(1))
      if (!source) continue
      for (const [axis, group] of Object.entries(source.variants))
        target.variants[axis] ??= {
          ...group,
          default: defaultOf(axis) ?? group.default,
        }
      if (!target.sources.includes(decl)) target.sources.push(decl)
    }

    // `prop?: React.ComponentProps<typeof Button>["variant"]`
    for (const m of code.matchAll(
      /(\w+)\??:\s*React\.ComponentProps<typeof (\w+)>\["(\w+)"\]/g
    )) {
      const [, prop, component, axis] = m
      const group = entry(component)?.variants[axis]
      if (!group) continue
      target.variants[prop] ??= {
        ...group,
        default: defaultOf(prop) ?? group.default,
      }
    }
    target.has_variants = Object.keys(target.variants).length > 0
  }

  return write("component-variants.json", result)
}

// ── 4. variables.json ───────────────────────────────────────────────
function generateVariables() {
  const semFlat = flattenDTCG(semanticTokens)
  const compFlat = flattenDTCG(componentTokens)

  const toVar = (path: string, prefix: string) => {
    return `--${prefix}${path.replace(/\./g, "-")}`
  }

  const entries = [
    ...semFlat.map((t) => ({
      path: t.path,
      value_light: t.$value,
      value_dark: darkValue(t) ?? t.$value,
      css_variable: toVar(t.path, ""),
      tier: "semantic",
      status: statusOf(t),
    })),
    // The path already starts with its "shadcn" group; the variable drops
    // it, as scripts/build-tokens.ts does: shadcn.background is --background.
    ...compFlat.map((t) => ({
      path: t.path,
      value_light: t.$value,
      value_dark: t.$value,
      css_variable: toVar(t.path.split(".").slice(1).join("."), ""),
      tier: "component",
    })),
  ]

  return write("variables.json", entries)
}

// ── 5. semantic-tokens.json ─────────────────────────────────────────
function generateSemanticTokens() {
  const flat = flattenDTCG(semanticTokens)
  const replacements = new Map(
    tokenDeprecations(semanticTokens).flatMap((d) =>
      d.replacement ? [[d.token, d.replacement.token] as const] : []
    )
  )
  const result = flat.map((t) => ({
    path: t.path,
    css_var: `--${t.path.replace(/\./g, "-")}`,
    light: t.$value,
    dark: darkValue(t) ?? t.$value,
    type: t.$type ?? "",
    status: statusOf(t),
    // What to use instead, on a deprecated token that names one.
    ...(replacements.has(t.path)
      ? { replacement: replacements.get(t.path) }
      : {}),
    usage: t.$description ?? "",
  }))
  return write("semantic-tokens.json", result)
}

// ── 6. layout-tokens.json ───────────────────────────────────────────
function generateLayoutTokens() {
  const flat = flattenDTCG(semanticTokens)
  const layoutTokens = flat.filter(
    (t) =>
      t.path.startsWith("space.") ||
      t.path.startsWith("radius.") ||
      t.path.startsWith("elevation.")
  )

  const spacingMd = existsSync(path.join(foundationsDir, "spacing.md"))
    ? readFileSync(path.join(foundationsDir, "spacing.md"), "utf-8")
    : ""
  const radiusMd = existsSync(path.join(foundationsDir, "radius.md"))
    ? readFileSync(path.join(foundationsDir, "radius.md"), "utf-8")
    : ""
  const elevationMd = existsSync(path.join(foundationsDir, "elevation.md"))
    ? readFileSync(path.join(foundationsDir, "elevation.md"), "utf-8")
    : ""

  const result = {
    tokens: layoutTokens.map((t) => ({
      path: t.path,
      css_var: `--${t.path.replace(/\./g, "-")}`,
      value: t.$value,
      dark_value: darkValue(t),
      type: t.$type ?? "",
      description: t.$description ?? "",
    })),
    spacing_rules: mdListItems(mdSection(spacingMd, "Usage Rules")),
    radius_rules: mdListItems(mdSection(radiusMd, "Usage Rules")),
    elevation_rules: mdListItems(mdSection(elevationMd, "Usage Rules")),
  }
  return write("layout-tokens.json", result)
}

// ── 7. primitives.json ──────────────────────────────────────────────
function generatePrimitives() {
  const flat = flattenDTCG(primitiveTokens)
  // The CSS form of each DTCG 2025.10 value: what tokens.css declares.
  const result = flat.map((t) => ({
    path: t.path,
    value: cssValue(t.$value, t.$type as string),
    type: t.$type ?? "",
  }))
  return write("primitives.json", result)
}

// ── 8. text-styles.json ─────────────────────────────────────────────
function generateTextStyles() {
  const typoMd = readFileSync(
    path.join(foundationsDir, "typography.md"),
    "utf-8"
  )

  // Served as plain values: dsaireadable_get_typography answers with these cells.
  const rowsOf = (heading: string) =>
    mdTable(mdSection(typoMd, heading)).map((r) => r.map(mdPlain))

  // Font families
  const familyRows = rowsOf("Font Families")
  const fontFamilies = familyRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    family: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Type scale
  const scaleRows = rowsOf("Type Scale (Sizes)")
  const typeScale = scaleRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    rem: r[2] ?? "",
    px: r[3] ?? "",
    tailwind_class: r[4] ?? "",
    usage: r[5] ?? "",
  }))

  // Line heights
  const lhRows = rowsOf("Line Heights")
  const lineHeights = lhRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Font weights
  const fwRows = rowsOf("Font Weights")
  const fontWeights = fwRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Letter spacings
  const lsRows = rowsOf("Letter Spacings")
  const letterSpacings = lsRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Usage rules
  const usageRules = mdListItems(mdSection(typoMd, "Usage Rules"))

  return write("text-styles.json", {
    font_families: fontFamilies,
    type_scale: typeScale,
    line_heights: lineHeights,
    font_weights: fontWeights,
    letter_spacings: letterSpacings,
    usage_rules: usageRules,
  })
}

// ── 9. icons.json ───────────────────────────────────────────────────
function generateIcons() {
  // From design-system.index.json rule-05: "Icons must come exclusively from @phosphor-icons/react"
  const rule = dsIndex.composition_rules.find(
    (r: { id?: string }) => r.id === "rule-05"
  )
  const result = {
    library: "@phosphor-icons/react",
    description:
      "The design system uses Phosphor Icons exclusively, through @phosphor-icons/react.",
    default_size: "size-4 (1rem)",
    rule: rule?.rule ?? "",
    usage: [
      "Every icon comes from @phosphor-icons/react",
      "Default size inside components: size-4 (1rem)",
      "No other icon library is allowed",
    ],
    catalog_url: "https://phosphoricons.com/",
  }
  return write("icons.json", result)
}

// ── 10. ux-writing.json ─────────────────────────────────────────────
function generateUxWriting() {
  const generalRules: Array<{ rule: string; source: string }> = []

  // Foundation Do/Don't
  for (const f of foundationFiles) {
    const md = readFileSync(path.join(foundationsDir, f), "utf-8")
    const source = f.replace(".md", "")

    // Extract Do/Don't lines. A ✅/❌ comment inside a code example titles the
    // code under it ("✅ Standard card"): served alone it is no rule.
    const prose = mdWithoutCode(md)
    const doRegex = /[✅❌]\s*(.+)/g
    let m
    while ((m = doRegex.exec(prose)) !== null) {
      // A ✅/❌ inside a table row is a column header, not a rule.
      const lineStart = prose.lastIndexOf("\n", m.index) + 1
      if (prose.startsWith("|", lineStart)) continue
      generalRules.push({ rule: m[0].trim(), source: `${source}.md` })
    }

    // Usage rules — a bullet written "- ✅ …" was already taken above as a
    // Do/Don't line; keep it once.
    const usageRules = mdListItems(mdSection(md, "Usage Rules"))
    for (const r of usageRules) {
      const taken = generalRules.some(
        (g) => g.source === `${source}.md` && g.rule === r
      )
      if (!taken) generalRules.push({ rule: r, source: `${source}.md` })
    }
  }

  // Component constraints
  const componentRules: Record<string, string[]> = {}
  for (const f of specFiles) {
    const md = readFileSync(path.join(specDir, f), "utf-8")
    const name = f.replace(".md", "")
    const constraints = mdListItems(mdSection(md, "Constraints"))
    if (constraints.length > 0) {
      componentRules[name] = constraints
    }
  }

  // Composition rules of design-system.index.json, served by dsaireadable_get_design_rules:
  // without them, the context cache carried rule-05 alone (in icons.json).
  const compositionRules = (
    dsIndex.composition_rules as Array<{
      id: string
      rule: string
      applies_to?: string[]
    }>
  ).map(({ id, rule, applies_to }) =>
    applies_to ? { id, rule, applies_to } : { id, rule }
  )

  return write("ux-writing.json", {
    general_rules: generalRules,
    component_rules: componentRules,
    composition_rules: compositionRules,
  })
}

// ── 11. glossary.json ───────────────────────────────────────────────
function generateGlossary() {
  // From design-system.index.json glossary + standard DS terms
  const indexGlossary: Record<string, string> = dsIndex.glossary ?? {}

  const entries = Object.entries(indexGlossary).map(([term, definition]) => ({
    term,
    definition,
  }))

  // Add a few extra standard DS terms if not already present
  const existing = new Set(entries.map((e) => e.term.toLowerCase()))
  const extras = [
    {
      term: "design system",
      definition:
        "A coherent set of components, tokens and rules that keeps a product visually and functionally consistent.",
    },
    {
      term: "variant",
      definition:
        "A visual version of a component (for example default, outline or ghost for a Button).",
    },
    {
      term: "component",
      definition:
        "A reusable UI element with a defined API (props, slots, events).",
    },
    {
      term: "foundation",
      definition:
        "The base layer of the design system — color, typography, spacing, elevation, radius, opacity, motion.",
    },
    {
      term: "slot",
      definition:
        "A named part of a component's anatomy, exposed through the data-slot attribute.",
    },
    {
      term: "token",
      definition:
        "Design token — a reusable design variable that encodes a visual decision (color, spacing…).",
    },
  ]

  for (const e of extras) {
    if (!existing.has(e.term.toLowerCase())) {
      entries.push(e)
    }
  }

  return write("glossary.json", entries)
}

// ── 12. content-library.json ────────────────────────────────────────
function generateContentLibrary() {
  const labels: Record<string, string> = {}
  const placeholders: Record<string, string> = {}
  const messages: Record<string, string> = {}

  // Extract from specs code examples
  for (const f of specFiles) {
    const md = readFileSync(path.join(specDir, f), "utf-8")
    const codeSection = mdSection(md, "Code example")
    const code = mdCode(codeSection || md)
    if (code) {
      const labelRegex = />\s*([A-Z][a-z\s']+)\s*</g
      let m
      while ((m = labelRegex.exec(code)) !== null) {
        const val = m[1].trim()
        if (val.length > 1 && val.length < 60) {
          const key = val
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 30)
          labels[key] = val
        }
      }
    }
  }

  // Add common UI labels
  Object.assign(labels, {
    sign_in: "Sign in",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    close: "Close",
    next: "Next",
    previous: "Previous",
    search: "Search",
  })

  // A placeholder is an example value, never a label or a fake one: a password
  // field takes none, since a row of dots reads as a field already filled in.
  Object.assign(placeholders, {
    email: "name@example.com",
    search: "Search projects…",
  })

  // The wording of the Content tables of specs/patterns/*.md, in the voice of
  // specs/foundations/voice-and-tone.md. No generic error: an error says what
  // failed, then how to fix it. {name} and {query} are filled by the caller.
  Object.assign(messages, {
    saving: "Saving…",
    success_saved: "All set! Your changes are saved.",
    error_save:
      "We couldn't save your changes. Check your connection and try again.",
    leave_guard: "Leave without saving?",
    success_created: 'Your project "{name}" is ready.',
    error_create:
      "We couldn't create the project. Check your connection and try again.",
    confirm_delete_title: 'Delete "{name}"?',
    confirm_delete:
      "Its tasks and files go with it. You won't be able to get them back.",
    confirm_delete_action: "Delete project",
    success_deleted: '"{name}" is deleted.',
    empty_state_title: "No projects yet",
    empty_state: "Create your first project to get started.",
    empty_search_title: 'No results for "{query}"',
    empty_search: "Check the spelling or try another word.",
    loading: "Loading your projects…",
    error_sign_in:
      "That email and password don't match. Check them and try again.",
    error_email: "Enter an email address, like name@example.com.",
  })

  return write("content-library.json", { labels, placeholders, messages })
}

// ── 12 bis. patterns.json ───────────────────────────────────────────
const patternsDir = path.join(ROOT, "specs/patterns")

/**
 * The page patterns of specs/patterns/, by name. A pattern names components
 * in its Components table: each one must be an export a component spec
 * documents, or the pattern points agents at a component that does not exist.
 */
function generatePatterns() {
  const documented = new Set(
    specFiles.flatMap((f) =>
      [
        ...mdSection(
          readFileSync(path.join(specDir, f), "utf-8"),
          "Props / API"
        ).matchAll(/^### `(.+)`$/gm),
      ].map((m) => m[1])
    )
  )

  const result: JsonObject = {}
  for (const [f, md] of patternFiles(patternsDir)) {
    const pattern = parsePattern(md, f, `specs/patterns/${f}`)
    const unknown = pattern.components
      .map((c) => c.component)
      .filter((c) => !documented.has(c))
    if (unknown.length)
      throw new Error(
        `specs/patterns/${f}: Components names ${unknown.join(", ")}, which no component spec documents`
      )
    result[pattern.name] = pattern as unknown as JsonObject
  }
  return write("patterns.json", result)
}

// ── 13. dataviz-decision-tree.json ──────────────────────────────────
function generateDatavizDecisionTree() {
  const result = {
    objectives: [
      {
        name: "Evolution",
        description: "Show change over time",
        recommended_charts: ["line", "area", "difference"],
      },
      {
        name: "Correlation",
        description: "Show the relationship between variables",
        recommended_charts: ["bubble", "heatmap"],
      },
      {
        name: "Comparison",
        description: "Compare values",
        recommended_charts: ["bar", "cigarette", "radar"],
      },
      {
        name: "Distribution",
        description: "Show how values are spread",
        recommended_charts: ["histogram"],
      },
      {
        name: "Proportion",
        description: "Show the parts of a whole",
        recommended_charts: ["pie", "donut"],
      },
      {
        name: "KPI",
        description: "Show a key indicator",
        recommended_charts: ["data_card", "gauge", "mini_chart"],
      },
    ],
  }
  return write("dataviz-decision-tree.json", result)
}

// ── 14. dataviz-catalog.json ────────────────────────────────────────
function generateDatavizCatalog() {
  const chartTokens = [
    "--color-chart-1",
    "--color-chart-2",
    "--color-chart-3",
    "--color-chart-4",
    "--color-chart-5",
  ]
  // Ordered data (intensity, density) reads lightness, not hue.
  const sequentialTokens = [1, 2, 3, 4, 5].map(
    (n) => `--color-chart-sequential-${n}`
  )

  const catalog: JsonObject = {
    line: {
      name: "Line Chart",
      description: "Line chart for change over time",
      library: "recharts",
      component: "LineChart",
      tokens: chartTokens,
      anatomy: ["axes", "lines", "dots", "tooltip", "legend"],
      do: [
        "Keep it to 5 series at most",
        "Use the --color-chart-* tokens for the series colors",
        "Add a tooltip for the detailed values",
      ],
      dont: [
        "Do not use it to compare categories that are not over time",
        "Do not exceed 5 series in the same chart",
      ],
      variants: ["single", "multi", "stacked"],
    },
    area: {
      name: "Area Chart",
      description: "Area chart for volumes over time",
      library: "recharts",
      component: "AreaChart",
      tokens: chartTokens,
      anatomy: ["axes", "areas", "tooltip", "legend"],
      do: [
        "Use transparency for stacked areas",
        "Keep it to 3 series for readability",
      ],
      dont: [
        "Do not stack more than 3 series",
        "Do not use it without a time axis",
      ],
      variants: ["single", "stacked", "gradient"],
    },
    bar: {
      name: "Bar Chart",
      description: "Bar chart for comparing values across categories",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "bars", "tooltip", "legend"],
      do: [
        "Sort the bars by value when the order carries meaning",
        "Use horizontal bars when the labels are long",
      ],
      dont: [
        "Do not use it to show change over time (use line)",
        "Do not put more than 5 categories in a group",
      ],
      variants: ["vertical", "horizontal", "grouped", "stacked"],
    },
    pie: {
      name: "Pie Chart",
      description: "Pie chart for proportions",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["slices", "labels", "tooltip", "legend"],
      do: [
        "Keep it to 5 slices at most",
        "Group the small values into 'Other'",
      ],
      dont: [
        "Do not use it to compare precise values",
        "Do not show more than 6 slices",
      ],
      variants: ["full", "half"],
    },
    donut: {
      name: "Donut Chart",
      description: "A pie chart with a hole in the middle for a KPI",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["slices", "center_label", "tooltip", "legend"],
      do: ["Show the main KPI in the center", "Keep it to 5 slices at most"],
      dont: [
        "Do not nest several donuts",
        "Do not use it without a center value",
      ],
      variants: ["with_center_label", "minimal"],
    },
    radar: {
      name: "Radar Chart",
      description: "Radar chart for comparing entities across several axes",
      library: "recharts",
      component: "RadarChart",
      tokens: chartTokens,
      anatomy: ["axes", "polygons", "dots", "tooltip", "legend"],
      do: [
        "Use 5 to 8 axes for readability",
        "Normalize the data to a single scale",
      ],
      dont: [
        "Do not use it with fewer than 3 axes",
        "Do not compare more than 3 entities",
      ],
      variants: ["filled", "stroke_only"],
    },
    histogram: {
      name: "Histogram",
      description: "Histogram for the distribution of a variable",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "bars", "tooltip"],
      do: ["Use between 5 and 20 bins", "Use a single color for the bars"],
      dont: [
        "Do not confuse it with a categorical bar chart",
        "Do not leave gaps between the bars",
      ],
      variants: ["standard", "cumulative"],
    },
    bubble: {
      name: "Bubble Chart",
      description: "Sized scatter plot that shows 3 variables at once",
      library: "recharts",
      component: "ScatterChart",
      tokens: chartTokens,
      anatomy: ["axes", "bubbles", "tooltip", "legend"],
      do: [
        "Encode the third variable in the size of the point",
        "Add a size legend",
      ],
      dont: [
        "Do not plot more than 50 points",
        "Do not use it without an explanatory tooltip",
      ],
      variants: ["standard"],
    },
    heatmap: {
      name: "Heatmap",
      description: "Heatmap for density or correlation",
      library: "recharts",
      component: "custom",
      tokens: sequentialTokens,
      anatomy: ["grid", "cells", "color_scale", "tooltip", "axes"],
      do: [
        "Use the sequential palette color.chart.sequential.1 to 5 (lightest to darkest)",
        "Read each step through Tailwind's shorthand, bg-(--color-chart-sequential-N): the sequential palette has no Tailwind class, and bg-[var(--…)] is rejected",
        "Add labels inside the cells when there is room",
      ],
      dont: [
        "Do not use unordered colors",
        "Do not show more than 20×20 cells",
      ],
      variants: ["matrix", "calendar"],
    },
    data_card: {
      name: "Data Card",
      description: "KPI card showing a key value with a label and a trend",
      library: "native",
      component: "Card",
      tokens: [
        "--color-text-default",
        "--color-text-subtle",
        ...chartTokens.slice(0, 2),
      ],
      anatomy: ["label", "value", "trend", "icon"],
      do: [
        "Show a single metric per card",
        "Show the trend with an arrow or a percentage",
      ],
      dont: [
        "Do not crowd it with extra information",
        "Do not leave out the descriptive label",
      ],
      variants: ["simple", "with_trend", "with_sparkline"],
    },
    gauge: {
      name: "Gauge",
      description: "Circular or semi-circular gauge for a percentage KPI",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["arc", "needle", "value_label", "scale"],
      do: [
        "Show the value in the center",
        "Use color thresholds (green / yellow / red)",
      ],
      dont: [
        "Do not use it for unbounded values",
        "Do not nest several gauges",
      ],
      variants: ["semi_circle", "full_circle"],
    },
    mini_chart: {
      name: "Mini Chart (Sparkline)",
      description:
        "Inline micro-chart that shows a trend inside a table or a card",
      library: "recharts",
      component: "LineChart",
      tokens: chartTokens.slice(0, 1),
      anatomy: ["line", "area"],
      do: [
        "Keep it simple — no axes and no labels",
        "Use it in tables or data cards",
      ],
      dont: [
        "Do not show a complex tooltip",
        "Do not use it as the main chart",
      ],
      variants: ["line", "bar"],
    },
    difference: {
      name: "Difference Chart",
      description: "Chart showing the gap between two series over time",
      library: "recharts",
      component: "AreaChart",
      tokens: chartTokens.slice(0, 2),
      anatomy: ["axes", "areas", "baseline", "tooltip"],
      do: [
        "Color the positive and negative areas differently",
        "Add a reference line at zero",
      ],
      dont: [
        "Do not use it for more than 2 series",
        "Do not leave out the baseline",
      ],
      variants: ["standard"],
    },
    cigarette: {
      name: "Cigarette Chart (Stacked Bar 100%)",
      description:
        "100% stacked bar for comparing proportions across categories",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "segments", "tooltip", "legend"],
      do: ["Normalize to 100%", "Keep it to 5 segments per bar"],
      dont: [
        "Do not use it when the absolute values matter",
        "Do not use more than 5 categories",
      ],
      variants: ["horizontal", "vertical"],
    },
  }

  return write("dataviz-catalog.json", catalog)
}

// ── 15. ds-metadata.json ────────────────────────────────────────────
/**
 * Single source of truth for versions and identity, so no tool has to
 * hardcode them. Each field is read from the file `sources` names:
 *
 * - design_system_version: design-system.index.json
 * - mcp_server_version:    mcp-server/package.json
 * - registry_source:       registry.json. No ref: an address such as
 *   Toniio/DSAIReadable/button carries none, and the shadcn CLI reads the
 *   repository's default branch.
 * - stack, framework:      the root package.json dependencies
 * - shadcn_excluded:       design-system.index.json, the shadcn/ui components
 *   the design system does not ship, with the reason and what to use
 */
function generateDsMetadata() {
  const mcpPkg = JSON.parse(
    readFileSync(
      path.resolve(import.meta.dirname, "../../package.json"),
      "utf-8"
    )
  )
  const appPkg = readJSON("package.json")
  const registry = readJSON("registry.json")
  const deps: Record<string, string> = {
    ...appPkg.devDependencies,
    ...appPkg.dependencies,
  }
  const range = (name: string) => {
    if (!deps[name]) throw new Error(`package.json declares no "${name}"`)
    return deps[name]
  }
  const major = (name: string) => /\d+/.exec(range(name))?.[0]
  const repository = new URL(registry.homepage).pathname.replace(/^\/|\/$/g, "")

  return write("ds-metadata.json", {
    name: "DSAIReadable",
    description: "Design System AI-Readable",
    design_system_version: dsIndex.version,
    mcp_server_version: mcpPkg.version,
    registry_source: {
      repository,
      registry: registry.name,
      item_address: `${repository}/<item>`,
    },
    stack: {
      react: range("react"),
      next: range("next"),
      tailwindcss: range("tailwindcss"),
    },
    framework: `React ${major("react")} / Next.js ${major("next")} / Tailwind CSS v${major("tailwindcss")} / shadcn-ui`,
    shadcn_excluded: dsIndex.shadcn.excluded,
    sources: {
      design_system_version: "design-system.index.json#version",
      mcp_server_version: "mcp-server/package.json#version",
      registry_source: "registry.json#homepage,name",
      stack: "package.json#dependencies",
      shadcn_excluded: "design-system.index.json#shadcn.excluded",
    },
  })
}

// ── 16. deprecations.json ───────────────────────────────────────────
/**
 * Every token and component export the design system has deprecated, with what
 * replaces it (`dsaireadable_get_deprecations`). The plugin's lint lists come
 * from the same data: scripts/build-plugin-deprecations.ts.
 */
function generateDeprecations() {
  return write("deprecations.json", collectDeprecations(ROOT, semanticTokens))
}

// ── 17. changelog.json ──────────────────────────────────────────────
/** CHANGELOG.md, one entry per change (`dsaireadable_get_changelog`). */
function generateChangelog() {
  return write("changelog.json", parseChangelog(read("CHANGELOG.md")))
}

// ── Main ────────────────────────────────────────────────────────────
console.log("🔧 Generating context files...\n")

/**
 * Fail loudly when the inventory drifts from the files on disk. Without this,
 * a component can exist in `components/ui/` yet stay invisible to every agent
 * (which is exactly how Heading, Illustration, Logo and PasswordInput were lost).
 */
function checkInventoryCoverage(): string[] {
  const problems: string[] = []
  const inventoryPaths = new Set(inventory.map((c) => c.code_path))
  const inventoryNames = new Set(inventory.map((c) => c.name))

  for (const f of uiFiles) {
    const rel = `components/ui/${f}`
    if (!inventoryPaths.has(rel)) {
      problems.push(
        `${rel} exists on disk but is absent from design-system.index.json`
      )
    }
  }

  for (const c of inventory) {
    if (!existsSync(path.join(ROOT, c.code_path))) {
      problems.push(
        `${c.name} is listed in the inventory but ${c.code_path} does not exist`
      )
    }
  }

  for (const f of specFiles) {
    const specName = f.replace(".md", "")
    if (!inventoryNames.has(specName)) {
      problems.push(`specs/components/${f} has no matching inventory entry`)
    }
  }

  return problems
}

const generators: Array<[string, () => string]> = [
  ["components.json", generateComponents],
  ["component-specs.json", generateComponentSpecs],
  ["component-variants.json", generateComponentVariants],
  ["variables.json", generateVariables],
  ["semantic-tokens.json", generateSemanticTokens],
  ["layout-tokens.json", generateLayoutTokens],
  ["primitives.json", generatePrimitives],
  ["text-styles.json", generateTextStyles],
  ["icons.json", generateIcons],
  ["ux-writing.json", generateUxWriting],
  ["glossary.json", generateGlossary],
  ["content-library.json", generateContentLibrary],
  ["patterns.json", generatePatterns],
  ["dataviz-decision-tree.json", generateDatavizDecisionTree],
  ["dataviz-catalog.json", generateDatavizCatalog],
  ["ds-metadata.json", generateDsMetadata],
  ["deprecations.json", generateDeprecations],
  ["changelog.json", generateChangelog],
]

const results: Array<{ file: string; size: string }> = []
const failures: Array<{ file: string; error: string }> = []

for (const [name, gen] of generators) {
  try {
    const filePath = gen()
    const stat = statSync(filePath)
    const sizeKB = (stat.size / 1024).toFixed(1)
    results.push({ file: name, size: `${sizeKB} KB` })
    console.log(`  ✅ ${name.padEnd(30)} ${sizeKB} KB`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    failures.push({ file: name, error: message })
    console.error(`  ❌ ${name.padEnd(30)} FAILED: ${message}`)
    if (err instanceof Error && err.stack) console.error(err.stack)
  }
}

console.log(
  `\n✅ Generated ${results.length} / ${generators.length} context files.`
)
console.log(`   Output: ${CTX}\n`)

const coverageProblems = checkInventoryCoverage()
if (coverageProblems.length > 0) {
  console.error("❌ Inventory coverage errors:")
  for (const p of coverageProblems) console.error(`   • ${p}`)
  console.error("")
} else {
  console.log(
    `✅ Inventory coverage: ${inventory.length} components, no drift.\n`
  )
}

if (failures.length > 0 || coverageProblems.length > 0) {
  console.error(
    `❌ Context generation failed — ${failures.length} generator error(s), ${coverageProblems.length} coverage error(s).`
  )
  process.exit(1)
}
