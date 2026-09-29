/**
 * Focus ring lint — one preset, drawn from one token, provably rendered.
 *
 * The audit that produced this script found sixteen distinct focus patterns
 * across twenty-one components, and three of them drew nothing at all:
 * `ring-focus` was never a Tailwind utility, so Toggle, ScrollArea and
 * Calendar shipped with no visible focus indicator — WCAG 2.2 SC 2.4.7, level
 * A. Nothing failed: the class was simply absent from the stylesheet.
 *
 * Four rules, each one a bug that already shipped:
 *   ① no `ring-focus` — the class that never existed;
 *   ② no raw ring width on a focus-ish state — `ring-1`, `ring-2`, `ring-3`
 *      are pixel values, forbidden by the repository's first rule, and they
 *      are how the system drifted to three different focus widths;
 *   ③ no `outline-none` — it removes the outline in forced-colors mode, where
 *      box-shadow rings are not painted, leaving no indicator at all; it also
 *      poisons `--tw-outline-style`, which silently disabled ScrollArea's and
 *      NavigationMenu's own `outline-1`. Use `outline-hidden`;
 *   ④ every single outline reset must be answered, on the spot, by a ring in
 *      the same class string or by a "focus-managed: <mechanism>" comment
 *      naming what draws the indicator instead. Checked per occurrence, not
 *      per file: a component with ten reset sites and one ring elsewhere was
 *      passing a file-level version of this rule. Checked per target, too:
 *      `**:data-[slot=navigation-menu-link]:focus:outline-none` stripped every
 *      link of its indicator while a ring on the menu itself, or any `ring-0`
 *      on the line, satisfied a line-level version.
 *
 * A bare `ring-0` is allowed: removing a ring is a deliberate act, and it is
 * how a wrapper such as InputGroup takes over the indicator for its inner
 * control. Under a focus state it removes the indicator, and counts as a reset.
 *
 *   npx tsx scripts/lint-focus-ring.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

const MARKER = /\/\/[^\S\n]*focus-managed:[^\S\n]*\S/

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const PRESET = "lib/focus.ts"
const TOKEN = "ring-(length:--space-focus-ring-width)"

/**
 * Variants that move a class off the element onto other nodes: its children,
 * its descendants, a pseudo-element. Everything else (focus, hover, data-*,
 * group-*, md:) only says *when* the class applies to the same node.
 */
const TARGET_VARIANT =
  /^(?:\*|\*\*|before|after|placeholder|file|marker|selection|backdrop|\[[^\]]*[_>+~][^\]]*\])$/

/** States whose ring is a focus indicator and must therefore share the token. */
const FOCUS_STATES =
  /(?:focus|focus-visible|focus-within|data-\[active=true\]|data-\[focused=true\]|group-data-\[focused=true\][^:]*)/

type Finding = { file: string; line: number; rule: string; detail: string }
const findings: Finding[] = []

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = resolve(dir, e.name)
    if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(p)
    return e.isFile() && p.endsWith(".tsx") ? [p] : []
  })

const files = [
  ...walk(resolve(ROOT, "components")),
  ...walk(resolve(ROOT, "app")),
]

for (const abs of files) {
  const file = relative(ROOT, abs)
  const source = readFileSync(abs, "utf-8")
  const lines = source.split("\n")
  let inImport = false
  lines.forEach((line, i) => {
    const at = { file, line: i + 1 }
    if (/^import\b/.test(line)) {
      inImport = !/\bfrom\b/.test(line)
      return
    }
    if (inImport) {
      if (/\bfrom\b/.test(line)) inImport = false
      return
    }
    // ① The class that never existed.
    if (/(?<![\w-])ring-focus(?![\w-])/.test(line))
      findings.push({
        ...at,
        rule: "dead-class",
        detail:
          `uses "ring-focus", which generates no CSS: "--ring-*" is not a ` +
          `Tailwind namespace. Import FOCUS_RING from @/lib/focus instead.`,
      })

    // ② A focus ring measured in pixels.
    for (const m of line.matchAll(/([\w:\[\]/.=&*>-]*)\bring-([1-9])\b/g)) {
      const prefix = m[1] ?? ""
      if (!FOCUS_STATES.test(prefix) && !/aria-invalid/.test(prefix)) continue
      findings.push({
        ...at,
        rule: "raw-width",
        detail:
          `sets a focus ring to a raw width ("${m[0]}"). Widths belong to ` +
          `--space-focus-ring-width: write "${prefix}${TOKEN}", or import ` +
          `FOCUS_RING from @/lib/focus when the color is standard too.`,
      })
    }

    // ④ A reset with nothing to replace it, read class by class: every
    // outline reset, and every ring removed under a focus state, must be
    // answered by a ring drawn on the same target (the element itself, or the
    // children a `*:` / `**:` / `[&_x]:` / `before:` variant selects).
    const classes = classTokens(line)
    const declared =
      lines
        .slice(0, i + 1)
        .reverse()
        .reduce<boolean | null>((found, l, offset) => {
          // A marker belongs to the class string it sits against: the line
          // itself, then every comment line touching it. A fixed line budget
          // instead made the marker's position among other comments matter.
          if (found !== null) return found
          if (MARKER.test(l)) return true
          if (offset > 0 && !isCommentLine(l)) return false
          return null
        }, null) === true
    const drawn = new Set(
      classes.filter((c) => c.utility === TOKEN).map((c) => c.target)
    )
    if (line.includes("FOCUS_RING")) drawn.add("")
    const resets = classes.filter(
      (c) =>
        /^outline-(?:hidden|none)$/.test(c.utility) ||
        (c.utility === "ring-0" && FOCUS_STATES.test(c.prefix))
    )
    if (line.includes("FOCUS_OUTLINE_RESET"))
      resets.push({ prefix: "", target: "", utility: "FOCUS_OUTLINE_RESET" })
    for (const reset of resets) {
      if (declared || drawn.has(reset.target)) continue
      const where = reset.target
        ? `the elements "${reset.target}:" selects`
        : "this element"
      findings.push({
        ...at,
        rule: "no-indicator",
        detail:
          `"${reset.prefix}${reset.utility}" removes the focus indicator of ` +
          `${where}, and no ring is drawn on the same target in this class ` +
          `string, so focusing it shows nothing (WCAG 2.2 SC 2.4.7). Add ` +
          `FOCUS_RING (or "${reset.target ? reset.target + ":" : ""}focus-visible:${TOKEN}"), ` +
          `or name what draws the indicator instead with a ` +
          `"// focus-managed: <mechanism>" comment on the lines just above.`,
      })
    }

    // ③ The outline reset that erases the indicator in forced-colors mode,
    // whatever variant it sits under.
    for (const c of classes.filter((c) => c.utility === "outline-none"))
      findings.push({
        ...at,
        rule: "outline-none",
        detail:
          `uses "${c.prefix}outline-none". Forced-colors mode does not paint ` +
          `box-shadow rings, so the element is left with no focus indicator ` +
          `at all, and "outline-none" also poisons --tw-outline-style for any ` +
          `later "outline-<n>". Use FOCUS_OUTLINE_RESET from @/lib/focus.`,
      })
  })
}

if (findings.length > 0) {
  console.error(`❌ lint-focus-ring: ${findings.length} violation(s).\n`)
  for (const f of findings)
    console.error(`   ${f.file}:${f.line} [${f.rule}]\n      ↳ ${f.detail}`)
  console.error(
    `\n   The focus ring is defined once, in ${PRESET}. Every focusable element uses it.`
  )
  process.exit(1)
}

console.log(
  `✅ lint-focus-ring: ${files.length} components, one focus preset from ${PRESET}, ` +
    `no raw ring width, no outline-none.`
)

type ClassToken = { prefix: string; target: string; utility: string }

/** Splits a source line into Tailwind classes, each with its variant chain. */
function classTokens(line: string): ClassToken[] {
  return line
    .split(/[\s"'`${}]+/)
    .filter((raw) => /^[\w*!\[@-]/.test(raw) && raw.length > 1)
    .map((raw) => {
      const parts = splitVariants(raw.replace(/!/g, ""))
      const utility = parts.pop() ?? ""
      const lastTarget = parts.findLastIndex((v) => TARGET_VARIANT.test(v))
      return {
        prefix: parts.map((v) => `${v}:`).join(""),
        target: parts.slice(0, lastTarget + 1).join(":"),
        utility,
      }
    })
}

/** Splits `a:[b:c]:d-(e:f)` on the colons outside brackets and parentheses. */
function splitVariants(raw: string): string[] {
  const parts = [""]
  let depth = 0
  for (const ch of raw) {
    if (ch === "[" || ch === "(") depth++
    if (ch === "]" || ch === ")") depth--
    if (ch === ":" && depth === 0) parts.push("")
    else parts[parts.length - 1] += ch
  }
  return parts
}

function isCommentLine(line: string): boolean {
  const t = line.trim()
  return (
    t === "" || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")
  )
}
