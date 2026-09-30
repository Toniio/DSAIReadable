/**
 * Spec section linter — every component spec in `specs/components/` must
 * expose the thirteen canonical sections, in order, and nothing else; every
 * page pattern in `specs/patterns/`, its nine.
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

/**
 * The canonical order. Changing this list is a deliberate act: it rewrites
 * the contract for all specs at once, so every spec must be migrated in the
 * same commit or this linter fails.
 */
const COMPONENT_SECTIONS = [
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
]

/**
 * A page pattern, the Primer model: when to use it, its regions, the
 * components that fill them, their spacing, their text, and a screen that
 * shows it all (`dsaireadable_get_pattern` serves each section by name).
 */
const PATTERN_SECTIONS = [
  "Metadata",
  "Role",
  "Usage",
  "Structure",
  "Components",
  "Spacing",
  "Content",
  "Code example",
  "Cross-references",
]

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

function diagnose(found: string[], canonical: string[]): string[] {
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

const KINDS = [
  {
    kind: "component spec",
    dir: "specs/components",
    sections: COMPONENT_SECTIONS,
    extra: a11yProblems,
  },
  {
    kind: "page pattern",
    dir: "specs/patterns",
    sections: PATTERN_SECTIONS,
    extra: () => [],
  },
]

let failed = false

for (const { kind, dir, sections, extra } of KINDS) {
  const specs = readdirSync(resolve(ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .sort()

  if (specs.length === 0) {
    console.error(`❌ No ${kind} found in ${dir}`)
    failed = true
    continue
  }

  const failures: string[] = []
  for (const file of specs) {
    const markdown = readFileSync(resolve(ROOT, dir, file), "utf-8")
    const problems = [
      ...diagnose(sectionsOf(markdown), sections),
      ...extra(markdown),
    ]
    if (problems.length)
      failures.push(`   ${basename(file)} — ${problems.join("; ")}`)
  }

  if (failures.length) {
    console.error(
      `❌ ${failures.length}/${specs.length} ${kind}(s) deviate from the canonical section list:\n`
    )
    console.error(failures.join("\n"))
    console.error(
      `\n   Canonical order (${sections.length} sections):\n   ${sections.join(" · ")}`
    )
    failed = true
    continue
  }

  console.log(
    `✅ Spec sections: ${specs.length}/${specs.length} ${kind}s expose the ${sections.length} canonical sections in order.`
  )
}

if (failed) process.exit(1)
