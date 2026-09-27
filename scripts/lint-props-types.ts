/**
 * Every exported component exports the type of its props.
 *
 * Without it, the only way to learn a component's API is to read its
 * implementation and re-derive the signature - which an agent does badly and a
 * consumer cannot do at all across a package boundary. `ComponentProps<typeof
 * X>` is not a substitute: it requires importing the value to talk about the
 * type, and it breaks the moment the component is re-exported.
 *
 * The check is structural, not stylistic: it does not care how the type is
 * written, only that `<Name>Props` leaves the file alongside `<Name>`.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const DIR = "components/ui"

function exportedComponents(source: string): string[] {
  const declared = new Set<string>()
  for (const m of source.matchAll(
    /^(?:export\s+)?function ([A-Z]\w*)\s*[(<]/gm
  ))
    declared.add(m[1])
  for (const m of source.matchAll(
    /^(?:export\s+)?const ([A-Z]\w*)\s*=\s*(?:React\.forwardRef|\()/gm
  ))
    declared.add(m[1])

  const exported = new Set<string>()
  for (const m of source.matchAll(
    /^export\s+(?:default\s+)?(?:function|const)\s+([A-Z]\w*)/gm
  ))
    exported.add(m[1])
  for (const block of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of block[1].split(",")) {
      const name = part.trim().split(" as ").pop()?.trim()
      if (name) exported.add(name)
    }
  }

  return [...declared].filter((name) => exported.has(name)).sort()
}

const missing: Array<{ file: string; component: string }> = []
let covered = 0

for (const name of readdirSync(DIR)
  .filter((f) => f.endsWith(".tsx"))
  .sort()) {
  const file = join(DIR, name)
  const source = readFileSync(file, "utf8")

  const types = new Set<string>()
  for (const m of source.matchAll(/^export type (\w+Props)\b/gm))
    types.add(m[1])
  for (const m of source.matchAll(/^export type \{([^}]*)\}/gm))
    for (const part of m[1].split(","))
      types.add(part.trim().replace(/^type\s+/, ""))

  for (const component of exportedComponents(source)) {
    if (types.has(`${component}Props`)) covered++
    else missing.push({ file, component })
  }
}

if (missing.length > 0) {
  console.error(
    `❌ lint-props-types: ${missing.length} exported component(s) without an exported props type.\n`
  )
  for (const m of missing) {
    console.error(
      `   ${m.file} exports ${m.component} but not ${m.component}Props`
    )
  }
  console.error(
    `\n   Add "export type ${missing[0].component}Props = React.ComponentProps<typeof ${missing[0].component}>",` +
      `\n   or export the props type the component already declares.`
  )
  process.exit(1)
}

console.log(
  `✅ lint-props-types: ${covered} exported component(s), each with its props type.`
)
