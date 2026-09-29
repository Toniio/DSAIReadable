/**
 * data-slot lint — every component must be findable in rendered markup.
 *
 * `data-slot` is how this design system is introspected: it is what
 * `validate_screen` matches on, what the CSS targets across component
 * boundaries (`has-[[data-slot=input-group-control]:focus-visible]`), and what
 * lets a reviewer tell a Button from a div that looks like one. Four components
 * shipped without it, so they were invisible to all three.
 *
 * A component that renders no DOM node of its own cannot carry the attribute.
 * That is a real case — DirectionProvider is a context provider and nothing
 * else — but it has to be stated, with `// no-data-slot: <reason>`, rather than
 * left to look like an oversight.
 *
 *   npx tsx scripts/lint-data-slot.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = resolve(ROOT, "components/ui")

const findings: string[] = []
const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx"))

for (const file of files) {
  const source = readFileSync(resolve(DIR, file), "utf-8")
  if (/\bdata-slot=/.test(source)) continue
  const exempt = source.match(/\/\/[^\S\n]*no-data-slot:[^\S\n]*(\S[^\n]*)/)
  if (exempt) continue
  findings.push(
    `components/ui/${file} renders no data-slot, so nothing can target or ` +
      `recognize it. Add data-slot="<kebab-name>" to the root element, or ` +
      `declare why it renders no element with "// no-data-slot: <reason>".`
  )
}

if (findings.length > 0) {
  console.error(`❌ lint-data-slot: ${findings.length} violation(s).\n`)
  for (const f of findings) console.error(`   ${f}`)
  process.exit(1)
}

const exempt = files.filter((f) =>
  /\/\/\s*no-data-slot:/.test(readFileSync(resolve(DIR, f), "utf-8"))
).length
console.log(
  `✅ lint-data-slot: ${files.length - exempt}/${files.length} components carry data-slot, ` +
    `${exempt} declared exception(s).`
)
