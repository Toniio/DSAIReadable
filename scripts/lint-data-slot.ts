/**
 * data-slot lint — every component must be findable in rendered markup.
 *
 * `data-slot` is how this design system is introspected: it is what
 * `validate_screen` matches on, what the CSS targets across component
 * boundaries (`has-[[data-slot=input-group-control]:focus-visible]`), and what
 * lets a reviewer tell a Button from a div that looks like one. Four components
 * shipped without it, so they were invisible to all three.
 *
 * The check runs per exported component, not per file: one part carrying a
 * slot used to excuse every other export of its file, so InputGroupButton
 * rendered as a plain `button` slot and PaginationNext as a `pagination-link`.
 *
 * A component that renders no DOM node of its own cannot carry the attribute.
 * That is a real case — DirectionProvider is a context provider and nothing
 * else — but it has to be stated, with `// no-data-slot: <Name> <reason>`
 * naming the export, rather than left to look like an oversight.
 *
 *   npx tsx scripts/lint-data-slot.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = resolve(ROOT, "components/ui")

function isExported(statement: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement) ?? []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
  )
}

/** Exported components (PascalCase runtime exports) and their declarations. */
function exportedComponents(sf: ts.SourceFile): Map<string, ts.Node> {
  const declarations = new Map<string, ts.Node>()
  const exported = new Set<string>()

  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.set(statement.name.text, statement)
      if (isExported(statement)) exported.add(statement.name.text)
    } else if (ts.isVariableStatement(statement)) {
      for (const d of statement.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue
        declarations.set(d.name.text, d)
        if (isExported(statement)) exported.add(d.name.text)
      }
    } else if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const e of statement.exportClause.elements)
        if (!e.isTypeOnly) exported.add((e.propertyName ?? e.name).text)
    }
  }

  const components = new Map<string, ts.Node>()
  for (const name of exported) {
    const node = declarations.get(name)
    if (node && /^[A-Z]/.test(name)) components.set(name, node)
  }
  return components
}

function carriesSlot(node: ts.Node): boolean {
  if (ts.isJsxAttribute(node) && node.name.getText() === "data-slot")
    return true
  return ts.forEachChild(node, carriesSlot) ?? false
}

const findings: string[] = []
const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".tsx"))
  .sort()
let slotted = 0
let exempted = 0

for (const file of files) {
  const source = readFileSync(resolve(DIR, file), "utf-8")
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const components = exportedComponents(sf)
  const exemptions = new Set(
    [...source.matchAll(/\/\/[^\S\n]*no-data-slot:[^\S\n]*(\w+)/g)].map(
      (m) => m[1]
    )
  )

  for (const [name, node] of components) {
    const exempt = exemptions.has(name)
    if (carriesSlot(node)) {
      slotted++
      if (exempt)
        findings.push(
          `components/ui/${file}: ${name} carries a data-slot but is still ` +
            `declared "no-data-slot". Remove the stale exemption.`
        )
    } else if (exempt) {
      exempted++
    } else {
      findings.push(
        `components/ui/${file}: ${name} renders no data-slot, so nothing can ` +
          `target or recognize it. Add data-slot="<kebab-name>" to the element ` +
          `it renders, or declare why it renders none with ` +
          `"// no-data-slot: ${name} <reason>".`
      )
    }
  }

  for (const name of exemptions)
    if (!components.has(name))
      findings.push(
        `components/ui/${file}: "no-data-slot: ${name}" names no exported ` +
          `component of this file. Start the reason with the export's name.`
      )
}

if (findings.length > 0) {
  console.error(`❌ lint-data-slot: ${findings.length} violation(s).\n`)
  for (const f of findings) console.error(`   ${f}`)
  process.exit(1)
}

console.log(
  `✅ lint-data-slot: ${slotted}/${slotted + exempted} exported components ` +
    `across ${files.length} files carry data-slot, ${exempted} declared ` +
    `exception(s).`
)
