/**
 * Skills validation — the agent skills of `skills/` against the Agent Skills
 * format (agentskills.io/specification, the checks of its reference validator
 * `skills-ref validate`) and against this repository.
 *
 * The format:
 *   - each skill is a folder holding a SKILL.md that opens with a YAML
 *     frontmatter: only the fields the format knows, `name` and `description`
 *     required;
 *   - `name`: 1 to 64 lowercase letters, digits and hyphens, no leading,
 *     trailing or double hyphen, the folder's name, and neither "anthropic"
 *     nor "claude" (reserved by the Claude API);
 *   - `description`: 1 to 1024 characters, no XML tag; `compatibility`: at most
 *     500; `metadata`: string values only;
 *   - a body under 500 lines; files referenced one level deep from SKILL.md.
 *
 * This repository:
 *   - every relative link or `references/…` path resolves inside the skill,
 *     and every file of `references/` is named by SKILL.md;
 *   - every rule (a list item opening with **MUST**, **NEVER** or **SHOULD**)
 *     cites its source, and every citation resolves: `spec:<Component>` to
 *     specs/components/, `pattern:<name>` to specs/patterns/,
 *     `foundation:<name>` to specs/foundations/ — a skill points at the rule,
 *     it never becomes a second copy of it;
 *   - every `dsaireadable_*` tool it names is one the MCP server registers.
 *
 *   npx tsx scripts/validate-skills.ts
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SKILLS = join(ROOT, "skills")

const ALLOWED_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
])
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_BODY_LINES = 500

const CITATION = /`(spec|pattern|foundation):([\w-]+)`/g
const CITED_DIR = {
  spec: "specs/components",
  pattern: "specs/patterns",
  foundation: "specs/foundations",
} as const
const RULE = /^- \*\*(MUST|NEVER|SHOULD)\*\*/

/** The tools the MCP server registers, read from its sources. */
function registeredTools(): Set<string> {
  const dir = join(ROOT, "mcp-server/src/tools")
  const names = new Set<string>()
  for (const file of readdirSync(dir))
    for (const m of readFileSync(join(dir, file), "utf-8").matchAll(
      /registerTool\(\s*"(dsaireadable_\w+)"/g
    ))
      names.add(m[1])
  return names
}

type Frontmatter = Record<string, string | Record<string, string>>

/**
 * The frontmatter subset skills use: `key: value` on one line, and one level of
 * nested `key: value` under a key with no value (`metadata`). Anything else is
 * reported rather than guessed at.
 */
function parseFrontmatter(
  text: string,
  fail: (message: string) => void
): { data: Frontmatter; body: string } | null {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)
  if (!match) {
    fail("SKILL.md does not open with a --- frontmatter block")
    return null
  }
  const data: Frontmatter = {}
  let parent: Record<string, string> | null = null
  for (const line of match[1].split("\n")) {
    if (line.trim() === "") continue
    const nested = /^ {2}([\w-]+):\s+(.+)$/.exec(line)
    if (nested && parent) {
      parent[nested[1]] = unquote(nested[2])
      continue
    }
    const top = /^([\w-]+):(?:\s+(.*))?$/.exec(line)
    if (!top) {
      fail(`frontmatter line not understood: "${line}"`)
      return null
    }
    if (top[2] === undefined || top[2] === "") {
      parent = {}
      data[top[1]] = parent
    } else {
      parent = null
      data[top[1]] = unquote(top[2])
    }
  }
  return { data, body: match[2] }
}

function unquote(value: string): string {
  const v = value.trim()
  return /^(["']).*\1$/.test(v) ? v.slice(1, -1) : v
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((entry) => join(dir, entry))
    .filter((path) => statSync(path).isFile())
}

const errors: string[] = []
const tools = registeredTools()
const skills = existsSync(SKILLS)
  ? readdirSync(SKILLS).filter((entry) =>
      statSync(join(SKILLS, entry)).isDirectory()
    )
  : []
let rules = 0

for (const skill of skills) {
  const dir = join(SKILLS, skill)
  const fail = (message: string, file = "SKILL.md") =>
    errors.push(`skills/${skill}/${file}: ${message}`)
  const skillFile = join(dir, "SKILL.md")
  if (!existsSync(skillFile)) {
    fail("missing")
    continue
  }
  const skillText = readFileSync(skillFile, "utf-8")
  const parsed = parseFrontmatter(skillText, fail)
  if (!parsed) continue
  const { data, body } = parsed

  for (const field of Object.keys(data))
    if (!ALLOWED_FIELDS.has(field))
      fail(
        `unknown frontmatter field "${field}": the format allows ${[...ALLOWED_FIELDS].join(", ")}`
      )

  const name = data.name
  if (typeof name !== "string" || name === "") fail('"name" is required')
  else {
    if (name.length > 64) fail(`"name" is over 64 characters`)
    if (!NAME.test(name))
      fail(`"name" is lowercase letters, digits and single hyphens: "${name}"`)
    if (name !== skill) fail(`"name" is "${name}", its folder "${skill}"`)
    if (/anthropic|claude/.test(name))
      fail(`"name" contains a reserved word (anthropic, claude)`)
  }

  const description = data.description
  if (typeof description !== "string" || description === "")
    fail('"description" is required')
  else {
    if (description.length > 1024)
      fail(`"description" is ${description.length} characters, over 1024`)
    if (/<[a-z/][^>]*>/i.test(description))
      fail('"description" contains an XML tag')
  }

  const compatibility = data.compatibility
  if (compatibility !== undefined) {
    if (typeof compatibility !== "string") fail('"compatibility" is a string')
    else if (compatibility.length > 500)
      fail(`"compatibility" is over 500 characters`)
  }
  if (data.metadata !== undefined && typeof data.metadata === "string")
    fail('"metadata" maps keys to strings')

  const bodyLines = body.split("\n").length
  if (bodyLines > MAX_BODY_LINES)
    fail(`the body is ${bodyLines} lines, over ${MAX_BODY_LINES}`)

  // Files: every path SKILL.md names resolves; every reference is named.
  const named = new Set<string>()
  for (const m of skillText.matchAll(
    /\]\((?!https?:|#)([^)\s]+)\)|\b((?:references|scripts|assets)\/[\w./-]+\.\w+)/g
  )) {
    const path = (m[1] ?? m[2]).replace(/#.*$/, "")
    named.add(path)
    if (!existsSync(join(dir, path))) fail(`names "${path}", which is missing`)
  }
  for (const file of filesUnder(dir)) {
    const path = relative(dir, file)
    if (path === "SKILL.md") continue
    if (path.split("/").length > 2)
      fail("nested more than one level below the skill", path)
    if (path.startsWith("references/") && !named.has(path))
      fail("not named by SKILL.md, so no agent will ever read it", path)
  }

  // Rules and citations, in every Markdown file of the skill.
  for (const file of filesUnder(dir).filter((f) => f.endsWith(".md"))) {
    const path = relative(dir, file)
    const text = readFileSync(file, "utf-8")
    // A rule is a list item; its citations may sit on its wrapped lines.
    const items = text.split(/\n(?=- |\S)/)
    for (const item of items) {
      if (!RULE.test(item)) continue
      rules++
      if (![...item.matchAll(CITATION)].length)
        fail(
          `a rule cites no source (\`spec:…\`, \`pattern:…\`, \`foundation:…\`): "${item.split("\n")[0]}"`,
          path
        )
    }
    for (const m of text.matchAll(CITATION)) {
      const kind = m[1] as keyof typeof CITED_DIR
      if (!existsSync(join(ROOT, CITED_DIR[kind], `${m[2]}.md`)))
        fail(
          `cites ${m[0]}, but ${CITED_DIR[kind]}/${m[2]}.md does not exist`,
          path
        )
    }
    for (const m of text.matchAll(/\bdsaireadable_[a-z_]+\b/g))
      if (!tools.has(m[0]))
        fail(
          `names the tool ${m[0]}, which the MCP server does not register`,
          path
        )
  }
}

if (skills.length === 0) errors.push("skills/: no skill found")

if (errors.length > 0) {
  console.error(
    `❌ skills:validate — ${errors.length} error(s):\n` +
      errors.map((error) => `  ${error}`).join("\n")
  )
  process.exit(1)
}
console.log(
  `✅ skills:validate — ${skills.length} skills, ${rules} rules, every source cited and found`
)
