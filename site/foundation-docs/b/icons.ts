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
        const imported = raw
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim()
        // Types and helpers are not icons: an icon is a PascalCase export.
        if (!imported || !/^[A-Z][A-Za-z0-9]*$/.test(imported)) continue
        // The library exports each icon twice, `Eye` and `EyeIcon`: an icon
        // is listed once, under the suffixed name, which the copied import
        // line uses.
        const name = imported.endsWith("Icon") ? imported : `${imported}Icon`
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
