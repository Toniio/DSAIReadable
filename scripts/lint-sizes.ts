/**
 * Size scale lint — the inventory declares what sizes a component accepts, and
 * the declaration must match the code.
 *
 * An agent reading this design system cannot guess sizes. Before the canonical
 * scale, Button offered eight, InputGroup four of which none was `default`,
 * Item three, Card two, and SidebarMenuSubButton an `md` that existed nowhere
 * else. Writing `size="sm"` was a coin flip.
 *
 * Three checks:
 *   ① every size a component accepts is on the canonical scale;
 *   ② the `sizes` field of its inventory entry lists exactly those sizes;
 *   ③ so does the `size` row of its spec, which is what the MCP server serves
 *      and therefore what an agent actually reads.
 *
 * Sizes are read from the source rather than from the generated context,
 * because half of them are plain prop unions that never reach a cva block.
 * Sizes a component borrows count too: ToggleGroup takes Toggle's through
 * `VariantProps<typeof toggleVariants>`, PaginationLink and CarouselPrevious
 * take Button's through `React.ComponentProps<typeof Button>`. An `Omit` of
 * `size` drops them, a `Pick` keeps them only when it names `size`.
 *
 *   npx tsx scripts/lint-sizes.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * The canonical scale. `default` is the unmarked middle, not a synonym for
 * medium; the icon series is the square-format counterpart, where `icon` plays
 * the role `default` plays in the text series.
 */
const SCALE = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
]

type Entry = { name: string; code_path: string; sizes?: string[] }
const index = JSON.parse(
  readFileSync(resolve(ROOT, "design-system.index.json"), "utf-8")
) as { inventory: Entry[] }

/** Size keys of a `size:` block inside a cva variants object. */
const cvaSizes = (source: string): string[] => {
  const out: string[] = []
  for (const m of source.matchAll(/\bsize:\s*\{/g)) {
    let depth = 0
    let i = m.index! + m[0].length - 1
    const start = i
    for (; i < source.length; i++) {
      if (source[i] === "{") depth++
      else if (source[i] === "}" && --depth === 0) break
    }
    const body = source.slice(start + 1, i)
    // Only the keys at depth 1 — a nested object would otherwise contribute.
    let d = 0
    for (let j = 0; j < body.length; j++) {
      const ch = body[j]
      if (ch === "{" || ch === "[" || ch === "(") d++
      else if (ch === "}" || ch === "]" || ch === ")") d--
      else if (d === 0) {
        const rest = body.slice(j)
        const k = rest.match(/^\s*(?:"([\w-]+)"|([A-Za-z_]\w*))\s*:/)
        if (k) {
          out.push(k[1] ?? k[2])
          j += k[0].length - 1
        }
      }
    }
  }
  return out
}

/** Size values of a `size?: "a" | "b"` prop union. */
const propSizes = (source: string): string[] =>
  [...source.matchAll(/\bsize\?:\s*((?:"[\w-]+"\s*\|\s*)*"[\w-]+")/g)].flatMap(
    (m) => [...m[1].matchAll(/"([\w-]+)"/g)].map((v) => v[1])
  )

/**
 * Size values listed by each `size` row of a component spec's props tables.
 * A spec has one per export that takes a size: AlertDialogContent's own
 * scale, and AlertDialogAction's, borrowed from Button. A `...props` row typed
 * `React.ComponentProps<typeof Button>` lists Button's sizes by reference:
 * SidebarTrigger's are documented that way, in Button's spec.
 */
const specSizes = (
  spec: string,
  borrowed: (name: string) => string[] | undefined
): string[][] =>
  spec.split("\n").flatMap((row) => {
    const cells = row.trim().split(/(?<!\\)\|/)
    if (/^\s*`size`\s*$/.test(cells[1] ?? ""))
      return [[...(cells[2] ?? "").matchAll(/"([\w-]+)"/g)].map((m) => m[1])]
    const spread = /^\s*`\.\.\.props`\s*$/.test(cells[1] ?? "")
      ? (cells[2] ?? "").match(
          /^\s*`(?:React\.)?ComponentProps<typeof (\w+)>`\s*$/
        )
      : null
    const sizes = spread && borrowed(spread[1])
    return sizes && sizes.length > 0 ? [sizes] : []
  })

/** `import { A, B } from "@/components/ui/x"` → A and B → components/ui/x.tsx. */
const uiImports = (source: string): Map<string, string> => {
  const out = new Map<string, string>()
  for (const m of source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*"@\/components\/ui\/([\w-]+)"/g
  ))
    for (const name of m[1].split(",")) {
      const local = name
        .trim()
        .split(/\s+as\s+/)
        .pop()!
        .replace(/^type\s+/, "")
      if (local) out.set(local, `components/ui/${m[2]}.tsx`)
    }
  return out
}

/** The `cva(…)` call assigned to `name`, up to the next top-level statement. */
const cvaBlock = (source: string, name: string): string => {
  const start = source.search(new RegExp(`\\b${name}\\s*=\\s*cva\\(`))
  if (start === -1) return ""
  const end = source.slice(start).search(/\n(?:const|function|export) /)
  return source.slice(start, end === -1 ? undefined : start + end)
}

/** Every size a component file accepts: its own, then those it borrows. */
const sizesCache = new Map<string, string[]>()
const sizesOf = (codePath: string): string[] => {
  const cached = sizesCache.get(codePath)
  if (cached) return cached
  sizesCache.set(codePath, []) // a cycle borrows nothing
  const source = readFileSync(resolve(ROOT, codePath), "utf-8")
  const imports = uiImports(source)
  const sizes = [...cvaSizes(source), ...propSizes(source)]

  // VariantProps<typeof toggleVariants>, toggleVariants imported.
  for (const m of source.matchAll(/VariantProps<typeof (\w+)>/g)) {
    const from = imports.get(m[1])
    if (from)
      sizes.push(
        ...cvaSizes(cvaBlock(readFileSync(resolve(ROOT, from), "utf-8"), m[1]))
      )
  }

  // React.ComponentProps<typeof Button>, whole or through Omit / Pick; an
  // indexed access (`…<typeof Button>["variant"]`) borrows one prop, not size.
  for (const m of source.matchAll(
    /(Omit|Pick)?<?\s*(?:React\.)?ComponentProps<typeof (\w+)>(?:\s*,\s*([^>]*)>)?(\s*\[)?/g
  )) {
    const [, wrapper, name, keys = "", indexed] = m
    const from = imports.get(name)
    if (!from || indexed) continue
    const namesSize = /"size"/.test(keys)
    if (wrapper === "Omit" && namesSize) continue
    if (wrapper === "Pick" && !namesSize) continue
    sizes.push(...sizesOf(from))
  }

  const result = [...new Set(sizes)]
  sizesCache.set(codePath, result)
  return result
}

type Finding = { name: string; detail: string }
const findings: Finding[] = []

for (const entry of index.inventory) {
  const found = sizesOf(entry.code_path)
  const declared = entry.sizes

  if (found.length === 0) {
    if (declared)
      findings.push({
        name: entry.name,
        detail:
          `declares sizes [${declared.join(", ")}] but ${entry.code_path} ` +
          `accepts none. Remove the field.`,
      })
    continue
  }

  // ① Off-scale names.
  const off = found.filter((s) => !SCALE.includes(s))
  if (off.length > 0)
    findings.push({
      name: entry.name,
      detail:
        `accepts ${off.map((s) => `"${s}"`).join(", ")}, which ${off.length > 1 ? "are" : "is"} ` +
        `not on the canonical scale (${SCALE.join(" | ")}). Rename to the ` +
        `nearest scale step, or extend the scale here and say why.`,
    })

  // ② Declaration versus code.
  if (!declared) {
    findings.push({
      name: entry.name,
      detail:
        `accepts [${found.sort().join(", ")}] but its inventory entry has no ` +
        `"sizes" field, so an agent has to read the source to find out.`,
    })
    continue
  }
  const missing = found.filter((s) => !declared.includes(s))
  const extra = declared.filter((s) => !found.includes(s))
  if (missing.length > 0 || extra.length > 0)
    findings.push({
      name: entry.name,
      detail:
        `declares [${declared.join(", ")}] but ${entry.code_path} accepts ` +
        `[${found.sort().join(", ")}].` +
        (missing.length > 0 ? ` Undeclared: ${missing.join(", ")}.` : "") +
        (extra.length > 0 ? ` Declared but absent: ${extra.join(", ")}.` : ""),
    })

  // ③ The spec is what an agent reads, through the MCP server.
  const specPath = `specs/components/${entry.name}.md`
  const imports = uiImports(
    readFileSync(resolve(ROOT, entry.code_path), "utf-8")
  )
  const rows = specSizes(
    readFileSync(resolve(ROOT, specPath), "utf-8"),
    (n) => {
      const from = imports.get(n)
      return from ? sizesOf(from) : undefined
    }
  )
  if (rows.length === 0) {
    findings.push({
      name: entry.name,
      detail: `has no \`size\` row in ${specPath}, so the spec omits a prop the component accepts.`,
    })
    continue
  }
  // The row for the scale this file declares: the one that lists it exactly,
  // else the closest, to report what differs.
  const gap = (listed: string[]) =>
    found.filter((s) => !listed.includes(s)).length +
    listed.filter((s) => !found.includes(s)).length
  const listed = rows.reduce((best, r) => (gap(r) < gap(best) ? r : best))
  const unlisted = found.filter((s) => !listed.includes(s))
  const phantom = listed.filter((s) => !found.includes(s))
  if (unlisted.length > 0 || phantom.length > 0)
    findings.push({
      name: entry.name,
      detail:
        `has a \`size\` row in ${specPath} listing [${listed.join(", ")}] ` +
        `against [${found.sort().join(", ")}] in the code.` +
        (unlisted.length > 0 ? ` Unlisted: ${unlisted.join(", ")}.` : "") +
        (phantom.length > 0
          ? ` Listed but absent: ${phantom.join(", ")}.`
          : ""),
    })
}

if (findings.length > 0) {
  console.error(`❌ lint-sizes: ${findings.length} violation(s).\n`)
  for (const f of findings) console.error(`   ${f.name} ${f.detail}`)
  console.error(
    `\n   An agent picks a size from the inventory. What it reads there has to be true.`
  )
  process.exit(1)
}

const sized = index.inventory.filter((e) => e.sizes).length
console.log(
  `✅ lint-sizes: ${sized} sized component(s) declared in the inventory, ` +
    `every size on the canonical scale, matching both the source and the spec.`
)
