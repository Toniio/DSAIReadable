/**
 * Page patterns, read from Markdown in two places with one parser: the
 * design system's own specs/patterns/ (compiled into patterns.json by
 * src/context/generate.ts) and a consumer project's design/patterns/, read
 * when the server runs inside that project. The project's pattern wins when
 * both define the same name.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  mdCode,
  mdListItems,
  mdRecords,
  mdSection,
  mdTable,
} from "./markdown.js"
import type { Pattern } from "./response-format.js"

const PATTERN_KINDS: Record<string, "task" | "ui"> = {
  Task: "task",
  UI: "ui",
}

/** Where a consumer project keeps its own patterns, relative to its root. */
const PROJECT_PATTERNS_DIR = "design/patterns"

/**
 * One pattern file, parsed. `source` is the path the pattern came from, named
 * in every error so the file can be fixed.
 */
export function parsePattern(
  md: string,
  file: string,
  source: string
): Pattern {
  const meta = mdTable(mdSection(md, "Metadata"))
  const get = (label: string) =>
    meta.find((r) => r[0]?.toLowerCase() === label)?.[1] ?? ""
  const name = file.replace(/\.md$/, "")
  const kind = PATTERN_KINDS[get("kind")]
  if (get("name") !== name) throw new Error(`${source}: Name is not "${name}"`)
  if (!kind)
    throw new Error(
      `${source}: Kind "${get("kind")}" is not one of ${Object.keys(PATTERN_KINDS).join(", ")}`
    )
  return {
    name,
    title: /^# (.+)$/m.exec(md)?.[1] ?? name,
    kind,
    role: mdSection(md, "Role"),
    usage: mdListItems(mdSection(md, "Usage")),
    structure: mdRecords(mdSection(md, "Structure")),
    components: mdRecords(mdSection(md, "Components")) as Array<{
      component: string
    }>,
    spacing: mdListItems(mdSection(md, "Spacing")),
    content: mdRecords(mdSection(md, "Content")),
    code_example: mdCode(mdSection(md, "Code example")),
    cross_references: mdListItems(mdSection(md, "Cross-references")),
    source,
  }
}

/** The pattern files of a directory, sorted, as [file name, contents]. */
export function patternFiles(dir: string): [string, string][] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => [f, readFileSync(join(dir, f), "utf-8")])
}

/**
 * The patterns of the project the server runs in (`design/patterns/*.md`), by
 * name; none when the folder does not exist. A file that does not parse throws,
 * naming the file: a pattern silently dropped would leave the agent on the
 * design system's version of it without a word.
 */
export function loadProjectPatterns(
  projectDir: string
): Record<string, Pattern> {
  const dir = join(projectDir, PROJECT_PATTERNS_DIR)
  if (!existsSync(dir)) return {}
  return Object.fromEntries(
    patternFiles(dir).map(([file, md]) => {
      const pattern = parsePattern(md, file, `${PROJECT_PATTERNS_DIR}/${file}`)
      return [pattern.name, pattern]
    })
  )
}
