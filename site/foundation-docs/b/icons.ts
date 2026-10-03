import { components } from "@/site/lib/components"
import { listFiles, readJson, readText } from "@/site/lib/repo"

export interface IconRules {
  library: string
  description: string
  default_size: string
  rule: string
  usage: string[]
  catalog_url: string
}

/** The icon rules the MCP server serves. */
export function iconRules(): IconRules {
  return readJson<IconRules>("mcp-server/context/icons.json")
}

export interface UsedIcon {
  /** The export name: `CaretDownIcon`. */
  name: string
  /** The components whose file imports it. */
  usedBy: { name: string; slug: string }[]
}

/**
 * The icons the components import from the icon library, read from
 * components/ui at build time, with the components that use each.
 */
export function usedIcons(library: string): UsedIcon[] {
  const bySlug = new Map(components().map((entry) => [entry.slug, entry]))
  const importLine = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*"${library.replace(/[/@-]/g, "\\$&")}"`,
    "g"
  )
  const users = new Map<string, { name: string; slug: string }[]>()
  for (const file of listFiles("components/ui", ".tsx")) {
    const slug = file.replace(/\.tsx$/, "")
    const entry = bySlug.get(slug)
    if (!entry) continue
    for (const [, names] of readText(`components/ui/${file}`).matchAll(
      importLine
    )) {
      for (const raw of names.split(",")) {
        const name = raw
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim()
        if (!name || !name.endsWith("Icon")) continue
        const list = users.get(name) ?? []
        if (!list.some((user) => user.slug === slug))
          list.push({ name: entry.name, slug })
        users.set(name, list)
      }
    }
  }
  return [...users]
    .map(([name, usedBy]) => ({
      name,
      usedBy: usedBy.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
