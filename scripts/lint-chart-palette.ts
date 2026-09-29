/**
 * Chart palette lint — every categorical series is visible, and no two
 * series can be mistaken for each other.
 *
 * The palette this replaced was five shades of one green: `chart-1` stood at
 * 1.30:1 on white — invisible — and neighbouring series differed by an OKLab
 * distance of 0.08, below what a reader tells apart at a glance. It was a
 * sequential ramp used for unordered categories.
 *
 * Two rules, per mode:
 *   ① each series `color.chart.1…5` reaches 3:1 against the default, subtle
 *      and elevated surfaces it can be drawn on (WCAG 2.2 SC 1.4.11,
 *      non-text contrast);
 *   ② every pair of series is at least MIN_DELTA_E apart in OKLab, in normal
 *      vision and simulated protanopia and deuteranopia. All pairs, not only
 *      neighbours: a legend or two distant lines put any two side by side.
 *
 * Why not 3:1 *between* series: five colors pairwise 3:1 apart need an 81:1
 * spread, and a series dark enough for 3:1 on a light surface leaves at most
 * 6.3:1. Categorical palettes separate series by hue, so that is what ② measures.
 *
 * `color.chart.sequential.*` is exempt from ②: its steps are meant to differ
 * by lightness alone, for ordered data.
 *
 *   npx tsx scripts/lint-chart-palette.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { luminance } from "./wcag.js"
import { deltaE, VISIONS } from "./color-vision.js"
import { cssValue } from "../mcp-server/src/lib/dtcg.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * Floor for ② in OKLab units. The adopted palette's worst pair is 0.19 in
 * every vision; IBM Carbon's categorical palette falls to 0.06 under
 * deuteranopia. 0.15 leaves the current palette a margin and rejects any
 * pair that collapses for a color-blind reader.
 */
const MIN_DELTA_E = 0.15
const MIN_CONTRAST = 3
const SERIES = ["1", "2", "3", "4", "5"]
const SURFACES = ["default", "subtle", "elevated"]
const MODES = ["light", "dark"] as const

type Node = {
  $value?: unknown
  $type?: string
  $extensions?: { modes?: { dark?: { $value?: unknown } } }
}
const read = (file: string) =>
  JSON.parse(readFileSync(resolve(ROOT, file), "utf-8")) as Record<
    string,
    unknown
  >
const primitive = read("tokens/primitive.json")
const semantic = read("tokens/semantic.json")

const at = (tree: Record<string, unknown>, path: string) =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown> | undefined)?.[key],
      tree
    ) as Node | undefined

/** Hex value of a semantic color in a mode (semantic → primitive). */
function hexOf(path: string, mode: (typeof MODES)[number]): string {
  const node = at(semantic, path)
  if (!node?.$value) throw new Error(`Unknown semantic token ${path}`)
  const ref = String(
    (mode === "dark" && node.$extensions?.modes?.dark?.$value) || node.$value
  )
  const leaf = at(primitive, ref.replace(/^\{|\}$/g, ""))
  const target =
    leaf?.$value === undefined ? undefined : cssValue(leaf.$value, leaf.$type)
  if (!target || !/^#[0-9a-f]{6}$/i.test(target))
    throw new Error(`${path} (${mode}) does not resolve to a hex color`)
  return target
}

const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const findings: string[] = []
const report: string[] = []

for (const mode of MODES) {
  const series = SERIES.map((n) => ({
    n,
    hex: hexOf(`color.chart.${n}`, mode),
  }))

  let worstContrast = Infinity
  for (const surface of SURFACES) {
    const bg = hexOf(`color.background.${surface}`, mode)
    for (const { n, hex } of series) {
      const r = ratio(hex, bg)
      worstContrast = Math.min(worstContrast, r)
      if (r < MIN_CONTRAST)
        findings.push(
          `① ${mode}: chart.${n} ${hex} is ${r.toFixed(2)}:1 on background.${surface} ${bg} — below ${MIN_CONTRAST}:1`
        )
    }
  }

  const worstDelta: Record<string, number> = {}
  for (const vision of VISIONS) {
    worstDelta[vision] = Infinity
    for (let i = 0; i < series.length; i++)
      for (let j = i + 1; j < series.length; j++) {
        const [a, b] = [series[i], series[j]]
        const d = deltaE(a.hex, b.hex, vision)
        worstDelta[vision] = Math.min(worstDelta[vision], d)
        if (d < MIN_DELTA_E)
          findings.push(
            `② ${mode}, ${vision}: chart.${a.n} ${a.hex} and chart.${b.n} ${b.hex} are ${d.toFixed(3)} apart — below ${MIN_DELTA_E}`
          )
      }
  }

  report.push(
    `${mode}: ≥ ${worstContrast.toFixed(2)}:1 on every surface, pairs ≥ ` +
      VISIONS.map((v) => `${worstDelta[v].toFixed(2)} ${v}`).join(" / ")
  )
}

if (findings.length > 0) {
  console.error(`❌ lint-chart-palette: ${findings.length} finding(s)`)
  for (const f of findings) console.error(`   ${f}`)
  process.exit(1)
}

console.log(`✅ lint-chart-palette: ${report.join(" · ")}`)
