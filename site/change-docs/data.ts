import { execFileSync } from "node:child_process"

import { type ChangeEntry, changelog } from "@/site/lib/changelog"
import { anchor, section, tables } from "@/site/lib/markdown"
import { listFiles, readText, ROOT } from "@/site/lib/repo"

/**
 * The Changes page's data: the releases of CHANGELOG.md with their dates,
 * the changesets not released yet, and the categories CONTRIBUTING.md
 * defines. Read at build time.
 */

export interface ReleaseDate {
  /** `2026-10-03`. */
  iso: string
  /** `October 3, 2026`. */
  label: string
}

/**
 * The day a release was tagged: the commit date of its `v<version>` tag. A
 * build without the tags (a shallow clone) shows no date, and never fails.
 */
function releaseDate(version: string): ReleaseDate | undefined {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", `v${version}`, "--"],
      { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined
    return {
      iso,
      label: new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC",
        dateStyle: "long",
      }),
    }
  } catch {
    return undefined
  }
}

interface Release {
  version: string
  /** The anchor of its section: `v0-1-2`. */
  id: string
  date?: ReleaseDate
  /** The sections of its changelog, in order: Patch Changes, Added… */
  sections: { name: string; entries: ChangeEntry[] }[]
  total: number
}

/** Every release, newest first, its entries grouped by section. */
export function releases(): Release[] {
  const out: Release[] = []
  for (const entry of changelog()) {
    let release = out.find((item) => item.version === entry.version)
    if (!release) {
      release = {
        version: entry.version,
        id: anchor(`v${entry.version}`),
        date: releaseDate(entry.version),
        sections: [],
        total: 0,
      }
      out.push(release)
    }
    let group = release.sections.find((item) => item.name === entry.section)
    if (!group) {
      group = { name: entry.section, entries: [] }
      release.sections.push(group)
    }
    group.entries.push(entry)
    release.total++
  }
  return out
}

interface PendingChange {
  file: string
  bump?: string
  category?: string
  text: string
}

/** The changesets of .changeset/ not released yet: their bump and first line. */
export function pendingChanges(): PendingChange[] {
  return listFiles(".changeset", ".md")
    .filter((file) => file !== "README.md")
    .map((file) => {
      const raw = readText(`.changeset/${file}`).replace(/\r\n/g, "\n")
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
      const front = match?.[1] ?? ""
      const body = (match?.[2] ?? raw).trim()
      const bump = /:\s*(major|minor|patch)\s*$/m.exec(front)?.[1]
      const first =
        body
          .split("\n")
          .find((line) => line.trim())
          ?.trim() ?? ""
      const prefix = /^([\w-]+): ([\s\S]*)$/.exec(first)
      const text = prefix?.[2] ?? first
      return {
        file,
        bump,
        category: prefix?.[1],
        // A changeset's summary goes on after its category, in lowercase:
        // shown alone, it starts a sentence.
        text: text.charAt(0).toUpperCase() + text.slice(1),
      }
    })
}

interface Category {
  /** `component-api`. */
  name: string
  /** What the change is, as Markdown. */
  change: string
  /** The bump it takes, as Markdown. */
  bump: string
}

/** The categories of a changeset and their bumps, from CONTRIBUTING.md. */
export function categories(): Category[] {
  const policy = section(readText("CONTRIBUTING.md"), "Versioning and releases")
  const table = tables(policy).find((item) =>
    item.header.some((cell) => cell.toLowerCase() === "category")
  )
  if (!table) return []
  return table.rows.map(([name, change, bump]) => ({
    name: name.replace(/`/g, ""),
    change: change ?? "",
    bump: bump ?? "",
  }))
}

/** The bullet of CONTRIBUTING.md that says how a 0.x version bumps. */
export function zeroVersionRule(): string | undefined {
  const policy = section(readText("CONTRIBUTING.md"), "Versioning and releases")
  const lines = policy.split("\n")
  const start = lines.findIndex((line) =>
    line.startsWith("- **While the version is 0.x**")
  )
  if (start < 0) return undefined
  const bullet = [lines[start].slice(2)]
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("  ")) break
    bullet.push(line.trim())
  }
  return bullet.join(" ")
}

/** The badge a category takes: the larger the bump, the louder. */
export type CategoryTone = "destructive" | "warning" | "secondary" | "outline"

export function categoryTone(category: string): CategoryTone {
  if (category === "token-breaking") return "destructive"
  if (category === "component-api") return "warning"
  if (category === "mcp" || category === "skills" || category === "lint")
    return "secondary"
  return "outline"
}
