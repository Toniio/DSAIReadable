/**
 * Test coverage guard — every component is tested from its spec.
 *
 * 1. Every component of `design-system.index.json` has a spec with a TSX
 *    `## Code example`, which `tests/examples.test.tsx` renders and audits
 *    (axe in both themes, a focus indicator on every tab stop).
 * 2. Every spec whose Accessibility › Keyboard table lists keys has a test
 *    file, `tests/components/<file>.test.tsx` (the component's source file
 *    name), with one test per row, titled with the row's keys as the spec
 *    writes them, backticks removed:
 *
 *      | `Tab` / `Shift+Tab` | Moves through …  →  it("Tab / Shift+Tab: moves through …")
 *
 *    and one test titled `role: …` and one `accessible name: …`, which check
 *    the Role and Accessible name the spec documents.
 *
 * A key added to a spec without its test, a deleted test or a new component
 * without a renderable example fails here, before the suite runs.
 *
 *   npx tsx scripts/lint-test-coverage.ts
 */

import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { specExample } from "../tests/spec-examples"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

type Component = { name: string; code_path: string }

const inventory: Component[] = JSON.parse(
  readFileSync(resolve(ROOT, "design-system.index.json"), "utf8")
).inventory

/** The keys of each row of the spec's Keyboard table, backticks removed. */
function keyboardRows(spec: string): string[] {
  const block = /^\*\*Keyboard\*\*:\n([\s\S]*?)(?=^\*\*|^## )/m.exec(spec)?.[1]
  if (!block) return []
  // The table's body: every row after the header and its separator.
  return block
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) => line.split("|")[1].replaceAll("`", "").trim())
}

function titled(test: string, title: string): boolean {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`it\\(\\s*["'\`]${escaped}: `).test(test)
}

const errors: string[] = []
let keys = 0
let files = 0

const examples = readFileSync(resolve(ROOT, "tests/examples.test.tsx"), "utf8")
if (!examples.includes("index.inventory")) {
  errors.push(
    "tests/examples.test.tsx: no longer iterates index.inventory — every component must be rendered from its spec"
  )
}

for (const { name, code_path } of inventory) {
  const specPath = `specs/components/${name}.md`
  if (!existsSync(resolve(ROOT, specPath))) {
    errors.push(`${name}: no ${specPath}, so no example to render`)
    continue
  }
  const spec = readFileSync(resolve(ROOT, specPath), "utf8")
  try {
    specExample(spec)
  } catch (error) {
    errors.push(`${specPath}: ${(error as Error).message}`)
  }

  const rows = keyboardRows(spec)
  if (rows.length === 0) continue
  const testPath = `tests/components/${basename(code_path, ".tsx")}.test.tsx`
  if (!existsSync(resolve(ROOT, testPath))) {
    errors.push(
      `${name}: ${specPath} documents ${rows.length} keyboard row(s) and ${testPath} does not exist`
    )
    continue
  }
  files++
  const test = readFileSync(resolve(ROOT, testPath), "utf8")
  for (const title of ["role", "accessible name", ...rows]) {
    if (!titled(test, title)) {
      errors.push(`${testPath}: no it("${title}: …") for ${specPath}`)
    }
  }
  keys += rows.length
}

if (errors.length > 0) {
  console.error(`✗ lint-test-coverage: ${errors.length} error(s)\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}
console.log(
  `✓ lint-test-coverage: ${inventory.length} components rendered from their spec, ${keys} keyboard rows tested in ${files} files`
)
