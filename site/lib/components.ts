import { readJson, readText } from "@/site/lib/repo"
import { plain, section, tables } from "@/site/lib/markdown"

interface ComponentRow {
  name: string
  category: string
  status: "stable" | "beta" | "deprecated"
  code_path: string
  has_spec: boolean
}

export interface Divergence {
  export?: string
  prop?: string
  value?: string
  type: "added" | "removed" | "renamed" | "changed"
  upstream?: string
  note: string
}

/** A component spec, as `mcp-server/context/component-specs.json` parses it. */
export interface ComponentSpec {
  name: string
  category: string
  status: string
  role: string
  usage: string[]
  constraints: string[]
  dependencies: string[]
  anatomy: { slot: string; role: string }[]
  tokens: { token: string; classes: string[]; where: string[] }[]
  tokens_from: string[]
  exports: {
    name: string
    summary: string
    description: string
    example?: string
  }[]
  props: {
    component: string
    prop: string
    type: string
    default: string
    description: string
  }[]
  states: { state: string; behavior: string }[]
  accessibility: string
  code_example: string
  cross_references: string[]
  shadcn: { item: string | null; divergences: Divergence[] }
}

interface VariantEntry {
  variants: Record<string, { values: string[]; default: string | null }>
  sources: string[]
  part_of: string | null
  has_variants: boolean
}

interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string }[]
}

export interface ComponentEntry {
  /** The spec name: `AlertDialog`. */
  name: string
  /** The file and registry item name: `alert-dialog`. */
  slug: string
  category: string
  status: ComponentRow["status"]
  codePath: string
}

/** How the categories are ordered in the navigation: the most used first. */
export const CATEGORY_ORDER = [
  "Forms",
  "Layout",
  "Overlay",
  "Navigation",
  "Data",
  "Feedback",
  "Typography",
  "Media",
  "Brand",
  "Conversation",
  "Misc",
]

/** Every component of the design system, by category, then by name. */
export function components(): ComponentEntry[] {
  return readJson<ComponentRow[]>("mcp-server/context/components.json")
    .map((row) => ({
      name: row.name,
      slug: row.code_path
        .replace(/^components\/ui\//, "")
        .replace(/\.tsx$/, ""),
      category: row.category,
      status: row.status,
      codePath: row.code_path,
    }))
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) -
          CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name)
    )
}

/** The components grouped by category, in navigation order. */
export function componentsByCategory(): {
  category: string
  items: ComponentEntry[]
}[] {
  const groups = new Map<string, ComponentEntry[]>()
  for (const entry of components()) {
    groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry])
  }
  return [...groups].map(([category, items]) => ({ category, items }))
}

export function componentBySlug(slug: string): ComponentEntry | undefined {
  return components().find((entry) => entry.slug === slug)
}

export function componentByName(name: string): ComponentEntry | undefined {
  return components().find((entry) => entry.name === name)
}

export function componentSpec(name: string): ComponentSpec {
  const spec = readJson<Record<string, ComponentSpec>>(
    "mcp-server/context/component-specs.json"
  )[name]
  if (!spec) throw new Error(`No spec for ${name}`)
  return spec
}

/** The spec Markdown file of a component, as written. */
export function componentMarkdown(name: string): string {
  return readText(`specs/components/${name}.md`)
}

export interface VariantAxis {
  /** The export that takes the axis: `Button`, `TabsList`. */
  component: string
  axis: string
  values: string[]
  default: string | null
}

/** The cva axes of a component and of its parts (`TabsList` for `Tabs`). */
export function variantAxes(name: string): VariantAxis[] {
  const all = readJson<Record<string, VariantEntry>>(
    "mcp-server/context/component-variants.json"
  )
  return Object.entries(all)
    .filter(([key, entry]) => key === name || entry.part_of === name)
    .flatMap(([key, entry]) =>
      Object.entries(entry.variants).map(
        ([axis, { values, default: value }]) => ({
          component: key,
          axis,
          values,
          default: value,
        })
      )
    )
}

export interface StateRow {
  state: string
  /** The classes that draw the state, as the spec's generated table lists them. */
  classes: string[]
  description: string
}

/**
 * The States table of a spec, Classes column included (the MCP context keeps
 * the description only).
 */
export function stateRows(name: string): StateRow[] {
  const table = tables(section(componentMarkdown(name), "States"))[0]
  if (!table) return []
  return table.rows.map(([state, classes, description]) => ({
    state: plain(state),
    classes:
      classes === "—" ? [] : classes.split(" · ").map((value) => plain(value)),
    description: description ?? "",
  }))
}

/** The registry item that ships a component. */
export function registryItem(slug: string): RegistryItem | undefined {
  return readJson<{ items: RegistryItem[] }>("registry.json").items.find(
    (item) => item.name === slug
  )
}

/** The components of the design system an item depends on, by slug. */
export function usesComponents(slug: string): string[] {
  const deps = registryItem(slug)?.registryDependencies ?? []
  const slugs = new Set(components().map((entry) => entry.slug))
  return deps
    .map((dep) => dep.split("/").pop() ?? dep)
    .filter((dep) => slugs.has(dep))
}

/** The components whose registry item depends on this one, by slug. */
export function usedByComponents(slug: string): string[] {
  return components()
    .filter((entry) => usesComponents(entry.slug).includes(slug))
    .map((entry) => entry.slug)
}

/** A spec name → its page: `Field` → `/components/field/`. */
export function componentHref(name: string): string | undefined {
  const entry = componentByName(name)
  return entry && `/components/${entry.slug}/`
}
