import { readJson } from "@/site/lib/repo"

interface Row {
  version: string
  date: string | null
  category: string
  text: string
}

export interface ChangeEntry {
  version: string
  /** The changeset's section: Patch Changes, Added, Fixed… */
  section: string
  /** The changeset category (CONTRIBUTING.md): visual, docs, mcp…; none before changesets. */
  category?: string
  /** The commit that brought the changeset. */
  commit?: string
  /** The change, as Markdown. */
  text: string
}

/** Every entry of CHANGELOG.md, newest version first, as the MCP context parses it. */
export function changelog(): ChangeEntry[] {
  return readJson<Row[]>("mcp-server/context/changelog.json").map((row) => {
    const match = /^([0-9a-f]{7}): ([\w-]+): ([\s\S]*)$/.exec(row.text)
    return match
      ? {
          version: row.version,
          section: row.category,
          commit: match[1],
          category: match[2],
          text: match[3],
        }
      : { version: row.version, section: row.category, text: row.text }
  })
}

/** The entries that name a component, as a word: `Button`, not `ButtonGroup`. */
export function changesFor(name: string): ChangeEntry[] {
  const word = new RegExp(`(^|[^\\w])${name}([^\\w]|$)`)
  return changelog().filter((entry) => word.test(entry.text))
}
