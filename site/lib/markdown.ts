/**
 * Reads the parts of a spec the site lays out itself: a `## ` section, and the
 * pipe tables in it. Everything else is rendered as written, by
 * site/ui/markdown.tsx.
 */

/** The body of a `## <heading>` section, up to the next `## `; "" if absent. */
export function section(markdown: string, heading: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start < 0) return ""
  let fenced = false
  const body: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced
    if (!fenced && line.startsWith("## ")) break
    body.push(line)
  }
  return body.join("\n").trim()
}

/** Every `## ` heading of a document, in order. */
export function headings(markdown: string): string[] {
  let fenced = false
  const out: string[] = []
  for (const line of markdown.split("\n")) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced
    if (!fenced && line.startsWith("## ")) out.push(line.slice(3).trim())
  }
  return out
}

/** The cells of a table row: `\|` inside a code span is a literal pipe. */
function cells(row: string): string[] {
  const inner = row.trim().replace(/^\|/, "").replace(/\|$/, "")
  return inner
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"))
}

export interface Table {
  header: string[]
  rows: string[][]
}

/** The pipe tables of a block of Markdown, in order. */
export function tables(markdown: string): Table[] {
  const out: Table[] = []
  const lines = markdown.split("\n")
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].trim().startsWith("|")) continue
    if (!/^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) continue
    const header = cells(lines[i])
    const rows: string[][] = []
    let j = i + 2
    while (j < lines.length && lines[j].trim().startsWith("|")) {
      rows.push(cells(lines[j]))
      j++
    }
    out.push({ header, rows })
    i = j
  }
  return out
}

/** Removes the generated-section markers: they speak to the tooling, not the reader. */
export function stripComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->\n?/g, "")
}

/** Inline code and emphasis markers removed: the text a heading or a label shows. */
export function plain(markdown: string): string {
  return markdown
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim()
}

/** A heading as an anchor: "Props / API" → `props-api`. */
export function anchor(text: string): string {
  return plain(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
