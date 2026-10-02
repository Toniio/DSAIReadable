/**
 * Writes the `## Tokens` section of every component spec from the
 * component's code.
 *
 * Written by hand, the section had drifted: 126 of its 333 entries could not
 * be found in the component's file — names that exist nowhere
 * (`--color-text-muted-foreground`, in five specs), shadcn aliases
 * (`--primary`) no component reads, classes that live in lib/focus.ts or
 * lib/overlay.ts rather than in the component. An agent could not tell which
 * tokens a component really draws with, nor where they come from.
 *
 * Each string of the component's file, plus the value of each constant it
 * imports from `@/lib/*`, is split into class candidates. Tailwind resolves
 * every candidate against styles/globals.css — the same design system the build
 * uses — and the `var(--…)` its CSS reads is looked up in tokens.manifest.json.
 * Because the bridge is `@theme inline`, a class resolves straight to the
 * semantic token: `bg-primary` → `--color-action-background-default`. A
 * `var(--…)` written in the code itself is looked up the same way. A font
 * class reads the variable next/font sets (`font-mono` → `--font-mono`), which
 * leads to the typography token that describes the family.
 *
 * Only semantic tokens are listed. Since the spacing scale is locked, `p-2`
 * resolves to `space.scale.2` like any other class; classes that read no
 * token (`w-full`, `flex`, layout) are left out on purpose.
 *
 * The strings and the Tailwind resolver come from scripts/lib/spec-classes.ts,
 * which says what to do when a Tailwind upgrade breaks them.
 *
 *   npx tsx scripts/build-spec-tokens.ts [--check]
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"
import { nextFontsOf } from "./lib/next-fonts.js"
import {
  classResolver,
  codePathsOf,
  composedOf,
  stringsOf,
  utilityOf,
} from "./lib/spec-classes.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CHECK = process.argv.includes("--check")
const SPECS_DIR = resolve(ROOT, "specs/components")
const HEADING = "## Tokens"

// ---------------------------------------------------------------------------
// Tokens and Tailwind
// ---------------------------------------------------------------------------
interface ManifestToken {
  token: string
  tier: "primitive" | "semantic" | "component"
  cssVar: string
  reference: Record<string, string>
}
const manifest = (
  JSON.parse(readFileSync(resolve(ROOT, "tokens.manifest.json"), "utf-8")) as {
    tokens: ManifestToken[]
  }
).tokens
const byCssVar = new Map(manifest.map((t) => [t.cssVar, t]))
const byPath = new Map(manifest.map((t) => [t.token, t]))

/**
 * next/font sets `--font-<key>` on <html>, and `typography.font-family.<key>`
 * describes the family it loads (lint-font-tokens holds the two together). No
 * token reads `--font-mono`, so the link is made here: `font-mono` draws with
 * `typography.font-family.mono`.
 */
const fontTokenOf = new Map(
  nextFontsOf(ROOT)
    .loaded.flatMap((f) => (f.variable ? [f.variable] : []))
    .map((v) => [v, `typography.font-family.${v.slice("--font-".length)}`])
    .filter(([, token]) =>
      manifest.some((t) => t.token === token && t.tier === "semantic")
    ) as [string, string][]
)

/**
 * Semantic token behind a CSS variable, following a Tier 3 alias to it, or
 * the font-family token behind a next/font variable.
 */
function semanticToken(cssVar: string): string | undefined {
  const font = fontTokenOf.get(cssVar)
  if (font) return font
  const t = byCssVar.get(cssVar)
  if (!t) return undefined
  if (t.tier === "semantic") return t.token
  if (t.tier === "component") {
    const ref = Object.values(t.reference)[0]?.match(/^\{(.+)\}$/)?.[1]
    return ref && byPath.get(ref)?.tier === "semantic" ? ref : undefined
  }
  return undefined
}

const VAR = /var\((--[\w-]+)/g
const cssOf = await classResolver(ROOT)

const code = (s: string) => `\`${s}\``

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------
interface Row {
  forms: Set<string>
  where: Set<string>
}

async function tokensOf(file: string): Promise<Map<string, Row>> {
  const rows = new Map<string, Row>()
  const add = (token: string, form: string, where: string) => {
    const row = rows.get(token) ?? { forms: new Set(), where: new Set() }
    row.forms.add(form)
    row.where.add(where)
    rows.set(token, row)
  }

  for (const { text, where } of await stringsOf(ROOT, file)) {
    const candidates = text.split(/\s+/).filter(Boolean)
    cssOf(candidates).forEach((css, i) => {
      // A class: the token is what its CSS reads. Anything else (a style
      // value, a calc) is read for the var(--…) written in it.
      const [source, form] = css
        ? [css, () => utilityOf(candidates[i])]
        : [candidates[i], (cssVar: string) => `var(${cssVar})`]
      for (const [, cssVar] of source.matchAll(VAR)) {
        const token = semanticToken(cssVar)
        if (token) add(token, form(cssVar), where)
      }
    })
  }
  return rows
}

const list = (values: Set<string>, show = (s: string) => s) =>
  [...values].sort().map(show).join(" · ")

async function sectionFor(
  codePath: string,
  specOf: Map<string, string>
): Promise<string> {
  const rows = await tokensOf(codePath)
  const composed = composedOf(ROOT, codePath, specOf)
  const composes =
    composed.length > 0
      ? `Composes ${composed.map(code).join(", ")} — ${composed.length > 1 ? "their tokens are listed in their own specs" : "its tokens are listed in its own spec"}.`
      : undefined
  const lines = [
    HEADING,
    "",
    "<!-- Generated by scripts/build-spec-tokens.ts from the component's code — do not edit by hand. -->",
    "",
  ]
  if (rows.size === 0) {
    lines.push(
      `No token: ${code(codePath)} uses no class or variable that leads to a semantic token.`
    )
    if (composes) lines.push("", composes)
  } else {
    lines.push(
      "| Token | Classes and variables | Where |",
      "|---|---|---|",
      ...[...rows.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([token, { forms, where }]) =>
            `| ${code(token)} | ${list(forms, code)} | ${list(where)} |`
        ),
      "",
      `Collected from ${code(codePath)} and the \`lib/\` constants it imports; Tailwind resolves each class down to its semantic token. **Where**: the sub-component, the \`cva\` variant path or the constant the class comes from. Classes that read no token (\`w-full\`, \`flex\`, layout) are left out.`
    )
    if (composes) lines.push("", composes)
  }
  return lines.join("\n") + "\n"
}

/** Replace the section, which every spec has (lint-spec-sections checks it). */
function withSection(markdown: string, section: string): string {
  const start = markdown.indexOf(`\n${HEADING}\n`)
  if (start === -1) throw new Error(`no "${HEADING}" section`)
  const next = markdown.indexOf("\n## ", start + 1)
  return (
    markdown.slice(0, start + 1) + section + "\n" + markdown.slice(next + 1)
  )
}

const codePathOf = codePathsOf(SPECS_DIR)
const specFiles = [...codePathOf.keys()]
const specOf = new Map(
  [...codePathOf].map(([file, codePath]) => [codePath, basename(file, ".md")])
)

const stale: string[] = []
for (const file of specFiles) {
  const path = resolve(SPECS_DIR, file)
  const current = readFileSync(path, "utf-8")
  const next = await format(
    withSection(current, await sectionFor(codePathOf.get(file)!, specOf)),
    { ...(await resolveConfig(path)), filepath: path }
  )
  if (next === current) continue
  if (CHECK) stale.push(basename(file))
  else writeFileSync(path, next)
}

if (CHECK && stale.length > 0) {
  console.error(
    `❌ build-spec-tokens: ${stale.length} spec(s) out of date with the tokens their code uses: ${stale.join(", ")}\n` +
      "   Run `npm run specs:tokens` and commit the result."
  )
  process.exit(1)
}
console.log(
  CHECK
    ? "✅ build-spec-tokens: every spec's Tokens section matches the code."
    : "✅ build-spec-tokens: Tokens sections written."
)
