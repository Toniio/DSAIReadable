/**
 * The Markdown reading shared by the context generator (specs/) and the server
 * at run time (a consumer project's design/patterns/): sections by heading,
 * tables by header, list items, fenced code.
 */

/**
 * Extract a markdown section by heading (## Title). The section ends at the
 * next `## ` or at the end of the input — `(?![\s\S])`, since JavaScript has
 * no `\Z`: written `\Z`, it matched a literal "Z", so every section stopped at
 * its first capital Z and the last section of a spec was never found at all.
 */
export function mdSection(md: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")
  const re = new RegExp(
    `^## ${escaped}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
    "m"
  )
  const m = md.match(re)
  return m ? m[1].trim() : ""
}

/** A table's `|---|:--:|` delimiter row */
const TABLE_DELIMITER = /^\|(\s*:?-+:?\s*\|)+\s*$/

/** Split a table row into cells; an escaped `\|` stays inside its cell */
function mdCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"))
}

interface MdTable {
  /** Nearest `###` heading above the table, backticks stripped ("" if none) */
  heading: string
  header: string[]
  rows: string[][]
}

/**
 * Parse every markdown table of a section, wherever it sits: each table keeps
 * its header apart from its body rows, and the delimiter row is dropped.
 */
export function mdTables(section: string): MdTable[] {
  const tables: MdTable[] = []
  const lines = section.split("\n").map((l) => l.trim())
  let heading = ""
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith("### ")) {
      heading = line.slice(4).replace(/`/g, "").trim()
    } else if (TABLE_DELIMITER.test(line)) {
      continue
    } else if (line.startsWith("|")) {
      // A header row is the one right above its delimiter.
      if (TABLE_DELIMITER.test(lines[i + 1] ?? "")) {
        tables.push({ heading, header: mdCells(line), rows: [] })
      } else if (tables.length > 0) {
        tables[tables.length - 1].rows.push(mdCells(line))
      }
    }
  }
  return tables
}

/** Parse the body rows of every markdown table of a section */
export function mdTable(section: string): string[][] {
  return mdTables(section).flatMap((t) => t.rows)
}

/**
 * Parse the list items of a section: bullets (`- `) and numbered items
 * (`1. `). Reading bullets alone left the five foundations whose rules are
 * numbered with no rule at all. An item wrapped over several lines is joined
 * back into one; it ends at a blank line, so a paragraph or a table nested
 * under an item is not part of the rule.
 */
export function mdListItems(section: string): string[] {
  const items: string[][] = []
  let open = false
  for (const line of section.split("\n")) {
    const item = line.match(/^\s*(?:-|\d+\.)\s+(.*)$/)
    if (item) {
      items.push([item[1].trim()])
      open = true
    } else if (open && /^\s+\S/.test(line)) {
      items[items.length - 1].push(line.trim())
    } else {
      open = false
    }
  }
  return items.map((lines) => lines.join(" "))
}

/**
 * A table cell as a plain value: `typography.size.xs` served with its
 * backticks, or a usage note with its bold markers, is Markdown an agent
 * copies verbatim into code.
 */
export function mdPlain(cell: string): string {
  return cell.replace(/`/g, "").replace(/\*\*(.+?)\*\*/g, "$1")
}

/** Extract fenced code block content */
export function mdCode(section: string): string {
  const m = section.match(/```[\w]*\n([\s\S]*?)```/)
  return m ? m[1].trim() : ""
}

/** A table's rows as objects keyed by its header: "Variant / props" → variant_props. */
export function mdRecords(section: string): Record<string, string>[] {
  return mdTables(section).flatMap(({ header, rows }) =>
    rows.map((row) =>
      Object.fromEntries(
        header.map((h, i) => [
          h.toLowerCase().replace(/[^a-z]+/g, "_"),
          mdPlain(row[i] ?? ""),
        ])
      )
    )
  )
}
