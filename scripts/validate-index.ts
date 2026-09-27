/**
 * Index schema validation — `design-system.index.json` must satisfy
 * `design-system.schema.json`.
 *
 * The index is the machine-readable source of truth consumed by the MCP
 * server and by any LLM code generator. A malformed index is not a build
 * error: it silently feeds agents a shape they will happily generate
 * against. The schema is the only thing that catches it.
 *
 *   npx tsx scripts/validate-index.ts
 */

import { readFileSync } from "node:fs"
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

if (validate(index)) {
  console.log(
    "✅ design-system.index.json conforms to design-system.schema.json."
  )
  process.exit(0)
}

const errors = validate.errors ?? []
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
