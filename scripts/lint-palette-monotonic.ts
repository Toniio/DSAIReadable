/**
 * Palette monotonicity lint — a higher step is always a darker colour.
 *
 * Agents read a palette the way its names suggest: `violet.650` sits between
 * 600 and 700, so it must be darker than 600. It was not — luminance 0.112
 * against 0.080 — and nothing said so. A step that breaks the order teaches
 * an agent the wrong mental model of the scale, and every colour it picks
 * "one step darker" from there is wrong.
 *
 * Rule: in every colour palette of tokens/primitive.json whose steps are
 * numbered, WCAG relative luminance strictly decreases as the number grows.
 * Steps that are not opaque hex colours (the `white-alpha` overlays) carry no
 * lightness order and are skipped, as are single colours such as `black`.
 *
 *   npx tsx scripts/lint-palette-monotonic.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { luminance } from "./wcag.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const HEX = /^#[0-9a-f]{6}$/i

type Leaf = { $value?: unknown }
const colors = (
  JSON.parse(readFileSync(resolve(ROOT, "tokens/primitive.json"), "utf-8")) as {
    color: Record<string, Record<string, Leaf> | Leaf>
  }
).color

const findings: string[] = []
const checked: string[] = []

for (const [palette, steps] of Object.entries(colors)) {
  if ("$value" in steps) continue // a single colour, not a scale
  const scale = Object.entries(steps as Record<string, Leaf>)
    .filter(
      ([step, leaf]) =>
        /^\d+$/.test(step) &&
        typeof leaf.$value === "string" &&
        HEX.test(leaf.$value)
    )
    .map(([step, leaf]) => ({
      step: Number(step),
      hex: leaf.$value as string,
      lum: luminance(leaf.$value as string),
    }))
    .sort((a, b) => a.step - b.step)
  if (scale.length < 2) continue
  checked.push(`${palette} (${scale.length})`)

  for (let i = 1; i < scale.length; i++) {
    const [lighter, darker] = [scale[i - 1], scale[i]]
    if (darker.lum >= lighter.lum)
      findings.push(
        `${palette}.${darker.step} (${darker.hex}, luminance ${darker.lum.toFixed(3)}) is not darker than ` +
          `${palette}.${lighter.step} (${lighter.hex}, ${lighter.lum.toFixed(3)}) — ` +
          `rename the step to where its lightness belongs, or change its value`
      )
  }
}

if (findings.length > 0) {
  console.error(
    `❌ lint-palette-monotonic: ${findings.length} step(s) out of order`
  )
  for (const f of findings) console.error(`   ${f}`)
  process.exit(1)
}

console.log(
  `✅ lint-palette-monotonic: ${checked.join(", ")} — luminance strictly decreases along every scale.`
)
