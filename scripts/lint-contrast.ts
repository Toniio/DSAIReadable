/**
 * Contrast lint — every foreground/background pair the design system actually
 * ships must meet its WCAG 2.2 threshold, in both modes.
 *
 * The other token linters check structure (naming, references, freshness);
 * none of them can see that a perfectly well-formed token pair is unreadable.
 * Six such pairs shipped at once. Contrast is a property of a *pair*, so it
 * has to be declared here explicitly — it cannot be derived from the token
 * files alone.
 *
 *   npx tsx scripts/lint-contrast.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { luminance } from "./wcag.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

type Mode = "light" | "dark"
type Json = Record<string, unknown>

const read = (name: string): Json =>
  JSON.parse(readFileSync(resolve(ROOT, "tokens", name), "utf-8")) as Json

// The three tiers share one reference namespace: `{color.mist.500}` lives in
// primitive.json, `{color.text.default}` in semantic.json.
const TIERS = [
  read("primitive.json"),
  read("semantic.json"),
  read("component.json"),
]

function lookup(path: string): Json | undefined {
  for (const tier of TIERS) {
    let node: unknown = tier
    let found = true
    for (const key of path.split(".")) {
      if (typeof node === "object" && node !== null && key in (node as Json)) {
        node = (node as Json)[key]
      } else {
        found = false
        break
      }
    }
    if (found && typeof node === "object" && node !== null) return node as Json
  }
  return undefined
}

const REF = /^\{(.+)\}$/

/** Resolves a token path down to a literal hex value, following mode overrides. */
function resolveColor(
  path: string,
  mode: Mode,
  seen = new Set<string>()
): string {
  if (seen.has(`${path}:${mode}`)) {
    throw new Error(`Reference cycle on ${path} (${mode})`)
  }
  seen.add(`${path}:${mode}`)

  const node = lookup(path)
  if (!node) throw new Error(`Unknown token: ${path}`)

  const override = (
    (node.$extensions as Json | undefined)?.modes as Json | undefined
  )?.[mode] as Json | undefined

  const value = (override?.$value ?? node.$value) as string | undefined
  if (typeof value !== "string") throw new Error(`Token ${path} has no $value`)

  const ref = REF.exec(value)
  return ref ? resolveColor(ref[1], mode, seen) : value
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

type Pair = {
  label: string
  fg: string
  bg: string
  /** 4.5 for body text, 3.0 for UI components and graphical objects (WCAG 1.4.11). */
  threshold: 3 | 4.5
  modes?: Mode[]
}

const PAIRS: Pair[] = [
  // Focus indicators — non-text contrast against the surface they sit on.
  {
    label: "focus ring on default surface",
    fg: "color.border.focus",
    bg: "color.background.default",
    threshold: 3,
  },
  {
    label: "focus ring on subtle surface",
    fg: "color.border.focus",
    bg: "color.background.subtle",
    threshold: 3,
  },
  {
    label: "sidebar focus ring on sidebar surface",
    fg: "color.sidebar.ring",
    bg: "color.sidebar.background",
    threshold: 3,
  },

  // Body text on every surface it is allowed to sit on.
  {
    label: "default text on default surface",
    fg: "color.text.default",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "default text on subtle surface",
    fg: "color.text.default",
    bg: "color.background.subtle",
    threshold: 4.5,
  },
  {
    label: "default text on elevated surface",
    fg: "color.text.default",
    bg: "color.background.elevated",
    threshold: 4.5,
  },
  {
    label: "subtle text on default surface",
    fg: "color.text.subtle",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "subtle text on subtle surface (shadcn muted-foreground on muted)",
    fg: "color.text.subtle",
    bg: "color.background.subtle",
    threshold: 4.5,
  },
  {
    label: "action text on default surface",
    fg: "color.text.action.default",
    bg: "color.background.default",
    threshold: 4.5,
  },
  {
    label: "inverse text on inverse surface",
    fg: "color.text.inverse",
    bg: "color.background.inverse",
    threshold: 4.5,
  },

  // Filled surfaces and their own foreground.
  {
    label: "primary foreground on primary surface",
    fg: "color.action.background.foreground",
    bg: "color.action.background.default",
    threshold: 4.5,
  },
  {
    label: "destructive foreground on destructive surface",
    fg: "color.feedback.error.foreground",
    bg: "color.feedback.error.default",
    threshold: 4.5,
  },
  {
    label: "sidebar active item text on sidebar active item",
    fg: "color.sidebar.primary.on",
    bg: "color.sidebar.primary.default",
    threshold: 4.5,
  },
  {
    label: "sidebar text on sidebar surface",
    fg: "color.sidebar.foreground",
    bg: "color.sidebar.background",
    threshold: 4.5,
  },
]

const MODES: Mode[] = ["light", "dark"]

let failures = 0
let checked = 0

for (const pair of PAIRS) {
  for (const mode of pair.modes ?? MODES) {
    checked++
    const fg = resolveColor(pair.fg, mode)
    const bg = resolveColor(pair.bg, mode)
    const value = ratio(fg, bg)
    const pass = value >= pair.threshold
    if (!pass) failures++
    const mark = pass ? "✅" : "❌"
    const line = `${mark} ${mode.padEnd(5)} ${value.toFixed(2).padStart(5)} / ${pair.threshold}  ${pair.label}`
    if (pass) console.log(line)
    else console.error(`${line}\n     ${pair.fg} = ${fg} on ${pair.bg} = ${bg}`)
  }
}

console.log(`\n📊 ${checked} pair(s) checked, ${failures} failure(s).`)

if (failures > 0) {
  console.error(
    "\n❌ lint-contrast: at least one pair is below its WCAG 2.2 threshold.\n" +
      "   Fix the token, do not lower the threshold."
  )
  process.exit(1)
}

console.log("✅ lint-contrast: all pairs meet their WCAG 2.2 threshold.")
