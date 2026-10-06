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
 *
 * The strings themselves follow the voice (specs/foundations/voice-and-tone.md):
 * sentence case, `…` as one character, no word the word list rejects, and no
 * final period or exclamation mark on an accessible name.
 *
 * Each one has its row in the Overriding table of specs/foundations/content.md,
 * with the prop that replaces it and the same default.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { UI_STRINGS } from "../lib/ui-strings.js"

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
    // A JSDoc line is documentation, never rendered: the `@example` of an
    // export is JSX with wording of its own.
    if (/^\s*(\/\*\*|\*)/.test(line)) return
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

/**
 * The word list of voice-and-tone.md: each term the interface does not use,
 * with the one it uses instead.
 */
const REJECTED: [RegExp, string][] = [
  [/\b(please|oops|whoops)\b/i, "nothing: drop the word"],
  [/\b(log ?in|log on)\b/i, "sign in"],
  [/\be-mail\b/i, "email"],
  [/\b(click|tap|hit)\b/i, "select"],
]

/**
 * Proper nouns the defaults may capitalize past the first word. Empty today:
 * add a name only when a default string needs it.
 */
const PROPER_NOUNS = new Set<string>()

/** Every default string, keyed by its path; a function is called on a sample. */
function strings(node: object, path: string[] = []): [string, string][] {
  return Object.entries(node).flatMap(([key, value]) => {
    const at = [...path, key]
    if (typeof value === "string") return [[at.join("."), value]]
    if (typeof value === "function") return [[at.join("."), value("item")]]
    return strings(value as object, at)
  }) as [string, string][]
}

const voice: string[] = []

for (const [path, value] of strings(UI_STRINGS)) {
  const fail = (why: string) =>
    voice.push(`UI_STRINGS.${path} "${value}": ${why}`)
  const [first, ...rest] = value.split(/\s+/)
  if (!/^\p{Lu}/u.test(first)) fail("starts in lowercase (sentence case)")
  const capitalized = rest.filter(
    (word) => /\p{Lu}/u.test(word) && !PROPER_NOUNS.has(word)
  )
  if (capitalized.length > 0) {
    fail(`capitalizes ${capitalized.join(", ")} (sentence case)`)
  }
  if (value.includes("...")) fail("three periods: write … as one character")
  for (const [pattern, instead] of REJECTED) {
    const word = value.match(pattern)
    if (word) fail(`"${word[0]}" is on the word list, write ${instead}`)
  }
  if (!path.endsWith("Description") && /[.!]$/.test(value)) {
    fail("an accessible name takes no final period or exclamation mark")
  }
}

if (voice.length > 0) {
  console.error(
    `❌ lint-ui-strings: ${voice.length} default string(s) break the voice.\n`
  )
  for (const v of voice) console.error(`   ${v}`)
  console.error(`\n   See specs/foundations/voice-and-tone.md.`)
  process.exit(1)
}

/**
 * The Overriding table of content.md: one row per key of `UI_STRINGS`, with
 * the prop that replaces it and its default. Agents read the spec, not the
 * code: a key missing there is a string they cannot replace.
 */
const SPEC = "specs/foundations/content.md"
const table: string[] = []

function overridingRows(): Map<string, string> {
  const markdown = readFileSync(SPEC, "utf8")
  const section = markdown
    .split(/^## /m)
    .find((s) => s.startsWith("Overriding"))
  const rows = new Map<string, string>()
  for (const line of (section ?? "").split("\n")) {
    const cells = line.split("|").map((cell) => cell.trim())
    const key = cells[1]?.match(/^`([\w.]+)(?:\(item\))?`$/)?.[1]
    if (!key) continue
    if (rows.has(key)) table.push(`\`${key}\` has two rows`)
    rows.set(key, cells[4]?.replace(/^`|`$/g, "") ?? "")
  }
  return rows
}

const rows = overridingRows()
const codeStrings = new Map(
  Object.entries(UI_STRINGS).flatMap(([group, entries]) =>
    Object.entries(entries as Record<string, unknown>).map(([key, value]) => [
      `${group}.${key}`,
      typeof value === "function"
        ? String((value as (item: string) => string)("{item}"))
        : String(value),
    ])
  )
)

for (const [key, value] of codeStrings) {
  const row = rows.get(key)
  if (row === undefined) table.push(`\`${key}\` has no row`)
  else if (row !== value)
    table.push(`\`${key}\`: the table says "${row}", the code "${value}"`)
}
for (const key of rows.keys()) {
  if (!codeStrings.has(key)) table.push(`\`${key}\` is not a key of UI_STRINGS`)
}

if (table.length > 0) {
  console.error(
    `❌ lint-ui-strings: the Overriding table of ${SPEC} is out of step with lib/ui-strings.ts.\n`
  )
  for (const t of table) console.error(`   ${t}`)
  process.exit(1)
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
  `✅ lint-ui-strings: no hardcoded accessible name, ${consumers} component(s) read lib/ui-strings.ts, ${strings(UI_STRINGS).length} default strings follow the voice and have their row in the Overriding table of ${SPEC}.`
)
