/**
 * Anatomy lint — a spec's Anatomy table names the `data-slot`s its component
 * renders, all of them and only them.
 *
 * The Anatomy is where an agent learns what to target: a selector, a
 * `has-[[data-slot=…]]` rule, a `dsaireadable_validate_screen` match. Written
 * by hand, it drifted from the code: Spinner's said the root had no slot while
 * it renders `spinner`, Sonner's named a `<Sonner>` root that renders
 * `toaster`, Questionnaire's left out eight slots, and Combobox's never named
 * the `input-group-button` its input renders.
 *
 * Rules, per component spec:
 *   ① every `data-slot="…"` the Anatomy table names is rendered by the
 *      component file, or by a `components/ui` file it imports (PasswordInput
 *      renders `input-group-control` through `InputGroupInput`);
 *   ② every `data-slot="…"` the component file writes is named in the table.
 * A row may describe a part that carries no slot (Alert's icon, Logo's svg):
 * it names none, so neither rule reads it.
 *
 *   npx tsx scripts/lint-spec-anatomy.ts
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SPECS = resolve(ROOT, "specs/components")

/** The `data-slot` values a file writes as string literals on JSX elements. */
function slotsOf(file: string): Set<string> {
  const sf = ts.createSourceFile(
    file,
    readFileSync(resolve(ROOT, file), "utf-8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const slots = new Set<string>()
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText() === "data-slot" &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    )
      slots.add(node.initializer.text)
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return slots
}

/** The `components/ui` files a component file imports. */
function importedComponents(file: string): string[] {
  const source = readFileSync(resolve(ROOT, file), "utf-8")
  return [...source.matchAll(/from "@\/components\/ui\/([\w-]+)"/g)]
    .map((m) => `components/ui/${m[1]}.tsx`)
    .filter((f) => existsSync(resolve(ROOT, f)))
}

/** The slots named in the first column of the Anatomy table. */
function anatomySlots(markdown: string): Set<string> {
  const start = markdown.indexOf("\n## Anatomy\n")
  if (start === -1) return new Set()
  const end = markdown.indexOf("\n## ", start + 1)
  const slots = new Set<string>()
  for (const line of markdown.slice(start, end).split("\n")) {
    if (!line.startsWith("|")) continue
    const cell = line.split("|")[1] ?? ""
    for (const m of cell.matchAll(/data-slot="([^"]+)"/g)) slots.add(m[1])
  }
  return slots
}

const findings: string[] = []
const specs = readdirSync(SPECS)
  .filter((f) => f.endsWith(".md"))
  .sort()

for (const spec of specs) {
  const markdown = readFileSync(resolve(SPECS, spec), "utf-8")
  const codePath = /\|\s*code_path\s*\|\s*([^|\s]+)\s*\|/.exec(markdown)?.[1]
  if (!codePath || !existsSync(resolve(ROOT, codePath))) {
    findings.push(`${spec}: its Metadata names no component file (code_path).`)
    continue
  }

  const named = anatomySlots(markdown)
  const own = slotsOf(codePath)
  const reachable = new Set(own)
  for (const file of importedComponents(codePath))
    for (const slot of slotsOf(file)) reachable.add(slot)

  for (const slot of named)
    if (!reachable.has(slot))
      findings.push(
        `${spec}: Anatomy names data-slot="${slot}", which neither ` +
          `${codePath} nor a component it imports renders.`
      )
  for (const slot of own)
    if (!named.has(slot))
      findings.push(
        `${spec}: ${codePath} renders data-slot="${slot}", which the ` +
          `Anatomy table does not name.`
      )
}

if (findings.length > 0) {
  console.error(`❌ lint-spec-anatomy: ${findings.length} violation(s).\n`)
  for (const f of findings) console.error(`   ${f}`)
  console.error(
    `\n   Name each rendered slot in the first column as \`data-slot="…"\`, and only those.`
  )
  process.exit(1)
}

console.log(
  `✅ lint-spec-anatomy: ${specs.length} Anatomy tables name every data-slot their component renders, and only those.`
)
