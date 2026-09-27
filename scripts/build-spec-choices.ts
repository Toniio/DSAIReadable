/**
 * Copies each choice rule of design-system.index.json into the Usage section
 * of the specs it applies to, so the index and the specs say the same thing.
 *
 * Choosing between sibling components was decided spec by spec, and the specs
 * disagreed: RadioGroup allowed up to 6 options while Combobox took over from
 * 5, nothing separated Select from NativeSelect but "on mobile", and no rule
 * said when a collection is an Item, a Card or a Table. A choice rule now
 * lives once, in `composition_rules` (decision P3-04: 5 / 15 options, the
 * `md` breakpoint, the nature of the content), with the components it covers
 * in `applies_to`. Each of those specs carries the rule verbatim as the last
 * bullet of its Usage section, which the MCP server serves.
 *
 *   npx tsx scripts/build-spec-choices.ts [--check]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const USAGE = "## Usage"

interface Rule {
  id: string
  rule: string
  applies_to?: string[]
}
const rules = (
  JSON.parse(
    readFileSync(resolve(ROOT, "design-system.index.json"), "utf-8")
  ) as { composition_rules: Rule[] }
).composition_rules.filter((r) => r.applies_to)

const marker = (id: string) =>
  `<!-- ${id} : généré depuis design-system.index.json par scripts/build-spec-choices.ts — ne pas éditer à la main. -->`
const MARKER = /^<!-- rule-\d+ : généré depuis design-system\.index\.json/
const CHOICE = /^- \*\*Choix\*\* \(`rule-\d+`\) — /

/** Usage bullets for one spec: its own, then the rules that apply to it. */
function withChoices(markdown: string, spec: string): string {
  const start = markdown.indexOf(`\n${USAGE}\n`)
  if (start === -1) throw new Error(`${spec}: no "${USAGE}" section`)
  const end = markdown.indexOf("\n## ", start + 1)
  const own = markdown
    .slice(start + USAGE.length + 2, end)
    .split("\n")
    // Drop a previous copy: its marker and its bullet.
    .filter((line) => !MARKER.test(line) && !CHOICE.test(line))
    .join("\n")
    .trim()
  const choices = rules
    .filter((r) => r.applies_to!.includes(spec))
    .map((r) => `${marker(r.id)}\n- **Choix** (\`${r.id}\`) — ${r.rule}`)
  const body = [own, ...choices].join("\n\n")
  return (
    markdown.slice(0, start + 1) + `${USAGE}\n\n${body}\n` + markdown.slice(end)
  )
}

const specs = [...new Set(rules.flatMap((r) => r.applies_to!))]
const unknown = specs.filter(
  (s) => !existsSync(resolve(ROOT, `specs/components/${s}.md`))
)
if (unknown.length > 0) {
  console.error(
    `❌ build-spec-choices: applies_to names no spec: ${unknown.join(", ")}`
  )
  process.exit(1)
}

const stale: string[] = []
for (const spec of specs) {
  const path = resolve(ROOT, `specs/components/${spec}.md`)
  const current = readFileSync(path, "utf-8")
  const next = await format(withChoices(current, spec), {
    ...(await resolveConfig(path)),
    filepath: path,
  })
  if (next === current) continue
  if (CHECK) stale.push(spec)
  else writeFileSync(path, next)
}

if (CHECK && stale.length > 0) {
  console.error(
    `❌ build-spec-choices: ${stale.length} spec(s) out of step with the choice rules of design-system.index.json: ${stale.join(", ")}\n` +
      "   Run `npm run specs:choices` and commit the result."
  )
  process.exit(1)
}
console.log(
  CHECK
    ? `✅ build-spec-choices: ${rules.length} choice rule(s), identical in the index and in ${specs.length} spec(s).`
    : `✅ build-spec-choices: ${rules.length} choice rule(s) written into ${specs.length} spec(s).`
)
