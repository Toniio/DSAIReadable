/**
 * Whether the design system's class draws what the upstream class drew: the
 * proof behind the `reason` of the re-tokenization table
 * (`shadcn-upstream.json`, CONTRIBUTING.md › Re-anchoring on shadcn/ui).
 *
 * An entry that only spells the same value another way (`min-w-[96px]` →
 * `min-w-24`, `opacity-50` → `opacity-disabled`) needs no explanation. One that
 * changes a value (`w-[100px]` → `w-24` is 96px) or a behavior (a class
 * removed) says why. The two are told apart by drawing both: each class is
 * compiled by Tailwind against `styles/globals.css`, the custom properties
 * are resolved with the `:root` values of `tokens.css`, `rem` and `s` are
 * brought to `px` and `ms`, and `calc()` is evaluated when its operands allow.
 * What is left is compared as text. Whatever this cannot prove equal needs a
 * reason: a reason on an equivalent entry is harmless, a missing one is not.
 *
 * Tailwind is driven through `classResolver` (scripts/lib/spec-classes.ts).
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { classResolver } from "./spec-classes"

const round = (n: number) => Math.round(n * 1e4) / 1e4

/**
 * The custom properties of the light theme: every `:root` block of tokens.css,
 * then the ones the `@theme` bridge of styles/globals.css adds
 * (`--color-popover: var(--color-background-elevated)`). A bridge entry never
 * replaces a token: `--radius-md: var(--radius-md)` would point at itself.
 */
function customProperties(root: string): Map<string, string> {
  const strip = (file: string) =>
    readFileSync(resolve(root, file), "utf-8").replace(/\/\*[\s\S]*?\*\//g, "")
  const properties = new Map<string, string>()
  const read = (body: string) => {
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
      if (!properties.has(name)) properties.set(name, value.trim())
  }
  for (const [, body] of strip("tokens.css").matchAll(/:root\s*\{([^}]*)\}/g))
    read(body)
  for (const [, body] of strip("styles/globals.css").matchAll(
    /@theme[^{]*\{([^}]*)\}/g
  ))
    read(body)
  return properties
}

/** `var(--x)` and `var(--x, fallback)` replaced by their value, as far as it is known. */
function resolveVars(
  value: string,
  properties: Map<string, string>,
  depth = 0
): string {
  let current = value
  for (let pass = 0; pass < 12; pass++) {
    const next = current.replace(
      /var\(\s*(--[\w-]+)\s*(?:,((?:[^()]|\([^()]*\))*))?\)/g,
      (match, name: string, fallback?: string) => {
        const known = properties.get(name)
        if (known !== undefined && depth < 12)
          return resolveVars(known, properties, depth + 1)
        return fallback !== undefined ? fallback.trim() : match
      }
    )
    if (next === current) break
    current = next
  }
  return current
}

interface Quantity {
  n: number
  unit: string
}

/** `calc()`'s arithmetic on `px`, `%`, `ms` and bare numbers; null when an operand is not one. */
function evaluate(expression: string): Quantity | null {
  const tokens: string[] = []
  const text = expression.trim()
  for (let i = 0; i < text.length;) {
    if (/\s/.test(text[i])) {
      i++
      continue
    }
    const previous = tokens.at(-1)
    const unary =
      text[i] === "-" &&
      (previous === undefined || /^[(+\-*/]$/.test(previous)) &&
      /[\d.]/.test(text[i + 1] ?? "")
    if (/[\d.]/.test(text[i]) || unary) {
      const number = /^-?\d*\.?\d+(?:px|%|ms)?/.exec(text.slice(i))
      if (!number) return null
      tokens.push(number[0])
      i += number[0].length
    } else if (/[()+\-*/]/.test(text[i])) tokens.push(text[i++])
    else return null
  }

  let at = 0
  const factor = (): Quantity | null => {
    const token = tokens[at++]
    if (token === undefined) return null
    if (token === "(") {
      const inside = sum()
      return tokens[at++] === ")" ? inside : null
    }
    const number = /^(-?\d*\.?\d+)(px|%|ms)?$/.exec(token)
    return number ? { n: Number(number[1]), unit: number[2] ?? "" } : null
  }
  const product = (): Quantity | null => {
    let left = factor()
    while (left && (tokens[at] === "*" || tokens[at] === "/")) {
      const operator = tokens[at++]
      const right = factor()
      if (!right) return null
      if (operator === "*") {
        if (left.unit && right.unit) return null
        left = { n: left.n * right.n, unit: left.unit || right.unit }
      } else {
        if (right.unit || right.n === 0) return null
        left = { n: left.n / right.n, unit: left.unit }
      }
    }
    return left
  }
  const sum = (): Quantity | null => {
    let left = product()
    while (left && (tokens[at] === "+" || tokens[at] === "-")) {
      const operator = tokens[at++]
      const right = product()
      if (!right || right.unit !== left.unit) return null
      left = {
        n: operator === "+" ? left.n + right.n : left.n - right.n,
        unit: left.unit,
      }
    }
    return left
  }
  const result = sum()
  return result && at === tokens.length ? result : null
}

/** Every `calc(…)` evaluated when it can be, else written without spaces. */
function normalizeCalc(value: string): string {
  let out = value
  for (let from = 0; ;) {
    const start = out.indexOf("calc(", from)
    if (start < 0) return out
    let depth = 0
    let end = start + 4
    for (; end < out.length; end++) {
      if (out[end] === "(") depth++
      if (out[end] === ")" && --depth === 0) break
    }
    const inner = out.slice(start + 5, end)
    const result = evaluate(inner)
    const replacement = result
      ? `${round(result.n)}${result.unit}`
      : `calc(${inner.replace(/\s+/g, "")})`
    out = out.slice(0, start) + replacement + out.slice(end + 1)
    from = start + replacement.length
  }
}

/** A declaration's value in a form two spellings of one value share. */
function normalizeValue(
  property: string,
  value: string,
  properties: Map<string, string>
): string {
  let out = resolveVars(value, properties)
    .replace(
      /(?<![\w.-])(-?\d*\.?\d+)rem\b/g,
      (_, n: string) => `${round(Number(n) * 16)}px`
    )
    .replace(
      /(?<![\w.])(-?\d*\.?\d+)s\b/g,
      (_, n: string) => `${round(Number(n) * 1000)}ms`
    )
  out = normalizeCalc(out)
  if (property === "opacity")
    out = out.replace(
      /^(\d*\.?\d+)%$/,
      (_, n: string) => `${round(Number(n) / 100)}`
    )
  return out.replace(/,\s+/g, ",").replace(/\s+/g, " ").trim()
}

/** Tailwind's escape of a class name in a selector. */
const escapeClass = (candidate: string) => candidate.replace(/[^\w-]/g, "\\$&")

export interface Equivalence {
  /** What a list of classes draws, canonical: equal strings draw the same CSS. */
  drawn(classes: string): string
  /** Whether two classes lists draw the same CSS. */
  sameClasses(a: string, b: string): boolean
  /** Whether two CSS values (`var(--radius)`, `var(--radius-md)`) read the same. */
  sameValue(a: string, b: string): boolean
}

export async function equivalence(root: string): Promise<Equivalence> {
  const resolveClasses = await classResolver(root)
  const properties = customProperties(root)

  const canonical = (css: string, candidate: string) =>
    css
      .replace(/@property[^{]*\{[^}]*\}/g, "")
      .replaceAll(`.${escapeClass(candidate)}`, ".X")
      .replace(
        /([\w-]+)\s*:\s*([^;{}]+?)\s*(?=;|\})/g,
        (_, property: string, value: string) =>
          `${property}:${normalizeValue(property, value, properties)}`
      )
      .replace(/\s+/g, " ")
      .trim()

  const drawn = (classes: string) => {
    const list = classes.split(/\s+/).filter(Boolean)
    const css = resolveClasses(list)
    return list
      .flatMap((candidate, i) =>
        css[i] === null ? [] : [canonical(css[i]!, candidate)]
      )
      .sort()
      .join("\n")
  }
  return {
    drawn,
    sameClasses: (a, b) => drawn(a) === drawn(b),
    sameValue: (a, b) =>
      normalizeValue("", a, properties) === normalizeValue("", b, properties),
  }
}
