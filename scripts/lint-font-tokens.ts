/**
 * Font token lint — the typography.font-family tokens choose the face each
 * brand renders in, and each face they choose is loaded.
 *
 * next/font self-hosts the faces (lib/fonts.ts for lyra, lib/fonts-nova.ts for
 * nova) and sets `--font-<face>` on <html>; tokens.css prints a primitive as
 * `var(--font-<face>, Family, generic)`, so the token drives the face.
 * Descriptions drift silently, and a name no file loads falls back without a
 * word: the `sans` token once presented Geist as the typeface "for UI text"
 * while the whole interface was set in JetBrains Mono.
 *
 * Rules:
 *   ① every font-family primitive names, as the first family of its stack, the
 *      family next/font loads under its `fontVariable`;
 *   ② every font next/font loads has such a primitive;
 *   ③ every loader imported from next/font/google is called;
 *   ④ in each brand, each `typography.font-family.<role>` token resolves to a
 *      face that brand's file loads;
 *   ⑤ `typography.font-family.mono` ends in `monospace` in every brand: the
 *      `font-mono` class keeps meaning monospace.
 *
 *   npx tsx scripts/lint-font-tokens.ts
 */

import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  brandOf,
  fontVariableOf,
  loadTokens,
  THEMES,
  type Brand,
} from "../mcp-server/src/lib/dtcg.js"
import {
  FONTS,
  NOVA_FONTS,
  firstFamily,
  nextFontsOf,
} from "./lib/next-fonts.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

type Tree = Record<string, unknown>
const at = (tree: Tree, path: string) =>
  path
    .split(".")
    .reduce<unknown>((node, key) => (node as Tree | undefined)?.[key], tree) as
    Tree | undefined

const tokens = loadTokens(ROOT)
const primitive = tokens.tiers.primitive.tree
const semantic = tokens.tiers.semantic.tree

const FAMILY_GROUP = "typography.font-family"
const keysOf = (node: Tree | undefined) =>
  Object.keys(node ?? {}).filter((key) => !key.startsWith("$"))

const faces = keysOf(at(primitive, `primitive.${FAMILY_GROUP}`)).map((key) => {
  const node = at(primitive, `primitive.${FAMILY_GROUP}.${key}`) as Tree
  return {
    path: `primitive.${FAMILY_GROUP}.${key}`,
    stack: String(node.$value),
    variable: fontVariableOf(node),
  }
})

const fileOf: Record<Brand, string> = { lyra: FONTS, nova: NOVA_FONTS }
const fontsOf = {
  lyra: nextFontsOf(ROOT, FONTS),
  nova: nextFontsOf(ROOT, NOVA_FONTS),
}
const loaded = [...fontsOf.lyra.loaded, ...fontsOf.nova.loaded]
const findings: string[] = []

for (const { path, stack, variable } of faces) {
  const font = loaded.find((f) => f.variable === variable)
  if (!font)
    findings.push(
      `① ${path} has no font behind it — nothing loads it under ${variable ?? "a fontVariable"}`
    )
  else if (firstFamily(stack) !== font.family)
    findings.push(
      `① ${path} names "${firstFamily(stack)}" but next/font loads ${font.family} (${font.loader}) under ${variable}`
    )
}

for (const font of loaded)
  if (!faces.some((face) => face.variable === font.variable))
    findings.push(
      `② ${font.family} (${font.loader}) is loaded under ${font.variable ?? "no variable"} but no typography.font-family primitive reads it`
    )

for (const brand of ["lyra", "nova"] as const)
  for (const loader of fontsOf[brand].unused)
    findings.push(
      `③ ${loader} is imported from next/font/google in ${fileOf[brand]} but never loaded — remove the import`
    )

const roles = keysOf(at(semantic, FAMILY_GROUP)).map(
  (key) => `${FAMILY_GROUP}.${key}`
)

for (const theme of THEMES) {
  const brand = brandOf(theme)
  for (const path of roles) {
    const value = tokens.override(path, theme) ?? at(semantic, path)?.$value
    const ref = String(value).match(/^\{(.+)\}$/)?.[1]
    const face = faces.find((f) => f.path === ref)
    if (!face) {
      findings.push(`④ ${path} (${theme}) resolves to no font-family primitive`)
      continue
    }
    if (!fontsOf[brand].loaded.some((f) => f.variable === face.variable))
      findings.push(
        `④ ${path} (${theme}) resolves to ${firstFamily(face.stack)}, which ${fileOf[brand]} does not load`
      )
    if (path === `${FAMILY_GROUP}.mono` && !/monospace\s*$/.test(face.stack))
      findings.push(
        `⑤ ${path} (${theme}) resolves to "${face.stack}", which does not end in monospace`
      )
  }
}

if (findings.length > 0) {
  console.error(
    `❌ lint-font-tokens: ${findings.length} violation(s).\n\n   ${findings.join("\n   ")}\n`
  )
  process.exit(1)
}
console.log(
  `✅ lint-font-tokens: ${roles.length} font-family token(s) in ${THEMES.length} themes, each resolving to a face its brand loads (${loaded
    .map((f) => `${f.variable} → ${f.family}`)
    .join(", ")}).`
)
