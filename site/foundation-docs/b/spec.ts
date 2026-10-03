import type { CSSProperties } from "react"

import { anchor, plain, tables } from "@/site/lib/markdown"
import { readJson, readText } from "@/site/lib/repo"
import { tokens, type Token } from "@/site/lib/tokens"

/** One `## ` section of a foundation spec. */
interface SpecPart {
  /** The heading as written: `A note on \`shadow-inner\``. */
  heading: string
  /** The id the page gives the section: `a-note-on-shadow-inner`. */
  id: string
  /** The heading as the page shows it: no code marks, no leading emoji. */
  label: string
  body: string
  /** The spec's own `## Usage Rules`: its list comes from ux-writing.json. */
  usageRules: boolean
}

export interface FoundationDoc {
  /** The repository path of the spec: `specs/foundations/spacing.md`. */
  source: string
  /** What sits between the title and the first `## `: the source line, the intro. */
  intro: string
  parts: SpecPart[]
}

/** A rule's text without the trailing separator lines of a spec section. */
function trimSection(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/(\n\s*---\s*)+$/g, "")
    .trim()
}

/** A heading as a label: `⚠️ A note on …` → `A note on …`. */
function label(heading: string): string {
  return plain(heading).replace(/^[^\p{L}\p{N}]+/u, "")
}

/**
 * Removes the list of a `## Usage Rules` section: ux-writing.json carries
 * the same rules, and the page lays them out as Do and Don't. What follows
 * the list (a `### ` subsection) stays.
 */
function withoutRuleList(body: string): string {
  const out: string[] = []
  let inList = false
  let subsection = false
  for (const line of body.split("\n")) {
    if (line.startsWith("#")) subsection = true
    if (!subsection && /^(\s*[-*]|\s*\d+\.)\s/.test(line)) {
      inList = true
      continue
    }
    if (inList && /^\s+\S/.test(line)) continue
    if (line.trim() !== "") inList = false
    out.push(line)
  }
  return out.join("\n").trim()
}

/** A foundation spec, split into its intro and its `## ` sections. */
export function foundationDoc(file: string): FoundationDoc {
  const source = `specs/foundations/${file}`
  const lines = readText(source).replace(/\r\n/g, "\n").split("\n")
  const intro: string[] = []
  const parts: { heading: string; lines: string[] }[] = []
  let fenced = false
  for (const line of lines) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced
    if (!fenced && line.startsWith("# ")) continue
    if (!fenced && line.startsWith("## ")) {
      parts.push({ heading: line.slice(3).trim(), lines: [] })
      continue
    }
    if (parts.length) parts[parts.length - 1].lines.push(line)
    else intro.push(line)
  }
  return {
    source,
    // "Source: this file" names the spec, which the page links under its
    // header: on a web page, "this file" names nothing.
    intro: trimSection(intro.join("\n")).replace(
      /Source: this file\s*(·\s*)?/g,
      ""
    ),
    parts: parts.map(({ heading, lines: body }) => {
      const usageRules = heading === "Usage Rules"
      const text = trimSection(body.join("\n"))
      return {
        heading,
        id: anchor(heading),
        label: label(heading),
        body: usageRules ? withoutRuleList(text) : text,
        usageRules,
      }
    }),
  }
}

export interface Rules {
  /** The `✅` rules, without their mark. */
  dos: string[]
  /** The `❌` rules, without their mark. */
  donts: string[]
  /** Numbered rules: a bold title, then why. */
  numbered: string[]
  /** A rule that is neither: an exemption. */
  notes: string[]
}

/** The rules of a foundation, as ux-writing.json serves them to agents. */
export function foundationRules(file: string): Rules {
  const rules = readJson<{ general_rules: { rule: string; source: string }[] }>(
    "mcp-server/context/ux-writing.json"
  ).general_rules.filter((entry) => entry.source === file)
  const out: Rules = { dos: [], donts: [], numbered: [], notes: [] }
  for (const { rule } of rules) {
    if (rule.startsWith("✅")) out.dos.push(rule.replace(/^✅\s*/, ""))
    else if (rule.startsWith("❌")) out.donts.push(rule.replace(/^❌\s*/, ""))
    else if (rule.startsWith("**")) out.numbered.push(rule)
    else out.notes.push(rule)
  }
  return out
}

/** The distinct `do` and `don't` advice the tokens of a group carry. */
export function tokenAdvice(prefixes: string[]): {
  dos: string[]
  donts: string[]
} {
  const inGroup = (entry: Token) =>
    entry.tier === "semantic" &&
    prefixes.some(
      (prefix) => entry.token === prefix || entry.token.startsWith(`${prefix}.`)
    )
  const dos = new Set<string>()
  const donts = new Set<string>()
  for (const entry of tokens().filter(inGroup)) {
    if (entry.docs?.do) dos.add(entry.docs.do)
    if (entry.docs?.dont) donts.add(entry.docs.dont)
  }
  return { dos: [...dos], donts: [...donts] }
}

/** `1.5rem` → 24: a rem value in CSS pixels, at the browser's default 16. */
export function remToPx(value: string): number | undefined {
  const rem = /^(-?\d*\.?\d+)rem$/.exec(value)?.[1]
  if (rem !== undefined) return Number(rem) * 16
  const px = /^(-?\d*\.?\d+)px$/.exec(value)?.[1]
  return px === undefined ? undefined : Number(px)
}

/**
 * The light value of every semantic token dark mode changes, as custom
 * properties: a panel that wears it shows the light mode inside a page shown
 * dark. The values are the manifest's, resolved at build time.
 */
export function lightScope(): CSSProperties {
  const style: Record<string, string> = {}
  for (const entry of tokens()) {
    if (entry.tier === "semantic" && entry.value.dark !== undefined)
      style[entry.cssVar] = entry.value.light
  }
  return style as CSSProperties
}

/**
 * A section split around its first pipe table: the Markdown before it, its
 * rows, and the Markdown after it, for a page that lays the table out itself.
 */
export function splitTable(body: string): {
  before: string
  header: string[]
  rows: string[][]
  after: string
} {
  const lines = body.split("\n")
  const start = lines.findIndex(
    (line, index) =>
      line.trim().startsWith("|") &&
      /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] ?? "")
  )
  if (start < 0) return { before: body, header: [], rows: [], after: "" }
  let end = start
  while (end < lines.length && lines[end].trim().startsWith("|")) end++
  const table = tables(lines.slice(start, end).join("\n"))[0]
  return {
    before: lines.slice(0, start).join("\n").trim(),
    header: table?.header ?? [],
    rows: table?.rows ?? [],
    after: lines.slice(end).join("\n").trim(),
  }
}
