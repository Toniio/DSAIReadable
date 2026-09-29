/**
 * Component spec section linter — every spec in `specs/components/` must
 * expose the thirteen canonical sections, in order, and nothing else.
 *
 * These specs are the behavioral source of truth served to agents by the
 * MCP server. An agent asking "what are this component's states?" gets
 * whatever the spec happens to contain: a missing section is not an empty
 * answer, it is a silently absent constraint the agent will generate past.
 * A renamed or extra section is worse — it drifts the shape the docs
 * promise, and the promise is what tooling and readers rely on.
 *
 *   npx tsx scripts/lint-spec-sections.ts
 */

import { readdirSync, readFileSync } from "node:fs"
import { resolve, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SPECS_DIR = resolve(ROOT, "specs/components")

/**
 * The canonical order. Changing this list is a deliberate act: it rewrites
 * the contract for all specs at once, so every spec must be migrated in the
 * same commit or this linter fails.
 */
const CANONICAL_SECTIONS = [
  "Metadata",
  "Role",
  "Usage",
  "Constraints",
  "Dependencies",
  "Anatomy",
  "Tokens",
  "Props / API",
  "Variants",
  "States",
  "Accessibility",
  "Code example",
  "Cross-references",
] as const

/** Fenced code blocks may contain `## ` lines that are not spec sections. */
function sectionsOf(markdown: string): string[] {
  const sections: string[] = []
  let inFence = false

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const heading = /^## (.+?)\s*$/.exec(line)
    if (heading) sections.push(heading[1])
  }

  return sections
}

function diagnose(found: string[]): string[] {
  const canonical = CANONICAL_SECTIONS as readonly string[]
  const problems: string[] = []

  const missing = canonical.filter((s) => !found.includes(s))
  const unknown = found.filter((s) => !canonical.includes(s))
  const duplicates = found.filter((s, i) => found.indexOf(s) !== i)

  if (missing.length) problems.push(`missing: ${missing.join(", ")}`)
  if (unknown.length) problems.push(`unknown: ${unknown.join(", ")}`)
  if (duplicates.length)
    problems.push(`duplicated: ${[...new Set(duplicates)].join(", ")}`)

  // Only report ordering once the set itself is right, otherwise the message
  // is noise on top of a more fundamental problem.
  if (!problems.length && found.join("|") !== canonical.join("|"))
    problems.push(`out of order: got ${found.join(" · ")}`)

  return problems
}

const specs = readdirSync(SPECS_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort()

if (specs.length === 0) {
  console.error(`❌ No component spec found in ${SPECS_DIR}`)
  process.exit(1)
}

/**
 * The Accessibility section has a fixed shape so an agent can read it the
 * same way in every spec. Each of these labels must open a paragraph there.
 */
const A11Y_LABELS = [
  "**Pattern**",
  "**Role**",
  "**Keyboard**",
  "**Accessible name**",
  "**Pitfalls**",
] as const

function a11yProblems(markdown: string): string[] {
  const start = markdown.indexOf("\n## Accessibility\n")
  if (start === -1) return []
  const end = markdown.indexOf("\n## ", start + 1)
  const body = markdown.slice(start, end === -1 ? undefined : end)
  const missing = A11Y_LABELS.filter((l) => !body.includes(`\n${l}:`))
  return missing.length ? [`Accessibility lacks ${missing.join(", ")}`] : []
}

const failures: string[] = []

for (const file of specs) {
  const markdown = readFileSync(resolve(SPECS_DIR, file), "utf-8")
  const found = sectionsOf(markdown)
  const problems = [...diagnose(found), ...a11yProblems(markdown)]

  if (problems.length)
    failures.push(`   ${basename(file)} — ${problems.join("; ")}`)
}

if (failures.length) {
  console.error(
    `❌ ${failures.length}/${specs.length} component spec(s) deviate from the canonical section list:\n`
  )
  console.error(failures.join("\n"))
  console.error(
    `\n   Canonical order (${CANONICAL_SECTIONS.length} sections):\n   ${CANONICAL_SECTIONS.join(" · ")}`
  )
  process.exit(1)
}

console.log(
  `✅ Spec sections: ${specs.length}/${specs.length} specs expose the ${CANONICAL_SECTIONS.length} canonical sections in order.`
)
