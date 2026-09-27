/**
 * Context generation script — reads all design system data sources
 * and produces 15 JSON files in mcp-server/context/.
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

/**
 * Extract a markdown section by heading (## Title). The section ends at the
 * next `## ` or at the end of the input — `(?![\s\S])`, since JavaScript has
 * no `\Z`: written `\Z`, it matched a literal "Z", so every section stopped at
 * its first capital Z and the last section of a spec was never found at all.
 */
function mdSection(md: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")
  const re = new RegExp(
    `^## ${escaped}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
    "m"
  )
  const m = md.match(re)
  return m ? m[1].trim() : ""
}

/** A table's `|---|:--:|` delimiter row */
const TABLE_DELIMITER = /^\|(\s*:?-+:?\s*\|)+\s*$/

/** Split a table row into cells; an escaped `\|` stays inside its cell */
function mdCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"))
}

interface MdTable {
  /** Nearest `###` heading above the table, backticks stripped ("" if none) */
  heading: string
  header: string[]
  rows: string[][]
}

/**
 * Parse every markdown table of a section, wherever it sits: each table keeps
 * its header apart from its body rows, and the delimiter row is dropped.
 */
function mdTables(section: string): MdTable[] {
  const tables: MdTable[] = []
  const lines = section.split("\n").map((l) => l.trim())
  let heading = ""
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith("### ")) {
      heading = line.slice(4).replace(/`/g, "").trim()
    } else if (TABLE_DELIMITER.test(line)) {
      continue
    } else if (line.startsWith("|")) {
      // A header row is the one right above its delimiter.
      if (TABLE_DELIMITER.test(lines[i + 1] ?? "")) {
        tables.push({ heading, header: mdCells(line), rows: [] })
      } else if (tables.length > 0) {
        tables[tables.length - 1].rows.push(mdCells(line))
      }
    }
  }
  return tables
}

/** Parse the body rows of every markdown table of a section */
function mdTable(section: string): string[][] {
  return mdTables(section).flatMap((t) => t.rows)
}

/** Parse bullet-list items from a section */
function mdBullets(section: string): string[] {
  return section
    .split("\n")
    .filter((l) => /^\s*-\s/.test(l))
    .map((l) => l.replace(/^\s*-\s+/, "").trim())
}

/** Extract fenced code block content */
function mdCode(section: string): string {
  const m = section.match(/```[\w]*\n([\s\S]*?)```/)
  return m ? m[1].trim() : ""
}

/** Narrow an arbitrary JSON value to a plain object (arrays and null excluded). */
function isJsonObject(val: Json): val is { [key: string]: Json } {
  return typeof val === "object" && val !== null && !Array.isArray(val)
}

/** Read the dark-mode override of a DTCG leaf, if it declares one. */
function darkValue(leaf: { [k: string]: Json }): string | undefined {
  const ext = leaf.$extensions
  if (!isJsonObject(ext)) return undefined
  const modes = ext.modes
  if (!isJsonObject(modes)) return undefined
  const dark = modes.dark
  if (!isJsonObject(dark)) return undefined
  const value = dark.$value
  return typeof value === "string" ? value : undefined
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

/** Resolve primitive reference like {color.mist.0} to its actual value */
function resolvePrimRef(ref: string, primitives: JsonObject): string {
  const m = ref.match(/^\{(.+)\}$/)
  if (!m) return ref
  let cur: Json = primitives
  for (const p of m[1].split(".")) {
    if (!isJsonObject(cur)) return ref
    cur = cur[p]
  }
  if (!isJsonObject(cur)) return ref
  const value = cur.$value
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ref
}

// ── Data loading ────────────────────────────────────────────────────
const dsIndex = readJSON("design-system.index.json")
const inventory: Array<{
  name: string
  code_path: string
  status: string
}> = dsIndex.inventory

const semanticTokens = readJSON("tokens/semantic.json")
const componentTokens = readJSON("tokens/component.json")
const primitiveTokens = readJSON("tokens/primitive.json")

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
    const nameRow = rows.find((r) => r[0]?.toLowerCase() === "nom")
    const catRow = rows.find((r) => r[0]?.toLowerCase() === "catégorie")
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

    const name = get("Nom") || baseName
    const category = get("Catégorie") || "Uncategorized"
    const status = get("Statut") || "stable"

    // Role
    const role = mdSection(md, "Rôle")

    // Usage
    const usage = mdBullets(mdSection(md, "Usage"))

    // Contraintes
    const constraints = mdBullets(mdSection(md, "Contraintes"))

    // Dépendances
    const dependencies = mdBullets(mdSection(md, "Dépendances"))

    // Anatomie
    const anatomyRows = mdTable(mdSection(md, "Anatomie"))
    const anatomy = anatomyRows.map((r) => ({
      slot: r[0] ?? "",
      role: r[1] ?? "",
    }))

    // Tokens utilisés — generated by scripts/build-spec-tokens.ts; columns
    // read by header name. Backticks are stripped: each cell is a list of
    // code names separated by " · ".
    const tokens = mdTables(mdSection(md, "Tokens utilisés")).flatMap((t) => {
      const col = (name: string) =>
        t.header.findIndex((h) => h.toLowerCase() === name)
      const [token, forms, where] = [
        col("token"),
        col("classes et variables"),
        col("où"),
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
    // "Compose `Button`, `Label` : …" — components whose specs hold the rest.
    const composeLine = mdSection(md, "Tokens utilisés")
      .split("\n")
      .find((l) => l.startsWith("Compose "))
    const tokensFrom = [
      ...(composeLine?.split(" : ")[0] ?? "").matchAll(/`(\w+)`/g),
    ].map((m) => m[1])

    // Props / API
    const propsSection = mdSection(md, "Props / API")
    // One table per sub-component under a `###` heading, or a single table.
    // Columns are read by header name: a table whose first column is not a
    // prop, a config property or a hook (e.g. a size → class mapping) is not
    // API and stays out of `props`.
    // Each export's block (scripts/build-spec-api.ts) opens with a one-line
    // summary: what a component renders, what a hook returns.
    const exports: { name: string; summary: string }[] = []
    const apiLines = propsSection.split("\n").map((l) => l.trim())
    apiLines.forEach((line, i) => {
      const heading = line.match(/^### `(.+)`$/)
      if (!heading) return
      const summary = apiLines
        .slice(i + 1)
        .find((l) => l !== "" && !l.startsWith("|"))
      exports.push({
        name: heading[1],
        summary: summary && !summary.startsWith("#") ? summary : "",
      })
    })
    const props = mdTables(propsSection).flatMap((t) => {
      const col = (...names: string[]) =>
        t.header.findIndex((h) => names.includes(h.toLowerCase()))
      if (col("prop", "propriété", "hook") !== 0) return []
      const type = col("type", "retour")
      const def = col("défaut")
      const desc = col("description")
      return t.rows.map((r) => ({
        component: t.heading || name,
        prop: r[0] ?? "",
        type: r[type] ?? "",
        default: r[def] ?? "",
        description: r[desc] ?? "",
      }))
    })

    // États
    const statesRows = mdTable(mdSection(md, "États"))
    const states = statesRows.map((r) => ({
      state: r[0] ?? "",
      behavior: r[1] ?? "",
    }))

    // Accessibilité — served as written: its fixed shape (Pattern, Rôle,
    // Clavier, Nom accessible, Vigilance) is checked by lint-spec-sections.
    const accessibility = mdSection(md, "Accessibilité")

    // Exemple de code
    const codeExample = mdCode(mdSection(md, "Exemple de code"))

    // Références croisées
    const crossRefSection = mdSection(md, "Références croisées")
    const crossRefBullets = mdBullets(crossRefSection)
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
    const code = readFileSync(path.join(uiDir, f), "utf-8")
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
    ...compFlat.map((t) => ({
      path: `shadcn.${t.path}`,
      value_light: t.$value,
      value_dark: t.$value,
      css_variable: toVar(t.path, ""),
      tier: "component",
    })),
  ]

  return write("variables.json", entries)
}

// ── 5. semantic-tokens.json ─────────────────────────────────────────
function generateSemanticTokens() {
  const flat = flattenDTCG(semanticTokens)
  const result = flat.map((t) => ({
    path: t.path,
    css_var: `--${t.path.replace(/\./g, "-")}`,
    light: t.$value,
    dark: darkValue(t) ?? t.$value,
    type: t.$type ?? "",
    status: statusOf(t),
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
    spacing_rules: mdBullets(mdSection(spacingMd, "Usage Rules")),
    radius_rules: mdBullets(mdSection(radiusMd, "Usage Rules")),
    elevation_rules: mdBullets(mdSection(elevationMd, "Usage Rules")),
  }
  return write("layout-tokens.json", result)
}

// ── 7. primitives.json ──────────────────────────────────────────────
function generatePrimitives() {
  const flat = flattenDTCG(primitiveTokens)
  const result = flat.map((t) => ({
    path: t.path,
    value: t.$value,
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

  // Font families
  const familyRows = mdTable(mdSection(typoMd, "Font Families"))
  const fontFamilies = familyRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    family: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Type scale
  const scaleRows = mdTable(mdSection(typoMd, "Type Scale (Sizes)"))
  const typeScale = scaleRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    rem: r[2] ?? "",
    px: r[3] ?? "",
    tailwind_class: r[4] ?? "",
    usage: r[5] ?? "",
  }))

  // Line heights
  const lhRows = mdTable(mdSection(typoMd, "Line Heights"))
  const lineHeights = lhRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Font weights
  const fwRows = mdTable(mdSection(typoMd, "Font Weights"))
  const fontWeights = fwRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Letter spacings
  const lsRows = mdTable(mdSection(typoMd, "Letter Spacings"))
  const letterSpacings = lsRows.map((r) => ({
    token: r[0] ?? "",
    css_variable: r[1] ?? "",
    value: r[2] ?? "",
    tailwind_class: r[3] ?? "",
    usage: r[4] ?? "",
  }))

  // Usage rules
  const usageRules = mdBullets(mdSection(typoMd, "Usage Rules"))

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
      "Le design system utilise exclusivement Phosphor Icons via @phosphor-icons/react.",
    default_size: "size-4 (1rem)",
    rule: rule?.rule ?? "",
    usage: [
      "Toutes les icônes doivent provenir de @phosphor-icons/react",
      "Taille par défaut dans les composants : size-4 (1rem)",
      "Aucune autre bibliothèque d'icônes n'est autorisée",
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

    // Extract Do/Don't lines
    const doRegex = /[✅❌]\s*(.+)/g
    let m
    while ((m = doRegex.exec(md)) !== null) {
      // A ✅/❌ inside a table row is a column header, not a rule.
      const lineStart = md.lastIndexOf("\n", m.index) + 1
      if (md.startsWith("|", lineStart)) continue
      generalRules.push({ rule: m[0].trim(), source: `${source}.md` })
    }

    // Usage rules — a bullet written "- ✅ …" was already taken above as a
    // Do/Don't line; keep it once.
    const usageRules = mdBullets(mdSection(md, "Usage Rules"))
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
    const constraints = mdBullets(mdSection(md, "Contraintes"))
    if (constraints.length > 0) {
      componentRules[name] = constraints
    }
  }

  // Composition rules of design-system.index.json, served by get_design_rules:
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
        "Ensemble cohérent de composants, tokens et règles qui garantissent la consistance visuelle et fonctionnelle d'un produit.",
    },
    {
      term: "variant",
      definition:
        "Déclinaison visuelle d'un composant (ex: default, outline, ghost pour un Button).",
    },
    {
      term: "composant",
      definition:
        "Élément UI réutilisable avec une API définie (props, slots, événements).",
    },
    {
      term: "foundation",
      definition:
        "Couche de base du design system — couleurs, typographie, espacement, élévation, radius, opacité, motion.",
    },
    {
      term: "slot",
      definition:
        "Point d'ancrage dans l'anatomie d'un composant, exposé via l'attribut data-slot.",
    },
    {
      term: "token",
      definition:
        "Design token — variable de design réutilisable qui encode une décision visuelle (couleur, espacement, etc.).",
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

  // Extract from page sources
  const pageFiles = ["app/banking/page.tsx", "app/login/fullscreen/page.tsx"]
  for (const pf of pageFiles) {
    try {
      const code = read(pf)
      // French string literals from JSX
      const stringRegex = /["'>]([A-ZÀ-Ÿ][a-zà-ÿ\s,'·—\-…]+)["'<]/g
      let m
      while ((m = stringRegex.exec(code)) !== null) {
        const val = m[1].trim()
        if (val.length > 2 && val.length < 80) {
          const key = val
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_àâäéèêëïîôùûüÿç]/g, "")
            .slice(0, 30)
          labels[key] = val
        }
      }
      // Placeholders from placeholder="..."
      const phRegex = /placeholder=["']([^"']+)["']/g
      while ((m = phRegex.exec(code)) !== null) {
        const key = m[1]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .slice(0, 30)
        placeholders[key] = m[1]
      }
    } catch (err) {
      console.warn(
        `  ⚠️  ux-writing: could not read ${pf} — ${(err as Error).message}`
      )
    }
  }

  // Extract from specs code examples
  for (const f of specFiles) {
    const md = readFileSync(path.join(specDir, f), "utf-8")
    const codeSection = mdSection(md, "Exemple de code")
    const code = mdCode(codeSection || md)
    if (code) {
      const labelRegex = />\s*([A-ZÀ-Ÿ][a-zà-ÿ\s']+)\s*</g
      let m
      while ((m = labelRegex.exec(code)) !== null) {
        const val = m[1].trim()
        if (val.length > 1 && val.length < 60) {
          const key = val
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_àâäéèêëïîôùûüÿç]/g, "")
            .slice(0, 30)
          labels[key] = val
        }
      }
    }
  }

  // Add common UI labels
  Object.assign(labels, {
    se_connecter: "Se connecter",
    annuler: "Annuler",
    confirmer: "Confirmer",
    enregistrer: "Enregistrer",
    supprimer: "Supprimer",
    fermer: "Fermer",
    suivant: "Suivant",
    précédent: "Précédent",
    rechercher: "Rechercher",
    virement: "Virement",
    paiement: "Paiement",
  })

  Object.assign(placeholders, {
    email: "nom@entreprise.fr",
    password: "••••••••",
    search: "Rechercher…",
  })

  Object.assign(messages, {
    error_generic: "Une erreur est survenue",
    error_network: "Erreur de connexion au serveur",
    success_saved: "Modifications enregistrées",
    empty_state: "Aucun résultat trouvé",
    loading: "Chargement en cours…",
    confirm_delete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
  })

  return write("content-library.json", { labels, placeholders, messages })
}

// ── 13. dataviz-decision-tree.json ──────────────────────────────────
function generateDatavizDecisionTree() {
  const result = {
    objectives: [
      {
        name: "Evolution",
        description: "Montrer un changement dans le temps",
        recommended_charts: ["line", "area", "difference"],
      },
      {
        name: "Correlation",
        description: "Montrer la relation entre variables",
        recommended_charts: ["bubble", "heatmap"],
      },
      {
        name: "Comparison",
        description: "Comparer des valeurs",
        recommended_charts: ["bar", "cigarette", "radar"],
      },
      {
        name: "Distribution",
        description: "Montrer la répartition",
        recommended_charts: ["histogram"],
      },
      {
        name: "Proportion",
        description: "Montrer les parts d'un tout",
        recommended_charts: ["pie", "donut"],
      },
      {
        name: "KPI",
        description: "Afficher un indicateur clé",
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
      description: "Graphique en ligne pour l'évolution temporelle",
      library: "recharts",
      component: "LineChart",
      tokens: chartTokens,
      anatomy: ["axes", "lines", "dots", "tooltip", "legend"],
      do: [
        "Limiter à 5 séries max",
        "Utiliser les tokens --color-chart-* pour les couleurs de séries",
        "Ajouter un tooltip pour le détail des valeurs",
      ],
      dont: [
        "Ne pas utiliser pour comparer des catégories non temporelles",
        "Ne pas dépasser 5 séries dans un même graphique",
      ],
      variants: ["single", "multi", "stacked"],
    },
    area: {
      name: "Area Chart",
      description: "Graphique en aire pour montrer les volumes dans le temps",
      library: "recharts",
      component: "AreaChart",
      tokens: chartTokens,
      anatomy: ["axes", "areas", "tooltip", "legend"],
      do: [
        "Utiliser la transparence pour les zones empilées",
        "Limiter à 3 séries pour la lisibilité",
      ],
      dont: [
        "Ne pas empiler plus de 3 séries",
        "Ne pas utiliser sans axe temporel",
      ],
      variants: ["single", "stacked", "gradient"],
    },
    bar: {
      name: "Bar Chart",
      description:
        "Graphique en barres pour comparer des valeurs entre catégories",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "bars", "tooltip", "legend"],
      do: [
        "Ordonner les barres par valeur quand c'est pertinent",
        "Utiliser des barres horizontales si les labels sont longs",
      ],
      dont: [
        "Ne pas utiliser pour montrer une évolution temporelle (préférer line)",
        "Ne pas surcharger avec plus de 5 catégories par groupe",
      ],
      variants: ["vertical", "horizontal", "grouped", "stacked"],
    },
    pie: {
      name: "Pie Chart",
      description: "Graphique circulaire pour les proportions",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["slices", "labels", "tooltip", "legend"],
      do: [
        "Limiter à 5 segments max",
        "Grouper les petites valeurs dans 'Autres'",
      ],
      dont: [
        "Ne pas utiliser pour comparer des valeurs précises",
        "Ne pas afficher plus de 6 segments",
      ],
      variants: ["full", "half"],
    },
    donut: {
      name: "Donut Chart",
      description: "Variante du pie chart avec un trou central pour un KPI",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["slices", "center_label", "tooltip", "legend"],
      do: ["Afficher le KPI principal au centre", "Limiter à 5 segments max"],
      dont: [
        "Ne pas imbriquer plusieurs donuts",
        "Ne pas utiliser sans valeur centrale",
      ],
      variants: ["with_center_label", "minimal"],
    },
    radar: {
      name: "Radar Chart",
      description:
        "Graphique radar pour comparer des entités sur plusieurs axes",
      library: "recharts",
      component: "RadarChart",
      tokens: chartTokens,
      anatomy: ["axes", "polygons", "dots", "tooltip", "legend"],
      do: [
        "Utiliser 5 à 8 axes pour la lisibilité",
        "Normaliser les données sur une même échelle",
      ],
      dont: [
        "Ne pas utiliser avec moins de 3 axes",
        "Ne pas comparer plus de 3 entités",
      ],
      variants: ["filled", "stroke_only"],
    },
    histogram: {
      name: "Histogram",
      description: "Histogramme pour montrer la distribution d'une variable",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "bars", "tooltip"],
      do: [
        "Choisir un nombre de bacs approprié (5-20)",
        "Utiliser une seule couleur pour les barres",
      ],
      dont: [
        "Ne pas confondre avec un bar chart catégoriel",
        "Ne pas utiliser de gaps entre les barres",
      ],
      variants: ["standard", "cumulative"],
    },
    bubble: {
      name: "Bubble Chart",
      description:
        "Nuage de points dimensionné pour montrer 3 variables simultanément",
      library: "recharts",
      component: "ScatterChart",
      tokens: chartTokens,
      anatomy: ["axes", "bubbles", "tooltip", "legend"],
      do: [
        "Encoder la troisième variable dans la taille du point",
        "Ajouter une légende de taille",
      ],
      dont: [
        "Ne pas surcharger avec plus de 50 points",
        "Ne pas utiliser sans tooltip explicatif",
      ],
      variants: ["standard"],
    },
    heatmap: {
      name: "Heatmap",
      description: "Carte de chaleur pour montrer la densité ou la corrélation",
      library: "recharts",
      component: "custom",
      tokens: sequentialTokens,
      anatomy: ["grid", "cells", "color_scale", "tooltip", "axes"],
      do: [
        "Utiliser la palette séquentielle color.chart.sequential.1 à 5 (du plus clair au plus foncé)",
        "Ajouter des labels dans les cellules si l'espace le permet",
      ],
      dont: [
        "Ne pas utiliser de couleurs non ordonnées",
        "Ne pas afficher trop de cellules (limiter à 20×20)",
      ],
      variants: ["matrix", "calendar"],
    },
    data_card: {
      name: "Data Card",
      description:
        "Carte de KPI affichant une valeur clé avec label et tendance",
      library: "native",
      component: "Card",
      tokens: [
        "--color-text-default",
        "--color-text-subtle",
        ...chartTokens.slice(0, 2),
      ],
      anatomy: ["label", "value", "trend", "icon"],
      do: [
        "Afficher une seule métrique par carte",
        "Indiquer la tendance avec une flèche ou un pourcentage",
      ],
      dont: [
        "Ne pas surcharger avec trop d'informations",
        "Ne pas omettre le label descriptif",
      ],
      variants: ["simple", "with_trend", "with_sparkline"],
    },
    gauge: {
      name: "Gauge",
      description:
        "Jauge circulaire ou semi-circulaire pour un KPI en pourcentage",
      library: "recharts",
      component: "PieChart",
      tokens: chartTokens,
      anatomy: ["arc", "needle", "value_label", "scale"],
      do: [
        "Afficher la valeur au centre",
        "Utiliser des seuils de couleur (vert/jaune/rouge)",
      ],
      dont: [
        "Ne pas utiliser pour des valeurs non bornées",
        "Ne pas imbriquer plusieurs jauges",
      ],
      variants: ["semi_circle", "full_circle"],
    },
    mini_chart: {
      name: "Mini Chart (Sparkline)",
      description:
        "Micro-graphique inline pour montrer une tendance dans un tableau ou une carte",
      library: "recharts",
      component: "LineChart",
      tokens: chartTokens.slice(0, 1),
      anatomy: ["line", "area"],
      do: [
        "Garder simple — pas d'axes ni de labels",
        "Utiliser dans les tableaux ou les data cards",
      ],
      dont: [
        "Ne pas afficher de tooltip complexe",
        "Ne pas utiliser comme graphique principal",
      ],
      variants: ["line", "bar"],
    },
    difference: {
      name: "Difference Chart",
      description: "Graphique montrant l'écart entre deux séries dans le temps",
      library: "recharts",
      component: "AreaChart",
      tokens: chartTokens.slice(0, 2),
      anatomy: ["axes", "areas", "baseline", "tooltip"],
      do: [
        "Colorer les zones positives et négatives différemment",
        "Ajouter une ligne de référence à zéro",
      ],
      dont: [
        "Ne pas utiliser pour plus de 2 séries",
        "Ne pas omettre la baseline",
      ],
      variants: ["standard"],
    },
    cigarette: {
      name: "Cigarette Chart (Stacked Bar 100%)",
      description:
        "Barre empilée à 100% pour comparer les proportions entre catégories",
      library: "recharts",
      component: "BarChart",
      tokens: chartTokens,
      anatomy: ["axes", "segments", "tooltip", "legend"],
      do: ["Normaliser à 100%", "Limiter à 5 segments par barre"],
      dont: [
        "Ne pas utiliser si les valeurs absolues sont importantes",
        "Ne pas surcharger avec trop de catégories",
      ],
      variants: ["horizontal", "vertical"],
    },
  }

  return write("dataviz-catalog.json", catalog)
}

// ── 15. page-patterns.json ──────────────────────────────────────────
function generatePagePatterns() {
  const pages: JsonObject[] = []

  // Banking Dashboard
  try {
    const code = read("app/banking/page.tsx")
    const importRegex =
      /import\s+\{([^}]+)\}\s+from\s+["']@\/components\/ui\/[^"']+["']/g
    const components: string[] = []
    let m
    while ((m = importRegex.exec(code)) !== null) {
      const names = m[1]
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
      // Keep only PascalCase root component names (not sub-components like TableRow)
      for (const n of names) {
        // Include the component
        components.push(n)
      }
    }
    // Deduplicate keeping unique root names
    const uniqueComponents = [...new Set(components)]

    pages.push({
      name: "Banking Dashboard",
      description:
        "Page d'accueil d'une app bancaire avec header, cartes de compte, actions rapides et onglets transactions/budget",
      source: "app/banking/page.tsx",
      structure: [
        "Header with logo, app name, notifications, and avatar",
        "Welcome section with greeting and date",
        "Account cards grid (3 columns)",
        "Quick actions bar (Virement, Paiement, RIB, Plafonds)",
        "Tabs: Transactions récentes / Budget mensuel",
        "Transactions table with status badges",
        "Budget cards with progress bars",
        "Footer with copyright",
      ],
      components_used: uniqueComponents,
    })
  } catch (err) {
    console.warn(
      `  ⚠️  page-patterns: skipped "Banking Dashboard" (app/banking/page.tsx) — ${(err as Error).message}`
    )
  }

  // Login Fullscreen
  try {
    const code = read("app/login/fullscreen/page.tsx")
    const importRegex =
      /import\s+\{([^}]+)\}\s+from\s+["']@\/components\/ui\/[^"']+["']/g
    const components: string[] = []
    let m
    while ((m = importRegex.exec(code)) !== null) {
      const names = m[1]
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
      for (const n of names) {
        components.push(n)
      }
    }
    const uniqueComponents = [...new Set(components)]

    pages.push({
      name: "Login Fullscreen",
      description:
        "Page de connexion plein écran avec fond sombre inversé, motif de points, formulaire centré",
      source: "app/login/fullscreen/page.tsx",
      structure: [
        "Dark inverse background with dot pattern",
        "Centered form container (max-w-sm)",
        "Logo",
        "Heading and description",
        "Email field with label",
        "Password field with label",
        "Remember me checkbox + Forgot password link",
        "Submit button (full width, inverse colors)",
        "Sign up link",
      ],
      components_used: uniqueComponents,
    })
  } catch (err) {
    console.warn(
      `  ⚠️  page-patterns: skipped "Login Fullscreen" (app/login/fullscreen/page.tsx) — ${(err as Error).message}`
    )
  }

  return write("page-patterns.json", pages)
}

// ── 16. ds-metadata.json ────────────────────────────────────────────
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
    sources: {
      design_system_version: "design-system.index.json#version",
      mcp_server_version: "mcp-server/package.json#version",
      registry_source: "registry.json#homepage,name",
      stack: "package.json#dependencies",
    },
  })
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
  ["dataviz-decision-tree.json", generateDatavizDecisionTree],
  ["dataviz-catalog.json", generateDatavizCatalog],
  ["page-patterns.json", generatePagePatterns],
  ["ds-metadata.json", generateDsMetadata],
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
