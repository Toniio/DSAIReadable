/**
 * Rebrand test — the palette is a function of its source colors, and the
 * semantic tier holds whichever brand they make.
 *
 * Every hue shares the lightness targets of scripts/lib/palette.ts, so a step
 * reads at about the same contrast whatever its hue. This test proves it where
 * it matters: it replaces the brand's source color (`violet`, which the action,
 * link and sidebar tokens read) with each color of REBRANDS, regenerates the
 * ramp in memory, and replays every contrast pair of scripts/lint-contrast.ts
 * on it, with no semantic token moved. A pair that fails names the lightness
 * target or the chroma share to revisit, not the brand.
 *
 *   npx tsx scripts/test-rebrand.ts
 */

import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadTokens, type Tokens } from "../mcp-server/src/lib/dtcg.js"
import { measureContrast } from "./lib/contrast.js"
import { colorGroup, SOURCES } from "./lib/palette.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** Brands around the hue wheel, each far from the violet it replaces. */
const REBRANDS: Record<string, string> = {
  rose: "#e11d48",
  orange: "#ea580c",
  green: "#16a34a",
  teal: "#0d9488",
  sky: "#0284c7",
}

const BRAND = "violet"
const tokens = loadTokens(ROOT)

/** The tokens with the color primitives regenerated from `sources`. */
function withPalette(sources: typeof SOURCES): Tokens {
  const { file, tree } = tokens.tiers.primitive
  const primitive = tree.primitive as Record<string, unknown>
  return {
    ...tokens,
    tiers: {
      ...tokens.tiers,
      primitive: {
        file,
        tree: {
          ...tree,
          primitive: { ...primitive, color: colorGroup(sources, new Set()) },
        },
      },
    },
  }
}

const failures: string[] = []
let checked = 0
for (const [name, hex] of Object.entries(REBRANDS)) {
  const sources = { ...SOURCES, [BRAND]: { ...SOURCES[BRAND], hex } }
  const measures = measureContrast(withPalette(sources)).filter(
    (m) => !m.pair.informative
  )
  checked = measures.length
  for (const m of measures.filter((m) => !m.pass))
    failures.push(
      `${name} ${hex}, ${m.mode}: ${m.ratio.toFixed(2)} / ${m.pair.threshold}  ${m.pair.label} (${m.fg} on ${m.under})`
    )
}

if (failures.length > 0) {
  console.error(
    `❌ test-rebrand: ${failures.length} pair(s) fail once the ${BRAND} ramp is regenerated from another source`
  )
  for (const f of failures) console.error(`   ${f}`)
  process.exit(1)
}
const brands = Object.entries(REBRANDS)
  .map(([name, hex]) => `${name} ${hex}`)
  .join(", ")
console.log(
  `✅ test-rebrand: the ${BRAND} ramp regenerated from ${brands}: all ${checked} contrast pairs hold each time, no semantic token moved.`
)
