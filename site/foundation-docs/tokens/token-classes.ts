import {
  referenced,
  tailwindClasses,
  tokenByName,
  type Token,
} from "@/site/lib/tokens"

/**
 * The role a color token plays, read from its name: text sits on a surface,
 * a border or an indicator draws an edge, everything else fills.
 */
function colorRole(token: string): "text" | "border" | "indicator" | "bg" {
  if (token === "color.border.focus" || token.endsWith(".ring"))
    return "indicator"
  if (/^color\.text\.|foreground$|\.on$/.test(token)) return "text"
  if (/^color\.border\.|\.border$/.test(token)) return "border"
  return "bg"
}

/**
 * The classes a color token is meant to be written with: the bridge exposes
 * each name after every color prefix (`bg-`, `text-`, `border-`…), and the
 * token's role picks the one it is for — `bg-primary`, `text-muted-foreground`,
 * `border-input`. The focus indicator colors are read with `ring-`.
 */
export function colorClasses(entry: Pick<Token, "token" | "cssVar">): string[] {
  const all = tailwindClasses(entry.cssVar)
  const role = colorRole(entry.token)
  if (role === "indicator")
    return all
      .filter((value) => value.startsWith("bg-"))
      .map((value) => value.replace(/^bg-/, "ring-"))
  const picked = all.filter((value) => value.startsWith(`${role}-`))
  return picked.length ? picked : all
}

/** A primitive's short name: `primitive.color.mist.50` → `mist.50`. */
export function primitiveName(token: string): string {
  return token.replace(/^primitive\.(color\.)?/, "")
}

/** The token a value reads, in a mode, without its braces. */
export function reads(
  entry: Token,
  mode: "light" | "dark"
): string | undefined {
  const reference =
    mode === "dark"
      ? (entry.reference.dark ?? entry.reference.light)
      : entry.reference.light
  return referenced(reference)
}

/**
 * The classes of a shadcn/ui alias: the class of the semantic token it reads
 * that carries the alias's own name — `--primary` → `bg-primary`.
 */
export function aliasClasses(entry: Token): string[] {
  const name = entry.cssVar.replace(/^--/, "")
  const target = reads(entry, "light")
  const semantic = target ? tokenByName(target) : undefined
  if (!semantic) return []
  return colorClasses(semantic).filter(
    (value) => value.replace(/^(bg|text|border|ring)-/, "") === name
  )
}

/**
 * The classes of any token, as the "All tokens" table lists them: the color
 * classes by role, the documented classes of the other tokens (`m-4`,
 * `max-w-xs`, `md:`), and the theme bridge for the rest.
 */
export function tokenClasses(entry: Token): string[] {
  if (entry.tier === "primitive") return []
  if (entry.tier === "component")
    return entry.type === "color" ? aliasClasses(entry) : []
  if (entry.type === "color") return colorClasses(entry)
  const documented = entry.docs?.tailwind
  if (documented)
    return documented.split(/\s*[·,]\s*|\s+/).filter((value) => value !== "")
  return tailwindClasses(entry.cssVar)
}
