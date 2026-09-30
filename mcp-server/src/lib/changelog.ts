/**
 * `CHANGELOG.md` as data, for `dsaireadable_get_changelog`. The file follows
 * Keep a Changelog: one `## [version] - date` heading per release (or
 * `## [Unreleased]`), `### Category` headings inside it, one `- ` bullet per
 * change. Changesets writes `## 0.2.0` and `### Minor Changes` the same way, so
 * both shapes read.
 */

export interface ChangelogEntry {
  /** `Unreleased`, or the release's version number. */
  version: string
  date: string | null
  /** The heading the change sits under: `Added`, `Deprecated`, `Minor Changes`… */
  category: string
  text: string
}

export function parseChangelog(markdown: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  let version: string | null = null
  let date: string | null = null
  let category: string | null = null
  let open: string[] | null = null

  const close = () => {
    if (open && version && category)
      entries.push({
        version,
        date,
        category,
        text: open.join(" ").replace(/\s+/g, " ").trim(),
      })
    open = null
  }

  for (const line of markdown.split("\n")) {
    const release = line.match(/^## \[?([^\]\s]+)\]?(?:\s+-\s+(\S+))?\s*$/)
    if (release) {
      close()
      version = release[1]
      date = release[2] ?? null
      category = null
    } else if (/^###\s+/.test(line)) {
      close()
      category = line.replace(/^###\s+/, "").trim()
    } else if (/^- /.test(line)) {
      close()
      open = [line.slice(2)]
    } else if (/^#{1,2}\s/.test(line)) {
      close()
    } else if (open && (line.startsWith(" ") || line === "")) {
      open.push(line)
    } else {
      close()
    }
  }
  close()
  return entries
}
