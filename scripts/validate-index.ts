/**
 * Index schema validation — `design-system.index.json` must satisfy
 * `design-system.schema.json`, and agree with the Metadata of every spec.
 *
 * The index is the machine-readable source of truth consumed by the MCP
 * server and by any LLM code generator. A malformed index is not a build
 * error: it silently feeds agents a shape they will happily generate
 * against. The schema is the only thing that catches it.
 *
 *   npx tsx scripts/validate-index.ts
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import Ajv from "ajv"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const read = (name: string) =>
  JSON.parse(readFileSync(resolve(ROOT, name), "utf-8"))

const schema = read("design-system.schema.json")
const index = read("design-system.index.json")

const ajv = new Ajv({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

/**
 * Metadata cross-check — the index and the spec each state a component's
 * status and code path. Two sources for one fact drift apart silently: an
 * agent reading the index sees "stable" while the spec says "beta".
 */
function metadataDrift(): string[] {
  const problems: string[] = []
  const inventory: { name: string; code_path: string; status: string }[] =
    index.inventory ?? []
  const listed = new Set(inventory.map((entry) => entry.name))

  for (const entry of inventory) {
    const specPath = `specs/components/${entry.name}.md`
    if (!existsSync(resolve(ROOT, specPath))) {
      problems.push(
        `${entry.name}: listed in the index, but ${specPath} does not exist`
      )
      continue
    }
    const metadata = specMetadata(
      readFileSync(resolve(ROOT, specPath), "utf-8")
    )
    for (const [field, key] of [
      ["Status", "status"],
      ["code_path", "code_path"],
    ] as const) {
      if (metadata.get(field) !== entry[key])
        problems.push(
          `${entry.name}: the index says ${key} "${entry[key]}", ${specPath} Metadata says ${field} "${metadata.get(field) ?? "(missing)"}"`
        )
    }
  }

  for (const file of readdirSync(resolve(ROOT, "specs/components"))) {
    const name = file.replace(/\.md$/, "")
    if (file.endsWith(".md") && !listed.has(name))
      problems.push(
        `${name}: specs/components/${file} exists, but the index does not list it`
      )
  }
  return problems
}

/** Reads the `| Field | Value |` table under `## Metadata`. */
function specMetadata(markdown: string): Map<string, string> {
  const section =
    markdown.split(/^## Metadata\s*$/m)[1]?.split(/^## /m)[0] ?? ""
  const rows = new Map<string, string>()
  for (const line of section.split("\n")) {
    const cells = line.split("|").map((cell) => cell.trim())
    if (cells.length >= 4 && cells[1] && !/^-+$/.test(cells[1]))
      rows.set(cells[1], cells[2])
  }
  return rows
}

const drift = metadataDrift()

if (validate(index) && drift.length === 0) {
  console.log(
    "✅ design-system.index.json conforms to design-system.schema.json and matches every spec's Metadata."
  )
  process.exit(0)
}

if (drift.length > 0) {
  console.error(
    `❌ design-system.index.json disagrees with the specs' Metadata: ${drift.length} difference(s).\n`
  )
  for (const problem of drift) console.error(`  ${problem}`)
  console.error("")
}

const errors = validate.errors ?? []
if (errors.length === 0) process.exit(1)
console.error(
  `❌ design-system.index.json: ${errors.length} schema violation(s).\n`
)
for (const e of errors) {
  const where = e.instancePath || "(root)"
  console.error(`  ${where} ${e.message}`)
  if (e.params && Object.keys(e.params).length > 0) {
    console.error(`    ${JSON.stringify(e.params)}`)
  }
}
process.exit(1)
