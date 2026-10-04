/**
 * Palette build — generates the `color` group of tokens/primitive.json from
 * the source colors of scripts/lib/palette.ts: one OKLCH ramp of 11 steps per
 * hue, on lightness targets every hue shares, each step with its `hex`
 * fallback. A step no semantic token reads is written `reserved`.
 *
 * The palette is never edited by hand: change a source color, a lightness
 * target or a chroma share in scripts/lib/palette.ts, run this, then re-anchor
 * the semantic tokens until `npm run tokens-validate` passes.
 *
 *   npx tsx scripts/build-palette.ts           # write tokens/primitive.json
 *   npx tsx scripts/build-palette.ts --check   # fail if it is stale (CI)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"
import { loadTokens, primitiveGroups } from "../mcp-server/src/lib/dtcg.js"
import { colorGroup, SOURCES } from "./lib/palette.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const PATH = resolve(ROOT, "tokens/primitive.json")
const CHECK = process.argv.includes("--check")

/** Every `{primitive.color.…}` the semantic tier reads, in either mode. */
function referencedColors(): Set<string> {
  const tokens = loadTokens(ROOT)
  const found = new Set<string>()
  const visit = (node: unknown) => {
    if (typeof node === "string")
      for (const match of node.matchAll(/\{primitive\.color\.([^}]+)\}/g))
        found.add(match[1])
    else if (typeof node === "object" && node !== null)
      Object.values(node).forEach(visit)
  }
  visit(tokens.tiers.semantic.tree)
  for (const override of tokens.overrides.dark.values()) visit(override.$value)
  return found
}

/**
 * The file with its `primitive.color` group replaced, as text: parsing and
 * printing the whole file would move every integer key (`space.1`) ahead of
 * the others (`space.0-5`), as JavaScript orders an object's keys. The file is
 * Prettier's, so the group opens on `    "color": {` and closes on the next
 * line indented as deep.
 */
function withColors(text: string, group: unknown): string {
  const lines = text.split("\n")
  const start = lines.indexOf('    "color": {')
  const end = lines.findIndex((line, i) => i > start && /^ {4}\},?$/.test(line))
  if (start < 0 || end < 0)
    throw new Error("tokens/primitive.json: no `primitive.color` group found")
  const body = JSON.stringify(group, null, 2).replace(/\n/g, "\n    ")
  return [
    ...lines.slice(0, start),
    `    "color": ${body}${lines[end].endsWith(",") ? "," : ""}`,
    ...lines.slice(end + 1),
  ].join("\n")
}

const current = readFileSync(PATH, "utf-8")
// Throws when the file has no `primitive` root group.
primitiveGroups(JSON.parse(current))

const json = await format(
  withColors(current, colorGroup(SOURCES, referencedColors())),
  {
    ...(await resolveConfig(PATH)),
    filepath: PATH,
  }
)

if (CHECK) {
  if (json !== current) {
    console.error(
      "❌ build-palette: the color primitives of tokens/primitive.json differ from what scripts/lib/palette.ts generates.\n" +
        "   Run `npm run tokens:palette` and commit the result; never edit a generated step by hand."
    )
    process.exit(1)
  }
  console.log(
    `✅ build-palette: ${Object.keys(SOURCES).length} ramps of 11 steps match their source colors.`
  )
} else {
  writeFileSync(PATH, json)
  console.log(
    `✅ build-palette: ${Object.keys(SOURCES).length} ramps written to tokens/primitive.json.`
  )
}
