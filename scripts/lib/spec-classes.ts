/**
 * The classes a component draws with, as the spec generators read them:
 * every string of its file, plus the value of each constant it imports from
 * `@/lib/*`, each with where it sits (`buttonVariants.variant.default`, the
 * sub-component, the constant), and Tailwind to tell a class from any other
 * string. build-spec-tokens.ts follows each class to its semantic token,
 * build-spec-states.ts groups the classes by the state their variants name.
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
function whereOf(node: ts.Node): string {
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
  return [name, ...keys].join(".")
}

function isCnArgument(assignment: ts.PropertyAssignment): boolean {
  const call = assignment.parent.parent
  return (
    ts.isCallExpression(call) &&
    ts.isIdentifier(call.expression) &&
    call.expression.text === "cn"
  )
}

/**
 * Every string of a component file, and the value of each `@/lib/*` constant
 * it reads, with where it sits — already written as code spans.
 */
export async function stringsOf(
  root: string,
  file: string
): Promise<{ text: string; where: string }[]> {
  const source = readFileSync(resolve(root, file), "utf-8")
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

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

  const found: { text: string; where: string }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) return
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    )
      found.push({ text: node.text, where: code(whereOf(node)) })
    else if (ts.isIdentifier(node) && libValues.has(node.text)) {
      const { value, libFile } = libValues.get(node.text)!
      found.push({
        text: value,
        where: `${code(whereOf(node))} via ${code(node.text)} (${code(libFile)})`,
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
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

/** Specs of the design-system components a file imports, e.g. `Button`. */
export function composedOf(
  root: string,
  file: string,
  specOf: Map<string, string>
): string[] {
  const source = readFileSync(resolve(root, file), "utf-8")
  return [...source.matchAll(/from "@\/components\/ui\/([\w-]+)"/g)]
    .map(([, file]) => specOf.get(`components/ui/${file}.tsx`))
    .filter((spec): spec is string => spec !== undefined)
    .sort()
}
