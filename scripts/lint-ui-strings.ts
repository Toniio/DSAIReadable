/**
 * A component must not invent the words it renders.
 *
 * Accessible names that never appear on screen - aria-label, title, sr-only
 * text, the default of a `label`, `title` or `description` prop, the text of a dialog title
 * a component writes for itself - are the ones that quietly
 * drift: nobody sees them, so nobody notices when one is English and the next
 * is French, or when a translator misses one because it is buried in JSX. They all come from lib/ui-strings.ts, so there
 * is a single place to read the product's voice and a single place to replace
 * it.
 *
 * Values that are not copy - ARIA tokens like aria-label="true", data
 * attributes, empty strings - are not flagged.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const DIR = "components/ui"
const SOURCE = "@/lib/ui-strings"

/** aria-* values that are part of the ARIA grammar, not text for a human. */
const ARIA_KEYWORDS = new Set([
  "true",
  "false",
  "none",
  "polite",
  "assertive",
  "off",
  "inline",
  "list",
  "both",
  "page",
  "step",
  "location",
  "date",
  "time",
  "dialog",
  "menu",
  "listbox",
  "tree",
  "grid",
  "vertical",
  "horizontal",
])

interface Finding {
  file: string
  line: number
  text: string
  kind: string
}

const findings: Finding[] = []

for (const name of readdirSync(DIR)
  .filter((f) => f.endsWith(".tsx"))
  .sort()) {
  const file = join(DIR, name)
  const lines = readFileSync(file, "utf8").split("\n")

  lines.forEach((line, index) => {
    const at = { file, line: index + 1 }

    for (const attr of ["aria-label", "title", "alt", "aria-description"]) {
      const match = line.match(new RegExp(`\\b${attr}="([^"]*)"`))
      if (!match) continue
      const value = match[1].trim()
      if (value === "" || ARIA_KEYWORDS.has(value)) continue
      findings.push({ ...at, text: `${attr}="${value}"`, kind: attr })
    }

    // A prop that carries an accessible name, given a literal default in its
    // destructuring (`clearLabel = "Clear"`, `title = "Command Palette"`): the
    // name is still hardcoded, only one step away from the JSX that renders it.
    const labelDefault = line.match(
      /(?<![\w-])(label|\w+Label|title|\w+Title|description|\w+Description)\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`$]*)`)/
    )
    if (labelDefault) {
      const value = (
        labelDefault[2] ??
        labelDefault[3] ??
        labelDefault[4]
      ).trim()
      if (value !== "") {
        findings.push({
          ...at,
          text: `${labelDefault[1]} = "${value}"`,
          kind: "default",
        })
      }
    }

    const srOnly = line.match(/className="sr-only"\s*>\s*([^<{][^<]*)</)
    if (srOnly && srOnly[1].trim() !== "") {
      findings.push({ ...at, text: srOnly[1].trim(), kind: "sr-only" })
    }

    // A title or description a component writes for itself - the sheet the
    // Sidebar becomes on mobile names itself - is announced like any label.
    const heading = line.match(
      /<(\w*(?:Title|Description))\b[^>]*>\s*([^<{\s][^<]*)<\/\1>/
    )
    if (heading) {
      findings.push({ ...at, text: heading[2].trim(), kind: heading[1] })
    }
  })
}

if (findings.length > 0) {
  console.error(`❌ lint-ui-strings: ${findings.length} hardcoded string(s).\n`)
  for (const f of findings) {
    console.error(`   ${f.file}:${f.line} [${f.kind}] ${f.text}`)
  }
  console.error(
    `\n   Move the wording to lib/ui-strings.ts and read it from there, so the` +
      `\n   component exposes one prop to override it instead of hiding a literal.`
  )
  process.exit(1)
}

const modules = readdirSync(DIR).filter((f) => f.endsWith(".tsx"))
const consumers = modules.filter((f) =>
  readFileSync(join(DIR, f), "utf8").includes(SOURCE)
).length

console.log(
  `✅ lint-ui-strings: no hardcoded accessible name, ${consumers} component(s) read lib/ui-strings.ts.`
)
