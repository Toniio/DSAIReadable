import { components, componentSpec } from "@/site/lib/components"

let owners: Map<string, string> | undefined

/**
 * Every export of the design system, and the spec that documents it:
 * `AlertDialogTitle` → `AlertDialog`, `Toaster` → `Sonner`.
 */
function exportOwners(): Map<string, string> {
  if (!owners) {
    owners = new Map()
    for (const entry of components()) {
      owners.set(entry.name, entry.name)
      for (const item of componentSpec(entry.name).exports)
        if (!owners.has(item.name)) owners.set(item.name, entry.name)
    }
  }
  return owners
}

/**
 * A pattern's table cell with each component name made a link to its spec,
 * which the Markdown renderer turns into the component's page. Links and code
 * spans already in the text are left as written.
 */
export function linkComponents(text: string): string {
  const known = exportOwners()
  return text
    .split(/(\[[^\]]*\]\([^)]*\)|`[^`]*`)/)
    .map((part, index) => {
      if (index % 2 === 1) return part
      return (
        part
          .replace(/\b[A-Z][A-Za-z]+\b/g, (word) => {
            const owner = known.get(word)
            return owner ? `[\`${word}\`](../components/${owner}.md)` : word
          })
          // An HTML element named in the text (`a <p> with aria-live`) is code.
          .replace(/<([a-z][\w-]*)>/g, "`<$1>`")
      )
    })
    .join("")
}
