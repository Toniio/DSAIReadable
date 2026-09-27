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

/** Size values listed by the `size` row of a component spec's props table. */
const specSizes = (spec: string): string[] | null => {
  const row = spec.split("\n").find((l) => /^\|\s*`size`\s*\|/.test(l.trim()))
  if (!row) return null
  const cells = row.split(/(?<!\\)\|/)
  return [...(cells[2] ?? "").matchAll(/"([\w-]+)"/g)].map((m) => m[1])
}

type Finding = { name: string; detail: string }
const findings: Finding[] = []

for (const entry of index.inventory) {
  const source = readFileSync(resolve(ROOT, entry.code_path), "utf-8")
  const found = [...new Set([...cvaSizes(source), ...propSizes(source)])]
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
  const listed = specSizes(readFileSync(resolve(ROOT, specPath), "utf-8"))
  if (listed === null) {
    findings.push({
      name: entry.name,
      detail: `has no \`size\` row in ${specPath}, so the spec omits a prop the component accepts.`,
    })
    continue
  }
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
