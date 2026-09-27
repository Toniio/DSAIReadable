/**
 * Font token lint — the typography.font-family tokens say which typefaces
 * the design system loads, and they say it truly.
 *
 * The fonts are loaded by next/font in app/layout.tsx, which self-hosts them
 * and adjusts their fallback metrics; the tokens describe that choice rather
 * than drive it (decision P3-14). Descriptions drift silently: the `sans`
 * token presented Geist as the typeface "for UI text" while the whole
 * interface is set in JetBrains Mono, and layout.tsx imported a third font,
 * Geist Mono, that nothing loaded.
 *
 * Rules:
 *   ① every `typography.font-family.<key>` token names, as the first family
 *      of its stack, the family next/font loads under `--font-<key>`;
 *   ② every font next/font loads is described by such a token;
 *   ③ every loader imported from next/font/google is called.
 *
 *   npx tsx scripts/lint-font-tokens.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  LAYOUT,
  firstFamily,
  fontVariableOf,
  nextFontsOf,
} from "./lib/next-fonts.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

type Tree = { [key: string]: Tree | string | boolean | undefined }
const read = (file: string) =>
  JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as Tree
const primitive = read("tokens/primitive.json")
const semantic = read("tokens/semantic.json")

const at = (tree: Tree, path: string) =>
  path
    .split(".")
    .reduce<Tree | undefined>((node, key) => node?.[key] as Tree, tree)

/** The font stack a semantic token resolves to, through its primitive. */
function stackOf(path: string): string | undefined {
  const value = at(semantic, path)?.$value
  if (typeof value !== "string") return undefined
  const ref = value.match(/^\{(.+)\}$/)?.[1]
  const resolved = ref ? at(primitive, ref)?.$value : value
  return typeof resolved === "string" ? resolved : undefined
}

const families = at(semantic, "typography.font-family") ?? {}
const tokens = Object.keys(families)
  .filter((key) => !key.startsWith("$"))
  .map((key) => `typography.font-family.${key}`)

const { loaded, unused } = nextFontsOf(ROOT)
const findings: string[] = []

for (const path of tokens) {
  const variable = fontVariableOf(path)!
  const stack = stackOf(path)
  const font = loaded.find((f) => f.variable === variable)
  if (!font)
    findings.push(
      `① ${path} has no font behind it — ${LAYOUT} loads nothing under ${variable}`
    )
  else if (!stack || firstFamily(stack) !== font.family)
    findings.push(
      `① ${path} names "${stack ? firstFamily(stack) : "?"}" but ${LAYOUT} loads ${font.family} (${font.loader}) under ${variable}`
    )
}

for (const font of loaded) {
  const described = tokens.some((p) => fontVariableOf(p) === font.variable)
  if (!described)
    findings.push(
      `② ${font.family} (${font.loader}) is loaded under ${font.variable ?? "no variable"} but no typography.font-family token describes it`
    )
}

for (const loader of unused)
  findings.push(
    `③ ${loader} is imported from next/font/google in ${LAYOUT} but never loaded — remove the import`
  )

if (findings.length > 0) {
  console.error(
    `❌ lint-font-tokens: ${findings.length} violation(s).\n\n   ${findings.join("\n   ")}\n`
  )
  process.exit(1)
}
console.log(
  `✅ lint-font-tokens: ${tokens.length} font-family token(s), each naming the family next/font loads under its variable (${loaded
    .map((f) => `${f.variable} → ${f.family}`)
    .join(", ")}).`
)
