/**
 * The classes a component draws with, as the spec generators read them:
 * every string of its file, plus the value of each constant it imports from
 * `@/lib/*` and the classes of each `*Variants` function it calls from another
 * component (`buttonVariants({ variant: "ghost" })`), each with where it sits
 * (`buttonVariants.variant.default`, the sub-component, the constant), and
 * Tailwind to tell a class from any other string. build-spec-tokens.ts
 * follows each class to its semantic token, build-spec-states.ts groups the
 * classes by the state their variants name.
 *
 * Tailwind is driven through `__unstable__loadDesignSystem` from
 * `@tailwindcss/node`: a private, unversioned API, the only one that resolves
 * a class to its CSS against a full stylesheet. It must come from the same
 * release as `tailwindcss` — Dependabot bumps the `tailwind` group together.
 * When a Tailwind upgrade breaks it, the symptom is in the spec generators,
 * not in the build: this module throws on import or on `candidatesToCss`, or
 * every generated section comes out empty, and `specs:validate` fails with it.
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { __unstable__loadDesignSystem } from "@tailwindcss/node"
import ts from "typescript"
import { statesOf } from "./spec-states.js"

/**
 * Resolves class candidates to their CSS against styles/globals.css, the
 * design system the build uses; `null` for a string that is not a class.
 */
export async function classResolver(
  root: string
): Promise<(candidates: string[]) => (string | null)[]> {
  const designSystem = await __unstable__loadDesignSystem(
    readFileSync(resolve(root, "styles/globals.css"), "utf-8"),
    { base: resolve(root, "styles") }
  )
  const cache = new Map<string, string | null>()
  return (candidates) => {
    const unknown = [...new Set(candidates)].filter((c) => !cache.has(c))
    if (unknown.length > 0) {
      const css = designSystem.candidatesToCss(unknown)
      unknown.forEach((c, i) => cache.set(c, css[i] ?? null))
    }
    return candidates.map((c) => cache.get(c) ?? null)
  }
}

/** Splits a candidate at its top-level colons: `dark:hover:bg-primary/80` → `dark`, `hover`, `bg-primary/80`. */
function partsOf(candidate: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i]
    if (ch === "[" || ch === "(") depth++
    else if (ch === "]" || ch === ")") depth--
    else if (ch === ":" && depth === 0) {
      parts.push(candidate.slice(start, i))
      start = i + 1
    }
  }
  parts.push(candidate.slice(start))
  return parts
}

/** `dark:hover:bg-primary/80` → `bg-primary/80`: the utility, without its variants. */
export function utilityOf(candidate: string): string {
  return partsOf(candidate).at(-1)!.replace(/^!|!$/g, "")
}

/** `dark:hover:bg-primary/80` → `dark`, `hover`: the variants, outermost first. */
export function variantsOf(candidate: string): string[] {
  return partsOf(candidate).slice(0, -1)
}

// ---------------------------------------------------------------------------
// Strings of a component file, with where each one sits
// ---------------------------------------------------------------------------
const code = (s: string) => `\`${s}\``

/**
 * Where a node sits: the top-level declaration that holds it, then the object
 * keys down to it — `buttonVariants.variant.destructive` for a cva variant,
 * `Button` for a class in the component's JSX. The `variants` key of a cva
 * config is dropped: every variant path goes through it.
 */
function placeOf(node: ts.Node): string[] {
  const keys: string[] = []
  let name = "?"
  let child: ts.Node = node
  for (let n: ts.Node | undefined = node; n; child = n, n = n.parent) {
    // A key of a cn({ "classes": condition }) object is a class list, not a
    // place; so is a key that is the string itself.
    if (ts.isPropertyAssignment(n) && n.name !== child && !isCnArgument(n)) {
      const key = n.name
      keys.unshift(
        ts.isIdentifier(key) ||
          ts.isStringLiteral(key) ||
          ts.isNumericLiteral(key)
          ? key.text
          : "?"
      )
    }
    if (ts.isSourceFile(n.parent)) {
      if (ts.isFunctionDeclaration(n) && n.name) name = n.name.text
      else if (ts.isVariableStatement(n))
        name = n.declarationList.declarations[0].name.getText()
      break
    }
  }
  if (keys[0] === "variants") keys.shift()
  return [name, ...keys]
}

const whereOf = (node: ts.Node) => placeOf(node).join(".")

function isCnArgument(assignment: ts.PropertyAssignment): boolean {
  const call = assignment.parent.parent
  return (
    ts.isCallExpression(call) &&
    ts.isIdentifier(call.expression) &&
    call.expression.text === "cn"
  )
}

// ---------------------------------------------------------------------------
// The values an argument or an attribute takes
// ---------------------------------------------------------------------------

/**
 * The values an expression takes, read from the code: a string literal; an
 * identifier bound to a destructuring default of a function around it
 * (`variant = "ghost"`, and so a shorthand `{ variant }`); the first operand
 * of `a || b` or `a ?? b` that resolves; both branches of `c ? "x" : "y"`.
 * `undefined` when none applies: the caller fails the run rather than guess.
 */
function valuesOf(expr: ts.Expression): string[] | undefined {
  if (ts.isParenthesizedExpression(expr)) return valuesOf(expr.expression)
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr))
    return [expr.text]
  if (ts.isIdentifier(expr)) return defaultOf(expr)
  if (
    ts.isBinaryExpression(expr) &&
    (expr.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      expr.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
  )
    return valuesOf(expr.left) ?? valuesOf(expr.right)
  if (ts.isConditionalExpression(expr)) {
    const [whenTrue, whenFalse] = [
      valuesOf(expr.whenTrue),
      valuesOf(expr.whenFalse),
    ]
    return whenTrue && whenFalse
      ? [...new Set([...whenTrue, ...whenFalse])]
      : undefined
  }
  return undefined
}

/** The default of the destructured parameter that binds `id`, in the nearest function that binds it. */
function defaultOf(id: ts.Identifier): string[] | undefined {
  for (let n: ts.Node | undefined = id.parent; n; n = n.parent) {
    if (!ts.isFunctionLike(n)) continue
    for (const param of n.parameters) {
      if (!ts.isObjectBindingPattern(param.name)) continue
      const element = param.name.elements.find(
        (el) => ts.isIdentifier(el.name) && el.name.text === id.text
      )
      if (element)
        return element.initializer ? valuesOf(element.initializer) : undefined
    }
  }
  return undefined
}

const sourceOf = (root: string, file: string) =>
  ts.createSourceFile(
    file,
    readFileSync(resolve(root, file), "utf-8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

const lineOf = (node: ts.Node) =>
  node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1

/** The `@/components/ui/*` module of each name a file imports, by local name. */
function componentImports(
  sf: ts.SourceFile
): Map<string, { name: string; file: string }> {
  const imports = new Map<string, { name: string; file: string }>()
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue
    const spec = (stmt.moduleSpecifier as ts.StringLiteral).text
    if (!spec.startsWith("@/components/ui/")) continue
    const bindings = stmt.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    for (const el of bindings.elements)
      imports.set(el.name.text, {
        name: (el.propertyName ?? el.name).text,
        file: `${spec.slice(2)}.tsx`,
      })
  }
  return imports
}

// ---------------------------------------------------------------------------
// `*Variants` calls to another component
// ---------------------------------------------------------------------------

/** A call to another component's `cva` function, and the value of each key it applies. */
interface VariantsCall {
  fn: string
  file: string
  values: Map<string, string[]>
  node: ts.CallExpression
}

/** The `variants` keys and `defaultVariants` of the `cva` config `fn` declares in `file`. */
function cvaConfigOf(
  root: string,
  file: string,
  fn: string
): { keys: string[]; defaults: Map<string, string> } {
  const sf = sourceOf(root, file)
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    const decl = stmt.declarationList.declarations[0]
    if (decl.name.getText() !== fn || !decl.initializer) continue
    const config = ts.isCallExpression(decl.initializer)
      ? decl.initializer.arguments[1]
      : undefined
    const property = (name: string) =>
      config && ts.isObjectLiteralExpression(config)
        ? config.properties.find(
            (p): p is ts.PropertyAssignment =>
              ts.isPropertyAssignment(p) && p.name.getText() === name
          )?.initializer
        : undefined
    if (property("compoundVariants"))
      throw new Error(
        `${file}: ${fn} has compoundVariants, which scripts/lib/spec-classes.ts does not follow`
      )
    const object = (e: ts.Expression | undefined) =>
      e && ts.isObjectLiteralExpression(e)
        ? e.properties.filter(ts.isPropertyAssignment)
        : []
    const keyOf = (p: ts.PropertyAssignment) =>
      ts.isStringLiteral(p.name) ? p.name.text : p.name.getText()
    return {
      keys: object(property("variants")).map(keyOf),
      defaults: new Map(
        object(property("defaultVariants")).flatMap((p) =>
          ts.isStringLiteral(p.initializer)
            ? [[keyOf(p), p.initializer.text] as [string, string]]
            : []
        )
      ),
    }
  }
  throw new Error(`${file}: no cva config named ${fn}`)
}

/**
 * Each call a file makes to a `*Variants` function imported from
 * `@/components/ui/*`, with the values it applies: each key it passes,
 * resolved by `valuesOf`, and the composed config's `defaultVariants` for the
 * keys it leaves out, as cva does. A key that does not resolve fails the run.
 */
function variantsCallsOf(root: string, sf: ts.SourceFile): VariantsCall[] {
  const imported = [...componentImports(sf)].filter(([, { name }]) =>
    name.endsWith("Variants")
  )
  const byLocal = new Map(imported)
  const calls: VariantsCall[] = []
  function fail(node: ts.Node, why: string): never {
    throw new Error(`${sf.fileName}:${lineOf(node)}: ${why}`)
  }
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      byLocal.has(node.expression.text)
    ) {
      const { name: fn, file } = byLocal.get(node.expression.text)!
      const { keys, defaults } = cvaConfigOf(root, file, fn)
      const values = new Map<string, string[]>()
      const [arg, ...rest] = node.arguments
      if (rest.length > 0 || (arg && !ts.isObjectLiteralExpression(arg)))
        fail(node, `${fn}() takes one object literal to be followed`)
      for (const p of arg && ts.isObjectLiteralExpression(arg)
        ? arg.properties
        : []) {
        const [key, expr] = ts.isPropertyAssignment(p)
          ? [p.name.getText(), p.initializer]
          : ts.isShorthandPropertyAssignment(p)
            ? [p.name.text, p.name]
            : fail(
                p,
                `${fn}(): \`${p.getText()}\` is not a key the generators follow`
              )
        if (key === "className" || key === "class") continue
        const resolved =
          valuesOf(expr) ??
          fail(
            p,
            `${fn}(): cannot resolve \`${key}\` — pass a literal, a destructuring default, or \`a || b\` with one of them`
          )
        values.set(key, resolved)
      }
      for (const key of keys)
        if (!values.has(key) && defaults.has(key))
          values.set(key, [defaults.get(key)!])
      calls.push({ fn, file, values, node })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return calls
}

/**
 * The `*Variants` functions a file calls from another component, each with
 * every value it applies per key, for the footers: `buttonVariants` →
 * `variant` → `ghost`.
 */
export function variantsAppliedBy(
  root: string,
  file: string
): Map<string, Map<string, string[]>> {
  const applied = new Map<string, Map<string, string[]>>()
  for (const { fn, values } of variantsCallsOf(root, sourceOf(root, file))) {
    const byKey = applied.get(fn) ?? new Map<string, string[]>()
    for (const [key, vs] of values)
      byKey.set(key, [...new Set([...(byKey.get(key) ?? []), ...vs])])
    applied.set(fn, byKey)
  }
  return applied
}

/** "the `buttonVariants` classes it applies (`variant` `ghost`, `size` `default`)", for the footers. */
export function appliedText(
  applied: Map<string, Map<string, string[]>>
): string {
  return [...applied]
    .map(
      ([fn, byKey]) =>
        `the ${code(fn)} classes it applies (${[...byKey]
          .map(([key, vs]) => `${code(key)} ${vs.map(code).join(" or ")}`)
          .join(", ")})`
    )
    .join(" and ")
}

// ---------------------------------------------------------------------------
// Strings of a component file, with where each one sits
// ---------------------------------------------------------------------------

/** A string of a component file, with where it sits, already written as code spans. */
export interface ClassString {
  text: string
  where: string
  /** The `*Variants` function of another component the string comes through. */
  via?: string
}

/**
 * Every string of a component file, the value of each `@/lib/*` constant it
 * reads, and the strings of each `*Variants` function it calls from another
 * component, one level deep — the base classes and those of the values the
 * call applies (`variantsCallsOf`), where = `Calendar.button_previous` via
 * `buttonVariants.variant.ghost`. They are listed as written: the composer's
 * own classes are not merged over them.
 */
export async function stringsOf(
  root: string,
  file: string
): Promise<ClassString[]> {
  const sf = sourceOf(root, file)
  const found: ClassString[] = (await ownStringsOf(root, sf)).map(
    ({ text, where }) => ({
      text,
      where,
    })
  )
  for (const call of variantsCallsOf(root, sf)) {
    for (const s of await ownStringsOf(root, sourceOf(root, call.file))) {
      const [name, key, value, ...deeper] = s.place
      if (name !== call.fn) continue
      if (
        key !== undefined &&
        (deeper.length > 0 || !call.values.get(key)?.includes(value))
      )
        continue
      found.push({
        text: s.text,
        where: `${code(whereOf(call.node))} via ${s.where}`,
        via: call.fn,
      })
    }
  }
  return found
}

async function ownStringsOf(
  root: string,
  sf: ts.SourceFile
): Promise<{ text: string; where: string; place: string[] }[]> {
  // Constants imported from @/lib/*, by local name → their runtime value.
  const libValues = new Map<string, { value: string; libFile: string }>()
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue
    const spec = (stmt.moduleSpecifier as ts.StringLiteral).text
    if (!spec.startsWith("@/lib/") || spec === "@/lib/utils") continue
    const bindings = stmt.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    const libFile = `${spec.slice(2)}.ts`
    const exports = (await import(resolve(root, libFile))) as Record<
      string,
      unknown
    >
    for (const el of bindings.elements) {
      const value = exports[(el.propertyName ?? el.name).text]
      if (typeof value === "string")
        libValues.set(el.name.text, { value, libFile })
    }
  }

  const found: { text: string; where: string; place: string[] }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) return
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    )
      found.push({
        text: node.text,
        where: code(whereOf(node)),
        place: placeOf(node),
      })
    else if (ts.isIdentifier(node) && libValues.has(node.text)) {
      const { value, libFile } = libValues.get(node.text)!
      found.push({
        text: value,
        where: `${code(whereOf(node))} via ${code(node.text)} (${code(libFile)})`,
        place: placeOf(node),
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}

// ---------------------------------------------------------------------------
// States a composed call never enters, as the spec declares them
// ---------------------------------------------------------------------------

/**
 * A line of a spec's States section, written by hand and kept by
 * build-spec-states.ts: the states a component never enters through a
 * `*Variants` function it applies, and why, from its dependency's source —
 * "Not entered through `buttonVariants`: `disabled`, `error` — react-day-picker
 * sets `aria-disabled`, never `disabled`." The classes of those states that
 * come through the function are left out of States and Tokens.
 */
const NOT_ENTERED = /^Not entered through `(\w+)`: (.+?) — (.+)$/

export interface NotEntered {
  line: string
  fn: string
  states: string[]
}

/** The "Not entered through" declarations of a spec, or of its States section. */
export function notEnteredOf(markdown: string): NotEntered[] {
  return markdown.split("\n").flatMap((line) => {
    const m = NOT_ENTERED.exec(line.trim())
    if (!m) return []
    const states = [...m[2].matchAll(/`([\w-]+)`/g)].map(([, s]) => s)
    return [{ line: line.trim(), fn: m[1], states }]
  })
}

/** Whether a class, applied through `via`, waits for a state the spec declares the component never enters through it. */
export function neverEntered(
  candidate: string,
  via: string | undefined,
  notEntered: NotEntered[],
  file: string
): boolean {
  const states = new Set(
    notEntered.filter((d) => d.fn === via).flatMap((d) => d.states)
  )
  return (
    states.size > 0 &&
    variantsOf(candidate).some((v) =>
      statesOf(v, file).some((s) => states.has(s))
    )
  )
}

// ---------------------------------------------------------------------------
// Specs and their code
// ---------------------------------------------------------------------------

/** Each spec file of `specsDir` → the `code_path` of its Metadata. */
export function codePathsOf(specsDir: string): Map<string, string> {
  return new Map(
    readdirSync(specsDir)
      .filter((f) => f.endsWith(".md"))
      .map((file) => {
        const md = readFileSync(resolve(specsDir, file), "utf-8")
        const codePath = md.match(/^\| code_path\s*\|\s*(\S+)/m)?.[1]
        if (!codePath) throw new Error(`${file}: no code_path in Metadata`)
        return [file, codePath]
      })
  )
}

/**
 * The specs of the design-system components a file imports (`Button`), and
 * each place it renders one of them with a `variant` or a `size`, resolved by
 * `valuesOf` (a conditional shows both branches): "Button in DialogFooter:
 * variant outline". An attribute that does not resolve fails the run.
 */
export function composedOf(
  root: string,
  file: string,
  specOf: Map<string, string>
): { specs: string[]; sites: string[] } {
  const sf = sourceOf(root, file)
  const imports = componentImports(sf)
  const specs = [
    ...new Set(
      [...imports.values()]
        .map(({ file }) => specOf.get(file))
        .filter((spec): spec is string => spec !== undefined)
    ),
  ].sort()
  const sites: string[] = []
  const visit = (node: ts.Node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      specOf.has(imports.get(node.tagName.text)?.file ?? "")
    ) {
      const attribute = (name: string) => {
        const a = node.attributes.properties.find(
          (p): p is ts.JsxAttribute =>
            ts.isJsxAttribute(p) && p.name.getText() === name
        )
        if (!a) return undefined
        const init = a.initializer
        const values = !init
          ? undefined
          : ts.isStringLiteral(init)
            ? [init.text]
            : ts.isJsxExpression(init) && init.expression
              ? valuesOf(init.expression)
              : undefined
        if (!values)
          throw new Error(
            `${file}:${lineOf(a)}: cannot resolve \`${a.getText()}\` — pass a literal, a destructuring default, or \`a || b\` with one of them`
          )
        return values.join(" or ")
      }
      const values = ["variant", "size"].flatMap((key) => {
        const value = attribute(key)
        return value ? [`${key} ${value}`] : []
      })
      if (values.length > 0) {
        const site = `${node.tagName.text} in ${placeOf(node)[0]}: ${values.join(", ")}`
        if (!sites.includes(site)) sites.push(site)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return { specs, sites }
}

/**
 * The "Composes" line of the States and Tokens sections. The MCP server reads
 * every code span before " — " as a composed spec (`tokens_from`), so the
 * sites go after it.
 */
export function composesLine(
  { specs, sites }: { specs: string[]; sites: string[] },
  what: "states" | "tokens"
): string | undefined {
  if (specs.length === 0) return undefined
  const pointer =
    specs.length > 1
      ? `their ${what} are listed in their own specs`
      : `its ${what} are listed in its own spec`
  return `Composes ${specs.map(code).join(", ")} — ${[...sites, pointer].join("; ")}.`
}
