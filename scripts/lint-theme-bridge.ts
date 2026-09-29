/**
 * Theme bridge lint — the `@theme inline` block of globals.css maps names, it
 * does not own values. This checks five things.
 *
 * Resolution: every var() must have a real provider. The `--x: var(--x)`
 * self-reference is a legitimate Tailwind v4 pattern — an out-of-layer
 * provider (tokens.css `:root`, or a next/font variable) wins over
 * `@layer theme`. But when that provider disappears or is renamed, the bridge
 * silently resolves to nothing and the utility dies without any build error.
 * That exact bug shipped twice (--color-sidebar-accent, --color-sidebar-primary).
 *
 * Tier integrity, added once the bridge stopped being the only safeguard:
 *   ① no `--ds-prim-*` reference — Tier 1 is private to tokens.css;
 *   ② no `calc()` — a formula here is a second copy of one tokens.css owns,
 *      and the two drift apart the next time the JSON changes;
 *   ③ each shadcn color alias must resolve to the same token on both sides,
 *      otherwise `bg-primary` and `var(--primary)` disagree;
 *   ④ every name must sit in a namespace Tailwind turns into utilities. This
 *      one was added after `--ring-focus`, `--z-modal` and
 *      `--transition-timing-function-spring` were found to be inert: rules ①-③
 *      all passed because their references resolved, yet `ring-focus`,
 *      `z-modal` and `ease-spring` emitted no CSS at all. Thirteen dead
 *      declarations, thirty-two dead class usages, and three components left
 *      with no visible focus indicator. A reference that resolves is not a
 *      utility that exists.
 *   ⑤ breakpoints are the one namespace the bridge cannot map: Tailwind
 *      compiles `sm:` into a media query at build time, and a media query
 *      cannot read var(). So the breakpoint.* tokens and the values Tailwind
 *      compiles with (its theme.css defaults, or a literal @theme override)
 *      must name the same breakpoints with the same values — otherwise the
 *      tokens document one layout while the build ships another.
 *
 *   npx tsx scripts/lint-theme-bridge.ts
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * Declarations allowed to keep a calc() inside `@theme`. Empty on purpose:
 * a formula here is a second copy of a decision that tokens.css already
 * encodes. Add an entry only with a comment explaining why the value cannot
 * live in tokens/*.json.
 */
const CALC_ALLOWLIST = new Set<string>()

const PRIVATE_PREFIX = "--ds-prim-"

/**
 * Tailwind v4 theme namespaces, i.e. the prefixes that actually generate
 * utilities. Anything else declared in `@theme` is an ordinary custom property
 * with no class behind it. Verified against compiled output, not from memory:
 * `--transition-duration-*` is here because `.duration-fast` is emitted, while
 * `--transition-timing-function-*` is absent because `.ease-spring` was not;
 * `--opacity-*` because `.opacity-disabled` is (P3-15).
 *
 * A name outside this set is not necessarily wrong — it just has to earn its
 * place in NON_UTILITY_ALLOWLIST with a reason.
 */
const UTILITY_NAMESPACES = [
  "--animate-",
  "--aspect-",
  "--blur-",
  "--border-width-",
  "--breakpoint-",
  "--color-",
  "--container-",
  "--default-border-width",
  "--drop-shadow-",
  "--ease-",
  "--font-",
  "--font-weight-",
  "--inset-shadow-",
  "--leading-",
  "--opacity-",
  "--perspective-",
  "--radius-",
  "--shadow-",
  "--spacing-",
  "--text-",
  "--text-shadow-",
  "--tracking-",
  "--transition-duration-",
]

/**
 * Declarations that are deliberately not utilities. Each entry needs a reason:
 * the point of rule ④ is that an inert name is a bug until proven otherwise.
 */
const NON_UTILITY_ALLOWLIST = new Map<string, string>()

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

/** Custom properties declared anywhere in a stylesheet. */
function declaredVars(css: string): Set<string> {
  const names = new Set<string>()
  for (const m of stripComments(css).matchAll(/(--[\w-]+)\s*:/g))
    names.add(m[1])
  return names
}

/** Extract the body of the `@theme inline { ... }` block (brace-balanced). */
function themeInlineBody(css: string): string {
  const start = css.search(/@theme\s+inline\s*\{/)
  if (start === -1)
    throw new Error("No `@theme inline` block found in globals.css")
  const open = css.indexOf("{", start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  throw new Error("Unbalanced braces in `@theme inline` block")
}

const globals = stripComments(
  readFileSync(resolve(ROOT, "app/globals.css"), "utf-8")
)
const tokens = readFileSync(resolve(ROOT, "tokens.css"), "utf-8")
const layout = readFileSync(resolve(ROOT, "app/layout.tsx"), "utf-8")

// next/font injects its variables on <html>, outside any cascade layer.
const fontVars = new Set(
  [...layout.matchAll(/variable:\s*["'](--[\w-]+)["']/g)].map((m) => m[1])
)

const providers = new Set([...declaredVars(tokens), ...fontVars])
const body = themeInlineBody(globals)
const declaredInTheme = declaredVars(body)

/** shadcn aliases from Tier 3, as `alias -> target custom property`. */
function shadcnAliases(): Map<string, string> {
  const raw = readFileSync(resolve(ROOT, "tokens/component.json"), "utf-8")
  const shadcn = (JSON.parse(raw) as Record<string, unknown>).shadcn as
    Record<string, { $value?: string }> | undefined
  const out = new Map<string, string>()
  for (const [alias, node] of Object.entries(shadcn ?? {})) {
    const ref = node?.$value?.match(/^\{(.+)\}$/)?.[1]
    if (ref) out.set(alias, `--${ref.replace(/\./g, "-")}`)
  }
  return out
}

const aliases = shadcnAliases()

/** Declarations of the `@theme` block, in source order. */
const declarations: Array<{ name: string; value: string }> = []
for (const line of body.split("\n")) {
  const decl = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);/)
  if (decl) declarations.push({ name: decl[1], value: decl[2] })
}

type Violation = { name: string; ref: string; selfRef: boolean }
const violations: Violation[] = []
/** Rule violations that are not about resolution, printed separately. */
const integrity: Array<{ name: string; detail: string }> = []

for (const { name, value } of declarations) {
  for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const ref = m[1]

    // ① The private tier must not leak past tokens.css.
    if (ref.startsWith(PRIVATE_PREFIX)) {
      integrity.push({
        name,
        detail:
          `references the private tier directly: var(${ref}).\n` +
          `      ↳ Tier 1 is private. Bridge to the semantic token instead, ` +
          `e.g. "${name}: var(${name});" when tokens.css already declares it.`,
      })
      continue
    }

    // Resolvable via tokens.css, next/font, or another @theme declaration.
    if (providers.has(ref)) continue
    if (ref !== name && declaredInTheme.has(ref)) continue
    violations.push({ name, ref, selfRef: ref === name })
  }

  // ② A formula here duplicates one that tokens.css already owns.
  if (/\bcalc\(/.test(value) && !CALC_ALLOWLIST.has(name)) {
    integrity.push({
      name,
      detail:
        `computes its value with calc(): ${value}\n` +
        `      ↳ The bridge maps names, it does not derive values. Move the ` +
        `formula to tokens/*.json so tokens.css stays the single source, ` +
        `or add "${name}" to CALC_ALLOWLIST with a justification.`,
    })
  }

  // ③ A color alias must agree with the Tier 3 mapping it mirrors.
  const alias = name.startsWith("--color-") ? name.slice("--color-".length) : ""
  const expected = aliases.get(alias)
  if (expected) {
    const target = value.trim().match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1]
    if (target !== expected) {
      integrity.push({
        name,
        detail:
          `maps to ${target ? `var(${target})` : value} but tokens/component.json ` +
          `maps the "${alias}" alias to var(${expected}).\n` +
          `      ↳ The utility and the shadcn variable would resolve to ` +
          `different tokens. Align both, or drop the alias from component.json.`,
      })
    }
  }
}

// ④ A name outside every utility namespace generates no class.
for (const { name } of declarations) {
  if (UTILITY_NAMESPACES.some((ns) => name.startsWith(ns))) continue
  if (NON_UTILITY_ALLOWLIST.has(name)) continue
  integrity.push({
    name,
    detail:
      `is not in any Tailwind utility namespace, so no class is generated ` +
      `from it.\n` +
      `      \u21b3 It resolves fine and fails silently: the utility simply ` +
      `does not exist. Move it to a real namespace (${UTILITY_NAMESPACES.slice(0, 3).join(", ")}, ` +
      `\u2026), declare it with "@utility" outside the @theme block, or add it ` +
      `to NON_UTILITY_ALLOWLIST with a reason.`,
  })
}

// Every shadcn color alias should reach the Tailwind namespace.
for (const [alias, expected] of aliases) {
  if (!expected.startsWith("--color-")) continue
  if (declaredInTheme.has(`--color-${alias}`)) continue
  integrity.push({
    name: `--color-${alias}`,
    detail:
      `is missing, but tokens/component.json declares the "${alias}" alias.\n` +
      `      ↳ Utilities such as bg-${alias} would fall back to a Tailwind ` +
      `default instead of var(${expected}).`,
  })
}

// ⑤ Breakpoints: the tokens and the values Tailwind compiles with agree.
{
  const decls = (css: string) =>
    new Map(
      [...css.matchAll(/(--[\w*-]+)\s*:\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].trim(),
      ])
    )
  const tokenDecls = decls(tokens)
  const resolveToken = (value: string, seen = 0): string => {
    const ref = value.match(/^var\((--[\w-]+)\)$/)
    return ref && seen < 10
      ? resolveToken(tokenDecls.get(ref[1]) ?? value, seen + 1)
      : value
  }

  const tailwindTheme = readFileSync(
    createRequire(import.meta.url).resolve("tailwindcss/theme.css"),
    "utf-8"
  )
  const compiled = new Map(
    [...decls(tailwindTheme)].filter(([name]) =>
      /^--breakpoint-[\w-]+$/.test(name)
    )
  )
  for (const [name, value] of decls(globals)) {
    if (name === "--breakpoint-*" && value === "initial") compiled.clear()
    else if (name.startsWith("--breakpoint-")) {
      if (/var\(/.test(value))
        integrity.push({
          name,
          detail: `reads var() — a media query cannot, so Tailwind would emit an invalid breakpoint. Declare the literal value, equal to the breakpoint token.`,
        })
      compiled.set(name, value)
    }
  }

  const fromTokens = new Map(
    [...tokenDecls]
      .filter(([name]) => /^--breakpoint-[\w-]+$/.test(name))
      .map(([name, value]) => [name, resolveToken(value)])
  )
  for (const [name, value] of fromTokens) {
    const built = compiled.get(name)
    if (built === undefined)
      integrity.push({
        name,
        detail: `is a breakpoint token, but Tailwind compiles no such breakpoint — the \`${name.slice(13)}:\` variant does not exist.`,
      })
    else if (built !== value)
      integrity.push({
        name,
        detail: `is ${value} in the tokens but Tailwind compiles ${built}. Align tokens/*.json, or override --breakpoint-* with the literal token value in globals.css.`,
      })
  }
  for (const name of compiled.keys())
    if (!fromTokens.has(name))
      integrity.push({
        name,
        detail: `is a breakpoint Tailwind compiles, with no breakpoint.* token behind it.`,
      })
}

if (integrity.length > 0) {
  console.error(
    `❌ lint-theme-bridge: ${integrity.length} tier integrity violation(s) in @theme inline.\n`
  )
  for (const v of integrity) console.error(`   ${v.name} ${v.detail}`)
  console.error("")
}

if (violations.length > 0) {
  console.error(
    `❌ lint-theme-bridge: ${violations.length} unresolved reference(s) in @theme inline.\n`
  )
  for (const v of violations) {
    console.error(`   ${v.name}: var(${v.ref})`)
    console.error(
      v.selfRef
        ? `      ↳ self-reference with no out-of-layer provider — "${v.ref}" is not declared in tokens.css.\n` +
            `        Point it at the real token (e.g. "${v.ref}-default") or add the token to tokens/*.json.`
        : `      ↳ "${v.ref}" is declared nowhere — typo or removed token.`
    )
  }
  console.error(`\n   These resolve to nothing at runtime and fail silently.`)
  process.exit(1)
}

if (integrity.length > 0) process.exit(1)

console.log(
  `✅ lint-theme-bridge: ${declaredInTheme.size} @theme declarations, all references resolve; ` +
    `no private-tier leak, no calc(), every name in a utility namespace, ${aliases.size} shadcn alias(es) consistent with Tier 3, breakpoints equal to the tokens.`
)
