/**
 * Foundation example linter — every ```tsx and ```ts block of
 * `specs/foundations/` passes the ESLint config a consuming project runs.
 *
 * An agent copies a foundation's example as it is written: a native
 * `<button>` or an arbitrary value there comes back in every screen built
 * from it. Each block is linted with `@dsaireadable/eslint-plugin`'s
 * `recommended` config, as stage A of the conformance harness lints a screen
 * (`designSystemLinter`, evals/lib/static.ts), with inline `eslint-disable`
 * comments ignored:
 *
 * - a ts block, or a tsx block with an `export default`, is a module, linted
 *   as written; a tsx module that also imports what it renders is rendered by
 *   tests/examples.test.tsx (axe light and dark, a focus indicator on every
 *   tab stop);
 * - any other tsx block is a fragment: its imports move to the top, and the
 *   rest is wrapped in `export default function Example() { return (<>…</>) }`.
 *   A fragment holds JSX only: a statement there would become JSX text, which
 *   no rule reads, so it is an error;
 * - a block that does not parse is an error at its line;
 * - a counter-example, from a `// ❌` line to the next blank line or `// ✅` /
 *   `// ❌` line, may break a class rule (the one it illustrates), never use a
 *   native element, an external UI kit or an inline SVG.
 *
 *   npx tsx scripts/lint-foundation-examples.ts
 */

import { readdirSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { designSystemLinter } from "../evals/lib/static"
import { foundationBlocks, isCompleteModule } from "../tests/spec-examples"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = "specs/foundations"

/** The rules a `// ❌` counter-example may break: the class rules. */
const CLASS_RULES = new Set([
  "dsaireadable/no-raw-values",
  "dsaireadable/no-class-interpolation",
  "better-tailwindcss/no-unknown-classes",
  "better-tailwindcss/no-restricted-classes",
])

/** The first line of an import, and the line that ends one. */
const IMPORT_START = /^import\b/
const IMPORT_END = /\bfrom\s*["'][^"']+["']|^import\s*["'][^"']+["']/
/** A statement at the top level of a fragment, which can hold JSX only (text inside an element is indented). */
const STATEMENT = /^(?:export|const|let|var|function|class|type|interface)\b/

interface Module {
  source: string
  /** For each line of `source`, the line of the block it comes from (0 for a line of the wrapper). */
  origin: number[]
  /** Block lines that hold a statement in a fragment. */
  statements: number[]
}

/** The module ESLint reads for a block. */
function asModule(code: string, lang: "tsx" | "ts"): Module {
  const lines = code.replace(/\n$/, "").split("\n")
  const numbered = lines.map((_, i) => i + 1)
  if (lang === "ts" || /^export default /m.test(code))
    return { source: code, origin: numbered, statements: [] }

  const imports: number[] = []
  const body: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!IMPORT_START.test(lines[i])) {
      body.push(i)
      continue
    }
    while (i < lines.length) {
      imports.push(i)
      if (IMPORT_END.test(lines[i])) break
      i++
    }
  }
  const at = (indexes: number[]) => indexes.map((i) => lines[i])
  return {
    source: [
      ...at(imports),
      "export default function Example() {",
      "  return (",
      "    <>",
      ...at(body),
      "    </>",
      "  )",
      "}",
      "",
    ].join("\n"),
    origin: [
      ...imports.map((i) => i + 1),
      0,
      0,
      0,
      ...body.map((i) => i + 1),
      0,
      0,
      0,
    ],
    statements: body.filter((i) => STATEMENT.test(lines[i])).map((i) => i + 1),
  }
}

/** The lines of a block's counter-examples: from a `// ❌` line to the next blank line or `// ✅` / `// ❌` line. */
function counterExampleLines(code: string): Set<number> {
  const lines = new Set<number>()
  let inside = false
  code.split("\n").forEach((line, i) => {
    if (/^\s*$/.test(line) || /^\s*\/\/ ✅/.test(line)) inside = false
    if (/^\s*\/\/ ❌/.test(line)) inside = true
    if (inside) lines.add(i + 1)
  })
  return lines
}

const eslint = designSystemLinter(ROOT, { allowInlineConfig: false })
const errors: string[] = []
const files = readdirSync(resolve(ROOT, DIR))
  .filter((file) => file.endsWith(".md"))
  .sort()
let blocks = 0
let modules = 0
let allowed = 0

for (const file of files) {
  const markdown = readFileSync(resolve(ROOT, DIR, file), "utf8")
  let found
  try {
    found = foundationBlocks(markdown, `${DIR}/${file}`)
  } catch (error) {
    errors.push((error as Error).message)
    continue
  }
  for (const block of found) {
    blocks++
    if (block.lang === "tsx" && isCompleteModule(block.code)) modules++
    const { source, origin, statements } = asModule(block.code, block.lang)
    const last = block.code.replace(/\n$/, "").split("\n").length
    for (const line of statements)
      errors.push(
        `${DIR}/${file}:${block.line + line} a fragment holds JSX only: write the block as a module, with an export default`
      )
    const counter = counterExampleLines(block.code)
    // A path inside the repository, so the config's globs apply; nothing is written there.
    const [result] = await eslint.lintText(source, {
      filePath: resolve(ROOT, DIR, `${file}.${block.line}.tsx`),
    })
    for (const message of result.messages) {
      // A warning with no rule is ESLint saying the file was ignored: nothing was checked.
      if (message.severity !== 2 && message.ruleId !== null) continue
      const line = origin[message.line - 1] || last + 1
      if (
        !message.fatal &&
        CLASS_RULES.has(message.ruleId ?? "") &&
        counter.has(line)
      ) {
        allowed++
        continue
      }
      errors.push(
        `${DIR}/${file}:${block.line + line} ${message.fatal ? "does not parse" : (message.ruleId ?? "not linted")}: ${message.message}`
      )
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ lint-foundation-examples: ${errors.length} error(s)\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}
console.log(
  `✓ lint-foundation-examples: ${blocks} tsx and ts blocks in ${files.length} foundations pass the recommended config (${modules} rendered by tests/examples.test.tsx, ${allowed} counter-example finding(s) allowed)`
)
