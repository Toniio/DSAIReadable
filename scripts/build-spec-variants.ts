/**
 * Writes the `## Variantes` section of every component spec from the variant
 * axes extracted from the code (mcp-server/context/component-variants.json,
 * itself generated from each cva() call).
 *
 * Variants were documented only in the MCP context: 2 specs of 59 said which
 * axes a component takes, so an agent reading a spec had to guess. Written by
 * hand, the section would drift the first time a variant is added; generated,
 * it cannot.
 *
 * A sub-component's axes (TabsList, ItemMedia…) are listed in the spec of the
 * component it belongs to, through the `part_of` field.
 *
 *   npx tsx scripts/build-spec-variants.ts [--check]
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { resolve, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const SPECS_DIR = resolve(ROOT, "specs/components")
const HEADING = "## Variantes"
/** The section is inserted before this one when a spec does not have it yet. */
const BEFORE = "## États"

type Entry = {
  variants: Record<string, { values: string[]; default: string | null }>
  part_of: string | null
  has_variants: boolean
}
const variants = JSON.parse(
  readFileSync(
    resolve(ROOT, "mcp-server/context/component-variants.json"),
    "utf-8"
  )
) as Record<string, Entry>

const code = (s: string) => `\`${s}\``

function sectionFor(spec: string): string {
  const owned = Object.entries(variants).filter(
    ([name, e]) => e.has_variants && (name === spec || e.part_of === spec)
  )
  const lines = [
    HEADING,
    "",
    "<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->",
    "",
  ]
  if (owned.length === 0) {
    lines.push(
      "Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens."
    )
  } else {
    lines.push("| Composant | Axe | Valeurs | Défaut |", "|---|---|---|---|")
    for (const [name, entry] of owned)
      for (const [axis, { values, default: def }] of Object.entries(
        entry.variants
      ))
        lines.push(
          `| ${code(name)} | ${code(axis)} | ${values.map(code).join(" · ")} | ${def === null ? "—" : code(def)} |`
        )
    lines.push(
      "",
      "Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**."
    )
  }
  return lines.join("\n") + "\n"
}

/** Replace the section if present, otherwise insert it before `## États`. */
function withSection(markdown: string, section: string): string {
  const start = markdown.indexOf(`\n${HEADING}\n`)
  if (start !== -1) {
    const next = markdown.indexOf("\n## ", start + 1)
    return (
      markdown.slice(0, start + 1) + section + "\n" + markdown.slice(next + 1)
    )
  }
  const at = markdown.indexOf(`\n${BEFORE}\n`)
  if (at === -1) throw new Error(`no "${BEFORE}" section to insert before`)
  return markdown.slice(0, at + 1) + section + "\n" + markdown.slice(at + 1)
}

const stale: string[] = []
for (const file of readdirSync(SPECS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = resolve(SPECS_DIR, file)
  const current = readFileSync(path, "utf-8")
  const next = await format(
    withSection(current, sectionFor(basename(file, ".md"))),
    {
      ...(await resolveConfig(path)),
      filepath: path,
    }
  )
  if (next === current) continue
  if (CHECK) stale.push(file)
  else writeFileSync(path, next)
}

if (CHECK && stale.length > 0) {
  console.error(
    `❌ build-spec-variants: ${stale.length} spec(s) out of date with the code's variant axes: ${stale.join(", ")}\n` +
      "   Run `npm run specs:variants` and commit the result."
  )
  process.exit(1)
}
console.log(
  CHECK
    ? "✅ build-spec-variants: every spec's Variantes section matches the code."
    : "✅ build-spec-variants: Variantes sections written."
)
